import React, { useRef, useState, useEffect } from 'react';
import { KeyDefinition, LineSpacing, MarginSettings, TypingMode } from '../types';
import { Paper } from './Paper';
import { Keyboard } from './Keyboard';
import { CarriageReturnLever } from './CarriageReturnLever';

interface TypewriterMachineProps {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  margins: MarginSettings;
  lineSpacing: LineSpacing;
  onChangeLineSpacing?: (spacing: LineSpacing) => void;
  mode: TypingMode;
  title: string;
  onTitleChange: (title: string) => void;
  pressedKeys: Set<string>;
  isCapsLockActive: boolean;
  isShiftActive: boolean;
  isMarginReleased?: boolean;
  isHammerStriking?: boolean;
  isFeeding?: boolean;
  isTearing?: boolean;
  isInsertingSheet?: boolean;
  isPageComplete?: boolean;
  pageNumber?: number;
  a4MaxLines?: number;
  developerCredits?: string | null;
  onKeyPress: (keyDef: KeyDefinition) => void;
  onCarriageReturn: () => void;
  onMarginRelease: () => void;
  onFeed?: (lines: 1 | 2 | 3) => void;
  onPaperClick: (row: number, col: number) => void;
  onTearPaper?: () => void;
  onInsertNewSheet?: () => void;
  isCarriageReturning: boolean;
}

export const TypewriterMachine: React.FC<TypewriterMachineProps> = ({
  lines,
  cursorRow,
  cursorCol,
  margins,
  lineSpacing,
  onChangeLineSpacing,
  mode,
  title,
  onTitleChange,
  pressedKeys,
  isCapsLockActive,
  isShiftActive,
  isMarginReleased = false,
  isHammerStriking = false,
  isFeeding = false,
  isTearing = false,
  isInsertingSheet = false,
  isPageComplete = false,
  pageNumber = 1,
  a4MaxLines = 25,
  developerCredits = null,
  onKeyPress,
  onCarriageReturn,
  onMarginRelease,
  onFeed,
  onPaperClick,
  onTearPaper,
  onInsertNewSheet,
  isCarriageReturning,
}) => {
  const lastTouchInsertRef = useRef<number>(0);
  const lastTouchTearRef = useRef<number>(0);

  // Compute carriage mechanical horizontal translation
  // The carriage shifts subtly to the left as typing progresses, bringing the character point into center alignment
  const relativeCol = cursorCol - margins.left;
  // Subtle shift capped to maintain framing across mobile, tablet, and desktop
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const shiftFactor = isMobileScreen ? 0.9 : 2.2;
  const minShift = isMobileScreen ? -45 : -120;
  const maxShift = isMobileScreen ? 25 : 60;
  const carriageShiftPx = isCarriageReturning
    ? 0
    : Math.max(minShift, Math.min(maxShift, -(relativeCol * shiftFactor)));

  // Platen reference to compute exact distance to top of viewport for paper edge alignment
  const platenRef = useRef<HTMLDivElement>(null);
  const [platenTopDist, setPlatenTopDist] = useState<number>(420);

  useEffect(() => {
    const updatePlatenDist = () => {
      if (platenRef.current) {
        const rect = platenRef.current.getBoundingClientRect();
        // Distance from viewport top to platen center line
        const dist = Math.max(260, Math.round(rect.top + 32));
        setPlatenTopDist(dist);
      }
    };
    updatePlatenDist();
    window.addEventListener('resize', updatePlatenDist);
    return () => window.removeEventListener('resize', updatePlatenDist);
  }, []);

  // Live words count and current line for the chassis display above keypad
  const fullText = lines.join('\n');
  const wordsCount = fullText.trim() ? fullText.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentLine = cursorRow + 1;

  return (
    <div
      id="typewriter-machine-hero"
      className="relative w-full max-w-4xl mx-auto mb-2 sm:mb-4 mt-0 flex flex-col items-center select-none"
    >
      {/* ========================================================
          1. CARRIAGE ASSEMBLY (Top Section with Platen & Paper)
          ======================================================== */}
      <div className="relative w-full overflow-visible pt-0 pb-1">
        {/* Carriage Slider Group that moves with typing */}
        <div
          id="carriage-sliding-assembly"
          className={`
            relative w-full flex flex-col items-center
            transition-transform ease-out
            ${isCarriageReturning ? 'duration-300' : 'duration-75'}
          `}
          style={{
            transform: `translateX(${carriageShiftPx}px)`,
          }}
        >
          {/* Top Carriage Margin Ruler & Stops */}
          <div className="w-[96%] sm:w-[90%] flex items-center justify-between px-2 sm:px-3 py-0.5 bg-[#232428] border-x border-t border-[#40424A] rounded-t text-[8px] sm:text-[9px] font-courier text-[#8E9099]">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="hidden min-[360px]:inline">MAR STOP L:</span>
              <span className="inline min-[360px]:hidden">L:</span>
              <span>{margins.left}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 px-1 text-center">
              <span className="hidden sm:inline text-[8px] tracking-widest uppercase opacity-70 whitespace-nowrap">
                CARRIAGE ESCAPEMENT [COL {cursorCol}]
              </span>
              <span className="inline sm:hidden text-[7.5px] tracking-wider uppercase opacity-70 whitespace-nowrap">
                COL {cursorCol}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="hidden min-[360px]:inline">MAR STOP R:</span>
              <span className="inline min-[360px]:hidden">R:</span>
              <span>{margins.right}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  cursorCol >= margins.right
                    ? isMarginReleased
                      ? 'bg-[#FFD782]'
                      : 'bg-[#E63946] animate-ping'
                    : cursorCol >= margins.right - 5
                      ? 'bg-[#E5B25D]'
                      : 'bg-[#767880]'
                }`}
              />
            </div>
          </div>

          {/* Platen Roller Assembly with Left/Right Turning Knobs */}
          <div className="relative w-full max-w-3xl flex items-center justify-center px-1 sm:px-0">
            {/* Left Platen Knob & Carriage Return Lever Mount */}
            <div className="absolute -left-1.5 sm:-left-6 top-1/2 -translate-y-1/2 z-30 flex items-center">
              <div className="relative mr-0.5 sm:mr-1">
                <CarriageReturnLever
                  onReturn={onCarriageReturn}
                  isCarriageReturning={isCarriageReturning}
                />
              </div>
              {/* Left Platen Turning Knob */}
              <div
                id="platen-knob-left"
                title="Platen Roller Knob"
                className={`
                  w-4 sm:w-8 h-10 sm:h-16 rounded-l-sm sm:rounded-l-md bg-gradient-to-r from-[#18191B] via-[#35373E] to-[#1F2024] border border-[#525560] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center
                  transition-transform duration-200
                  ${isFeeding || isCarriageReturning ? '-rotate-45' : 'rotate-0'}
                `}
              >
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                </div>
              </div>
            </div>

            {/* Platen Roller Cylinder (Black Rubber Cylinder behind paper) */}
            <div
              ref={platenRef}
              className="relative w-[86%] min-[400px]:w-[88%] h-12 sm:h-18 platen-roller rounded-md flex items-center justify-center border-y border-[#3E4049]"
            >
              {/* Paper passing through the platen slot */}
              <div className="w-full z-10 flex flex-col items-center">
                <Paper
                  lines={lines}
                  cursorRow={cursorRow}
                  cursorCol={cursorCol}
                  margins={margins}
                  lineSpacing={lineSpacing}
                  mode={mode}
                  title={title}
                  onTitleChange={onTitleChange}
                  onPaperClick={onPaperClick}
                  isCarriageReturning={isCarriageReturning}
                  isFeeding={isFeeding}
                  isTearing={isTearing}
                  isInsertingSheet={isInsertingSheet}
                  pageNumber={pageNumber}
                  platenDistanceToTop={platenTopDist}
                />
              </div>

              {/* Paper Bail Bar (Metal rod holding paper against the roller) */}
              <div className="absolute bottom-1.5 sm:bottom-2 left-2 sm:left-4 right-2 sm:right-4 h-1 sm:h-1.5 bg-gradient-to-r from-[#7D7F87] via-[#D0D2D9] to-[#7D7F87] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 flex items-center justify-around pointer-events-none">
                {/* Rubber paper pressure rollers */}
                <div className="w-3 sm:w-4 h-2.5 sm:h-3 bg-[#111214] border border-[#45474F] rounded-xs shadow-sm" />
                <div className="w-3 sm:w-4 h-2.5 sm:h-3 bg-[#111214] border border-[#45474F] rounded-xs shadow-sm" />
                <div className="w-3 sm:w-4 h-2.5 sm:h-3 bg-[#111214] border border-[#45474F] rounded-xs shadow-sm" />
              </div>
            </div>

            {/* Right Platen Knob */}
            <div className="absolute -right-1.5 sm:-right-6 top-1/2 -translate-y-1/2 z-30 flex items-center">
              <div
                id="platen-knob-right"
                title="Platen Roller Knob"
                className={`
                  w-4 sm:w-8 h-10 sm:h-16 rounded-r-sm sm:rounded-r-md bg-gradient-to-l from-[#18191B] via-[#35373E] to-[#1F2024] border border-[#525560] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center
                  transition-transform duration-200
                  ${isFeeding || isCarriageReturning ? '-rotate-45' : 'rotate-0'}
                `}
              >
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                  <span className="w-2 sm:w-4 h-[1px] bg-[#676B78]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TYPE GUIDE & RIBBON VIBRATOR DECK (Stationary Center)
          ======================================================== */}
      <div className="relative w-full max-w-2xl -mt-6 z-20 flex flex-col items-center">
        {/* Steel Type Guide Fork (where typebars strike the ink ribbon) */}
        <div className="type-guide relative px-4 py-1.5 rounded-t-lg flex items-center gap-3">
          {/* Animated Type Hammer Slug Head */}
          <div
            id="typewriter-typebar-hammer"
            aria-hidden="true"
            className={`
              absolute left-1/2 -translate-x-1/2 bottom-0 w-2.5 h-6 pointer-events-none z-30
              transition-transform duration-75 ease-out
              ${isHammerStriking ? '-translate-y-4 opacity-100' : 'translate-y-3 opacity-0'}
            `}
          >
            <div className="w-full h-full bg-gradient-to-t from-[#3E4048] via-[#858893] to-[#D5D7E0] rounded-t-xs border border-[#A6A8B0] shadow-sm flex flex-col items-center">
              <div className="w-1.5 h-1 bg-[#C5A059] mt-0.5 rounded-xs" />
            </div>
          </div>

          {/* Left ribbon spool guide */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#18191B] border border-[#444]" />
            <span className="w-6 h-1 bg-[#1A1917] rounded-full" />
          </div>

          {/* Center alignment notch */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-2 bg-[#E4DEC9]/20 clip-polygon" />
            <div className="w-1 h-3 bg-[#C5A059] rounded-full shadow-[0_0_4px_#C5A059]" />
          </div>

          {/* Right ribbon spool guide (showing red/black twin ribbon) */}
          <div className="flex items-center gap-1">
            <span className="w-6 h-1 bg-[#8B2635] rounded-full" />
            <span className="w-2 h-2 rounded-full bg-[#18191B] border border-[#444]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MACHINE BODY & NAMEPLATE CHASSIS
          ======================================================== */}
      <div className="relative w-full max-w-3xl chassis-finish rounded-xl sm:rounded-2xl p-1 sm:p-5 px-1 sm:px-5 pt-3 sm:pt-4 border-2 border-[#2B2C32] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Vintage Embossed Nameplate Badge */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1 sm:px-6">
          {/* Left chrome screw head */}
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#52545C] border border-[#8C8F99] shadow-inner flex items-center justify-center">
            <span className="w-1.5 sm:w-2 h-[1px] bg-[#222] rotate-45" />
          </div>

          {/* Center Brand Nameplate */}
          <div className="nameplate-badge px-2.5 sm:px-5 py-0.5 sm:py-1.5 rounded-sm flex flex-col items-center justify-center shadow-md">
            <h1 className="font-brand font-black text-[10px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.22em] text-[#18150F] uppercase leading-none whitespace-nowrap [text-shadow:_0_-1px_1px_rgba(0,0,0,0.85),_0_1px_0_rgba(255,248,220,0.5)]">
              E. Remington & Sons
            </h1>
            <span className="text-[7.5px] sm:text-[10px] font-brand font-black tracking-[0.28em] sm:tracking-[0.32em] text-[#18150F] uppercase leading-tight mt-0.5 [text-shadow:_0_-1px_1px_rgba(0,0,0,0.85),_0_1px_0_rgba(255,248,220,0.45)]">
              EST. 1874
            </span>
          </div>

          {/* Right chrome screw head */}
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#52545C] border border-[#8C8F99] shadow-inner flex items-center justify-center">
            <span className="w-1.5 sm:w-2 h-[1px] bg-[#222] -rotate-45" />
          </div>
        </div>

        {/* Sloped Ribbon Deck & Typebar Basket Visual Indicator */}
        <div className="w-full h-3.5 sm:h-5 bg-gradient-to-b from-[#111214] to-[#1C1D21] rounded-t-md mb-2 border-t border-[#31333A] flex items-center justify-center">
          <div className="flex gap-1 sm:gap-1.5 opacity-30">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={`typebar-${i}`} className="w-[1.5px] h-2.5 sm:h-3 bg-[#A8A9B2]" />
            ))}
          </div>
        </div>

        {/* ========================================================
            4. SMALL DISPLAY (Live Word Count & Line Count Above Keypad)
               With Dark Orange Tear Paper Button positioned on the right side
            ======================================================== */}
        <div className="relative w-full flex items-center justify-center mb-1.5 sm:mb-2.5 px-0.5 sm:px-6">
          {/* Green Insert New Sheet Button (Left side, only 'INSERT' text) */}
          {onInsertNewSheet && (
            <button
              type="button"
              id="btn-insert-paper-counter"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (Date.now() - lastTouchInsertRef.current < 450) return;
                onInsertNewSheet();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                lastTouchInsertRef.current = Date.now();
                onInsertNewSheet();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isTearing || isInsertingSheet}
              title="Insert new sheet"
              className={`
                absolute left-0.5 sm:left-6 top-1/2 -translate-y-1/2
                px-1 min-[360px]:px-1.5 sm:px-2.5 h-5.5 sm:h-7 rounded-sm sm:rounded-md
                bg-gradient-to-b from-[#2E7D32] via-[#1B5E20] to-[#0D3813]
                hover:from-[#388E3C] hover:to-[#1B5E20]
                active:from-[#1B5E20] active:to-[#0B2E10] active:scale-95
                border border-[#0B2E10] sm:border-2
                shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)]
                active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]
                transition-all duration-150 cursor-pointer select-none touch-manipulation
                flex items-center justify-center
                ${isTearing || isInsertingSheet ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="font-courier font-bold text-[7.5px] min-[360px]:text-[8.5px] sm:text-[10px] text-white tracking-wider uppercase">
                INSERT
              </span>
            </button>
          )}

          <div
            id="typewriter-keypad-counter-display"
            className={`
              relative overflow-hidden flex items-center justify-center gap-1 sm:gap-3 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded border select-none transition-all duration-200
              ${developerCredits
                ? 'bg-[#09120C] border-[#22442B] shadow-[inset_0_2px_8px_rgba(0,0,0,0.95),0_0_10px_rgba(86,168,110,0.25)] max-w-[calc(100%-80px)] min-[360px]:max-w-[calc(100%-100px)] sm:max-w-none'
                : isPageComplete
                ? 'bg-[#180808] border-[#3D1414] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_8px_rgba(184,64,64,0.3)] cursor-pointer hover:bg-[#200A0A]'
                : 'bg-[#09120C] border-[#18261C] shadow-[inset_0_2px_8px_rgba(0,0,0,0.95),inset_0_0_12px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.06)]'
              }
              text-[8.5px] min-[360px]:text-[9.5px] sm:text-[11px] font-courier
            `}
            onClick={() => {
              if (isPageComplete && onInsertNewSheet) {
                onInsertNewSheet();
              }
            }}
          >
            {/* CRT scanline & glass curvature glare overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_3px] opacity-60 z-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,80,50,0.08)_0%,rgba(0,0,0,0.6)_100%)] z-0"
            />

            {developerCredits ? (
              <div
                id="typewriter-developer-credits-display"
                className="relative z-10 flex items-center justify-center text-center px-1 sm:px-2 py-0.5 text-[#56A86E] font-bold tracking-normal sm:tracking-wider text-[7.5px] sm:text-[9.5px] md:text-[10.5px] whitespace-nowrap drop-shadow-[0_0_3px_rgba(86,168,110,0.6)] animate-pulse"
                title={developerCredits}
              >
                <span>{developerCredits}</span>
              </div>
            ) : isPageComplete ? (
              <div
                id="typewriter-new-sheet-insert-alert"
                className="relative z-10 flex items-center gap-1 sm:gap-2 py-0.5 text-[#B84040] font-bold tracking-widest animate-pulse"
                title="Page Complete! Click to Insert New Sheet"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B84040] animate-ping shrink-0" />
                <span className="text-[8px] min-[360px]:text-[9px] sm:text-[11px] font-bold tracking-widest text-[#D45050]">
                  NEW SHEET INSERT
                </span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center gap-1.5 sm:gap-3">
                {/* Word Live Count */}
                <div className="flex items-center gap-0.5 sm:gap-1.5">
                  <span className="text-[7.5px] sm:text-[10px] uppercase tracking-wider text-[#3D744E] font-bold">WORDS</span>
                  <span className="font-bold text-[#56A86E] text-[9px] sm:text-[12px] tracking-wider drop-shadow-[0_0_2px_rgba(86,168,110,0.35)]">
                    {wordsCount}
                  </span>
                </div>

                <span className="w-1 h-1 rounded-full bg-[#3D744E]/60" />

                {/* Line Live Count */}
                <div className="flex items-center gap-0.5 sm:gap-1.5">
                  <span className="text-[7.5px] sm:text-[10px] uppercase tracking-wider text-[#3D744E] font-bold">LINE</span>
                  <span className="font-bold text-[#56A86E] text-[9px] sm:text-[12px] tracking-wider drop-shadow-[0_0_2px_rgba(86,168,110,0.35)]">
                    {currentLine}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dark Orange Tear Paper Button (Right side, only 'TEAR' text, cuts paper and opens expanded modal) */}
          {onTearPaper && (
            <button
              type="button"
              id="btn-tear-paper-counter"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (Date.now() - lastTouchTearRef.current < 450) return;
                onTearPaper();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                lastTouchTearRef.current = Date.now();
                onTearPaper();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isTearing || isInsertingSheet}
              title="Tear paper and expand view"
              className={`
                absolute right-0.5 sm:right-6 top-1/2 -translate-y-1/2
                px-1 min-[360px]:px-1.5 sm:px-2.5 h-5.5 sm:h-7 rounded-sm sm:rounded-md
                bg-gradient-to-b from-[#E65100] via-[#C43D00] to-[#8F2C00]
                hover:from-[#FF6D00] hover:to-[#A33300]
                active:from-[#A33300] active:to-[#6B1F00] active:scale-95
                border border-[#571900] sm:border-2
                shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)]
                active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]
                transition-all duration-150 cursor-pointer select-none touch-manipulation
                flex items-center justify-center
                ${isTearing || isInsertingSheet ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="font-courier font-bold text-[7.5px] min-[360px]:text-[8.5px] sm:text-[10px] text-white tracking-wider uppercase">
                TEAR
              </span>
            </button>
          )}
        </div>

        {/* ========================================================
            5. MECHANICAL TYPEWRITER KEYBOARD
            ======================================================== */}
        <Keyboard
          pressedKeys={pressedKeys}
          isCapsLockActive={isCapsLockActive}
          isShiftActive={isShiftActive}
          isMarginReleased={isMarginReleased}
          lineSpacing={lineSpacing}
          onChangeLineSpacing={onChangeLineSpacing}
          onKeyPress={onKeyPress}
          onMarginRelease={onMarginRelease}
          onFeed={onFeed}
        />
      </div>

      {/* ========================================================
          6. WOODEN DESK INSCRIPTION: "PRESS & CRAFT"
          (Vintage carved & branded inscription into the wooden desk)
          ======================================================== */}
      <div
        id="desk-brand-inscription"
        className="mt-3 sm:mt-5 flex flex-col items-center justify-center select-none pointer-events-none px-2 max-w-full"
      >
        <div className="flex items-center gap-2 min-[360px]:gap-3 sm:gap-4 opacity-90 max-w-full">
          <span className="h-[1px] w-4 min-[360px]:w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#260D04]/60 to-[#260D04]" />
          <h2 className="wood-inscription-style text-lg min-[360px]:text-2xl sm:text-4xl tracking-[0.08em] min-[360px]:tracking-[0.12em] sm:tracking-[0.16em] uppercase whitespace-nowrap">
            PRESS &amp; CRAFT
          </h2>
          <span className="h-[1px] w-4 min-[360px]:w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#260D04]/60 to-[#260D04]" />
        </div>
      </div>
    </div>
  );
};

