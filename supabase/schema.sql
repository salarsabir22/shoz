-- Smart Surplus Food Marketplace — run in Supabase SQL Editor (new project)

create extension if not exists "pgcrypto";

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  venue_name text not null,
  item_name text not null,
  description text,
  address text,
  latitude double precision,
  longitude double precision,
  whatsapp_phone text not null,
  original_price_cents int not null check (original_price_cents > 0),
  discount_at_start int not null check (discount_at_start between 0 and 95),
  discount_at_end int not null check (discount_at_end between 0 and 95),
  deal_start timestamptz not null,
  deal_end timestamptz not null,
  quantity_available int not null check (quantity_available >= 0),
  mystery_bag boolean not null default false,
  constraint deal_times check (deal_end > deal_start),
  constraint discount_monotonic check (discount_at_end >= discount_at_start)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  quantity int not null default 1 check (quantity >= 1)
);

create index listings_deal_end_idx on public.listings (deal_end);
create index reservations_listing_id_idx on public.reservations (listing_id);

alter table public.listings enable row level security;
alter table public.reservations enable row level security;

-- Public read: active surplus only
create policy "Anyone can read active listings"
  on public.listings
  for select
  using (
    quantity_available > 0
    and deal_end > now()
  );

-- No direct client writes; server uses service role key
