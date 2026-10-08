import React, { useState, useRef } from 'react';
import { audioHaptics } from '../utils/audioHaptics';
import { MousePointer, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface MagicTouchpadProps {
  onTap: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onCursorMove?: (x: number, y: number) => void;
}

export const MagicTouchpad: React.FC<MagicTouchpadProps> = ({
  onTap,
  onSwipeUp,
  onSwipeDown,
  onCursorMove,
}) => {
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const startY = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTouchPos({ x, y });
    startY.current = e.clientY;
    audioHaptics.triggerHaptic('light');
    if (onCursorMove) onCursorMove(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setTouchPos({ x, y });
    if (onCursorMove) onCursorMove(x, y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current !== null) {
      const deltaY = e.clientY - startY.current;
      if (deltaY < -40) {
        // Swiped up
        audioHaptics.playBeep();
        audioHaptics.triggerHaptic('medium');
        onSwipeUp();
      } else if (deltaY > 40) {
        // Swiped down
        audioHaptics.playBeep();
        audioHaptics.triggerHaptic('medium');
        onSwipeDown();
      } else {
        // Tap
        audioHaptics.playClick();
        audioHaptics.triggerHaptic('medium');
        onTap();
      }
    }
    startY.current = null;
    setTouchPos(null);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      <div className="text-[10px] text-neutral-400 font-semibold mb-1 flex items-center gap-1.5">
        <MousePointer className="w-3.5 h-3.5 text-red-400" />
        <span>Magic Trackpad (Swipe & Tap Anywhere)</span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-700/80 shadow-inner overflow-hidden cursor-crosshair touch-none flex items-center justify-center"
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Dynamic touch ripple follower */}
        {touchPos && (
          <div
            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-red-500/40 border border-red-300 shadow-[0_0_16px_#ef4444] pointer-events-none transition-transform"
            style={{ left: `${touchPos.x}%`, top: `${touchPos.y}%` }}
          />
        )}

        <div className="text-center pointer-events-none space-y-1">
          <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-neutral-300 block">
            Drag to Move Cursor • Tap for OK
          </span>
          <span className="text-[10px] text-neutral-500 block">
            Swipe Up / Down for Volume Rocker
          </span>
        </div>
      </div>
    </div>
  );
};
