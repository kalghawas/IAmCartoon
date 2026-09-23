import { GoogleGenAI } from '@google/genai';
import { ImageGenerationProvider, isTransientError } from './baseAdapter';
import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export class GoogleAdapter implements ImageGenerationProvider {
  async validateConfig(config: ProviderConfig): Promise<void> {
    if (!config.model) {
      throw new Error('Google model is required (e.g. gemini-3.1-flash-image)');
    }
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'AUTH_MISSING_KEY',
        errorMessage: 'Missing API key for Google Gemini provider.',
        isTransient: false
      };
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const effectivePrompt = config.promptPrefix
        ? `${config.promptPrefix}\n${request.prompt}`
        : request.prompt;

      const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
      if (request.cleanBase64) {
        parts.push({
          inlineData: {
            data: request.cleanBase64,
            mimeType: request.mimeType || 'image/png'
          }
        });
      }
      parts.push({ text: effectivePrompt });

      const candidateModels = [
        config.model || 'gemini-3.1-flash-image',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
        'gemini-3-pro-image'
      ];
      const uniqueModels = Array.from(new Set(candidateModels.filter(Boolean)));

      let lastError: any = null;

      for (const targetModel of uniqueModels) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Google request timed out')), config.timeoutMs || 45000)
          );

          const genPromise = ai.models.generateContent({
            model: targetModel,
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: request.aspectRatio || '1:1'
              },
              ...(request.systemInstruction ? { systemInstruction: request.systemInstruction } : {})
            }
          });

          const response: any = await Promise.race([genPromise, timeoutPromise]);

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                return {
                  success: true,
                  imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                  imageBase64: part.inlineData.data,
                  providerId: config.id,
                  model: targetModel,
                  latencyMs: Date.now() - startTime
                };
              }
            }
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`[GoogleAdapter] Model ${targetModel} failed:`, mErr?.message);
        }
      }

      const errMsg = lastError?.message || 'Google Gemini returned no image output.';
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'GOOGLE_GEN_FAILED',
        errorMessage: errMsg,
        isTransient: isTransientError(lastError),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: config.id,
        model: config.model,
        errorCode: 'GOOGLE_FATAL_ERROR',
        errorMessage: err?.message || 'Google Provider execution error',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const apiKey = decryptedKey || process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return { healthy: false, message: 'Google API key is missing' };
    }
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      // Fast probe
      await ai.models.generateContent({
        model: config.model || 'gemini-3.1-flash-image',
        contents: 'ping'
      });
      return {
        healthy: true,
        message: `Successfully connected to Google Gemini with model "${config.model}".`,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        healthy: false,
        message: err?.message || 'Failed to ping Google Gemini model',
        latencyMs: Date.now() - startTime
      };
    }
  }
}
