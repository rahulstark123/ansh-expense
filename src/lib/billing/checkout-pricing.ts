import type { BillingCycle } from "./plans";

export interface CheckoutFxPricing {
  countryCode: string;
  chargeCurrency: "INR" | "USD";
  monthlyPriceMajor: number;
  yearlyMonthlyEquivalentMajor: number;
  yearlyTotalMajor: number;
}

export function computeCheckoutTotals(
  fx: CheckoutFxPricing,
  seats: number,
  billingCycle: BillingCycle
) {
  const safeSeats = Math.max(1, Math.floor(seats));
  const perSeatMonthly =
    billingCycle === "yearly" ? fx.yearlyMonthlyEquivalentMajor : fx.monthlyPriceMajor;
  const baseTotal =
    billingCycle === "yearly"
      ? fx.yearlyTotalMajor * safeSeats
      : fx.monthlyPriceMajor * safeSeats;

  const gst = fx.chargeCurrency === "INR" ? Math.round(baseTotal * 0.18) : 0;
  const total = baseTotal + gst;

  return { seats: safeSeats, perSeatMonthly, baseTotal, gst, total };
}

export function formatCheckoutPrice(amount: number, currency: string) {
  if (currency === "USD") {
    const decimals = amount % 1 !== 0 ? 2 : 0;
    return `$${amount.toFixed(decimals)}`;
  }
  return `₹${Math.round(amount)}`;
}
