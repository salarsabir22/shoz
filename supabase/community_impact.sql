-- Run once in Supabase SQL Editor (adds public aggregate stats; no row-level reservation data exposed)
-- Safe: SECURITY DEFINER reads tables; clients only get JSON totals via RPC.

create or replace function public.get_community_impact()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'meals_saved',
    (select coalesce(sum(quantity), 0)::bigint from public.reservations),
    'money_saved_cents',
    (select coalesce(
      sum(
        round(l.original_price_cents::numeric * ((l.discount_at_start + l.discount_at_end) / 2.0 / 100.0))
        * r.quantity::numeric
      ),
      0
    )::bigint
    from public.reservations r
    join public.listings l on l.id = r.listing_id),
    'co2_kg_estimate',
    round((select coalesce(sum(quantity), 0) from public.reservations) * 2.5::numeric, 1)
  );
$$;

revoke all on function public.get_community_impact() from public;
grant execute on function public.get_community_impact() to anon, authenticated;
