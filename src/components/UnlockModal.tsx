import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  Zap,
  Lock,
  Crown,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { UserCreditState, PricingPlan } from '../types';
import { PRICING_PLANS, getDaysUntilReset, applyPurchasedPlan } from '../utils/creditManager';
import { getCurrentUser } from '../utils/authManager';
import { recordPaymentIntent } from '../utils/firebase';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredits: UserCreditState;
  onCreditsUpdated: (updatedCredits: UserCreditState) => void;
  currentImageId?: string;
  onToast: (msg: string) => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  userCredits,
  onCreditsUpdated,
  currentImageId,
  onToast
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'mada' | 'card'>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const daysUntilReset = getDaysUntilReset(userCredits.lastMonthlyReset);

  const handleSimulatedCheckout = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const currentUser = getCurrentUser();
    if (currentUser) {
      recordPaymentIntent(
        currentUser.id,
        selectedPlan.id,
        selectedPlan.priceUsd,
        'USD',
        selectedPlan.creditsAdded
      ).catch(() => {});
    }

    const updated = applyPurchasedPlan(userCredits, selectedPlan, currentImageId);
    onCreditsUpdated(updated);
    setIsProcessing(false);
    setIsSuccess(true);

    onToast(`🎉 Payment successful! Added ${selectedPlan.creditsAdded} credit(s) and unlocked HD download.`);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cartoon">
                Unlock High-Definition & Remove Watermark
              </h3>
              <p className="text-xs text-slate-400">
                Get crystal clear 4K exports and high-definition AI generation credits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Current Credit Status Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Free Monthly Allowance: <span className="text-blue-400 font-mono">{userCredits.freeCreditsRemaining}/3</span> remaining
                </div>
                <div className="text-[11px] text-slate-400">
                  Resets automatically in <span className="text-slate-300 font-medium">{daysUntilReset} days</span> • Unlimited Mock Mode is always free
                </div>
              </div>
            </div>

            {userCredits.purchasedCredits > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
                +{userCredits.purchasedCredits} Purchased Credits
              </div>
            )}
          </div>

          {/* Pricing Cards Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select an Unlock Option</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-bold text-slate-100 font-cartoon mb-1">
                        {plan.name}
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xl font-extrabold text-white font-mono">
                          ${plan.priceUsd.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 font-sans">
                          (~{plan.priceSar.toFixed(2)} SAR)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector (KSA & International ready) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Payment Method</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'apple_pay' as const, label: ' Apple Pay', sub: 'Instant 1-Click' },
                { id: 'mada' as const, label: 'mada / Debit', sub: 'Saudi Domestic' },
                { id: 'card' as const, label: 'Credit Card', sub: 'Visa / Mastercard' }
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'bg-blue-900/40 border-blue-500 text-slate-100 ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold font-cartoon">{pm.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{pm.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400">
            Total: <span className="text-sm font-bold text-white font-mono">${selectedPlan.priceUsd.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400 ml-1.5">({selectedPlan.priceSar.toFixed(2)} SAR)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSimulatedCheckout}
              disabled={isProcessing || isSuccess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Unlocked!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pay with {paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'mada' ? 'mada' : 'Card'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
