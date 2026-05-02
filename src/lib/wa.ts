export function whatsappUrl(phoneDigits: string, message: string): string {
  const q = encodeURIComponent(message);
  return `https://wa.me/${phoneDigits}?text=${q}`;
}
