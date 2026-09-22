import React, { useRef, useEffect, useState } from 'react';
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Camera,
  Mic,
  Send,
  Check,
  Smartphone,
  Layers,
  Smile,
  Download,
  Image as ImageIcon,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  ParsedMessage,
  ContactSettings,
  ThemeColors,
  ExportProgress,
  ExportFormat,
  ExportResolution,
} from '../types';
import { getEmojiRenderTier } from '../utils/transcriptParser';
import { DOODLE_DATA_URL_DARK, DOODLE_DATA_URL_LIGHT } from '../constants/doodleWallpaper';
import { renderChatFrame } from '../utils/canvasRenderer';

interface PhoneMockupProps {
  messages: ParsedMessage[];
  currentTimeMs: number;
  contact: ContactSettings;
  theme: ThemeColors;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  onStartExport: () => void;
  showTypingBubble?: boolean;
  exportFormat: ExportFormat;
  onChangeExportFormat: (fmt: ExportFormat) => void;
  exportResolution: ExportResolution;
  onChangeExportResolution: (res: ExportResolution) => void;
  isPro?: boolean;
  onOpenUpgrade?: () => void;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  messages,
  currentTimeMs,
  contact,
  theme,
  isExporting,
  exportProgress,
  onStartExport,
  showTypingBubble = true,
  exportFormat,
  onChangeExportFormat,
  exportResolution,
  onChangeExportResolution,
  isPro = false,
  onOpenUpgrade,
}) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const canvasMonitorRef = useRef<HTMLCanvasElement>(null);
  const [activeViewMode, setActiveViewMode] = useState<'phone' | 'canvas'>('phone');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const isSamsung = (contact.androidDevice || 'samsung') === 'samsung';

  // Determine current active typing message
  let activeIndex = -1;
  let isPersonBTyping = false;
  let isPersonATyping = false;
  let personADraftText = '';

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const sendMomentMs = msg.startMs + msg.typingDelayMs + msg.typingDurationMs;

    // Active typing window: from startMs until the exact moment message is sent
    if (currentTimeMs >= msg.startMs && currentTimeMs < sendMomentMs) {
      activeIndex = i;
      if (msg.sender === 'B') {
        isPersonBTyping = true;
      } else {
        isPersonATyping = true;
        // In input bar, show draft text as it's composed
        const typingRatio = Math.min(
          1,
          (currentTimeMs - msg.startMs) / (msg.typingDelayMs + msg.typingDurationMs)
        );
        const chars = Math.max(1, Math.floor(typingRatio * (msg.caption || msg.text || 'Screenshot').length));
        personADraftText = (msg.caption || msg.text || '').slice(0, chars);
      }
      break;
    }
  }

  // Auto-scroll chat to bottom as new messages get sent
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentTimeMs, activeIndex]);

  // Render canvas frame if user toggles to 1080p canvas monitor
  useEffect(() => {
    if (activeViewMode === 'canvas' && canvasMonitorRef.current) {
      renderChatFrame({
        canvas: canvasMonitorRef.current,
        messages,
        currentTimeMs,
        contact,
        theme,
        width: 1080,
        height: 1920,
        showTypingBubble,
      });
    }
  }, [activeViewMode, messages, currentTimeMs, contact, theme, showTypingBubble]);

  const doodleBg = theme.mode === 'dark' ? DOODLE_DATA_URL_DARK : DOODLE_DATA_URL_LIGHT;

  return (
    <div
      id="phone-recording-studio"
      className="flex flex-col items-center w-full justify-between gap-3 select-none"
    >
      {/* Top action header: Device Brand & Canvas toggle */}
      <div className="w-full flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-300">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSamsung ? 'Samsung Galaxy S24 Ultra' : 'Xiaomi 17 Pro'}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {contact.navStyle === 'buttons' ? '3-Button' : 'Gestures'}
          </span>
        </div>

        {/* View mode toggle: Phone shell preview vs 1080p canvas monitor */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveViewMode('phone')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeViewMode === 'phone'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Device</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('canvas')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeViewMode === 'canvas'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>1080p Canvas</span>
          </button>
        </div>
      </div>

      {/* Fixed Android Device Shell (390 x 760 px - Fixed size & strictly wrapping WhatsApp layout) */}
      <div className="relative flex justify-center w-full">
        <div
          id="android-device-outer-chassis"
          className={`relative w-[390px] h-[760px] max-h-[82vh] p-[7px] bg-gradient-to-b ${
            isSamsung
              ? 'from-[#3a3d42] via-[#24272c] to-[#121417] rounded-[42px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1.5px_rgba(255,255,255,0.12)]'
              : 'from-[#424448] via-[#292b2f] to-[#16181a] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1.5px_rgba(255,255,255,0.15)]'
          } flex flex-col items-center justify-between`}
        >
          {/* Hardware buttons on chassis sides */}
          <div className="absolute -left-[9px] top-[140px] w-[3px] h-[48px] bg-zinc-600 rounded-l-sm" />
          <div className="absolute -left-[9px] top-[198px] w-[3px] h-[48px] bg-zinc-600 rounded-l-sm" />
          <div className="absolute -right-[9px] top-[165px] w-[3px] h-[64px] bg-zinc-600 rounded-r-sm" />

          {/* Android Glass Screen */}
          <div
            id="android-screen-surface"
            className={`w-full h-full overflow-hidden flex flex-col justify-between ${
              isSamsung ? 'rounded-[35px]' : 'rounded-[41px]'
            } border border-black/80 relative shadow-inner`}
            style={{ backgroundColor: theme.background }}
          >
            {/* 1. ANDROID STATUS BAR (One UI / HyperOS Style) */}
            <div
              className="h-7 px-4 pt-1.5 flex items-center justify-between text-xs font-semibold select-none flex-shrink-0 z-20"
              style={{
                backgroundColor: theme.header,
                color: theme.headerText,
              }}
            >
              {/* Left Clock */}
              <div className="w-16 font-sans text-[11px] tracking-tight text-left">
                {contact.phoneTime || '09:41'}
              </div>

              {/* Center Punch-hole Camera */}
              <div className="flex justify-center items-center">
                <div
                  className={`rounded-full bg-black ring-1 ring-zinc-800 flex items-center justify-center ${
                    isSamsung ? 'w-3 h-3 mt-0.5' : 'w-2.5 h-2.5 mt-0.5'
                  }`}
                >
                  <div className="w-1 h-1 rounded-full bg-[#0a1128] opacity-80" />
                </div>
              </div>

              {/* Right System Icons: Wi-Fi, 5G/Signal, Battery */}
              <div className="w-16 flex items-center justify-end gap-1.5 text-[10px]">
                {/* Wi-Fi Icon */}
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.22c3.78 0 7.22 1.48 9.77 3.92L12 19.12 2.23 10.14A14.67 14.67 0 0 1 12 6.22z" />
                </svg>

                {/* 5G / Cellular Signal */}
                <span className="font-mono text-[9.5px] font-bold">5G</span>

                {/* Battery with dynamic fill */}
                <div className="w-4 h-2 rounded-[2px] border border-current p-[0.5px] flex items-center relative">
                  <div
                    className="h-full rounded-[1px] bg-current transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(10, contact.batteryLevel || 85))}%`,
                    }}
                  />
                  <div className="absolute -right-[2px] top-[1.5px] w-[1px] h-[3px] bg-current rounded-r-[0.5px]" />
                </div>
              </div>
            </div>

            {/* 2. ANDROID WHATSAPP APP BAR */}
            <div
              className="h-14 px-2.5 flex items-center justify-between flex-shrink-0 shadow-md z-10"
              style={{
                backgroundColor: theme.header,
                color: theme.headerText,
              }}
            >
              {/* Left: Back Arrow + Contact Avatar + Contact Name/Status */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Back Arrow */}
                <button
                  type="button"
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg
                    className="w-4 h-4 fill-none stroke-current stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>

                {/* Contact Avatar */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-zinc-800 flex-shrink-0 shadow-xs">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={contact.contactName}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                      {contact.contactName.charAt(0) || 'C'}
                    </div>
                  )}
                </div>

                {/* Contact Name & Subtitle Status */}
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold tracking-tight truncate leading-tight">
                    {contact.contactName}
                  </div>
                  <div className="text-[10.5px] opacity-90 truncate leading-tight">
                    {isPersonBTyping ? (
                      <span className="text-emerald-300 font-medium">typing...</span>
                    ) : contact.statusMode === 'typing' ? (
                      <span className="text-emerald-300 font-medium">typing...</span>
                    ) : contact.statusMode === 'online' ? (
                      'online'
                    ) : contact.statusMode === 'lastSeen' ? (
                      'last seen today at ' + (contact.phoneTime || '09:41')
                    ) : (
                      contact.customStatusText || 'online'
                    )}
                  </div>
                </div>
              </div>

              {/* Right: WhatsApp Video Call, Voice Call, Three-Dots Menu */}
              <div className="flex items-center gap-2 flex-shrink-0 text-white/90">
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. CHAT MESSAGE WINDOW (WhatsApp Wallpaper + Messages + 3-Dots on Bottom) */}
            {activeViewMode === 'canvas' ? (
              <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center p-2 overflow-hidden">
                <canvas
                  ref={canvasMonitorRef}
                  className="max-h-full w-auto aspect-[9/16] rounded-xl shadow-lg border border-zinc-800"
                />
              </div>
            ) : (
              <div
                ref={chatScrollRef}
                className="relative flex-1 min-h-0 p-3 overflow-y-auto overflow-x-hidden space-y-2 flex flex-col"
                style={{
                  backgroundColor: theme.background,
                  backgroundImage: `url("${doodleBg}")`,
                  backgroundSize: '240px 240px',
                }}
              >
                {/* Free Tier Watermark Badge Preview on Top-Left (Outwards from corner) */}
                {!isPro && (
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="self-start mb-1 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-xs border transition-transform hover:scale-102"
                    style={{
                      backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.85)',
                      borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
                    }}
                    title="Click to remove watermark (Upgrade Pro)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span
                      className={`text-[9.5px] font-bold ${
                        theme.mode === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                      }`}
                    >
                      Created with I Am WhatsApp
                    </span>
                  </button>
                )}

                {/* Date separator */}
                <div className="flex justify-center my-1">
                  <span
                    className="px-3 py-0.5 rounded-lg text-[10.5px] font-medium shadow-xs"
                    style={{
                      backgroundColor: theme.dateBadgeBg,
                      color: theme.dateBadgeText,
                    }}
                  >
                    TODAY
                  </span>
                </div>

                {/* Messages Loop: NO TYPEWRITER ANIMATION.
                    Messages only show up when sent (send moment)! */}
                {messages.map((msg) => {
                  const sendMoment = msg.startMs + msg.typingDelayMs + msg.typingDurationMs;
                  const isSentToChat = currentTimeMs >= sendMoment;

                  // Requirement 1: chat typing animation removed; only when message gets sent does it appear!
                  if (!isSentToChat) return null;

                  const isSent = msg.sender === 'A';
                  const fullText = msg.text;

                  const emojiTier = getEmojiRenderTier(fullText);
                  const isSingleEmoji = emojiTier === 'single' && !msg.hasImage;
                  const isFewEmojis = emojiTier === 'few' && !msg.hasImage;

                  const messageAge = currentTimeMs - msg.startMs;
                  const isBlueCheck = messageAge > msg.typingDelayMs + msg.typingDurationMs + 300;

                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      {isSingleEmoji ? (
                        /* Standalone Giant Emoji */
                        <div
                          className={`text-5xl py-1 transform transition-transform ${
                            isSent ? 'text-right' : 'text-left'
                          }`}
                        >
                          {fullText}
                        </div>
                      ) : (
                        /* Android WhatsApp Message Bubble */
                        <div
                          className={`relative max-w-[80%] shadow-xs text-[12.5px] leading-[1.35] break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-150 ${
                            msg.hasImage ? 'p-1' : 'px-3 py-1.5'
                          } ${
                            isSent
                              ? 'rounded-2xl rounded-tr-xs' // Sent message right tail
                              : 'rounded-2xl rounded-tl-xs' // Received message left tail
                          }`}
                          style={{
                            backgroundColor: isSent
                              ? theme.sentBubble
                              : theme.receivedBubble,
                            color: isSent ? theme.sentText : theme.receivedText,
                          }}
                        >
                          {/* Screenshot / Image Attachment (Requirement 3) */}
                          {msg.hasImage && msg.imageUrl && (
                            <div className="relative rounded-xl overflow-hidden mb-1 group cursor-pointer bg-black/20">
                              <img
                                src={msg.imageUrl}
                                alt="Screenshot"
                                className="w-full max-h-[220px] object-cover rounded-xl transition-transform group-hover:scale-102"
                                onClick={() => setPreviewImageUrl(msg.imageUrl || null)}
                              />
                            </div>
                          )}

                          {/* Message Content / Caption */}
                          {fullText && (
                            <div
                              className={`break-words [overflow-wrap:anywhere] ${
                                msg.hasImage ? 'px-2 pt-0.5 pb-1' : ''
                              } ${isFewEmojis ? 'text-2xl py-0.5' : 'font-normal'}`}
                            >
                              {fullText}
                            </div>
                          )}

                          {/* Timestamp and Double Checkmark */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[9.5px] select-none ${
                              msg.hasImage ? 'px-2 pb-1' : 'mt-0.5 -mb-0.5'
                            }`}
                            style={{
                              color: isSent
                                ? theme.timeSentText
                                : theme.timeReceivedText,
                            }}
                          >
                            <span>{msg.timestamp}</span>

                            {isSent && (
                              <div className="flex items-center -space-x-1.5 ml-0.5">
                                <Check
                                  className={`w-3 h-3 stroke-[2.5] transition-colors ${
                                    isBlueCheck ? 'text-[#53bdeb]' : 'text-zinc-400'
                                  }`}
                                />
                                <Check
                                  className={`w-3 h-3 stroke-[2.5] transition-colors ${
                                    isBlueCheck ? 'text-[#53bdeb]' : 'text-zinc-400'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Requirement 1: 3-Dot Bouncing Typing Indicator on the bottom on top of the message field! */}
                {showTypingBubble && isPersonBTyping && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-150 mt-auto">
                    <div
                      className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5"
                      style={{ backgroundColor: theme.receivedBubble }}
                    >
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ANDROID WHATSAPP BOTTOM MESSAGE FIELD (Capsule + FAB Button) */}
            <div
              className="px-2 py-1.5 flex items-center gap-1.5 z-10 flex-shrink-0"
              style={{ backgroundColor: theme.background }}
            >
              {/* Android Input Capsule with Emoji, Paperclip, Camera */}
              <div
                className="flex-1 min-w-0 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-xs text-xs"
                style={{
                  backgroundColor: theme.inputBackground,
                  color: theme.inputText,
                }}
              >
                <Smile
                  className="w-4.5 h-4.5 flex-shrink-0"
                  style={{ color: theme.iconColor }}
                />

                {/* Draft preview or "Message" placeholder with fixed single-line bounds */}
                <div className="flex-1 min-w-0 h-5 flex items-center overflow-hidden">
                  {personADraftText ? (
                    <div className="font-normal text-[12.5px] flex items-center justify-end w-full whitespace-nowrap overflow-hidden">
                      <span className="truncate">{personADraftText}</span>
                      <span className="w-0.5 h-3.5 bg-emerald-500 ml-0.5 animate-pulse flex-shrink-0" />
                    </div>
                  ) : (
                    <span
                      className="text-[12.5px] block truncate"
                      style={{ color: theme.inputPlaceholder }}
                    >
                      Message
                    </span>
                  )}
                </div>

                <Paperclip
                  className="w-4 h-4 flex-shrink-0 rotate-45"
                  style={{ color: theme.iconColor }}
                />
                <Camera
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: theme.iconColor }}
                />
              </div>

              {/* Android Green FAB Button (Mic or Send plane) */}
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md shadow-emerald-950/40 flex-shrink-0">
                {personADraftText || isPersonATyping ? (
                  <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* 5. ANDROID NAVIGATION BAR (Gesture Bar vs 3-Button Nav) */}
            <div className="h-6 flex items-center justify-center flex-shrink-0 z-10">
              {contact.navStyle === 'buttons' ? (
                /* Classic Android 3-Button Navigation */
                <div className="w-full px-12 flex items-center justify-between text-zinc-400 opacity-60 text-xs">
                  {/* Recents ||| */}
                  <div className="flex items-center gap-0.5">
                    <div className="w-0.5 h-3 bg-current rounded-full" />
                    <div className="w-0.5 h-3 bg-current rounded-full" />
                    <div className="w-0.5 h-3 bg-current rounded-full" />
                  </div>
                  {/* Home Circle */}
                  <div className="w-3 h-3 rounded-full border border-current" />
                  {/* Back Arrow */}
                  <div className="text-[14px] font-bold tracking-tighter">&lt;</div>
                </div>
              ) : (
                /* Android Gesture Line */
                <div className="w-28 h-1 rounded-full bg-zinc-400/40" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Action Card with Format (MP4 / GIF) & Quality (1080p, 720p, 480p, 360p) */}
      <div className="w-full max-w-[390px] bg-zinc-900/95 border border-zinc-800 rounded-xl p-3 space-y-2.5 shadow-lg">
        {/* Quick Format & Quality Selectors */}
        <div className="flex items-center justify-between gap-2 pb-0.5">
          {/* Format Toggle (MP4 vs GIF) */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-medium">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onChangeExportFormat('mp4')}
              className={`px-2 py-1 rounded-md transition-all ${
                exportFormat === 'mp4'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MP4
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onChangeExportFormat('gif')}
              className={`px-2 py-1 rounded-md transition-all ${
                exportFormat === 'gif'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              GIF
            </button>
          </div>

          {/* Quality Selector (1080p, 720p, 480p, 360p) */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono font-medium">
            {(['1080p', '720p', '480p', '360p'] as ExportResolution[]).map((res) => (
              <button
                key={res}
                type="button"
                disabled={isExporting}
                onClick={() => onChangeExportResolution(res)}
                className={`px-1.5 py-1 rounded-md transition-all ${
                  exportResolution === res
                    ? 'bg-zinc-800 text-emerald-400 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar during recording */}
        {isExporting && exportProgress && (
          <div className="space-y-1.5 pb-1">
            <div className="flex justify-between text-xs text-zinc-300">
              <span className="animate-pulse flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span className="truncate">{exportProgress.statusText}</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold flex-shrink-0">
                {exportProgress.progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150"
                style={{ width: `${exportProgress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Clean, high-contrast Download button */}
        <button
          id="btn-record-export-video"
          disabled={isExporting || messages.length === 0}
          onClick={onStartExport}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isExporting
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : messages.length === 0
              ? 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
              : exportFormat === 'gif'
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 hover:scale-[1.01]'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.01]'
          }`}
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          {isExporting
            ? `Generating ${exportFormat.toUpperCase()} (${exportResolution})...`
            : `Download ${exportFormat.toUpperCase()} (${exportResolution})`}
        </button>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Screenshot Preview"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
