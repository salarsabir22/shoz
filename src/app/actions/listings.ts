"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type CreateListingInput = {
  venueName: string;
  itemName: string;
  description: string;
  address: string;
  whatsappPhone: string;
  originalPriceEur: number;
  discountAtStart: number;
  discountAtEnd: number;
  dealStart: string;
  dealEnd: string;
  quantity: number;
  mysteryBag: boolean;
};

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

function parseLocalDatetime(value: string): string | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function createListing(
  input: CreateListingInput
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  try {
    const supabase = createAdminSupabase();
    const originalCents = Math.round(input.originalPriceEur * 100);
    if (originalCents <= 0) {
      return { ok: false, message: "Price must be greater than zero." };
    }
    const wa = digitsOnly(input.whatsappPhone);
    if (wa.length < 8) {
      return { ok: false, message: "Enter a valid WhatsApp number (with country code)." };
    }
    const dealStartIso = parseLocalDatetime(input.dealStart);
    const dealEndIso = parseLocalDatetime(input.dealEnd);
    if (!dealStartIso || !dealEndIso) {
      return { ok: false, message: "Invalid deal times." };
    }
    if (new Date(dealEndIso).getTime() <= new Date(dealStartIso).getTime()) {
      return { ok: false, message: "Pickup deadline must be after deal start." };
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        venue_name: input.venueName.trim(),
        item_name: input.itemName.trim(),
        description: input.description.trim() || null,
        address: input.address.trim() || null,
        whatsapp_phone: wa,
        original_price_cents: originalCents,
        discount_at_start: input.discountAtStart,
        discount_at_end: input.discountAtEnd,
        deal_start: dealStartIso,
        deal_end: dealEndIso,
        quantity_available: input.quantity,
        mystery_bag: input.mysteryBag,
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return { ok: false, message: error.message };
    }
    revalidatePath("/");
    revalidatePath("/business");
    return { ok: true, id: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return { ok: false, message: msg };
  }
}

export async function reserveListing(
  listingId: string,
  customerName: string,
  customerPhone: string,
  quantity: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = customerName.trim();
  if (!name) {
    return { ok: false, message: "Please enter your name." };
  }
  const qty = Math.max(1, Math.floor(quantity));
  try {
    const supabase = createAdminSupabase();
    const { data: listing, error: fetchErr } = await supabase
      .from("listings")
      .select("quantity_available, deal_end")
      .eq("id", listingId)
      .single();

    if (fetchErr || !listing) {
      return { ok: false, message: "Listing not found." };
    }
    const end = new Date(listing.deal_end);
    if (end.getTime() <= Date.now()) {
      return { ok: false, message: "Pickup window has ended." };
    }
    if (listing.quantity_available < qty) {
      return { ok: false, message: "Not enough portions left." };
    }

    const { error: resErr } = await supabase.from("reservations").insert({
      listing_id: listingId,
      customer_name: name,
      customer_phone: customerPhone.trim() || null,
      quantity: qty,
    });
    if (resErr) {
      console.error(resErr);
      return { ok: false, message: resErr.message };
    }

    const { error: updErr } = await supabase
      .from("listings")
      .update({ quantity_available: listing.quantity_available - qty })
      .eq("id", listingId);
    if (updErr) {
      console.error(updErr);
      return { ok: false, message: updErr.message };
    }

    revalidatePath("/");
    revalidatePath(`/listings/${listingId}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return { ok: false, message: msg };
  }
}
