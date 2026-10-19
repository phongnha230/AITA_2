import { LecturerSubmissionsView } from '@/features/assignments/components/LecturerSubmissionsView';

interface ExamSubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamSubmissionsPage({ params }: ExamSubmissionsPageProps) {
  const { id: assignmentId } = await params;
  return <LecturerSubmissionsView assignmentId={assignmentId} />;
}
