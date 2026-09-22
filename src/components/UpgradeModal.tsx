import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Crown,
  KeyRound,
  ShieldCheck,
  Zap,
  CreditCard,
  Infinity,
  AlertCircle,
  Film,
  Volume2,
} from 'lucide-react';
import { AppThemeMode, UserSubscriptionState } from '../types';
import { redeemLicenseKey, saveSubscriptionState } from '../utils/monetization';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscriptionState;
  onUpdateSubscription: (state: UserSubscriptionState) => void;
  appThemeMode?: AppThemeMode;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  appThemeMode = 'dark',
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const isDark = appThemeMode === 'dark';

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const res = redeemLicenseKey(licenseInput);
    setRedeemFeedback(res);

    if (res.success) {
      const nextState: UserSubscriptionState = {
        ...subscription,
        tier: 'pro',
        isPro: true,
        licenseKey: licenseInput.trim().toUpperCase(),
      };
      saveSubscriptionState(nextState);
      onUpdateSubscription(nextState);
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  const handleQuickUnlockTest = () => {
    const nextState: UserSubscriptionState = {
      ...subscription,
      tier: 'pro',
      isPro: true,
      licenseKey: 'PRO-VIP-DEMO',
    };
    saveSubscriptionState(nextState);
    onUpdateSubscription(nextState);
    setRedeemFeedback({
      success: true,
      message: 'Pro Plan unlocked! Watermark removed & 1080p activated.',
    });
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div
      id="modal-upgrade-pro"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className={`w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Unlock I Am WhatsApp Pro</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[11px] font-bold border border-emerald-500/30">
                  Creator Tier
                </span>
              </h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                Full HD 1080p exports, zero watermarks, and unlimited conversions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 border-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Current Usage Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <span className="font-semibold">
                  {subscription.isPro
                    ? 'Pro Plan Active (Unlimited Exports)'
                    : `Free Plan Usage: ${subscription.freeGenerationsUsed} / ${subscription.freeGenerationsLimit} conversions used`}
                </span>
                <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {subscription.isPro
                    ? 'You have unrestricted access to all features.'
                    : `${Math.max(0, subscription.freeGenerationsLimit - subscription.freeGenerationsUsed)} free exports remaining on this device.`}
                </p>
              </div>
            </div>

            {subscription.isPro ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                PRO ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30">
                FREE TIER
              </span>
            )}
          </div>

          {/* Feature Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                Free Plan
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>15 Free Conversions & Exports</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>480p & 720p HD Quality</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Includes Watermark Badge</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-emerald-950/20 to-zinc-950 border-emerald-500/40'
                  : 'bg-emerald-50/50 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Pro Creator Plan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                  Recommended
                </span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 font-medium">
                  <Infinity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Unlimited Video & GIF Exports</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Film className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Full HD 1080p at 60 FPS</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Watermark-Free Clean Video</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Audio & Sound FX Synthesizer</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing & Checkout Options */}
          <div
            className={`p-4 rounded-2xl border space-y-3.5 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">Select Subscription Plan</span>
                <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Instant activation with Mada, Apple Pay, STC Pay, or Credit Card
                </span>
              </div>

              {/* Monthly / Yearly Toggle */}
              <div
                className={`p-0.5 rounded-xl border flex text-xs font-semibold ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  Monthly ($9)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    billingPeriod === 'yearly'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  Yearly ($69 • Save 36%)
                </button>
              </div>
            </div>

            {/* Payment Gateway Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleQuickUnlockTest}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {subscription.isPro
                    ? 'Pro Plan Activated'
                    : `Subscribe (${billingPeriod === 'yearly' ? '$69/yr' : '$9/mo'})`}
                </span>
              </button>

              <div
                className={`text-[10px] text-center sm:text-left ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                Supports 🇸🇦 Mada, 🍏 Apple Pay & Global Cards
              </div>
            </div>
          </div>

          {/* Enter License Key / Promo Code Section */}
          <form
            onSubmit={handleRedeem}
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Already have a License Key or Promo Code?</span>
              </span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                (e.g., PRO-VIP, CREATOR-SAUDI)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                placeholder="Enter License Key / Promo Code..."
                className={`flex-1 border rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-xs border border-zinc-700 shadow-xs cursor-pointer transition-colors"
              >
                Activate
              </button>
            </div>

            {redeemFeedback && (
              <div
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  redeemFeedback.success
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {redeemFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{redeemFeedback.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
