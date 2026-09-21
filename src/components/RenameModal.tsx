import React, { useState, useEffect, useRef } from 'react';
import { Edit3, X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onClose: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  currentTitle,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl border bg-[#181b25] border-white/10 text-[#dfe2ef]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#262a34] flex items-center justify-center text-[#4cd7f6]">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#dfe2ef] font-geist">
              Rename Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#c7c4d7] mb-1.5 uppercase tracking-wider font-mono">
              Title
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Next.js App Router Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f131c] border border-white/10 text-white placeholder:text-[#908fa0] focus:outline-none focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/40 text-sm transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-[#dfe2ef] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] text-white shadow-lg shadow-[#8083ff]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
