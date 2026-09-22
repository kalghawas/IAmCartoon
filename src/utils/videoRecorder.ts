import {
  ParsedMessage,
  ContactSettings,
  ThemeColors,
  ExportProgress,
  ExportFormat,
  ExportResolution,
} from '../types';
import { renderChatFrame, preloadAvatar } from './canvasRenderer';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface RecordOptions {
  messages: ParsedMessage[];
  contact: ContactSettings;
  theme: ThemeColors;
  format: ExportFormat; // 'mp4' | 'gif'
  resolution: ExportResolution; // '1080p' | '720p' | '480p' | '360p'
  fps?: number;
  isPro?: boolean;
  onProgress: (progress: ExportProgress) => void;
  signal?: AbortSignal;
}

export function getResolutionConfig(res: ExportResolution): {
  width: number;
  height: number;
  label: string;
  bitrate: number;
  gifWidth: number;
  gifHeight: number;
} {
  switch (res) {
    case '1080p':
      return {
        width: 1080,
        height: 1920,
        label: '1080p (Full HD)',
        bitrate: 8000000,
        gifWidth: 540,
        gifHeight: 960,
      };
    case '720p':
      return {
        width: 720,
        height: 1280,
        label: '720p (HD)',
        bitrate: 4500000,
        gifWidth: 450,
        gifHeight: 800,
      };
    case '480p':
      return {
        width: 480,
        height: 854,
        label: '480p (SD)',
        bitrate: 2000000,
        gifWidth: 360,
        gifHeight: 640,
      };
    case '360p':
    default:
      return {
        width: 360,
        height: 640,
        label: '360p (Low / Compact)',
        bitrate: 1000000,
        gifWidth: 270,
        gifHeight: 480,
      };
  }
}

export function getSupportedVideoMimeType(): { mimeType: string; extension: string } {
  const candidates = [
    { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ];

  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c.mime)) {
      return { mimeType: c.mime, extension: c.ext };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

/**
 * Export Chat to Animated GIF
 */
async function exportToGif({
  messages,
  contact,
  theme,
  resolution,
  isPro = false,
  onProgress,
  signal,
}: RecordOptions): Promise<Blob> {
  const config = getResolutionConfig(resolution);
  const width = config.gifWidth;
  const height = config.gifHeight;

  // GIF frame rate: 16 FPS gives ultra-smooth pacing with optimal file size
  const fps = 16;
  const frameIntervalMs = 1000 / fps;

  // Total animation timeline duration
  const totalDurationMs = messages[messages.length - 1].endMs + 1200;
  const totalFrames = Math.max(1, Math.ceil((totalDurationMs / 1000) * fps));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get 2D canvas context for GIF recording.');
  }

  const gif = GIFEncoder();

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (signal?.aborted) {
      throw new Error('Export cancelled by user.');
    }

    const currentTimeMs = frameIndex * frameIntervalMs;

    // Render frame to canvas
    renderChatFrame({
      canvas,
      messages,
      currentTimeMs,
      contact,
      theme,
      width,
      height,
      showTypingBubble: true,
      isPro,
    });

    // Extract pixel buffer
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Quantize 256 colors & apply palette
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    // Write frame with delay
    gif.writeFrame(index, width, height, {
      palette,
      delay: Math.round(frameIntervalMs),
    });

    const progressPercent = Math.min(99, Math.floor(((frameIndex + 1) / totalFrames) * 100));

    if (frameIndex % 3 === 0 || frameIndex === totalFrames - 1) {
      onProgress({
        isRecording: true,
        progressPercent,
        currentFrame: frameIndex + 1,
        totalFrames,
        statusText: `Encoding GIF frame ${frameIndex + 1} of ${totalFrames} (${progressPercent}%)...`,
        recordedBlobUrl: null,
        recordedBlob: null,
        format: 'gif',
        resolution,
      });

      // Yield event loop to keep UI responsive
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  gif.finish();
  const buffer = gif.bytes();
  const blob = new Blob([buffer as unknown as BlobPart], { type: 'image/gif' });
  const blobUrl = URL.createObjectURL(blob);
  const sizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));

  onProgress({
    isRecording: false,
    progressPercent: 100,
    currentFrame: totalFrames,
    totalFrames,
    statusText: 'GIF Complete! Ready for download.',
    recordedBlobUrl: blobUrl,
    recordedBlob: blob,
    fileSizeMb: sizeMb,
    format: 'gif',
    resolution,
  });

  return blob;
}

/**
 * Export Chat to Video (MP4 / WebM)
 */
async function exportToVideo({
  messages,
  contact,
  theme,
  resolution,
  fps = 60,
  isPro = false,
  onProgress,
  signal,
}: RecordOptions): Promise<Blob> {
  const config = getResolutionConfig(resolution);
  const width = config.width;
  const height = config.height;

  const totalDurationMs = messages[messages.length - 1].endMs + 1200;
  const totalFrames = Math.ceil((totalDurationMs / 1000) * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const stream = canvas.captureStream(fps);
  const { mimeType } = getSupportedVideoMimeType();

  const recorderOptions: MediaRecorderOptions = {
    mimeType,
    videoBitsPerSecond: config.bitrate,
  };

  const mediaRecorder = new MediaRecorder(stream, recorderOptions);
  const recordedChunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    let isAborted = false;
    let frameIndex = 0;
    const frameIntervalMs = 1000 / fps;

    if (signal) {
      signal.addEventListener('abort', () => {
        isAborted = true;
        try {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } catch {
          // ignore
        }
        reject(new Error('Export cancelled by user.'));
      });
    }

    mediaRecorder.onstop = () => {
      if (isAborted) return;

      const blob = new Blob(recordedChunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const sizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));

      onProgress({
        isRecording: false,
        progressPercent: 100,
        currentFrame: totalFrames,
        totalFrames,
        statusText: `Video Rendered (${resolution})! Ready for download.`,
        recordedBlobUrl: blobUrl,
        recordedBlob: blob,
        fileSizeMb: sizeMb,
        format: 'mp4',
        resolution,
      });

      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      reject(new Error(`Recording error: ${e}`));
    };

    mediaRecorder.start(200);

    function step() {
      if (isAborted) return;

      const currentTimeMs = frameIndex * frameIntervalMs;

      renderChatFrame({
        canvas,
        messages,
        currentTimeMs,
        contact,
        theme,
        width,
        height,
        showTypingBubble: true,
        isPro,
      });

      frameIndex++;
      const progressPercent = Math.min(99, Math.floor((frameIndex / totalFrames) * 100));

      if (frameIndex % 6 === 0 || frameIndex >= totalFrames) {
        onProgress({
          isRecording: true,
          progressPercent,
          currentFrame: frameIndex,
          totalFrames,
          statusText: `Rendering ${resolution} frame ${frameIndex} of ${totalFrames} (${progressPercent}%)...`,
          recordedBlobUrl: null,
          recordedBlob: null,
          format: 'mp4',
          resolution,
        });
      }

      if (frameIndex < totalFrames) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 250);
      }
    }

    requestAnimationFrame(step);
  });
}

/**
 * Universal Entry Point for Media Export
 */
export async function exportChatMedia(options: RecordOptions): Promise<Blob> {
  if (options.messages.length === 0) {
    throw new Error('No messages to export.');
  }

  // Preload avatar
  if (options.contact.avatarUrl) {
    await preloadAvatar(options.contact.avatarUrl);
  }

  if (options.format === 'gif') {
    return exportToGif(options);
  } else {
    return exportToVideo(options);
  }
}
