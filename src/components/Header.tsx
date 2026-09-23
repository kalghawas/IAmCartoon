import React from 'react';
import { Settings, Command, Sliders, Image as ImageIcon, Zap, Crown } from 'lucide-react';
import { AppSettings, UserCreditState, UserProfile } from '../types';
import { UserProfileMenu } from './UserProfileMenu';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  settings: AppSettings;
  userCredits?: UserCreditState;
  currentUser: UserProfile | null;
  isCreator?: boolean;
  onOpenCreatorAdmin?: () => void;
  onOpenAuthModal: () => void;
  onOpenUnlockModal?: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  activeMobileTab?: 'canvas' | 'controls';
  onToggleMobileTab?: (tab: 'canvas' | 'controls') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  userCredits,
  currentUser,
  isCreator = false,
  onOpenCreatorAdmin,
  onOpenAuthModal,
  onOpenUnlockModal,
  onLogout,
  onOpenSettings,
  onOpenShortcuts,
  activeMobileTab = 'canvas',
  onToggleMobileTab
}) => {
  const totalCredits = userCredits
    ? userCredits.freeCreditsRemaining + userCredits.purchasedCredits
    : 3;

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 w-full border-b border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-md px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
      {/* Brand Identity: Logo only on mobile, Full Title on sm+ */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
          <BrandLogo className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="font-cartoon text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-blue-400">
              I am Cartoon
            </h1>
          </div>
          <p className="hidden md:block text-xs text-slate-400 font-medium">
            Transform your portrait into animated cartoon characters
          </p>
        </div>
      </div>

      {/* Mobile & Tablet Tab Switcher (Visible on < lg) */}
      {onToggleMobileTab && (
        <div className="flex lg:hidden items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => onToggleMobileTab('canvas')}
            className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all ${
              activeMobileTab === 'canvas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Canvas & Character Result"
            aria-label="Canvas"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleMobileTab('controls')}
            className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all ${
              activeMobileTab === 'controls'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Character & Poses"
            aria-label="Configure"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Center Engine Status (Desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-colors"
          title="Click to configure engine settings"
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              settings.useMockMode ? 'bg-emerald-400' : 'bg-blue-500'
            }`}
          />
          <span className="text-xs font-medium text-slate-300">
            {settings.useMockMode ? 'Instant Mock Mode' : settings.model}
          </span>
        </button>
      </div>

      {/* Right Controls: Credits Pill & Unified Interactive Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Monthly Credits Pill - Always visible and never pushed out */}
        {onOpenUnlockModal && (
          <button
            type="button"
            onClick={onOpenUnlockModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-600/50 text-blue-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="View Monthly AI Credits & Unlock HD"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold font-mono">{totalCredits}/3</span>
            <span className="hidden md:inline text-xs font-medium text-slate-300">Credits</span>
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>
        )}

        {/* Unified Interactive Settings & Account Menu */}
        <UserProfileMenu
          currentUser={currentUser}
          userCredits={userCredits || { freeCreditsRemaining: 3, purchasedCredits: 0, lastMonthlyReset: Date.now(), unlockedImageIds: [] }}
          isCreator={isCreator}
          onOpenCreatorAdmin={onOpenCreatorAdmin}
          onOpenAuthModal={onOpenAuthModal}
          onOpenUnlockModal={onOpenUnlockModal || (() => {})}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />

        {/* Shortcuts Icon Button (Desktop only) */}
        <button
          onClick={onOpenShortcuts}
          className="hidden md:flex p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shrink-0"
          title="Keyboard Shortcuts"
          aria-label="Keyboard Shortcuts"
        >
          <Command className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
