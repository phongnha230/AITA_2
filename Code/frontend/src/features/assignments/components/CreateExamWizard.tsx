'use client';

import React from 'react';
import { WizardHeader } from './wizard/WizardHeader';
import { WizardStepper } from './wizard/WizardStepper';
import { WizardStep1General } from './wizard/WizardStep1General';
import { WizardStep2Files } from './wizard/WizardStep2Files';
import { WizardStep3Solution } from './wizard/WizardStep3Solution';
import { WizardStep4Review } from './wizard/WizardStep4Review';
import { ZipFilePreviewModal } from './wizard/ZipFilePreviewModal';
import { TestcaseImportModal } from './wizard/TestcaseImportModal';
import { useCreateExamWizard } from '../hooks/useCreateExamWizard';

export const CreateExamWizard: React.FC = () => {
  const wizard = useCreateExamWizard();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      <WizardHeader
        flowType={wizard.flowType}
        editId={wizard.editId}
        loadingEdit={wizard.loadingEdit}
        title={wizard.title}
        environment={wizard.environment}
        onLoadSamplePrf192={wizard.handleLoadSamplePrf192}
        onLoadSamplePro192={wizard.handleLoadSamplePro192}
        onLoadSampleCsd201={wizard.handleLoadSampleCsd201}
        submitSuccess={wizard.submitSuccess}
        submitError={wizard.submitError}
      />

      <WizardStepper
        activeStep={wizard.activeStep}
        setActiveStep={wizard.setActiveStep}
        canNavigateToStep={wizard.canNavigateToStep}
      />

      {wizard.navigationError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {wizard.navigationError}
        </div>
      )}

      {/* BƯỚC 1: THÔNG TIN CHUNG & CẤU HÌNH CA THI */}
      {wizard.activeStep === 1 && (
        <WizardStep1General
          courseId={wizard.courseId}
          flowType={wizard.flowType}
          courseLoadError={wizard.courseLoadError}
          setCourseId={wizard.setCourseId}
          courses={wizard.courses}
          environment={wizard.environment}
          setEnvironment={wizard.setEnvironment}
          submissionType={wizard.submissionType}
          setSubmissionType={wizard.setSubmissionType}
          title={wizard.title}
          setTitle={wizard.setTitle}
          description={wizard.description}
          setDescription={wizard.setDescription}
          startTime={wizard.startTime}
          setStartTime={wizard.setStartTime}
          durationMinutes={wizard.durationMinutes}
          setDurationMinutes={wizard.setDurationMinutes}
          accessCode={wizard.accessCode}
          setAccessCode={wizard.setAccessCode}
          onNext={() => wizard.setActiveStep(2)}
        />
      )}


      {/* BƯỚC 2: FILE PDF & STARTER CODE ZIP */}
      {wizard.activeStep === 2 && (
        <WizardStep2Files
          pdfFile={wizard.pdfFile}
          onSelectPdf={wizard.handlePdfUpload}
          onRemovePdf={wizard.handleRemovePdf}
          existingPdfDownloadUrl={wizard.editId && wizard.existingPdfPath ? wizard.pdfDownloadUrl : null}
          pdfBlobUrl={wizard.pdfBlobUrl}
          setPdfBlobUrl={wizard.setPdfBlobUrl}
          showPdfPreview={wizard.showPdfPreview}
          setShowPdfPreview={wizard.setShowPdfPreview}
          starterZipFile={wizard.starterZipFile}
          onRemoveStarter={wizard.handleRemoveStarter}
          existingStarterDownloadUrl={wizard.editId && wizard.existingStarterPath ? wizard.starterDownloadUrl : null}
          zipEntries={wizard.zipEntries}
          setZipEntries={wizard.setZipEntries}
          zipFilesContent={wizard.zipFilesContent}
          setZipFilesContent={wizard.setZipFilesContent}
          isReadingZip={wizard.isReadingZip}
          macJunkDetected={wizard.macJunkDetected}
          handleZipUpload={wizard.handleZipUpload}
          onViewZipFile={(entry) =>
            wizard.setViewingZipFile({
              filename: entry,
              content: wizard.zipFilesContent[entry] || '',
            })
          }
          onBack={() => wizard.setActiveStep(1)}
          onNext={() => wizard.setActiveStep(3)}
        />
      )}

      {/* BƯỚC 3: BÀI GIẢI CHUẨN & IMPORT TESTCASES */}
      {wizard.activeStep === 3 && (
        <WizardStep3Solution
          environment={wizard.environment}
          courseCode={wizard.selectedCourse?.code ?? ''}
          solutionTitle={wizard.solutionTitle}
          setSolutionTitle={wizard.setSolutionTitle}
          solutionCode={wizard.solutionCode}
          solutionZipName={wizard.solutionZipName}
          solutionFiles={wizard.solutionFiles}
          onRemoveSolutionZip={wizard.handleRemoveSolutionZip}
          expectedComplexity={wizard.expectedComplexity}
          setExpectedComplexity={wizard.setExpectedComplexity}
          expectedSpaceComplexity={wizard.expectedSpaceComplexity}
          setExpectedSpaceComplexity={wizard.setExpectedSpaceComplexity}
          acceptedStrategiesText={wizard.acceptedStrategiesText}
          setAcceptedStrategiesText={wizard.setAcceptedStrategiesText}
          algorithmNotes={wizard.algorithmNotes}
          setAlgorithmNotes={wizard.setAlgorithmNotes}
          reactStructureRequirements={wizard.reactStructureRequirements}
          setReactStructureRequirements={wizard.setReactStructureRequirements}
          reactCleanCodeRequirements={wizard.reactCleanCodeRequirements}
          setReactCleanCodeRequirements={wizard.setReactCleanCodeRequirements}
          handleSolutionFileUpload={wizard.handleSolutionFileUpload}
          testCases={wizard.testCases}
          setTestCases={wizard.setTestCases}
          onAddBlankTestCase={wizard.handleAddBlankTestCase}
          onOpenImportModal={wizard.testcaseImport.openModal}
          onDeleteTestCase={wizard.handleDeleteTestCase}
          onBack={() => wizard.setActiveStep(2)}
          onNext={() => wizard.setActiveStep(4)}
        />
      )}

      {/* BƯỚC 4: TỔNG QUAN, DRY RUN & LƯU CƠ SỞ DỮ LIỆU */}
      {wizard.activeStep === 4 && (
        <WizardStep4Review
          selectedCourse={wizard.selectedCourse}
          environment={wizard.environment}
          testCases={wizard.testCases}
          totalPoints={wizard.totalPoints}
          durationMinutes={wizard.durationMinutes}
          title={wizard.title}
          description={wizard.description}
          gradingApprovalMode={wizard.gradingApprovalMode}
          onGradingApprovalModeChange={wizard.setGradingApprovalMode}
          dryRunRunning={wizard.dryRunRunning}
          dryRunResult={wizard.dryRunResult}
          dryRunError={wizard.dryRunError}
          onDryRun={wizard.handleDryRun}
          isSubmitting={wizard.isSubmitting}
          onSaveToDatabase={wizard.handleSaveToDatabase}
          onBack={() => wizard.setActiveStep(3)}
        />
      )}

      {/* MODAL 1: XEM NỘI DUNG TỆP TRONG FILE ZIP */}
      <ZipFilePreviewModal
        viewingZipFile={wizard.viewingZipFile}
        onClose={() => wizard.setViewingZipFile(null)}
      />

      {/* MODAL 2: IMPORT TESTCASE VỚI BẢNG XEM TRƯỚC (PREVIEW TABLE) */}
      {wizard.environment !== 'REACT_JS' && (
        <TestcaseImportModal
          isOpen={wizard.testcaseImport.importModal}
          onClose={wizard.testcaseImport.closeModal}
          importType={wizard.testcaseImport.importType}
          setImportType={wizard.testcaseImport.setImportType}
          jsonText={wizard.testcaseImport.jsonText}
          setJsonText={wizard.testcaseImport.setJsonText}
          previewTestCases={wizard.testcaseImport.previewTestCases}
          importError={wizard.testcaseImport.importError}
          onParseJson={wizard.testcaseImport.handleParseJsonForPreview}
          onParseCsv={wizard.testcaseImport.handleParseCsvForPreview}
          onConfirmImport={wizard.testcaseImport.handleConfirmImport}
        />
      )}
    </div>
  );
};
