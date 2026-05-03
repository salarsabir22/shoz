const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReservationCode(): string {
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
