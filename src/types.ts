export type AppThemeMode = 'dark' | 'light';
export type ChatThemeMode = 'dark' | 'light';

export type SenderRole = 'A' | 'B'; // A = Sent (Me / right), B = Received (Contact / left)

export type TaggedSender = 'A' | 'B' | 'NONE';

export interface TaggedLine {
  id: string;
  sender: TaggedSender;
  text: string;
  hasImage?: boolean;
  imageUrl?: string;
}

export interface ParsedMessage {
  id: string;
  sender: SenderRole;
  senderName: string;
  text: string;
  timestamp: string;
  hasImage?: boolean;
  imageUrl?: string;
  caption?: string;
  typingDelayMs: number;
  typingDurationMs: number;
  startMs: number;
  endMs: number;
}

export type AndroidDeviceModel = 'samsung' | 'pixel' | 'xiaomi';
export type AndroidNavStyle = 'gestures' | '3-button' | 'buttons';

export interface ContactSettings {
  contactName: string;
  senderName: string;
  avatarUrl: string;
  senderAvatarUrl?: string;
  statusMode: 'online' | 'typing' | 'custom' | 'last_seen' | 'lastSeen';
  customStatusText?: string;
  phoneTime: string;
  batteryLevel: number;
  wifiStrength: number;
  androidDevice: AndroidDeviceModel;
  navStyle: AndroidNavStyle;
}

export interface ThemeColors {
  mode: ChatThemeMode;
  header: string;
  headerText: string;
  headerSubtext: string;
  background: string;
  doodleColor?: string;
  sentBubble: string;
  sentText: string;
  receivedBubble: string;
  receivedText: string;
  timeSentText: string;
  timeReceivedText: string;
  inputBackground: string;
  inputText: string;
  inputPlaceholder: string;
  iconColor: string;
  checkMarkBlue: string;
  checkMarkGray: string;
  dateBadgeBg: string;
  dateBadgeText: string;
  typingDotColor: string;
}

export interface ParserConfig {
  prefixA: string;
  prefixB: string;
}

export interface AnimationSettings {
  speedMultiplier: number; // 1x, 1.5x, 2x
  loop: boolean;
  baseTypingSpeedCpm: number;
  pauseBetweenMessagesMs: number;
  showTypingBubble: boolean;
  typewriterEnabled?: boolean;
  soundEffectsEnabled?: boolean; // WhatsApp notification & typing audio
}

export type ExportFormat = 'mp4' | 'gif';
export type ExportResolution = '1080p' | '720p' | '480p' | '360p';

export interface ExportProgress {
  stage?: 'idle' | 'rendering' | 'encoding' | 'done' | 'error';
  isRecording?: boolean;
  currentFrame: number;
  totalFrames: number;
  percent?: number;
  progressPercent?: number;
  statusText?: string;
  downloadUrl?: string;
  recordedBlobUrl?: string | null;
  recordedBlob?: Blob | null;
  fileName?: string;
  fileSizeMb?: number;
  format?: ExportFormat;
  resolution?: ExportResolution;
  error?: string;
}

// Monetization & Subscription Tiers
export type UserPlanTier = 'free' | 'pro';

export interface UserSubscriptionState {
  tier: UserPlanTier;
  isPro: boolean;
  freeGenerationsUsed: number;
  freeGenerationsLimit: number; // e.g. 15 free generations/exports
  licenseKey?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'completed' | 'active';
  method: string; // 'Mada' | 'Apple Pay' | 'Credit Card' | 'STC Pay' | 'Promo Code'
  creditsGranted?: number;
}

export interface CreationRecord {
  id: string;
  createdAt: number;
  title: string;
  personAName: string;
  personBName: string;
  messageCount: number;
  format: ExportFormat;
  resolution: ExportResolution;
  rawTranscript: string;
  taggedLines: TaggedLine[];
  contactSnapshot: ContactSettings;
  themeModeSnapshot: ChatThemeMode;
  previewThumbnailUrl?: string;
  downloadBlobUrl?: string;
  fileName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt: string;
  creditsRemaining: number;
  subscription: UserSubscriptionState;
  savedSettings?: {
    contact: ContactSettings;
    chatThemeMode: ChatThemeMode;
    parserConfig: ParserConfig;
    animSettings: AnimationSettings;
  };
}

