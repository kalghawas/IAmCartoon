import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  MessageCircle,
  Send,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { AppThemeMode, CreationRecord, ExportFormat } from '../types';
import {
  triggerNativeShare,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
  getTwitterShareUrl,
  canShareFiles,
} from '../utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  senderName: string;
  contactName: string;
  format?: ExportFormat;
  blobUrl?: string | null;
  rawText?: string;
  appThemeMode: AppThemeMode;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  senderName,
  contactName,
  format = 'mp4',
  blobUrl,
  rawText,
  appThemeMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);

  if (!isOpen) return null;

  const isDark = appThemeMode === 'dark';

  const shareText = `Check out this WhatsApp conversation animation between ${senderName} and ${contactName} created with I Am whatsapp! 🎬📱`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    setIsSharingNative(true);
    let fileToShare: File | undefined = undefined;

    if (blobUrl) {
      try {
        const res = await fetch(blobUrl);
        const blob = await res.blob();
        const ext = format === 'gif' ? 'gif' : 'mp4';
        const mimeType = format === 'gif' ? 'image/gif' : 'video/mp4';
        fileToShare = new File(
          [blob],
          `whatsapp_chat_${contactName.toLowerCase().replace(/\s+/g, '_')}.${ext}`,
          { type: mimeType }
        );
      } catch (e) {
        console.warn('Could not prepare file for native share:', e);
      }
    }

    await triggerNativeShare({
      title: `${senderName} & ${contactName} WhatsApp Animation`,
      text: shareText,
      url: window.location.href,
      file: fileToShare,
    });

    setIsSharingNative(false);
  };

  const handleWhatsAppShare = () => {
    const url = getWhatsAppShareUrl(`${shareText}\n${window.location.href}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const url = getTelegramShareUrl(shareText, window.location.href);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const url = getTwitterShareUrl(shareText, window.location.href);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Share Animation</h3>
              <p className="text-[11px] text-zinc-400">
                {senderName} & {contactName} • {format.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Primary Action: Native Device Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isSharingNative}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {isSharingNative ? 'Opening Share Menu...' : 'Share to Apps / Contacts'}
            </span>
          </button>

          {/* Social Quick Share Grid */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Quick Share Options
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800/60 hover:bg-emerald-950/30 border-zinc-700/80 hover:border-emerald-500/50 text-zinc-200'
                    : 'bg-zinc-50 hover:bg-emerald-50 border-zinc-200 hover:border-emerald-400 text-zinc-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800/60 hover:bg-sky-950/30 border-zinc-700/80 hover:border-sky-500/50 text-zinc-200'
                    : 'bg-zinc-50 hover:bg-sky-50 border-zinc-200 hover:border-sky-400 text-zinc-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Telegram</span>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={handleTwitterShare}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800/60 hover:bg-zinc-700/60 border-zinc-700/80 hover:border-zinc-500 text-zinc-200'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-zinc-400 text-zinc-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-700/30 text-zinc-300 flex items-center justify-center font-bold text-xs">
                  𝕏
                </div>
                <span className="text-xs font-semibold">Post / X</span>
              </button>
            </div>
          </div>

          {/* Copy Share Link Field */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Copy Link & Summary
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin} • ${senderName} & ${contactName} chat`}
                className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-hidden font-mono ${
                  isDark
                    ? 'bg-zinc-800/90 border-zinc-700 text-zinc-300'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                }`}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct File Download if Blob exists */}
          {blobUrl && (
            <div className="pt-1">
              <a
                href={blobUrl}
                download={`whatsapp_chat_${contactName.toLowerCase().replace(/\s+/g, '_')}.${format}`}
                className={`w-full py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isDark
                    ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-700'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Download {format.toUpperCase()} File Directly</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
