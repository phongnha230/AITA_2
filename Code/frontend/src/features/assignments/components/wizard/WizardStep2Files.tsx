import React from 'react';
import { WizardPdfSection } from './WizardPdfSection';
import { WizardZipSection } from './WizardZipSection';
import { WizardNavFooter } from './WizardNavFooter';

interface WizardStep2FilesProps {
  pdfFile: { name: string; size: string } | null;
  onSelectPdf: (file: File) => void;
  onRemovePdf: () => void;
  existingPdfDownloadUrl: string | null;
  pdfBlobUrl: string | null;
  setPdfBlobUrl: (url: string | null) => void;
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
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
  onBack: () => void;
  onNext: () => void;
}

export const WizardStep2Files: React.FC<WizardStep2FilesProps> = ({
  pdfFile,
  onSelectPdf,
  onRemovePdf,
  existingPdfDownloadUrl,
  pdfBlobUrl,
  setPdfBlobUrl,
  showPdfPreview,
  setShowPdfPreview,
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
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Role Banner clarifying Step 2 purpose */}
      <div className="flex items-center gap-3 p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-blue-900 shadow-2xs">
        <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          🎓
        </div>
        <div>
          <span className="font-bold">Tài liệu bàn giao cho Thí sinh khi mở ca thi:</span>
            <p className="text-blue-700/90 text-xs mt-0.5">
            PDF đề bài là bắt buộc. Starter ZIP là tùy chọn; nếu có, sinh viên sẽ tải được khi ca thi bắt đầu.
          </p>
        </div>
      </div>

      <WizardPdfSection
        pdfFile={pdfFile}
        onSelectPdf={onSelectPdf}
        onRemovePdf={onRemovePdf}
        existingPdfDownloadUrl={existingPdfDownloadUrl}
        pdfBlobUrl={pdfBlobUrl}
        setPdfBlobUrl={setPdfBlobUrl}
        showPdfPreview={showPdfPreview}
        setShowPdfPreview={setShowPdfPreview}
      />

      <WizardZipSection
        starterZipFile={starterZipFile}
        onRemoveStarter={onRemoveStarter}
        existingStarterDownloadUrl={existingStarterDownloadUrl}
        zipEntries={zipEntries}
        setZipEntries={setZipEntries}
        zipFilesContent={zipFilesContent}
        setZipFilesContent={setZipFilesContent}
        isReadingZip={isReadingZip}
        macJunkDetected={macJunkDetected}
        handleZipUpload={handleZipUpload}
        onViewZipFile={onViewZipFile}
      />

      <WizardNavFooter
        onBack={onBack}
        backLabel="Quay lại Bước 1"
        onNext={onNext}
        nextLabel="Tiếp tục: Bài giải chuẩn & Testcases"
      />
    </div>
  );
};
