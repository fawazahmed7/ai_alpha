import React from 'react';
import { ToastItem } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 px-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 bg-[#1c1f29]/95 text-[#dfe2ef] border-white/10"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            {(!toast.type || toast.type === 'success') && <CheckCircle2 className="w-5 h-5 text-[#4cd7f6]" />}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-[#dfe2ef] leading-tight font-geist">
              {toast.title}
            </span>
            {toast.description && (
              <span className="text-xs text-[#c7c4d7] mt-0.5 leading-snug">
                {toast.description}
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#908fa0] hover:text-white p-0.5 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
