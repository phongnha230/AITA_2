'use client';

import { useState } from 'react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { Button } from '../ui/Button';
import { FormField, inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import type { UserRole } from '../../types/admin.types';
import { ROLES } from './user-style';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' as UserRole });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminUserService.create({ ...form, password: form.password || undefined });
      setForm({ fullName: '', email: '', password: '', role: 'STUDENT' });
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được tài khoản.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Tạo tài khoản mới" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        {error && <AlertBox message={error} />}
        <FormField label="Họ và tên">
          <input required minLength={2} value={form.fullName} onChange={set('fullName')} className={inputClass} placeholder="Nguyễn Văn A" />
        </FormField>
        <FormField label="Email FPT">
          <input required type="email" value={form.email} onChange={set('email')} className={inputClass} placeholder="anvhe123456@fpt.edu.vn" />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Vai trò">
            <select value={form.role} onChange={set('role')} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Mật khẩu" hint="Để trống để dùng mật khẩu mặc định.">
            <input type="password" minLength={6} value={form.password} onChange={set('password')} className={inputClass} placeholder="••••••" />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
