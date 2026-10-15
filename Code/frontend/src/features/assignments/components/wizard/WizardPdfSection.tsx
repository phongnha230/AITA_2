import React from 'react';
import { Upload, Eye, Trash2, ExternalLink } from 'lucide-react';

interface WizardPdfSectionProps {
  pdfFile: { name: string; size: string } | null;
  setPdfFile: (f: { name: string; size: string } | null) => void;
  pdfBlobUrl: string | null;
  setPdfBlobUrl: (url: string | null) => void;
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
}

export const WizardPdfSection: React.FC<WizardPdfSectionProps> = ({
  pdfFile,
  setPdfFile,
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
        <span className="text-[11px] text-slate-400 font-medium">Bảo mật cấp độ Phòng thi Kiosk</span>
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
                <div className="text-[11px] text-slate-400">{pdfFile.size} • Đã sẵn sàng phát cho thí sinh</div>
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
                  setPdfFile(null);
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
            <div className="text-[11px] text-slate-400 mt-1">Dung lượng tối đa 20MB. Đề thi sẽ được khóa và mã hóa.</div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPdfFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` });
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
          {pdfBlobUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                <span>Xem trước file PDF: <strong className="text-slate-900">{pdfFile.name}</strong></span>
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-bold text-xs"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={pdfBlobUrl}
                sandbox="allow-same-origin"
                className="w-full h-[550px] rounded-lg border border-slate-300 shadow bg-white"
                title="PDF Document Preview"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 max-w-2xl mx-auto space-y-4 text-xs font-serif text-slate-800">
              <div className="text-center border-b pb-3 border-slate-200 font-sans">
                <div className="font-bold text-sm tracking-wider uppercase text-slate-900">TRƯỜNG ĐẠI HỌC FPT — KHOA CNTT</div>
                <div className="font-extrabold text-base text-blue-700 mt-1">ĐỀ THI THỰC HÀNH (PRACTICAL EXAM)</div>
                <div className="text-slate-500 text-[11px]">Môn: PRF192 — Programming Fundamentals with C • Thời gian: 60 phút</div>
              </div>
              <div className="space-y-3 font-sans leading-relaxed">
                <p><strong>Câu 1 (5.0 điểm):</strong> Viết chương trình C đọc số nguyên N. Đếm và in tất cả các số nguyên tố trong đoạn [1, N] theo thứ tự tăng dần. Dòng tiếp theo in <code>Total primes: K</code>.</p>
                <p><strong>Câu 2 (5.0 điểm):</strong> Cho mảng N số nguyên. Tìm phần tử lớn nhất đầu tiên và đảo ngược mảng từ vị trí 0 đến vị trí phần tử lớn nhất đó.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
