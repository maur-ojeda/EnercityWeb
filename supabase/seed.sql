-- Comunas (26 rows from production)
INSERT INTO public.comunas (id, nombre, activa, region, created_at, radiacion_ghi, tarifa_est) OVERRIDING SYSTEM VALUE VALUES
(1, 'Santiago', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(2, 'Providencia', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(3, 'Las Condes', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(4, 'Vitacura', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(5, 'La Florida', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(6, 'Maipú', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(7, 'Peñalolén', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(8, 'San Bernardo', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(9, 'Puente Alto', true, 'Metropolitana', '2026-02-23 20:01:55.023183+00', 5.50, 175.00),
(10, 'Valparaíso', true, 'Valparaíso', '2026-02-23 20:01:55.023183+00', 5.40, 178.00),
(11, 'Viña del Mar', true, 'Valparaíso', '2026-02-23 20:01:55.023183+00', 5.40, 178.00),
(12, 'Concepción', true, 'Biobío', '2026-02-23 20:01:55.023183+00', 4.30, 182.00),
(13, 'Talcahuano', true, 'Biobío', '2026-02-23 20:01:55.023183+00', 4.30, 175.00),
(14, 'La Serena', true, 'Coquimbo', '2026-02-23 20:01:55.023183+00', 6.20, 180.00),
(15, 'Coquimbo', true, 'Coquimbo', '2026-02-23 20:01:55.023183+00', 6.20, 175.00),
(16, 'Arica', true, 'Arica y Parinacota', '2026-02-26 18:57:22.201897+00', 7.50, 185.00),
(17, 'Iquique', true, 'Tarapacá', '2026-02-26 18:57:22.201897+00', 7.30, 185.00),
(18, 'Antofagasta', true, 'Antofagasta', '2026-02-26 18:57:22.201897+00', 7.40, 185.00),
(19, 'Copiapó', true, 'Atacama', '2026-02-26 18:57:22.201897+00', 7.10, 180.00),
(27, 'Rancagua', true, 'O''Higgins', '2026-02-26 18:57:22.201897+00', 5.30, 175.00),
(28, 'Talca', true, 'Maule', '2026-02-26 18:57:22.201897+00', 4.80, 178.00),
(30, 'Temuco', true, 'Araucanía', '2026-02-26 18:57:22.201897+00', 3.80, 190.00),
(31, 'Valdivia', true, 'Los Ríos', '2026-02-26 18:57:22.201897+00', 3.40, 190.00),
(32, 'Puerto Montt', true, 'Los Lagos', '2026-02-26 18:57:22.201897+00', 3.20, 195.00),
(33, 'Coyhaique', true, 'Aysén', '2026-02-26 18:57:22.201897+00', 2.80, 210.00),
(34, 'Punta Arenas', true, 'Magallanes', '2026-02-26 18:57:22.201897+00', 2.50, 205.00);

SELECT setval('public.comunas_id_seq', 35, false);

-- Precios Kits (19 rows from production)
INSERT INTO public.precios_kits (id, consumo_bruto, amperaje_necesario, inversor_kw, paneles, kwp, precio_neto_base, created_at) OVERRIDING SYSTEM VALUE VALUES
(1, 50000, NULL, 2.0, 5, 2.90, 3470588, '2026-03-20 19:50:19.923423+00'),
(2, 60000, NULL, 3.0, 6, 3.48, 3873950, '2026-03-20 19:50:19.923423+00'),
(3, 70000, NULL, 3.0, 7, 4.06, 4277311, '2026-03-20 19:50:19.923423+00'),
(4, 80000, NULL, 4.0, 8, 4.64, 4453782, '2026-03-20 19:50:19.923423+00'),
(5, 90000, NULL, 4.0, 9, 5.22, 4750000, '2026-03-20 19:50:19.923423+00'),
(6, 100000, NULL, 5.0, 10, 5.80, 5150000, '2026-03-20 19:50:19.923423+00'),
(7, 110000, NULL, 5.0, 11, 6.38, 5553782, '2026-03-20 19:50:19.923423+00'),
(8, 120000, NULL, 6.0, 12, 6.96, 5953782, '2026-03-20 19:50:19.923423+00'),
(9, 130000, NULL, 6.0, 13, 7.54, 6357143, '2026-03-20 19:50:19.923423+00'),
(10, 140000, NULL, 8.0, 14, 8.12, 6660504, '2026-03-20 19:50:19.923423+00'),
(11, 150000, NULL, 8.0, 15, 8.70, 7063866, '2026-03-20 19:50:19.923423+00'),
(12, 160000, NULL, 8.0, 16, 9.28, 7467227, '2026-03-20 19:50:19.923423+00'),
(13, 170000, NULL, 8.0, 17, 9.86, 7870588, '2026-03-20 19:50:19.923423+00'),
(14, 180000, NULL, 8.0, 18, 10.44, 8273950, '2026-03-20 19:50:19.923423+00'),
(15, 190000, NULL, 8.0, 19, 11.02, 8568000, '2026-03-20 19:50:19.923423+00'),
(16, 200000, NULL, 8.0, 19, 11.02, 7873950, '2026-03-20 19:50:19.923423+00'),
(17, 210000, NULL, 8.0, 20, 11.60, 8285714, '2026-03-20 19:50:19.923423+00'),
(18, 220000, NULL, 10.0, 21, 12.18, 8935714, '2026-03-20 19:50:19.923423+00'),
(19, 230000, NULL, 10.0, 22, 12.76, 9178714, '2026-03-20 19:50:19.923423+00');

SELECT setval('public.precios_kits_id_seq', 20, false);

-- Settings (FIX: real values in value column)
INSERT INTO public.settings (key, value, label, updated_at) VALUES
('costo_medidor_reja', '350000', 'Costo Fijo Medidor en Reja', '2026-02-26 18:40:12.151706+00'),
('email_from_address', 'presupuestos@enercity.cl', 'Email remitente presupuestos', '2026-02-26 18:40:12.151706+00'),
('email_from_name', 'Enercity', 'Nombre remitente', '2026-02-26 18:40:12.151706+00'),
('email_telefono', '+56912345678', 'Teléfono contacto', '2026-02-26 18:40:12.151706+00'),
('factor_teja', '1.14', 'Recargo Teja Chilena (+14%)', '2026-02-26 18:40:12.151706+00'),
('iva', '1.19', 'Factor IVA 19%', '2026-02-26 18:40:12.151706+00'),
('limite_inferior', '50000', 'Monto mínimo simulación', '2026-02-26 18:40:12.151706+00'),
('limite_superior', '230000', 'Monto máximo simulación', '2026-02-26 18:40:12.151706+00'),
('performance_ratio', '0.80', 'Ratio de rendimiento sistema solar', '2026-02-26 19:15:48.617233+00');