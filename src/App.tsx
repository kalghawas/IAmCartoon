import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsColumn } from './components/ControlsColumn';
import { CanvasArea } from './components/CanvasArea';
import { HistoryReel } from './components/HistoryReel';
import { CropModal } from './components/CropModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { UnlockModal } from './components/UnlockModal';
import { AuthModal } from './components/AuthModal';
import {
  ArtStyle,
  PoseOption,
  WardrobeOption,
  ExpressionOption,
  HistoryItem,
  GenerationStep,
  AppSettings,
  CropSettings,
  UserCreditState,
  UserProfile,
  OfflineModeSettings,
  OfflineDebugLayers,
  DailyUsageState
} from './types';
import { ART_STYLES, POSES, WARDROBES, EXPRESSIONS, DEFAULT_SYSTEM_PROMPT } from './utils/constants';
import { generateCartoonCharacter } from './utils/geminiService';
import { DEFAULT_OFFLINE_SETTINGS } from './utils/offlineEngine';
import {
  loadUserCredits,
  saveUserCredits,
  consumeCredit,
  downloadImageWithWatermarkOption
} from './utils/creditManager';
import { getCurrentUser, setCurrentUser, syncUserCreditsToProfile } from './utils/authManager';
import { saveCreationToFirestore, loadCreationsFromFirestore } from './utils/firebase';
import { CreatorAdminModal } from './components/CreatorAdminModal';
import { fetchDailyUsage, checkIsCreator } from './utils/providerApi';

const SETTINGS_STORAGE_KEY = 'iam_cartoon_studio_settings_v2';
const HISTORY_STORAGE_KEY = 'iam_cartoon_studio_history_v2';
const OFFLINE_SETTINGS_STORAGE_KEY = 'iam_cartoon_offline_settings_v1';

export default function App() {
  // Active User Profile Authentication
  const [currentUser, setLocalCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Free Tier Daily Allowance State & Creator Admin State
  const [isFreeTier, setIsFreeTier] = useState<boolean>(true);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageState | undefined>();
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isCreatorAdminOpen, setIsCreatorAdminOpen] = useState<boolean>(false);

  // Offline Mode Fine-tuning Settings (zero AI, 100% browser-local)
  const [offlineSettings, setOfflineSettings] = useState<OfflineModeSettings>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_OFFLINE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_OFFLINE_SETTINGS;
  });

  const handleOfflineSettingsChange = (newSettings: OfflineModeSettings) => {
    setOfflineSettings(newSettings);
    try {
      localStorage.setItem(OFFLINE_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOfflineMode = (offline: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, useMockMode: offline };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (offline) {
      showToast('⚡ Switched to Offline Mode (100% local, zero upload)');
    } else {
      showToast('✨ Switched to AI Studio Mode');
    }
  };

  // Offline Service Worker readiness
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(true);

  // Synchronize Daily Free Tier Usage with Server
  const refreshDailyUsage = useCallback(async () => {
    try {
      const usage = await fetchDailyUsage(currentUser?.id);
      setDailyUsage(usage);
    } catch (e) {
      console.warn('Failed to load daily usage:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshDailyUsage();
    checkIsCreator(currentUser?.email).then((res) => setIsCreator(res.isCreator));
  }, [currentUser, refreshDailyUsage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (reg.active) {
            setIsOfflineReady(true);
          }
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'activated') {
                  setIsOfflineReady(true);
                }
              };
            }
          });
        })
        .catch((err) => {
          console.warn('Service Worker registration note:', err);
          setIsOfflineReady(true);
        });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_READY') {
          setIsOfflineReady(true);
        }
      });
    }
  }, []);

  // Application Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model === 'imagen-3.0-generate-002' || !parsed.model || parsed.model.startsWith('gemini-1.5') || parsed.model.startsWith('gemini-2.0')) {
          parsed.model = 'gemini-3.1-flash-image';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      provider: 'pollinations',
      geminiApiKey: '',
      useMockMode: false, // Default to live AI engine (Pollinations 100% Free) with offline avatar fallback
      model: 'flux',
      aspectRatio: '1:1',
      systemPrompt: DEFAULT_SYSTEM_PROMPT
    };
  });

  // User Credit State (Monthly 3 Free Credits + Purchased Packs)
  const [userCredits, setUserCredits] = useState<UserCreditState>(() => {
    const active = getCurrentUser();
    if (active && active.credits) return active.credits;
    return loadUserCredits();
  });

  // Current Portrait Image State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageName, setCurrentImageName] = useState<string>('My Portrait');

  // Customization Selections
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ART_STYLES[0]);
  const [selectedPose, setSelectedPose] = useState<PoseOption>(POSES[0]);
  const [selectedWardrobe, setSelectedWardrobe] = useState<WardrobeOption>(WARDROBES[0]);
  const [customWardrobeText, setCustomWardrobeText] = useState<string>('');
  const [selectedExpression, setSelectedExpression] = useState<ExpressionOption>(EXPRESSIONS[0]);

  // Seed & Modifiers
  const [seed, setSeed] = useState<number>(42891);
  const [isSeedLocked, setIsSeedLocked] = useState<boolean>(true);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Generated Canvas State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [debugLayers, setDebugLayers] = useState<OfflineDebugLayers | null>(null);

  // Generation Progress State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>({
    step: 1,
    label: 'Preparing...',
    percentage: 0
  });

  // History Reel with 30-Day Auto Retention
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed: HistoryItem[] = JSON.parse(saved);
        const now = Date.now();
        // Filter out items older than 30 days
        return parsed.filter((item) => !item.expiresAt || item.expiresAt > now);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Responsive Mobile/Tablet Tab: 'canvas' | 'controls'
  const [mobileTab, setMobileTab] = useState<'canvas' | 'controls'>('controls');

  // Modals
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Persist Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
    showToast('Settings saved successfully');
  };

  // Persist History
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Seed Controls
  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeed(newSeed);
    showToast(`Seed randomized: ${newSeed}`);
  };

  const handleToggleSeedLock = () => {
    setIsSeedLocked((prev) => {
      const next = !prev;
      showToast(next ? 'Seed locked: Identity preserved' : 'Variation mode active');
      return next;
    });
  };

  // Crop Application
  const handleApplyCrop = (croppedDataUrl: string, _cropSettings: CropSettings) => {
    setCurrentImage(croppedDataUrl);
    setCurrentImageName((name) => (name.includes('(Cropped)') ? name : `${name} (Cropped)`));
    showToast('Portrait centered & cropped');
  };

  // Check if active image is unlocked
  const isCurrentUnlocked = activeHistoryId
    ? userCredits.unlockedImageIds.includes(activeHistoryId)
    : false;

  // Core Generation Trigger
  const handleGenerate = useCallback(async () => {
    if (isGenerating || !currentImage) return;

    // Free Tier vs Paid Tier allowance checks
    if (isFreeTier) {
      if (dailyUsage?.usedToday) {
        showToast("⚠️ You have used today's free AI generation. Resets daily or switch to Paid Tier.");
        return;
      }
    } else {
      // Paid Tier check (credits or user API key)
      const hasCustomApiKey = Boolean(settings.geminiApiKey?.trim());
      const totalAvailable =
        userCredits.freeCreditsRemaining + userCredits.purchasedCredits;
      if (!hasCustomApiKey && totalAvailable <= 0) {
        setIsUnlockModalOpen(true);
        showToast('⚠️ You have used your Paid Tier credits. Unlock more or provide an API key in settings.');
        return;
      }
    }

    // Automatically switch mobile view to canvas so user sees the result
    setMobileTab('canvas');
    setIsGenerating(true);
    setGenerationStep({
      step: 1,
      label: isFreeTier ? 'Engaging provider fallback chain...' : 'Analyzing portrait facial geometry...',
      percentage: 20
    });

    const startTime = Date.now();
    let activeSeed = seed;
    if (!isSeedLocked) {
      activeSeed = Math.floor(Math.random() * 900000) + 100000;
      setSeed(activeSeed);
    }

    try {
      const result = await generateCartoonCharacter({
        originalImageDataUrl: currentImage,
        artStyle: selectedStyle,
        pose: selectedPose,
        wardrobe: selectedWardrobe,
        customWardrobeText,
        expression: selectedExpression,
        seed: activeSeed,
        additionalNotes,
        settings,
        offlineSettings,
        isFreeTier,
        userId: currentUser?.id,
        onProgress: (step, label, percentage) => {
          setGenerationStep({ step, label, percentage });
        },
        onFallback: (reason) => {
          showToast(`⚠️ ${reason}`);
        }
      });

      if (isFreeTier) {
        // Refresh daily usage from server (server atomically consumed 1 allowance)
        refreshDailyUsage();
        showToast('✨ Free Tier AI cartoon generated successfully via provider fallback chain!');
      } else {
        // Paid Tier generation
        if (!settings.geminiApiKey?.trim()) {
          const updatedCredits = consumeCredit(userCredits);
          setUserCredits(updatedCredits);
          syncUserCreditsToProfile(updatedCredits);
        }
        showToast('✨ AI Cartoon character generated successfully!');
      }

      const newHistoryId = `var-${Date.now()}`;
      const newHistoryItem: HistoryItem = {
        id: newHistoryId,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30-day cloud retention
        originalImage: currentImage,
        generatedImage: result.imageUrl,
        artStyle: selectedStyle.id,
        pose: selectedPose.id,
        wardrobe: selectedWardrobe.id,
        customWardrobeText,
        expression: selectedExpression.id,
        seed: activeSeed,
        promptUsed: result.promptUsed,
        aspectRatio: settings.aspectRatio,
        durationMs: Date.now() - startTime,
        isMock: result.isMock
      };

      setGeneratedImage(result.imageUrl);
      if (result.debugLayers) {
        setDebugLayers(result.debugLayers);
      }
      setActiveHistoryId(newHistoryId);
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);

      // Save to cloud Firestore if user is authenticated
      if (currentUser) {
        saveCreationToFirestore(currentUser.id, newHistoryItem).catch((e) =>
          console.warn('Firestore creation save error:', e)
        );
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Processing failed. Please check image or try another photo.';
      showToast(`⚠️ ${errMsg}`);
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating,
    currentImage,
    isFreeTier,
    dailyUsage,
    refreshDailyUsage,
    seed,
    isSeedLocked,
    selectedStyle,
    selectedPose,
    selectedWardrobe,
    customWardrobeText,
    selectedExpression,
    additionalNotes,
    settings,
    offlineSettings,
    userCredits,
    currentUser
  ]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // ⌘/Ctrl + Enter -> Generate
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
        return;
      }

      // 'c' or 'C' -> Crop tool
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (currentImage) setIsCropModalOpen(true);
        return;
      }

      // 'r' or 'R' -> Randomize seed
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRandomizeSeed();
        return;
      }

      // 'l' or 'L' -> Toggle seed lock
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleToggleSeedLock();
        return;
      }

      // Escape -> close modals
      if (e.key === 'Escape') {
        setIsCropModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsUnlockModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, currentImage]);

  // History item selection
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setGeneratedImage(item.generatedImage);
    setCurrentImage(item.originalImage);
    setActiveHistoryId(item.id);
    const style = ART_STYLES.find((s) => s.id === item.artStyle);
    if (style) setSelectedStyle(style);
    const pose = POSES.find((p) => p.id === item.pose);
    if (pose) setSelectedPose(pose);
    const wardrobe = WARDROBES.find((w) => w.id === item.wardrobe);
    if (wardrobe) setSelectedWardrobe(wardrobe);
    setSeed(item.seed);
    setMobileTab('canvas');
    showToast(`Restored character from ${new Date(item.timestamp).toLocaleTimeString()}`);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setActiveHistoryId(null);
    showToast('History cleared');
  };

  // Export Download PNG with Watermark Logic
  const handleDownload = async () => {
    if (!generatedImage) return;
    const baseName = `iam-cartoon-${selectedStyle.id}-${selectedPose.id}-seed${seed}`;
    try {
      await downloadImageWithWatermarkOption(generatedImage, baseName, isCurrentUnlocked);
      showToast(
        isCurrentUnlocked
          ? 'Downloaded Clean 4K Ultra-HD PNG'
          : 'Downloaded PNG (Free Preview with Watermark)'
      );
    } catch (e) {
      console.error(e);
      showToast('Download failed. Try right clicking to save.');
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (!generatedImage) return false;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = generatedImage;
      });

      ctx.drawImage(img, 0, 0, 1024, 1024);

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            showToast('Cartoon copied to clipboard!');
            resolve(true);
          } catch (err) {
            console.warn('Direct clipboard write failed, copying data URL fallback', err);
            await navigator.clipboard.writeText(generatedImage);
            showToast('Copied image data to clipboard');
            resolve(true);
          }
        }, 'image/png');
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to copy to clipboard');
      return false;
    }
  };

  // Reset Canvas
  const handleReset = () => {
    setGeneratedImage(null);
    setActiveHistoryId(null);
    showToast('Canvas reset');
  };

  const handleLoginSuccess = async (user: UserProfile) => {
    setLocalCurrentUser(user);
    if (user.credits) {
      setUserCredits(user.credits);
      saveUserCredits(user.credits);
    }
    try {
      const cloudCreations = await loadCreationsFromFirestore(user.id);
      if (cloudCreations && cloudCreations.length > 0) {
        setHistory((prev) => {
          const combined = [...cloudCreations, ...prev];
          const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
          return unique.slice(0, 25);
        });
        showToast(`☁️ Loaded ${cloudCreations.length} saved cartoon variations from cloud`);
      }
    } catch (e) {
      console.warn('Could not load cloud creations:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocalCurrentUser(null);
    showToast('Signed out of account');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f17] text-slate-100 overflow-hidden">
      {/* Top Navigation Header */}
      <Header
        settings={settings}
        userCredits={userCredits}
        currentUser={currentUser}
        isCreator={isCreator}
        onOpenCreatorAdmin={() => setIsCreatorAdminOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        activeMobileTab={mobileTab}
        onToggleMobileTab={setMobileTab}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Controls Column */}
        <div
          className={`h-full overflow-hidden shrink-0 transition-all ${
            mobileTab === 'controls' ? 'flex flex-col flex-1' : 'hidden'
          } lg:flex lg:w-[380px] xl:w-[420px]`}
        >
          <ControlsColumn
            isFreeTier={isFreeTier}
            onToggleFreeTier={setIsFreeTier}
            dailyUsage={dailyUsage}
            isOfflineMode={settings.useMockMode}
            onToggleOfflineMode={handleToggleOfflineMode}
            offlineSettings={offlineSettings}
            onOfflineSettingsChange={handleOfflineSettingsChange}
            isOfflineReady={isOfflineReady}
            debugLayers={debugLayers}
            currentImage={currentImage}
            currentImageName={currentImageName}
            onImageChange={(dataUrl, name) => {
              setCurrentImage(dataUrl);
              setCurrentImageName(name);
              showToast('Portrait image uploaded');
            }}
            onOpenCropModal={() => setIsCropModalOpen(true)}
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            selectedPose={selectedPose}
            onSelectPose={setSelectedPose}
            selectedWardrobe={selectedWardrobe}
            onSelectWardrobe={setSelectedWardrobe}
            customWardrobeText={customWardrobeText}
            onCustomWardrobeTextChange={setCustomWardrobeText}
            selectedExpression={selectedExpression}
            onSelectExpression={setSelectedExpression}
            seed={seed}
            isSeedLocked={isSeedLocked}
            onToggleSeedLock={handleToggleSeedLock}
            onRandomizeSeed={handleRandomizeSeed}
            onSeedChange={setSeed}
            additionalNotes={additionalNotes}
            onAdditionalNotesChange={setAdditionalNotes}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>

        {/* Canvas & History Column */}
        <div
          className={`h-full overflow-hidden flex-col flex-1 ${
            mobileTab === 'canvas' ? 'flex' : 'hidden'
          } lg:flex`}
        >
          {/* Main High-Resolution Canvas Area */}
          <CanvasArea
            originalImage={currentImage}
            generatedImage={generatedImage}
            artStyle={selectedStyle}
            pose={selectedPose}
            seed={seed}
            isGenerating={isGenerating}
            generationStep={generationStep}
            isUnlocked={isCurrentUnlocked}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onDownload={handleDownload}
            onCopyToClipboard={handleCopyToClipboard}
            onReset={handleReset}
            onOpenUpload={() => setMobileTab('controls')}
            onToast={showToast}
          />

          {/* Bottom Variations History Reel */}
          <HistoryReel
            history={history}
            activeId={activeHistoryId}
            onSelectHistoryItem={handleSelectHistoryItem}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
          />
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onToast={showToast}
      />

      <CropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageUrl={currentImage}
        onApplyCrop={handleApplyCrop}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        userCredits={userCredits}
        onCreditsUpdated={(updated) => {
          setUserCredits(updated);
          saveUserCredits(updated);
          syncUserCreditsToProfile(updated);
        }}
        currentImageId={activeHistoryId || undefined}
        onToast={showToast}
      />

      {/* Creator-Only Built-in Provider Management Modal */}
      <CreatorAdminModal
        isOpen={isCreatorAdminOpen}
        onClose={() => setIsCreatorAdminOpen(false)}
        isCreator={isCreator}
        userEmail={currentUser?.email}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs font-semibold max-w-sm sm:max-w-md ${
            toastMessage.includes('⚠️')
              ? 'bg-amber-950/95 border border-amber-500/50 text-amber-200'
              : 'bg-slate-900/95 border border-blue-500/50 text-slate-100'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              toastMessage.includes('⚠️') ? 'bg-amber-400 animate-pulse' : 'bg-blue-400 animate-ping'
            }`}
          />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
