import { describe, it, expect } from 'vitest';
import {
  getDefaultSettings,
  classifyInvestment,
  calculateRoofFactor,
  calculateMeterCost,
  findBestKit,
  calculatePriceBreakdown,
  calculateROI,
  calculateQuote,
  calculateQuoteWithROI,
  formatCLP,
} from './quote';
import type { RoofType, MeterType, QuoteSettings, QuoteInput, ComunaData } from './quote';
import type { Kit } from '../../types/simulation';

const mockKits: Kit[] = [
  { id: 1, consumoBruto: 50000, amperajeNecesario: '10 A', inversorKw: 3.0, paneles: 6, kwp: 3.30, precioNetoBase: 4990000 },
  { id: 2, consumoBruto: 60000, amperajeNecesario: '10 A', inversorKw: 3.0, paneles: 8, kwp: 4.40, precioNetoBase: 5990000 },
  { id: 3, consumoBruto: 70000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 8, kwp: 4.40, precioNetoBase: 6990000 },
  { id: 4, consumoBruto: 80000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 10, kwp: 5.50, precioNetoBase: 7990000 },
  { id: 5, consumoBruto: 90000, amperajeNecesario: '10 A', inversorKw: 5.0, paneles: 10, kwp: 5.50, precioNetoBase: 8990000 },
  { id: 6, consumoBruto: 100000, amperajeNecesario: '15 A', inversorKw: 5.0, paneles: 12, kwp: 6.60, precioNetoBase: 9990000 },
  { id: 7, consumoBruto: 230000, amperajeNecesario: '40 A', inversorKw: 20.0, paneles: 26, kwp: 14.30, precioNetoBase: 22990000 },
];

const defaultSettings = getDefaultSettings();

const mockComuna: ComunaData = {
  id: 1,
  nombre: 'Santiago',
  region: 'Metropolitana',
  radiacionGhi: 5.0,
  tarifaEst: 150,
};

describe('getDefaultSettings', () => {
  it('retorna todos los valores por defecto', () => {
    const settings = getDefaultSettings();
    expect(settings.limiteInferior).toBe(50000);
    expect(settings.limiteSuperior).toBe(230000);
    expect(settings.factorTeja).toBe(1.14);
    expect(settings.factorZincPizarreño).toBe(1.07);
    expect(settings.factorTejaAsfaltica).toBe(1.05);
    expect(settings.factorTejaColonial).toBe(1.12);
    expect(settings.factorIndustrial).toBe(1.10);
    expect(settings.costoMedidorReja).toBe(350000);
    expect(settings.costoMedidorPoste).toBe(550000);
    expect(settings.iva).toBe(1.19);
    expect(settings.performanceRatio).toBe(0.75);
  });
});

describe('classifyInvestment', () => {
  it('clasifica como ALTA_RETORNO cuando payback <= 5 años', () => {
    expect(classifyInvestment(3)).toBe('ALTA_RETORNO');
    expect(classifyInvestment(5)).toBe('ALTA_RETORNO');
    expect(classifyInvestment(0)).toBe('ALTA_RETORNO');
  });

  it('clasifica como MEDIO_RETORNO cuando payback entre 5 y 10 años', () => {
    expect(classifyInvestment(6)).toBe('MEDIO_RETORNO');
    expect(classifyInvestment(10)).toBe('MEDIO_RETORNO');
    expect(classifyInvestment(7.5)).toBe('MEDIO_RETORNO');
  });

  it('clasifica como BAJA_RETORNO cuando payback > 10 años', () => {
    expect(classifyInvestment(11)).toBe('BAJA_RETORNO');
    expect(classifyInvestment(20)).toBe('BAJA_RETORNO');
    expect(classifyInvestment(100)).toBe('BAJA_RETORNO');
  });

  it('en el boundary exacto de 5 años sigue siendo ALTA_RETORNO', () => {
    expect(classifyInvestment(5)).toBe('ALTA_RETORNO');
  });

  it('en el boundary exacto de 10 años es MEDIO_RETORNO', () => {
    expect(classifyInvestment(10)).toBe('MEDIO_RETORNO');
  });
});

describe('calculateRoofFactor', () => {
  it('Losa tiene factor 1 y recargo 0 (sin recargo)', () => {
    const result = calculateRoofFactor('Losa', defaultSettings);
    expect(result.factorTecho).toBe(1);
    expect(result.recargoTecho).toBe(0);
  });

  it('Zinc/Pizarreño aplica factor 1.07', () => {
    const result = calculateRoofFactor('Zinc/Pizarreño', defaultSettings);
    expect(result.factorTecho).toBe(1.07);
    expect(result.recargoTecho).toBe(0);
  });

  it('Teja Chilena aplica factor 1.14', () => {
    const result = calculateRoofFactor('Teja Chilena', defaultSettings);
    expect(result.factorTecho).toBe(1.14);
    expect(result.recargoTecho).toBe(0);
  });

  it('Teja Asfáltica aplica factor 1.05', () => {
    const result = calculateRoofFactor('Teja Asfáltica', defaultSettings);
    expect(result.factorTecho).toBe(1.05);
    expect(result.recargoTecho).toBe(0);
  });

  it('Teja Colonial aplica factor 1.12', () => {
    const result = calculateRoofFactor('Teja Colonial', defaultSettings);
    expect(result.factorTecho).toBe(1.12);
    expect(result.recargoTecho).toBe(0);
  });

  it('Industrial aplica factor 1.10', () => {
    const result = calculateRoofFactor('Industrial', defaultSettings);
    expect(result.factorTecho).toBe(1.10);
    expect(result.recargoTecho).toBe(0);
  });

  it('Otro tiene factor 1 y recargo 0 (sin recargo)', () => {
    const result = calculateRoofFactor('Otro', defaultSettings);
    expect(result.factorTecho).toBe(1);
    expect(result.recargoTecho).toBe(0);
  });

  it('usa settings personalizados para factores de techo', () => {
    const customSettings: QuoteSettings = {
      ...defaultSettings,
      factorTeja: 1.20,
      factorZincPizarreño: 1.15,
      factorTejaAsfaltica: 1.10,
      factorTejaColonial: 1.18,
      factorIndustrial: 1.13,
    };
    expect(calculateRoofFactor('Teja Chilena', customSettings).factorTecho).toBe(1.20);
    expect(calculateRoofFactor('Zinc/Pizarreño', customSettings).factorTecho).toBe(1.15);
    expect(calculateRoofFactor('Teja Asfáltica', customSettings).factorTecho).toBe(1.10);
    expect(calculateRoofFactor('Teja Colonial', customSettings).factorTecho).toBe(1.18);
    expect(calculateRoofFactor('Industrial', customSettings).factorTecho).toBe(1.13);
  });

  it('siempre retorna recargoTecho = 0 para todos los tipos de techo', () => {
    const allTypes: RoofType[] = [
      'Losa', 'Zinc/Pizarreño', 'Teja Chilena', 'Teja Asfáltica',
      'Teja Colonial', 'Industrial', 'Otro',
    ];
    for (const tipo of allTypes) {
      expect(calculateRoofFactor(tipo, defaultSettings).recargoTecho).toBe(0);
    }
  });
});

describe('calculateMeterCost', () => {
  it('Muro de la casa retorna 0 (sin costo adicional)', () => {
    expect(calculateMeterCost('Muro de la casa', defaultSettings)).toBe(0);
  });

  it('Reja retorna costo fijo de $350.000', () => {
    expect(calculateMeterCost('Reja', defaultSettings)).toBe(350000);
  });

  it('Fuera de la casa (Poste) retorna costo fijo de $550.000', () => {
    expect(calculateMeterCost('Fuera de la casa (Poste)', defaultSettings)).toBe(550000);
  });

  it('usa settings personalizados para costos de medidor', () => {
    const customSettings: QuoteSettings = {
      ...defaultSettings,
      costoMedidorReja: 400000,
      costoMedidorPoste: 600000,
    };
    expect(calculateMeterCost('Reja', customSettings)).toBe(400000);
    expect(calculateMeterCost('Fuera de la casa (Poste)', customSettings)).toBe(600000);
    expect(calculateMeterCost('Muro de la casa', customSettings)).toBe(0);
  });
});

describe('findBestKit', () => {
  it('retorna null cuando monto está debajo del límite inferior', () => {
    expect(findBestKit(mockKits, 49999)).toBeNull();
  });

  it('retorna null cuando monto está arriba del límite superior', () => {
    expect(findBestKit(mockKits, 230001)).toBeNull();
  });

  it('retorna null cuando monto es exactamente 0', () => {
    expect(findBestKit(mockKits, 0)).toBeNull();
  });

  it('retorna null cuando monto es negativo', () => {
    expect(findBestKit(mockKits, -1000)).toBeNull();
  });

  it('retorna kit correcto cuando monto es exactamente el límite inferior (50000)', () => {
    const kit = findBestKit(mockKits, 50000);
    expect(kit).not.toBeNull();
    expect(kit!.id).toBe(1);
    expect(kit!.consumoBruto).toBe(50000);
  });

  it('retorna kit correcto cuando monto es exactamente el límite superior (230000)', () => {
    const kit = findBestKit(mockKits, 230000);
    expect(kit).not.toBeNull();
    expect(kit!.id).toBe(7);
  });

  it('selecciona el mayor consumoBruto que no exceda el monto', () => {
    const kit = findBestKit(mockKits, 85000);
    expect(kit).not.toBeNull();
    expect(kit!.consumoBruto).toBe(80000);
    expect(kit!.id).toBe(4);
  });

  it('selecciona kit correctopara monto que coincide exactamente con un kit', () => {
    const kit = findBestKit(mockKits, 80000);
    expect(kit).not.toBeNull();
    expect(kit!.consumoBruto).toBe(80000);
  });

  it('retorna null cuando ningún kit tiene consumoBruto menor o igual al monto', () => {
    const smallKits: Kit[] = [
      { id: 99, consumoBruto: 80000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 10, kwp: 5.50, precioNetoBase: 7990000 },
    ];
    expect(findBestKit(smallKits, 50000)).toBeNull();
  });

  it('retorna null con array de kits vacío', () => {
    expect(findBestKit([], 80000)).toBeNull();
  });

  it('maneja correctamente montos intermedios entre kits', () => {
    const kit = findBestKit(mockKits, 95000);
    expect(kit!.consumoBruto).toBe(90000);
    expect(kit!.id).toBe(5);
  });

  it('no muta el array original de kits', () => {
    const kitsCopy = [...mockKits];
    findBestKit(mockKits, 80000);
    expect(mockKits.map(k => k.id)).toEqual(kitsCopy.map(k => k.id));
  });
});

describe('calculatePriceBreakdown', () => {
  it('calcula desglose completo con Losa y sin medidor adicional', () => {
    const result = calculatePriceBreakdown(7990000, 1, 0, 0, 1.19);
    expect(result.precioBase).toBe(7990000);
    expect(result.factorTecho).toBe(1);
    expect(result.recargoTecho).toBe(0);
    expect(result.costoMedidor).toBe(0);
    expect(result.precioSinIva).toBe(7990000);
    expect(result.iva).toBe(Math.round(7990000 * 0.19));
    expect(result.precioFinal).toBe(Math.round(7990000 * 1.19));
  });

  it('aplica factor de techo correctamente', () => {
    const result = calculatePriceBreakdown(7990000, 1.14, 0, 0, 1.19);
    expect(result.precioBase).toBe(7990000);
    expect(result.factorTecho).toBe(1.14);
    expect(result.precioSinIva).toBe(Math.round(7990000 * 1.14));
  });

  it('suma costo de medidor al precio sin IVA', () => {
    const result = calculatePriceBreakdown(7990000, 1, 0, 350000, 1.19);
    expect(result.costoMedidor).toBe(350000);
    expect(result.precioSinIva).toBe(7990000 + 350000);
  });

  it('calcula IVA correctamente como 19% del precio sin IVA', () => {
    const precioSinIva = 7990000;
    const result = calculatePriceBreakdown(precioSinIva, 1, 0, 0, 1.19);
    expect(result.iva).toBe(Math.round(precioSinIva * 0.19));
  });

  it('calcula precio final correctamente redondeado', () => {
    const result = calculatePriceBreakdown(7990000, 1.14, 0, 350000, 1.19);
    const expectedSinIva = 7990000 * 1.14 + 350000;
    const expectedFinal = Math.round(expectedSinIva * 1.19);
    expect(result.precioSinIva).toBeCloseTo(expectedSinIva, 0);
    expect(result.precioFinal).toBe(expectedFinal);
  });

  it('maneja factor de techo + recargo + medidor combinados', () => {
    const result = calculatePriceBreakdown(7990000, 1.14, 0, 550000, 1.19);
    const expectedSinIva = 7990000 * 1.14 + 0 + 550000;
    const expectedFinal = Math.round(expectedSinIva * 1.19);
    expect(result.precioSinIva).toBeCloseTo(expectedSinIva, 0);
    expect(result.precioFinal).toBe(expectedFinal);
  });

  it('con recargoTecho = 0, el precio es solo factor * base + medidor', () => {
    const result = calculatePriceBreakdown(5000000, 1, 0, 0, 1.19);
    expect(result.precioSinIva).toBe(5000000);
    expect(result.precioFinal).toBe(Math.round(5000000 * 1.19));
  });
});

describe('calculateROI', () => {
  it('calcula ROI completo con valores típicos', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    expect(result.consumoKwhAnual).toBeGreaterThan(0);
    expect(result.generacionAnualKwh).toBeGreaterThan(0);
    expect(result.ahorroAnual).toBeGreaterThan(0);
    expect(result.ahorroMensual).toBeGreaterThan(0);
    expect(result.coberturaPorcentaje).toBeGreaterThan(0);
    expect(result.paybackAnos).toBeGreaterThan(0);
  });

  it('calcula consumoKwhAnual como (montoBoleta / tarifaEst) * 12', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const expected = Math.round((80000 / 150) * 12);
    expect(result.consumoKwhAnual).toBe(expected);
  });

  it('calcula generacionAnualKwh como kwp * radiacionGhi * 365 * performanceRatio', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const expected = Math.round(5.5 * 5.0 * 365 * 0.75);
    expect(result.generacionAnualKwh).toBe(expected);
  });

  it('calcula ahorro como el menor entre generación y consumo * tarifa', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const consumoKwh = (80000 / 150) * 12;
    const generacionKwh = 5.5 * 5.0 * 365 * 0.75;
    const expectedAhorro = Math.min(generacionKwh, consumoKwh) * 150;
    expect(result.ahorroAnual).toBe(Math.round(expectedAhorro));
  });

  it('calcula cobertura máxima al 95%', () => {
    const result = calculateROI(50000, 14.3, 30000000, 6.0, 100, 0.75);
    expect(result.coberturaPorcentaje).toBeLessThanOrEqual(95);
  });

  it('limita la cobertura al 95% cuando la generación excede el consumo', () => {
    const result = calculateROI(50000, 14.3, 30000000, 6.0, 100, 0.75);
    if (result.coberturaPorcentaje >= 94.9) {
      expect(result.coberturaPorcentaje).toBe(95);
    }
  });

  it('retorna payback 999 cuando ahorroAnual es 0 o negativo', () => {
    const result = calculateROI(80000, 5.5, 10000000, 0, 0, 0.75);
    expect(result.paybackAnos).toBe(999);
  });

  it('calcula payback como precioFinal / ahorroAnual', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const consumoKwh = (80000 / 150) * 12;
    const generacionKwh = 5.5 * 5.0 * 365 * 0.75;
    const ahorro = Math.min(generacionKwh, consumoKwh) * 150;
    const expectedPayback = Math.round((10000000 / ahorro) * 10) / 10;
    expect(result.paybackAnos).toBe(expectedPayback);
  });

  it('redondea consumoKwhAnual al entero más cercano', () => {
    const result = calculateROI(55555, 5.5, 10000000, 5.0, 150, 0.75);
    expect(Number.isInteger(result.consumoKwhAnual)).toBe(true);
  });

  it('redondea generacionAnualKwh al entero más cercano', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    expect(Number.isInteger(result.generacionAnualKwh)).toBe(true);
  });

  it('redondea coberturaPorcentaje a 1 decimal', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const decimals = (result.coberturaPorcentaje.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });

  it('redondea paybackAnos a 1 decimal', () => {
    const result = calculateROI(80000, 5.5, 10000000, 5.0, 150, 0.75);
    const decimals = (result.paybackAnos.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});

describe('calculateQuote', () => {
  const baseInput: QuoteInput = {
    montoBoleta: 80000,
    comunaId: 1,
    tipoTecho: 'Losa',
    tipoMedidor: 'Muro de la casa',
  };

  it('retorna NO_VIABLE cuando monto está debajo del límite inferior', async () => {
    const input = { ...baseInput, montoBoleta: 40000 };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('NO_VIABLE');
    expect(result.mensaje).toContain('50.000');
    expect(result.kit).toBeUndefined();
    expect(result.calculo).toBeUndefined();
  });

  it('retorna EJECUTIVO cuando monto está arriba del límite superior', async () => {
    const input = { ...baseInput, montoBoleta: 250000 };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('EJECUTIVO');
    expect(result.mensaje).toContain('ejecutivo');
    expect(result.kit).toBeUndefined();
  });

  it('retorna ERROR cuando no hay kit compatible', async () => {
    const smallKits: Kit[] = [
      { id: 99, consumoBruto: 80000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 10, kwp: 5.50, precioNetoBase: 7990000 },
    ];
    const input = { ...baseInput, montoBoleta: 50000 };
    const result = await calculateQuote(input, smallKits, defaultSettings);
    expect(result.estado).toBe('ERROR');
    expect(result.mensaje).toContain('kit');
  });

  it('retorna OK con cálculos correctos para monto válido y Losa', async () => {
    const result = await calculateQuote(baseInput, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
    expect(result.mensaje).toBeNull();
    expect(result.kit).not.toBeUndefined();
    expect(result.kit!.id).toBe(4);
  });

  it('retorna OK con tipo de techo Teja Chilena aplicando factor', async () => {
    const input: QuoteInput = { ...baseInput, tipoTecho: 'Teja Chilena' };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
    expect(result.calculo!.factorTecho).toBe(1.14);
  });

  it('retorna OK con tipo de medidor Reja sumando costo', async () => {
    const input: QuoteInput = { ...baseInput, tipoMedidor: 'Reja' };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
    expect(result.calculo!.costoMedidor).toBe(350000);
  });

  it('retorna OK con tipo de medidor Fuera de la casa (Poste) sumando costo', async () => {
    const input: QuoteInput = { ...baseInput, tipoMedidor: 'Fuera de la casa (Poste)' };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
    expect(result.calculo!.costoMedidor).toBe(550000);
  });

  it('en boundary: monto exactamente 50000 es válido', async () => {
    const input = { ...baseInput, montoBoleta: 50000 };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
    expect(result.kit).not.toBeUndefined();
  });

  it('en boundary: monto exactamente 230000 es válido', async () => {
    const input = { ...baseInput, montoBoleta: 230000 };
    const result = await calculateQuote(input, mockKits, defaultSettings);
    expect(result.estado).toBe('OK');
  });

  it('los campos de ROI quedan en 0 (sin comuna no se calcula ROI)', async () => {
    const result = await calculateQuote(baseInput, mockKits, defaultSettings);
    expect(result.calculo!.consumoKwhAnual).toBe(0);
    expect(result.calculo!.generacionAnualKwh).toBe(0);
    expect(result.calculo!.ahorroAnual).toBe(0);
    expect(result.calculo!.ahorroMensual).toBe(0);
    expect(result.calculo!.coberturaPorcentaje).toBe(0);
    expect(result.calculo!.paybackAnos).toBe(0);
  });

  it('preserva el input original en el resultado', async () => {
    const result = await calculateQuote(baseInput, mockKits, defaultSettings);
    expect(result.input).toEqual(baseInput);
  });

  it('usa límites personalizados de settings', async () => {
    const customSettings: QuoteSettings = {
      ...defaultSettings,
      limiteInferior: 60000,
    };
    const input = { ...baseInput, montoBoleta: 55000 };
    const result = await calculateQuote(input, mockKits, customSettings);
    expect(result.estado).toBe('NO_VIABLE');
  });

  it('usa límite superior personalizado de settings', async () => {
    const customSettings: QuoteSettings = {
      ...defaultSettings,
      limiteSuperior: 200000,
    };
    const input = { ...baseInput, montoBoleta: 220000 };
    const result = await calculateQuote(input, mockKits, customSettings);
    expect(result.estado).toBe('EJECUTIVO');
  });
});

describe('calculateQuoteWithROI', () => {
  const baseInput: QuoteInput = {
    montoBoleta: 80000,
    comunaId: 1,
    tipoTecho: 'Losa',
    tipoMedidor: 'Muro de la casa',
  };

  it('retorna NO_VIABLE cuando monto está debajo del límite inferior', () => {
    const input = { ...baseInput, montoBoleta: 40000 };
    const result = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
    expect(result.estado).toBe('NO_VIABLE');
    expect(result.datosComuna).toBeUndefined();
  });

  it('retorna EJECUTIVO cuando monto excede el límite superior', () => {
    const input = { ...baseInput, montoBoleta: 250000 };
    const result = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
    expect(result.estado).toBe('EJECUTIVO');
  });

  it('retorna ERROR cuando no hay kit compatible', () => {
    const smallKits: Kit[] = [
      { id: 99, consumoBruto: 80000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 10, kwp: 5.50, precioNetoBase: 7990000 },
    ];
    const input = { ...baseInput, montoBoleta: 50000 };
    const result = calculateQuoteWithROI(input, smallKits, defaultSettings, mockComuna);
    expect(result.estado).toBe('ERROR');
  });

  it('retorna OK con ROI completo para monto válido', () => {
    const result = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    expect(result.estado).toBe('OK');
    expect(result.calculo!.consumoKwhAnual).toBeGreaterThan(0);
    expect(result.calculo!.generacionAnualKwh).toBeGreaterThan(0);
    expect(result.calculo!.ahorroAnual).toBeGreaterThan(0);
    expect(result.calculo!.ahorroMensual).toBeGreaterThan(0);
    expect(result.calculo!.coberturaPorcentaje).toBeGreaterThan(0);
    expect(result.calculo!.paybackAnos).toBeGreaterThan(0);
  });

  it('incluye datosComuna en el resultado', () => {
    const result = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    expect(result.datosComuna).toEqual(mockComuna);
  });

  it('incluye resumen de inversión con clasificación', () => {
    const result = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    expect(result.resumenInversion).not.toBeUndefined();
    expect(result.resumenInversion!.inversionTotal).toBeGreaterThan(0);
    expect(result.resumenInversion!.ahorroMensual).toBeGreaterThan(0);
    expect(result.resumenInversion!.ahorroAnual).toBeGreaterThan(0);
    expect(result.resumenInversion!.anosRecuperacion).toBeGreaterThan(0);
    expect(result.resumenInversion!.cobertura).toBeGreaterThan(0);
    expect(['ALTA_RETORNO', 'MEDIO_RETORNO', 'BAJA_RETORNO']).toContain(result.resumenInversion!.clasificacion);
  });

  it('clasifica inversión correctamente según payback', () => {
    const result = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    const payback = result.resumenInversion!.anosRecuperacion;
    if (payback <= 5) {
      expect(result.resumenInversion!.clasificacion).toBe('ALTA_RETORNO');
    } else if (payback <= 10) {
      expect(result.resumenInversion!.clasificacion).toBe('MEDIO_RETORNO');
    } else {
      expect(result.resumenInversion!.clasificacion).toBe('BAJA_RETORNO');
    }
  });

  it('aplica factor de techo Teja Chilena correctamente al precio final', () => {
    const input: QuoteInput = { ...baseInput, tipoTecho: 'Teja Chilena' };
    const resultLosa = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    const resultTeja = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
    expect(resultTeja.calculo!.factorTecho).toBe(1.14);
    expect(resultTeja.calculo!.precioSinIva).toBeGreaterThan(resultLosa.calculo!.precioSinIva);
  });

  it('aplica costo de medidor Poste correctamente', () => {
    const input: QuoteInput = { ...baseInput, tipoMedidor: 'Fuera de la casa (Poste)' };
    const result = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
    expect(result.calculo!.costoMedidor).toBe(550000);
  });

  it('calcula ROI consistente con calculateROI directamente', () => {
    const result = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    const kit = mockKits[3]; // kit id 4, consumoBruto 80000
    const { factorTecho, recargoTecho } = calculateRoofFactor('Losa', defaultSettings);
    const costoMedidor = calculateMeterCost('Muro de la casa', defaultSettings);
    const breakdown = calculatePriceBreakdown(kit.precioNetoBase, factorTecho, recargoTecho, costoMedidor, defaultSettings.iva);
    const roi = calculateROI(80000, kit.kwp, breakdown.precioFinal, mockComuna.radiacionGhi, mockComuna.tarifaEst, defaultSettings.performanceRatio);

    expect(result.calculo!.consumoKwhAnual).toBe(roi.consumoKwhAnual);
    expect(result.calculo!.generacionAnualKwh).toBe(roi.generacionAnualKwh);
    expect(result.calculo!.ahorroAnual).toBe(roi.ahorroAnual);
    expect(result.calculo!.ahorroMensual).toBe(roi.ahorroMensual);
    expect(result.calculo!.coberturaPorcentaje).toBe(roi.coberturaPorcentaje);
    expect(result.calculo!.paybackAnos).toBe(roi.paybackAnos);
  });

  it('todos los tipos de techo producen resultados válidos', () => {
    const tipos: RoofType[] = ['Losa', 'Zinc/Pizarreño', 'Teja Chilena', 'Teja Asfáltica', 'Teja Colonial', 'Industrial', 'Otro'];
    for (const tipo of tipos) {
      const input: QuoteInput = { ...baseInput, tipoTecho: tipo };
      const result = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
      expect(result.estado).toBe('OK');
      expect(result.calculo!.precioFinal).toBeGreaterThan(0);
    }
  });

  it('todos los tipos de medidor producen resultados válidos', () => {
    const tipos: MeterType[] = ['Muro de la casa', 'Reja', 'Fuera de la casa (Poste)'];
    for (const tipo of tipos) {
      const input: QuoteInput = { ...baseInput, tipoMedidor: tipo };
      const result = calculateQuoteWithROI(input, mockKits, defaultSettings, mockComuna);
      expect(result.estado).toBe('OK');
      expect(result.calculo!.precioFinal).toBeGreaterThan(0);
    }
  });

  it('usa performance ratio personalizado de settings', () => {
    const customSettings: QuoteSettings = { ...defaultSettings, performanceRatio: 0.85 };
    const resultDefault = calculateQuoteWithROI(baseInput, mockKits, defaultSettings, mockComuna);
    const resultCustom = calculateQuoteWithROI(baseInput, mockKits, customSettings, mockComuna);
    expect(resultCustom.calculo!.generacionAnualKwh).not.toBe(resultDefault.calculo!.generacionAnualKwh);
  });
});

describe('formatCLP', () => {
  it('formatea 100000 como $100.000', () => {
    expect(formatCLP(100000)).toBe('$100.000');
  });

  it('formatea 0 como $0', () => {
    expect(formatCLP(0)).toBe('$0');
  });

  it('formatea 1000000 como $1.000.000', () => {
    expect(formatCLP(1000000)).toBe('$1.000.000');
  });

  it('formatea valores pequeños con decimales truncados', () => {
    expect(formatCLP(499.99)).toBe('$500');
  });

  it('formatea números negativos correctamente', () => {
    const result = formatCLP(-10000);
    expect(result).toContain('10.000');
  });
});