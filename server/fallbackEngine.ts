import { providerStore } from './providerStore';
import { getAdapter } from './adapters';
import { isTransientError } from './adapters/baseAdapter';
import { ImageGenerationRequest, ImageGenerationResult, ProviderConfig } from './types';

export class FallbackEngine {
  /**
   * Helper for delay with exponential backoff & jitter
   */
  private async backoffDelay(attempt: number): Promise<void> {
    const baseMs = 500;
    const factor = Math.pow(2, attempt);
    const jitter = Math.random() * 200;
    const delay = Math.min(3000, baseMs * factor + jitter);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Execute image generation through the fallback chain
   */
  public async execute(
    request: ImageGenerationRequest
  ): Promise<{
    result: ImageGenerationResult;
    attempts: Array<{ providerId: string; model: string; error?: string; latencyMs: number }>;
  }> {
    const attempts: Array<{ providerId: string; model: string; error?: string; latencyMs: number }> = [];

    // Case 1: User explicitly provided their own custom API key (Paid / BYOK tier)
    if (request.customApiKey && request.customApiKey.trim()) {
      const customType = request.customProvider || 'google';
      const customModel = request.customModel || (customType === 'google' ? 'gemini-3.1-flash-image' : 'default');

      const syntheticConfig: ProviderConfig = {
        id: 'user_custom_provider',
        displayName: `User Custom ${customType.toUpperCase()}`,
        providerType: customType,
        model: customModel,
        enabled: true,
        priority: 1,
        tier: 'paid',
        supportsImageGeneration: true,
        timeoutMs: 45000,
        maxRetries: 1,
        failureCount: 0,
        circuitState: 'closed',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      try {
        const adapter = getAdapter(customType);
        const res = await adapter.generateImage(syntheticConfig, request, request.customApiKey.trim());
        attempts.push({
          providerId: syntheticConfig.id,
          model: customModel,
          error: res.success ? undefined : res.errorMessage,
          latencyMs: res.latencyMs || 0
        });
        if (res.success) {
          return { result: res, attempts };
        }
      } catch (err: any) {
        attempts.push({
          providerId: syntheticConfig.id,
          model: customModel,
          error: err?.message || 'Custom key execution failed',
          latencyMs: 0
        });
      }
    }

    // Case 2: Built-in Creator-Managed Provider Fallback Chain
    const chain = providerStore.getFallbackChain(request.tier);

    if (chain.length === 0) {
      return {
        result: {
          success: false,
          providerId: 'none',
          errorCode: 'NO_PROVIDERS_AVAILABLE',
          errorMessage: 'No active AI providers are currently available for this tier. Please contact the administrator.'
        },
        attempts
      };
    }

    console.log(`[FallbackEngine] Starting chain execution for tier "${request.tier}". Providers in order:`, chain.map(p => `${p.displayName} (${p.model})`));

    for (const provider of chain) {
      const decryptedKey = providerStore.getDecryptedApiKey(provider);

      // Skip providers requiring keys if key is missing (unless pollinations)
      if (provider.providerType !== 'pollinations' && !decryptedKey) {
        console.warn(`[FallbackEngine] Skipping provider ${provider.displayName}: No API key configured.`);
        attempts.push({
          providerId: provider.id,
          model: provider.model,
          error: 'No API key configured on server',
          latencyMs: 0
        });
        continue;
      }

      let adapter;
      try {
        adapter = getAdapter(provider.providerType);
      } catch (adapterErr: any) {
        console.warn(`[FallbackEngine] No adapter for provider type ${provider.providerType}`);
        continue;
      }

      const maxAttempts = Math.max(1, (provider.maxRetries || 2) + 1);
      let lastErrMessage = '';

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0) {
          console.log(`[FallbackEngine] Retrying ${provider.displayName} (attempt ${attempt + 1}/${maxAttempts}) after backoff...`);
          await this.backoffDelay(attempt);
        }

        const start = Date.now();
        try {
          const genResult = await adapter.generateImage(provider, request, decryptedKey);
          const latency = Date.now() - start;

          if (genResult.success && genResult.imageUrl) {
            console.log(`[FallbackEngine] SUCCESS with provider "${provider.displayName}" (${provider.model}) in ${latency}ms`);
            providerStore.recordSuccess(provider.id, latency);
            attempts.push({
              providerId: provider.id,
              model: genResult.model || provider.model,
              latencyMs: latency
            });
            return { result: genResult, attempts };
          }

          // Unsuccessful response
          lastErrMessage = genResult.errorMessage || 'Provider returned empty response';
          const isTransient = genResult.isTransient ?? isTransientError(lastErrMessage);

          attempts.push({
            providerId: provider.id,
            model: provider.model,
            error: lastErrMessage,
            latencyMs: latency
          });

          // If non-transient (e.g. 401 Invalid Key, content policy), do NOT waste retries; immediately try next provider!
          if (!isTransient) {
            console.warn(`[FallbackEngine] Non-transient failure from ${provider.displayName}: ${lastErrMessage}. Skipping retries.`);
            break;
          }
        } catch (attemptErr: any) {
          const latency = Date.now() - start;
          lastErrMessage = attemptErr?.message || 'Unknown network error';
          const isTransient = isTransientError(attemptErr);

          attempts.push({
            providerId: provider.id,
            model: provider.model,
            error: lastErrMessage,
            latencyMs: latency
          });

          if (!isTransient) {
            console.warn(`[FallbackEngine] Non-transient exception from ${provider.displayName}: ${lastErrMessage}. Skipping retries.`);
            break;
          }
        }
      }

      // Record failure for this provider and advance to next provider in fallback chain
      console.warn(`[FallbackEngine] Provider "${provider.displayName}" failed all attempts. Advancing to next provider in fallback chain.`);
      providerStore.recordFailure(provider.id, lastErrMessage);
    }

    // All providers in the fallback chain were exhausted
    console.error('[FallbackEngine] All providers in the fallback chain failed.');
    return {
      result: {
        success: false,
        providerId: 'all_failed',
        errorCode: 'SERVICE_TEMPORARILY_BUSY',
        errorMessage: 'The image generation service is temporarily busy. Please try again in a few moments.'
      },
      attempts
    };
  }
}

export const fallbackEngine = new FallbackEngine();
