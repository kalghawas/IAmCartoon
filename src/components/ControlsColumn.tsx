import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Crop,
  Sparkles,
  Dice5,
  Lock,
  Unlock,
  RefreshCw,
  Sliders,
  ChevronDown,
  Smile,
  Shield,
  Hand,
  Navigation,
  Lightbulb,
  User,
  Shirt,
  Briefcase,
  Feather,
  Layers,
  Zap,
  Palette,
  Cpu,
  Edit3,
  Pocket,
  Check,
  Heart,
  Coffee,
  Crown,
  Anchor,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import {
  ArtStyle,
  ArtStyleId,
  PoseOption,
  PoseId,
  WardrobeOption,
  WardrobeId,
  ExpressionOption,
  ExpressionId,
  OfflineModeSettings,
  OfflineDebugLayers,
  DailyUsageState
} from '../types';
import { ART_STYLES, POSES, WARDROBES, EXPRESSIONS } from '../utils/constants';
import { StyleSampleModal } from './StyleSampleModal';
import { OfflineControls } from './OfflineControls';
import { DEFAULT_OFFLINE_SETTINGS } from '../utils/offlineEngine';

interface ControlsColumnProps {
  // Free Tier (1/Day) vs Paid Tier Mode Selection
  isFreeTier?: boolean;
  onToggleFreeTier?: (isFree: boolean) => void;
  dailyUsage?: DailyUsageState;

  // Legacy / Local fallback compatibility
  isOfflineMode?: boolean;
  onToggleOfflineMode?: (offline: boolean) => void;
  offlineSettings?: OfflineModeSettings;
  onOfflineSettingsChange?: (settings: OfflineModeSettings) => void;
  isOfflineReady?: boolean;
  debugLayers?: OfflineDebugLayers | null;

  // Image state
  currentImage: string | null;
  currentImageName: string;
  onImageChange: (imageDataUrl: string, name: string) => void;
  onOpenCropModal: () => void;

  // Selections
  selectedStyle: ArtStyle;
  onSelectStyle: (style: ArtStyle) => void;
  selectedPose: PoseOption;
  onSelectPose: (pose: PoseOption) => void;
  selectedWardrobe: WardrobeOption;
  onSelectWardrobe: (wardrobe: WardrobeOption) => void;
  customWardrobeText: string;
  onCustomWardrobeTextChange: (text: string) => void;
  selectedExpression: ExpressionOption;
  onSelectExpression: (expression: ExpressionOption) => void;

  // Seed & Modifiers
  seed: number;
  isSeedLocked: boolean;
  onToggleSeedLock: () => void;
  onRandomizeSeed: () => void;
  onSeedChange: (newSeed: number) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (notes: string) => void;

  // Generation state
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ControlsColumn: React.FC<ControlsColumnProps> = ({
  isFreeTier = true,
  onToggleFreeTier,
  dailyUsage,
  isOfflineMode = false,
  onToggleOfflineMode,
  offlineSettings,
  onOfflineSettingsChange,
  isOfflineReady = true,
  debugLayers,
  currentImage,
  currentImageName,
  onImageChange,
  onOpenCropModal,
  selectedStyle,
  onSelectStyle,
  selectedPose,
  onSelectPose,
  selectedWardrobe,
  onSelectWardrobe,
  customWardrobeText,
  onCustomWardrobeTextChange,
  selectedExpression,
  onSelectExpression,
  seed,
  isSeedLocked,
  onToggleSeedLock,
  onRandomizeSeed,
  onSeedChange,
  additionalNotes,
  onAdditionalNotesChange,
  isGenerating,
  onGenerate
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper for pose icons
  const renderPoseIcon = (icon: string, className = "w-4 h-4") => {
    switch (icon) {
      case 'Heart':
        return <Heart className={className} />;
      case 'Coffee':
      case 'CupSoda':
        return <Coffee className={className} />;
      case 'Feather':
        return <Feather className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Hand':
        return <Hand className={className} />;
      case 'Navigation':
        return <Navigation className={className} />;
      case 'Lightbulb':
        return <Lightbulb className={className} />;
      case 'User':
      default:
        return <User className={className} />;
    }
  };

  // Helper for style icons
  const renderStyleIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={`${className} text-amber-400`} />;
      case 'Layers':
        return <Layers className={`${className} text-sky-400`} />;
      case 'Zap':
        return <Zap className={`${className} text-blue-400`} />;
      case 'Palette':
        return <Palette className={`${className} text-blue-400`} />;
      case 'Cpu':
        return <Cpu className={`${className} text-cyan-400`} />;
      case 'Smile':
        return <Smile className={`${className} text-yellow-400`} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Helper for wardrobe icons
  const renderWardrobeIcon = (icon: string, className = "w-4 h-4") => {
    switch (icon) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Anchor':
        return <Anchor className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Pocket':
        return <Pocket className={className} />;
      case 'Feather':
        return <Feather className={className} />;
      case 'Edit3':
        return <Edit3 className={className} />;
      case 'Shirt':
      default:
        return <Shirt className={className} />;
    }
  };

  // File upload handlers
  const handleFileChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Unsupported file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      alert(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 25MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageChange(dataUrl, file.name);
      }
    };
    reader.onerror = () => {
      alert('Image cannot be decoded or is corrupted.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-slate-800/80 overflow-hidden select-none">
      {/* Scrollable controls panel */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-5">
        {/* Mode Segmented Switcher (Free Tier 1/Day vs Paid Tier) */}
        <div className="p-1 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              onToggleFreeTier?.(true);
              onToggleOfflineMode?.(false);
            }}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-cartoon font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isFreeTier
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Free Tier (1/Day)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleFreeTier?.(false);
              onToggleOfflineMode?.(false);
            }}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-cartoon font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isFreeTier
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Paid Tier</span>
          </button>
        </div>

        {/* Free Tier Status & Daily Allowance Banner */}
        {isFreeTier && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 font-cartoon">
                <Zap className="w-3.5 h-3.5" />
                AI Free Tier &bull; Online
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  dailyUsage?.usedToday
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {dailyUsage?.usedToday ? '0/1 Used Today' : '1/1 Available Today'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {dailyUsage?.usedToday ? (
                <span>
                  You have used today&apos;s free generation.{' '}
                  {dailyUsage.resetAt && (
                    <span className="text-amber-300 font-medium">
                      Resets {new Date(dailyUsage.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} local time.
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  Free generation available today! Powered by creator-managed AI provider fallback chain. Requires internet connection.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Section 1: Portrait Photo Upload & Actions */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-cartoon text-[13px]">
              <span className="w-1.5 h-3.5 rounded bg-blue-600"></span>
              1. Portrait Photo
            </label>

            {currentImage && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenCropModal}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
                  title="Center & Crop Face"
                  aria-label="Center & Crop Face"
                >
                  <Crop className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
                  title="Upload New Photo"
                  aria-label="Upload New Photo"
                >
                  <UploadCloud className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                </button>
              </div>
            )}
          </div>

          {/* Active Portrait Display or Dropzone */}
          {currentImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 p-2.5 flex items-center gap-3 shadow-inner">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                <img
                  src={currentImage}
                  alt="Current portrait"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{currentImageName}</div>
                <p className="text-[11px] text-slate-400 truncate">Ready for character transformation</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={onOpenCropModal}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors flex items-center gap-1.5"
                    title="Center and crop portrait"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Adjust</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    title="Choose a different image"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-600/10'
                  : 'border-slate-700/80 hover:border-blue-500/60 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2.5">
                <UploadCloud className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs font-semibold text-slate-200 text-center">
                Drag & drop portrait here, or tap to browse
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WebP</div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Offline Mode Local Settings OR AI Studio Workflow Controls */}
        {isOfflineMode ? (
          <OfflineControls
            settings={offlineSettings || DEFAULT_OFFLINE_SETTINGS}
            onChange={onOfflineSettingsChange || (() => {})}
            isOfflineReady={isOfflineReady}
            debugLayers={debugLayers}
          />
        ) : (
          <>
            {/* Section 2: Art Style Preset (Dropdown with Sample Button) */}
            <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="art-style-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-cartoon text-[13px]"
            >
              <span className="w-1.5 h-3.5 rounded bg-amber-500"></span>
              2. Art Style Preset
            </label>
            <button
              type="button"
              onClick={() => setShowSampleModal(true)}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/70 hover:bg-blue-900/70 border border-blue-700/60 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Click to view sample image of this art style"
            >
              <ImageIcon className="w-3 h-3 text-blue-400" />
              <span>Sample</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {renderStyleIcon(selectedStyle.iconName, "w-4 h-4")}
            </div>
            <select
              id="art-style-select"
              value={selectedStyle.id}
              onChange={(e) => {
                const found = ART_STYLES.find((s) => s.id === e.target.value);
                if (found) onSelectStyle(found);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-medium text-slate-100 hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors shadow-inner"
            >
              {ART_STYLES.map((style) => (
                <option key={style.id} value={style.id} className="bg-slate-900 text-slate-100 py-1">
                  {style.name} — {style.tagline}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 pl-1">{selectedStyle.promptDescription}</p>
        </div>

        {/* Section 3: Pose & Stance (Dropdown) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="pose-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-cartoon text-[13px]"
            >
              <span className="w-1.5 h-3.5 rounded bg-emerald-500"></span>
              3. Pose & Stance
            </label>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
              {renderPoseIcon(selectedPose.icon, "w-4 h-4")}
            </div>
            <select
              id="pose-select"
              value={selectedPose.id}
              onChange={(e) => {
                const found = POSES.find((p) => p.id === e.target.value);
                if (found) onSelectPose(found);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-medium text-slate-100 hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors shadow-inner"
            >
              {POSES.map((pose) => (
                <option key={pose.id} value={pose.id} className="bg-slate-900 text-slate-100 py-1">
                  {pose.label} {pose.cultureTag && pose.cultureTag !== 'Universal' ? `[${pose.cultureTag}]` : ''} ({pose.description})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Section 4: Wardrobe & Outfit (Dropdown) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="wardrobe-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-cartoon text-[13px]"
            >
              <span className="w-1.5 h-3.5 rounded bg-cyan-500"></span>
              4. Wardrobe & Outfit
            </label>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
              {renderWardrobeIcon(selectedWardrobe.icon, "w-4 h-4")}
            </div>
            <select
              id="wardrobe-select"
              value={selectedWardrobe.id}
              onChange={(e) => {
                const found = WARDROBES.find((w) => w.id === e.target.value);
                if (found) onSelectWardrobe(found);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-medium text-slate-100 hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors shadow-inner"
            >
              {WARDROBES.map((wardrobe) => (
                <option key={wardrobe.id} value={wardrobe.id} className="bg-slate-900 text-slate-100 py-1">
                  {wardrobe.label} {wardrobe.cultureTag && wardrobe.cultureTag !== 'Universal' ? `[${wardrobe.cultureTag}]` : ''} — {wardrobe.description}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Custom Outfit Input if Selected */}
          {selectedWardrobe.id === 'custom-override' && (
            <div className="pt-1">
              <input
                type="text"
                value={customWardrobeText}
                onChange={(e) => onCustomWardrobeTextChange(e.target.value)}
                placeholder="e.g. Traditional embroidered bisht or bespoke attire..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Section 5: Facial Expression (Dropdown) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="expression-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-cartoon text-[13px]"
            >
              <span className="w-1.5 h-3.5 rounded bg-rose-500"></span>
              5. Facial Expression
            </label>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-yellow-400">
              <Smile className="w-4 h-4" />
            </div>
            <select
              id="expression-select"
              value={selectedExpression.id}
              onChange={(e) => {
                const found = EXPRESSIONS.find((ex) => ex.id === e.target.value);
                if (found) onSelectExpression(found);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-medium text-slate-100 hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors shadow-inner"
            >
              {EXPRESSIONS.map((expr) => (
                <option key={expr.id} value={expr.id} className="bg-slate-900 text-slate-100 py-1">
                  {expr.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Section 6: Character Consistency Seed with Icon Buttons */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Character Identity Seed</span>
            <button
              onClick={onToggleSeedLock}
              className={`p-1.5 px-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isSeedLocked
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
              }`}
              title={isSeedLocked ? 'Seed locked: Identity preserved' : 'Variation Mode active'}
              aria-label="Toggle seed consistency lock"
            >
              {isSeedLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isSeedLocked ? 'Locked' : 'Unlocked'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seed}
              onChange={(e) => onSeedChange(parseInt(e.target.value) || 0)}
              className="flex-1 h-9 px-3 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onRandomizeSeed}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-blue-500/40 transition-colors shrink-0"
              title="Pick a random seed"
              aria-label="Pick a random seed"
            >
              <Dice5 className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Section 7: Optional Prompt Modifier */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400 block">
            Optional Notes / Atmosphere:
          </label>
          <input
            type="text"
            value={additionalNotes}
            onChange={(e) => onAdditionalNotesChange(e.target.value)}
            placeholder="e.g. Celebratory Ardah dance lighting, soft golden highlights..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        </>
        )}
      </div>

      {/* Sticky Bottom Primary Action Button */}
      <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800/80 shrink-0">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !currentImage || (isFreeTier && Boolean(dailyUsage?.usedToday))}
          className={`w-full min-h-[48px] relative flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-cartoon text-base tracking-wide shadow-xl transition-all ${
            isGenerating || !currentImage || (isFreeTier && dailyUsage?.usedToday)
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : isFreeTier
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:shadow-emerald-600/50 cursor-pointer active:scale-[0.98]'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer active:scale-[0.98]'
          }`}
          title={
            isFreeTier && dailyUsage?.usedToday
              ? 'Free daily generation used. Please wait for the daily reset or switch to Paid Tier.'
              : isFreeTier
              ? 'Generate AI cartoon using the free daily allowance'
              : 'Transform photo to cartoon character using Paid Tier credits'
          }
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{isFreeTier ? 'Generating Free AI Cartoon...' : 'Drawing Cartoon...'}</span>
            </>
          ) : isFreeTier && dailyUsage?.usedToday ? (
            <>
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Free Limit Used &bull; Switch to Paid Tier</span>
            </>
          ) : isFreeTier ? (
            <>
              <Zap className="w-5 h-5 text-emerald-300" />
              <span>Generate Free AI Cartoon (1 Left)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate Cartoon Character</span>
            </>
          )}
        </button>
      </div>

      {/* Style Sample Preview Modal */}
      <StyleSampleModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        currentStyle={selectedStyle}
        onSelectStyle={onSelectStyle}
      />
    </div>
  );
};
