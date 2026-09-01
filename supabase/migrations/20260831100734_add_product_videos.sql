-- Allow sellers to attach up to a few product videos, stored the same way
-- as product images (an array of public storage URLs).
alter table public.products
  add column if not exists videos text[] not null default '{}'::text[];
