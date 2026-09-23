import { GoogleGenAI } from '@google/genai';
import { ImageGenerationProvider, isTransientError } from './baseAdapter';
import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export class PollinationsAdapter implements ImageGenerationProvider {
  async validateConfig(_config: ProviderConfig): Promise<void> {
    // Pollinations requires no special key
  }

  async generateImage(
    config: ProviderConfig,
    request: ImageGenerationRequest,
    _decryptedKey: string
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const seed = request.seed || Math.floor(Math.random() * 999999);
    const pollModel = config.model || 'flux';

    try {
      let visualDescription = '';
      const serverGeminiKey = process.env.GEMINI_API_KEY?.trim();
      if (request.cleanBase64 && serverGeminiKey) {
        try {
          const aiVision = new GoogleGenAI({
            apiKey: serverGeminiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });
          const visionResp = await aiVision.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                { inlineData: { data: request.cleanBase64, mimeType: request.mimeType || 'image/png' } },
                {
                  text: 'Identify the person in this photo in one concise sentence: gender, approximate age, hair style and color, beard/facial hair if any, skin tone, eye color, glasses if any. Output only the description.'
                }
              ]
            }
          });
          visualDescription = visionResp.text?.trim() || '';
        } catch (vErr) {
          console.warn('[PollinationsAdapter] Vision prep warning:', vErr);
        }
      }

      const effectivePrompt = config.promptPrefix
        ? `${config.promptPrefix} ${request.prompt}`
        : request.prompt;

      const enrichedPrompt = visualDescription
        ? `Waist-up character portrait of ${visualDescription}. ${effectivePrompt}. Detailed upper body, arms, hands, and outfit clearly rendered. 3D animated character, Pixar and anime style, vibrant studio lighting, crisp character art.`
        : `Waist-up character portrait, ${effectivePrompt}. Detailed upper body, arms, hands, and outfit clearly rendered. 3D animated character, Pixar and anime style, vibrant studio lighting, crisp character art.`;

      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        enrichedPrompt
      )}?model=${encodeURIComponent(pollModel)}&seed=${seed}&width=1024&height=1024&nologo=true`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 45000);

      const fetchImg = await fetch(pollinationsUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!fetchImg.ok) {
        throw new Error(`Pollinations node returned status ${fetchImg.status}`);
      }

      const arrayBuf = await fetchImg.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      const contentType = fetchImg.headers.get('content-type') || 'image/jpeg';

      return {
        success: true,
        imageUrl: `data:${contentType};base64,${base64}`,
        imageBase64: base64,
        providerId: config.id,
        model: pollModel,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: config.id,
        model: pollModel,
        errorCode: 'POLLINATIONS_FAILED',
        errorMessage: err?.message || 'Pollinations cluster unreachable',
        isTransient: isTransientError(err),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async healthCheck(config: ProviderConfig, _decryptedKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const probeUrl = `https://image.pollinations.ai/prompt/ping?model=${encodeURIComponent(config.model || 'flux')}&width=32&height=32&nologo=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(probeUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return {
          healthy: true,
          message: 'Pollinations AI image cluster is active and responding.',
          latencyMs: Date.now() - startTime
        };
      }
      return {
        healthy: false,
        message: `Pollinations returned status ${res.status}`,
        latencyMs: Date.now() - startTime
      };
    } catch (e: any) {
      return {
        healthy: false,
        message: e?.message || 'Failed to reach Pollinations server',
        latencyMs: Date.now() - startTime
      };
    }
  }
}
