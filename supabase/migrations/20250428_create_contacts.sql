-- ============================================
-- EnercityWeb — Contact Form Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    proyecto TEXT NOT NULL,
    mensaje TEXT,
    estado TEXT NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anon insert (contact form is public)
CREATE POLICY "Allow anon insert on contacts" ON public.contacts
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated read (admin panel future use)
CREATE POLICY "Allow authenticated read on contacts" ON public.contacts
    FOR SELECT TO authenticated
    USING (true);