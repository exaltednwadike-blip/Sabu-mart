-- The profiles table was missing an is_seller column, which the seller-approval
-- flow relies on to show the "Sell" button and other seller-only UI. This adds
-- it and backfills anyone who was already approved but never got flagged.
alter table public.profiles
  add column if not exists is_seller boolean not null default false;

update public.profiles
set is_seller = true
where seller_status = 'approved'
  and is_seller is distinct from true;
