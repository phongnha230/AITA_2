import { LecturerDashboard } from '@/features/courses/components/LecturerDashboard';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  return <LecturerDashboard initialCourseId={id} />;
}
