import React, { useRef } from 'react';
import { X, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { SCREENSHOT_PRESETS, ScreenshotPreset } from '../constants/screenshotLibrary';

interface ImageAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
}

export const ImageAttachmentModal: React.FC<ImageAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSelectTag,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          onSelectTag(`<image: ${dataUrl}>`);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Insert Screenshot / Image Attachment
              </h3>
              <p className="text-xs text-zinc-400">
                Pick a preset screenshot or upload your own image
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick generic tag option */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Standard Screenshot Command
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                &lt;image attachment&gt;
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectTag('<image attachment>');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
            >
              Insert &lt;image attachment&gt;
            </button>
          </div>

          {/* Upload custom image */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Upload Custom Screenshot / Photo
              </span>
              <span className="text-[11px] text-zinc-400">
                Choose any PNG, JPG, or SVG file from your device
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browse Files...</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Preset Screenshots */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 block">
              Or Select a Preset Realistic Screenshot:
            </span>

            <div className="grid grid-cols-2 gap-3">
              {SCREENSHOT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onSelectTag(`<image: ${preset.id}>`);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-emerald-500/50 text-left transition-all group flex flex-col gap-2"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block truncate group-hover:text-emerald-400">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block line-clamp-1">
                      {preset.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
