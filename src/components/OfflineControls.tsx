import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Crop,
  Bug,
  SunMedium,
  Feather,
  Paintbrush
} from 'lucide-react';
import { OfflineModeSettings, OfflineStyle, OfflineBackgroundMode, OfflineDebugLayers } from '../types';
import { DEFAULT_OFFLINE_SETTINGS } from '../utils/offlineEngine';
import { DebugLayersModal } from './DebugLayersModal';

interface OfflineControlsProps {
  settings: OfflineModeSettings;
  onChange: (newSettings: OfflineModeSettings) => void;
  isOfflineReady?: boolean;
  debugLayers?: OfflineDebugLayers | null;
}

export const OfflineControls: React.FC<OfflineControlsProps> = ({
  settings,
  onChange,
  isOfflineReady = true,
  debugLayers
}) => {
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [devClicks, setDevClicks] = useState(0);

  // Check if debug mode was requested via URL query (?debug=true) or developer clicks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isQueryDebug = window.location.search.includes('debug=true');
      if (isQueryDebug && !settings.debugMode) {
        onChange({ ...settings, debugMode: true });
      }
    }
  }, []);

  const handleStyleChange = (style: OfflineStyle) => {
    onChange({ ...settings, style });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_OFFLINE_SETTINGS });
  };

  // Secret 3-click activator on Privacy Shield for developers
  const handleBadgeClick = () => {
    const nextClicks = devClicks + 1;
    setDevClicks(nextClicks);
    if (nextClicks >= 3) {
      const nextDebug = !settings.debugMode;
      onChange({ ...settings, debugMode: nextDebug });
      setDevClicks(0);
    }
  };

  const solidColorPresets = ['#1e293b', '#0f172a', '#1e3a8a', '#14532d', '#701a75', '#78350f'];

  return (
    <div className="space-y-4">
      {/* Privacy Guarantee Banner (Mandatory verified statement) */}
      <div
        onClick={handleBadgeClick}
        className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 cursor-pointer hover:bg-emerald-950/60 transition-colors select-none"
        title="Offline Mode is 100% private. Click 3 times to toggle Developer Debug Mode."
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-300 font-cartoon">100% Private & Local</p>
            {settings.debugMode && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Dev Mode Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-200/90 leading-snug">
            Offline Mode processes your image locally on this device. Your image is not uploaded.
          </p>
        </div>
      </div>

      {/* Offline Status Badge & Action Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-400">
            {isOfflineReady ? 'Offline Engine Ready' : 'Initializing local pipeline...'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {settings.debugMode && (
            <button
              type="button"
              onClick={() => setIsDebugModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              title="Open Developer Vision Inspector"
            >
              <Bug className="w-3 h-3 text-purple-400" />
              <span>Debug Layers</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-800/60"
            title="Reset Offline Controls to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Section 1: Illustration Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span>Illustration Style</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Non-AI NPR Pipeline</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'clean-cartoon' as OfflineStyle,
              name: 'Clean Cartoon',
              desc: 'Smooth & vibrant',
              icon: Sparkles
            },
            {
              id: 'cel-shaded' as OfflineStyle,
              name: 'Cel-Shaded',
              desc: 'Graphic shadows',
              icon: Layers
            },
            {
              id: 'comic' as OfflineStyle,
              name: 'Comic',
              desc: 'Inked contours',
              icon: Sliders
            }
          ].map((item) => {
            const isSelected = settings.style === item.id || (item.id === 'cel-shaded' && settings.style === 'soft-illustration');
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleStyleChange(item.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold font-cartoon block leading-tight">{item.name}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Fine-Tuning Illustration Sliders */}
      <div className="space-y-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90">
        {/* Cartoon Abstraction Strength */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Paintbrush className="w-3.5 h-3.5 text-blue-400" />
              <span>Cartoon Strength</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.cartoonStrength}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={settings.cartoonStrength}
            onChange={(e) =>
              onChange({ ...settings, cartoonStrength: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Subtle</span>
            <span>Balanced</span>
            <span>Graphic</span>
          </div>
        </div>

        {/* Color Simplification */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Color Simplification</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.colorSimplification <= 35
                ? 'Detailed'
                : settings.colorSimplification <= 70
                ? 'Balanced Cel'
                : 'Flat Graphic'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={settings.colorSimplification}
            onChange={(e) =>
              onChange({ ...settings, colorSimplification: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Cel-Shading Shadow Strength */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5 text-orange-400" />
              <span>Shadow Strength</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.shadowStrength}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={settings.shadowStrength}
            onChange={(e) =>
              onChange({ ...settings, shadowStrength: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Soft Light</span>
            <span>Cel Shading</span>
            <span>Deep Shadows</span>
          </div>
        </div>

        {/* Outline Strength */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Outline Strength</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.outlineStrength}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.outlineStrength}
            onChange={(e) =>
              onChange({ ...settings, outlineStrength: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>None</span>
            <span>Warm Contours</span>
            <span>Bold Ink</span>
          </div>
        </div>

        {/* Smoothing (Texture Removal) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-emerald-400" />
              <span>Texture Smoothing</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.smoothing <= 35
                ? 'Crisp Shapes'
                : settings.smoothing <= 70
                ? 'Silky Surface'
                : 'Ultra Smooth'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={settings.smoothing}
            onChange={(e) => onChange({ ...settings, smoothing: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Natural</span>
            <span>Kuwahara Filter</span>
            <span>Flat Painted</span>
          </div>
        </div>

        {/* Saturation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Saturation</span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {settings.saturation}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={settings.saturation}
            onChange={(e) => onChange({ ...settings, saturation: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Muted Pastel</span>
            <span>Natural</span>
            <span>Vibrant Anime</span>
          </div>
        </div>
      </div>

      {/* Section 3: Portrait Framing & Composition */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Crop className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Auto-Crop to Portrait</div>
            <p className="text-[10px] text-slate-400">Head-and-shoulders composition based on face detection</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={!!settings.autoCropPortrait}
            onChange={(e) => onChange({ ...settings, autoCropPortrait: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Section 4: Background Treatment */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Background Treatment</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'simplified' as OfflineBackgroundMode, label: 'Simplified' },
            { id: 'soft-blur' as OfflineBackgroundMode, label: 'Soft Blur' },
            { id: 'flat-color' as OfflineBackgroundMode, label: 'Flat Color' },
            { id: 'simple-gradient' as OfflineBackgroundMode, label: 'Simple Gradient' }
          ].map((bg) => {
            const isSelected = settings.backgroundMode === bg.id || (bg.id === 'flat-color' && settings.backgroundMode === 'solid-color');
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => onChange({ ...settings, backgroundMode: bg.id })}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{bg.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>

        {/* Flat Color Backdrop Palette */}
        {(settings.backgroundMode === 'flat-color' || settings.backgroundMode === 'solid-color') && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Palette:</span>
            <div className="flex items-center gap-1.5">
              {solidColorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange({ ...settings, solidColor: color })}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                    settings.solidColor === color
                      ? 'border-white scale-110 shadow-sm'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <input
                type="color"
                value={settings.solidColor || '#1e293b'}
                onChange={(e) => onChange({ ...settings, solidColor: e.target.value })}
                className="w-6 h-6 rounded-full border border-slate-700 bg-transparent cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>
        )}
      </div>

      {/* Developer Debug Layers Modal */}
      <DebugLayersModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        debugLayers={debugLayers}
      />
    </div>
  );
};
