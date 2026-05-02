export function interpolatedDiscountPercent(
  now: Date,
  dealStart: Date,
  dealEnd: Date,
  discountAtStart: number,
  discountAtEnd: number
): number {
  if (dealEnd.getTime() <= dealStart.getTime()) return discountAtEnd;
  if (now.getTime() <= dealStart.getTime()) return discountAtStart;
  if (now.getTime() >= dealEnd.getTime()) return discountAtEnd;
  const t =
    (now.getTime() - dealStart.getTime()) /
    (dealEnd.getTime() - dealStart.getTime());
  return Math.round(discountAtStart + t * (discountAtEnd - discountAtStart));
}

export function discountedPriceCents(
  originalCents: number,
  discountPercent: number
): number {
  return Math.max(
    0,
    Math.round(originalCents * (1 - discountPercent / 100))
  );
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function minutesUntil(date: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 60000));
}
