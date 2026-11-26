export interface DraftInput {
  customer: string;
  service: string;
  location?: string;
  sourceMessage?: string;
}

export interface OllamaOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

const MAX_FIELD_LENGTH = 2_000;

export function validateDraftInput(input: DraftInput): DraftInput {
  const normalized = {
    customer: String(input.customer || "").trim(),
    service: String(input.service || "").trim(),
    location: String(input.location || "").trim(),
    sourceMessage: String(input.sourceMessage || "").trim(),
  };

  if (!normalized.service) throw new Error("Vul de werkzaamheden in.");
  if (Object.values(normalized).some((value) => value.length > MAX_FIELD_LENGTH)) {
    throw new Error("De ingevoerde tekst is te lang.");
  }
  return normalized;
}

export function buildOllamaPrompt(input: DraftInput): string {
  const value = validateDraftInput(input);
  return [
    "Schrijf in correct, natuurlijk en zakelijk Nederlands een korte conceptofferte aan de klant.",
    "Gebruik uitsluitend de gegeven feiten. Verzin geen bedragen, materialen, planning, resultaten of garanties.",
    "Gebruik deze opbouw: korte aanhef, één alinea over de werkzaamheden, prijsregel met [bedrag invullen], vriendelijke afsluiting.",
    "Noem ontbrekende informatie niet als feit en schrijf geen uitleg over wat ontbreekt.",
    `Klant: ${value.customer || "Onbekend"}`,
    `Werkzaamheden: ${value.service}`,
    `Locatie: ${value.location || "Niet opgegeven"}`,
    value.sourceMessage ? `Oorspronkelijk bericht: ${value.sourceMessage}` : "",
    "Geef alleen de concepttekst, zonder toelichting over je werkwijze.",
  ].filter(Boolean).join("\n");
}

export function generateFallbackDraft(input: DraftInput) {
  const value = validateDraftInput(input);
  const salutation = value.customer ? `Beste ${value.customer},` : "Beste klant,";
  const location = value.location ? ` in ${value.location}` : "";
  return {
    text: [
      salutation,
      "",
      `Graag bieden wij je een conceptofferte aan voor de volgende werkzaamheden: ${value.service}${location}.`,
      "",
      "Prijs: [bedrag invullen]",
      "",
      "Met vriendelijke groet,",
    ].join("\n"),
    model: "template-v1",
    fallback: true,
  };
}

export async function generateLocalDraft(input: DraftInput, options: OllamaOptions = {}) {
  const model = options.model || process.env.OLLAMA_MODEL || "qwen3:0.6b";
  const baseUrl = (options.baseUrl || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        think: false,
        messages: [
          { role: "system", content: "Je bent de lokale offerte-assistent van GeregeldWerk. Schrijf verzorgd Nederlands, bescherm klantgegevens en wees feitelijk." },
          { role: "user", content: buildOllamaPrompt(input) },
        ],
        options: { temperature: 0.1, num_predict: 250 },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Ollama antwoordde met status ${response.status}.`);
    const data = await response.json() as { message?: { content?: string } };
    const text = data.message?.content?.trim();
    if (!text) throw new Error("Ollama gaf geen concepttekst terug.");
    return { text, model };
  } finally {
    clearTimeout(timeout);
  }
}
