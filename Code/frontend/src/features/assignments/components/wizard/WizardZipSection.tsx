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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            2. Khung Mã Nguồn Mẫu (Starter / Template Code ZIP)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Click vào tệp bất kỳ bên dưới để xem nội dung code</span>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
        {starterZipFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                  ZIP
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{starterZipFile.name}</div>
                  <div className="text-[11px] text-slate-400">{starterZipFile.size} • Bộ khung code mẫu đã nạp</div>
                </div>
              </div>
              {existingStarterDownloadUrl && (
                <a href={existingStarterDownloadUrl} className="text-xs font-semibold text-indigo-700 hover:underline" download>
                  Tải ZIP đã lưu
                </a>
              )}
              <button
                type="button"
                aria-label="Xóa bộ khung starter ZIP"
                onClick={() => {
                  onRemoveStarter();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {macJunkDetected && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hệ thống đã tự động lọc bỏ các tệp rác hệ điều hành (__MACOSX, .DS_Store) theo đúng quy chuẩn khảo thí FPT.</span>
              </div>
            )}

            <div className="p-3 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cấu trúc tệp tin đọc từ file ZIP ({zipEntries.length} tệp):</span>
                </div>
                {isReadingZip && <span className="text-amber-400 animate-pulse font-sans">Đang giải nén đọc file...</span>}
              </div>

              <div className="space-y-1 text-[11px] max-h-52 overflow-y-auto pr-1">
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
                          <span className="text-[10px] text-blue-400 font-sans flex items-center gap-1 shrink-0 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                            <Eye className="w-3 h-3" /> Xem code
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
          <label className="cursor-pointer block py-5 text-center hover:bg-slate-100/60 rounded-xl transition">
            <Archive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">Tải lên file nén mã nguồn mẫu (.zip)</div>
            <div className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ dùng JSZip giải nén và cho phép đọc mã nguồn từng file bên trong</div>
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
