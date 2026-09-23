import { ImageGenerationProvider, isTransientError } from './baseAdapter';
import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export class StabilityAdapter implements ImageGenerationProvider {
  async validateConfig(config: ProviderConfig): Promise<void> {
    if (!config.model) {
      throw new Error('Stability AI model is required (e.g. sd3.5-large)');
    }
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.STABILITY_API_KEY?.trim();
    if (!apiKey) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'AUTH_MISSING_KEY',
        errorMessage: 'Missing API key for Stability AI provider.',
        isTransient: false
      };
    }

    try {
      const endpoint = config.imageGenerationEndpoint || `${config.baseUrl || 'https://api.stability.ai'}/v2beta/stable-image/generate/sd3`;

      const promptToSend = config.promptPrefix
        ? `${config.promptPrefix}\n${request.prompt}`
        : request.prompt;

      const formData = new FormData();
      formData.append('prompt', promptToSend);
      formData.append('output_format', 'png');
      formData.append('model', config.model || 'sd3.5-large');
      formData.append('aspect_ratio', request.aspectRatio || '1:1');
      if (config.negativePrompt) {
        formData.append('negative_prompt', config.negativePrompt);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 45000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/*'
        },
        signal: controller.signal,
        body: formData
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson.message || errJson.name || `Stability error ${response.status}`;
        return {
          success: false,
          providerId: config.id,
          model: config.model,
          errorCode: `STABILITY_${response.status}`,
          errorMessage: msg,
          isTransient: isTransientError(response.status),
          latencyMs: Date.now() - startTime
        };
      }

      const arrayBuf = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');

      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64}`,
        imageBase64: base64,
        providerId: config.id,
        model: config.model,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'STABILITY_REQUEST_FAILED',
        errorMessage: err?.message || 'Stability generation failed',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.STABILITY_API_KEY?.trim();
    if (!apiKey) {
      return { healthy: false, message: 'Stability API key is missing' };
    }
    try {
      const endpoint = `${config.baseUrl || 'https://api.stability.ai'}/v1/user/account`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) {
        return { healthy: false, message: `Stability AI returned status ${res.status}`, latencyMs: Date.now() - startTime };
      }
      return {
        healthy: true,
        message: 'Successfully connected to Stability AI account.',
        latencyMs: Date.now() - startTime
      };
    } catch (e: any) {
      return {
        healthy: false,
        message: e?.message || 'Failed to reach Stability AI',
        latencyMs: Date.now() - startTime
      };
    }
  }
}
