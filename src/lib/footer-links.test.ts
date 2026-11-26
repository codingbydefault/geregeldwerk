import { describe, expect, it } from "vitest";
import { footerGroups } from "./footer-links";

describe("public footer links", () => {
  it("links to the supported Ollama technology and Peppol standard", () => {
    const technology = footerGroups.find((group) => group.title === "Technologie en standaarden");

    expect(technology?.links).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Ollama", href: "https://ollama.com/", icon: "/ollama.png" }),
      expect.objectContaining({ label: "Peppol", href: "https://peppol.org/" }),
    ]));
  });

  it("only exposes routes that exist on the public site", () => {
    const internal = footerGroups.flatMap((group) => group.links).filter((link) => link.href.startsWith("/"));
    expect(internal.map((link) => link.href)).toEqual(expect.arrayContaining(["/", "/app", "/privacy", "/algemene-voorwaarden"]));
  });
});
