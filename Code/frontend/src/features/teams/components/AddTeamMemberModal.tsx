'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Shield,
  UserPlus2,
  X,
} from 'lucide-react';
import axios from 'axios';
import { teamService } from '../services/team.service';
import type { Team } from '../types/team.types';

interface AddTeamMemberModalProps {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTeam: Team) => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  teamId,
  teamName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [studentEmail, setStudentEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'LEADER'>('MEMBER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = studentEmail.trim();
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email sinh viên hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const updated = await teamService.addMember(teamId, {
        studentEmail: email,
        role,
      });

      setStudentEmail('');
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'Thêm thành viên thất bại. Vui lòng kiểm tra email sinh viên.');
      } else {
        setError('Đã có lỗi xảy ra khi thêm thành viên.');
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
        aria-labelledby="add-member-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/90 transition-all duration-200 animate-in fade-in zoom-in-95 sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <UserPlus2 className="h-5 w-5" />
            </div>
            <div>
              <h3 id="add-member-title" className="text-base font-bold text-slate-900 sm:text-lg">
                Thêm thành viên vào nhóm
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                Nhóm: <strong>{teamName}</strong>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email FPT của sinh viên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="sinhvien@fpt.edu.vn"
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600" />
              Vai trò trong nhóm
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            >
              <option value="MEMBER">Thành viên (Member)</option>
              <option value="LEADER">Nhóm trưởng (Team Leader)</option>
            </select>
          </div>

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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <UserPlus2 className="h-4 w-4" />
                  <span>Thêm thành viên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
