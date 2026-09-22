import React, { useState } from 'react';
import { X, Printer, Download, Check, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { playTypewriterSound } from '../utils/audio';

interface ExpandedPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  lines: string[];
  lineSpacing: number;
  pageNumber?: number;
}

export const ExpandedPaperModal: React.FC<ExpandedPaperModalProps> = ({
  isOpen,
  onClose,
  title,
  lines,
  lineSpacing,
  pageNumber = 1,
}) => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const displayTitle = title.trim() ? title.trim().toUpperCase() : 'UNTITLED';

  // Store document to local machine as standard portrait A4 PDF
  const handlePrint = async () => {
    playTypewriterSound('platen', 0.65);
    await handleDownloadPdf();
  };

  // Generate clean A4 PDF and store directly into the user's local machine
  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      playTypewriterSound('strike', 0.5);

      // Create portrait A4 standard document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 54; // 0.75 in

      // Vintage warm ivory page background matching paper-texture
      doc.setFillColor(250, 245, 198);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Sheet content lines in typewriter Courier
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 21);

      // Line spacing in points
      const baseLineHeight = 15;
      const effectiveLineHeight = baseLineHeight * (lineSpacing || 1);
      let currentY = margin + 30;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || '';

        // Check for page break if sheet is very long
        if (currentY > pageHeight - margin - 20) {
          doc.addPage();
          doc.setFillColor(250, 245, 198);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          currentY = margin + 30;
        }

        doc.text(line, margin, currentY);
        currentY += effectiveLineHeight;
      }

      const safeFilename =
        (title.trim() ? title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : `sheet-page-${pageNumber || 1}`) +
        '.pdf';

      // Store file directly to the local machine
      doc.save(safeFilename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Save to local machine error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div
      id="expanded-paper-modal-backdrop"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Container holding the A4 sheet + bottom actions */}
      <div
        id="expanded-paper-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col items-center py-2 px-1"
      >
        {/* Top Close Bar */}
        <div className="no-print w-full max-w-[620px] flex items-center justify-between pb-2 text-xs font-courier text-[#9E9B90] select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
            <span className="uppercase tracking-widest text-[#E4DEC9] font-bold">
              SHEET
            </span>
          </div>

          <button
            type="button"
            id="btn-close-expanded-paper"
            onClick={onClose}
            title="Close View"
            className="p-1 rounded-full text-[#8E8B82] hover:text-white hover:bg-[#2B2D33] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Authentic A4 Size Paper Sheet */}
        <div
          id="expanded-paper-sheet"
          className="paper-texture paper-print-container relative w-full max-w-[620px] mx-auto min-h-[500px] sm:min-h-[877px] text-[#1E1B15] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.85),0_2px_8px_rgba(0,0,0,0.4)] border border-[#DECFA8] pt-6 sm:pt-10 pb-12 sm:pb-16 px-3 min-[360px]:px-4 sm:px-12 font-typewriter flex flex-col justify-start select-text overflow-x-auto"
          style={{
            minHeight: 'min(877px, 75vh)',
          }}
        >
          {/* Body Lines */}
          <div
            className="space-y-0.5 text-[11px] min-[360px]:text-xs sm:text-sm font-medium leading-relaxed select-text"
            style={{
              lineHeight: lineSpacing === 2 ? '2.1rem' : lineSpacing === 1.5 ? '1.75rem' : '1.35rem',
            }}
          >
            {lines.map((line, idx) => (
              <div
                key={`expanded-line-${idx}`}
                className="whitespace-pre min-h-[1.4rem] tracking-wide font-typewriter text-[#221F1B]"
              >
                {line || ' '}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Bar Below the Paper */}
        <div className="no-print w-full max-w-[620px] mt-4 flex items-center justify-center gap-3 pb-2">
          {/* PRINT BUTTON */}
          <button
            type="button"
            id="btn-expanded-download-pdf"
            onClick={handlePrint}
            title="Print document"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#D4AC57] to-[#B38933] hover:from-[#E0B963] hover:to-[#C2953B] active:scale-[0.98] text-[#16140E] font-bold font-courier text-xs tracking-wider shadow-[0_8px_20px_rgba(212,172,87,0.35)] flex items-center gap-2 cursor-pointer transition-all border border-[#E9C77B]"
          >
            <Printer className="w-4 h-4 text-[#16140E]" />
            <span>PRINT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
