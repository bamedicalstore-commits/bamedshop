import type { Money } from "@/types/product";

/**
 * Format money for TN market. Amount is stored in minor units.
 * TND uses 3 decimals (millimes). EUR/USD use 2.
 */
export function formatMoney(m: Money, locale = "fr-FR"): string {
  const decimals = m.currency === "TND" ? 3 : 2;
  const value = m.amount / 10 ** decimals;
  const symbols: Record<string, string> = { TND: "DT", EUR: "€", USD: "$" };
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  const sym = symbols[m.currency] ?? m.currency;
  return m.currency === "TND" ? `${formatted} ${sym}` : `${sym}${formatted}`;
}

export function formatDate(iso: string, locale = "fr-TN"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatNumber(n: number, locale = "fr-TN"): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function discountFromCompare(price: Money, compare?: Money): number | undefined {
  if (!compare || compare.amount <= price.amount) return undefined;
  return Math.round(((compare.amount - price.amount) / compare.amount) * 100);
}
