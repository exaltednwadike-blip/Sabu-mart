-- Returns a list of human-readable reasons why an account cannot be
-- deleted. Empty array = safe to delete.
create or replace function public.check_account_deletion_blockers(p_user_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reasons text[] := array[]::text[];
  v_count integer;
begin
  select count(*) into v_count
  from products
  where seller_id = p_user_id
    and payment_status = 'paid';
  if v_count > 0 then
    v_reasons := array_append(v_reasons, v_count || ' product(s) with a paid listing fee');
  end if;

  select count(*) into v_count
  from order_items
  where seller_id = p_user_id;
  if v_count > 0 then
    v_reasons := array_append(v_reasons, v_count || ' order item(s) as a seller');
  end if;

  select count(*) into v_count
  from orders
  where buyer_id = p_user_id
    and paid_at is not null;
  if v_count > 0 then
    v_reasons := array_append(v_reasons, v_count || ' paid order(s) as a buyer');
  end if;

  select count(*) into v_count
  from wallet_transactions
  where user_id = p_user_id;
  if v_count > 0 then
    v_reasons := array_append(v_reasons, 'wallet transaction history');
  end if;

  select count(*) into v_count
  from withdrawal_requests
  where seller_id = p_user_id
    and status = 'pending';
  if v_count > 0 then
    v_reasons := array_append(v_reasons, 'a pending withdrawal request');
  end if;

  select count(*) into v_count
  from disputes d
  join order_items oi on oi.id = d.order_item_id
  where (d.raised_by = p_user_id or oi.seller_id = p_user_id)
    and d.status = 'open';
  if v_count > 0 then
    v_reasons := array_append(v_reasons, 'an open dispute');
  end if;

  return v_reasons;
end;
$$;

grant execute on function public.check_account_deletion_blockers(uuid) to authenticated;

-- Deletes only the "safe" rows for the current user. Re-checks blockers
-- itself and raises if any exist, so it can never be called around the
-- check above by mistake.
create or replace function public.delete_own_account_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blockers text[];
begin
  if p_user_id <> auth.uid() then
    raise exception 'Not authorized to delete this account';
  end if;

  v_blockers := public.check_account_deletion_blockers(p_user_id);
  if array_length(v_blockers, 1) > 0 then
    raise exception 'Account has payment history and cannot be deleted: %', array_to_string(v_blockers, '; ');
  end if;

  delete from wishlist_items where buyer_id = p_user_id;
  delete from cart_items where buyer_id = p_user_id;
  delete from reviews where buyer_id = p_user_id;
  delete from seller_applications where id = p_user_id;
  delete from products where seller_id = p_user_id; -- only unpaid/draft reach here
  delete from admins where id = p_user_id;
  delete from profiles where id = p_user_id;
end;
$$;

grant execute on function public.delete_own_account_data(uuid) to authenticated;
