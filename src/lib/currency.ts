export const usdRates: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.51,
  CAD: 1.37,
  SGD: 1.35,
  AED: 3.67,
  JPY: 156.8,
};

export const convertToWorkspaceCurrency = (
  amount: number,
  fromCurrency: string,
  targetCurrency: string
): number => {
  const from = fromCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();
  
  if (from === target) return amount;
  
  const fromRate = usdRates[from] || 1.0;
  const targetRate = usdRates[target] || 1.0;
  
  const fromInUsd = amount / fromRate;
  const result = fromInUsd * targetRate;
  return Number(result.toFixed(2));
};
