"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanStore } from "@/stores/plan-store";
import { useExpenseStore } from "@/stores/expense-store";
import { buildRazorpayPrefill } from "@/lib/billing/razorpay-prefill";
import { getCheckoutLogoUrl, openRazorpayCheckout } from "@/lib/billing/checkout-client";
import {
  computeCheckoutTotals,
  formatCheckoutPrice,
  type CheckoutFxPricing,
} from "@/lib/billing/checkout-pricing";
import type { BillingCycle } from "@/lib/billing/plans";

interface ProCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: number;
  minSeats?: number;
  canManageBilling?: boolean;
  onSuccess?: () => void | Promise<void>;
}

export function ProCheckoutModal({
  open,
  onOpenChange,
  workspaceId = 1,
  minSeats = 1,
  canManageBilling = true,
  onSuccess,
}: ProCheckoutModalProps) {
  const { currentUser, employees } = useExpenseStore();
  const fetchPlan = usePlanStore((s) => s.fetchPlan);

  const [fx, setFx] = useState<CheckoutFxPricing | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [seatsInput, setSeatsInput] = useState(String(Math.max(minSeats, employees.length || 1)));
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isHelpedBySaathi, setIsHelpedBySaathi] = useState(false);
  const [saathiCode, setSaathiCode] = useState("");

  useEffect(() => {
    if (open) {
      setIsHelpedBySaathi(false);
      setSaathiCode("");
    }
  }, [open]);

  const defaultSeats = Math.max(minSeats, employees.length || 1);

  const [resolvedWorkspaceId, setResolvedWorkspaceId] = useState(workspaceId);
  const [resolvedCanManage, setResolvedCanManage] = useState(canManageBilling);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSeatsInput(String(defaultSeats));
    setErrorMsg("");
    setBillingCycle("monthly");
    setResolvedWorkspaceId(workspaceId);
    setResolvedCanManage(canManageBilling);
    setIsTrialActive(false);
    setTrialEndsAt(null);
    setPlan("free");
    setPlanExpiresAt(null);

    const token = sessionStorage.getItem("ansh_auth_token");
    Promise.all([
      fetch("/api/billing/fx", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch("/api/billing/status", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
    ])
      .then(([fxData, status]) => {
        if (fxData) setFx(fxData);
        if (status) {
          setResolvedWorkspaceId(status.workspaceId ?? workspaceId);
          setResolvedCanManage(Boolean(status.canManageBilling));
          setIsTrialActive(Boolean(status.isTrialActive));
          setTrialEndsAt(status.trialEndsAt ?? null);
          setPlan(status.plan ?? "free");
          setPlanExpiresAt(status.planExpiresAt ?? null);
        }
      })
      .catch((err) => console.error("Checkout load failed:", err));
  }, [open, defaultSeats, workspaceId, canManageBilling]);

  const daysUntilExpiry = useMemo(() => {
    if (plan !== "pro" || !planExpiresAt) return null;
    const expiry = new Date(planExpiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [plan, planExpiresAt]);

  const isExpiringSoon = useMemo(() => {
    return daysUntilExpiry !== null && daysUntilExpiry <= 10;
  }, [daysUntilExpiry]);

  const seats = useMemo(() => {
    const parsed = parseInt(seatsInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 0;
    return parsed;
  }, [seatsInput]);

  const currency = fx?.chargeCurrency ?? "INR";
  const { perSeatMonthly, baseTotal, gst, total } = useMemo(() => {
    if (seats < 1) {
      return { perSeatMonthly: currency === "USD" ? 2 : 199, baseTotal: 0, gst: 0, total: 0 };
    }
    if (!fx) {
      const fallbackRate = currency === "USD" ? 2 : 199;
      const perSeat = fallbackRate;
      let base = fallbackRate * seats;
      if (billingCycle === "yearly") {
        base = Math.round(fallbackRate * 12 * 0.81 * seats);
      }
      const tax = currency === "INR" ? Math.round(base * 0.18) : 0;
      return {
        perSeatMonthly: perSeat,
        baseTotal: base,
        gst: tax,
        total: base + tax,
      };
    }
    return computeCheckoutTotals(fx, seats, billingCycle);
  }, [fx, seats, billingCycle, currency]);

  const handleProceed = useCallback(async () => {
    if (!resolvedCanManage) {
      setErrorMsg("Only Admin or Manager can manage billing.");
      return;
    }
    if (seats < minSeats) {
      setErrorMsg(`Seat count must be at least ${minSeats} for your current team.`);
      return;
    }

    setIsPaying(true);
    setErrorMsg("");

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      if (!token) throw new Error("Please sign in again.");

      const orderRes = await fetch("/api/billing/checkout/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billingCycle,
          billingCountry: fx?.countryCode,
          seats,
          saathicode: isHelpedBySaathi ? saathiCode : null,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create payment order");
      }

      const { orderId, amount, currency: orderCurrency, keyId } = await orderRes.json();
      const { prefill, readonly } = buildRazorpayPrefill({
        name: currentUser?.name,
        email: currentUser?.email,
        phoneNumber: currentUser?.phoneNumber,
      });

      const displayCurrency = orderCurrency as "INR" | "USD";
      const cycleLabel = billingCycle === "yearly" ? "Yearly" : "Monthly";

      await openRazorpayCheckout({
        key: keyId,
        order_id: orderId,
        amount,
        currency: orderCurrency,
        name: "ANSH Expense",
        description: `Pro Plan — ${cycleLabel} (${formatCheckoutPrice(perSeatMonthly, displayCurrency)}/user/mo × ${seats} users)`,
        image: getCheckoutLogoUrl(),
        prefill,
        readonly,
        theme: { color: "#6366f1" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/billing/checkout/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              workspaceId: resolvedWorkspaceId,
            }),
          });

          if (!verifyRes.ok) {
            const data = await verifyRes.json().catch(() => ({}));
            throw new Error(data.error || "Payment verification failed");
          }

          await fetchPlan();
          await onSuccess?.();
          onOpenChange(false);
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        setErrorMsg("Payment was cancelled.");
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
      }
    } finally {
      setIsPaying(false);
    }
  }, [
    resolvedCanManage,
    seats,
    minSeats,
    billingCycle,
    fx,
    currentUser,
    perSeatMonthly,
    resolvedWorkspaceId,
    fetchPlan,
    onSuccess,
    onOpenChange,
  ]);

  const cycleLabel = billingCycle === "yearly" ? "Yearly" : "Monthly";
  const billedLabel =
    billingCycle === "yearly"
      ? `billed yearly in ${currency}`
      : `billed monthly in ${currency}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-border/60 max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-5 pb-3.5 shrink-0 border-b border-border/10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogHeader className="text-left space-y-1 flex-1">
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Upgrade to Pro Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Secure checkout powered by Razorpay
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 max-h-[55vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Billing Cycle */}
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-slate-50/40 dark:bg-slate-900/30 px-4 py-3">
            <span className="text-xs font-semibold text-slate-500">Billing Cycle</span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer",
                  billingCycle === "monthly"
                    ? "bg-primary/15 text-primary"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer",
                  billingCycle === "yearly"
                    ? "bg-primary/15 text-primary"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Yearly -19%
              </button>
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <label
              htmlFor="pro-checkout-seats"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              Number of Seats / Users
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="pro-checkout-seats"
                type="number"
                min={minSeats}
                max={500}
                value={seatsInput}
                onChange={(e) => setSeatsInput(e.target.value)}
                className="h-11 pl-10 text-base font-semibold rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
              />
            </div>
            {minSeats > 1 && (
              <p className="text-[10px] text-slate-400">
                Minimum {minSeats} seats for your current team size.
              </p>
            )}
          </div>

          {/* Helped by ANSH Saathi Toggle */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-slate-50/40 dark:bg-slate-900/30 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Helped by ANSH Saathi?
                </span>
                <span className="text-[10px] text-slate-400">
                  Enable if an ANSH Saathi partner assisted you.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHelpedBySaathi}
                  onChange={(e) => {
                    setIsHelpedBySaathi(e.target.checked);
                    if (!e.target.checked) setSaathiCode("");
                    else if (currentUser?.saathicode) setSaathiCode(currentUser.saathicode);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 animate-transition"></div>
              </label>
            </div>

            {isHelpedBySaathi && (
              <div className="mt-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Saathi Partner Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g. SAATHI-00001"
                  value={saathiCode}
                  onChange={(e) => setSaathiCode(e.target.value.toUpperCase())}
                  className="h-8 text-xs bg-white dark:bg-slate-950 font-bold uppercase tracking-wider"
                />
              </div>
            )}
          </div>

          {/* Pricing breakdown card */}
          <div className="rounded-2xl border border-border/50 bg-slate-50/30 dark:bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Price per seat</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {formatCheckoutPrice(perSeatMonthly, currency)}
                <span className="text-slate-400 font-semibold"> / mo</span>
              </span>
            </div>

            {currency === "INR" && seats > 0 && (
              <>
                <div className="flex items-center justify-between text-xs border-t border-border/20 pt-2.5">
                  <span className="text-slate-500">Subtotal ({seats} seats)</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCheckoutPrice(baseTotal, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCheckoutPrice(gst, currency)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {currency === "INR" ? "Grand Total" : `Total (${seats > 0 ? seats : "—"} users)`}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {seats > 0 ? formatCheckoutPrice(total, currency) : "—"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {cycleLabel} · {billedLabel}
            </p>
          </div>

          {isTrialActive && trialEndsAt && (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              Your free trial runs until{" "}
              <span className="font-bold text-primary">
                {new Date(trialEndsAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              . Pro billing starts after the trial ends.
            </p>
          )}

          {isExpiringSoon && planExpiresAt && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 animate-fadeIn">
              Your Pro plan expires in{" "}
              <span className="font-bold text-amber-600 dark:text-amber-500">
                {daysUntilExpiry} {daysUntilExpiry === 1 ? "day" : "days"}
              </span>{" "}
              on{" "}
              <span className="font-bold">
                {new Date(planExpiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              . Renew now to avoid service interruption.
            </p>
          )}

          {plan === "pro" && planExpiresAt && !isExpiringSoon && (
            <p className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              You are currently on the Pro Plan (expires on{" "}
              <span className="font-bold">
                {new Date(planExpiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              ). Purchasing a renewal now will queue it to start automatically when your current plan expires.
            </p>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4.5 border-t border-border/10 bg-slate-50/10 dark:bg-slate-900/10 shrink-0">
          {errorMsg && (
            <p className="text-xs font-semibold text-rose-500 mb-3">{errorMsg}</p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
              disabled={isPaying}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 rounded-xl btn-primary border-0 font-black"
              onClick={handleProceed}
              disabled={isPaying || seats < minSeats || seats < 1}
            >
              {isPaying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Proceed to Pay ${seats > 0 ? formatCheckoutPrice(total, currency) : ""}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
