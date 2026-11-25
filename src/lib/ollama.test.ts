import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { buildOllamaPrompt, generateLocalDraft, validateDraftInput } from "./ollama";

const servers: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe("local Ollama drafts", () => {
  it("rejects a draft request without useful work details", () => {
    expect(() => validateDraftInput({ customer: "Familie Jansen", service: "", location: "Utrecht" }))
      .toThrow(/werkzaamheden/i);
  });

  it("builds a Dutch prompt that forbids invented prices", () => {
    const prompt = buildOllamaPrompt({
      customer: "Familie Jansen",
      service: "Vier ramen wassen",
      location: "Utrecht",
    });

    expect(prompt).toContain("Familie Jansen");
    expect(prompt).toContain("Vier ramen wassen");
    expect(prompt).toContain("Utrecht");
    expect(prompt).toMatch(/geen bedragen|bedragen niet/i);
    expect(prompt).toMatch(/Nederlands/i);
  });

  it("returns the generated text from an Ollama-compatible local server", async () => {
    let receivedBody = "";
    const server = createServer((request, response) => {
      request.setEncoding("utf8");
      request.on("data", (chunk) => { receivedBody += chunk; });
      request.on("end", () => {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ message: { role: "assistant", content: "Conceptofferte zonder bedrag." }, done: true }));
      });
    });
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Testserver heeft geen poort");

    const result = await generateLocalDraft(
      { customer: "Familie Jansen", service: "Vier ramen wassen", location: "Utrecht" },
      { baseUrl: `http://127.0.0.1:${address.port}`, model: "qwen3:0.6b", timeoutMs: 2_000 },
    );

    expect(result).toEqual({ text: "Conceptofferte zonder bedrag.", model: "qwen3:0.6b" });
    expect(JSON.parse(receivedBody)).toMatchObject({ model: "qwen3:0.6b", stream: false, think: false });
  });
});
