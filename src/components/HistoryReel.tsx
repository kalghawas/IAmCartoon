import React from 'react';
import { History, Trash2, Clock, Download, ShieldCheck } from 'lucide-react';
import { HistoryItem } from '../types';
import { ART_STYLES } from '../utils/constants';

interface HistoryReelProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
}

export const HistoryReel: React.FC<HistoryReelProps> = ({
  history,
  activeId,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory
}) => {
  // Download previous variation directly
  const handleDownloadItem = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.generatedImage;
    link.download = `iam-cartoon-${item.artStyle}-${item.pose}-${item.id.slice(0, 6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (history.length === 0) {
    return (
      <div className="h-24 sm:h-28 px-4 sm:px-6 border-t border-slate-800/80 bg-[#0f172a]/90 flex items-center justify-between gap-4 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 shrink-0">
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300 font-cartoon flex items-center gap-2">
              <span>Saved Variations Reel</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-600/30 font-sans font-normal">
                30-Day Storage
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Each generated cartoon variation is saved for 30 days. Tap any thumbnail to reload or download.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format relative timestamp and days left
  const formatTime = (ts: number, expiresAt?: number) => {
    if (expiresAt) {
      const daysLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
      return `${daysLeft}d left`;
    }
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="h-24 sm:h-28 px-3 sm:px-6 border-t border-slate-800/80 bg-[#0f172a]/95 flex flex-col justify-center select-none shrink-0 overflow-hidden">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 font-cartoon">
            Saved Characters ({history.length})
          </span>
          <span className="text-[10px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40 hidden sm:inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            30-Day Cloud Storage
          </span>
        </div>
        <button
          onClick={onClearHistory}
          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 flex items-center gap-1 text-xs transition-colors cursor-pointer"
          title="Clear all saved history"
          aria-label="Clear Reel"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {history.map((item) => {
          const isActive = activeId === item.id;
          const style = ART_STYLES.find((s) => s.id === item.artStyle);

          return (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className={`group relative flex items-center gap-2 p-1 sm:p-1.5 rounded-xl border cursor-pointer shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-950/50 ring-1 ring-blue-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-700/60">
                <img
                  src={item.generatedImage}
                  alt="Variation thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="min-w-0 pr-6 sm:pr-8">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[85px] sm:max-w-[105px] font-cartoon">
                    {style?.name.split('/')[0] || item.artStyle}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[85px] sm:max-w-[105px]">
                  {item.pose.replace('-', ' ')}
                </div>
                <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-blue-400" />
                  {formatTime(item.timestamp, item.expiresAt)}
                </div>
              </div>

              {/* Action Buttons: Download & Delete */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleDownloadItem(item, e)}
                  className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                  title="Download this character"
                  aria-label="Download variation"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => onDeleteHistoryItem(item.id, e)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete this variation"
                  aria-label="Delete variation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
