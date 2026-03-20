import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { getSettings } from '../../lib/settings';

export const prerender = false;

type TipoTecho = 'Losa' | 'Zinc/Pizarreño' | 'Teja Chilena' | 'Teja Asfáltica' | 'Teja Colonial' | 'Industrial' | 'Otro';
type TipoMedidor = 'Muro de la casa' | 'Reja' | 'Fuera de la casa (Poste)';
type EstadoResultado = 'OK' | 'NO_VIABLE' | 'EJECUTIVO' | 'ERROR';
type Clasificacion = 'ALTA_RETORNO' | 'MEDIO_RETORNO' | 'BAJA_RETORNO';

interface RequestBody {
  montoBoleta: number;
  comunaId: number;
  tipoTecho: TipoTecho;
  tipoMedidor: TipoMedidor;
}

function clasificarInversion(paybackAnos: number): Clasificacion {
  if (paybackAnos <= 5) return 'ALTA_RETORNO';
  if (paybackAnos <= 10) return 'MEDIO_RETORNO';
  return 'BAJA_RETORNO';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const settings = await getSettings();
    
    const body: RequestBody = await request.json();
    const { montoBoleta, comunaId, tipoTecho, tipoMedidor } = body;

    if (!montoBoleta || !comunaId || !tipoTecho || !tipoMedidor) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const limiteInferior = Number(settings.limite_inferior);
    const limiteSuperior = Number(settings.limite_superior);
    const factorTeja = Number(settings.factor_teja);
    const costoMedidorReja = Number(settings.costo_medidor_reja);
    const costoMedidorPoste = Number(settings.costo_medidor_poste);
    const iva = Number(settings.iva);
    const performanceRatio = Number(settings.performance_ratio);
    const factorZincPizarreño = Number(settings.factor_zinc_pizarreño);
    const factorTejaAsfaltica = Number(settings.factor_teja_asfaltica);
    const factorTejaColonial = Number(settings.factor_teja_colonial);
    const factorIndustrial = Number(settings.factor_industrial);
    
    if (montoBoleta < limiteInferior) {
      return new Response(JSON.stringify({
        estado: 'NO_VIABLE' as EstadoResultado,
        mensaje: `El monto mínimo para un sistema solar es de $${limiteInferior.toLocaleString('es-CL')}. Contáctanos para otras opciones.`,
        precioFinal: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (montoBoleta > limiteSuperior) {
      return new Response(JSON.stringify({
        estado: 'EJECUTIVO' as EstadoResultado,
        mensaje: 'Tu consumo es alto. Un ejecutivo te contactará para personalizar tu solución.',
        precioFinal: 0,
      }), {
        status: 200,
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

    const radiacionGhi = Number(comuna.radiacion_ghi) || 5.5;
    const tarifaEst = Number(comuna.tarifa_est) || 175;

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

    const precioBase = Number(kit.precio_neto_base);
    const kwp = Number(kit.kwp);
    
    let factorTecho = 1;
    let recargoTecho = 0;
    
    switch (tipoTecho) {
      case 'Zinc/Pizarreño':
        factorTecho = factorZincPizarreño;
        break;
      case 'Teja Chilena':
        factorTecho = factorTeja;
        recargoTecho = precioBase * (factorTeja - 1); // 1.142 - 1 = 0.142
        break;
      case 'Teja Asfáltica':
        factorTecho = factorTejaAsfaltica;
        recargoTecho = precioBase * (factorTejaAsfaltica - 1); // 1.05 - 1 = 0.05
        break;
      case 'Teja Colonial':
        factorTecho = factorTejaColonial;
        recargoTecho = precioBase * (factorTejaColonial - 1); // 1.12 - 1 = 0.12
        break;
      case 'Industrial':
        factorTecho = factorIndustrial;
        break;
      default: // Losa, Otro
        factorTecho = 1;
        break;
    }

    let costoMedidor = 0;
    if (tipoMedidor === 'Reja') {
      costoMedidor = costoMedidorReja;
    } else if (tipoMedidor === 'Fuera de la casa (Poste)') {
      costoMedidor = costoMedidorPoste;
    }

    const precioSinIva = (precioBase * factorTecho) + costoMedidor;
    const precioFinalIva = Math.round(precioSinIva * iva);

    // Cálculos de ROI
    const consumoKwhAnual = (montoBoleta / tarifaEst) * 12;
    const generacionAnualKwh = kwp * radiacionGhi * 365 * performanceRatio;
    const ahorroAnual = Math.min(generacionAnualKwh, consumoKwhAnual) * tarifaEst;
    const ahorroMensual = ahorroAnual / 12;
    const coberturaPorcentaje = Math.min((generacionAnualKwh / consumoKwhAnual) * 100, 95);
    
    const paybackAnos = ahorroAnual > 0 ? precioFinalIva / ahorroAnual : 999;
    const clasificacion = clasificarInversion(paybackAnos);

    const response = {
      estado: 'OK' as EstadoResultado,
      mensaje: null,
      input: {
        montoBoleta,
        comunaId,
        tipoTecho,
        tipoMedidor
      },
      datosComuna: {
        id: comuna.id,
        nombre: comuna.nombre,
        region: comuna.region,
        radiacionGhi,
        tarifaEst
      },
      kit: {
        id: kit.id,
        consumoBruto: kit.consumo_bruto,
        inversorKw: Number(kit.inversor_kw),
        paneles: kit.paneles,
        kwp,
        precioNetoBase: kit.precio_neto_base
      },
      calculo: {
        consumoKwhAnual: Math.round(consumoKwhAnual),
        generacionAnualKwh: Math.round(generacionAnualKwh),
        ahorroAnual: Math.round(ahorroAnual),
        ahorroMensual: Math.round(ahorroMensual),
        coberturaPorcentaje: Math.round(coberturaPorcentaje * 10) / 10,
        precioBase,
        factorTecho,
        recargoTecho,
        costoMedidor,
        precioSinIva,
        iva: Math.round(precioSinIva * (iva - 1)),
        precioFinalIva,
        paybackAnos: Math.round(paybackAnos * 10) / 10
      },
      resumenInversion: {
        ahorroMensual: Math.round(ahorroMensual),
        ahorroAnual: Math.round(ahorroAnual),
        inversionTotal: precioFinalIva,
        anosRecuperacion: Math.round(paybackAnos * 10) / 10,
        cobertura: Math.round(coberturaPorcentaje * 10) / 10,
        clasificacion
      }
    };

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
