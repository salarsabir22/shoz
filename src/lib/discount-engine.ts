export function calculateDiscount(pickupEnd: Date): number {
  const minutesLeft = (pickupEnd.getTime() - Date.now()) / 60000;
  if (minutesLeft > 120) return 30;
  if (minutesLeft > 60) return 50;
  if (minutesLeft > 30) return 60;
  return 70;
}

export function getDiscountedPrice(originalPrice: number, pickupEnd: Date): number {
  const discount = calculateDiscount(pickupEnd);
  return parseFloat((originalPrice * (1 - discount / 100)).toFixed(2));
}

export function getDiscountVariant(
  discount: number
): "secondary" | "warning" | "destructive" {
  if (discount <= 30) return "secondary";
  if (discount <= 50) return "warning";
  return "destructive";
}
