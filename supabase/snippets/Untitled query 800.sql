INSERT INTO public.comunas (nombre, region, radiacion_ghi, tarifa_est, activa)
VALUES 
  ('Arica', 'Arica y Parinacota', 7.50, 185, true),
  ('Iquique', 'Tarapacá', 7.30, 185, true),
  ('Antofagasta', 'Antofagasta', 7.40, 185, true),
  ('Copiapó', 'Atacama', 7.10, 180, true),
  ('La Serena', 'Coquimbo', 6.20, 180, true),
  ('Valparaíso', 'Valparaíso', 5.40, 178, true),
  ('Viña del Mar', 'Valparaíso', 5.40, 178, true),
  ('Santiago', 'Metropolitana', 5.50, 175, true),
  ('Las Condes', 'Metropolitana', 5.50, 175, true),
  ('Maipú', 'Metropolitana', 5.50, 175, true),
  ('Puente Alto', 'Metropolitana', 5.50, 175, true),
  ('Rancagua', 'O’Higgins', 5.30, 175, true),
  ('Talca', 'Maule', 4.80, 178, true),
  ('Concepción', 'Biobío', 4.30, 182, true),
  ('Temuco', 'Araucanía', 3.80, 190, true),
  ('Valdivia', 'Los Ríos', 3.40, 190, true),
  ('Puerto Montt', 'Los Lagos', 3.20, 195, true),
  ('Coyhaique', 'Aysén', 2.80, 210, true),
  ('Punta Arenas', 'Magallanes', 2.50, 205, true)
ON CONFLICT (nombre) 
DO UPDATE SET 
  radiacion_ghi = EXCLUDED.radiacion_ghi,
  tarifa_est = EXCLUDED.tarifa_est,
  region = EXCLUDED.region;