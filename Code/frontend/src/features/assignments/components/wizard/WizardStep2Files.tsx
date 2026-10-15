import React from 'react';
import { WizardPdfSection } from './WizardPdfSection';
import { WizardZipSection } from './WizardZipSection';
import { WizardNavFooter } from './WizardNavFooter';

interface WizardStep2FilesProps {
  pdfFile: { name: string; size: string } | null;
  setPdfFile: (f: { name: string; size: string } | null) => void;
  pdfBlobUrl: string | null;
  setPdfBlobUrl: (url: string | null) => void;
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
  starterZipFile: { name: string; size: string } | null;
  setStarterZipFile: (f: { name: string; size: string } | null) => void;
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
  setPdfFile,
  pdfBlobUrl,
  setPdfBlobUrl,
  showPdfPreview,
  setShowPdfPreview,
  starterZipFile,
  setStarterZipFile,
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
      <WizardPdfSection
        pdfFile={pdfFile}
        setPdfFile={setPdfFile}
        pdfBlobUrl={pdfBlobUrl}
        setPdfBlobUrl={setPdfBlobUrl}
        showPdfPreview={showPdfPreview}
        setShowPdfPreview={setShowPdfPreview}
      />

      <WizardZipSection
        starterZipFile={starterZipFile}
        setStarterZipFile={setStarterZipFile}
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
