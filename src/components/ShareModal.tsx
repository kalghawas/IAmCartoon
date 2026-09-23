import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Send
} from 'lucide-react';
import { ArtStyle, PoseOption } from '../types';
import { BrandLogo } from './BrandLogo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  artStyle: ArtStyle;
  pose: PoseOption;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  artStyle,
  pose,
  onToast
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !imageUrl) return null;

  // Generate a clean shareable URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://iamcartoon.app';
  const shareTitle = `Turned my portrait into a ${artStyle.name} character with I am Cartoon! 🎨✨`;
  const shareText = `Check out my cartoon character in ${artStyle.name} style! Created with I am Cartoon AI Studio.`;

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'I am Cartoon - AI Studio',
          text: shareText,
          url: shareUrl
        });
        onToast('Shared successfully!');
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    onToast('🔗 Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Social Sharing URLs
  const socialShares = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'hover:bg-slate-800 hover:text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.953 1.178-.175.2-.35.226-.651.075-1.803-.902-2.983-1.609-4.167-3.642-.313-.538.313-.499.896-1.666.098-.2.05-.375-.025-.525-.075-.15-.677-1.63-.928-2.235-.244-.589-.493-.509-.677-.518-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.906 1.228 3.107.15.2 2.122 3.24 5.141 4.544.718.311 1.279.497 1.716.636.721.23 1.377.198 1.896.12.578-.088 1.78-.727 2.031-1.429.251-.702.251-1.303.176-1.429-.076-.125-.276-.2-.577-.35zM12.042 21.999h-.008c-1.77 0-3.504-.476-5.025-1.377l-.36-.214-3.738.98 1-3.643-.235-.374a10.016 10.016 0 0 1-1.536-5.33c0-5.535 4.503-10.038 10.04-10.038 2.684 0 5.205 1.045 7.102 2.943a9.99 9.99 0 0 1 2.94 7.098c0 5.536-4.504 10.038-10.04 10.038zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.12.553 4.19 1.603 6.008L0 24l6.126-1.607a12.003 12.003 0 0 0 5.916 1.547h.005c6.638 0 12.04-5.402 12.04-12.042 0-3.218-1.253-6.242-3.528-8.518C18.284 1.253 15.26 0 12.042 0z" />
        </svg>
      ),
      color: 'hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-600/40',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.932z" />
        </svg>
      ),
      color: 'hover:bg-sky-950 hover:text-sky-400 hover:border-sky-600/40',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'hover:bg-blue-950 hover:text-blue-400 hover:border-blue-600/40',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Reddit',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      color: 'hover:bg-orange-950 hover:text-orange-400 hover:border-orange-600/40',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cartoon">
                Share Your Cartoon
              </h3>
              <p className="text-xs text-slate-400">
                Show off your animated character creation with friends
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Character Preview Pill */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <img
              src={imageUrl}
              alt="Cartoon Character Preview"
              className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-slate-700/80 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  {artStyle.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {pose.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate font-cartoon">
                I am Cartoon Creation
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Ready to share on any platform
              </p>
            </div>
          </div>

          {/* Native Web Share Button (Mobile & Modern Browsers) */}
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-cartoon text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Apps (WhatsApp, Instagram, etc.)</span>
          </button>

          {/* Social Platforms Row */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-2">
              Quick Share to Social Networks:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {socialShares.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 transition-all active:scale-95 cursor-pointer ${social.color}`}
                  title={`Share on ${social.name}`}
                >
                  {social.icon}
                  <span className="text-[10px] font-medium mt-1 truncate max-w-full">
                    {social.name.split(' ')[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400">
              Direct Shareable Link:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
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
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <BrandLogo className="w-4 h-4 text-blue-500" />
            <span>iamcartoon.app</span>
          </span>
          <span className="text-slate-500">Free to share & remix</span>
        </div>
      </div>
    </div>
  );
};
