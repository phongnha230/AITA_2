'use client';

import React from 'react';
import {
  Terminal,
  CheckCircle2,
  Clock,
  Cpu,
  Check,
  Copy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TestCase, RationaleTag } from '../../types/assignment.types';

interface ExamDetailTestcasesTabProps {
  testCases: TestCase[];
  selectedTagFilter: string;
  onSelectTagFilter: (tag: string) => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const ExamDetailTestcasesTab: React.FC<ExamDetailTestcasesTabProps> = ({
  testCases,
  selectedTagFilter,
  onSelectTagFilter,
  copiedKey,
  onCopy,
}) => {
  const totalPoints = testCases.reduce((sum, tc) => sum + (tc.points || 0), 0);
  const hiddenCount = testCases.filter((tc) => tc.isHidden).length;
  const publicCount = testCases.length - hiddenCount;

  const filteredTestCases = testCases.filter((tc) => {
    if (selectedTagFilter === 'ALL') return true;
    return tc.rationaleTag === selectedTagFilter;
  });

  const renderRationaleBadge = (tag: RationaleTag) => {
    switch (tag) {
      case 'FUNCTIONAL':
        return (
          <Badge variant="outline" className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
            FUNCTIONAL (Chức năng)
          </Badge>
        );
      case 'BOUNDARY':
        return (
          <Badge variant="outline" className="text-[11px] font-bold bg-purple-50 text-purple-700 border-purple-200">
            BOUNDARY (Biên)
          </Badge>
        );
      case 'EDGE':
        return (
          <Badge variant="outline" className="text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200">
            EDGE (Ngoại lệ)
          </Badge>
        );
      case 'PERFORMANCE':
        return (
          <Badge variant="outline" className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
            PERFORMANCE (Tối ưu)
          </Badge>
        );
      case 'SECURITY':
        return (
          <Badge variant="outline" className="text-[11px] font-bold bg-rose-50 text-rose-700 border-rose-200">
            SECURITY (Bảo mật)
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] font-bold">
            {tag}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Strip & Rationale Tag Filters */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-4 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Công khai cho SV: <strong>{publicCount} testcases</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Testcase ẩn (Hidden): <strong>{hiddenCount} testcases</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Tổng thang điểm: <strong>{totalPoints.toFixed(1)} / 10.0 pts</strong></span>
          </div>
        </div>

        {/* Filter by Rationale Tag */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Lọc nhãn:</span>
          {['ALL', 'FUNCTIONAL', 'BOUNDARY', 'EDGE', 'PERFORMANCE', 'SECURITY'].map((tag) => (
            <Button
              key={tag}
              variant={selectedTagFilter === tag ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onSelectTagFilter(tag)}
              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition ${
                selectedTagFilter === tag
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tag === 'ALL' ? 'Tất cả' : tag}
            </Button>
          ))}
        </div>
      </Card>

      {filteredTestCases.length === 0 ? (
        <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs shadow-2xs bg-white">
          Không có testcase nào khớp với bộ lọc nhãn này.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTestCases.map((tc, index) => {
            const inputContent =
              tc.comparisonMode === 'FILE_TO_FILE' ? tc.inputFileContent || '' : tc.stdinInput || '';
            const expectedContent =
              tc.comparisonMode === 'FILE_TO_FILE' ? tc.expectedFileContent || '' : tc.expectedStdout || '';
            const inputKey = `input-${tc.id || index}`;
            const expectedKey = `expected-${tc.id || index}`;

            return (
              <Card
                key={tc.id || tc.label || `tc_${tc.orderIndex}`}
                className="rounded-2xl border-slate-200 shadow-2xs p-5 bg-white space-y-4"
              >
                {/* Testcase Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                      #{tc.orderIndex || index + 1}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">{tc.label}</h3>
                    {renderRationaleBadge(tc.rationaleTag)}
                    {tc.isHidden ? (
                      <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200">
                        🔒 Ẩn với SV
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                        👁️ Công khai
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {tc.comparisonMode === 'FILE_TO_FILE' ? '📁 I/O File' : '⌨️ STDIO'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-500">
                      Điểm: <strong className="text-indigo-700 font-mono text-sm">{tc.points.toFixed(1)}</strong> pts
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {tc.timeLimitMs}ms
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-400" />
                      {tc.memoryLimitKb} KB
                    </span>
                  </div>
                </div>

                {/* Inputs & Expected Outputs 2-Column Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {tc.comparisonMode === 'FILE_TO_FILE'
                            ? `Tệp Input (${tc.inputFileName || 'data.txt'}):`
                            : 'Standard Input (Dữ liệu vào):'}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(inputContent, inputKey)}
                        className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                      >
                        {copiedKey === inputKey ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto min-h-[90px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                      {inputContent || '(Không có dữ liệu input)'}
                    </pre>
                  </div>

                  {/* Right: Expected Output */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {tc.comparisonMode === 'FILE_TO_FILE'
                            ? `Tệp Expected Output (${tc.expectedFileName || 'f1.txt'}):`
                            : 'Expected Stdout (Đầu ra chuẩn):'}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(expectedContent, expectedKey)}
                        className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-emerald-600"
                      >
                        {copiedKey === expectedKey ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto min-h-[90px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                      {expectedContent || '(Không có dữ liệu output)'}
                    </pre>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
