import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="no-print w-full flex flex-col items-center justify-center pt-2 pb-1 select-none">
      <div className="flex items-center gap-3">
        <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#8A713D]" />
        <h1 className="font-brand font-black text-base sm:text-lg tracking-[0.3em] text-[#D8B365] uppercase leading-none">
          TYPEWRIGHT
        </h1>
        <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#8A713D]" />
      </div>
      <p className="font-courier text-[9px] sm:text-[10px] tracking-[0.25em] text-[#8C887B] uppercase mt-0.5">
        TYPE. RETURN. REPEAT.
      </p>
    </header>
  );
};


