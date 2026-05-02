export function isSupabasePublicConfigured(): boolean {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.length && key?.length
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.length &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.length
  );
}
