import React from 'react';
import {
  Moon,
  Sun,
  Settings,
  HelpCircle,
  Download,
  Crown,
  Sparkles,
  User,
  LogIn,
  History,
} from 'lucide-react';
import { AppThemeMode, UserSubscriptionState, UserProfile } from '../types';
import { DualWhatsAppLogo } from './DualWhatsAppLogo';

interface WorkstationHeaderProps {
  appThemeMode: AppThemeMode;
  onToggleAppTheme: () => void;
  downloadCount: number;
  subscription: UserSubscriptionState;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenUpgradeModal: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  appThemeMode,
  onToggleAppTheme,
  downloadCount,
  subscription,
  user,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenUpgradeModal,
  onOpenSettings,
  onOpenHelp,
}) => {
  const isDark = appThemeMode === 'dark';

  return (
    <header
      id="workstation-header"
      className={`h-16 border-b transition-colors px-3 sm:px-5 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md ${
        isDark
          ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
          : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xs'
      }`}
    >
      {/* Brand & Identity: Name "I Am whatsapp" + Dual WhatsApp bubbles logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          className={`p-1 rounded-xl border shadow-xs flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <DualWhatsAppLogo size={30} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1
              className={`text-sm sm:text-base md:text-lg font-bold tracking-tight truncate ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              I Am whatsapp
            </h1>
          </div>
          <p
            className={`text-[10px] sm:text-[11px] truncate hidden xs:block ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Android WhatsApp chat animator & video generator
          </p>
        </div>
      </div>

      {/* Center: Downloaded Counter + 30-Day History & Credits */}
      <div className="hidden md:flex items-center gap-2.5">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-xs ${
            isDark
              ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
              : 'bg-zinc-100/90 border-zinc-200 text-zinc-700'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span>Downloaded:</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[11px]">
            {downloadCount}
          </span>
        </div>

        {/* Free Credits Badge or 30-Day History Button */}
        {user ? (
          <button
            type="button"
            onClick={onOpenProfileModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-emerald-500/50'
                : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:border-emerald-500'
            }`}
            title="View 30-day saved creations & payment history"
          >
            <History className="w-3.5 h-3.5 text-emerald-500" />
            <span>30-Day History</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
              isDark
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-300 hover:bg-amber-950/50'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
            title="Free conversions remaining on this device"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {Math.max(0, subscription.freeGenerationsLimit - subscription.freeGenerationsUsed)} free left
            </span>
          </button>
        )}
      </div>

      {/* Right Actions: User Profile/Sign-In, Upgrade Pro, Settings, Web App Theme, Help */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* User Account / Sign-In Button */}
        {user ? (
          <button
            id="btn-header-profile"
            type="button"
            onClick={onOpenProfileModal}
            className={`flex items-center gap-2 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl border shadow-xs transition-all min-h-[40px] cursor-pointer ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700/90'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
            }`}
            title={`Signed in as ${user.email}. Click for 30-day history & billing.`}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
          </button>
        ) : (
          <button
            id="btn-header-signin"
            type="button"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl border shadow-xs transition-colors min-h-[40px] cursor-pointer ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-emerald-500/40'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}
            title="Sign in with Google or Email to sync creations"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Pro Upgrade Button */}
        <button
          id="btn-header-upgrade"
          type="button"
          onClick={onOpenUpgradeModal}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl border shadow-xs transition-colors min-h-[40px] cursor-pointer ${
            subscription.isPro
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/25'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-amber-400/50 shadow-amber-950/30'
          }`}
          title="Upgrade to Pro / View Subscription"
        >
          <Crown className="w-4 h-4" />
          <span className="hidden lg:inline">
            {subscription.isPro ? 'Pro Active' : 'Upgrade Pro'}
          </span>
        </button>

        {/* Unified WhatsApp Settings Menu Button */}
        <button
          id="btn-open-settings"
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl border shadow-xs transition-colors min-h-[40px] min-w-[40px] cursor-pointer ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700/80'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
          }`}
          title="Open WhatsApp Settings (Profiles, Themes, Export)"
        >
          <Settings className="w-4 h-4 text-emerald-500" />
          <span className="hidden xl:inline">Settings</span>
        </button>

        {/* Web App Day / Night Theme Switcher */}
        <button
          id="btn-toggle-app-theme"
          type="button"
          onClick={onToggleAppTheme}
          className={`p-2 rounded-xl border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-zinc-800'
              : 'bg-zinc-100 hover:bg-zinc-200 text-indigo-600 border-zinc-300'
          }`}
          title={`Switch Web App to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>

        {/* Help / Guide */}
        <button
          id="btn-help-guide"
          type="button"
          onClick={onOpenHelp}
          className={`p-2 rounded-xl border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
            isDark
              ? 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
              : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300'
          }`}
          title="How it works"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
