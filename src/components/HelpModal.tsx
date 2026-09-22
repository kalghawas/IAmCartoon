import React from 'react';
import { X, HelpCircle, Check, Smartphone, Video, Sparkles, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">ChatAnimate Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-zinc-300 leading-relaxed max-h-[80vh] overflow-y-auto">
          <div>
            <h4 className="font-semibold text-zinc-100 text-sm mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              1. Transcript Format
            </h4>
            <p className="text-zinc-400">
              Simply paste dialogues with prefixes. By default, <code className="text-emerald-400 bg-zinc-950 px-1 py-0.5 rounded">Me:</code> is Person A (Sent bubble on the right) and <code className="text-cyan-400 bg-zinc-950 px-1 py-0.5 rounded">Alex:</code> is Person B (Received bubble on the left).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Authentic WhatsApp Details
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li><strong className="text-zinc-200">Typing Indicator:</strong> 3-dot bouncing bubble in chat and &quot;typing...&quot; in header when Contact prepares a reply.</li>
              <li><strong className="text-zinc-200">Draft Preview:</strong> When Person A types, text appears live in the bottom message bar with the mic transforming into the green send plane.</li>
              <li><strong className="text-zinc-200">Emoji Scaling:</strong> Standalone emojis (❤️, 😂, 🚀) render huge without background bubbles, just like genuine WhatsApp!</li>
              <li><strong className="text-zinc-200">Read Receipts:</strong> Double checkmarks transition from gray to WhatsApp blue (<code className="text-sky-400">#53bdeb</code>).</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 text-sm mb-1 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-teal-400" />
              3. 100% Client-Side 60 FPS Export
            </h4>
            <p className="text-zinc-400">
              Click <strong className="text-emerald-400">&quot;Record & Export Video&quot;</strong> to render the WhatsApp animation directly in your browser using HTML5 Canvas <code className="text-zinc-300">captureStream(60)</code> and the MediaRecorder API at full 1080×1920 (9:16 vertical ratio). Zero server latency or external fees.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
