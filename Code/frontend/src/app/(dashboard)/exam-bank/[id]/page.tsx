import React from 'react';
import { ExamDetailView } from '@/features/assignments/components/ExamDetailView';

interface ExamDetailPageProps {
  params: { id: string };
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  return <ExamDetailView examId={params.id} />;
}
