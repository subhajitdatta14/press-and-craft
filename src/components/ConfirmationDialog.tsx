import React, { useEffect } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'warning',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const getConfirmStyle = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-[#7A1D28] hover:bg-[#962533] text-white border-[#B23B4A]';
      case 'warning':
        return 'bg-[#664C1B] hover:bg-[#805F22] text-[#F9E8B8] border-[#A87E2E]';
      case 'primary':
      default:
        return 'bg-[#2E313A] hover:bg-[#3C404C] text-[#E4DEC9] border-[#575B6B]';
    }
  };

  return (
    <div
      id="confirmation-modal-backdrop"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] p-4 select-none"
    >
      <div className="w-full max-w-sm rounded-xl bg-[#1C1D21] border border-[#3E4049] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 text-center flex flex-col items-center">
        {/* Metal rivet detail */}
        <div className="w-6 h-1 bg-[#3A3C45] rounded-full mb-3" />

        <h3 className="font-brand font-bold text-sm tracking-wider text-[#E4DEC9] uppercase mb-2">
          {title}
        </h3>

        <p className="font-courier text-xs text-[#A8A496] mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3 w-full font-courier text-xs">
          <button
            type="button"
            id="btn-dialog-cancel"
            onClick={onCancel}
            className="flex-1 py-2 rounded bg-[#25272D] hover:bg-[#30333B] border border-[#3A3C45] text-[#C8C4B7] cursor-pointer transition-colors"
          >
            CANCEL (ESC)
          </button>
          <button
            type="button"
            id="btn-dialog-confirm"
            onClick={onConfirm}
            className={`flex-1 py-2 rounded border font-semibold cursor-pointer transition-colors ${getConfirmStyle()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
