const addCommas = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Format number as Korean Won currency string
 * 165631296 → "₩165,631,296"
 */
export const formatCurrency = (amount: number): string => {
  if (!Number.isFinite(amount)) return '₩0';
  const absAmount = Math.abs(amount);
  const formatted = addCommas(absAmount);
  return amount < 0 ? `-₩${formatted}` : `₩${formatted}`;
};

/**
 * Format with 만원 unit for large amounts
 * 165631296 → "1억 6,563만"
 */
export const formatCurrencyShort = (amount: number): string => {
  if (!Number.isFinite(amount)) return '₩0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.floor((abs % 100_000_000) / 10_000);
    return man > 0 ? `${sign}${eok}억 ${man.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}만` : `${sign}${eok}억`;
  }
  if (abs >= 10_000) {
    const man = Math.floor(abs / 10_000);
    return `${sign}${man.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}만`;
  }
  return formatCurrency(amount);
};

/**
 * Parse Korean Won string to number
 * "₩165,631,296" → 165631296
 * "-₩5,333,950" → -5333950
 */
export const parseCurrency = (str: string): number => {
  if (!str || str === '-') return 0;
  const isNegative = str.startsWith('-') || str.includes('-₩');
  const cleaned = str.replace(/[₩,\s-]/g, '');
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? 0 : isNegative ? -value : value;
};

/**
 * Format input field: add commas while typing
 * "1234567" → "1,234,567"
 */
export const formatInputNumber = (text: string): string => {
  const cleaned = text.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return parseInt(cleaned, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parse input field number
 * "1,234,567" → 1234567
 */
export const parseInputNumber = (text: string): number => {
  const cleaned = text.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};
