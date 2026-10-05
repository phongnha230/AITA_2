'use client';

import { useState } from 'react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminAiKeyService } from '../../services/admin-ai-key.service';
import { Button } from '../ui/Button';
import { FormField, inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import type { AiProvider } from '../../types/admin.types';

interface AddKeyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY = { provider: 'GEMINI' as AiProvider, keyAlias: '', rawApiKey: '', dailyRequestLimit: 1500, rpmLimit: 60 };

export const AddKeyModal: React.FC<AddKeyModalProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminAiKeyService.create(form);
      setForm(EMPTY);
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thêm được khóa API.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Thêm Khóa API mới" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        {error && <AlertBox message={error} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Provider">
            <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value as AiProvider })} className={inputClass}>
              <option value="GEMINI">Google Gemini</option>
              <option value="OPENAI">OpenAI</option>
            </select>
          </FormField>
          <FormField label="Tên gợi nhớ (alias)">
            <input required maxLength={100} value={form.keyAlias} onChange={(e) => setForm({ ...form, keyAlias: e.target.value })} className={inputClass} placeholder="Key-05: Gemini 1.5 Pro" />
          </FormField>
        </div>
        <FormField label="API Key" hint="Được mã hóa AES-256 trước khi lưu; chỉ hiển thị phần gợi ý cuối khóa.">
          <input required type="password" minLength={10} autoComplete="off" value={form.rawApiKey} onChange={(e) => setForm({ ...form, rawApiKey: e.target.value })} className={`${inputClass} font-mono`} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Giới hạn request / ngày">
            <input required type="number" min={1} value={form.dailyRequestLimit} onChange={(e) => setForm({ ...form, dailyRequestLimit: Number(e.target.value) })} className={inputClass} />
          </FormField>
          <FormField label="Giới hạn RPM">
            <input required type="number" min={1} value={form.rpmLimit} onChange={(e) => setForm({ ...form, rpmLimit: Number(e.target.value) })} className={inputClass} />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Thêm khóa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
