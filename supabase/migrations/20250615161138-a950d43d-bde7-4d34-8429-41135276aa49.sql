
-- Create a table to track website views
CREATE TABLE public.website_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for better performance on visitor_id lookups
CREATE INDEX idx_website_views_visitor_id ON public.website_views(visitor_id);
CREATE INDEX idx_website_views_created_at ON public.website_views(created_at);

-- Create a table to store aggregate view statistics
CREATE TABLE public.website_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial stats row
INSERT INTO public.website_stats (total_views, unique_visitors) VALUES (0, 0);

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(visitor_uuid TEXT)
RETURNS void
LANGUAGE plpgsql
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

-- Make the tables publicly readable (no authentication required)
ALTER TABLE public.website_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the stats
CREATE POLICY "Anyone can view website stats" ON public.website_stats FOR SELECT USING (true);

-- Allow anyone to call the increment function (this will be called from the frontend)
GRANT EXECUTE ON FUNCTION public.increment_view_count TO anon;
