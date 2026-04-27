import { defineAction, z } from 'astro:actions';
import { supabase } from '../lib/supabase';

const FACTOR_TEJA_CHILENA = 1.14;
const COSTO_FIJO_MEDIDOR_REJA = 350000;
const IVA = 1.19;
const LIMITE_INFERIOR = 50000;
const LIMITE_SUPERIOR = 230000;

export const calculateQuote = defineAction({
  input: z.object({
    montoBoleta: z.number().min(1),
    tipoTecho: z.enum(['Losa', 'Teja Chilena', 'Otro']),
    tipoMedidor: z.enum(['Normal', 'Reja/Fuera']),
  }),
  handler: async (input) => {
    const { montoBoleta, tipoTecho, tipoMedidor } = input;

    if (montoBoleta < LIMITE_INFERIOR) {
      return {
        estado: 'NO_VIABLE',
        mensaje: `El monto mínimo para un sistema solar es de $${LIMITE_INFERIOR.toLocaleString('es-CL')}. Contáctanos para otras opciones.`,
        precioFinal: 0,
      };
    }

    if (montoBoleta > LIMITE_SUPERIOR) {
      return {
        estado: 'EJECUTIVO',
        mensaje: 'Tu consumo es alto. Un ejecutivo te contactará para personalizar tu solución.',
        precioFinal: 0,
      };
    }

    const { data: kit, error } = await supabase
      .from('precios_kits')
      .select('*')
      .lte('consumo_bruto', montoBoleta)
      .order('consumo_bruto', { ascending: false })
      .limit(1)
      .single();

    if (error || !kit) {
      return {
        estado: 'ERROR',
        mensaje: 'No se encontró un kit compatible.',
        precioFinal: 0,
      };
    }

    let precioBase = Number(kit.precio_neto_base);
    let recargoTecho = 0;
    let factorTecho = 1;

    if (tipoTecho === 'Teja Chilena') {
      factorTecho = FACTOR_TEJA_CHILENA;
      recargoTecho = precioBase * (FACTOR_TEJA_CHILENA - 1);
    }

    let costoFijoMedidor = 0;
    if (tipoMedidor === 'Reja/Fuera') {
      costoFijoMedidor = COSTO_FIJO_MEDIDOR_REJA;
    }

    const precioSinIva = (precioBase * factorTecho) + costoFijoMedidor;
    const precioFinal = Math.round(precioSinIva * IVA);

    return {
      estado: 'OK',
      kit: {
        id: kit.id,
        consumoBruto: kit.consumo_bruto,
        amperajeNecesario: kit.amperaje_necesario,
        inversorKw: Number(kit.inversor_kw),
        paneles: kit.paneles,
        kwp: Number(kit.kwp),
        precioNetoBase: kit.precio_neto_base,
      },
      desglose: {
        precioBase,
        factorTecho,
        recargoTecho,
        costoFijoMedidor,
        precioSinIva,
        precioFinal,
      },
    };
  },
});
