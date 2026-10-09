'use client';

import { useEffect, useState } from 'react';
import { adminSettingsService } from '../../services/admin-settings.service';
import { DEFAULT_ADMIN_SETTINGS, type SandboxSettings } from '../../types/admin.types';
import { Button } from '../ui/Button';
import { FormField, inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import { Toggle } from '../ui/Toggle';
import { useToast } from '../ui/Toast';

interface SandboxConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const num = (v: string, fallback: number) => (Number.isFinite(Number(v)) && v !== '' ? Number(v) : fallback);

export const SandboxConfigModal: React.FC<SandboxConfigModalProps> = ({ open, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState<SandboxSettings>(DEFAULT_ADMIN_SETTINGS.sandbox);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(adminSettingsService.get().sandbox);
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSettingsService.save({ sandbox: form });
      toast.success('Đã lưu cấu hình Sandbox.');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const toggles: { key: 'networkDisabled' | 'seccompEnforced' | 'forkBombShield'; label: string }[] = [
    { key: 'networkDisabled', label: 'Chặn Internet (Outbound Network: DISABLED)' },
    { key: 'seccompEnforced', label: 'Seccomp: Block ptrace' },
    { key: 'forkBombShield', label: 'Fork-bomb Shield' },
  ];

  return (
    <Modal open={open} title="Cấu hình Sandbox" onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="CPU / container (cores)">
            <input type="number" min={0.5} max={4} step={0.5} value={form.cpuLimit} onChange={(e) => setForm({ ...form, cpuLimit: num(e.target.value, form.cpuLimit) })} className={inputClass} />
          </FormField>
          <FormField label="RAM / container (MB)">
            <input type="number" min={128} max={2048} step={64} value={form.ramLimitMb} onChange={(e) => setForm({ ...form, ramLimitMb: num(e.target.value, form.ramLimitMb) })} className={inputClass} />
          </FormField>
          <FormField label="Timeout (ms)">
            <input type="number" min={500} max={10000} step={250} value={form.timeoutMs} onChange={(e) => setForm({ ...form, timeoutMs: num(e.target.value, form.timeoutMs) })} className={inputClass} />
          </FormField>
        </div>
        <ul className="space-y-2">
          {toggles.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <span className="text-slate-700">{t.label}</span>
              <Toggle checked={form[t.key]} onChange={(next) => setForm({ ...form, [t.key]: next })} label={t.label} />
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setForm(DEFAULT_ADMIN_SETTINGS.sandbox)}>Mặc định</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</Button>
        </div>
      </form>
    </Modal>
  );
};
