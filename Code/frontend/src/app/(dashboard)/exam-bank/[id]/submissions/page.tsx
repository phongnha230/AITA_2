'use client';

import { useParams } from 'next/navigation';
import { LecturerSubmissionsView } from '@/features/assignments/components/LecturerSubmissionsView';

export default function ExamSubmissionsPage() {
  const params = useParams();
  const assignmentId = (params?.id as string) || '';

  return <LecturerSubmissionsView assignmentId={assignmentId} />;
}
