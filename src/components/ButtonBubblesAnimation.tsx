import React from 'react';

export const ButtonBubblesAnimation: React.FC = () => {
  return (
    <div
      className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center z-20"
      aria-hidden="true"
    >
      <div className="relative w-28 h-12 flex items-center justify-center">
        {/* Floating Bubble 1 (Center Green) */}
        <div className="absolute animate-bounce [animation-duration:600ms] bottom-1 left-7 w-5 h-5 rounded-full bg-emerald-500/90 shadow-[0_0_12px_rgba(16,185,129,0.7)] flex items-center justify-center border border-emerald-300/60">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 -translate-x-0.5 -translate-y-0.5" />
        </div>

        {/* Floating Bubble 2 (Left Teal) */}
        <div className="absolute animate-bounce [animation-duration:750ms] [animation-delay:150ms] bottom-2 left-2 w-3.5 h-3.5 rounded-full bg-teal-400/90 shadow-[0_0_8px_rgba(45,212,191,0.6)] flex items-center justify-center border border-teal-200/50">
          <div className="w-1 h-1 rounded-full bg-white/80 -translate-x-0.5 -translate-y-0.5" />
        </div>

        {/* Floating Bubble 3 (Right Emerald) */}
        <div className="absolute animate-bounce [animation-duration:700ms] [animation-delay:100ms] bottom-1.5 right-6 w-4 h-4 rounded-full bg-[#25D366]/90 shadow-[0_0_10px_rgba(37,211,102,0.6)] flex items-center justify-center border border-emerald-200/60">
          <div className="w-1 h-1 rounded-full bg-white/80 -translate-x-0.5 -translate-y-0.5" />
        </div>

        {/* Floating Bubble 4 (Far Right Mini) */}
        <div className="absolute animate-bounce [animation-duration:850ms] [animation-delay:250ms] bottom-3 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400/90 shadow-[0_0_6px_rgba(34,211,238,0.5)] border border-cyan-100/50" />

        {/* Mini rising sparkle dots */}
        <div className="absolute animate-ping [animation-duration:900ms] top-1 left-10 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-75" />
        <div className="absolute animate-ping [animation-duration:800ms] [animation-delay:200ms] top-2 right-9 w-1.5 h-1.5 rounded-full bg-teal-200 opacity-75" />
      </div>
    </div>
  );
};
