// lib/ollama.ts
//
// Thin client for a locally running Ollama instance (https://ollama.com).
// Server-only: it talks to Ollama's HTTP API over the loopback interface and
// must never be bundled for the browser.
//
// Only the streaming chat endpoint is wrapped here — that's all the assistant
// needs. It supports tool calling, so the model can pull the creator's data
// itself instead of us stuffing everything into the prompt. See
// `lib/assistant` for the tools and the loop that drives them.

import "server-only";

/** The host where `ollama serve` is listening. Override via env for a remote box. */
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

/**
 * Which pulled model to chat with. Any installed model that advertises the
 * `tools` capability works (`ollama show <model>`); the default is small
 * enough to answer quickly on a laptop. Override via env.
 */
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3.5:4b";

export type OllamaRole = "system" | "user" | "assistant" | "tool";

/** A tool the model is offered, in Ollama's OpenAI-compatible shape. */
export type OllamaTool = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, unknown>;
            required?: string[];
        };
    };
};

/** A tool invocation the model asks us to run. Ollama pre-parses the args. */
export type OllamaToolCall = {
    function: {
        name: string;
        arguments: Record<string, unknown>;
    };
};

export type OllamaMessage = {
    role: OllamaRole;
    content: string;
    /** Set on an assistant turn that asked to call tools. */
    tool_calls?: OllamaToolCall[];
    /** Set on a `role: "tool"` turn, naming the tool whose result this is. */
    tool_name?: string;
};

/**
 * What a streamed turn produces: content arrives delta by delta, then a single
 * terminal event carries any tool calls the model decided to make.
 */
export type OllamaChatEvent =
    | { type: "content"; delta: string }
    | { type: "done"; toolCalls: OllamaToolCall[] };

/** Raised for anything the caller should surface as "the model is unavailable". */
export class OllamaError extends Error {
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "OllamaError";
    }
}

/**
 * The models pulled into the local Ollama (`ollama list`), for the picker.
 * The default model is listed first (if present) so the UI can pre-select it.
 */
export async function listModels(): Promise<string[]> {
    let res: Response;
    try {
        res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    } catch (cause) {
        throw new OllamaError(
            `Could not reach Ollama at ${OLLAMA_BASE_URL}. Is it running? Start it with \`ollama serve\`.`,
            { cause }
        );
    }

    if (!res.ok) {
        throw new OllamaError(`Ollama responded with ${res.status} listing models.`);
    }

    const data = (await res.json()) as { models?: { name?: string }[] };
    const names = (data.models ?? [])
        .map((m) => m.name)
        .filter((name): name is string => typeof name === "string")
        // Drop embedding/reranker models — they can't hold a chat, so offering
        // them in the picker would only produce confusing errors. (/api/tags
        // doesn't report capabilities, so this is a name heuristic.)
        .filter((name) => !/embed|rerank/i.test(name));

    return names.sort((a, b) =>
        a === OLLAMA_MODEL ? -1 : b === OLLAMA_MODEL ? 1 : a.localeCompare(b)
    );
}

/**
 * Stream one chat turn from Ollama.
 *
 * Ollama's `/api/chat` streams newline-delimited JSON — one object per line,
 * each carrying a slice of `message.content` and/or `message.tool_calls`, with
 * a final `done: true` line. This buffers partial lines across network chunks,
 * forwards content as `content` events, and accumulates tool calls to hand
 * back in the terminal `done` event.
 *
 * Thinking is left off (the default), so `message.content` is the user-facing
 * answer with no reasoning trace to strip.
 */
export async function* streamChat(
    messages: OllamaMessage[],
    {
        tools,
        signal,
        model = OLLAMA_MODEL,
    }: { tools?: OllamaTool[]; signal?: AbortSignal; model?: string } = {}
): AsyncGenerator<OllamaChatEvent> {
    let res: Response;

    try {
        res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages,
                ...(tools?.length ? { tools } : {}),
                stream: true,
                // Off for speed and clean output. The default model (qwen3.5)
                // is a thinking model; without this it streams a reasoning
                // trace before every answer. Drop this line if you point
                // OLLAMA_MODEL at a model that doesn't support thinking.
                think: false,
                // Low temperature: this is a data-grounded assistant, not a
                // creative one — we want it to stick to the numbers it's given.
                options: { temperature: 0.2 },
            }),
            signal,
        });
    } catch (cause) {
        // A connection refused here almost always means Ollama isn't running.
        throw new OllamaError(
            `Could not reach Ollama at ${OLLAMA_BASE_URL}. Is it running? Start it with \`ollama serve\`.`,
            { cause }
        );
    }

    if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new OllamaError(
            `Ollama responded with ${res.status}${detail ? `: ${detail}` : ""}. ` +
                `Is the model "${model}" pulled? Run \`ollama pull ${model}\`.`
        );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const toolCalls: OllamaToolCall[] = [];
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let newline: number;
            while ((newline = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!line) continue;

                let parsed: {
                    message?: { content?: string; tool_calls?: OllamaToolCall[] };
                    error?: string;
                    done?: boolean;
                };
                try {
                    parsed = JSON.parse(line);
                } catch {
                    // A line that doesn't parse yet is a protocol hiccup, not a
                    // partial line (those never reach here) — skip it.
                    continue;
                }

                if (parsed.error) throw new OllamaError(parsed.error);

                if (parsed.message?.tool_calls?.length) {
                    toolCalls.push(...parsed.message.tool_calls);
                }

                const chunk = parsed.message?.content;
                if (chunk) yield { type: "content", delta: chunk };

                if (parsed.done) {
                    yield { type: "done", toolCalls };
                    return;
                }
            }
        }

        // Stream ended without an explicit `done` line — still report cleanly.
        yield { type: "done", toolCalls };
    } finally {
        // Make sure an early return (client went away) doesn't leak the socket.
        await reader.cancel().catch(() => {});
    }
}
