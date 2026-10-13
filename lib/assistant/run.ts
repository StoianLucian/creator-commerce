// lib/assistant/run.ts
//
// Drives one assistant reply: the tool-calling loop that lets the model fetch
// the creator's sales and catalog before answering, streaming the final prose
// back a token at a time.
//
// Server-only — it wires the Ollama client to the data-backed tools.

import "server-only";

import {
    streamChat,
    type OllamaMessage,
    type OllamaToolCall,
} from "@/lib/ollama";
import { ASSISTANT_TOOLS, SYSTEM_PROMPT, runTool } from "./tools";
import type { ProductCard } from "./types";

/**
 * Safety valve on the tool loop. A couple of rounds is plenty for "look at my
 * sales and catalog, then answer"; the cap stops a confused model from
 * calling tools forever. On the final round tools are withheld, forcing a
 * prose answer.
 */
const MAX_TOOL_ROUNDS = 4;

/**
 * What a run emits: a `step` whenever the model reaches for a tool (so the UI
 * can show what it's doing), then the answer as `delta`s.
 */
export type AssistantEvent =
    | { type: "step"; tool: string }
    | { type: "step-done"; ms: number }
    | { type: "products"; products: ProductCard[] }
    | { type: "delta"; text: string };

/**
 * Stream the assistant's answer to a conversation.
 *
 * `history` is the running chat (user/assistant turns only — the system prompt
 * is prepended here). Yields a `step` event for each tool call the model makes
 * and `delta` events for the user-facing answer; tool *results* are handled
 * internally and never surface.
 */
export async function* runAssistant(
    history: OllamaMessage[],
    ownerId: string,
    { signal, model }: { signal?: AbortSignal; model?: string } = {}
): AsyncGenerator<AssistantEvent> {
    const messages: OllamaMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
    ];

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        // Last round: withhold tools so the model has to answer in words.
        const tools = round < MAX_TOOL_ROUNDS ? ASSISTANT_TOOLS : undefined;

        let assistantContent = "";
        let toolCalls: OllamaToolCall[] = [];

        for await (const event of streamChat(messages, { tools, signal, model })) {
            if (event.type === "content") {
                assistantContent += event.delta;
                yield { type: "delta", text: event.delta };
            } else {
                toolCalls = event.toolCalls;
            }
        }

        // No tool calls means the model answered — the deltas above were it.
        if (toolCalls.length === 0) return;

        // Otherwise record the tool-call turn, run each tool scoped to this
        // creator (announcing it as a step), feed the results back, and let
        // the model continue.
        messages.push({
            role: "assistant",
            content: assistantContent,
            tool_calls: toolCalls,
        });

        for (const call of toolCalls) {
            yield { type: "step", tool: call.function.name };
            const startedAt = Date.now();
            const result = await runTool(call.function.name, ownerId);
            yield { type: "step-done", ms: Date.now() - startedAt };

            // Surface any product cards the tool produced so the UI can render
            // them — separate from the text the model gets back.
            if (result.products?.length) {
                yield { type: "products", products: result.products };
            }

            messages.push({
                role: "tool",
                content: result.content,
                tool_name: call.function.name,
            });
        }
    }
}
