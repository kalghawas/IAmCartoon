import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Gauge,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimationSettings, AppThemeMode } from '../types';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  currentTimeMs: number;
  totalDurationMs: number;
  onSeek: (timeMs: number) => void;
  animSettings: AnimationSettings;
  onChangeAnimSettings: (settings: AnimationSettings) => void;
  activeMessageIndex: number;
  totalMessages: number;
  appThemeMode?: AppThemeMode;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  currentTimeMs,
  totalDurationMs,
  onSeek,
  animSettings,
  onChangeAnimSettings,
  activeMessageIndex,
  totalMessages,
  appThemeMode = 'dark',
}) => {
  const isDark = appThemeMode === 'dark';

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSoundOn = Boolean(animSettings.soundEffectsEnabled);

  return (
    <div
      id="playback-controls-bar"
      className={`w-full max-w-[430px] border rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-md transition-colors ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}
    >
      {/* Top row: Play/Pause/Reset + Time + Message Step + Speed Controls + Sound Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Play / Pause button */}
          <button
            id="btn-play-pause"
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center justify-center w-9 h-9 rounded-xl text-white font-medium shadow-md transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
            }`}
            title={isPlaying ? 'Pause Animation (Space)' : 'Play Animation (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Reset / Rewind button */}
          <button
            id="btn-reset"
            type="button"
            onClick={onReset}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border-zinc-700/80'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border-zinc-300'
            }`}
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Loop toggle */}
          <button
            id="btn-toggle-loop"
            type="button"
            onClick={() =>
              onChangeAnimSettings({
                ...animSettings,
                loop: !animSettings.loop,
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              animSettings.loop
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : isDark
                ? 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-900'
            }`}
            title="Loop animation continuously"
          >
            <Repeat className="w-3 h-3" />
            <span className="text-[11px]">Loop</span>
          </button>

          {/* 1-Click Audio Sound FX Toggle */}
          <button
            id="btn-toggle-sound-fx"
            type="button"
            onClick={() =>
              onChangeAnimSettings({
                ...animSettings,
                soundEffectsEnabled: !isSoundOn,
              })
            }
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isSoundOn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : isDark
                ? 'bg-zinc-800/80 border-zinc-700/80 text-zinc-500 hover:text-zinc-300'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400 hover:text-zinc-700'
            }`}
            title={isSoundOn ? 'WhatsApp Sound Effects: ON (Click to Mute)' : 'WhatsApp Sound Effects: MUTED (Click to Enable)'}
          >
            {isSoundOn ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Center: Timeline numbers & message counter */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1 font-mono px-2 py-1 rounded-lg border text-[11px] ${
              isDark
                ? 'text-zinc-300 bg-zinc-950 border-zinc-800'
                : 'text-zinc-700 bg-zinc-100 border-zinc-300'
            }`}
          >
            <span className="text-emerald-500 font-bold">{formatTime(currentTimeMs)}</span>
            <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>/</span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
              {formatTime(totalDurationMs)}
            </span>
          </div>

          <span
            className={`px-2 py-1 rounded text-[10.5px] font-semibold border ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600'
            }`}
          >
            {totalMessages > 0
              ? activeMessageIndex >= 0
                ? `${activeMessageIndex + 1}/${totalMessages}`
                : 'Done'
              : '0'}
          </span>
        </div>

        {/* Speed Controls: 1x, 1.5x, 2x */}
        <div
          className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
          }`}
        >
          <Gauge className="w-3 h-3 text-zinc-400 ml-1 mr-0.5" />
          {[1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() =>
                onChangeAnimSettings({
                  ...animSettings,
                  speedMultiplier: speed,
                })
              }
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                animSettings.speedMultiplier === speed
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="relative flex items-center group pt-0.5">
        <input
          id="range-timeline-scrub"
          type="range"
          min="0"
          max={totalDurationMs || 100}
          value={currentTimeMs}
          onChange={(e) => onSeek(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
            isDark ? 'bg-zinc-950' : 'bg-zinc-200'
          }`}
        />
      </div>
    </div>
  );
};
