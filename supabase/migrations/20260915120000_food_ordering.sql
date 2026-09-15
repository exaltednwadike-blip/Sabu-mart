create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  area text,
  description text,
  cuisine text,
  cover_image text,
  is_open boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  price numeric not null,
  description text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now()
);

create table if not exists public.food_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id),
  status text not null default 'placed' check (status in 
    ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_address text not null,
  delivery_phone text not null,
  note text,
  subtotal numeric not null,
  delivery_fee numeric not null default 500,
  service_fee numeric not null default 150,
  total numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.food_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.food_orders(id) on delete cascade,
  menu_item_id uuid references public.restaurant_menu_items(id),
  item_name text not null,
  price numeric not null,
  quantity integer not null
);

create index if not exists food_orders_buyer_id_idx on public.food_orders(buyer_id);
create index if not exists restaurant_menu_items_restaurant_id_idx on public.restaurant_menu_items(restaurant_id);
create index if not exists food_order_items_order_id_idx on public.food_order_items(order_id);

alter table public.restaurants enable row level security;
alter table public.restaurant_menu_items enable row level security;
alter table public.food_orders enable row level security;
alter table public.food_order_items enable row level security;

create policy "Anyone can view restaurants" on public.restaurants for select using (true);
create policy "Admins can manage restaurants" on public.restaurants for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "Anyone can view menu items" on public.restaurant_menu_items for select using (true);
create policy "Admins can manage menu items" on public.restaurant_menu_items for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "Buyers can view their own food orders" on public.food_orders for select
  using (auth.uid() = buyer_id);
create policy "Buyers can create their own food orders" on public.food_orders for insert
  with check (auth.uid() = buyer_id);
create policy "Admins can view all food orders" on public.food_orders for select
  using (exists (select 1 from public.admins a where a.id = auth.uid()));
create policy "Admins can update food orders" on public.food_orders for update
  using (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "Buyers can view their own order items" on public.food_order_items for select
  using (exists (select 1 from public.food_orders fo where fo.id = food_order_items.order_id 
    and fo.buyer_id = auth.uid()));
create policy "Buyers can create their own order items" on public.food_order_items for insert
  with check (exists (select 1 from public.food_orders fo where fo.id = food_order_items.order_id 
    and fo.buyer_id = auth.uid()));
create policy "Admins can view all order items" on public.food_order_items for select
  using (exists (select 1 from public.admins a where a.id = auth.uid()));
