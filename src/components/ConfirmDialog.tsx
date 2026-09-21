import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all bg-[#181b25] border-white/10 text-[#dfe2ef]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-400 border border-red-500/20">
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-[#dfe2ef] font-geist leading-tight">
            {title}
          </h3>
          <p className="text-sm text-[#c7c4d7] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 text-[#dfe2ef] border border-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-95 ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                : 'bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
