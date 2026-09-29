/**
 * Calcula el retorno total (Stake + Ganancia) o la ganancia neta según un momio americano.
 */
export function calculatePayout(americanOdds: number, stake: number): number {
  if (stake <= 0) return 0;

  if (americanOdds > 0) {
    // Ej: +150 con stake 100 -> Ganancia 150 + Stake 100 = 250
    return stake + stake * (americanOdds / 100);
  } else {
    // Ej: -110 con stake 110 -> Ganancia 100 + Stake 110 = 210
    return stake + stake * (100 / Math.abs(americanOdds));
  }
}

/**
 * Calcula únicamente la ganancia neta (sin incluir el stake).
 */
export function calculateProfit(americanOdds: number, stake: number): number {
  if (stake <= 0) return 0;

  if (americanOdds > 0) {
    return stake * (americanOdds / 100);
  } else {
    return stake * (100 / Math.abs(americanOdds));
  }
}

/**
 * Convierte momio americano a formato decimal (ej. -110 -> 1.91).
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  } else {
    return 100 / Math.abs(americanOdds) + 1;
  }
}

/**
 * Formatea un momio americano para despliegue visual (ej. 150 -> "+150", -110 -> "-110").
 */
export function formatAmericanOdds(americanOdds: number): string {
  if (americanOdds > 0) {
    return `+${americanOdds}`;
  }
  return `${americanOdds}`;
}