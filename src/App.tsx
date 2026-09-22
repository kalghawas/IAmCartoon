/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AppThemeMode,
  ChatThemeMode,
  ContactSettings,
  ParserConfig,
  AnimationSettings,
  ExportProgress,
  ExportFormat,
  ExportResolution,
  TaggedLine,
  UserSubscriptionState,
  UserProfile,
  CreationRecord,
} from './types';
import { THEME_COLORS } from './constants/themeColors';
import { SAMPLE_TRANSCRIPTS } from './constants/sampleTranscripts';
import {
  analyzeRawTextToTaggedLines,
  taggedLinesToRawText,
  parseTaggedLinesToMessages,
} from './utils/transcriptParser';
import { exportChatMedia } from './utils/videoRecorder';
import { preloadAvatar, preloadScreenshot } from './utils/canvasRenderer';
import { playSentSound, playReceivedSound } from './utils/audioEffects';
import {
  loadSubscriptionState,
  saveSubscriptionState,
  recordGenerationUsage,
} from './utils/monetization';
import {
  getCurrentUser,
  saveUser,
  saveCreationRecord,
  saveUserPreferences,
} from './utils/accountStore';

import { WorkstationHeader } from './components/WorkstationHeader';
import { TranscriptEditor } from './components/TranscriptEditor';
import { PlaybackControls } from './components/PlaybackControls';
import { PhoneMockup } from './components/PhoneMockup';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { HelpModal } from './components/HelpModal';
import { Smartphone, FileEdit, MessageSquare } from 'lucide-react';

export default function App() {
  // Current Signed-In User Profile (Google or Email)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // User Subscription / Monetization State (Synced with currentUser if logged in)
  const [subscription, setSubscription] = useState<UserSubscriptionState>(() => {
    const user = getCurrentUser();
    if (user?.subscription) return user.subscription;
    return loadSubscriptionState();
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // When user logs in or updates, sync subscription
  const handleAuthSuccess = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    if (user.subscription) {
      setSubscription(user.subscription);
      saveSubscriptionState(user.subscription);
    }
  }, []);

  const handleUpdateUser = useCallback((user: UserProfile | null) => {
    setCurrentUser(user);
    if (user?.subscription) {
      setSubscription(user.subscription);
      saveSubscriptionState(user.subscription);
    }
  }, []);

  // Update subscription handler (syncs to account store as well)
  const handleUpdateSubscription = useCallback(
    (newSub: UserSubscriptionState) => {
      setSubscription(newSub);
      saveSubscriptionState(newSub);
      if (currentUser) {
        const updated = { ...currentUser, subscription: newSub };
        setCurrentUser(updated);
        saveUser(updated);
      }
    },
    [currentUser]
  );

  // Web App Theme (Whole site: Dark vs Light)
  const [appThemeMode, setAppThemeMode] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem('iamwhatsapp_app_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const handleToggleAppTheme = useCallback(() => {
    setAppThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('iamwhatsapp_app_theme', next);
      } catch {}
      return next;
    });
  }, []);

  // WhatsApp Chat Theme (Dark Mode vs Light Mode inside WhatsApp phone & canvas)
  const [chatThemeMode, setChatThemeMode] = useState<ChatThemeMode>('dark');
  const chatTheme = THEME_COLORS[chatThemeMode];

  const handleToggleChatTheme = useCallback(() => {
    setChatThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Default sample
  const defaultSample = SAMPLE_TRANSCRIPTS[0];

  // Parser config
  const [parserConfig, setParserConfig] = useState<ParserConfig>({
    prefixA: defaultSample.prefixA,
    prefixB: defaultSample.prefixB,
  });

  // Profile & Contact Settings
  const [contact, setContact] = useState<ContactSettings>({
    contactName: defaultSample.personBName,
    senderName: defaultSample.personAName,
    avatarUrl: defaultSample.avatarUrl,
    senderAvatarUrl: defaultSample.senderAvatarUrl || '',
    statusMode: 'online',
    customStatusText: 'online',
    phoneTime: '09:41',
    batteryLevel: 92,
    wifiStrength: 3,
    androidDevice: 'samsung',
    navStyle: 'gestures',
  });

  // Raw and Tagged transcript state
  const [rawTranscript, setRawTranscript] = useState<string>(defaultSample.rawText);
  const [taggedLines, setTaggedLines] = useState<TaggedLine[]>(() =>
    analyzeRawTextToTaggedLines(
      defaultSample.rawText,
      { prefixA: defaultSample.prefixA, prefixB: defaultSample.prefixB },
      defaultSample.personAName,
      defaultSample.personBName
    )
  );

  // Applied Messages in WhatsApp Window (loaded on demand via "Make bubbles")
  const [appliedMessages, setAppliedMessages] = useState(() =>
    parseTaggedLinesToMessages(
      analyzeRawTextToTaggedLines(
        defaultSample.rawText,
        { prefixA: defaultSample.prefixA, prefixB: defaultSample.prefixB },
        defaultSample.personAName,
        defaultSample.personBName
      ),
      defaultSample.personAName,
      defaultSample.personBName,
      '10:42 AM',
      1
    )
  );

  // Track applied hash to determine pending changes
  const [appliedHash, setAppliedHash] = useState<string>(() =>
    JSON.stringify(
      analyzeRawTextToTaggedLines(
        defaultSample.rawText,
        { prefixA: defaultSample.prefixA, prefixB: defaultSample.prefixB },
        defaultSample.personAName,
        defaultSample.personBName
      )
    )
  );

  // Check if editor has unsaved changes that need "Make bubbles"
  const currentHash = useMemo(() => JSON.stringify(taggedLines), [taggedLines]);
  const hasPendingChanges = currentHash !== appliedHash;

  // Make bubbles in-button generation state
  const [isBubblesGenerating, setIsBubblesGenerating] = useState<boolean>(false);

  // Mobile / Tablet Tab Switcher ('editor' | 'preview')
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Animation settings (Muted by default to avoid annoyance, toggleable via 1-click icon)
  const [animSettings, setAnimSettings] = useState<AnimationSettings>({
    speedMultiplier: 1,
    loop: true,
    baseTypingSpeedCpm: 40,
    pauseBetweenMessagesMs: 900,
    showTypingBubble: true,
    typewriterEnabled: false,
    soundEffectsEnabled: false,
  });

  // Download counter state
  const [downloadCount, setDownloadCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('iamwhatsapp_download_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleIncrementDownload = useCallback(() => {
    setDownloadCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('iamwhatsapp_download_count', next.toString());
      } catch {}
      return next;
    });
  }, []);

  // Settings modal open state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);

  // Export state (Dual formats: MP4 & GIF, Qualities: 1080p, 720p, 480p, 360p)
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('mp4');
  const [exportResolution, setExportResolution] = useState<ExportResolution>('1080p');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Help modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Preload initial avatars and images
  useEffect(() => {
    if (contact.avatarUrl) {
      preloadAvatar(contact.avatarUrl);
    }
    if (contact.senderAvatarUrl) {
      preloadAvatar(contact.senderAvatarUrl);
    }
  }, [contact.avatarUrl, contact.senderAvatarUrl]);

  // Preload screenshot images whenever applied messages change
  useEffect(() => {
    appliedMessages.forEach((msg) => {
      if (msg.hasImage && msg.imageUrl) {
        preloadScreenshot(msg.imageUrl);
      }
    });
  }, [appliedMessages]);

  // Total animation duration in milliseconds
  const totalDurationMs = useMemo(() => {
    if (appliedMessages.length === 0) return 0;
    return appliedMessages[appliedMessages.length - 1].endMs + 1200;
  }, [appliedMessages]);

  // Find active message index
  const activeMessageIndex = useMemo(() => {
    for (let i = 0; i < appliedMessages.length; i++) {
      if (
        currentTimeMs >= appliedMessages[i].startMs &&
        currentTimeMs < appliedMessages[i].endMs
      ) {
        return i;
      }
    }
    return -1;
  }, [appliedMessages, currentTimeMs]);

  // Sound effect tracking for message dispatch moments
  const triggeredSoundIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!animSettings.soundEffectsEnabled || !isPlaying) return;

    if (currentTimeMs === 0) {
      triggeredSoundIndexRef.current = -1;
      return;
    }

    // Check if a message was just dispatched
    for (let i = 0; i < appliedMessages.length; i++) {
      const msg = appliedMessages[i];
      const sendMomentMs = msg.startMs + msg.typingDelayMs + msg.typingDurationMs;

      if (currentTimeMs >= sendMomentMs && triggeredSoundIndexRef.current < i) {
        triggeredSoundIndexRef.current = i;
        if (msg.sender === 'A') {
          playSentSound();
        } else {
          playReceivedSound();
        }
        break;
      }
    }
  }, [currentTimeMs, isPlaying, appliedMessages, animSettings.soundEffectsEnabled]);

  // Playback animation ticker loop
  const lastTickTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const tick = (now: number) => {
      if (lastTickTimeRef.current !== null && isPlaying && totalDurationMs > 0) {
        const delta = (now - lastTickTimeRef.current) * animSettings.speedMultiplier;
        setCurrentTimeMs((prev) => {
          const next = prev + delta;
          if (next >= totalDurationMs) {
            if (animSettings.loop) {
              triggeredSoundIndexRef.current = -1;
              return 0;
            } else {
              setIsPlaying(false);
              return totalDurationMs;
            }
          }
          return next;
        });
      }
      lastTickTimeRef.current = now;
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTickTimeRef.current = null;
    };
  }, [isPlaying, totalDurationMs, animSettings.speedMultiplier, animSettings.loop]);

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleTogglePlay = useCallback(() => {
    if (currentTimeMs >= totalDurationMs && totalDurationMs > 0) {
      triggeredSoundIndexRef.current = -1;
      setCurrentTimeMs(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentTimeMs, totalDurationMs]);

  const handleReset = useCallback(() => {
    triggeredSoundIndexRef.current = -1;
    setCurrentTimeMs(0);
    setIsPlaying(true);
  }, []);

  const handleSeek = useCallback((timeMs: number) => {
    triggeredSoundIndexRef.current = -1;
    setCurrentTimeMs(timeMs);
  }, []);

  // Update tagged lines from editor
  const handleUpdateTaggedLines = useCallback(
    (lines: TaggedLine[]) => {
      setTaggedLines(lines);
      const raw = taggedLinesToRawText(lines, parserConfig);
      setRawTranscript(raw);
    },
    [parserConfig]
  );

  // Update raw transcript from raw text mode
  const handleUpdateRawTranscript = useCallback((val: string) => {
    setRawTranscript(val);
  }, []);

  // Update speaker names if auto-detected from file upload
  const handleUpdateSpeakerNames = useCallback((nameA: string, nameB: string) => {
    setContact((prev) => ({
      ...prev,
      senderName: nameA,
      contactName: nameB,
    }));
  }, []);

  // Handler when clicking "Make Bubbles!" button (Respects action quota and triggers upgrade modal if depleted)
  const handleTriggerMakeBubbles = () => {
    if (isBubblesGenerating) return;

    // Check generation usage quota
    const quota = recordGenerationUsage(subscription, (newSub) => {
      handleUpdateSubscription(newSub);
    });

    if (!quota.allowed) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsBubblesGenerating(true);

    setTimeout(() => {
      const newMessages = parseTaggedLinesToMessages(
        taggedLines,
        contact.senderName,
        contact.contactName,
        '10:42 AM',
        animSettings.speedMultiplier
      );

      setAppliedMessages(newMessages);
      setAppliedHash(JSON.stringify(taggedLines));
      triggeredSoundIndexRef.current = -1;
      setCurrentTimeMs(0);
      setIsPlaying(true);
      setIsBubblesGenerating(false);

      // Take user to the WhatsApp View outcome screen
      setMobileTab('preview');
      const studioElem = document.getElementById('whatsapp-view-section');
      if (studioElem) {
        studioElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 550);
  };

  // Restore previous creation from 30-Day History
  const handleLoadCreation = useCallback((record: CreationRecord) => {
    setRawTranscript(record.rawTranscript);
    setTaggedLines(record.taggedLines);
    if (record.contactSnapshot) {
      setContact(record.contactSnapshot);
    }
    if (record.themeModeSnapshot) {
      setChatThemeMode(record.themeModeSnapshot);
    }
    if (record.format) {
      setExportFormat(record.format);
    }
    if (record.resolution) {
      setExportResolution(record.resolution);
    }

    const newMsgs = parseTaggedLinesToMessages(
      record.taggedLines,
      record.personAName,
      record.personBName,
      '10:42 AM',
      1
    );
    setAppliedMessages(newMsgs);
    setAppliedHash(JSON.stringify(record.taggedLines));
    triggeredSoundIndexRef.current = -1;
    setCurrentTimeMs(0);
    setIsPlaying(true);
    setMobileTab('preview');
  }, []);

  // Load sample transcript handler
  const handleLoadSample = useCallback((sampleId: string) => {
    const sample = SAMPLE_TRANSCRIPTS.find((s) => s.id === sampleId);
    if (!sample) return;

    setRawTranscript(sample.rawText);
    const newConfig = {
      prefixA: sample.prefixA,
      prefixB: sample.prefixB,
    };
    setParserConfig(newConfig);
    setContact((prev) => ({
      ...prev,
      contactName: sample.personBName,
      senderName: sample.personAName,
      avatarUrl: sample.avatarUrl,
      senderAvatarUrl: sample.senderAvatarUrl || prev.senderAvatarUrl,
    }));

    const analyzed = analyzeRawTextToTaggedLines(
      sample.rawText,
      newConfig,
      sample.personAName,
      sample.personBName
    );
    setTaggedLines(analyzed);

    const newMsgs = parseTaggedLinesToMessages(
      analyzed,
      sample.personAName,
      sample.personBName,
      '10:42 AM',
      1
    );
    setAppliedMessages(newMsgs);
    setAppliedHash(JSON.stringify(analyzed));
    triggeredSoundIndexRef.current = -1;
    setCurrentTimeMs(0);
    setIsPlaying(true);
  }, []);

  // Auto-detect prefixes from transcript
  const handleAutoDetectPrefixes = useCallback(() => {
    const lines = rawTranscript
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const prefixCounts: Record<string, number> = {};

    for (const line of lines) {
      const match = line.match(/^(\[?[a-zA-Z0-9\s_-]+\]?:?)/);
      if (match) {
        const p = match[1].trim();
        prefixCounts[p] = (prefixCounts[p] || 0) + 1;
      }
    }

    const sorted = Object.entries(prefixCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length >= 2) {
      const pA = sorted[0][0].endsWith(':') ? sorted[0][0] : `${sorted[0][0]}:`;
      const pB = sorted[1][0].endsWith(':') ? sorted[1][0] : `${sorted[1][0]}:`;
      const newConfig = { prefixA: pA, prefixB: pB };
      setParserConfig(newConfig);

      const nameA = pA.replace(/[:\[\]]/g, '').trim();
      const nameB = pB.replace(/[:\[\]]/g, '').trim();
      setContact((prev) => ({
        ...prev,
        senderName: nameA || 'Me',
        contactName: nameB || 'Alex',
      }));

      const reAnalyzed = analyzeRawTextToTaggedLines(
        rawTranscript,
        newConfig,
        nameA || 'Me',
        nameB || 'Alex'
      );
      setTaggedLines(reAnalyzed);
    }
  }, [rawTranscript]);

  // Media Export Handler
  const handleStartExport = async () => {
    if (appliedMessages.length === 0 || isExporting) return;

    setIsExporting(true);
    setIsExportModalOpen(true);
    setIsPlaying(false);

    abortControllerRef.current = new AbortController();

    try {
      await exportChatMedia({
        messages: appliedMessages,
        contact,
        theme: chatTheme,
        format: exportFormat,
        resolution: exportResolution,
        fps: exportFormat === 'gif' ? 16 : 60,
        isPro: subscription.isPro,
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          setExportProgress(progress);
        },
      });

      handleIncrementDownload();

      // Automatically store in user's 30-day creation history
      if (currentUser?.id) {
        saveCreationRecord(currentUser.id, {
          title: `${contact.senderName} & ${contact.contactName} Chat`,
          personAName: contact.senderName,
          personBName: contact.contactName,
          messageCount: appliedMessages.length,
          format: exportFormat,
          resolution: exportResolution,
          rawTranscript,
          taggedLines,
          contactSnapshot: contact,
          themeModeSnapshot: chatThemeMode,
          fileName: `whatsapp_chat_${contact.contactName.toLowerCase().replace(/\s+/g, '_')}.${exportFormat}`,
        });
      }
    } catch (err: any) {
      if (err.message !== 'Export cancelled by user.') {
        console.error('Export error:', err);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelRecording = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExporting(false);
    setIsExportModalOpen(false);
  };

  const isDark = appThemeMode === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-emerald-500/30 selection:text-emerald-500 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Top Header with Sign-In, 30-Day History, Web App Day / Night Switcher & Upgrade Pro */}
      <WorkstationHeader
        appThemeMode={appThemeMode}
        onToggleAppTheme={handleToggleAppTheme}
        downloadCount={downloadCount}
        subscription={subscription}
        user={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* MOBILE / TABLET TAB SELECTOR */}
      <div
        className={`lg:hidden w-full border-b px-3 py-2 flex items-center justify-center sticky top-16 z-20 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
        }`}
      >
        <div
          className={`grid grid-cols-2 gap-1.5 w-full max-w-md p-1 rounded-xl border text-xs font-semibold ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? isDark
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs'
                  : 'bg-white text-emerald-700 shadow-xs border border-zinc-200'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Transcript & Tags</span>
            {hasPendingChanges && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WhatsApp View ({appliedMessages.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Layout */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* LEFT COLUMN: Transcript & Tags Editor */}
        <div
          className={`lg:col-span-7 flex flex-col gap-4 ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex-1 min-h-[460px]">
            <TranscriptEditor
              rawTranscript={rawTranscript}
              onChangeTranscript={handleUpdateRawTranscript}
              taggedLines={taggedLines}
              onChangeTaggedLines={handleUpdateTaggedLines}
              parserConfig={parserConfig}
              onChangeParserConfig={setParserConfig}
              personAName={contact.senderName}
              personBName={contact.contactName}
              onUpdateSpeakerNames={handleUpdateSpeakerNames}
              appliedMessageCount={appliedMessages.length}
              hasPendingChanges={hasPendingChanges}
              isGenerating={isBubblesGenerating}
              onMakeBubbles={handleTriggerMakeBubbles}
              onLoadSample={handleLoadSample}
              onAutoDetectPrefixes={handleAutoDetectPrefixes}
              appThemeMode={appThemeMode}
              subscription={subscription}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp View (Phone Screen + Video Timeline Controls) */}
        <div
          id="whatsapp-view-section"
          className={`lg:col-span-5 flex flex-col items-center border rounded-2xl p-3 sm:p-4 lg:p-5 space-y-4 transition-colors ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          } ${
            isDark
              ? 'bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm'
              : 'bg-white/90 border-zinc-200 shadow-sm backdrop-blur-sm'
          }`}
        >
          {/* Section Header: WhatsApp View */}
          <div className="w-full flex items-center justify-between pb-1 border-b border-zinc-800/40">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3
                  className={`text-xs font-bold tracking-tight uppercase ${
                    isDark ? 'text-zinc-200' : 'text-zinc-800'
                  }`}
                >
                  WhatsApp View
                </h3>
              </div>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border font-mono font-semibold ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-600'
              }`}
            >
              {appliedMessages.length} Messages
            </span>
          </div>

          {/* Android Phone Mockup */}
          <PhoneMockup
            messages={appliedMessages}
            currentTimeMs={currentTimeMs}
            contact={contact}
            theme={chatTheme}
            isExporting={isExporting}
            exportProgress={exportProgress}
            onStartExport={handleStartExport}
            showTypingBubble={animSettings.showTypingBubble}
            exportFormat={exportFormat}
            onChangeExportFormat={setExportFormat}
            exportResolution={exportResolution}
            onChangeExportResolution={setExportResolution}
            isPro={subscription.isPro}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          />

          {/* Video Timeline Playback Controls Bar */}
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            currentTimeMs={currentTimeMs}
            totalDurationMs={totalDurationMs}
            onSeek={handleSeek}
            animSettings={animSettings}
            onChangeAnimSettings={setAnimSettings}
            activeMessageIndex={activeMessageIndex}
            totalMessages={appliedMessages.length}
            appThemeMode={appThemeMode}
          />
        </div>
      </main>

      {/* Authentication Modal (Google & Email/Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        appThemeMode={appThemeMode}
      />

      {/* User Profile & 30-Day Creation Archive Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLoadCreation={handleLoadCreation}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          appThemeMode={appThemeMode}
        />
      )}

      {/* Upgrade to Pro Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        appThemeMode={appThemeMode}
      />

      {/* Unified WhatsApp Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        contact={contact}
        onChangeContact={setContact}
        animSettings={animSettings}
        onChangeAnimSettings={setAnimSettings}
        theme={chatTheme}
        onToggleTheme={handleToggleChatTheme}
        exportFormat={exportFormat}
        onChangeExportFormat={setExportFormat}
        exportResolution={exportResolution}
        onChangeExportResolution={setExportResolution}
      />

      {/* Export Modal with Progress, Video/GIF Preview & Direct Download */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onCancelRecording={handleCancelRecording}
        exportProgress={exportProgress}
        format={exportFormat}
        onChangeFormat={setExportFormat}
        resolution={exportResolution}
        onChangeResolution={setExportResolution}
        contactName={contact.contactName}
        senderName={contact.senderName}
        onDownloaded={handleIncrementDownload}
        onStartExport={handleStartExport}
      />


      {/* Help & Guide Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}
