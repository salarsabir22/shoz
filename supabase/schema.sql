-- SaveBite schema — run in Supabase SQL editor (or psql)
-- After tables exist, enable realtime for listings:
--   alter publication supabase_realtime add table public.listings;

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text check (role in ('customer', 'business')) not null,
  avatar_url text,
  notify_deals boolean default true,
  notify_reminders boolean default true,
  created_at timestamptz default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  address text not null,
  lat float not null,
  lng float not null,
  category text check (category in ('bakery', 'cafe', 'restaurant', 'grocery')),
  phone text,
  logo_url text,
  rating float default 0,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  title text not null,
  description text,
  category text,
  original_price numeric(10,2) not null,
  current_price numeric(10,2) not null,
  quantity_total int not null,
  quantity_remaining int not null,
  pickup_start timestamptz not null,
  pickup_end timestamptz not null,
  photo_url text,
  is_mystery_bag boolean default false,
  status text check (status in ('active', 'sold_out', 'expired', 'cancelled')) default 'active',
  created_at timestamptz default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),
  customer_id uuid references users(id),
  quantity int not null default 1,
  total_price numeric(10,2) not null,
  status text check (status in ('pending', 'confirmed', 'picked_up', 'cancelled')) default 'confirmed',
  reservation_code text unique not null,
  created_at timestamptz default now()
);

create table if not exists impact_logs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id),
  co2_saved_kg float,
  meals_saved int,
  money_saved numeric(10,2),
  created_at timestamptz default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  created_at timestamptz default now(),
  unique (customer_id, business_id)
);

create index if not exists idx_listings_business on listings(business_id);
create index if not exists idx_listings_status on listings(status);
create index if not exists idx_reservations_customer on reservations(customer_id);
create index if not exists idx_favorites_customer on favorites(customer_id);
