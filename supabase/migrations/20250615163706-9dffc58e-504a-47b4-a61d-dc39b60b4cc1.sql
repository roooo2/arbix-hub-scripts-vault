
-- Create a policy to allow anyone to insert into the website_views table
CREATE POLICY "Anyone can insert a view" ON public.website_views FOR INSERT WITH CHECK (true);
