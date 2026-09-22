import { CreationRecord } from '../types';

export interface ShareDataPayload {
  title: string;
  text?: string;
  url?: string;
  file?: File;
}

/**
 * Checks if the browser natively supports Web Share API with files
 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  if (!navigator.canShare) return true;
  try {
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Triggers native OS share dialog (WhatsApp, Messages, AirDrop, Instagram, etc.)
 */
export async function triggerNativeShare(payload: ShareDataPayload): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (payload.file && navigator.canShare && navigator.canShare({ files: [payload.file] })) {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          files: [payload.file],
        });
        return true;
      } else {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url || window.location.href,
        });
        return true;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled share dialog
        return false;
      }
      console.warn('Native share error, falling back:', err);
    }
  }
  return false;
}

/**
 * Generate quick WhatsApp Web share link
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Generate quick Telegram share link
 */
export function getTelegramShareUrl(text: string, url?: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url || window.location.href)}&text=${encodeURIComponent(text)}`;
}

/**
 * Generate quick Twitter/X share link
 */
export function getTwitterShareUrl(text: string, url?: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url || window.location.href)}`;
}
