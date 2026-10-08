'use client';

import { useParams } from 'next/navigation';
import { LecturerDashboard } from '@/features/courses/components/LecturerDashboard';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string | undefined;

  return <LecturerDashboard initialCourseId={courseId} />;
}
