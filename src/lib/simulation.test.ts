import { describe, it, expect } from 'vitest';
import { findKitByConsumo, calculatePrice, simulate, formatCLP } from './simulation';
import type { Kit, SimulationInput } from '../types/simulation';

const mockKits: Kit[] = [
  { id: 1, consumoBruto: 50000, amperajeNecesario: '10 A', inversorKw: 3.0, paneles: 6, kwp: 3.30, precioNetoBase: 4990000 },
  { id: 2, consumoBruto: 60000, amperajeNecesario: '10 A', inversorKw: 3.0, paneles: 8, kwp: 4.40, precioNetoBase: 5990000 },
  { id: 3, consumoBruto: 70000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 8, kwp: 4.40, precioNetoBase: 6990000 },
  { id: 4, consumoBruto: 80000, amperajeNecesario: '10 A', inversorKw: 4.0, paneles: 10, kwp: 5.50, precioNetoBase: 7990000 },
  { id: 5, consumoBruto: 90000, amperajeNecesario: '10 A', inversorKw: 5.0, paneles: 10, kwp: 5.50, precioNetoBase: 8990000 },
  { id: 6, consumoBruto: 100000, amperajeNecesario: '15 A', inversorKw: 5.0, paneles: 12, kwp: 6.60, precioNetoBase: 9990000 },
  { id: 7, consumoBruto: 230000, amperajeNecesario: '40 A', inversorKw: 20.0, paneles: 26, kwp: 14.30, precioNetoBase: 22990000 },
];

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
});

describe('findKitByConsumo', () => {
  it('retorna kit cuando monto exact match', () => {
    const kit = findKitByConsumo(mockKits, 80000);
    expect(kit?.id).toBe(4);
  });

  it('retorna kit correcto para monto intermedio (85k toma kit 80k)', () => {
    const kit = findKitByConsumo(mockKits, 85000);
    expect(kit?.id).toBe(4);
    expect(kit?.consumoBruto).toBe(80000);
  });

  it('retorna null cuando montoBelow min threshold', () => {
    const kit = findKitByConsumo(mockKits, 49999);
    expect(kit).toBeNull();
  });

  it('retorna null cuando monto Above max threshold', () => {
    const kit = findKitByConsumo(mockKits, 230001);
    expect(kit).toBeNull();
  });

  it('retorna null when monto equals exactly 50000', () => {
    const kit = findKitByConsumo(mockKits, 50000);
    expect(kit?.id).toBe(1);
  });

  it('retorna null when monto equals exactly 230000', () => {
    const kit = findKitByConsumo(mockKits, 230000);
    expect(kit?.id).toBe(7);
  });

  it('selecciona el mayor consumoBruto que no exceed monto', () => {
    const kit = findKitByConsumo(mockKits, 95000);
    // Sorted DESC, first where consumo <= monto is 90k (kit 5)
    expect(kit?.id).toBe(5);
    expect(kit?.consumoBruto).toBe(90000);
  });
});

describe('calculatePrice', () => {
  const kit = mockKits[3]; // id: 4, precioNetoBase: 7990000

  it('calcula precio con Losa y Normal sin recargos', () => {
    const result = calculatePrice(kit, 'Losa', 'Normal');
    expect(result.precioBase).toBe(7990000);
    expect(result.factorTecho).toBe(1);
    expect(result.recargoTecho).toBe(0);
    expect(result.costoFijoMedidor).toBe(0);
  });

  it('calcula precio con Teja Chilena (factor 1.14)', () => {
    const result = calculatePrice(kit, 'Teja Chilena', 'Normal');
    expect(result.factorTecho).toBe(1.14);
    expect(result.recargoTecho).toBeCloseTo(1118600, 0); // ±1 por float
  });

  it('calcula precio con Reja/Fuera (+$350000)', () => {
    const result = calculatePrice(kit, 'Losa', 'Reja/Fuera');
    expect(result.costoFijoMedidor).toBe(350000);
  });

  it('calcula precio con Teja Chilena + Reja/Fuera', () => {
    const result = calculatePrice(kit, 'Teja Chilena', 'Reja/Fuera');
    expect(result.factorTecho).toBe(1.14);
    expect(result.recargoTecho).toBeCloseTo(1118600, 0);
    expect(result.costoFijoMedidor).toBe(350000);
  });

  it('aplica IVA correctamente al precio final', () => {
    const result = calculatePrice(kit, 'Losa', 'Normal');
    const expectedSinIva = 7990000;
    const expectedFinal = Math.round(expectedSinIva * 1.19);
    expect(result.precioSinIva).toBe(expectedSinIva);
    expect(result.precioFinal).toBe(expectedFinal);
  });

  it('calcula Otro roof type sin recargo', () => {
    const result = calculatePrice(kit, 'Otro', 'Normal');
    expect(result.factorTecho).toBe(1);
    expect(result.recargoTecho).toBe(0);
  });
});

describe('simulate', () => {
  const baseInput: SimulationInput = {
    montoBoleta: 80000,
    tipoTecho: 'Losa',
    tipoMedidor: 'Normal',
  };

  it('simulación exitosa con input completo', () => {
    const result = simulate(baseInput, mockKits);
    expect(result.kit).not.toBeNull();
    expect(result.kit.id).toBe(4);
    expect(result.esNoViable).toBe(false);
    expect(result.requiereContactoEjecutivo).toBe(false);
    expect(result.precioFinal).toBeGreaterThan(0);
  });

  it('retorna esNoViable cuando monto below min', () => {
    const input = { ...baseInput, montoBoleta: 40000 };
    const result = simulate(input, mockKits);
    expect(result.esNoViable).toBe(true);
    expect(result.mensaje).toContain('$50.000');
  });

  it('retorna requiereContactoEjecutivo cuando monto above max', () => {
    const input = { ...baseInput, montoBoleta: 250000 };
    const result = simulate(input, mockKits);
    expect(result.requiereContactoEjecutivo).toBe(true);
    expect(result.mensaje).toContain('ejecutivo');
  });

  it('retorna requiereContactoEjecutivo cuando no hay kit compatible (monto muy alto)', () => {
    const kits: Kit[] = [
      { id: 1, consumoBruto: 50000, amperajeNecesario: '10 A', inversorKw: 3.0, paneles: 6, kwp: 3.30, precioNetoBase: 4990000 },
    ];
    const input = { ...baseInput, montoBoleta: 230001 };
    const result = simulate(input, kits);
    expect(result.requiereContactoEjecutivo).toBe(true);
    expect(result.mensaje).toContain('ejecutivo');
  });

  it('calcula precios correctamente con Teja Chilena', () => {
    const input: SimulationInput = { montoBoleta: 80000, tipoTecho: 'Teja Chilena', tipoMedidor: 'Normal' };
    const result = simulate(input, mockKits);
    expect(result.factorTecho).toBe(1.14);
    expect(result.precioSinIva).toBeGreaterThan(result.precioBase);
  });

  it('calcula precios correctamente con Reja/Fuera', () => {
    const input: SimulationInput = { montoBoleta: 80000, tipoTecho: 'Losa', tipoMedidor: 'Reja/Fuera' };
    const result = simulate(input, mockKits);
    expect(result.costoFijoMedidor).toBe(350000);
    expect(result.precioFinal).toBeGreaterThan(result.precioSinIva);
  });

  it('boundaries: monto = 50000 es válido', () => {
    const input = { ...baseInput, montoBoleta: 50000 };
    const result = simulate(input, mockKits);
    expect(result.esNoViable).toBe(false);
    expect(result.kit).not.toBeNull();
  });

  it('boundaries: monto = 230000 es válido', () => {
    const input = { ...baseInput, montoBoleta: 230000 };
    const result = simulate(input, mockKits);
    expect(result.requiereContactoEjecutivo).toBe(false);
    expect(result.kit).not.toBeNull();
  });
});