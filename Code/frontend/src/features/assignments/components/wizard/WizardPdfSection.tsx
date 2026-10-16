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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            1. File PDF Đề Thi Chính Thức
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Tệp chỉ tải qua API có phân quyền</span>
      </div>

      <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 text-center transition">
        {pdfFile ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                PDF
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">{pdfFile.name}</div>
                <div className="text-[11px] text-slate-400">{pdfFile.size} • Tệp sẽ được lưu cùng đề khi bấm lưu</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block py-4">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">Kéo thả hoặc Nhấp để tải file PDF đề thi (.pdf)</div>
            <div className="text-[11px] text-slate-400 mt-1">PDF tối đa 25 MiB. Tệp được lưu riêng và chỉ tải qua API có xác thực.</div>
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
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 animate-in fade-in">
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
                  <ExternalLink className="w-3 h-3" />
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
