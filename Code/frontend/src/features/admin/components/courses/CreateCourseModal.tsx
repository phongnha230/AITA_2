'use client';

import * as React from 'react';
import type { CreateCoursePayload } from '@/features/courses/types/course.types';
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
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  open,
  onClose,
  form,
  onChangeForm,
  onSubmit,
  submitting,
}) => {
  return (
    <Modal open={open} title="Tạo Khóa Học / Lớp Học Mới" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mã môn học (Code)">
            <Input
              required
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

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sức chứa tối đa (Sinh viên)">
            <Input
              type="number"
              min={1}
              value={form.capacity || 40}
              onChange={(e) => onChangeForm({ ...form, capacity: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Phòng máy (LAB)">
            <Input
              value={form.room || 'LAB-302'}
              onChange={(e) => onChangeForm({ ...form, room: e.target.value })}
              placeholder="VD: LAB-302, AL-L402"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo khóa học'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
