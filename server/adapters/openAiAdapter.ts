import { ImageGenerationProvider, isTransientError } from './baseAdapter';
import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export class OpenAiAdapter implements ImageGenerationProvider {
  async validateConfig(config: ProviderConfig): Promise<void> {
    if (!config.model) {
      throw new Error('OpenAI model is required (e.g. dall-e-3)');
    }
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'AUTH_MISSING_KEY',
        errorMessage: 'Missing API key for OpenAI provider.',
        isTransient: false
      };
    }

    try {
      const openAiModel = config.model === 'dall-e-2' ? 'dall-e-2' : 'dall-e-3';
      const promptToSend = config.promptPrefix
        ? `${config.promptPrefix}\n${request.prompt}`
        : request.prompt;

      const endpoint = config.imageGenerationEndpoint || `${config.baseUrl || 'https://api.openai.com/v1'}/images/generations`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 45000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: openAiModel,
          prompt: promptToSend.slice(0, 1000),
          n: 1,
          size: config.outputResolution || '1024x1024',
          response_format: 'b64_json',
          quality: openAiModel === 'dall-e-3' ? 'standard' : undefined
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error?.message || `OpenAI error ${response.status}`;
        return {
          success: false,
          providerId: config.id,
          model: openAiModel,
          errorCode: `OPENAI_${response.status}`,
          errorMessage: msg,
          isTransient: isTransientError(response.status),
          latencyMs: Date.now() - startTime
        };
      }

      const openAiData = await response.json();
      const b64 = openAiData.data?.[0]?.b64_json;
      const imgUrl = openAiData.data?.[0]?.url;

      if (b64) {
        return {
          success: true,
          imageUrl: `data:image/png;base64,${b64}`,
          imageBase64: b64,
          providerId: config.id,
          model: openAiModel,
          latencyMs: Date.now() - startTime
        };
      } else if (imgUrl) {
        return {
          success: true,
          imageUrl: imgUrl,
          providerId: config.id,
          model: openAiModel,
          latencyMs: Date.now() - startTime
        };
      }

      return {
        success: false,
        providerId: config.id,
        model: openAiModel,
        errorCode: 'OPENAI_NO_IMAGE',
        errorMessage: 'No image data returned from OpenAI',
        isTransient: false,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'OPENAI_REQUEST_FAILED',
        errorMessage: err?.message || 'OpenAI generation failed',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return { healthy: false, message: 'OpenAI API key is missing' };
    }
    try {
      const endpoint = `${config.baseUrl || 'https://api.openai.com/v1'}/models`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) {
        return { healthy: false, message: `OpenAI returned status ${res.status}`, latencyMs: Date.now() - startTime };
      }
      return {
        healthy: true,
        message: `Successfully connected to OpenAI. Model: ${config.model}.`,
        latencyMs: Date.now() - startTime
      };
    } catch (e: any) {
      return {
        healthy: false,
        message: e?.message || 'Failed to connect to OpenAI',
        latencyMs: Date.now() - startTime
      };
    }
  }
}
