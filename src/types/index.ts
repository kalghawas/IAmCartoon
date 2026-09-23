export type ArtStyleId =
  | 'pixar-3d'
  | 'modern-vector'
  | 'classic-anime'
  | 'comic-novel'
  | 'cyberpunk-toon'
  | 'claymation-3d';

export interface ArtStyle {
  id: ArtStyleId;
  name: string;
  tagline: string;
  category: string;
  badgeColor: string;
  promptDescription: string;
  iconName: string;
  previewGradient: string;
  sampleImageUrl: string;
}

export type PoseId =
  | 'neutral-portrait'
  | 'salam-hand-on-heart'
  | 'saudi-ardah-sword'
  | 'gahwa-dallah-pour'
  | 'falconry-arm'
  | 'shemagh-adjust'
  | 'karak-chai-toast'
  | 'arms-crossed'
  | 'waving-friendly'
  | 'dynamic-pointing'
  | 'thinking-chin';

export interface PoseOption {
  id: PoseId;
  label: string;
  description: string;
  promptText: string;
  icon: string;
  cultureTag?: 'KSA' | 'Bahrain' | 'Gulf' | 'Universal';
}

export type WardrobeId =
  | 'saudi-thobe-shemagh'
  | 'bahraini-thobe-ghutra'
  | 'royal-bisht-mishlah'
  | 'gulf-luxury-abaya'
  | 'bahrain-pearl-heritage'
  | 'saudi-founding-dagla'
  | 'ardah-ceremonial'
  | 'modern-gulf-formal'
  | 'casual-hoodie'
  | 'professional-suit'
  | 'streetwear-tech'
  | 'traditional-robes'
  | 'custom-override';

export interface WardrobeOption {
  id: WardrobeId;
  label: string;
  description: string;
  promptText: string;
  icon: string;
  cultureTag?: 'KSA' | 'Bahrain' | 'Gulf' | 'Universal';
}

export type ExpressionId =
  | 'confident-smile'
  | 'playful-wink'
  | 'serious-stoic'
  | 'cheerful-laugh'
  | 'intense-focus';

export interface ExpressionOption {
  id: ExpressionId;
  label: string;
  promptText: string;
}

export interface SamplePortrait {
  id: string;
  name: string;
  role: string;
  gender: 'female' | 'male' | 'neutral';
  hairDescription: string;
  imageDataUrl: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  expiresAt?: number; // 30-day retention expiration timestamp
  originalImage: string;
  generatedImage: string;
  artStyle: ArtStyleId;
  pose: PoseId;
  wardrobe: WardrobeId;
  customWardrobeText?: string;
  expression: ExpressionId;
  seed: number;
  promptUsed: string;
  aspectRatio: string;
  durationMs: number;
  isMock: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt: number;
  credits: UserCreditState;
}

export interface GenerationStep {
  step: number;
  label: string;
  percentage: number;
}

export interface CropSettings {
  zoom: number;
  panX: number;
  panY: number;
  aspectRatio: '1:1' | '4:5' | '3:4';
  rotation: number;
}

export type AIProviderId = 'google' | 'openai' | 'stability' | 'huggingface' | 'pollinations';

export interface AIModelOption {
  id: string;
  name: string;
  qualityDescription: string;
  badge?: string;
}

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  tagline: string;
  keyPrefix: string;
  placeholder: string;
  isFreeAvailable: boolean;
  requiresKey: boolean;
  dashboardUrl: string;
  models: AIModelOption[];
  stepByStepGuide: {
    title: string;
    targetAudience: string;
    warningNote: string;
    steps: {
      number: number;
      instruction: string;
      actionUrl?: string;
      actionUrlLabel?: string;
      whatHappens: string;
    }[];
  };
}

export interface UserCreditState {
  freeCreditsRemaining: number;
  purchasedCredits: number;
  lastMonthlyReset: number;
  unlockedImageIds: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  priceUsd: number;
  priceSar: number;
  creditsAdded: number;
  removesWatermark: boolean;
  popular?: boolean;
  description: string;
  features: string[];
}

export interface DailyUsageState {
  remaining: number;
  usedToday: boolean;
  resetAt: number;
  dateBucket: string;
  isLocked?: boolean;
  lastSuccessAt?: number;
  providerUsed?: string;
}

export interface PublicProvider {
  id: string;
  displayName: string;
  providerType: 'google' | 'openai' | 'stability' | 'huggingface' | 'pollinations' | 'custom';
  baseUrl?: string;
  imageGenerationEndpoint?: string;
  model: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
  enabled: boolean;
  priority: number;
  tier: 'free' | 'paid' | 'both';
  supportsImageGeneration: boolean;
  timeoutMs: number;
  maxRetries: number;
  lastHealthCheckAt?: number;
  lastSuccessAt?: number;
  lastFailureAt?: number;
  failureCount: number;
  circuitState: 'closed' | 'open' | 'half-open';
  circuitOpenedAt?: number;
  recentFailures?: Array<{ timestamp: number; reason: string }>;
  lastLatencyMs?: number;
  outputResolution?: string;
  promptPrefix?: string;
  negativePrompt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  provider: AIProviderId;
  geminiApiKey: string;
  useMockMode: boolean;
  model: string;
  aspectRatio: '1:1' | '3:4' | '4:3';
  systemPrompt: string;
  useBuiltinChain?: boolean;
}

export type ViewComparisonMode = 'side-by-side' | 'split-slider' | 'single-generated' | 'single-original';

export type OfflineStyle = 'clean-cartoon' | 'cel-shaded' | 'comic' | 'soft-illustration';
export type OfflineBackgroundMode = 'simplified' | 'soft-blur' | 'flat-color' | 'simple-gradient' | 'original' | 'solid-color';

export interface OfflineModeSettings {
  style: OfflineStyle;
  cartoonStrength: number;          // 1 to 100 (Overall cartoon abstraction level)
  colorSimplification: number;      // 1 to 100 (Palette quantization & shape grouping)
  shadowStrength: number;           // 1 to 100 (Cel-shading shadow depth)
  outlineStrength: number;          // 0 to 100 (Structural ink line weight)
  smoothing: number;                // 1 to 100 (Photographic texture removal)
  saturation: number;               // 50 to 200 (Color vibrancy & grading)
  backgroundMode: OfflineBackgroundMode;
  solidColor: string;               // Hex color for flat-color background
  gradientColor1?: string;          // Primary studio gradient color
  gradientColor2?: string;          // Secondary studio gradient color
  autoCropPortrait?: boolean;       // Automatically frame head-and-shoulders composition
  debugMode?: boolean;              // Developer debug inspection mode
}

export interface OfflineDebugLayers {
  original?: string;
  faceAndLandmarks?: string;
  subjectMask?: string;
  backgroundMask?: string;
  skinMask?: string;
  hairMask?: string;
  toneBands?: string;
  structuralEdges?: string;
  colorQuantized?: string;
  finalComposite?: string;
}

