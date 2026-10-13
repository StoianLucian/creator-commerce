// app/api/assistant/models/route.ts
//
// Lists the models pulled into the local Ollama, for the assistant's model
// picker. Auth-gated to match the chat endpoint.

import { getSession } from "@/lib/session";
import { listModels, OLLAMA_MODEL, OllamaError } from "@/lib/ollama";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const models = await listModels();
        return Response.json({ models, default: OLLAMA_MODEL });
    } catch (error) {
        const message =
            error instanceof OllamaError ? error.message : "Could not list models.";
        return Response.json({ error: message }, { status: 503 });
    }
}
