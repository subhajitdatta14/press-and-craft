import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { TypingMode } from '../types';

interface StatusBarProps {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  mode: TypingMode;
  soundEnabled: boolean;
  rightMargin: number;
  isMarginReleased?: boolean;
  isBellRinging?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  lines,
  cursorRow,
  cursorCol,
  mode,
  soundEnabled,
  rightMargin,
  isMarginReleased = false,
  isBellRinging = false,
}) => {
  // Compute total characters and words
  const fullText = lines.join('\n');
  const characterCount = lines.reduce((acc, line) => acc + line.length, 0);
  const words = fullText.trim() ? fullText.trim().split(/\s+/).filter(Boolean).length : 0;

  // Margin proximity status
  const isNearMargin = cursorCol >= rightMargin - 5 && cursorCol < rightMargin;
  const isAtMargin = cursorCol >= rightMargin;

  let bellLabel = 'BELL ARMED';
  if (isMarginReleased) {
    bellLabel = 'MAR REL';
  } else if (isAtMargin) {
    bellLabel = 'MAR STOP';
  } else if (isNearMargin) {
    bellLabel = 'BELL ZONE';
  }

  return (
    <footer
      id="typewriter-status-bar"
      className="no-print w-full max-w-4xl md:max-w-none mx-auto mt-2 md:mt-0 px-3.5 py-2.5 rounded-lg bg-[#141517] border border-[#232428] flex flex-wrap md:flex-col items-center md:items-stretch justify-between gap-2 text-[11px] font-courier text-[#8D8A7E] md:col-start-1 md:row-start-2 md:self-start"
    >
      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-1.5 w-full">
        <div className="flex items-center justify-between bg-[#191A1D] px-2 py-1 rounded border border-[#25262B]">
          <span className="text-[#5E5B53]">WORDS:</span>
          <span className="text-[#D8D4C7] font-semibold">{words}</span>
        </div>
        <div className="flex items-center justify-between bg-[#191A1D] px-2 py-1 rounded border border-[#25262B]">
          <span className="text-[#5E5B53]">CHARS:</span>
          <span className="text-[#D8D4C7] font-semibold">{characterCount}</span>
        </div>
        <div className="flex items-center justify-between bg-[#191A1D] px-2 py-1 rounded border border-[#25262B]">
          <span className="text-[#5E5B53]">LINE:</span>
          <span className="text-[#D8D4C7] font-semibold">{cursorRow + 1}</span>
        </div>
        <div className="flex items-center justify-between bg-[#191A1D] px-2 py-1 rounded border border-[#25262B]">
          <span className="text-[#5E5B53]">COL:</span>
          <span className="text-[#D8D4C7] font-semibold">{cursorCol}</span>
        </div>
      </div>

      {/* Margin Bell Warning & Engine status */}
      <div className="flex items-center justify-between w-full pt-1.5 border-t border-[#232428] text-[10px]">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${
            isMarginReleased
              ? 'bg-[#3D331D] text-[#FFD782] font-bold border border-[#E5B25D]/50'
              : isAtMargin
                ? 'bg-[#4A151B] text-[#FF858D] font-bold animate-pulse border border-[#E63946]/40'
                : isNearMargin
                  ? 'bg-[#3B3012] text-[#F3C769]'
                  : 'text-[#5E5B53]'
          }`}
        >
          {soundEnabled ? (
            <Bell
              className={`w-3 h-3 transition-transform ${
                isBellRinging
                  ? 'scale-125 text-[#FFD782] rotate-12'
                  : isAtMargin
                    ? 'text-[#FF858D]'
                    : isNearMargin
                      ? 'text-[#F3C769]'
                      : ''
              }`}
            />
          ) : (
            <BellOff className="w-3 h-3 opacity-50" />
          )}
          <span>{bellLabel}</span>
        </div>

        <span className="text-[9px] uppercase tracking-wider text-[#5E5B53]">
          {mode === 'mechanical' ? 'HARD ESC' : 'FREE CARET'}
        </span>
      </div>
    </footer>
  );
};
