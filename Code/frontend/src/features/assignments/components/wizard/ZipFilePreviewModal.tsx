import React from 'react';
import { Code2, X } from 'lucide-react';

interface ZipFilePreviewModalProps {
  viewingZipFile: { filename: string; content: string } | null;
  onClose: () => void;
}

export const ZipFilePreviewModal: React.FC<ZipFilePreviewModalProps> = ({
  viewingZipFile,
  onClose,
}) => {
  if (!viewingZipFile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Tệp trong ZIP:</span>
            <span className="font-bold text-white">{viewingZipFile.filename}</span>
          </div>
          <button
            type="button"
            aria-label="Đóng xem tệp ZIP"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-200 rounded-xl overflow-x-auto max-h-[480px] border border-slate-850 leading-relaxed">
            {viewingZipFile.content}
          </pre>
        </div>
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
