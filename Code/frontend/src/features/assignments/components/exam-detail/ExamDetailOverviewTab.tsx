'use client';

import React from 'react';
import { FileText, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Assignment } from '../../types/assignment.types';

interface ExamDetailOverviewTabProps {
  assignment: Assignment;
}

export const ExamDetailOverviewTab: React.FC<ExamDetailOverviewTabProps> = ({ assignment }) => {
  const isJava = assignment.environment === 'JAVA_JDK';

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <FileText className="size-5 text-indigo-600" />
          <span>Yêu Cầu Đề Bài & Hướng Dẫn Kỹ Thuật</span>
        </h3>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Quy định chung cho sinh viên:</strong> Sinh viên xem PDF và làm bài trên IDE cá nhân theo hướng dẫn của giảng viên.
            Nội dung này dùng để mô tả yêu cầu; hệ thống không khóa thiết bị cá nhân.
          </p>
          <p>
            <strong>Môi trường thực thi:</strong> Hệ thống tự động biên dịch trên nền tảng{' '}
            <code>{isJava ? 'Java JDK 21 (javac)' : 'C GCC 11 (gcc -O2)'}</code>.
            Bài nộp được xử lý qua Docker Sandbox theo cấu hình chấm của đề.
          </p>
        </div>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileCode className="size-5 text-purple-600" />
            <span>Khung Mã Nguồn Khởi Tạo Cho Sinh Viên (Starter Code)</span>
          </h3>
          {assignment.starterCodePath && (
            <span className="text-xs font-mono text-slate-400">
              Tệp: {assignment.starterCodePath}
            </span>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[400px] border border-slate-800 leading-relaxed">
          {assignment.environment === 'JAVA_JDK'
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
            : assignment.environment === 'REACT_JS'
            ? `// Khung mã nguồn phát cho sinh viên React.js (Frontend UI)
import React, { useState } from 'react';

export default function App() {
    // Sinh viên phát triển component và xử lý state tại đây
    return (
        <main className="container mx-auto p-4">
            <h1 className="text-xl font-bold">AITA Practical Exam</h1>
        </main>
    );
}`
            : `// Khung mã nguồn phát cho sinh viên môn C / C++ (PRF192)
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
  );
};
