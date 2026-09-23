import { ProviderType } from '../types';
import { ImageGenerationProvider } from './baseAdapter';
import { GoogleAdapter } from './googleAdapter';
import { PollinationsAdapter } from './pollinationsAdapter';
import { OpenAiAdapter } from './openAiAdapter';
import { StabilityAdapter } from './stabilityAdapter';
import { HuggingFaceAdapter, CustomAdapter } from './huggingFaceAdapter';

const adapters: Record<ProviderType, ImageGenerationProvider> = {
  google: new GoogleAdapter(),
  pollinations: new PollinationsAdapter(),
  openai: new OpenAiAdapter(),
  stability: new StabilityAdapter(),
  huggingface: new HuggingFaceAdapter(),
  custom: new CustomAdapter()
};

export function getAdapter(type: ProviderType): ImageGenerationProvider {
  const adapter = adapters[type];
  if (!adapter) {
    throw new Error(`Unsupported provider type: ${type}`);
  }
  return adapter;
}
