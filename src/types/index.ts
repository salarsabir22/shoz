export type UserRole = "customer" | "business";
export type ListingStatus = "active" | "sold_out" | "expired" | "cancelled";
export type ReservationStatus = "pending" | "confirmed" | "picked_up" | "cancelled";
export type BusinessCategory = "bakery" | "cafe" | "restaurant" | "grocery";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  address: string;
  lat: number;
  lng: number;
  category: BusinessCategory;
  phone?: string;
  logo_url?: string;
  rating: number;
  verified: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  business_id: string;
  business?: Business;
  title: string;
  description?: string;
  category?: string;
  original_price: number;
  current_price: number;
  quantity_total: number;
  quantity_remaining: number;
  pickup_start: string;
  pickup_end: string;
  photo_url?: string;
  is_mystery_bag: boolean;
  status: ListingStatus;
  created_at: string;
}

export interface Reservation {
  id: string;
  listing_id: string;
  listing?: Listing;
  customer_id: string;
  quantity: number;
  total_price: number;
  status: ReservationStatus;
  reservation_code: string;
  created_at: string;
}

export interface ImpactStats {
  totalMealsSaved: number;
  totalMoneySaved: number;
  totalCo2Saved: number;
  currentStreak: number;
  businessesTried: number;
}
