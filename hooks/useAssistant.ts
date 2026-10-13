"use client";

import { useCallback, useRef, useState } from "react";

export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    /** Tool steps the model took on this turn, in order (assistant turns only). */
    steps?: string[];
};

type WireEvent =
    | { type: "step"; tool: string }
    | { type: "delta"; text: string }
    | { type: "error"; message: string };

/**
 * Drives a conversation with the sales assistant: holds the message list,
 * POSTs to `/api/assistant`, and consumes the newline-delimited event stream —
 * `step` events (what the model is doing) and `delta` events (its answer).
 */
export function useAssistant() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const send = useCallback(
        async (text: string, current: ChatMessage[], model?: string) => {
            const content = text.trim();
            if (!content || isStreaming) return;

            setError(null);
            setIsStreaming(true);

            const history: ChatMessage[] = [...current, { role: "user", content }];
            setMessages([...history, { role: "assistant", content: "", steps: [] }]);

            const controller = new AbortController();
            abortRef.current = controller;

            // Live state for the in-flight assistant turn.
            let reply = "";
            const steps: string[] = [];
            const paint = () =>
                setMessages([
                    ...history,
                    { role: "assistant", content: reply, steps: [...steps] },
                ]);

            try {
                const res = await fetch("/api/assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: history.map((m) => ({ role: m.role, content: m.content })),
                        model,
                    }),
                    signal: controller.signal,
                });

                if (!res.ok || !res.body) {
                    const detail = await res
                        .json()
                        .then((d) => d?.error as string | undefined)
                        .catch(() => undefined);
                    throw new Error(detail ?? `Request failed (${res.status}).`);
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                const handle = (event: WireEvent) => {
                    if (event.type === "delta") reply += event.text;
                    else if (event.type === "step") steps.push(event.tool);
                    else if (event.type === "error") setError(event.message);
                };

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    let newline: number;
                    while ((newline = buffer.indexOf("\n")) !== -1) {
                        const raw = buffer.slice(0, newline).trim();
                        buffer = buffer.slice(newline + 1);
                        if (!raw) continue;
                        try {
                            handle(JSON.parse(raw) as WireEvent);
                        } catch {
                            // Ignore a line that isn't valid JSON yet.
                        }
                    }
                    paint();
                }
                paint();
            } catch (err) {
                if (!(err instanceof DOMException && err.name === "AbortError")) {
                    setError(
                        err instanceof Error ? err.message : "The assistant is unavailable."
                    );
                    setMessages(history);
                }
            } finally {
                setIsStreaming(false);
                abortRef.current = null;
            }
        },
        [isStreaming]
    );

    const stop = useCallback(() => abortRef.current?.abort(), []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        setMessages([]);
        setError(null);
    }, []);

    return { messages, isStreaming, error, send, stop, reset };
}
