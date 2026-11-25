export type QuoteLine = { quantity: number; unitPrice: number; vatRate: number };
export type QuoteTotals = { subtotal: number; discount: number; vat: number; total: number };
export const REQUEST_STATUSES: readonly string[];
export function quoteTotals(lines: QuoteLine[], discountPercent?: number): QuoteTotals;
export function updateRequestStatus<T extends { status: string }>(request: T, status: string): T;
export function searchRecords<T extends Record<string, unknown>>(records: T[], query: string): T[];
