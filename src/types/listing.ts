export type ListingRow = {
  id: string;
  created_at: string;
  venue_name: string;
  item_name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp_phone: string;
  original_price_cents: number;
  discount_at_start: number;
  discount_at_end: number;
  deal_start: string;
  deal_end: string;
  quantity_available: number;
  mystery_bag: boolean;
};
