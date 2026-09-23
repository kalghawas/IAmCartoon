import { ImageGenerationProvider, isTransientError } from './baseAdapter';
import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export class HuggingFaceAdapter implements ImageGenerationProvider {
  async validateConfig(config: ProviderConfig): Promise<void> {
    if (!config.model) {
      throw new Error('Hugging Face model repository ID is required');
    }
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim();
    if (!apiKey) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'AUTH_MISSING_KEY',
        errorMessage: 'Missing API key for Hugging Face provider.',
        isTransient: false
      };
    }

    try {
      const endpoint =
        config.imageGenerationEndpoint ||
        `https://api-inference.huggingface.co/models/${config.model || 'black-forest-labs/FLUX.1-schnell'}`;

      const promptToSend = config.promptPrefix
        ? `${config.promptPrefix}\n${request.prompt}`
        : request.prompt;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 45000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({ inputs: promptToSend })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson.error || `Hugging Face error ${response.status}`;
        return {
          success: false,
          providerId: config.id,
          model: config.model,
          errorCode: `HF_${response.status}`,
          errorMessage: msg,
          isTransient: isTransientError(response.status),
          latencyMs: Date.now() - startTime
        };
      }

      const arrayBuf = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/png';

      return {
        success: true,
        imageUrl: `data:${contentType};base64,${base64}`,
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
        errorCode: 'HF_REQUEST_FAILED',
        errorMessage: err?.message || 'Hugging Face generation failed',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim();
    if (!apiKey) {
      return { healthy: false, message: 'Hugging Face token is missing' };
    }
    try {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) {
        return { healthy: false, message: `Hugging Face returned status ${res.status}`, latencyMs: Date.now() - startTime };
      }
      const data = await res.json();
      return {
        healthy: true,
        message: `Successfully connected to Hugging Face as "${data.name || 'User'}".`,
        latencyMs: Date.now() - startTime
      };
    } catch (e: any) {
      return {
        healthy: false,
        message: e?.message || 'Failed to reach Hugging Face',
        latencyMs: Date.now() - startTime
      };
    }
  }
}

export class CustomAdapter implements ImageGenerationProvider {
  async validateConfig(config: ProviderConfig): Promise<void> {
    if (!config.baseUrl && !config.imageGenerationEndpoint) {
      throw new Error('Base URL or Image Generation Endpoint is required for custom provider');
    }
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const endpoint = config.imageGenerationEndpoint || `${config.baseUrl}/v1/images/generations`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 45000);

      const promptToSend = config.promptPrefix
        ? `${config.promptPrefix}\n${request.prompt}`
        : request.prompt;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (decryptedKey) {
        headers['Authorization'] = `Bearer ${decryptedKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          prompt: promptToSend,
          model: config.model,
          size: config.outputResolution || '1024x1024',
          response_format: 'b64_json'
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          providerId: config.id,
          model: config.model,
          errorCode: `CUSTOM_${response.status}`,
          errorMessage: errJson.error?.message || `Custom provider error ${response.status}`,
          isTransient: isTransientError(response.status),
          latencyMs: Date.now() - startTime
        };
      }

      const data = await response.json();
      const b64 = data.data?.[0]?.b64_json;
      const imgUrl = data.data?.[0]?.url || data.imageUrl;

      if (b64) {
        return {
          success: true,
          imageUrl: `data:image/png;base64,${b64}`,
          imageBase64: b64,
          providerId: config.id,
          model: config.model,
          latencyMs: Date.now() - startTime
        };
      }
      if (imgUrl) {
        return {
          success: true,
          imageUrl: imgUrl,
          providerId: config.id,
          model: config.model,
          latencyMs: Date.now() - startTime
        };
      }

      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'CUSTOM_NO_IMAGE',
        errorMessage: 'Custom endpoint returned no image data',
        isTransient: false,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'CUSTOM_REQ_FAILED',
        errorMessage: err?.message || 'Custom provider request failed',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const endpoint = config.baseUrl || config.imageGenerationEndpoint;
    if (!endpoint) {
      return { healthy: false, message: 'Endpoint is not configured' };
    }
    try {
      const headers: Record<string, string> = {};
      if (decryptedKey) {
        headers['Authorization'] = `Bearer ${decryptedKey}`;
      }
      const res = await fetch(endpoint, { headers });
      return {
        healthy: res.status < 500,
        message: `Endpoint responded with HTTP ${res.status}`,
        latencyMs: Date.now() - startTime
      };
    } catch (e: any) {
      return {
        healthy: false,
        message: e?.message || 'Failed to reach custom endpoint',
        latencyMs: Date.now() - startTime
      };
    }
  }
}
