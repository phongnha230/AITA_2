'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import axios from 'axios';
import { courseService } from '../services/course.service';

interface BatchEnrollModalProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const BatchEnrollModal: React.FC<BatchEnrollModalProps> = ({
  courseId,
  courseName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse list of IDs from text
  const { validIds, invalidTokens } = useMemo(() => {
    if (!inputText.trim()) return { validIds: [], invalidTokens: [] };

    const tokens = inputText
      .split(/[\n,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const uniqueTokens = Array.from(new Set(tokens));
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const t of uniqueTokens) {
      if (UUID_REGEX.test(t)) {
        valid.push(t);
      } else {
        invalid.push(t);
      }
    }

    return { validIds: valid, invalidTokens: invalid };
  }, [inputText]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (validIds.length === 0) {
      setError('Vui lòng nhập ít nhất một Student UUID hợp lệ (định dạng 8-4-4-4-12 ký tự hex).');
      return;
    }

    setLoading(true);
    try {
      const res = await courseService.enrollStudents(courseId, validIds);
      const enrolledCount = res.enrolledCount || validIds.length;
      setSuccess(`Đã ghi danh thành công ${enrolledCount} học viên vào lớp!`);
      setInputText('');
      setTimeout(() => {
        onSuccess(enrolledCount);
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'Ghi danh học viên thất bại. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã có lỗi xảy ra trong quá trình ghi danh.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-enroll-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/90 transition-all duration-200 animate-in fade-in zoom-in-95 sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 id="batch-enroll-title" className="text-base font-bold text-slate-900 sm:text-lg">
                Ghi danh học viên hàng loạt
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm">
                Thêm danh sách học viên trực tiếp vào lớp <strong>{courseName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Danh sách Student UUIDs
              </label>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {validIds.length} mã hợp lệ
              </span>
            </div>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán danh sách ID sinh viên (mỗi mã một dòng hoặc cách nhau bằng dấu phẩy)&#10;Ví dụ:&#10;8f9d0c24-4f01-419b-a05e-88c227b9c9d1&#10;7b2c1a10-2e33-4f11-9a99-99a112c3d4e5"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 font-mono text-xs text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
            />
          </div>

          {/* Invalid tokens warning */}
          {invalidTokens.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
              <p className="font-semibold">Lưu ý: Có {invalidTokens.length} mã chưa đúng chuẩn UUID (sẽ bị bỏ qua):</p>
              <p className="mt-1 font-mono text-[11px] text-amber-700 truncate">
                {invalidTokens.slice(0, 3).join(', ')}{invalidTokens.length > 3 ? ` và ${invalidTokens.length - 3} mã khác...` : ''}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition sm:text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || validIds.length === 0 || Boolean(success)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang ghi danh...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Ghi danh {validIds.length > 0 ? `(${validIds.length})` : ''} học viên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
