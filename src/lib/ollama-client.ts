import type { DraftInput } from "./ollama";

export async function requestLocalDraft(input: DraftInput, endpoint = "/api/ai/draft") {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json() as { text?: string; model?: string; error?: string };
  if (!response.ok || !data.text) throw new Error(data.error || "Het AI-concept kon niet worden gemaakt.");
  return { text: data.text, model: data.model || "lokaal model" };
}
