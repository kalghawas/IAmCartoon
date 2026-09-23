import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Crown,
  Clock,
  ChevronDown,
  Sliders,
  ShieldCheck,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { UserProfile, UserCreditState } from '../types';
import { getDaysUntilReset } from '../utils/creditManager';

interface HeaderMenuProps {
  currentUser: UserProfile | null;
  userCredits: UserCreditState;
  isCreator?: boolean;
  onOpenCreatorAdmin?: () => void;
  onOpenAuthModal: () => void;
  onOpenUnlockModal: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const UserProfileMenu: React.FC<HeaderMenuProps> = ({
  currentUser,
  userCredits,
  isCreator = false,
  onOpenCreatorAdmin,
  onOpenAuthModal,
  onOpenUnlockModal,
  onOpenSettings,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalCredits = userCredits.freeCreditsRemaining + userCredits.purchasedCredits;
  const daysUntilReset = getDaysUntilReset(userCredits.lastMonthlyReset);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Interactive Trigger Button */}
      {currentUser ? (
        /* Signed In State: Shows User Avatar / Settings Gear */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 sm:pl-2 sm:pr-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Account & Settings Menu"
          aria-label="Account & Settings Menu"
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 rounded-lg bg-blue-900 border border-blue-500/40 object-cover shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-bold font-cartoon shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden sm:inline text-xs font-semibold text-slate-200 leading-tight max-w-[80px] truncate">
            {currentUser.name}
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        </button>
      ) : (
        /* Signed Out State: Shows Interactive Sign-In / Settings Icon Button */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-blue-500/50 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
          title="Sign in & Settings"
          aria-label="Sign In & Settings"
        >
          <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Sign In</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Unified Interactive Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
          {currentUser ? (
            /* --- Signed In Menu Details --- */
            <>
              {/* User Identity Header */}
              <div className="flex items-center gap-3 p-2 border-b border-slate-800/80 pb-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-base font-bold font-cartoon shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-100 truncate font-cartoon">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    30-Day Cloud History Active
                  </div>
                </div>
              </div>

              {/* Credits Status Card */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    AI Credits Balance
                  </span>
                  <span className="text-xs font-bold font-mono text-blue-400">
                    {totalCredits} Available
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Monthly Free Tier:</span>
                    <span className="text-slate-200 font-medium font-mono">
                      {userCredits.freeCreditsRemaining}/3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchased HD Credits:</span>
                    <span className="text-amber-300 font-medium font-mono">
                      {userCredits.purchasedCredits} HD
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 pt-1 border-t border-slate-800/60">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>Next 3 free credits in {daysUntilReset} days</span>
                  </div>
                </div>
              </div>

              {/* Action Menu Items */}
              <div className="space-y-1 border-t border-slate-800/80 pt-2">
                {/* Creator-Only Provider Management Entry */}
                {(isCreator || currentUser.email?.toLowerCase() === 'kalghawas@gmail.com') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenCreatorAdmin?.();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer mb-1 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Provider Management</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-amber-400 text-slate-950 rounded">
                      Creator
                    </span>
                  </button>
                )}

                {/* AI Engine Settings Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>AI Engine Settings</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">API & Models</span>
                </button>

                {/* Get More Credits */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenUnlockModal();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-950/30 border border-amber-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Unlock HD & Remove Watermark</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            /* --- Signed Out Menu Details --- */
            <>
              {/* Sign In Prompt Card */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 mb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-100 font-cartoon mb-1">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>Studio Account</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Sign in to keep 3 free monthly credits and automatically retain your character variations for 30 days.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-cartoon text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In or Create Account</span>
                </button>
              </div>

              {/* Action Menu Items */}
              <div className="space-y-1">
                {isCreator && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenCreatorAdmin?.();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer mb-1 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Provider Management</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-amber-400 text-slate-950 rounded">
                      Creator
                    </span>
                  </button>
                )}

                {/* AI Engine Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>AI Engine Settings</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Configure</span>
                </button>

                {/* Unlock HD & Credits */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenUnlockModal();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-950/30 border border-amber-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Unlock HD & Credits</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
