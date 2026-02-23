import type { Kit, SimulationInput, SimulationResult, TipoTecho, TipoMedidor } from '../types/simulation';

const FACTOR_TEJA_CHILENA = 1.14;
const COSTO_FIJO_MEDIDOR_REJA = 350000;
const IVA = 1.19;
const LIMITE_INFERIOR = 50000;
const LIMITE_SUPERIOR = 230000;

export function findKitByConsumo(kits: Kit[], montoBoleta: number): Kit | null {
  if (montoBoleta < LIMITE_INFERIOR) {
    return null;
  }

  if (montoBoleta > LIMITE_SUPERIOR) {
    return null;
  }

  const sortedKits = [...kits].sort((a, b) => b.consumoBruto - a.consumoBruto);
  
  for (const kit of sortedKits) {
    if (kit.consumoBruto <= montoBoleta) {
      return kit;
    }
  }

  return null;
}

export function calculatePrice(
  kit: Kit,
  tipoTecho: TipoTecho,
  tipoMedidor: TipoMedidor
): Omit<SimulationResult, 'kit' | 'mensaje'> {
  const precioBase = kit.precioNetoBase;
  
  let factorTecho = 1.0;
  let recargoTecho = 0;
  
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
    precioBase,
    factorTecho,
    recargoTecho,
    costoFijoMedidor,
    precioSinIva,
    precioFinal,
  };
}

export function simulate(input: SimulationInput, kits: Kit[]): SimulationResult {
  const { montoBoleta, tipoTecho, tipoMedidor } = input;
  
  if (montoBoleta < LIMITE_INFERIOR) {
    return {
      kit: null as unknown as Kit,
      precioBase: 0,
      factorTecho: 1,
      recargoTecho: 0,
      costoFijoMedidor: 0,
      precioSinIva: 0,
      precioFinal: 0,
      requiereContactoEjecutivo: false,
      esNoViable: true,
      mensaje: `El monto mínimo para un sistema solar es de $${LIMITE_INFERIOR.toLocaleString('es-CL')}. Contáctanos para otras opciones.`,
    };
  }
  
  if (montoBoleta > LIMITE_SUPERIOR) {
    return {
      kit: null as unknown as Kit,
      precioBase: 0,
      factorTecho: 1,
      recargoTecho: 0,
      costoFijoMedidor: 0,
      precioSinIva: 0,
      precioFinal: 0,
      requiereContactoEjecutivo: true,
      esNoViable: false,
      mensaje: 'Tu consumo es alto. Un ejecutivo te contactará para personalizar tu solución.',
    };
  }
  
  const kit = findKitByConsumo(kits, montoBoleta);
  
  if (!kit) {
    return {
      kit: null as unknown as Kit,
      precioBase: 0,
      factorTecho: 1,
      recargoTecho: 0,
      costoFijoMedidor: 0,
      precioSinIva: 0,
      precioFinal: 0,
      requiereContactoEjecutivo: true,
      esNoViable: false,
      mensaje: 'No se encontró un kit compatible. Contáctanos.',
    };
  }
  
  const calculation = calculatePrice(kit, tipoTecho, tipoMedidor);
  
  return {
    kit,
    ...calculation,
    requiereContactoEjecutivo: false,
    esNoViable: false,
  };
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}
