'use client';

import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { studentService, getStudentServiceErrorMessage } from '../services/student.service';
import type { StudentExamViewModel } from '../types/student.types';

export type SubmissionChannel = 'ZIP_UPLOAD' | 'GIT_COMMIT';

export function useSubmitExamForm(exam: StudentExamViewModel | null, onClose: () => void) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userChannel, setUserChannel] = useState<SubmissionChannel | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitCommitHash, setGitCommitHash] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmissionId, setSuccessSubmissionId] = useState<string | null>(null);

  const assignment = exam?.assignment;
  const course = exam?.course;

  const allowZip = assignment?.allowZipSubmission !== false;
  const allowGit = Boolean(assignment?.allowGitSubmission ?? true);

  const defaultChannel: SubmissionChannel = !allowZip && allowGit ? 'GIT_COMMIT' : 'ZIP_UPLOAD';
  const channel = userChannel ?? defaultChannel;

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('Hệ thống yêu cầu nộp file nén định dạng .zip');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Dung lượng file .zip vượt quá giới hạn 50MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setGitRepoUrl('');
    setGitCommitHash('');
    setPaperCode('');
    setErrorMessage(null);
    setSuccessSubmissionId(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignment) return;
    setErrorMessage(null);

    if (channel === 'ZIP_UPLOAD' && !selectedFile) {
      setErrorMessage('Vui lòng chọn hoặc tải lên file mã nguồn (.zip) bài làm.');
      return;
    }

    if (channel === 'GIT_COMMIT' && !gitRepoUrl.trim()) {
      setErrorMessage('Vui lòng nhập đường dẫn GitHub Repository hợp lệ.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('assignmentId', assignment.id);
      formData.append('submissionChannel', channel);

      if (paperCode.trim()) {
        formData.append('paperCode', paperCode.trim());
      }

      if (channel === 'ZIP_UPLOAD' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (channel === 'GIT_COMMIT') {
        formData.append('gitRepoUrl', gitRepoUrl.trim());
        if (gitCommitHash.trim()) {
          formData.append('gitCommitHash', gitCommitHash.trim());
        }
      }

      const result = await studentService.submitAssignment(formData);
      setSuccessSubmissionId(result.id);

      setTimeout(() => {
        handleReset();
        router.push(`/student/results?submissionId=${encodeURIComponent(result.id)}`);
      }, 1200);
    } catch (err) {
      setErrorMessage(getStudentServiceErrorMessage(err, 'Nộp bài thất bại. Vui lòng kiểm tra lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting || (channel === 'ZIP_UPLOAD' ? !selectedFile : !gitRepoUrl.trim());

  return {
    assignment,
    course,
    channel,
    setChannel: setUserChannel,
    allowZip,
    allowGit,
    fileInputRef,
    selectedFile,
    setSelectedFile,
    gitRepoUrl,
    setGitRepoUrl,
    gitCommitHash,
    setGitCommitHash,
    paperCode,
    setPaperCode,
    isDragging,
    isSubmitting,
    isSubmitDisabled,
    errorMessage,
    setErrorMessage,
    successSubmissionId,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    handleReset,
  };
}
