'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileCode,
  Layers,
  Terminal,
  Clock,
  CheckCircle2,
  Edit3,
  Copy,
  Check,
  Code2,
  FileText,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment, TestCase, RationaleTag } from '../types/assignment.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ExamDetailViewProps {
  examId: string;
}

export const ExamDetailView: React.FC<ExamDetailViewProps> = ({ examId }) => {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'testcases' | 'overview' | 'solution'>('testcases');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchExamDetail = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getAssignmentById(examId);
      if (!data) {
        setError('Không tìm thấy thông tin đề thi trong hệ thống.');
      } else {
        setAssignment(data);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết đề thi:', err);
      setError(err?.response?.data?.message || 'Không thể tải chi tiết đề thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) {
      fetchExamDetail();
    }
  }, [examId, fetchExamDetail]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Đang tải dữ liệu đề thi PE...</h3>
        <p className="text-xs text-slate-400 mt-1">Hệ thống đang truy vấn thông tin đề bài và bộ testcase tự động</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 font-sans text-center">
        <Card className="rounded-3xl border-slate-200 p-8 shadow-2xs bg-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-900">Không thể hiển thị đề thi</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">{error || 'Không tìm thấy dữ liệu đề thi tương ứng.'}</p>
          <Button asChild className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Link href="/exam-bank">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Quay lại Ngân hàng đề thi</span>
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const testCases = assignment.testCases || [];
  const solutions = assignment.solutions || [];
  const isJava = assignment.environment === 'JAVA_JDK';
  const isPublished = assignment.status === 'PUBLISHED';
  const totalPoints = testCases.reduce((sum, tc) => sum + (tc.points || 0), 0);
  const hiddenCount = testCases.filter((tc) => tc.isHidden).length;
  const publicCount = testCases.length - hiddenCount;

  const filteredTestCases = testCases.filter((tc) => {
    if (selectedTagFilter === 'ALL') return true;
    return tc.rationaleTag === selectedTagFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-20">
      {/* 1. TOP BREADCRUMB & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button asChild variant="ghost" className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white w-fit shadow-2xs border border-slate-200/60">
          <Link href="/exam-bank">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại Ngân hàng đề thi</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs">
            <Link href={`/exam-bank/create?editId=${assignment.id}`}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              <span>Chỉnh sửa trong Wizard</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Link href="/live-proctoring">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Vào giám sát ca thi</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. EXAM HEADER BANNER */}
      <Card className="rounded-3xl border-slate-200 shadow-2xs p-6 md:p-8 bg-white space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200">
            {assignment.course?.code || 'PE EXAM'}
          </Badge>
          <Badge variant="secondary" className="text-xs font-bold">
            {isJava ? 'Java JDK 21' : 'C GCC 11'}
          </Badge>
          <Badge
            variant={isPublished ? 'default' : 'secondary'}
            className={
              isPublished
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs'
                : 'bg-slate-100 text-slate-700 font-bold text-xs'
            }
          >
            {isPublished ? '● ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
          </Badge>
          {assignment.course && (
            <span className="text-xs text-slate-500 font-medium">
              {assignment.course.name} • {assignment.course.semester}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {assignment.title}
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
            {assignment.description || 'Đề thi thực hành kết thúc học phần, kiểm tra tư duy thuật toán và kỹ năng lập trình sinh viên.'}
          </p>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Thời lượng làm bài</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>120 phút</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Quy mô Testcase</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{testCases.length} Testcases • {totalPoints.toFixed(1)} pts</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Môi trường Chấm</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-600" />
              <span>Docker Sandbox {isJava ? 'Java' : 'C'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Hình thức nộp bài</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-600" />
              <span>Cá nhân (ZIP / Source)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. NAVIGATION TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs flex items-center gap-2">
        <Button
          variant={activeTab === 'testcases' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('testcases')}
          className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'testcases' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bộ Testcase Tự Động ({testCases.length})</span>
        </Button>

        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'overview' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Thông Tin Đề & Starter Code</span>
        </Button>

        <Button
          variant={activeTab === 'solution' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('solution')}
          className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'solution' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Bài Giải Mẫu & Chuẩn RAG ({solutions.length})</span>
        </Button>
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: TESTCASES FULL PAGE VIEW */}
      {activeTab === 'testcases' && (
        <div className="space-y-6">
          {/* Summary Strip & Rationale Tag Filters */}
          <Card className="rounded-2xl border-slate-200 shadow-2xs p-4 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Công khai cho SV: <strong>{publicCount} testcases</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Testcase ẩn (Hidden): <strong>{hiddenCount} testcases</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
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
                  onClick={() => setSelectedTagFilter(tag)}
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
                const inputContent = tc.comparisonMode === 'FILE_TO_FILE' ? tc.inputFileContent || '' : tc.stdinInput || '';
                const expectedContent = tc.comparisonMode === 'FILE_TO_FILE' ? tc.expectedFileContent || '' : tc.expectedStdout || '';
                const inputKey = `input-${tc.id || index}`;
                const expectedKey = `expected-${tc.id || index}`;

                return (
                  <Card
                    key={tc.id || index}
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
                            onClick={() => handleCopy(inputContent, inputKey)}
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
                            onClick={() => handleCopy(expectedContent, expectedKey)}
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
      )}

      {/* TAB 2: OVERVIEW & STARTER CODE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Yêu Cầu Đề Bài & Hướng Dẫn Kỹ Thuật</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                <strong>Quy định chung cho sinh viên:</strong> Thí sinh đọc kỹ đề bài trên giao diện Kiosk của phòng thi.
                Không sử dụng tài liệu ngoài và không kết nối Internet ngoài phạm vi Sandbox.
              </p>
              <p>
                <strong>Môi trường thực thi:</strong> Hệ thống tự động biên dịch trên nền tảng{' '}
                <code>{isJava ? 'Java JDK 21 (javac)' : 'C GCC 11 (gcc -O2)'}</code>.
                Mỗi lần nộp thử sẽ chạy qua Docker Sandbox để trả kết quả ngay cho thí sinh.
              </p>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-600" />
                <span>Khung Mã Nguồn Khởi Tạo Cho Sinh Viên (Starter Code)</span>
              </h3>
              {assignment.starterCodePath && (
                <span className="text-xs font-mono text-slate-400">
                  Tệp: {assignment.starterCodePath}
                </span>
              )}
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[400px] border border-slate-800 leading-relaxed">
              {isJava
                ? `// Khung mã nguồn phát cho sinh viên Java OOP (PRO192 / CSD201)
public interface ICar {
    public int f1(List<Car> t);
    public void f2(List<Car> t);
    public void f3(List<Car> t);
}

public class MyCar implements ICar {
    @Override
    public int f1(List<Car> t) {
        // Sinh viên hoàn thiện code câu 1 ở đây
        return 0;
    }

    @Override
    public void f2(List<Car> t) {
        // Sinh viên hoàn thiện code câu 2 ở đây
    }

    @Override
    public void f3(List<Car> t) {
        // Sinh viên hoàn thiện code câu 3 ở đây
    }
}`
                : `// Khung mã nguồn phát cho sinh viên môn C (PRF192)
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main() {
    // Nhập dữ liệu từ bàn phím hoặc file theo yêu cầu đề bài
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Sinh viên viết thuật toán xử lý tại đây

    return 0;
}`}
            </pre>
          </Card>
        </div>
      )}

      {/* TAB 3: SOLUTIONS & RAG GROUND-TRUTH */}
      {activeTab === 'solution' && (
        <div className="space-y-6">
          {solutions.length === 0 ? (
            <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs shadow-2xs bg-white">
              Đề thi này chưa có bài giải mẫu lưu trữ. Bạn có thể bấm vào nút &quot;Chỉnh sửa trong Wizard&quot; để bổ sung bài giải.
            </Card>
          ) : (
            solutions.map((sol, idx) => (
              <Card key={sol.id || idx} className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{sol.title || 'Bài Giải Mẫu Chuẩn Của Giảng Viên'}</h3>
                      <span className="text-[11px] text-slate-400">Tri thức chuẩn phục vụ chấm tự động & đối chiếu RAG</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(sol.sourceCode, `solution-${idx}`)}
                    className="h-8 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  >
                    {copiedKey === `solution-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span className="text-emerald-600">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Sao chép mã nguồn</span>
                      </>
                    )}
                  </Button>
                </div>

                {sol.explanation && (
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-purple-800">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Giải Thích Thuật Toán & Chuẩn Độ Phức Tạp (RAG Ground-Truth):</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{sol.explanation}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mã nguồn chuẩn của Giảng viên:</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                    {sol.sourceCode}
                  </pre>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
