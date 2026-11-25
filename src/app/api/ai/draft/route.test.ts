import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalBaseUrl = process.env.OLLAMA_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.OLLAMA_BASE_URL;
  else process.env.OLLAMA_BASE_URL = originalBaseUrl;
});

describe("POST /api/ai/draft", () => {
  it("returns 400 for a request without work details", async () => {
    const request = new Request("http://localhost/api/ai/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customer: "Familie Jansen", service: "" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/werkzaamheden/i) });
  });

  it("returns 503 when the configured local Ollama service is unavailable", async () => {
    process.env.OLLAMA_BASE_URL = "http://127.0.0.1:1";
    const request = new Request("http://localhost/api/ai/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customer: "Familie Jansen", service: "Vier ramen wassen" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/lokale AI/i) });
  });
});
