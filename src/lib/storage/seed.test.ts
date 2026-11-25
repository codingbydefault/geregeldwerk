import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/storage/seed";

describe("CRM seed data", () => {
  it("attaches customer and payment fields to the sample invoice, not an expense", () => {
    const data = createSeedData();

    expect(data.invoices[0]).toMatchObject({
      status: "open",
      customerId: "customer-voorbeeld-vermeer",
      customerEmail: "vermeer@example.test",
      customerAddress: "Voorbeeldstraat 8, 4331 AA Middelburg",
      invoiceDate: "2026-03-05",
      dueDate: "2026-03-19",
      lines: [
        { id: "invoice-line-voorbeeld-1", description: "Radiator vervangen", quantity: 2, unit: "stuk", unitPriceCents: 18000, vatRate: 0.21 },
        { id: "invoice-line-voorbeeld-2", description: "Oude radiator afvoeren", quantity: 2, unit: "stuk", unitPriceCents: 3500, vatRate: 0.21 },
      ],
    });
    expect(data.expenses[0]).not.toHaveProperty("customerId");
    expect(data.expenses[0]).not.toHaveProperty("lines");
  });
});
