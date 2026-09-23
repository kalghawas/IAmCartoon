export type ProviderType = 'google' | 'openai' | 'stability' | 'huggingface' | 'pollinations' | 'custom';
export type ProviderTier = 'free' | 'paid' | 'both';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface ProviderConfig {
  id: string;
  displayName: string;
  providerType: ProviderType;
  baseUrl?: string;
  imageGenerationEndpoint?: string;
  model: string;
  encryptedApiKey?: string;
  hasApiKey?: boolean;
  enabled: boolean;
  priority: number;
  tier: ProviderTier;
  supportsImageGeneration: boolean;
  timeoutMs: number;
  maxRetries: number;
  lastHealthCheckAt?: number;
  lastSuccessAt?: number;
  lastFailureAt?: number;
  failureCount: number;
  circuitState: CircuitState;
  circuitOpenedAt?: number;
  recentFailures?: Array<{ timestamp: number; reason: string }>;
  lastLatencyMs?: number;
  outputResolution?: string;
  promptPrefix?: string;
  negativePrompt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PublicProviderConfig {
  id: string;
  displayName: string;
  providerType: ProviderType;
  baseUrl?: string;
  imageGenerationEndpoint?: string;
  model: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
  enabled: boolean;
  priority: number;
  tier: ProviderTier;
  supportsImageGeneration: boolean;
  timeoutMs: number;
  maxRetries: number;
  lastHealthCheckAt?: number;
  lastSuccessAt?: number;
  lastFailureAt?: number;
  failureCount: number;
  circuitState: CircuitState;
  circuitOpenedAt?: number;
  recentFailures?: Array<{ timestamp: number; reason: string }>;
  lastLatencyMs?: number;
  outputResolution?: string;
  promptPrefix?: string;
  negativePrompt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  cleanBase64?: string;
  mimeType?: string;
  aspectRatio?: string;
  tier: 'free' | 'paid';
  systemInstruction?: string;
  seed?: number;
  userId: string;
  idempotencyKey: string;
  customApiKey?: string; // Only if user explicitly provided a User API Key
  customProvider?: ProviderType;
  customModel?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  providerId: string;
  model?: string;
  requestId?: string;
  width?: number;
  height?: number;
  errorCode?: string;
  errorMessage?: string;
  isTransient?: boolean;
  latencyMs?: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latencyMs?: number;
}

export interface DailyUsageRecord {
  userId: string;
  dateBucket: string; // YYYY-MM-DD (UTC)
  successfulGenerations: number;
  lastSuccessAt?: number;
  requestStatus: 'idle' | 'processing' | 'completed' | 'failed';
  idempotencyKey?: string;
  lockExpiresAt?: number;
  providerUsed?: string;
  errorReason?: string;
}
