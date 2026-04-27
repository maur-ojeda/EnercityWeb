import { defineAction, z } from 'astro:actions';
import { supabase } from '../lib/supabase';
import { calculateQuote as calculateQuoteService, getDefaultSettings, type QuoteInput } from '../lib/services/quote';
import type { Kit } from '../types/simulation';

const LIMITE_INFERIOR = 50000;
const LIMITE_SUPERIOR = 230000;

export const calculateQuote = defineAction({
  input: z.object({
    montoBoleta: z.number().min(1),
    tipoTecho: z.enum(['Losa', 'Teja Chilena', 'Otro']),
    tipoMedidor: z.enum(['Normal', 'Reja/Fuera']),
  }),
  handler: async (input) => {
    const { montoBoleta } = input;

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

    const { data: kits, error: fetchError } = await supabase
      .from('precios_kits')
      .select('*')
      .lte('consumo_bruto', montoBoleta)
      .order('consumo_bruto', { ascending: false });

    if (fetchError || !kits || kits.length === 0) {
      return {
        estado: 'ERROR',
        mensaje: 'No se encontró un kit compatible.',
        precioFinal: 0,
      };
    }

    const typedKits: Kit[] = kits.map((k) => ({
      id: k.id,
      consumoBruto: k.consumo_bruto,
      amperajeNecesario: k.amperaje_necesario,
      inversorKw: Number(k.inversor_kw),
      paneles: k.paneles,
      kwp: Number(k.kwp),
      precioNetoBase: k.precio_neto_base,
    }));

    const tipoMedidorMap: Record<string, 'Muro de la casa' | 'Reja' | 'Fuera de la casa (Poste)'> = 
      input.tipoMedidor === 'Reja/Fuera' ? 'Reja' : 'Muro de la casa';
    const tipoTechoMap: Record<string, 'Losa' | 'Teja Chilena' | 'Otro'> =
      input.tipoTecho as 'Losa' | 'Teja Chilena' | 'Otro';

    const quoteInput: QuoteInput = {
      montoBoleta,
      comunaId: 1,
      tipoTecho: tipoTechoMap,
      tipoMedidor: tipoMedidorMap,
    };

    const result = await calculateQuoteService(quoteInput, typedKits, getDefaultSettings());

    if (result.estado !== 'OK' || !result.kit || !result.calculo) {
      return {
        estado: result.estado,
        mensaje: result.mensaje,
        precioFinal: 0,
      };
    }

    const kit = typedKits.find((k) => k.id === result.kit!.id);

    return {
      estado: result.estado,
      kit: {
        id: result.kit.id,
        consumoBruto: result.kit.consumoBruto,
        amperajeNecesario: kit?.amperajeNecesario || 0,
        inversorKw: result.kit.inversorKw,
        paneles: result.kit.paneles,
        kwp: result.kit.kwp,
        precioNetoBase: result.kit.precioNetoBase,
      },
      desglose: {
        precioBase: result.calculo.precioBase,
        factorTecho: result.calculo.factorTecho,
        recargoTecho: result.calculo.recargoTecho,
        costoFijoMedidor: result.calculo.costoMedidor,
        precioSinIva: result.calculo.precioSinIva,
        precioFinal: result.calculo.precioFinal,
      },
    };
  },
});