import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { getSettings } from '../../lib/settings';
import {
  calculateQuoteWithROI,
  type QuoteInput,
  type QuoteSettings,
  type ComunaData,
  type QuoteResult
} from '../../lib/services/quote';
import type { Kit } from '../../lib/types/simulation';

export const prerender = false;

type RoofType = 'Losa' | 'Zinc/Pizarreño' | 'Teja Chilena' | 'Teja Asfáltica' | 'Teja Colonial' | 'Industrial' | 'Otro';
type MeterType = 'Muro de la casa' | 'Reja' | 'Fuera de la casa (Poste)';
type EstadoResultado = 'OK' | 'NO_VIABLE' | 'EJECUTIVO' | 'ERROR';

interface RequestBody {
  montoBoleta: number;
  comunaId: number;
  tipoTecho: RoofType;
  tipoMedidor: MeterType;
}

function mapDBToKit(dbKit: { id: string; consumo_bruto: number; precio_neto_base: number; kwp: number; inversor_kw: number; paneles: number }): Kit {
  return {
    id: dbKit.id,
    nombre: '',
    consumoBruto: dbKit.consumo_bruto,
    precioNetoBase: dbKit.precio_neto_base,
    kwp: dbKit.kwp,
    inversorKw: Number(dbKit.inversor_kw),
    paneles: dbKit.paneles,
  };
}

function mapSettingsToQuoteSettings(settings: Awaited<ReturnType<typeof getSettings>>): QuoteSettings {
  return {
    limiteInferior: Number(settings.limite_inferior),
    limiteSuperior: Number(settings.limite_superior),
    factorTeja: Number(settings.factor_teja),
    factorZincPizarreño: Number(settings.factor_zinc_pizarreño),
    factorTejaAsfaltica: Number(settings.factor_teja_asfaltica),
    factorTejaColonial: Number(settings.factor_teja_colonial),
    factorIndustrial: Number(settings.factor_industrial),
    costoMedidorReja: Number(settings.costo_medidor_reja),
    costoMedidorPoste: Number(settings.costo_medidor_poste),
    iva: Number(settings.iva),
    performanceRatio: Number(settings.performance_ratio),
  };
}

function mapComunaToQuoteComuna(comuna: { id: number; nombre: string; region: string; radiacion_ghi: number; tarifa_est: number }): ComunaData {
  return {
    id: comuna.id,
    nombre: comuna.nombre,
    region: comuna.region,
    radiacionGhi: Number(comuna.radiacion_ghi) || 5.5,
    tarifaEst: Number(comuna.tarifa_est) || 175,
  };
}

function mapQuoteResultToAPIResponse(result: QuoteResult): Record<string, unknown> {
  if (!result.calculo) {
    return {
      estado: result.estado,
      mensaje: result.mensaje,
      precioFinal: 0,
    };
  }

  return {
    estado: result.estado,
    mensaje: result.mensaje,
    input: result.input,
    datosComuna: result.datosComuna,
    kit: result.kit,
    calculo: {
      ...result.calculo,
      precioFinalIva: result.calculo.precioFinal,
    },
    resumenInversion: result.resumenInversion,
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const dbSettings = await getSettings();
    
    const body: RequestBody = await request.json();
    const { montoBoleta, comunaId, tipoTecho, tipoMedidor } = body;

    if (!montoBoleta || !comunaId || !tipoTecho || !tipoMedidor) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: comuna, error: errorComuna } = await supabase
      .from('comunas')
      .select('id, nombre, region, radiacion_ghi, tarifa_est')
      .eq('id', comunaId)
      .single();

    if (errorComuna || !comuna) {
      console.error('Error fetching comuna:', errorComuna);
      return new Response(JSON.stringify({
        estado: 'ERROR' as EstadoResultado,
        mensaje: 'No se encontró la comuna seleccionada.',
        precioFinal: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: kit, error: errorKit } = await supabase
      .from('precios_kits')
      .select('*')
      .lte('consumo_bruto', montoBoleta)
      .order('consumo_bruto', { ascending: false })
      .limit(1)
      .single();

    if (errorKit || !kit) {
      return new Response(JSON.stringify({
        estado: 'ERROR' as EstadoResultado,
        mensaje: 'No se encontró un kit compatible.',
        precioFinal: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const kits: Kit[] = [mapDBToKit(kit)];
    const quoteSettings = mapSettingsToQuoteSettings(dbSettings);
    const comunaData = mapComunaToQuoteComuna(comuna);

    const input: QuoteInput = {
      montoBoleta,
      comunaId,
      tipoTecho,
      tipoMedidor,
    };

    const result = calculateQuoteWithROI(input, kits, quoteSettings, comunaData);

    const response = mapQuoteResultToAPIResponse(result);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error calculating quote:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};