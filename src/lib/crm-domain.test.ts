import { describe, expect, it } from "vitest";
import { quoteTotals, updateRequestStatus, searchRecords } from "./crm-domain.mjs";

describe("CRM domain helpers", () => {
  it("calculates discount before VAT for mixed VAT rates", () => {
    const totals = quoteTotals([
      { quantity: 2, unitPrice: 100, vatRate: 21 },
      { quantity: 1, unitPrice: 50, vatRate: 9 },
    ], 10);

    expect(totals).toEqual({ subtotal: 250, discount: 25, vat: 41.85, total: 266.85 });
  });

  it("changes a request status without mutating the original", () => {
    const request = { id: "req-1", status: "Nieuw", customer: "Noord Klimaat" };

    expect(updateRequestStatus(request, "In behandeling")).toEqual({ ...request, status: "In behandeling" });
    expect(request.status).toBe("Nieuw");
  });

  it("rejects unknown request statuses", () => {
    expect(() => updateRequestStatus({ id: "req-1", status: "Nieuw" }, "Gek")).toThrow(/Ongeldige status/);
  });

  it("searches records case-insensitively and returns all records for an empty query", () => {
    const rows = [
      { name: "Noord Klimaat", email: "info@noord.nl" },
      { name: "Van Dijk Elektra", email: "jan@vandijk.nl" },
    ];

    expect(searchRecords(rows, "NOORD")).toEqual([rows[0]]);
    expect(searchRecords(rows, "")).toEqual(rows);
  });
});
