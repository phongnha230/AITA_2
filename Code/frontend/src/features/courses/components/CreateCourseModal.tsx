'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, AlertCircle } from 'lucide-react';
import { CreateCoursePayload } from '../types/course.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCoursePayload) => Promise<any>;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('Fall 2026');
  const [capacity, setCapacity] = useState(40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Vui lòng nhập đầy đủ Mã môn học và Tên khóa học');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        semester: semester.trim(),
        capacity: Number(capacity) || 40,
      });
      // Reset form
      setCode('');
      setName('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tạo khóa học');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 bg-white border border-slate-100 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 text-left pb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-slate-900">
              Tạo Khóa Học Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Khai báo thông tin lớp học cho kỳ mới
            </DialogDescription>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5 px-3 rounded-xl bg-rose-50 border-rose-200 text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label htmlFor="course-code" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mã Môn Học (Course Code)
            </label>
            <Input
              id="course-code"
              type="text"
              placeholder="VD: SWD392, PRN211..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold font-mono focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="course-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên Khóa Học
            </label>
            <Input
              id="course-name"
              type="text"
              placeholder="VD: Kiến Trúc & Thiết Kế Phần Mềm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-medium focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="course-semester" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Học Kỳ
              </label>
              <select
                id="course-semester"
                aria-label="Chọn học kỳ"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="Fall 2026">Fall 2026</option>
                <option value="Summer 2026">Summer 2026</option>
                <option value="Spring 2026">Spring 2026</option>
              </select>
            </div>
            <div>
              <label htmlFor="course-capacity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sĩ Số Tối Đa
              </label>
              <Input
                id="course-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={5}
                max={150}
                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold font-mono focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border-none"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Đang tạo...' : 'Tạo Khóa Học'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
