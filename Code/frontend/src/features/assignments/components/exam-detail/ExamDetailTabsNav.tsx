'use client';

import React from 'react';
import { Layers, FileText, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamDetailTabsNavProps {
  activeTab: 'testcases' | 'overview' | 'solution';
  onSelectTab: (tab: 'testcases' | 'overview' | 'solution') => void;
  testCasesCount: number;
  solutionsCount: number;
}

export const ExamDetailTabsNav: React.FC<ExamDetailTabsNavProps> = ({
  activeTab,
  onSelectTab,
  testCasesCount,
  solutionsCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center gap-2">
      <Button
        variant={activeTab === 'testcases' ? 'default' : 'ghost'}
        onClick={() => onSelectTab('testcases')}
        className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
          activeTab === 'testcases'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Layers className="size-4" />
        <span>Bộ Testcase Tự Động ({testCasesCount})</span>
      </Button>

      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        onClick={() => onSelectTab('overview')}
        className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
          activeTab === 'overview'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <FileText className="size-4" />
        <span>Thông Tin Đề & Starter Code</span>
      </Button>

      <Button
        variant={activeTab === 'solution' ? 'default' : 'ghost'}
        onClick={() => onSelectTab('solution')}
        className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
          activeTab === 'solution'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Code2 className="size-4" />
        <span>Bài Giải Mẫu & Chuẩn RAG ({solutionsCount})</span>
      </Button>
    </div>
  );
};
