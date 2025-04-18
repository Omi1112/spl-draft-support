import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface AddParticipantModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// モーダルのフォーカストラップとESCキー対応
export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // タブキーでのフォーカストラップ
      if (e.key === 'Tab' && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white rounded shadow-lg p-6 min-w-[320px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="閉じる"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    typeof window !== 'undefined' && document.body ? document.body : document.createElement('div')
  );
};
