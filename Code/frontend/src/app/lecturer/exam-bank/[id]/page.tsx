import React from 'react';
import { ExamDetailView } from '@/features/assignments/components/ExamDetailView';

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = await params;
  return <ExamDetailView examId={id} />;
}
