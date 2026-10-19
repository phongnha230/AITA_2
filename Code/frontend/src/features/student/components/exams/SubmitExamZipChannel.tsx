'use client';

import React from 'react';
import { FileArchive, Paperclip, X } from 'lucide-react';

interface SubmitExamZipChannelProps {
  selectedFile: File | null;
  onClearFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDrop: (e: React.DragEvent<HTMLButtonElement>) => void;
  disabled: boolean;
}

export const SubmitExamZipChannel: React.FC<SubmitExamZipChannelProps> = ({
  selectedFile,
  onClearFile,
  fileInputRef,
  onFileChange,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  disabled,
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor="zip-file-upload-input" className="text-xs font-semibold text-slate-700">
        Tệp mã nguồn (.zip) <span className="text-rose-500">*</span>
      </label>

      <input
        id="zip-file-upload-input"
        aria-label="Tệp mã nguồn (.zip)"
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={onFileChange}
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
          <div className="flex items-center gap-2.5 truncate">
            <FileArchive size={20} className="text-indigo-600 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Xóa file đã chọn"
            onClick={onClearFile}
            disabled={disabled}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70'
          }`}
        >
          <Paperclip className="size-6 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Kéo &amp; thả file .zip bài làm vào đây
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            hoặc bấm để duyệt file từ máy tính (Tối đa 50MB)
          </p>
        </button>
      )}
    </div>
  );
};
