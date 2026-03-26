-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Donors RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Donors are viewable by everyone" ON public.donors;
CREATE POLICY "Donors are viewable by everyone" ON public.donors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Donors can update their own data" ON public.donors;
CREATE POLICY "Donors can update their own data" ON public.donors FOR UPDATE USING (auth.uid() = id);

-- 3. Requesters RLS
ALTER TABLE public.requesters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Requesters are viewable by everyone" ON public.requesters;
CREATE POLICY "Requesters are viewable by everyone" ON public.requesters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Requesters can update their own data" ON public.requesters;
CREATE POLICY "Requesters can update their own data" ON public.requesters FOR UPDATE USING (auth.uid() = id);

-- 4. Hospitals RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hospitals are viewable by everyone" ON public.hospitals;
CREATE POLICY "Hospitals are viewable by everyone" ON public.hospitals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Hospitals can update their own data" ON public.hospitals;
CREATE POLICY "Hospitals can update their own data" ON public.hospitals FOR UPDATE USING (auth.uid() = id);

-- 5. Give service_role full access (for triggers)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
