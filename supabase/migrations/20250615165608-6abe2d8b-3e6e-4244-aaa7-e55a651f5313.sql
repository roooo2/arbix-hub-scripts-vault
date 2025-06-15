
-- Create scripts table to store script information and status
CREATE TABLE public.scripts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    game_name text NOT NULL,
    description text NULL DEFAULT 'Premium Script Collection'::text,
    functions jsonb NULL,
    script_body text NOT NULL,
    status text NOT NULL DEFAULT 'Working'::text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON COLUMN public.scripts.status IS 'Possible values: Working, Patched';

-- Enable Row Level Security
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to scripts
CREATE POLICY "Allow public read access to scripts" ON public.scripts FOR SELECT USING (true);

-- Insert the existing script data into the new table
INSERT INTO public.scripts (game_name, functions, script_body, status)
VALUES (
    'Steal a Brianrot',
    '[{"name": "Anti Cheat Bypass", "status": "🟢"}, {"name": "Insta Steal", "status": "🟢"}]'::jsonb,
    'loadstring(game:HttpGet("https://raw.githubusercontent.com/Youifpg/Steal-a-Brianrot/refs/heads/main/InstaSteal.lua"))()',
    'Working'
);

-- Enable realtime updates on the scripts table
ALTER TABLE public.scripts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scripts;
