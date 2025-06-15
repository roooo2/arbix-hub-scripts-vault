
-- Recreate the function with SECURITY DEFINER to allow it to update stats
-- This will bypass RLS for the update, as it runs with owner privileges.
CREATE OR REPLACE FUNCTION public.increment_view_count(visitor_uuid TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_new_visitor BOOLEAN := FALSE;
BEGIN
  -- Check if this is a new visitor
  IF NOT EXISTS (SELECT 1 FROM public.website_views WHERE visitor_id = visitor_uuid) THEN
    is_new_visitor := TRUE;
  END IF;
  
  -- Insert the new view
  INSERT INTO public.website_views (visitor_id, page_path, created_at)
  VALUES (visitor_uuid, '/', now());
  
  -- Update aggregate stats
  IF is_new_visitor THEN
    UPDATE public.website_stats 
    SET total_views = total_views + 1,
        unique_visitors = unique_visitors + 1,
        last_updated = now()
    WHERE id = (SELECT id FROM public.website_stats LIMIT 1);
  ELSE
    UPDATE public.website_stats 
    SET total_views = total_views + 1,
        last_updated = now()
    WHERE id = (SELECT id FROM public.website_stats LIMIT 1);
  END IF;
END;
$$;

-- Enable realtime updates on the stats table
ALTER TABLE public.website_stats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.website_stats;
