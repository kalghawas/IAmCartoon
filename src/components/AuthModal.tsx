import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { authenticateWithGoogleAsync, authenticateWithEmailAsync } from '../utils/authManager';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onToast
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authenticateWithGoogleAsync('kalghawas@gmail.com', 'Khalid');
      setIsLoading(false);
      onLoginSuccess(user);
      onToast(`Signed in as ${user.name}`);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      onToast(err.message || 'Google sign-in error.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onToast('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      onToast('Password should be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authenticateWithEmailAsync(
        email,
        password,
        tab === 'signup',
        displayName || undefined
      );
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onToast(tab === 'signup' ? '🎉 Account created!' : '✨ Welcome back!');
        onClose();
      } else {
        onToast(res.error || 'Authentication error.');
      }
    } catch (err: any) {
      setIsLoading(false);
      onToast(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors z-10"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Standard Brand Logo */}
        <div className="p-4 sm:p-5 pb-2 text-center flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center mb-1.5 text-blue-500">
            <BrandLogo className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="font-cartoon text-xl font-bold text-slate-100">
            {tab === 'signin' ? 'Sign In to Studio' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Save credits & character variations for 30 days
          </p>
        </div>

        {/* Main Content Form */}
        <div className="p-4 sm:p-5 pt-2 space-y-3.5">
          {/* Quick 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Minimal Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-2.5 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              or email
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                tab === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                tab === 'signup'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-2.5">
            {tab === 'signup' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Name</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-cartoon text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] mt-1"
            >
              <span>{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Compact Footer info */}
        <div className="p-2.5 bg-slate-950/70 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500">
            Includes 3 free monthly credits & 30-day cloud history
          </p>
        </div>
      </div>
    </div>
  );
};
