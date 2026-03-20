-- 1. Comunas (geografía Chile)
CREATE TABLE comunas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activa BOOLEAN DEFAULT true,
  region VARCHAR(100),
  radiacion_ghi VARCHAR(50),
  tarifa_est NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Catálogo de Kits (según Excel)
CREATE TABLE precios_kits (
  id SERIAL PRIMARY KEY,
  consumo_bruto INT NOT NULL UNIQUE,
  amperaje_necesario VARCHAR(10),
  inversor_kw DECIMAL(4,2) NOT NULL,
  paneles INT NOT NULL,
  kwp DECIMAL(5,2) NOT NULL,
  precio_neto_base DECIMAL(12,0) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leads (auditable para ERP)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  comuna_id INT REFERENCES comunas(id),
  monto_boleta_ingresado INT NOT NULL,
  kit_id INT REFERENCES precios_kits(id),
  factor_techo_aplicado DECIMAL(4,2),
  costo_fijo_medidor_aplicado DECIMAL(12,0),
  precio_final_iva DECIMAL(12,0),
  estado VARCHAR(20) DEFAULT 'nuevo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settings (configuración dinámica)
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  descripcion VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data: Kits según Excel
INSERT INTO precios_kits (consumo_bruto, amperaje_necesario, inversor_kw, paneles, kwp, precio_neto_base) VALUES
(50000, '10 A', 3.0, 6, 3.30, 4990000),
(60000, '10 A', 3.0, 8, 4.40, 5990000),
(70000, '10 A', 4.0, 8, 4.40, 6990000),
(80000, '10 A', 4.0, 10, 5.50, 7990000),
(90000, '10 A', 5.0, 10, 5.50, 8990000),
(100000, '15 A', 5.0, 12, 6.60, 9990000),
(110000, '15 A', 6.0, 12, 6.60, 10990000),
(120000, '15 A', 6.0, 14, 7.70, 11990000),
(130000, '20 A', 8.0, 14, 7.70, 12990000),
(140000, '20 A', 8.0, 16, 8.80, 13990000),
(150000, '20 A', 10.0, 16, 8.80, 14990000),
(160000, '25 A', 10.0, 18, 9.90, 15990000),
(170000, '25 A', 10.0, 20, 11.00, 16990000),
(180000, '25 A', 12.0, 20, 11.00, 17990000),
(190000, '25 A', 12.0, 22, 12.10, 18990000),
(200000, '30 A', 15.0, 22, 12.10, 19990000),
(210000, '30 A', 15.0, 24, 13.20, 20990000),
(220000, '30 A', 15.0, 26, 14.30, 21990000),
(230000, '40 A', 20.0, 26, 14.30, 22990000);

-- Seed data: Configuraciones iniciales
INSERT INTO settings (key, value, descripcion) VALUES
('iva', 1.19, 'IVA aplicado en Chile'),
('factor_teja', 1.142, 'Factor de recargo para teja chilena'),
('costo_medidor_reja', 350000, 'Costo de medidor tipo reja'),
('costo_medidor_poste', 450000, 'Costo de medidor tipo poste'),
('factor_zinc_pizarreño', 1.0, 'Factor de recargo para zinc/pizarreño'),
('factor_teja_asfaltica', 1.05, 'Factor de recargo para teja asfáltica'),
('factor_teja_colonial', 1.12, 'Factor de recargo para teja colonial'),
('factor_industrial', 1.0, 'Factor de recargo para industrial'),
('limite_inferior', 50000, 'Consumo mínimo para sistema solar'),
('limite_superior', 230000, 'Consumo máximo para sistema solar'),
('performance_ratio', 0.80, 'Ratio de rendimiento del sistema'),
('potencia_modulo_wp', 450, 'Potencia estándar de módulo solar en Wp'),
('email_from_name', 'Enercity', 'Nombre remitente emails'),
('email_from_address', 'presupuestos@enercity.cl', 'Email remitente'),
('email_telefono', '+56912345678', 'Teléfono contacto');
