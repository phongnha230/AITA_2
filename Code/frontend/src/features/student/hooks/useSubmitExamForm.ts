'use client';

import { useEffect, useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { studentService, getStudentServiceErrorMessage } from '../services/student.service';
import type { StudentExamViewModel } from '../types/student.types';
import { teamService } from '../../teams/services/team.service';
import { authService } from '../../auth/services/auth.service';
import type { Team } from '../../teams/types/team.types';

export type SubmissionChannel = 'ZIP_UPLOAD' | 'GIT_COMMIT';

function validateIndividualSubmission({
  environment, channel, selectedFile, gitRepoUrl, deployedUrl,
}: {
  environment: StudentExamViewModel['assignment']['environment'];
  channel: SubmissionChannel;
  selectedFile: File | null;
  gitRepoUrl: string;
  deployedUrl: string;
}): string | null {
  if (channel === 'ZIP_UPLOAD' && !selectedFile) return 'Vui lòng chọn hoặc tải lên file mã nguồn (.zip) bài làm.';
  if (channel === 'GIT_COMMIT' && !gitRepoUrl.trim()) return 'Vui lòng nhập đường dẫn GitHub Repository hợp lệ.';
  if (environment === 'REACT_JS' && !deployedUrl.trim()) return 'Bài React bắt buộc có URL deploy HTTPS công khai.';
  return null;
}

function createSubmissionFormData({
  assignment, channel, selectedFile, gitRepoUrl, gitCommitHash, deployedUrl, paperCode,
}: {
  assignment: NonNullable<StudentExamViewModel['assignment']>;
  channel: SubmissionChannel;
  selectedFile: File | null;
  gitRepoUrl: string;
  gitCommitHash: string;
  deployedUrl: string;
  paperCode: string;
}): FormData {
  const formData = new FormData();
  formData.append('assignmentId', assignment.id);
  formData.append('submissionChannel', channel);
  if (assignment.environment === 'REACT_JS') formData.append('deployedUrl', deployedUrl.trim());
  if (paperCode.trim()) formData.append('paperCode', paperCode.trim());
  if (channel === 'ZIP_UPLOAD' && selectedFile) formData.append('file', selectedFile);
  if (channel === 'GIT_COMMIT') {
    formData.append('gitRepoUrl', gitRepoUrl.trim());
    if (gitCommitHash.trim()) formData.append('gitCommitHash', gitCommitHash.trim());
  }
  return formData;
}

function createSubmitHandler({
  assignment, groupTeam, channel, selectedFile, gitRepoUrl, gitCommitHash, deployedUrl, paperCode, router, handleReset,
  setErrorMessage, setIsSubmitting, setSuccessSubmissionId,
}: {
  assignment: StudentExamViewModel['assignment'] | undefined;
  groupTeam: Team | null;
  channel: SubmissionChannel;
  selectedFile: File | null;
  gitRepoUrl: string;
  gitCommitHash: string;
  deployedUrl: string;
  paperCode: string;
  router: ReturnType<typeof useRouter>;
  handleReset: () => void;
  setErrorMessage: (value: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  setSuccessSubmissionId: (value: string | null) => void;
}) {
  return async (event: FormEvent) => {
    event.preventDefault();
    if (!assignment) return;
    setErrorMessage(null);

    if (assignment.submissionType === 'GROUP') {
      const currentUserId = authService.getStoredUser()?.id;
      if (!groupTeam) return setErrorMessage('Bạn chưa thuộc nhóm nào trong môn học này.');
      if (groupTeam.leaderId !== currentUserId) return setErrorMessage('Chỉ Leader của nhóm mới được nộp Final Project.');
      try {
        setIsSubmitting(true);
        const result = await teamService.submitForAssignment(assignment.id, { teamId: groupTeam.id, gitCommitHash: gitCommitHash.trim() || undefined });
        setSuccessSubmissionId(result.id);
        setTimeout(() => { handleReset(); router.push(`/student/results?submissionId=${encodeURIComponent(result.id)}`); }, 1200);
      } catch (error: unknown) {
        console.error('Nộp bài nhóm thất bại:', error);
        setErrorMessage(getStudentServiceErrorMessage(error, 'Nộp bài nhóm thất bại.'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const validationError = validateIndividualSubmission({ environment: assignment.environment, channel, selectedFile, gitRepoUrl, deployedUrl });
    if (validationError) return setErrorMessage(validationError);
    try {
      setIsSubmitting(true);
      const formData = createSubmissionFormData({ assignment, channel, selectedFile, gitRepoUrl, gitCommitHash, deployedUrl, paperCode });
      const result = await studentService.submitAssignment(formData);
      setSuccessSubmissionId(result.id);
      setTimeout(() => { handleReset(); router.push(`/student/results?submissionId=${encodeURIComponent(result.id)}`); }, 1200);
    } catch (error: unknown) {
      console.error('Nộp bài thất bại:', error);
      setErrorMessage(getStudentServiceErrorMessage(error, 'Nộp bài thất bại. Vui lòng kiểm tra lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };
}

function useGroupTeam(assignment: StudentExamViewModel['assignment'] | undefined) {
  const [groupTeam, setGroupTeam] = useState<Team | null>(null);
  const [loadingGroupTeam, setLoadingGroupTeam] = useState(false);
  useEffect(() => {
    if (!assignment || assignment.submissionType !== 'GROUP') {
      setGroupTeam(null);
      setLoadingGroupTeam(false);
      return;
    }
    let active = true;
    setLoadingGroupTeam(true);
    const currentUserId = authService.getStoredUser()?.id;
    teamService.getCourseTeams(assignment.courseId)
      .then((teams) => {
        if (active) setGroupTeam(teams.find((team) => team.members?.some((member) => member.userId === currentUserId)) ?? null);
      })
      .catch((error: unknown) => {
        console.error('Không tải được danh sách nhóm để nộp bài:', error);
        if (active) setGroupTeam(null);
      })
      .finally(() => { if (active) setLoadingGroupTeam(false); });
    return () => { active = false; };
  }, [assignment]);
  return { groupTeam, loadingGroupTeam };
}

function useSubmissionFile(setErrorMessage: (value: string | null) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };
  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return {
    fileInputRef,
    selectedFile,
    setSelectedFile,
    isDragging,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

function getSubmissionOptions({
  assignment,
  userChannel,
  selectedFile,
  gitRepoUrl,
  deployedUrl,
  isSubmitting,
  loadingGroupTeam,
  groupTeam,
}: {
  assignment: StudentExamViewModel['assignment'] | undefined;
  userChannel: SubmissionChannel | null;
  selectedFile: File | null;
  gitRepoUrl: string;
  deployedUrl: string;
  isSubmitting: boolean;
  loadingGroupTeam: boolean;
  groupTeam: Team | null;
}) {
  const allowZip = assignment?.allowZipSubmission !== false;
  const allowGit = Boolean(assignment?.allowGitSubmission ?? true);
  const canSubmit = assignment?.submissionType === 'GROUP' ? allowGit : allowGit || allowZip;
  const defaultChannel: SubmissionChannel = !allowZip && allowGit ? 'GIT_COMMIT' : 'ZIP_UPLOAD';
  const channel = userChannel ?? defaultChannel;
  const isSubmitDisabled = isSubmitting || !canSubmit || loadingGroupTeam || (
    assignment?.submissionType === 'GROUP'
      ? !groupTeam || !groupTeam.gitRepoUrl || !groupTeam.deployedUrl
      : (channel === 'ZIP_UPLOAD' ? !selectedFile : !gitRepoUrl.trim())
        || (assignment?.environment === 'REACT_JS' && !deployedUrl.trim())
  );
  return { allowZip, allowGit, canSubmit, channel, isSubmitDisabled };
}

export function useSubmitExamForm(exam: StudentExamViewModel | null, onClose: () => void) {
  const router = useRouter();

  const [userChannel, setUserChannel] = useState<SubmissionChannel | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitCommitHash, setGitCommitHash] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmissionId, setSuccessSubmissionId] = useState<string | null>(null);
  const assignment = exam?.assignment;
  const course = exam?.course;
  const { groupTeam, loadingGroupTeam } = useGroupTeam(assignment);
  const {
    fileInputRef,
    selectedFile,
    setSelectedFile,
    isDragging,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useSubmissionFile(setErrorMessage);

  const { allowZip, allowGit, canSubmit, channel, isSubmitDisabled } = getSubmissionOptions({
    assignment,
    userChannel,
    selectedFile,
    gitRepoUrl,
    deployedUrl,
    isSubmitting,
    loadingGroupTeam,
    groupTeam,
  });

  const handleReset = () => {
    setSelectedFile(null);
    setGitRepoUrl('');
    setGitCommitHash('');
    setDeployedUrl('');
    setPaperCode('');
    setErrorMessage(null);
    setSuccessSubmissionId(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = createSubmitHandler({ assignment, groupTeam, channel, selectedFile, gitRepoUrl, gitCommitHash, deployedUrl, paperCode, router, handleReset, setErrorMessage, setIsSubmitting, setSuccessSubmissionId });

  return {
    assignment,
    course,
    channel,
    setChannel: setUserChannel,
    allowZip,
    allowGit,
    canSubmit,
    fileInputRef,
    selectedFile,
    setSelectedFile,
    gitRepoUrl,
    setGitRepoUrl,
    gitCommitHash,
    setGitCommitHash,
    deployedUrl,
    setDeployedUrl,
    paperCode,
    setPaperCode,
    isDragging,
    isSubmitting,
    isSubmitDisabled,
    errorMessage,
    setErrorMessage,
    successSubmissionId,
    groupTeam,
    loadingGroupTeam,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    handleReset,
  };
}
