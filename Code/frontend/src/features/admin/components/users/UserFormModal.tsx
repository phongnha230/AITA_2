'use client';

import { useState } from 'react';
import { getErrorMessage } from '../../../../lib/errors';
import { generatePassword } from '../../../../lib/password';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { Button } from '../ui/Button';
import { FormField, inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import { Input } from '@/components/ui/input';
import type { UserRole } from '../../types/admin.types';
import { TempPasswordModal, type TempCredentials } from './TempPasswordModal';
import { ROLES } from './user-style';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY = { fullName: '', email: '', role: 'STUDENT' as UserRole };

export const UserFormModal: React.FC<UserFormModalProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<TempCredentials | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const password = generatePassword();
    try {
      await adminUserService.create({ ...form, password });
      setCredentials({ title: 'Tài khoản đã được tạo', fullName: form.fullName, email: form.email, password });
      setForm(EMPTY);
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được tài khoản.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open} title="Tạo tài khoản mới" onClose={onClose}>
        <form onSubmit={submit} className="space-y-5">
          {error && <AlertBox message={error} />}
          <FormField label="Họ và tên">
            <Input required minLength={2} value={form.fullName} onChange={set('fullName')} placeholder="Nguyễn Văn A" className="h-[42px]" />
          </FormField>
          <FormField label="Email FPT">
            <Input required type="email" value={form.email} onChange={set('email')} placeholder="anvhe123456@fpt.edu.vn" className="h-[42px]" />
          </FormField>
          <FormField label="Vai trò" hint="Mật khẩu tạm thời sẽ được tạo ngẫu nhiên; người dùng đổi mật khẩu mới sau khi đăng nhập.">
            <select value={form.role} onChange={set('role')} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </Modal>
      <TempPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
    </>
  );
};
