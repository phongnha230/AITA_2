'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { downloadFile, parseCsv } from '../../../../lib/download';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { CreateUserPayload, UserRole } from '../../types/admin.types';

interface ImportUsersModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (summary: { created: number; skipped: number }) => void;
}

const TEMPLATE = 'fullName,email,role\nNguyễn Văn Test,testnvhe190001@fpt.edu.vn,STUDENT\nTrần Thị Mẫu,mautt@fpt.edu.vn,LECTURER\n';
const ROLE_SET: UserRole[] = ['ADMIN', 'LECTURER', 'STUDENT'];

const toPayloads = (rows: string[][]): CreateUserPayload[] => {
  const [header, ...body] = rows;
  const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const [iName, iMail, iRole] = [idx('fullName'), idx('email'), idx('role')];
  if (iName < 0 || iMail < 0) throw new Error('File cần có cột fullName và email (cột role là tùy chọn).');
  return body
    .map((r) => {
      const role = (r[iRole]?.toUpperCase() ?? 'STUDENT') as UserRole;
      return { fullName: r[iName], email: r[iMail], role: ROLE_SET.includes(role) ? role : 'STUDENT' };
    })
    .filter((p) => p.fullName && p.email.includes('@'));
};

/** Imports users from a CSV (export an Excel sheet as .csv). */
export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({ open, onClose, onImported }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const payloads = toPayloads(parseCsv(await file.text()));
      if (payloads.length === 0) throw new Error('Không có dòng hợp lệ nào trong file.');
      onImported(await adminUserService.createBatch(payloads));
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, 'Không đọc được file.'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Modal open={open} title="Nạp danh sách từ FAP Excel" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-slate-600">Xuất bảng Excel của FAP sang <strong>.csv</strong> với các cột <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">fullName, email, role</code>. Email trùng sẽ bị bỏ qua.</p>
        {error && <AlertBox message={error} />}
        <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && void handleFile(e.target.files[0])} />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={busy} onClick={() => input.current?.click()}><Upload className="h-4 w-4" /> {busy ? 'Đang nạp...' : 'Chọn file CSV'}</Button>
          <Button onClick={() => downloadFile('aita-users-template.csv', TEMPLATE, 'text/csv;charset=utf-8')}><FileSpreadsheet className="h-4 w-4" /> Tải file mẫu</Button>
        </div>
      </div>
    </Modal>
  );
};
