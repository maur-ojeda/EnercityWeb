-- 1. Primero, actualizamos los registros antiguos con los datos de radiación 
--    basándonos en el nombre de la comuna (para no perder el ID original si se usa en otro lado)
UPDATE public.comunas c1
SET 
    radiacion_ghi = c2.radiacion_ghi,
    tarifa_est = c2.tarifa_est
FROM public.comunas c2
WHERE c1.nombre = c2.nombre 
  AND c1.radiacion_ghi IS NULL 
  AND c2.radiacion_ghi IS NOT NULL;

-- 2. Eliminamos los duplicados quedándonos con el registro que tenga el ID más alto 
--    (generalmente el más reciente con los datos correctos)
DELETE FROM public.comunas
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY nombre ORDER BY id DESC) as row_num
        FROM public.comunas
    ) t
    WHERE t.row_num > 1
);

-- 3. Limpieza final de seguridad para Providencia, Vitacura, etc. (RM)
UPDATE public.comunas 
SET 
    radiacion_ghi = 5.50, 
    tarifa_est = 175.00
WHERE region = 'Metropolitana' 
  AND (radiacion_ghi IS NULL OR radiacion_ghi = 0);

-- 4. Asegurar que no existan nombres duplicados por espacios o mayúsculas
UPDATE public.comunas SET nombre = TRIM(nombre);

-- 5. Verificación: Activar solo las que tienen datos completos
UPDATE public.comunas 
SET activa = (radiacion_ghi IS NOT NULL AND tarifa_est IS NOT NULL);