import React, { useRef, useState } from 'react';
import {
  User,
  Upload,
  Clock,
  BatteryCharging,
  ArrowLeftRight,
  Smartphone,
  Check,
  Globe,
  Sparkles,
  Smile,
  Shield,
  Palette,
} from 'lucide-react';
import { ContactSettings, AndroidDeviceModel, AndroidNavStyle } from '../types';
import {
  ARABIC_AVATARS,
  CARTOON_AVATARS,
  REALISTIC_AVATARS,
  AvatarItem,
} from '../constants/avatarLibrary';

interface ProfileCustomizerProps {
  contact: ContactSettings;
  onChangeContact: (contact: ContactSettings) => void;
}

export const ProfileCustomizer: React.FC<ProfileCustomizerProps> = ({
  contact,
  onChangeContact,
}) => {
  const fileInputBRef = useRef<HTMLInputElement>(null);
  const fileInputARef = useRef<HTMLInputElement>(null);

  // Active target for avatar assignment: 'B' (Contact / left) or 'A' (Sender / right)
  const [activePersonTab, setActivePersonTab] = useState<'B' | 'A'>('B');
  // Avatar Category Filter
  const [avatarCategory, setAvatarCategory] = useState<'arabic' | 'cartoon' | 'realistic' | 'custom'>('arabic');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          if (target === 'B') {
            onChangeContact({ ...contact, avatarUrl: dataUrl });
          } else {
            onChangeContact({ ...contact, senderAvatarUrl: dataUrl });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Swap Person A and Person B
  const handleSwapRoles = () => {
    onChangeContact({
      ...contact,
      contactName: contact.senderName,
      senderName: contact.contactName,
      avatarUrl: contact.senderAvatarUrl || contact.avatarUrl,
      senderAvatarUrl: contact.avatarUrl,
    });
  };

  const currentSelectedUrl =
    activePersonTab === 'B' ? contact.avatarUrl : contact.senderAvatarUrl || '';

  const handleSelectPreset = (avatar: AvatarItem) => {
    if (activePersonTab === 'B') {
      onChangeContact({ ...contact, avatarUrl: avatar.url });
    } else {
      onChangeContact({ ...contact, senderAvatarUrl: avatar.url });
    }
  };

  return (
    <div id="profile-customizer-card" className="space-y-4 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4">
      {/* Header with Title & Swap Button */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Android WhatsApp Profile & Device</h3>
            <p className="text-[11px] text-zinc-400">
              Interchangeable avatars (Arabic, Cartoons, Custom) & Android models
            </p>
          </div>
        </div>

        {/* Swap Roles Button */}
        <button
          type="button"
          onClick={handleSwapRoles}
          title="Swap Person A and Person B roles & avatars"
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>Swap Roles</span>
        </button>
      </div>

      {/* Person Dual Selector: Person B (Contact) vs Person A (Sender) */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl">
        {/* Contact (Person B) Card */}
        <button
          type="button"
          onClick={() => setActivePersonTab('B')}
          className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
            activePersonTab === 'B'
              ? 'bg-zinc-850 border border-emerald-500/40 shadow-xs'
              : 'hover:bg-zinc-900 border border-transparent opacity-70 hover:opacity-100'
          }`}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500/50 bg-zinc-800 flex-shrink-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt="Contact Avatar"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                {contact.contactName.charAt(0) || 'C'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider block">
              Contact (Top Bar)
            </span>
            <span className="text-xs font-semibold text-zinc-100 truncate block">
              {contact.contactName || 'Contact'}
            </span>
          </div>
        </button>

        {/* Sender (Person A) Card */}
        <button
          type="button"
          onClick={() => setActivePersonTab('A')}
          className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
            activePersonTab === 'A'
              ? 'bg-zinc-850 border border-cyan-500/40 shadow-xs'
              : 'hover:bg-zinc-900 border border-transparent opacity-70 hover:opacity-100'
          }`}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/50 bg-zinc-800 flex-shrink-0">
            {contact.senderAvatarUrl ? (
              <img
                src={contact.senderAvatarUrl}
                alt="Sender Avatar"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-cyan-800 flex items-center justify-center text-white font-bold text-sm">
                {contact.senderName.charAt(0) || 'Me'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider block">
              Sender (Right)
            </span>
            <span className="text-xs font-semibold text-zinc-100 truncate block">
              {contact.senderName || 'Me'}
            </span>
          </div>
        </button>
      </div>

      {/* Name Input for active selected person */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
            Sender Name (Person A / Me)
          </label>
          <input
            id="input-sender-name"
            type="text"
            value={contact.senderName}
            onChange={(e) => onChangeContact({ ...contact, senderName: e.target.value })}
            placeholder="Me"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
            Contact Name (Person B / Header)
          </label>
          <input
            id="input-contact-name"
            type="text"
            value={contact.contactName}
            onChange={(e) => onChangeContact({ ...contact, contactName: e.target.value })}
            placeholder="Alex Rivers"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* AVATAR GALLERY SECTION */}
      <div className="space-y-3 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Choose Avatar for:{' '}
              <strong className={activePersonTab === 'B' ? 'text-emerald-400' : 'text-cyan-400'}>
                {activePersonTab === 'B' ? `${contact.contactName} (Contact)` : `${contact.senderName} (Sender)`}
              </strong>
            </span>
          </label>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setAvatarCategory('arabic')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              avatarCategory === 'arabic'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🇸🇦 Arabic Culture</span>
          </button>

          <button
            type="button"
            onClick={() => setAvatarCategory('cartoon')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              avatarCategory === 'cartoon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🎭 Cartoony & Funny</span>
          </button>

          <button
            type="button"
            onClick={() => setAvatarCategory('realistic')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              avatarCategory === 'realistic'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📸 Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setAvatarCategory('custom')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              avatarCategory === 'custom'
                ? 'bg-zinc-800 text-cyan-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🎨 Custom</span>
          </button>
        </div>

        {/* Category Avatars Grid */}
        {avatarCategory === 'arabic' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ARABIC_AVATARS.map((item) => {
              const isSelected = currentSelectedUrl === item.url;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <span className="text-[11px] font-semibold text-zinc-200 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {avatarCategory === 'cartoon' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CARTOON_AVATARS.map((item) => {
              const isSelected = currentSelectedUrl === item.url;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-600/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <span className="text-[11px] font-semibold text-zinc-200 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {avatarCategory === 'realistic' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {REALISTIC_AVATARS.map((item) => {
              const isSelected = currentSelectedUrl === item.url;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-600/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <span className="text-[11px] font-semibold text-zinc-200 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {avatarCategory === 'custom' && (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  activePersonTab === 'B'
                    ? fileInputBRef.current?.click()
                    : fileInputARef.current?.click()
                }
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </button>
              <input
                ref={fileInputBRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'B')}
                className="hidden"
              />
              <input
                ref={fileInputARef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'A')}
                className="hidden"
              />
              <span className="text-[11px] text-zinc-500">Supports JPG, PNG, GIF, SVG</span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Or Paste Direct Image Web URL:
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
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ANDROID DEVICE & NAVIGATION SELECTION */}
      <div className="space-y-3 pt-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Device Model</span>
          </label>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            Center Punch-Hole Camera
          </span>
        </div>

        {/* Samsung vs Xiaomi toggle */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeContact({ ...contact, androidDevice: 'samsung' })}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              contact.androidDevice === 'samsung'
                ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-100">Samsung Galaxy</span>
              {contact.androidDevice === 'samsung' && (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              S24 Ultra sharp titanium frame, One UI status bar & icons
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangeContact({ ...contact, androidDevice: 'xiaomi' })}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              contact.androidDevice === 'xiaomi'
                ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-100">Xiaomi 17 Pro</span>
              {contact.androidDevice === 'xiaomi' && (
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              HyperOS curved chassis, micro punch hole & battery pill
            </p>
          </button>
        </div>

        {/* Android Navigation Bar Style Toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-300">Android Navigation Style:</span>
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onChangeContact({ ...contact, navStyle: 'gestures' })}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                contact.navStyle === 'gestures'
                  ? 'bg-zinc-800 text-emerald-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Gesture Bar
            </button>
            <button
              type="button"
              onClick={() => onChangeContact({ ...contact, navStyle: 'buttons' })}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                contact.navStyle === 'buttons'
                  ? 'bg-zinc-800 text-emerald-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              3-Buttons (||| ▢ &lt;)
            </button>
          </div>
        </div>
      </div>

      {/* Online Status Mode & Phone Status Controls */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
        {/* Status Mode */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
            WhatsApp Contact Subtitle
          </label>
          <select
            id="select-status-mode"
            value={contact.statusMode}
            onChange={(e) =>
              onChangeContact({
                ...contact,
                statusMode: e.target.value as any,
              })
            }
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="online">online</option>
            <option value="typing">typing...</option>
            <option value="lastSeen">last seen recently</option>
            <option value="custom">Custom Text</option>
          </select>

          {contact.statusMode === 'custom' && (
            <input
              type="text"
              value={contact.customStatusText}
              onChange={(e) =>
                onChangeContact({ ...contact, customStatusText: e.target.value })
              }
              placeholder="e.g. في المجلس ☕️"
              className="mt-2 w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
            />
          )}
        </div>

        {/* Smartphone Status Bar overrides */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              Android Clock
            </label>
            <input
              type="text"
              value={contact.phoneTime}
              onChange={(e) =>
                onChangeContact({ ...contact, phoneTime: e.target.value })
              }
              placeholder="09:41"
              className="w-16 text-right bg-zinc-950 border border-zinc-700/80 rounded px-1.5 py-0.5 text-xs text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-zinc-400" />
              Battery: {contact.batteryLevel}%
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={contact.batteryLevel}
              onChange={(e) =>
                onChangeContact({ ...contact, batteryLevel: Number(e.target.value) })
              }
              className="w-20 accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
