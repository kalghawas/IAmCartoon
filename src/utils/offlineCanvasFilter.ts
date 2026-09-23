import { ArtStyleId, OfflineModeSettings, OfflineDebugLayers } from '../types';
import {
  runOfflineCartoonPipeline,
  DEFAULT_OFFLINE_SETTINGS,
  OfflineProcessingProgress,
  OfflineProcessingResult
} from './offlineEngine';

interface FilterParams {
  imageDataUrl: string;
  artStyle?: ArtStyleId;
  offlineSettings?: OfflineModeSettings;
  onProgress?: (progress: OfflineProcessingProgress) => void;
}

export async function processOfflineCanvasCartoon(params: FilterParams): Promise<OfflineProcessingResult> {
  const { imageDataUrl, artStyle, offlineSettings, onProgress } = params;

  // Derive offline settings from artStyle or use provided offlineSettings
  let settings: OfflineModeSettings = offlineSettings || { ...DEFAULT_OFFLINE_SETTINGS };

  if (artStyle && !offlineSettings) {
    if (artStyle === 'comic-novel') {
      settings.style = 'comic';
      settings.outlineStrength = 70;
      settings.colorSimplification = 75;
      settings.saturation = 140;
    } else if (artStyle === 'classic-anime') {
      settings.style = 'cel-shaded';
      settings.outlineStrength = 55;
      settings.colorSimplification = 60;
      settings.saturation = 120;
    } else {
      settings.style = 'clean-cartoon';
      settings.outlineStrength = 55;
      settings.colorSimplification = 65;
      settings.saturation = 125;
    }
  }

  return await runOfflineCartoonPipeline(imageDataUrl, settings, onProgress);
}
