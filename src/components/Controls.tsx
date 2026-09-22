import React from 'react';
import { Volume2, VolumeX, Printer, Download, RefreshCw, FilePlus, Trash2, X } from 'lucide-react';
import { LineSpacing, MarginSettings, TypingMode } from '../types';

interface ControlsProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode: TypingMode;
  onToggleMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  lineSpacing: LineSpacing;
  onChangeLineSpacing: (spacing: LineSpacing) => void;
  margins: MarginSettings;
  onChangeMargins: (margins: MarginSettings) => void;
  onNewSheet: () => void;
  onClear: () => void;
  onDownloadTxt: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isOpen = false,
  onClose,
  mode,
  onToggleMode,
  soundEnabled,
  onToggleSound,
  lineSpacing,
  onChangeLineSpacing,
  margins,
  onChangeMargins,
  onNewSheet,
  onClear,
  onDownloadTxt,
  onPrint,
  onReset,
}) => {
  return (
    <div
      id="typewriter-control-bar"
      className={`
        no-print fixed top-3 sm:top-4 left-3 sm:left-16 z-40
        w-[calc(100vw-24px)] max-w-[245px] sm:w-[250px] max-h-[calc(100vh-80px)] overflow-y-auto
        p-2.5 sm:p-3 rounded-2xl bg-[#18191C]/95 backdrop-blur-md
        border border-[#2B2D33] shadow-[0_16px_40px_rgba(0,0,0,0.85)]
        flex flex-col gap-2.5 text-xs font-courier text-[#C8C4B7]
        transition-all duration-300 ease-out select-none
        ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-[125%] opacity-0 pointer-events-none'}
      `}
    >
      {/* Panel Header with Title and Close Button */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#2B2D33]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span className="font-bold text-[#E4DEC9] tracking-wider text-[10px] sm:text-[11px]">
            TYPEWRITER OPTIONS
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#88857C] hover:text-white hover:bg-[#252830] transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mode & Sound Controls */}
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {/* Mode Toggle Button */}
        <button
          type="button"
          id="btn-toggle-mode"
          onClick={onToggleMode}
          title="Switch between Mechanical realism and Free editing"
          className={`
            px-1.5 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 w-full
            ${
              mode === 'mechanical'
                ? 'bg-[#2B2820] text-[#D8B365] border-[#8A713D]'
                : 'bg-[#1E2026] text-[#A5C4D4] border-[#3B4D5A]'
            }
          `}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          <span className="truncate">{mode === 'mechanical' ? 'MECH' : 'FREE'}</span>
        </button>

        {/* Sound Toggle Button */}
        <button
          type="button"
          id="btn-toggle-sound"
          onClick={onToggleSound}
          title={soundEnabled ? 'Disable mechanical sound' : 'Enable mechanical sound'}
          className={`
            px-1.5 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1 w-full
            ${
              soundEnabled
                ? 'bg-[#222428] text-[#E4DEC9] border-[#3E424D]'
                : 'bg-[#18191B] text-[#7A7872] border-[#2E3036]'
            }
          `}
        >
          {soundEnabled ? <Volume2 className="w-3 h-3 shrink-0" /> : <VolumeX className="w-3 h-3 shrink-0" />}
          <span className="truncate">{soundEnabled ? 'AUDIO' : 'MUTED'}</span>
        </button>
      </div>

      {/* Feed & Margin Controls */}
      <div className="flex items-center justify-between gap-1.5 w-full">
        {/* Line Spacing Selector */}
        <div className="flex items-center bg-[#141518] rounded-lg border border-[#2B2C32] px-1.5 py-1 text-[10px] flex-1 justify-between">
          <span className="text-[#88857C] font-bold">FEED:</span>
          <div className="flex items-center gap-0.5">
            {([1, 1.5, 2] as LineSpacing[]).map((spacing) => (
              <button
                key={`spacing-${spacing}`}
                type="button"
                id={`btn-spacing-${spacing}`}
                onClick={() => onChangeLineSpacing(spacing)}
                className={`
                  px-1 py-0.5 rounded cursor-pointer transition-colors
                  ${lineSpacing === spacing ? 'bg-[#2E3036] text-[#C5A059] font-bold' : 'text-[#88857C] hover:text-[#C8C4B7]'}
                `}
              >
                {spacing}x
              </button>
            ))}
          </div>
        </div>

        {/* Margin Controls */}
        <div className="flex items-center gap-0.5 bg-[#141518] rounded-lg border border-[#2B2C32] px-1.5 py-1 text-[10px]">
          <span className="text-[#88857C] font-bold">MAR:</span>
          <button
            type="button"
            title="Decrease left margin"
            onClick={() => onChangeMargins({ ...margins, left: Math.max(0, margins.left - 2) })}
            className="px-0.5 text-[#C8C4B7] hover:text-[#C5A059] cursor-pointer"
          >
            L-{margins.left}
          </button>
          <span className="text-[#555]">/</span>
          <button
            type="button"
            title="Increase right margin"
            onClick={() => onChangeMargins({ ...margins, right: Math.min(80, margins.right + 2) })}
            className="px-0.5 text-[#C8C4B7] hover:text-[#C5A059] cursor-pointer"
          >
            R-{margins.right}
          </button>
        </div>
      </div>

      {/* Document Actions */}
      <div className="w-full pt-1.5 border-t border-[#25272D]">
        {/* Reset Machine Button */}
        <button
          type="button"
          id="btn-reset-machine"
          onClick={() => {
            onReset();
            if (onClose) onClose();
          }}
          title="Reset typewriter machine to factory defaults"
          className="w-full py-1.5 rounded-lg bg-[#1A1B1E] hover:bg-[#26282E] border border-[#2B2D33] text-[#88857C] hover:text-[#C5A059] transition-all flex items-center justify-center gap-1.5 text-[10px] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>FACTORY RESET</span>
        </button>
      </div>
    </div>
  );
};
