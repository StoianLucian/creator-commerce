// app/api/assistant/route.ts
//
// The creator's sales assistant. A Route Handler (not a Server Action) because
// it streams the model's reply back as it's generated — Server Actions return
// a single value, Route Handlers can return a `ReadableStream`.
//
// Auth lives here: the tools the model calls are scoped to `session.user.id`,
// so a signed-out request never reaches any data.

import { getSession } from "@/lib/session";
import { runAssistant, type AssistantEvent } from "@/lib/assistant/run";
import { OllamaError, type OllamaMessage } from "@/lib/ollama";

/** How many prior turns to keep. Enough for context, bounded for small models. */
const MAX_HISTORY = 20;

/** The stream is newline-delimited JSON — one of these objects per line. */
type WireEvent = AssistantEvent | { type: "error"; message: string };

const line = (event: WireEvent) => JSON.stringify(event) + "\n";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const incoming = (body as { messages?: unknown })?.messages;
    if (!Array.isArray(incoming)) {
        return Response.json(
            { error: "Expected a { messages: [...] } body." },
            { status: 400 }
        );
    }

    // Trust only role + string content from the client, keep user/assistant
    // turns, and cap the history so a long chat can't blow past the context.
    const history: OllamaMessage[] = incoming
        .filter(
            (m): m is { role: "user" | "assistant"; content: string } =>
                !!m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string" &&
                m.content.trim().length > 0
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

    if (history.length === 0 || history[history.length - 1].role !== "user") {
        return Response.json(
            { error: "The last message must come from the user." },
            { status: 400 }
        );
    }

    // Optional model override from the model picker; falls back to the env default.
    const requested = (body as { model?: unknown })?.model;
    const model = typeof requested === "string" && requested ? requested : undefined;

    const iterator = runAssistant(history, session.user.id, {
        signal: req.signal,
        model,
    })[Symbol.asyncIterator]();

    // Pull the first event eagerly so a dead Ollama (or a missing model) comes
    // back as a real error status, before we commit to a 200 streaming body.
    let first: IteratorResult<AssistantEvent>;
    try {
        first = await iterator.next();
    } catch (error) {
        const message =
            error instanceof OllamaError
                ? error.message
                : "The assistant failed to respond.";
        return Response.json({ error: message }, { status: 503 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                if (!first.done) controller.enqueue(encoder.encode(line(first.value)));

                while (true) {
                    const { done, value } = await iterator.next();
                    if (done) break;
                    controller.enqueue(encoder.encode(line(value)));
                }
            } catch (error) {
                // Headers are already sent, so the status can't change — send
                // the failure as a final event for the client to surface.
                const message =
                    error instanceof OllamaError
                        ? error.message
                        : "The assistant stopped unexpectedly.";
                controller.enqueue(encoder.encode(line({ type: "error", message })));
            } finally {
                controller.close();
            }
        },
        cancel() {
            // Client went away — unwind the generator (and its Ollama fetch).
            iterator.return?.(undefined);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            // Defeat proxy buffering so chunks actually arrive progressively.
            "X-Accel-Buffering": "no",
        },
    });
}
