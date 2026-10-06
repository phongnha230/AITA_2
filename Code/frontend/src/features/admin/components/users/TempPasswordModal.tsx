'use client';

import { Copy, KeyRound } from 'lucide-react';
import { copyText } from '../../../../lib/download';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export interface TempCredentials {
  title: string;
  fullName: string;
  email: string;
  password: string;
}

interface TempPasswordModalProps {
  credentials: TempCredentials | null;
  onClose: () => void;
}

/** Shows an auto-generated temporary password once, so the admin can hand it over. */
export const TempPasswordModal: React.FC<TempPasswordModalProps> = ({ credentials, onClose }) => {
  const toast = useToast();

  const copy = async () => {
    if (!credentials) return;
    const text = `Tài khoản: ${credentials.email}\nMật khẩu tạm thời: ${credentials.password}`;
    if (await copyText(text)) toast.success('Đã sao chép thông tin đăng nhập.');
    else toast.error('Trình duyệt chặn sao chép — hãy bôi đen và copy thủ công.');
  };

  return (
    <Modal open={Boolean(credentials)} title={credentials?.title ?? ''} onClose={onClose}>
      {credentials && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Gửi mật khẩu tạm thời này cho <strong>{credentials.fullName}</strong>. Người dùng cần <strong>đổi mật khẩu mới</strong> sau lần đăng nhập đầu tiên.
          </p>
          <dl className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div><dt className="text-xs text-slate-500">Email đăng nhập</dt><dd className="font-mono text-slate-900">{credentials.email}</dd></div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-slate-500"><KeyRound className="h-3.5 w-3.5" /> Mật khẩu tạm thời</dt>
              <dd className="select-all font-mono text-lg font-bold tracking-wider text-blue-700">{credentials.password}</dd>
            </div>
          </dl>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">Mật khẩu chỉ hiển thị một lần. Hãy sao chép trước khi đóng cửa sổ này.</p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => void copy()}><Copy className="h-4 w-4" /> Sao chép</Button>
            <Button variant="primary" onClick={onClose}>Đã lưu, đóng</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
