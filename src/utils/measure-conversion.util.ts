// app/src/utils/measure-conversion.util.ts

/**
 * Normaliza el nombre de la unidad para facilitar la comparación (sin espacios, en minúsculas y sin acentos).
 */
function normalizeMeasure(measure: string): string {
  return measure
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Tasas de conversión a la unidad base de cada categoría.
 *
 * Peso base: Gramos (g)
 * Volumen base: Mililitros (ml)
 * Unidades base: Unidad (u)
 */
const conversionRates: Record<string, { base: string; rate: number }> = {
  // PESO (base: gramos)
  g: { base: 'weight', rate: 1 },
  gr: { base: 'weight', rate: 1 },
  gramo: { base: 'weight', rate: 1 },
  gramos: { base: 'weight', rate: 1 },
  kg: { base: 'weight', rate: 1000 },
  kilo: { base: 'weight', rate: 1000 },
  kilos: { base: 'weight', rate: 1000 },
  kilogramo: { base: 'weight', rate: 1000 },
  kilogramos: { base: 'weight', rate: 1000 },
  mg: { base: 'weight', rate: 0.001 },
  miligramo: { base: 'weight', rate: 0.001 },
  miligramos: { base: 'weight', rate: 0.001 },
  lb: { base: 'weight', rate: 453.592 },
  libra: { base: 'weight', rate: 453.592 },
  libras: { base: 'weight', rate: 453.592 },
  oz: { base: 'weight', rate: 28.3495 },
  onza: { base: 'weight', rate: 28.3495 },
  onzas: { base: 'weight', rate: 28.3495 },
  '@': { base: 'weight', rate: 11500 }, // 1 arroba = ~11.5 kg
  arroba: { base: 'weight', rate: 11500 },
  arrobas: { base: 'weight', rate: 11500 },
  qq: { base: 'weight', rate: 46000 }, // 1 quintal = 46 kg aprox en Bolivia
  quintal: { base: 'weight', rate: 46000 },
  quintales: { base: 'weight', rate: 46000 },
  'bolsa de 10 kilos': { base: 'weight', rate: 10000 },
  'bolsas de 10 kilos': { base: 'weight', rate: 10000 },

  // VOLUMEN (base: mililitros)
  ml: { base: 'volume', rate: 1 },
  mililitro: { base: 'volume', rate: 1 },
  mililitros: { base: 'volume', rate: 1 },
  l: { base: 'volume', rate: 1000 },
  litro: { base: 'volume', rate: 1000 },
  litros: { base: 'volume', rate: 1000 },
  cc: { base: 'volume', rate: 1 }, // centímetro cúbico
  'c.c': { base: 'volume', rate: 1 },
  'centimetro cubico': { base: 'volume', rate: 1 },
  'centimetros cubicos': { base: 'volume', rate: 1 },
  gal: { base: 'volume', rate: 3785.41 },
  galon: { base: 'volume', rate: 3785.41 },
  galones: { base: 'volume', rate: 3785.41 },

  // UNIDADES (base: unidad)
  u: { base: 'unit', rate: 1 },
  ud: { base: 'unit', rate: 1 },
  uds: { base: 'unit', rate: 1 },
  unidad: { base: 'unit', rate: 1 },
  unidades: { base: 'unit', rate: 1 },
  pieza: { base: 'unit', rate: 1 },
  piezas: { base: 'unit', rate: 1 },
  caja: { base: 'unit', rate: 1 }, // Asumiremos 1 a menos que se defina la cantidad por caja en otro lado
  cajas: { base: 'unit', rate: 1 },
  paquete: { base: 'unit', rate: 1 },
  paquetes: { base: 'unit', rate: 1 },
  frasco: { base: 'unit', rate: 1 },
  frascos: { base: 'unit', rate: 1 },
  carga: { base: 'unit', rate: 1 },
  cargas: { base: 'unit', rate: 1 },
  amarro: { base: 'unit', rate: 1 },
  amarros: { base: 'unit', rate: 1 },
  tubo: { base: 'unit', rate: 1 },
  tubos: { base: 'unit', rate: 1 },
  lata: { base: 'unit', rate: 1 },
  latas: { base: 'unit', rate: 1 },
  bolsa: { base: 'unit', rate: 1 },
  bolsas: { base: 'unit', rate: 1 },
  cabeza: { base: 'unit', rate: 1 },
  cabezas: { base: 'unit', rate: 1 },
  bloque: { base: 'unit', rate: 1 },
  bloques: { base: 'unit', rate: 1 },
  java: { base: 'unit', rate: 1 },
  javas: { base: 'unit', rate: 1 },
  jaba: { base: 'unit', rate: 1 },
  jabas: { base: 'unit', rate: 1 },
  maple: { base: 'unit', rate: 1 },
  maples: { base: 'unit', rate: 1 },

  // MONEDA (base: moneda)
  bs: { base: 'currency', rate: 1 },
  boliviano: { base: 'currency', rate: 1 },
  bolivianos: { base: 'currency', rate: 1 },
};

/**
 * Convierte una cantidad de una unidad a otra preferida.
 * Si no son compatibles o no se encuentran, retorna la cantidad original.
 */
export function convertMeasure(
  quantity: number,
  fromMeasure: string,
  toMeasure: string | null | undefined,
): number {
  if (!toMeasure) return quantity; // Si no hay unidad preferida, no se hace conversión

  const from = normalizeMeasure(fromMeasure);
  const to = normalizeMeasure(toMeasure);

  if (from === to) return quantity;

  const fromData = conversionRates[from];
  const toData = conversionRates[to];

  // Si encontramos ambas y pertenecen a la misma magnitud (peso, volumen, etc.)
  if (fromData && toData && fromData.base === toData.base) {
    // Ejemplo: 2 kg a g. fromData.rate = 1000, toData.rate = 1.
    // Convertimos a base: 2 * 1000 = 2000g. Luego de base a destino: 2000 / 1 = 2000g
    const quantityInBase = quantity * fromData.rate;
    const convertedQuantity = quantityInBase / toData.rate;

    // Redondeamos a 4 decimales para evitar problemas de precisión (ej. 0.30000000000000004)
    return Math.round(convertedQuantity * 10000) / 10000;
  }

  // Si no se puede convertir (unidades incompatibles o no soportadas), asumimos que no se modifica.
  // Esto es útil por ejemplo si intentan convertir Cajas a Gramos directamente sin un factor del producto.
  return quantity;
}

/**
 * Extrae la cantidad numérica y el texto de medida de un string como "50.5 Cajas"
 */
export function parseAmountMeasure(amountMeasure: string): {
  quantity: number;
  measure: string;
} {
  if (!amountMeasure) {
    return { quantity: 0, measure: '' };
  }

  // Divide por el primer espacio
  const parts = amountMeasure.trim().split(/\s+/);

  if (parts.length === 0) {
    return { quantity: 0, measure: '' };
  }

  if (parts.length === 1) {
    // Solo hay un string, intentamos ver si es solo numero o solo letras
    const num = parseFloat(parts[0]);
    if (!isNaN(num)) {
      return { quantity: num, measure: '' };
    }
    return { quantity: 0, measure: parts[0] };
  }

  const quantityStr = parts.shift() || '0';
  const measureStr = parts.join(' ');

  const quantity = parseFloat(quantityStr) || 0;

  return { quantity, measure: measureStr };
}
