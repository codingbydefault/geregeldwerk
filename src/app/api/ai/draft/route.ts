import { NextResponse } from "next/server";
import { generateFallbackDraft, generateLocalDraft, validateDraftInput, type DraftInput } from "@/lib/ollama";

export async function POST(request: Request) {
  let input: DraftInput;
  try {
    input = validateDraftInput(await request.json() as DraftInput);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ongeldige aanvraag." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await generateLocalDraft(input));
  } catch {
    return NextResponse.json(generateFallbackDraft(input));
  }
}
