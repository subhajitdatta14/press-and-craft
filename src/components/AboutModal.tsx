import React from 'react';
import { X, Cog, ScrollText } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="typewriter-about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* Old Style Cream Color Parchment Page */}
      <div
        id="typewriter-about-page"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#F4ECD8] text-[#2C2721] rounded-sm p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.4)] border border-[#D5C7AA] font-courier"
      >
        {/* Small Exit Button at Top Right Corner */}
        <button
          type="button"
          onClick={onClose}
          title="Close Page"
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 p-1 rounded-full text-[#5A5246] hover:text-black hover:bg-[#E5D7BF] transition-colors cursor-pointer border border-[#C5B495]"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Vintage Red / Ink Top Header Stamp */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#2C2721]/30 mb-6 pr-6">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#8A4B38]">
              HISTORICAL DISPATCH & OPERATOR'S MANUAL
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-[#1F1B16] mt-0.5">
              TYPEWRIGHT NO. 1
            </h2>
          </div>
        </div>

        {/* ABOVE SECTION: 1874 Remington No. 1 Tribute */}
        <div className="mb-7 pb-6 border-b border-[#2C2721]/20">
          <div className="flex items-center gap-2 mb-2 text-[#8A4B38] font-bold text-xs sm:text-sm tracking-wider uppercase">
            <ScrollText className="w-4 h-4" />
            <span>Origins & Historical Legacy</span>
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed text-[#2C2721] text-justify font-medium">
            Inspired by the 1874 Remington No. 1, one of the first commercially successful typewriters, TYPEWRIGHT pays tribute to the mechanical writing machines that transformed written communication. Developed from the work of Christopher Latham Sholes and Carlos Glidden and manufactured by E. Remington & Sons, the 1874 machine helped popularize the QWERTY keyboard layout that remains familiar today.
          </p>
        </div>

        {/* BELOW SECTION: How This Web-Based Typewriter Works */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#8A4B38] font-bold text-xs sm:text-sm tracking-wider uppercase">
            <Cog className="w-4 h-4 animate-spin-slow" />
            <span>How This Web-Based Typewriter Works</span>
          </div>

          <div className="space-y-4 text-xs sm:text-[13px] leading-relaxed text-[#352F27]">
            {/* Mechanism 1 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Mechanical Carriage Advance:</strong>{' '}
                Typing physically advances the platen carriage to the left with every keystroke, matching the real physical travel of 19th-century mechanical typing machines.
              </div>
            </div>

            {/* Mechanism 2 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Right Margin Warning Bell:</strong>{' '}
                As you approach the right margin zone, an authentic metallic chime alerts you that the line is ending. Pull the physical silver carriage return lever or tap <strong>Enter</strong> to slide the carriage home and advance the paper roll.
              </div>
            </div>

            {/* Mechanism 3 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Margin Release (MR):</strong>{' '}
                If typing stops at the hard right boundary, engaging the <strong>Margin Release</strong> mechanism allows typing a few extra letters or hyphenation past the limit.
              </div>
            </div>

            {/* Mechanism 4 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Dual Typing Modes:</strong>{' '}
                Toggle between <strong>Mechanical Mode</strong> (authentic permanence where ink cannot be backspaced away) and <strong>Free Mode</strong> (standard fluid editing).
              </div>
            </div>

            {/* Mechanism 5 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Acoustic Multi-Sample Sound:</strong>{' '}
                Enjoy procedural, tactile strike audio—including heavy key clacks, space bar reverberations, carriage return ratchets, and end-of-line bells.
              </div>
            </div>

            {/* Mechanism 6 */}
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#8A4B38] mt-0.5 select-none">•</span>
              <div>
                <strong className="text-[#1A1713] uppercase tracking-wide">Automatic Preservation & Export:</strong>{' '}
                Your sheet is stored safely in your browser across reloads. Use the top-left download control to instantly export your writing as a <strong>PDF file</strong> or send it directly to the <strong>Print</strong> layout.
              </div>
            </div>
          </div>
        </div>

        {/* Vintage Footer Seal */}
        <div className="mt-8 pt-4 border-t border-[#2C2721]/20 flex items-center justify-between text-[10px] sm:text-[11px] text-[#696053]">
          <span>E. REMINGTON & SONS × SHOLES & GLIDDEN DESIGN</span>
          <span className="font-bold text-[#8A4B38]">INSPIRED BY 1874 — WEB RE-ENGINEERED</span>
        </div>
      </div>
    </div>
  );
};
