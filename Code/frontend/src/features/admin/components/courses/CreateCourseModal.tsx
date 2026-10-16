'use client';

import * as React from 'react';
import type { CreateCoursePayload } from '@/features/courses/types/course.types';
import type { AdminUser } from '../../types/admin.types';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/Button';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  form: CreateCoursePayload;
  onChangeForm: (form: CreateCoursePayload) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isEditing?: boolean;
  isActive?: boolean;
  onChangeIsActive?: (value: boolean) => void;
  lecturers: AdminUser[];
  lecturerId: string;
  onChangeLecturerId: (value: string) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  open,
  onClose,
  form,
  onChangeForm,
  onSubmit,
  submitting,
  isEditing = false,
  isActive = true,
  onChangeIsActive,
  lecturers,
  lecturerId,
  onChangeLecturerId,
}) => {
  return (
    <Modal open={open} title={isEditing ? 'Sửa khóa học' : 'Tạo Khóa Học / Lớp Học Mới'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mã môn học (Code)">
            <Input
              required
              disabled={isEditing}
              value={form.code}
              onChange={(e) => onChangeForm({ ...form, code: e.target.value })}
              placeholder="VD: PRF192, SWD392"
              className="font-mono uppercase"
            />
          </FormField>
          <FormField label="Học kỳ (Semester)">
            <Input
              required
              value={form.semester}
              onChange={(e) => onChangeForm({ ...form, semester: e.target.value })}
              placeholder="VD: Fall 2026, Spring 2027"
            />
          </FormField>
        </div>

        <FormField label="Tên môn học đầy đủ">
          <Input
            required
            value={form.name}
            onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
            placeholder="VD: Lập trình C cơ bản, Kiến trúc phần mềm"
          />
        </FormField>

        {isEditing ? (
          <FormField label="Trạng thái khóa học">
            <select value={isActive ? 'active' : 'inactive'} onChange={(event) => onChangeIsActive?.(event.target.value === 'active')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="active">Đang mở</option>
              <option value="inactive">Đã đóng</option>
            </select>
          </FormField>
        ) : null}

        {!isEditing ? <div className="grid grid-cols-2 gap-4">
          <FormField label="Giảng viên phụ trách">
            <select required value={lecturerId} onChange={(event) => onChangeLecturerId(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">Chọn giảng viên</option>
              {lecturers.map((lecturer) => <option key={lecturer.id} value={lecturer.id}>{lecturer.fullName} · {lecturer.email}</option>)}
            </select>
          </FormField>
          <FormField label="Sức chứa tối đa (Sinh viên)">
            <Input
              type="number"
              min={1}
              value={form.capacity || 40}
              onChange={(e) => onChangeForm({ ...form, capacity: Number(e.target.value) })}
            />
          </FormField>
        </div> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo khóa học'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
