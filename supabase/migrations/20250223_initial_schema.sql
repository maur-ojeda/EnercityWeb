-- ============================================
-- EnercityWeb — Initial Schema (Production Mirror)
-- ============================================

CREATE TABLE IF NOT EXISTS public.comunas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT true,
    region TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    radiacion_ghi NUMERIC NOT NULL,
    tarifa_est NUMERIC NOT NULL DEFAULT 175.00
);

CREATE TABLE IF NOT EXISTS public.precios_kits (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumo_bruto NUMERIC NOT NULL,
    amperaje_necesario NUMERIC,
    inversor_kw NUMERIC NOT NULL,
    paneles INTEGER NOT NULL,
    kwp NUMERIC NOT NULL,
    precio_neto_base NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    comuna_id INTEGER NOT NULL REFERENCES public.comunas(id),
    kit_id INTEGER NOT NULL REFERENCES public.precios_kits(id),
    monto_boleta_ingresado NUMERIC NOT NULL,
    factor_techo_aplicado NUMERIC NOT NULL,
    costo_fijo_medidor_aplicado NUMERIC NOT NULL,
    precio_final_iva NUMERIC NOT NULL,
    estado TEXT NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.comunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precios_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read comunas" ON public.comunas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read precios_kits" ON public.precios_kits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon USING (true);