import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Smartphone,
  Clock,
  BatteryCharging,
  ArrowLeftRight,
  Sparkles,
  Check,
  Upload,
  Sliders,
  Moon,
  Sun,
  Palette,
  Shield,
  Zap,
  Download,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ContactSettings,
  AnimationSettings,
  ThemeColors,
  ChatThemeMode,
  AndroidDeviceModel,
  AndroidNavStyle,
  ExportFormat,
  ExportResolution,
} from '../types';
import {
  ARABIC_AVATARS,
  CARTOON_AVATARS,
  REALISTIC_AVATARS,
  AvatarItem,
} from '../constants/avatarLibrary';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactSettings;
  onChangeContact: (contact: ContactSettings) => void;
  animSettings: AnimationSettings;
  onChangeAnimSettings: (settings: AnimationSettings) => void;
  theme: ThemeColors;
  onToggleTheme: () => void;
  exportFormat?: ExportFormat;
  onChangeExportFormat?: (fmt: ExportFormat) => void;
  exportResolution?: ExportResolution;
  onChangeExportResolution?: (res: ExportResolution) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  contact,
  onChangeContact,
  animSettings,
  onChangeAnimSettings,
  theme,
  onToggleTheme,
  exportFormat = 'mp4',
  onChangeExportFormat,
  exportResolution = '1080p',
  onChangeExportResolution,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'device' | 'status' | 'playback' | 'theme' | 'export'>('profile');
  const [activePersonTab, setActivePersonTab] = useState<'B' | 'A'>('B');
  const [avatarCategory, setAvatarCategory] = useState<'arabic' | 'cartoon' | 'realistic' | 'custom'>('arabic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentSelectedUrl =
    activePersonTab === 'B' ? contact.avatarUrl : contact.senderAvatarUrl || '';

  const handleSelectPreset = (avatar: AvatarItem) => {
    if (activePersonTab === 'B') {
      onChangeContact({ ...contact, avatarUrl: avatar.url });
    } else {
      onChangeContact({ ...contact, senderAvatarUrl: avatar.url });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          if (activePersonTab === 'B') {
            onChangeContact({ ...contact, avatarUrl: dataUrl });
          } else {
            onChangeContact({ ...contact, senderAvatarUrl: dataUrl });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwapRoles = () => {
    onChangeContact({
      ...contact,
      contactName: contact.senderName,
      senderName: contact.contactName,
      avatarUrl: contact.senderAvatarUrl || contact.avatarUrl,
      senderAvatarUrl: contact.avatarUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">WhatsApp Settings</h2>
              <p className="text-xs text-zinc-400">
                Customize profiles, avatars, Android models, and status bar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-zinc-800 bg-zinc-950/40 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profiles & Avatars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'device'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Device</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Status & Clock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playback')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'playback'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Playback Speed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Quality</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: PROFILES & AVATARS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Swap roles bar */}
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-300">
                  Select which participant to customize:
                </span>
                <button
                  type="button"
                  onClick={handleSwapRoles}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>⇄ Swap Person A & B</span>
                </button>
              </div>

              {/* Dual Person Toggle: Person B (Contact) vs Person A (Sender) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivePersonTab('B')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    activePersonTab === 'B'
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500'
                      : 'bg-zinc-950/60 border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-emerald-500/40 bg-zinc-800 flex-shrink-0">
                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt="Contact"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                        {contact.contactName.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider block">
                      Person B (Contact)
                    </span>
                    <span className="text-xs font-semibold text-zinc-100 truncate block">
                      {contact.contactName}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePersonTab('A')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    activePersonTab === 'A'
                      ? 'bg-cyan-950/20 border-cyan-500/50 ring-1 ring-cyan-500'
                      : 'bg-zinc-950/60 border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-cyan-500/40 bg-zinc-800 flex-shrink-0">
                    {contact.senderAvatarUrl ? (
                      <img
                        src={contact.senderAvatarUrl}
                        alt="Sender"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-cyan-700 flex items-center justify-center text-white font-bold text-sm">
                        {contact.senderName.charAt(0) || 'Me'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider block">
                      Person A (Sender)
                    </span>
                    <span className="text-xs font-semibold text-zinc-100 truncate block">
                      {contact.senderName}
                    </span>
                  </div>
                </button>
              </div>

              {/* Name Editor Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Contact Name (Person B - Header)
                  </label>
                  <input
                    type="text"
                    value={contact.contactName}
                    onChange={(e) => onChangeContact({ ...contact, contactName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Sender Name (Person A - Me)
                  </label>
                  <input
                    type="text"
                    value={contact.senderName}
                    onChange={(e) => onChangeContact({ ...contact, senderName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Avatar Categories */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    Avatar Library for:{' '}
                    <strong className={activePersonTab === 'B' ? 'text-emerald-400' : 'text-cyan-400'}>
                      {activePersonTab === 'B' ? contact.contactName : contact.senderName}
                    </strong>
                  </span>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('arabic')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                      avatarCategory === 'arabic'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    🇸🇦 Arabic Culture
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('cartoon')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                      avatarCategory === 'cartoon'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    🎭 Cartoony & Funny
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('realistic')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                      avatarCategory === 'realistic'
                        ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    📸 Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('custom')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                      avatarCategory === 'custom'
                        ? 'bg-zinc-800 text-cyan-400 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    🎨 Custom
                  </button>
                </div>

                {/* Avatars Grid */}
                {avatarCategory === 'arabic' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {ARABIC_AVATARS.map((item) => {
                      const isSelected = currentSelectedUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectPreset(item)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-200 truncate w-full">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {avatarCategory === 'cartoon' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {CARTOON_AVATARS.map((item) => {
                      const isSelected = currentSelectedUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectPreset(item)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-amber-600/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-200 truncate w-full">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {avatarCategory === 'realistic' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {REALISTIC_AVATARS.map((item) => {
                      const isSelected = currentSelectedUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectPreset(item)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-cyan-600/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-200 truncate w-full">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {avatarCategory === 'custom' && (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload From Device</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <span className="text-xs text-zinc-400">Supports PNG, JPG, GIF, SVG</span>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Or Paste Web Image URL:
                      </label>
                      <input
                        type="url"
                        value={currentSelectedUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activePersonTab === 'B') {
                            onChangeContact({ ...contact, avatarUrl: val });
                          } else {
                            onChangeContact({ ...contact, senderAvatarUrl: val });
                          }
                        }}
                        placeholder="https://example.com/avatar.png"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID DEVICE & NAVIGATION */}
          {activeTab === 'device' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-300">Choose Android Hardware Model</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChangeContact({ ...contact, androidDevice: 'samsung' })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    contact.androidDevice === 'samsung'
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-100">Samsung Galaxy S24 Ultra</span>
                    {contact.androidDevice === 'samsung' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sharp titanium chassis, One UI status icons, center punch-hole camera
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeContact({ ...contact, androidDevice: 'xiaomi' })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    contact.androidDevice === 'xiaomi'
                      ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-100">Xiaomi 17 Pro</span>
                    {contact.androidDevice === 'xiaomi' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Curved aerodynamic frame, HyperOS layout, micro punch-hole camera
                  </p>
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-300">Android Navigation Style</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeContact({ ...contact, navStyle: 'gestures' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      contact.navStyle === 'gestures'
                        ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-zinc-100 block">Gesture Line (Modern)</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Minimal swipe bar pill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeContact({ ...contact, navStyle: 'buttons' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      contact.navStyle === 'buttons'
                        ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-zinc-100 block">3-Button Navigation</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Classic (||| ▢ &lt;)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATUS & SYSTEM CLOCK */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  WhatsApp Contact Subtitle Status
                </label>
                <select
                  value={contact.statusMode}
                  onChange={(e) => onChangeContact({ ...contact, statusMode: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="online">online</option>
                  <option value="typing">typing...</option>
                  <option value="lastSeen">last seen recently</option>
                  <option value="custom">Custom Text...</option>
                </select>

                {contact.statusMode === 'custom' && (
                  <input
                    type="text"
                    value={contact.customStatusText}
                    onChange={(e) => onChangeContact({ ...contact, customStatusText: e.target.value })}
                    placeholder="e.g. في المجلس ☕️"
                    className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Android Clock Time
                  </label>
                  <input
                    type="text"
                    value={contact.phoneTime}
                    onChange={(e) => onChangeContact({ ...contact, phoneTime: e.target.value })}
                    placeholder="09:41"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-zinc-400" />
                    Battery Level: {contact.batteryLevel}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={contact.batteryLevel}
                    onChange={(e) => onChangeContact({ ...contact, batteryLevel: Number(e.target.value) })}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLAYBACK & TIMING */}
          {activeTab === 'playback' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Playback & Typing Speed Multiplier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.75, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onChangeAnimSettings({ ...animSettings, speedMultiplier: spd })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        animSettings.speedMultiplier === spd
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {spd}x Speed
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Loop Playback</span>
                  <span className="text-[11px] text-zinc-400 block">
                    Automatically replay chat animation from beginning
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={animSettings.loop}
                  onChange={(e) => onChangeAnimSettings({ ...animSettings, loop: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Audio & Sound FX</span>
                  <span className="text-[11px] text-zinc-400 block">
                    Play WhatsApp message chimes and typing sounds during animation
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(animSettings.soundEffectsEnabled)}
                  onChange={(e) =>
                    onChangeAnimSettings({
                      ...animSettings,
                      soundEffectsEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 5: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-300">WhatsApp Theme Color</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (theme.mode !== 'dark') onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    theme.mode === 'dark'
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-cyan-400" />
                       Dark Mode
                    </span>
                    {theme.mode === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-4 h-4 rounded-full bg-[#111b21] border border-zinc-700" />
                    <span className="w-4 h-4 rounded-full bg-[#005c4b]" />
                    <span className="w-4 h-4 rounded-full bg-[#202c33]" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Original WhatsApp Dark Mode (#111b21 & #005c4b)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme.mode !== 'light') onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    theme.mode === 'light'
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      Light Mode
                    </span>
                    {theme.mode === 'light' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-4 h-4 rounded-full bg-[#efeae2] border border-zinc-400" />
                    <span className="w-4 h-4 rounded-full bg-[#d9fdd3] border border-zinc-300" />
                    <span className="w-4 h-4 rounded-full bg-[#008069]" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Original WhatsApp Light Mode (#efeae2 & #d9fdd3)
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: EXPORT FORMAT & QUALITY */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-zinc-300 mb-2">Default Export Format</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeExportFormat?.('mp4')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      exportFormat === 'mp4'
                        ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <Film className="w-4 h-4 text-emerald-400" />
                        MP4 Video
                      </span>
                      {exportFormat === 'mp4' && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Smooth 60 FPS video recording. Ideal for Reels, Shorts, and video players.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeExportFormat?.('gif')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      exportFormat === 'gif'
                        ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                        Animated GIF
                      </span>
                      {exportFormat === 'gif' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Lightweight looping graphic. Perfect for forum embeds, messaging, and docs.
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-300 mb-2">Quality & Resolution Scaling</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: '1080p', label: '1080p Full HD', desc: '1080 × 1920 (Highest detail & clarity)' },
                    { key: '720p', label: '720p HD', desc: '720 × 1280 (Recommended balance)' },
                    { key: '480p', label: '480p SD', desc: '480 × 854 (Fast & compact file size)' },
                    { key: '360p', label: '360p Low', desc: '360 × 640 (Minimal bandwidth / ultra light)' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onChangeExportResolution?.(item.key as ExportResolution)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        exportResolution === item.key
                          ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-100">{item.label}</span>
                        {exportResolution === item.key && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10.5px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
