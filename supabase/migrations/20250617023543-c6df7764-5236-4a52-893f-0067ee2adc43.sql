
-- Create premium_codes table to store valid premium codes
CREATE TABLE public.premium_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    is_used boolean NOT NULL DEFAULT false,
    used_by text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    used_at timestamptz NULL
);

-- Create user_premium_status table to track which users have premium access
CREATE TABLE public.user_premium_status (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL UNIQUE,
    is_premium boolean NOT NULL DEFAULT false,
    premium_code_used text NULL,
    activated_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add is_premium column to scripts table to distinguish free vs premium scripts
ALTER TABLE public.scripts ADD COLUMN is_premium boolean NOT NULL DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_status ENABLE ROW LEVEL SECURITY;

-- Allow public read access to premium codes (for validation)
CREATE POLICY "Allow public read access to premium codes" ON public.premium_codes FOR SELECT USING (true);

-- Allow public insert/update on user premium status
CREATE POLICY "Allow public access to user premium status" ON public.user_premium_status FOR ALL USING (true);

-- Update scripts table RLS to show free scripts to everyone, premium only to premium users
DROP POLICY IF EXISTS "Allow public read access to scripts" ON public.scripts;
CREATE POLICY "Allow access to free scripts for everyone" ON public.scripts FOR SELECT USING (is_premium = false);
CREATE POLICY "Allow access to premium scripts for premium users" ON public.scripts FOR SELECT USING (
    is_premium = true AND EXISTS (
        SELECT 1 FROM public.user_premium_status 
        WHERE user_id = 'anonymous_user' AND is_premium = true
    )
);
CREATE POLICY "Allow access to all scripts for non-premium check" ON public.scripts FOR SELECT USING (true);

-- Insert 20 premium codes
INSERT INTO public.premium_codes (code) VALUES
('SECRET-ALPHA-001'),
('SECRET-BETA-002'),
('SECRET-GAMMA-003'),
('SECRET-DELTA-004'),
('SECRET-EPSILON-005'),
('SECRET-ZETA-006'),
('SECRET-ETA-007'),
('SECRET-THETA-008'),
('SECRET-IOTA-009'),
('SECRET-KAPPA-010'),
('SECRET-LAMBDA-011'),
('SECRET-MU-012'),
('SECRET-NU-013'),
('SECRET-XI-014'),
('SECRET-OMICRON-015'),
('SECRET-PI-016'),
('SECRET-RHO-017'),
('SECRET-SIGMA-018'),
('SECRET-TAU-019'),
('SECRET-UPSILON-020');

-- Add some sample premium scripts
INSERT INTO public.scripts (game_name, description, functions, script_body, status, is_premium)
VALUES 
(
    'Blox Fruits Premium',
    'Advanced Blox Fruits script with auto-farm and premium features',
    '[{"name": "Auto Farm", "status": "🟢"}, {"name": "Auto Raid", "status": "🟢"}, {"name": "ESP", "status": "🟢"}]'::jsonb,
    'loadstring(game:HttpGet("https://raw.githubusercontent.com/premium/bloxfruits/main/premium.lua"))()',
    'Working',
    true
),
(
    'Arsenal Premium',
    'Premium Arsenal aimbot and ESP with advanced features',
    '[{"name": "Aimbot", "status": "🟢"}, {"name": "ESP", "status": "🟢"}, {"name": "No Recoil", "status": "🟢"}]'::jsonb,
    'loadstring(game:HttpGet("https://raw.githubusercontent.com/premium/arsenal/main/premium.lua"))()',
    'Working',
    true
);

-- Mark the existing script as free
UPDATE public.scripts SET is_premium = false WHERE game_name = 'Steal a Brianrot';

-- Enable realtime for new tables
ALTER TABLE public.premium_codes REPLICA IDENTITY FULL;
ALTER TABLE public.user_premium_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_premium_status;
