import { Suspense } from 'react';
import { CreateExamWizard } from '@/features/assignments/components/CreateExamWizard';

export default function CreateExamPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Đang tải biểu mẫu đề thi...</div>}>
      <CreateExamWizard />
    </Suspense>
  );
}

