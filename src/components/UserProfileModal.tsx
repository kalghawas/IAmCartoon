import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Crown,
  Sparkles,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
  LogOut,
  History,
  Receipt,
  FileVideo,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import {
  AppThemeMode,
  UserProfile,
  CreationRecord,
  PaymentRecord,
  ContactSettings,
  ChatThemeMode,
  ParserConfig,
  AnimationSettings,
} from '../types';
import {
  getUserCreations,
  syncUserCreationsFromCloud,
  getUserPayments,
  deleteCreationRecord,
  logoutUser,
  saveUser,
} from '../utils/accountStore';
import { ShareModal } from './ShareModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile | null) => void;
  onLoadCreation: (creation: CreationRecord) => void;
  onOpenUpgrade: () => void;
  appThemeMode: AppThemeMode;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLoadCreation,
  onOpenUpgrade,
  appThemeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'creations' | 'billing' | 'account'>('creations');
  const [creations, setCreations] = useState<CreationRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedShareCreation, setSelectedShareCreation] = useState<CreationRecord | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      setCreations(getUserCreations(user.id));
      setPayments(getUserPayments(user.id));

      // Async cloud sync
      syncUserCreationsFromCloud(user.id).then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          setCreations(cloudData);
        }
      });
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const isDark = appThemeMode === 'dark';

  const handleDeleteCreation = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCreationRecord(user.id, recordId);
    setCreations((prev) => prev.filter((c) => c.id !== recordId));
  };

  const handleSignOut = () => {
    logoutUser();
    onUpdateUser(null);
    onClose();
  };

  const remainingQuota = user.subscription.isPro
    ? 'Unlimited'
    : Math.max(0, user.subscription.freeGenerationsLimit - user.subscription.freeGenerationsUsed);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header Profile Bar */}
          <div className="p-5 border-b border-zinc-800/50 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{user.name}</h3>
                  {user.subscription.isPro ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro Member
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                      Free Creator
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quota & Credits Indicator Banner */}
          <div
            className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold">
                  Available Credits:{' '}
                  <span className="text-emerald-500 font-bold font-mono">
                    {remainingQuota} {user.subscription.isPro ? '' : 'Left'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {user.subscription.isPro
                    ? 'Active Pro Plan — Watermark-Free 1080p 60 FPS'
                    : `${user.subscription.freeGenerationsUsed} / ${user.subscription.freeGenerationsLimit} free compiles used`}
                </p>
              </div>
            </div>

            {!user.subscription.isPro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-800/40 px-5 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('creations')}
              className={`pb-2.5 px-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'creations'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>30-Day Creations ({creations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`pb-2.5 px-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Payment & Billing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`pb-2.5 px-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* TAB 1: 30-DAY CREATIONS */}
            {activeTab === 'creations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Stored securely for 30 days. Restore or share anytime.</span>
                  <span className="font-mono text-[11px]">{creations.length} items</span>
                </div>

                {creations.length === 0 ? (
                  <div
                    className={`text-center py-10 px-4 rounded-xl border border-dashed ${
                      isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-300 text-zinc-400'
                    }`}
                  >
                    <FileVideo className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No saved creations yet.</p>
                    <p className="text-[11px] mt-1">
                      Every time you export an MP4 or GIF, it will automatically back up here for 30 days.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {creations.map((item) => {
                      const daysAgo = Math.floor(
                        (Date.now() - item.createdAt) / (1000 * 60 * 60 * 24)
                      );
                      const daysLeft = Math.max(0, 30 - daysAgo);

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            onLoadCreation(item);
                            onClose();
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isDark
                              ? 'bg-zinc-800/40 hover:bg-zinc-800/90 border-zinc-800 hover:border-emerald-500/50'
                              : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                              <FileVideo className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs truncate">
                                  {item.personAName} & {item.personBName}
                                </h4>
                                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  {item.format.toUpperCase()} • {item.resolution}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                                <span>{item.messageCount} messages</span>
                                <span>•</span>
                                <span className="text-amber-500/90 font-medium">
                                  {daysLeft} days remaining
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShareCreation(item);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                              title="Share this creation"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onLoadCreation(item);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteCreation(item.id, e)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete creation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BILLING & PAYMENTS */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-400">Current Subscription</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.subscription.isPro
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {user.subscription.isPro ? 'Pro Active' : 'Free Tier'}
                    </span>
                  </div>
                  <div className="text-sm font-bold">
                    {user.subscription.isPro
                      ? 'Pro Creator License (Unlimited Exports)'
                      : '15 Free Credits Plan'}
                  </div>
                  {user.subscription.licenseKey && (
                    <div className="mt-2 text-xs font-mono text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <span>License: {user.subscription.licenseKey}</span>
                      <span className="text-emerald-500 text-[11px] font-semibold">Active</span>
                    </div>
                  )}
                </div>

                {/* Invoices List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Payment History & Receipts
                  </h4>
                  {payments.length === 0 ? (
                    <div
                      className={`text-center py-6 px-4 rounded-xl border border-dashed ${
                        isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-300 text-zinc-400'
                      }`}
                    >
                      <Receipt className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No payment records yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold">{p.plan}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              {p.date} • {p.method}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-500">
                              {p.amount > 0 ? `${p.amount} ${p.currency}` : 'Free'}
                            </div>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT DETAILS */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Email Account
                    </label>
                    <div className="text-xs font-mono font-medium">{user.email}</div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Display Name
                    </label>
                    <div className="text-xs font-medium">{user.name}</div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Account Type
                    </label>
                    <div className="text-xs font-medium capitalize">
                      {user.provider} authentication
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal for specific creation */}
      {selectedShareCreation && (
        <ShareModal
          isOpen={!!selectedShareCreation}
          onClose={() => setSelectedShareCreation(null)}
          title={`${selectedShareCreation.personAName} & ${selectedShareCreation.personBName} WhatsApp Chat`}
          senderName={selectedShareCreation.personAName}
          contactName={selectedShareCreation.personBName}
          format={selectedShareCreation.format}
          rawText={selectedShareCreation.rawTranscript}
          appThemeMode={appThemeMode}
        />
      )}

    </>
  );
};

