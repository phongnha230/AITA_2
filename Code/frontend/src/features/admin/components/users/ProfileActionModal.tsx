'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { FormField, inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';

interface ProfileActionModalProps {
  open: boolean;
  title: string;
  label: string;
  options: { value: string; label: string }[];
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (value: string) => Promise<void> | void;
}

/** Single-select dialog reused by "Phân công thêm lớp" and "Đổi bộ môn". */
export const ProfileActionModal: React.FC<ProfileActionModalProps> = ({ open, title, label, options, confirmLabel, onClose, onConfirm }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = value || options[0]?.value || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await onConfirm(selected);
      setValue('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        {options.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Không còn lựa chọn khả dụng.</p>
        ) : (
          <FormField label={label}>
            <select value={selected} onChange={(e) => setValue(e.target.value)} className={inputClass}>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={busy || options.length === 0}>{busy ? 'Đang lưu...' : confirmLabel}</Button>
        </div>
      </form>
    </Modal>
  );
};
