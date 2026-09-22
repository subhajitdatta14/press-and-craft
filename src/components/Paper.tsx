import React, { useRef, useEffect, useState } from 'react';
import { LineSpacing, MarginSettings, TypingMode } from '../types';
import { playTypewriterSound } from '../utils/audio';

interface PaperProps {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  margins: MarginSettings;
  lineSpacing: LineSpacing;
  mode: TypingMode;
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onPaperClick?: (row: number, col: number) => void;
  isCarriageReturning?: boolean;
  isFeeding?: boolean;
  isTearing?: boolean;
  isInsertingSheet?: boolean;
  platenDistanceToTop?: number;
  pageNumber?: number;
}

/**
 * 3D Curled Paper Roll Design that touches the above webpage edge
 */
const PaperRollDesign: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <div
      id="paper-roll-edge-design"
      aria-hidden="true"
      className={`
        no-print absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[94%] md:w-[90%] z-30 pointer-events-none
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {/* 3D Curled Paper Roll Cylinder touching the above web page edge */}
      <div className="relative w-full flex items-center justify-center">
        {/* Left curled spiral roll end */}
        <div className="relative w-3.5 sm:w-4 h-5 sm:h-6 rounded-l-full bg-gradient-to-r from-[#C2B28B] via-[#DFD4B5] to-[#EFE7D0] border-l border-y border-[#A89870] shadow-sm flex items-center justify-center shrink-0 -mr-[1px] z-10">
          <div className="w-1.5 h-2.5 rounded-full border border-[#8A7A52]/70 bg-[#A6966E]/40" />
        </div>

        {/* Central Cylindrical Roll Body touching the very top edge */}
        <div className="relative flex-1 h-5 sm:h-6 bg-gradient-to-b from-[#FFFDF7] via-[#EDE4CB] to-[#D5C6A0] border-y border-[#B8A880] shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.85)] flex flex-col justify-between">
          {/* Top highlight glint directly touching webpage edge */}
          <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          {/* Roll cylinder curl crease */}
          <div className="w-full h-1 bg-gradient-to-b from-[#B8A880]/30 to-transparent" />
        </div>

        {/* Right curled spiral roll end */}
        <div className="relative w-3.5 sm:w-4 h-5 sm:h-6 rounded-r-full bg-gradient-to-l from-[#C2B28B] via-[#DFD4B5] to-[#EFE7D0] border-r border-y border-[#A89870] shadow-sm flex items-center justify-center shrink-0 -ml-[1px] z-10">
          <div className="w-1.5 h-2.5 rounded-full border border-[#8A7A52]/70 bg-[#A6966E]/40" />
        </div>
      </div>

      {/* Under-roll drop shadow cast onto paper unrolling beneath */}
      <div className="w-full h-3 bg-gradient-to-b from-black/25 via-black/8 to-transparent" />
    </div>
  );
};

export const Paper: React.FC<PaperProps> = ({
  lines,
  cursorRow,
  cursorCol,
  margins,
  lineSpacing,
  mode,
  title,
  onTitleChange,
  onPaperClick,
  isCarriageReturning = false,
  isFeeding = false,
  isTearing = false,
  isInsertingSheet = false,
  platenDistanceToTop = 420,
  pageNumber = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Check if document already has content upon mounting
  const hasExistingContent =
    lines.length > 1 ||
    (lines[0] && lines[0].trim().length > 0) ||
    (title.trim().length > 0 && title !== 'UNTITLED');

  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(hasExistingContent);
  const [paperOffsetY, setPaperOffsetY] = useState<number>(0);
  const [manualWheelOffset, setManualWheelOffset] = useState<number>(0);

  // Touch scrolling states for mobile and tablet
  const [isTouching, setIsTouching] = useState<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const touchStartOffsetRef = useRef<number>(0);
  const isDragMoveRef = useRef<boolean>(false);
  const lastTouchYRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const velocityYRef = useRef<number>(0);
  const momentumAnimIdRef = useRef<number | null>(null);

  const stopMomentum = () => {
    if (momentumAnimIdRef.current !== null) {
      cancelAnimationFrame(momentumAnimIdRef.current);
      momentumAnimIdRef.current = null;
    }
  };

  // Clean up momentum animation on unmount
  useEffect(() => {
    return () => {
      stopMomentum();
    };
  }, []);

  // Automatically feed paper through platen as soon as typing begins
  useEffect(() => {
    const isTypingActive =
      lines.length > 1 ||
      (lines[0] && lines[0].trim().length > 0) ||
      cursorCol > margins.left ||
      cursorRow > 0 ||
      (title.trim().length > 0 && title !== 'UNTITLED');

    if (isTypingActive && !hasStartedTyping) {
      setHasStartedTyping(true);
      playTypewriterSound('platen', 0.65);
    } else if (!isTypingActive && lines.length === 1 && (!lines[0] || lines[0].trim().length === 0) && cursorRow === 0 && cursorCol === margins.left && title === 'UNTITLED') {
      setHasStartedTyping(false);
    }
  }, [lines, cursorCol, cursorRow, margins.left, title, hasStartedTyping]);

  // Compute line height in pixels with mobile awareness
  const getLineHeightPx = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const base = isMobile ? 22.4 : 28;
    switch (lineSpacing) {
      case 1.5:
        return base * 1.25;
      case 2:
        return base * 1.6;
      case 1:
      default:
        return base;
    }
  };

  // Determine line spacing typography class
  const getLineSpacingStyle = () => {
    switch (lineSpacing) {
      case 1.5:
        return 'leading-[1.75rem] sm:leading-[2.2rem]';
      case 2:
        return 'leading-[2.1rem] sm:leading-[2.8rem]';
      case 1:
      default:
        return 'leading-[1.4rem] sm:leading-[1.75rem]';
    }
  };

  // Distance from top of container to the optical typewriter platen strike zone (near platen roller)
  const targetStrikeY = Math.max(180, platenDistanceToTop - 40);

  // Calculate the mechanical paper vertical position
  // The active line is kept aligned with the platen strike zone, while the paper feeds upward smoothly
  useEffect(() => {
    // Measure active line offset or compute based on rows
    let lineTop = 0;
    if (activeLineRef.current) {
      lineTop = activeLineRef.current.offsetTop;
    } else {
      lineTop = 20 + cursorRow * getLineHeightPx();
    }

    // Active line is positioned at the platen strike line, starting right in the above section
    const targetOffset = targetStrikeY - lineTop;
    setPaperOffsetY(targetOffset);
  }, [cursorRow, lines.length, lineSpacing, targetStrikeY, platenDistanceToTop]);

  // Smoothly reset any temporary manual wheel offset on keystroke, cursor move, carriage return, or feed
  useEffect(() => {
    stopMomentum();
    setManualWheelOffset(0);
  }, [cursorRow, cursorCol, lines, isCarriageReturning, isFeeding]);

  // Allow smooth inspection with mouse wheel without disturbing mechanical typewriter alignment
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    stopMomentum();
    setManualWheelOffset((prev) => {
      const next = prev - e.deltaY * 0.6;
      return Math.max(-1400, Math.min(800, next));
    });
  };

  // Touch scrolling handlers for mobile and tablet touchscreens
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    stopMomentum();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartOffsetRef.current = manualWheelOffset;
    lastTouchYRef.current = touch.clientY;
    lastTouchTimeRef.current = Date.now();
    velocityYRef.current = 0;
    isDragMoveRef.current = false;
    setIsTouching(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - touchStartYRef.current;

    if (Math.abs(deltaY) > 5) {
      isDragMoveRef.current = true;
    }

    const now = Date.now();
    const dt = now - lastTouchTimeRef.current;
    if (dt > 0) {
      const instantaneousV = (currentY - lastTouchYRef.current) / dt;
      velocityYRef.current = 0.7 * instantaneousV + 0.3 * velocityYRef.current;
      lastTouchYRef.current = currentY;
      lastTouchTimeRef.current = now;
    }

    // Direct 1:1 finger tracking with bounded range
    const nextOffset = Math.max(-1400, Math.min(800, touchStartOffsetRef.current + deltaY));
    setManualWheelOffset(nextOffset);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);

    // Briefly keep isDragMoveRef true so synthetic click event after touch release is ignored
    setTimeout(() => {
      isDragMoveRef.current = false;
    }, 120);

    // Inertia momentum fling when releasing finger with speed
    const now = Date.now();
    if (now - lastTouchTimeRef.current < 90 && Math.abs(velocityYRef.current) > 0.1) {
      let v = velocityYRef.current * 16;
      v = Math.max(-32, Math.min(32, v));

      const step = () => {
        v *= 0.93;
        if (Math.abs(v) < 0.2) {
          momentumAnimIdRef.current = null;
          return;
        }
        setManualWheelOffset((prev) => {
          const next = prev + v;
          if (next <= -1400 || next >= 800) {
            momentumAnimIdRef.current = null;
            return Math.max(-1400, Math.min(800, next));
          }
          return next;
        });
        momentumAnimIdRef.current = requestAnimationFrame(step);
      };

      momentumAnimIdRef.current = requestAnimationFrame(step);
    }
  };

  const handleTouchCancel = () => {
    setIsTouching(false);
    isDragMoveRef.current = false;
    stopMomentum();
  };

  const handleLineClick = (rowIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragMoveRef.current) return;
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
      playTypewriterSound('platen', 0.65);
    }
    if (mode !== 'free' || !onPaperClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const charWidth = 9.6;
    const targetCol = Math.max(margins.left, Math.min(margins.right, Math.round(clickX / charWidth)));
    onPaperClick(rowIndex, targetCol);
  };

  const effectiveTranslateY = paperOffsetY + manualWheelOffset;

  return (
    <div
      ref={containerRef}
      id="paper-container"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={() => {
        if (isDragMoveRef.current) return;
        if (!hasStartedTyping) {
          setHasStartedTyping(true);
          playTypewriterSound('platen', 0.65);
        }
      }}
      className="relative w-full max-w-2xl mx-auto flex flex-col items-center overflow-hidden select-none touch-none"
      style={{
        height: `${platenDistanceToTop}px`,
        marginTop: `-${Math.max(0, platenDistanceToTop - 46)}px`,
      }}
    >
      {/* 3D Curled Paper Roll Design touching the above web page edge */}
      <PaperRollDesign isVisible={hasStartedTyping} />

      {/* Moving Paper Sheet: Content layer that feeds and scrolls smoothly with proper A4 size */}
      <div
        id="paper-sheet"
        className={`
          paper-texture paper-print-container
          relative w-full max-w-[620px] mx-auto
          pt-4 sm:pt-6 pb-12 px-2 min-[360px]:px-3 sm:px-10 md:px-12
          rounded-t-sm shadow-[0_4px_25px_rgba(0,0,0,0.5),0_1px_4px_rgba(0,0,0,0.25)]
          will-change-transform
          flex flex-col justify-between
          ${isTearing ? 'animate-paper-tear pointer-events-none' : isInsertingSheet ? 'animate-paper-insert' : ''}
        `}
        style={{
          boxShadow: '0 -2px 10px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.4)',
          transform: `translateY(${effectiveTranslateY}px)`,
          transition: isTouching
            ? 'none'
            : isCarriageReturning || isFeeding
            ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)'
            : 'transform 420ms cubic-bezier(0.25, 1, 0.5, 1)',
          minHeight: '877px', // Proper A4 Sheet Standard Proportion (210mm x 297mm proportional to 620px width)
        }}
      >
        <div>
          {/* Paper feed watermark / top edge sheen */}
          <div className="no-print absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

          {/* Typed Lines Container - starts right in the above section with decreased feed */}
          <div
            id="paper-typed-lines"
            className={`font-typewriter text-[12px] min-[390px]:text-[13.5px] min-[480px]:text-[14.5px] sm:text-[16px] typewriter-ink-text whitespace-pre select-text ${getLineSpacingStyle()}`}
          >
            {lines.map((lineContent, rowIndex) => {
              const isActiveLine = rowIndex === cursorRow;
              const displayContent = lineContent || ' ';

              return (
                <div
                  key={`line-${rowIndex}`}
                  ref={isActiveLine ? activeLineRef : null}
                  onClick={(e) => handleLineClick(rowIndex, e)}
                  className="relative min-h-[1.75rem] flex items-center tracking-normal"
                >
                  {/* Left Margin Guide tick */}
                  <div
                    aria-hidden="true"
                    className="no-print absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-[#DFD49E]/70"
                    style={{ left: `${margins.left}ch` }}
                  />

                  {/* Right Margin Guide tick */}
                  <div
                    aria-hidden="true"
                    className="no-print absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-[#DFD49E]/70"
                    style={{ left: `${margins.right}ch` }}
                  />

                  {/* Actual line text rendered directly from column 0 */}
                  <span className="inline-block whitespace-pre font-mono">
                    {displayContent}
                  </span>

                  {/* Typewriter stamping position cell on active line */}
                  {isActiveLine && (
                    <span
                      id="typewriter-active-caret"
                      aria-hidden="true"
                      className={`
                        no-print absolute top-1/2 -translate-y-1/2 pointer-events-none
                        w-[1ch] h-[1.15em] border-b-2 border-[#1A1917] bg-[#1A1917]/10
                        ${isCarriageReturning ? 'opacity-0' : 'animate-pulse'}
                      `}
                      style={{
                        left: `${cursorCol}ch`,
                        boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom platen fade guard */}
        <div className="h-10 pointer-events-none" />
      </div>

      {/* Subtle Platen roller throat shadow (optical illusion of paper feeding out of the rubber roller) */}
      <div className="no-print absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111214]/40 via-[#111214]/10 to-transparent pointer-events-none z-20" />
    </div>
  );
};
