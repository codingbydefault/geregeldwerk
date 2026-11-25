export const REQUEST_STATUSES = [
  "Nieuw",
  "In behandeling",
  "Informatie nodig",
  "Offerte in voorbereiding",
  "Offerte verzonden",
  "Gewonnen",
  "Verloren",
  "Gesloten",
];

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function quoteTotals(lines, discountPercent = 0) {
  const subtotal = roundMoney(lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0),
    0,
  ));
  const discount = roundMoney(subtotal * Math.min(100, Math.max(0, Number(discountPercent) || 0)) / 100);
  const ratio = subtotal ? (subtotal - discount) / subtotal : 0;
  const vat = roundMoney(lines.reduce((sum, line) => {
    const amount = Number(line.quantity || 0) * Number(line.unitPrice || 0) * ratio;
    return sum + amount * (Number(line.vatRate || 0) / 100);
  }, 0));
  return { subtotal, discount, vat, total: roundMoney(subtotal - discount + vat) };
}

export function updateRequestStatus(request, status) {
  if (!REQUEST_STATUSES.includes(status)) throw new Error(`Ongeldige status: ${status}`);
  return { ...request, status };
}

export function searchRecords(records, query) {
  const needle = String(query || "").trim().toLocaleLowerCase("nl-NL");
  if (!needle) return records;
  return records.filter((record) => Object.values(record)
    .filter((value) => ["string", "number"].includes(typeof value))
    .some((value) => String(value).toLocaleLowerCase("nl-NL").includes(needle)));
}
