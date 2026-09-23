import { ProviderConfig, ImageGenerationRequest, ImageGenerationResult, HealthCheckResult } from '../types';

export interface ImageGenerationProvider {
  validateConfig(config: ProviderConfig): Promise<void>;
  generateImage(config: ProviderConfig, request: ImageGenerationRequest, decryptedKey: string): Promise<ImageGenerationResult>;
  healthCheck(config: ProviderConfig, decryptedKey: string): Promise<HealthCheckResult>;
}

export function isTransientError(statusOrErr: number | Error | string): boolean {
  if (typeof statusOrErr === 'number') {
    return [408, 429, 500, 502, 503, 504].includes(statusOrErr);
  }
  const str = String(statusOrErr).toLowerCase();
  return (
    str.includes('timeout') ||
    str.includes('timed out') ||
    str.includes('etimedout') ||
    str.includes('econnreset') ||
    str.includes('rate limit') ||
    str.includes('quota') ||
    str.includes('resource_exhausted') ||
    str.includes('503') ||
    str.includes('502') ||
    str.includes('504') ||
    str.includes('429') ||
    str.includes('overloaded') ||
    str.includes('busy')
  );
}
