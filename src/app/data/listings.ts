import { createPublicSupabase } from "@/lib/supabase/public";
import { isSupabasePublicConfigured } from "@/lib/env";
import type { ListingRow } from "@/types/listing";

export async function fetchActiveListings(): Promise<ListingRow[]> {
  if (!isSupabasePublicConfigured()) return [];
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("deal_end", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []) as ListingRow[];
  } catch {
    return [];
  }
}

export async function fetchListingById(
  id: string
): Promise<ListingRow | null> {
  if (!isSupabasePublicConfigured()) return null;
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as ListingRow;
  } catch {
    return null;
  }
}
