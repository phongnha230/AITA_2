import React from 'react';
import {
  Archive,
  Trash2,
  FolderTree,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface WizardZipSectionProps {
  starterZipFile: { name: string; size: string } | null;
  onRemoveStarter: () => void;
  existingStarterDownloadUrl: string | null;
  zipEntries: string[];
  setZipEntries: (entries: string[]) => void;
  zipFilesContent: Record<string, string>;
  setZipFilesContent: (c: Record<string, string>) => void;
  isReadingZip: boolean;
  macJunkDetected: boolean;
  handleZipUpload: (file: File) => void;
  onViewZipFile: (entry: string) => void;
}

export const WizardZipSection: React.FC<WizardZipSectionProps> = ({
  starterZipFile,
  onRemoveStarter,
  existingStarterDownloadUrl,
  zipEntries,
  setZipEntries,
  zipFilesContent,
  setZipFilesContent,
  isReadingZip,
  macJunkDetected,
  handleZipUpload,
  onViewZipFile,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-amber-500"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            2. Khung Mã Nguồn Mẫu (Starter / Template Code ZIP)
          </h2>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold">
            Thí sinh làm bài
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Sinh viên tải về mở trong IDE để bắt đầu làm bài</span>
      </div>

      <div className="p-4 bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 transition text-center group">
        {starterZipFile ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs shrink-0 border border-amber-100">
                  ZIP
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 truncate">{starterZipFile.name}</div>
                  <div className="text-xs text-slate-400">{starterZipFile.size} • Bộ khung code mẫu đã nạp thành công</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {existingStarterDownloadUrl && (
                  <a href={existingStarterDownloadUrl} className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition" download>
                    Tải ZIP đã lưu
                  </a>
                )}
                <button
                  type="button"
                  aria-label="Xóa bộ khung starter ZIP"
                  onClick={() => {
                    onRemoveStarter();
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {macJunkDetected && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-semibold rounded-xl border border-emerald-200/80">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Hệ thống đã tự động lọc bỏ các tệp rác hệ điều hành (__MACOSX, .DS_Store) theo đúng quy chuẩn khảo thí FPT.</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl shadow-inner">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FolderTree className="size-3.5 text-blue-400" />
                  <span>Cấu trúc tệp tin đọc từ file ZIP ({zipEntries.length} tệp):</span>
                </div>
                {isReadingZip && <span className="text-amber-400 font-sans font-bold">Đang giải nén đọc file...</span>}
              </div>

              <div className="space-y-1 text-xs max-h-52 overflow-y-auto pr-1">
                {zipEntries.length > 0 ? (
                  zipEntries.map((entry) => {
                    const hasContent = Boolean(zipFilesContent[entry]);
                    return (
                      <button
                        type="button"
                        key={entry}
                        onClick={() => {
                          if (hasContent) {
                            onViewZipFile(entry);
                          }
                        }}
                        className={`w-full text-left flex items-center justify-between p-1.5 rounded transition ${
                          hasContent
                            ? 'hover:bg-slate-800 cursor-pointer text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-emerald-400">📄</span>
                          <span className="font-mono">{entry}</span>
                        </div>
                        {hasContent && (
                          <span className="text-xs text-blue-400 font-sans flex items-center gap-1 shrink-0 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                            <Eye className="size-3" /> Xem code
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-slate-500 italic py-2">
                    {isReadingZip ? 'Đang phân tích cấu trúc gói ZIP...' : 'Gói nén trống hoặc chưa được phân tích.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block py-5 text-center">
            <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5 transition group-hover:scale-105 group-hover:bg-amber-100">
              <Archive className="size-5" />
            </div>
            <div className="text-xs font-bold text-slate-700">Tải lên file nén mã nguồn mẫu (.zip)</div>
            <div className="text-xs text-slate-400 mt-1">Hệ thống sẽ dùng JSZip giải nén và cho phép đọc mã nguồn từng file bên trong</div>
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleZipUpload(f);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
};
