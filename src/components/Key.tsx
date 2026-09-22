import React, { useRef } from 'react';
import { KeyDefinition } from '../types';

interface KeyProps {
  keyDef: KeyDefinition;
  isPressed: boolean;
  isCapsLockActive?: boolean;
  isShiftActive?: boolean;
  onKeyPress: (keyDef: KeyDefinition) => void;
}

export const Key: React.FC<KeyProps> = ({
  keyDef,
  isPressed,
  isCapsLockActive = false,
  isShiftActive = false,
  onKeyPress,
}) => {
  const lastTouchTimeRef = useRef<number>(0);
  const isCaps = keyDef.code === 'CapsLock';
  const isShift = keyDef.code === 'ShiftLeft' || keyDef.code === 'ShiftRight';

  // Determine what label to show
  let primaryLabel = keyDef.display || keyDef.char || '';
  const secondaryLabel = keyDef.shiftDisplay || keyDef.shiftChar || '';

  // If caps lock or shift is active for letters
  if (keyDef.char && keyDef.shiftChar && !keyDef.shiftDisplay) {
    const isUpper = (isShiftActive && !isCapsLockActive) || (!isShiftActive && isCapsLockActive);
    primaryLabel = isUpper ? keyDef.shiftChar : keyDef.char;
  }

  const isHighlighted = (isCaps && isCapsLockActive) || (isShift && isShiftActive);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    lastTouchTimeRef.current = Date.now();
    onKeyPress(keyDef);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    // In mobile browsers, touchstart is often followed by a synthetic mousedown within 300ms.
    // Guard against duplicate typing (e.g. typing 'N' becoming 'NN').
    if (Date.now() - lastTouchTimeRef.current < 450) {
      return;
    }
    onKeyPress(keyDef);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <button
      type="button"
      id={`key-${keyDef.code}`}
      aria-label={keyDef.display || keyDef.char || keyDef.code}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`
        typewriter-key
        relative flex flex-col items-center justify-center
        h-8.5 min-[360px]:h-9 sm:h-10 md:h-11
        ${keyDef.width ? `${keyDef.width} shrink-0` : 'flex-1 min-w-0 sm:min-w-[32px]'}
        rounded-sm min-[360px]:rounded-md sm:rounded-full select-none cursor-pointer
        touch-manipulation active:scale-[0.95]
        text-[#E4DEC9] font-courier font-bold
        ${isPressed ? 'pressed' : ''}
        ${isHighlighted ? 'border-[#C5A059] bg-[#3B3830]' : ''}
      `}
    >
      {/* Top chrome rim reflection */}
      <span className="absolute inset-[1px] sm:inset-[1.5px] rounded-[3px] min-[360px]:rounded-[5px] sm:rounded-full border border-white/15 pointer-events-none" />

      {/* Center key label */}
      <div className="flex flex-col items-center justify-center leading-none text-center pointer-events-none px-0 w-full overflow-hidden">
        {secondaryLabel && (
          <span className="text-[7px] sm:text-[10px] text-[#A8A495] font-semibold leading-none">
            {secondaryLabel}
          </span>
        )}
        <span
          className={`
            ${secondaryLabel ? 'text-[8px] min-[360px]:text-[9.5px] sm:text-[12px]' : 'text-[9.5px] min-[360px]:text-[11px] sm:text-[14px]'}
            ${keyDef.isAction ? 'text-[6.5px] min-[360px]:text-[8px] sm:text-[10px] tracking-tighter sm:tracking-wider text-[#C5A059]' : ''}
          `}
        >
          {primaryLabel}
        </span>
      </div>

      {/* Active CapsLock / Modifier small LED pip */}
      {isCaps && isCapsLockActive && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#E5B25D] shadow-[0_0_6px_#E5B25D]" />
      )}
    </button>
  );
};
