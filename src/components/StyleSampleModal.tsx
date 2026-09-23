import React, { useState } from 'react';
import { X, Sparkles, Check, ChevronRight, Layers, Zap, Palette, Cpu, Smile, Image as ImageIcon } from 'lucide-react';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../utils/constants';

interface StyleSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: ArtStyle;
  onSelectStyle: (style: ArtStyle) => void;
}

export const StyleSampleModal: React.FC<StyleSampleModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle
}) => {
  const [activePreviewStyle, setActivePreviewStyle] = useState<ArtStyle>(currentStyle);
  const [imgError, setImgError] = useState(false);

  // Sync when currentStyle changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActivePreviewStyle(currentStyle);
      setImgError(false);
    }
  }, [isOpen, currentStyle]);

  if (!isOpen) return null;

  const renderStyleIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const handleApply = () => {
    onSelectStyle(activePreviewStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/15 border border-blue-500/20 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cartoon">Art Style Sample Preview</h3>
              <p className="text-xs text-slate-400">
                Visual demonstration of stylized cartoon rendering aesthetics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close preview"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick Style Switcher Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ART_STYLES.map((style) => {
              const isSelected = activePreviewStyle.id === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setActivePreviewStyle(style);
                    setImgError(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {renderStyleIcon(style.iconName, 'w-3.5 h-3.5')}
                  <span>{style.name.split('/')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Sample Image Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
            <div className="w-full h-64 sm:h-80 relative flex items-center justify-center bg-slate-950">
              {!imgError ? (
                <img
                  src={activePreviewStyle.sampleImageUrl}
                  alt={`${activePreviewStyle.name} Sample`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                /* Fallback stylized gradient canvas if image link fails */
                <div
                  className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${activePreviewStyle.previewGradient}`}
                >
                  {renderStyleIcon(activePreviewStyle.iconName, 'w-16 h-16 text-white/90 mb-3 animate-pulse')}
                  <h4 className="text-xl font-bold text-white font-cartoon mb-1">
                    {activePreviewStyle.name}
                  </h4>
                  <p className="text-xs text-white/80 max-w-sm">
                    {activePreviewStyle.tagline}
                  </p>
                </div>
              )}

              {/* Category Badge overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                {renderStyleIcon(activePreviewStyle.iconName, 'w-3.5 h-3.5')}
                <span>{activePreviewStyle.name}</span>
              </div>
            </div>

            {/* Style Details Bottom Bar */}
            <div className="p-4 bg-slate-900/95 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 font-cartoon">
                  {activePreviewStyle.tagline}
                </span>
                <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
                  {activePreviewStyle.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activePreviewStyle.promptDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-4 sm:py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply &quot;{activePreviewStyle.name.split('/')[0].trim()}&quot; Style</span>
          </button>
        </div>
      </div>
    </div>
  );
};
