import React, { useRef } from 'react';
import { KEYBOARD_ROWS } from '../data/keyboardLayout';
import { KeyDefinition, LineSpacing } from '../types';
import { Key } from './Key';

interface KeyboardProps {
  pressedKeys: Set<string>;
  isCapsLockActive: boolean;
  isShiftActive: boolean;
  isMarginReleased?: boolean;
  lineSpacing?: LineSpacing;
  onChangeLineSpacing?: (spacing: LineSpacing) => void;
  onKeyPress: (keyDef: KeyDefinition) => void;
  onMarginRelease?: () => void;
  onFeed?: (lines: 1 | 2 | 3) => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  pressedKeys,
  isCapsLockActive,
  isShiftActive,
  isMarginReleased = false,
  lineSpacing = 1,
  onChangeLineSpacing,
  onKeyPress,
  onMarginRelease,
  onFeed,
}) => {
  const isSpacePressed = pressedKeys.has('Space');
  const lastTouchTimeMR = useRef<number>(0);
  const lastTouchTimeSpace = useRef<number>(0);
  const lastTouchTimeFeed = useRef<number>(0);

  return (
    <div
      id="typewriter-keyboard-chassis"
      className="relative w-full max-w-2xl mx-auto p-1 sm:p-4 px-0.5 sm:px-4 rounded-b-xl sm:rounded-b-2xl bg-[#18191B] border-t-2 border-[#33343A] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_8px_20px_rgba(0,0,0,0.6)]"
    >
      {/* Subtle mechanical sloped tray reflection */}
      <div className="absolute inset-x-2 sm:inset-x-4 top-0 h-1 bg-white/5 rounded-t" />

      {/* 4 Standard Key Rows */}
      <div className="flex flex-col gap-0.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-[2px] sm:gap-1.5 px-0 sm:px-0.5 w-full"
          >
            {row.map((keyDef) => (
              <Key
                key={keyDef.code}
                keyDef={keyDef}
                isPressed={pressedKeys.has(keyDef.code)}
                isCapsLockActive={isCapsLockActive}
                isShiftActive={isShiftActive}
                onKeyPress={onKeyPress}
              />
            ))}
          </div>
        ))}

        {/* Row 5: Spacebar & Function utilities */}
        <div className="flex items-center justify-center gap-1 sm:gap-3 pt-1 px-0 sm:px-2 w-full">
          {/* Margin Release (MR) Key */}
          <button
            type="button"
            id="key-margin-release"
            title="Margin Release: allow typing past right margin"
            aria-label="Margin Release"
            onTouchStart={(e) => {
              e.preventDefault();
              lastTouchTimeMR.current = Date.now();
              if (onMarginRelease) onMarginRelease();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (Date.now() - lastTouchTimeMR.current < 450) return;
              if (onMarginRelease) onMarginRelease();
            }}
            onClick={(e) => e.preventDefault()}
            className={`
              typewriter-key h-8 sm:h-10 px-1.5 sm:px-3 rounded-sm min-[360px]:rounded-md sm:rounded-full text-[8px] sm:text-[11px] font-courier font-bold select-none cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1 transition-all touch-manipulation active:scale-[0.96] shrink-0
              ${
                isMarginReleased
                  ? 'border-[#E5B25D] bg-[#3D331D] text-[#FFD782] shadow-[0_0_8px_rgba(229,178,93,0.4)]'
                  : 'text-[#C5A059] border-[#8E8D88] hover:border-[#D3A762]'
              }
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isMarginReleased ? 'bg-[#FFD782] animate-pulse' : 'bg-[#C5A059]/40'}`} />
            <span className="whitespace-nowrap">MAR REL</span>
          </button>

          {/* Long Physical Space Bar */}
          <button
            type="button"
            id="key-spacebar"
            aria-label="Space Bar"
            onTouchStart={(e) => {
              e.preventDefault();
              lastTouchTimeSpace.current = Date.now();
              onKeyPress({ code: 'Space', char: ' ', display: 'SPACE', isAction: true });
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (Date.now() - lastTouchTimeSpace.current < 450) return;
              onKeyPress({ code: 'Space', char: ' ', display: 'SPACE', isAction: true });
            }}
            onClick={(e) => e.preventDefault()}
            className={`
              typewriter-space-bar
              relative flex-1 min-w-[60px] max-w-sm sm:max-w-md h-8 sm:h-10
              rounded-sm min-[360px]:rounded-md select-none cursor-pointer touch-manipulation active:scale-[0.98]
              flex items-center justify-center
              text-[#A5A095] text-[9px] sm:text-xs font-courier tracking-widest font-semibold
              ${isSpacePressed ? 'pressed' : ''}
            `}
          >
            <span className="opacity-40">SPACE</span>
          </button>

          {/* Functional FEED 1x 1.5x 2x Line Spacing Regulator */}
          <div
            id="control-keyboard-feed"
            title="Line Space Regulator: FEED 1x, 1.5x, 2x"
            className="flex items-center h-8 sm:h-9 px-1 sm:px-2.5 rounded-sm min-[360px]:rounded-md sm:rounded-full bg-[#111214] border border-[#2E3036] text-[10px] font-courier text-[#969185] gap-0.5 sm:gap-1 select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] shrink-0"
          >
            <span className="text-[7.5px] sm:text-[10px] uppercase tracking-wider text-[#A5A095] font-bold mr-0.5 hidden min-[400px]:inline sm:inline">
              FEED
            </span>
            {([1, 1.5, 2] as const).map((spacingVal) => {
              const label = `${spacingVal}x`;
              const isSelected = lineSpacing === spacingVal;
              return (
                <button
                  key={`feed-spacing-${spacingVal}`}
                  type="button"
                  id={`btn-feed-spacing-${spacingVal}`}
                  aria-label={`Feed line spacing ${label}`}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    lastTouchTimeFeed.current = Date.now();
                    if (onChangeLineSpacing) {
                      onChangeLineSpacing(spacingVal);
                    } else if (onFeed) {
                      onFeed(spacingVal === 1.5 ? 2 : (spacingVal as 1 | 2));
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (Date.now() - lastTouchTimeFeed.current < 450) return;
                    if (onChangeLineSpacing) {
                      onChangeLineSpacing(spacingVal);
                    } else if (onFeed) {
                      onFeed(spacingVal === 1.5 ? 2 : (spacingVal as 1 | 2));
                    }
                  }}
                  onClick={(e) => e.preventDefault()}
                  className={`
                    min-w-[18px] min-[360px]:min-w-[22px] sm:min-w-[28px] h-6 sm:h-6 px-0.5 sm:px-1.5 rounded-sm min-[360px]:rounded-md sm:rounded-full
                    flex items-center justify-center text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold
                    cursor-pointer transition-all duration-150 border touch-manipulation
                    ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#D8B365] to-[#B38D40] text-[#111214] border-[#E8C87A] shadow-[0_0_6px_rgba(216,179,101,0.5)]'
                        : 'bg-[#1F2024] hover:bg-[#2F3138] text-[#B0ABA0] hover:text-[#E4DEC9] border-[#3E4048]'
                    }
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

