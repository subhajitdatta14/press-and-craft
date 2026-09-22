import React, { useState, useRef } from 'react';

interface CarriageReturnLeverProps {
  onReturn: () => void;
  disabled?: boolean;
  isCarriageReturning?: boolean;
}

export const CarriageReturnLever: React.FC<CarriageReturnLeverProps> = ({
  onReturn,
  disabled = false,
  isCarriageReturning = false,
}) => {
  const [localPulling, setLocalPulling] = useState(false);
  const lastTouchTime = useRef<number>(0);

  const triggerLever = () => {
    if (disabled || localPulling || isCarriageReturning) return;
    setLocalPulling(true);
    onReturn();
    setTimeout(() => {
      setLocalPulling(false);
    }, 320);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    lastTouchTime.current = Date.now();
    triggerLever();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (Date.now() - lastTouchTime.current < 450) return;
    triggerLever();
  };

  const isLeverActive = localPulling || isCarriageReturning;

  return (
    <div
      id="carriage-return-lever-container"
      className="relative z-20 select-none touch-manipulation"
      title="Carriage Return Lever (Click or press Enter)"
    >
      <button
        type="button"
        id="btn-carriage-return-lever"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        aria-label="Pull carriage return lever"
        className="group relative flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] touch-manipulation"
      >
        {/* The chrome metal lever arm */}
        <div
          className={`
            origin-bottom-right transition-transform duration-200 ease-out
            ${isLeverActive ? '-rotate-24 translate-x-1.5' : 'rotate-0 group-hover:-rotate-6'}
          `}
        >

          {/* Silver metallic curved handle */}
          <div className="flex items-center">
            {/* Paddle finger knob */}
            <div className="w-4 xs:w-5 sm:w-6 h-6 xs:h-7 sm:h-8 rounded-l-md bg-gradient-to-r from-[#D8D7D3] via-[#B8B5AE] to-[#767470] border border-[#ECEBE8] shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center">
              {/* Grip ridges */}
              <div className="flex flex-col gap-0.5 xs:gap-1">
                <span className="w-2 xs:w-2.5 h-[1.5px] bg-[#494844]/60 rounded-full" />
                <span className="w-2 xs:w-2.5 h-[1.5px] bg-[#494844]/60 rounded-full" />
                <span className="w-2 xs:w-2.5 h-[1.5px] bg-[#494844]/60 rounded-full" />
              </div>
            </div>

            {/* Connecting metallic rod */}
            <div className="w-5 xs:w-7 sm:w-10 h-1.5 xs:h-2 sm:h-2.5 bg-gradient-to-b from-[#EEEEEC] via-[#A6A49F] to-[#595855] border-y border-[#D6D4CF] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />

            {/* Swivel hinge mounting bracket */}
            <div className="w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 rounded-full bg-gradient-to-br from-[#8C8B87] via-[#434449] to-[#1C1D21] border border-[#B0ADA6] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center">
              <div className="w-1 xs:w-1.5 h-1 xs:h-1.5 rounded-full bg-[#18191B]" />
            </div>
          </div>
        </div>

        {/* Small vintage label tooltip on desktop */}
        <span className="hidden md:inline-block ml-1.5 text-[9px] font-courier uppercase tracking-widest text-[#8E8B82] opacity-70 group-hover:opacity-100 group-hover:text-[#C5A059] transition-opacity">
          RETURN
        </span>
      </button>
    </div>
  );
};
