import React, { useEffect, useCallback } from 'react';
import { playTypewriterSound } from '../utils/audio';

interface PressCraftCoverProps {
  onEnter: () => void;
}

export const PressCraftCover: React.FC<PressCraftCoverProps> = ({ onEnter }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.focus();
    }
  }, []);

  // Handle clicking anywhere on the screen
  const handleTriggerEnter = useCallback(() => {
    try {
      playTypewriterSound('strike', 0.85);
    } catch {
      // Audio fallback
    }
    onEnter();
  }, [onEnter]);

  return (
    <div
      id="press-craft-cover-page"
      tabIndex={0}
      autoFocus
      onClick={handleTriggerEnter}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer select-none outline-none"
      style={{
        backgroundColor: '#DECBAE',
        backgroundImage: `
          radial-gradient(ellipse 95% 85% at 50% 50%, #ECE0CB 0%, #E3D3BB 40%, #DEC9AA 75%, #CAAe88 100%)
        `,
      }}
      title="Click anywhere to enter typewriter"
    >
      {/* Paper grain linear striations */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(60, 40, 20, 0.03) 2px,
              rgba(60, 40, 20, 0.03) 3px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 3px,
              rgba(60, 40, 20, 0.02) 3px,
              rgba(60, 40, 20, 0.02) 4px
            )
          `,
        }}
      />

      {/* Organic Vintage Foxing & Paper Age Stains */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[18%] left-[7%] w-48 h-48 rounded-full bg-[#B89B72]/20 blur-3xl" />
        <div className="absolute top-[65%] right-[9%] w-56 h-56 rounded-full bg-[#C2A378]/25 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 120px rgba(80, 52, 28, 0.35), inset 0 0 40px rgba(50, 30, 15, 0.4)',
          }}
        />
      </div>

      {/* Center content: Only "Press and craft" */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-full">
        <h1
          id="press-craft-cover-title"
          className="text-4xl min-[360px]:text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.04em] min-[360px]:tracking-[0.06em] sm:tracking-[0.1em] text-[#1D140D] font-normal leading-tight select-none transition-transform duration-300 hover:scale-[1.02] px-2 break-words"
          style={{
            fontFamily: "'Carnivalee Freakshow', 'Cinzel', serif",
            textShadow: '0 1px 2px rgba(255,255,255,0.4)',
          }}
        >
          Press & Craft
        </h1>
      </div>
    </div>
  );
};
