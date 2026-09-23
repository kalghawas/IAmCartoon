import fs from 'fs';
import path from 'path';
import { ProviderConfig, PublicProviderConfig, CircuitState } from './types';
import { encryptSecret, decryptSecret, maskApiKey } from './encryption';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');

const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CONSECUTIVE_FAILURES = 3;

class ProviderStore {
  private providers: Map<string, ProviderConfig> = new Map();
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(PROVIDERS_FILE)) {
        const raw = fs.readFileSync(PROVIDERS_FILE, 'utf-8');
        const list: ProviderConfig[] = JSON.parse(raw);
        list.forEach((p) => this.providers.set(p.id, p));
      } else {
        this.bootstrapDefaults();
      }
    } catch (e) {
      console.error('[ProviderStore] Initialization error:', e);
      this.bootstrapDefaults();
    }
    this.initialized = true;
  }

  private bootstrapDefaults() {
    this.providers.clear();
    const now = Date.now();

    // 1. Google Gemini Studio Provider
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
    const googleProvider: ProviderConfig = {
      id: 'provider_google_default',
      displayName: 'Google Gemini Studio',
      providerType: 'google',
      model: 'gemini-3.1-flash-image',
      encryptedApiKey: geminiKey ? encryptSecret(geminiKey) : undefined,
      hasApiKey: !!geminiKey,
      enabled: true,
      priority: 1,
      tier: 'both',
      supportsImageGeneration: true,
      timeoutMs: 45000,
      maxRetries: 2,
      failureCount: 0,
      circuitState: 'closed',
      promptPrefix: '',
      createdAt: now,
      updatedAt: now
    };

    // 2. Pollinations Free Cluster Provider
    const pollinationsProvider: ProviderConfig = {
      id: 'provider_pollinations_free',
      displayName: 'Pollinations AI (Neural Cluster)',
      providerType: 'pollinations',
      model: 'flux',
      hasApiKey: true,
      enabled: true,
      priority: 2,
      tier: 'free',
      supportsImageGeneration: true,
      timeoutMs: 35000,
      maxRetries: 1,
      failureCount: 0,
      circuitState: 'closed',
      createdAt: now,
      updatedAt: now
    };

    // 3. OpenAI DALL-E (Template)
    const openAiProvider: ProviderConfig = {
      id: 'provider_openai_template',
      displayName: 'OpenAI DALL-E 3',
      providerType: 'openai',
      model: 'dall-e-3',
      hasApiKey: false,
      enabled: false,
      priority: 3,
      tier: 'paid',
      supportsImageGeneration: true,
      timeoutMs: 50000,
      maxRetries: 2,
      failureCount: 0,
      circuitState: 'closed',
      createdAt: now,
      updatedAt: now
    };

    // 4. Stability AI (Template)
    const stabilityProvider: ProviderConfig = {
      id: 'provider_stability_template',
      displayName: 'Stability AI (SD3.5)',
      providerType: 'stability',
      model: 'sd3.5-large',
      hasApiKey: false,
      enabled: false,
      priority: 4,
      tier: 'paid',
      supportsImageGeneration: true,
      timeoutMs: 45000,
      maxRetries: 2,
      failureCount: 0,
      circuitState: 'closed',
      createdAt: now,
      updatedAt: now
    };

    // 5. Hugging Face (Template)
    const hfProvider: ProviderConfig = {
      id: 'provider_hf_template',
      displayName: 'Hugging Face (FLUX.1 Schnell)',
      providerType: 'huggingface',
      model: 'black-forest-labs/FLUX.1-schnell',
      hasApiKey: false,
      enabled: false,
      priority: 5,
      tier: 'both',
      supportsImageGeneration: true,
      timeoutMs: 45000,
      maxRetries: 1,
      failureCount: 0,
      circuitState: 'closed',
      createdAt: now,
      updatedAt: now
    };

    this.providers.set(googleProvider.id, googleProvider);
    this.providers.set(pollinationsProvider.id, pollinationsProvider);
    this.providers.set(openAiProvider.id, openAiProvider);
    this.providers.set(stabilityProvider.id, stabilityProvider);
    this.providers.set(hfProvider.id, hfProvider);

    this.persist();
  }

  private persist() {
    try {
      const list = Array.from(this.providers.values());
      fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ProviderStore] Failed to persist providers:', e);
    }
  }

  public getProviders(): ProviderConfig[] {
    this.ensureInitialized();
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
  }

  public getPublicProviders(): PublicProviderConfig[] {
    this.ensureInitialized();
    return this.getProviders().map((p) => {
      const decrypted = p.encryptedApiKey ? decryptSecret(p.encryptedApiKey) : '';
      return {
        id: p.id,
        displayName: p.displayName,
        providerType: p.providerType,
        baseUrl: p.baseUrl,
        imageGenerationEndpoint: p.imageGenerationEndpoint,
        model: p.model,
        hasApiKey: !!(decrypted || p.providerType === 'pollinations'),
        maskedApiKey: decrypted ? maskApiKey(decrypted) : undefined,
        enabled: p.enabled,
        priority: p.priority,
        tier: p.tier,
        supportsImageGeneration: p.supportsImageGeneration,
        timeoutMs: p.timeoutMs,
        maxRetries: p.maxRetries,
        lastHealthCheckAt: p.lastHealthCheckAt,
        lastSuccessAt: p.lastSuccessAt,
        lastFailureAt: p.lastFailureAt,
        failureCount: p.failureCount,
        circuitState: this.evaluateCircuitState(p),
        circuitOpenedAt: p.circuitOpenedAt,
        recentFailures: p.recentFailures,
        lastLatencyMs: p.lastLatencyMs,
        outputResolution: p.outputResolution,
        promptPrefix: p.promptPrefix,
        negativePrompt: p.negativePrompt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });
  }

  public getProviderById(id: string): ProviderConfig | undefined {
    this.ensureInitialized();
    return this.providers.get(id);
  }

  public getDecryptedApiKey(provider: ProviderConfig): string {
    if (provider.encryptedApiKey) {
      return decryptSecret(provider.encryptedApiKey);
    }
    // Fallback to process.env if matching google provider
    if (provider.providerType === 'google' && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY.trim();
    }
    return '';
  }

  public saveProvider(input: {
    id?: string;
    displayName: string;
    providerType: ProviderConfig['providerType'];
    model: string;
    apiKey?: string; // New plaintext key to save/rotate
    baseUrl?: string;
    imageGenerationEndpoint?: string;
    enabled?: boolean;
    priority?: number;
    tier?: ProviderConfig['tier'];
    timeoutMs?: number;
    maxRetries?: number;
    outputResolution?: string;
    promptPrefix?: string;
    negativePrompt?: string;
  }): ProviderConfig {
    this.ensureInitialized();
    const now = Date.now();
    const existing = input.id ? this.providers.get(input.id) : undefined;

    let encryptedApiKey = existing?.encryptedApiKey;
    if (input.apiKey !== undefined && input.apiKey.trim().length > 0) {
      encryptedApiKey = encryptSecret(input.apiKey.trim());
    }

    const provider: ProviderConfig = {
      id: input.id || `provider_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      displayName: input.displayName || existing?.displayName || 'New Provider',
      providerType: input.providerType || existing?.providerType || 'google',
      model: input.model || existing?.model || 'default',
      encryptedApiKey,
      hasApiKey: !!(encryptedApiKey || input.providerType === 'pollinations'),
      baseUrl: input.baseUrl ?? existing?.baseUrl,
      imageGenerationEndpoint: input.imageGenerationEndpoint ?? existing?.imageGenerationEndpoint,
      enabled: input.enabled !== undefined ? input.enabled : (existing?.enabled ?? true),
      priority: input.priority !== undefined ? input.priority : (existing?.priority ?? (this.providers.size + 1)),
      tier: input.tier || existing?.tier || 'both',
      supportsImageGeneration: true,
      timeoutMs: input.timeoutMs ?? existing?.timeoutMs ?? 45000,
      maxRetries: input.maxRetries ?? existing?.maxRetries ?? 2,
      failureCount: existing?.failureCount ?? 0,
      circuitState: existing?.circuitState ?? 'closed',
      circuitOpenedAt: existing?.circuitOpenedAt,
      recentFailures: existing?.recentFailures ?? [],
      lastLatencyMs: existing?.lastLatencyMs,
      outputResolution: input.outputResolution ?? existing?.outputResolution,
      promptPrefix: input.promptPrefix ?? existing?.promptPrefix,
      negativePrompt: input.negativePrompt ?? existing?.negativePrompt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    this.providers.set(provider.id, provider);
    this.persist();
    return provider;
  }

  public deleteProvider(id: string): boolean {
    this.ensureInitialized();
    const deleted = this.providers.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public evaluateCircuitState(provider: ProviderConfig): CircuitState {
    if (provider.circuitState === 'open') {
      const elapsed = Date.now() - (provider.circuitOpenedAt || 0);
      if (elapsed > CIRCUIT_COOLDOWN_MS) {
        return 'half-open';
      }
    }
    return provider.circuitState;
  }

  public recordSuccess(id: string, latencyMs: number) {
    const p = this.providers.get(id);
    if (!p) return;
    p.failureCount = 0;
    p.circuitState = 'closed';
    p.circuitOpenedAt = undefined;
    p.lastSuccessAt = Date.now();
    p.lastLatencyMs = latencyMs;
    p.updatedAt = Date.now();
    this.persist();
  }

  public recordFailure(id: string, reason: string) {
    const p = this.providers.get(id);
    if (!p) return;
    const now = Date.now();
    p.failureCount = (p.failureCount || 0) + 1;
    p.lastFailureAt = now;
    p.updatedAt = now;

    if (!p.recentFailures) p.recentFailures = [];
    p.recentFailures.unshift({ timestamp: now, reason: reason.slice(0, 200) });
    if (p.recentFailures.length > 5) p.recentFailures = p.recentFailures.slice(0, 5);

    if (p.failureCount >= MAX_CONSECUTIVE_FAILURES) {
      p.circuitState = 'open';
      p.circuitOpenedAt = now;
      console.warn(`[ProviderStore] Circuit OPENED for provider: ${p.displayName} (${p.id}) due to ${p.failureCount} consecutive failures.`);
    }
    this.persist();
  }

  public resetCircuit(id: string) {
    const p = this.providers.get(id);
    if (!p) return;
    p.failureCount = 0;
    p.circuitState = 'closed';
    p.circuitOpenedAt = undefined;
    p.updatedAt = Date.now();
    this.persist();
  }

  public updateHealth(id: string, healthy: boolean, latencyMs?: number) {
    const p = this.providers.get(id);
    if (!p) return;
    p.lastHealthCheckAt = Date.now();
    if (latencyMs) p.lastLatencyMs = latencyMs;
    if (healthy) {
      p.failureCount = 0;
      p.circuitState = 'closed';
    }
    p.updatedAt = Date.now();
    this.persist();
  }

  public getFallbackChain(tier: 'free' | 'paid'): ProviderConfig[] {
    this.ensureInitialized();
    const all = Array.from(this.providers.values());
    return all
      .filter((p) => p.enabled)
      .filter((p) => p.tier === tier || p.tier === 'both')
      .filter((p) => {
        const state = this.evaluateCircuitState(p);
        // Exclude open circuit; allow closed or half-open probe
        return state !== 'open';
      })
      .sort((a, b) => a.priority - b.priority);
  }
}

export const providerStore = new ProviderStore();
