import { simulate, findKitByConsumo, calculatePrice, formatCLP } from './simulation';
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

console.log('=== Tests Motor de Cálculos ===\n');

console.log('--- Test 1: Kit matching (monto exacto) ---');
const kit1 = findKitByConsumo(mockKits, 80000);
console.log('Monto: $80.000 → Kit:', kit1?.id, 'kwp:', kit1?.kwp, 'precio:', formatCLP(kit1?.precioNetoBase || 0));

console.log('\n--- Test 2: Kit matching (monto intermedio, tomar inferior) ---');
const kit2 = findKitByConsumo(mockKits, 85000);
console.log('Monto: $85.000 → Kit:', kit2?.id, 'kwp:', kit2?.kwp, '(debería ser kit 4 con 80k)');

console.log('\n--- Test 3: Cálculo completo - Losa + Normal ---');
const result1 = simulate({ montoBoleta: 80000, tipoTecho: 'Losa', tipoMedidor: 'Normal' }, mockKits);
console.log('Precio Base:', formatCLP(result1.precioBase));
console.log('Recargo Techo:', formatCLP(result1.recargoTecho), '(0, es Losa)');
console.log('Costo Medidor:', formatCLP(result1.costoFijoMedidor), '(0, es Normal)');
console.log('Precio Sin IVA:', formatCLP(result1.precioSinIva));
console.log('Precio Final:', formatCLP(result1.precioFinal));

console.log('\n--- Test 4: Cálculo completo - Teja Chilena + Reja/Fuera ---');
const result2 = simulate({ montoBoleta: 80000, tipoTecho: 'Teja Chilena', tipoMedidor: 'Reja/Fuera' }, mockKits);
console.log('Precio Base:', formatCLP(result2.precioBase));
console.log('Factor Techo:', result2.factorTecho, '(x1.14)');
console.log('Recargo Techo:', formatCLP(result2.recargoTecho));
console.log('Costo Medidor:', formatCLP(result2.costoFijoMedidor), '($350.000)');
console.log('Precio Sin IVA:', formatCLP(result2.precioSinIva));
console.log('Precio Final:', formatCLP(result2.precioFinal));

console.log('\n--- Test 5: No viable (< $50.000) ---');
const result3 = simulate({ montoBoleta: 40000, tipoTecho: 'Losa', tipoMedidor: 'Normal' }, mockKits);
console.log('EsNoViable:', result3.esNoViable, '| Mensaje:', result3.mensaje);

console.log('\n--- Test 6: Contacto Ejecutivo (> $230.000) ---');
const result4 = simulate({ montoBoleta: 250000, tipoTecho: 'Losa', tipoMedidor: 'Normal' }, mockKits);
console.log('Requiere Ejecutivo:', result4.requiereContactoEjecutivo, '| Mensaje:', result4.mensaje);

console.log('\n=== Fin Tests ===');
