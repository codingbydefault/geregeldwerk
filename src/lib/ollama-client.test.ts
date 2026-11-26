import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { requestLocalDraft } from "./ollama-client";

const servers: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

async function endpoint(status: number, body: unknown) {
  const server = createServer((_request, response) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Testserver heeft geen poort");
  return `http://127.0.0.1:${address.port}`;
}

describe("Ollama browser client", () => {
  it("returns the generated draft text", async () => {
    const url = await endpoint(200, { text: "Conceptofferte", model: "qwen3:0.6b" });
    await expect(requestLocalDraft({ customer: "Jansen", service: "Ramen wassen" }, url))
      .resolves.toEqual({ text: "Conceptofferte", model: "qwen3:0.6b" });
  });

  it("marks a deterministic template fallback", async () => {
    const url = await endpoint(200, { text: "Veilig concept", model: "template-v1", fallback: true });
    await expect(requestLocalDraft({ customer: "Jansen", service: "Ramen wassen" }, url))
      .resolves.toEqual({ text: "Veilig concept", model: "template-v1", fallback: true });
  });

  it("surfaces the API error message", async () => {
    const url = await endpoint(503, { error: "De lokale AI is niet bereikbaar." });
    await expect(requestLocalDraft({ customer: "Jansen", service: "Ramen wassen" }, url))
      .rejects.toThrow("De lokale AI is niet bereikbaar.");
  });
});
