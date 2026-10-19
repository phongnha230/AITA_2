import React from 'react';
import { Upload, Eye, Trash2, ExternalLink } from 'lucide-react';

interface WizardPdfSectionProps {
  pdfFile: { name: string; size: string } | null;
  onSelectPdf: (file: File) => void;
  onRemovePdf: () => void;
  existingPdfDownloadUrl: string | null;
  pdfBlobUrl: string | null;
  setPdfBlobUrl: (url: string | null) => void;
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
}

export const WizardPdfSection: React.FC<WizardPdfSectionProps> = ({
  pdfFile,
  onSelectPdf,
  onRemovePdf,
  existingPdfDownloadUrl,
  pdfBlobUrl,
  setPdfBlobUrl,
  showPdfPreview,
  setShowPdfPreview,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            1. File PDF Đề Thi Chính Thức
          </h2>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md font-bold">
            Thí sinh đọc đề
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Tệp lưu riêng tư và chỉ tải qua API có phân quyền</span>
      </div>

      <div className="p-4 bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition text-center group">
        {pdfFile ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 text-left min-w-0">
              <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 border border-rose-100">
                PDF
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-slate-900 truncate">{pdfFile.name}</div>
                <div className="text-xs text-slate-400">{pdfFile.size} • Tệp sẽ được lưu cùng đề khi bấm lưu</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition"
              >
                <Eye className="size-3.5" />
                <span>{showPdfPreview ? 'Ẩn xem trước' : 'Xem trước PDF'}</span>
              </button>
              <button
                type="button"
                aria-label="Xóa tệp PDF đề thi"
                onClick={() => {
                  onRemovePdf();
                  if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                  setPdfBlobUrl(null);
                  setShowPdfPreview(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block py-5">
            <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 transition group-hover:scale-105 group-hover:bg-blue-100">
              <Upload className="size-5" />
            </div>
            <div className="text-xs font-bold text-slate-700">Kéo thả hoặc Nhấp để tải file PDF đề thi (.pdf)</div>
            <div className="text-xs text-slate-400 mt-1">PDF tối đa 25 MiB. Tệp được lưu riêng và chỉ tải qua API có xác thực.</div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onSelectPdf(f);
                  if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                  // react-doctor-disable-next-line react-doctor/no-create-object-url-without-revoke
                  setPdfBlobUrl(URL.createObjectURL(f));
                  setShowPdfPreview(true);
                }
              }}
            />
          </label>
        )}
      </div>

      {showPdfPreview && pdfFile && (
        <div className="bg-slate-100 p-4 animate-in fade-in">
          {pdfBlobUrl || existingPdfDownloadUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                <span>Xem trước file PDF: <strong className="text-slate-900">{pdfFile.name}</strong></span>
                <a
                  href={pdfBlobUrl || existingPdfDownloadUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-bold text-xs"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <iframe
                src={pdfBlobUrl || existingPdfDownloadUrl || undefined}
                sandbox="allow-same-origin"
                className="w-full h-[550px] rounded-lg border border-slate-300 shadow bg-white"
                title="PDF Document Preview"
              />
            </div>
          ) : (
            <p className="rounded-lg bg-white p-5 text-sm text-slate-600">PDF mẫu chưa được đính kèm. Tải PDF thật lên để xem trước và lưu cùng đề.</p>
          )}
        </div>
      )}
    </div>
  );
};
