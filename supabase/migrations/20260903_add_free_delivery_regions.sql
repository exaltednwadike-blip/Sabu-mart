-- Add a text[] column to store free delivery regions for products
-- Backfill from the legacy boolean `free_delivery_lagos` column if it exists.

alter table public.products
  add column if not exists free_delivery_regions text[] not null default '{}'::text[];

-- If there's an older boolean flag, copy values into the new array column.
-- This uses a length-check to avoid overwriting already-set arrays.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='free_delivery_lagos'
  ) THEN
    UPDATE public.products
    SET free_delivery_regions = array['Lagos']
    WHERE (free_delivery_regions IS NULL OR array_length(free_delivery_regions,1) = 0)
      AND coalesce(free_delivery_lagos, false) = true;
  END IF;
END$$;
