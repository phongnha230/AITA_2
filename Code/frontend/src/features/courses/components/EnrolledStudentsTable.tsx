'use client';

import React, { useState } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  Users,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { CourseEnrollment } from '../types/course.types';

interface EnrolledStudentsTableProps {
  enrollments: CourseEnrollment[];
  studentSearch: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | 'VERIFIED' | 'PENDING';
  onStatusFilterChange: (val: 'ALL' | 'VERIFIED' | 'PENDING') => void;
  isShowingEmptyStateDemo: boolean;
  onToggleEmptyStateDemo: () => void;
  joinCode: string;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onShowToast: (msg: string) => void;
}

export const EnrolledStudentsTable: React.FC<EnrolledStudentsTableProps> = ({
  enrollments,
  studentSearch,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isShowingEmptyStateDemo,
  onToggleEmptyStateDemo,
  joinCode,
  onRemoveStudent,
  onShowToast,
}) => {
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = () => {
    if (studentToDelete) {
      onRemoveStudent(studentToDelete.id, studentToDelete.name);
      setStudentToDelete(null);
    }
  };

  return (
    <section className="space-y-4 w-full">
      {/* Toolbar: Responsive Flex-Wrap */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo Tên hoặc MSSV..."
              value={studentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shrink-0"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="VERIFIED">Đã xác thực (Verified)</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
          </select>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onShowToast('Đang tải file danh sách sinh viên (Excel/CSV)...')}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Xuất Danh Sách</span>
          </button>

          {/* Nút Demo Switcher */}
          <button
            onClick={onToggleEmptyStateDemo}
            type="button"
            className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition whitespace-nowrap inline-flex items-center gap-1.5 shrink-0"
            title="Chuyển đổi giữa chế độ Danh sách có SV và Empty State"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{isShowingEmptyStateDemo ? 'Xem Danh Sách SV' : 'Xem Empty State'}</span>
          </button>

          {/* Sĩ số Badge */}
          <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
            {enrollments.length} SV
          </span>
        </div>
      </div>

      {/* Main Container: Table OR Empty State */}
      {enrollments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 min-w-[620px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã số SV</th>
                  <th className="px-5 py-4">Họ tên & Email</th>
                  <th className="px-5 py-4">Thời gian tham gia</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enrollment, idx) => {
                  const student = enrollment.student;
                  const isVerified =
                    enrollment.status === 'VERIFIED' || student.status === 'ACTIVE';

                  // Generate avatar initials
                  const initials = student.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(-2)
                    .join('')
                    .toUpperCase();

                  const avatarGradient =
                    idx % 3 === 0
                      ? 'from-blue-600 to-indigo-600'
                      : idx % 3 === 1
                      ? 'from-teal-600 to-emerald-600'
                      : 'from-amber-500 to-orange-500';

                  return (
                    <tr
                      key={student.id || idx}
                      className={`hover:bg-blue-50/30 transition group ${
                        !isVerified ? 'bg-amber-50/25' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        {student.studentCode || 'QE190000'}
                      </td>
                      <td className="px-5 py-4 flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGradient} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                        >
                          {initials || 'SV'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {new Date(enrollment.joinedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Đã xác thực (Verified)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Chờ duyệt (Pending)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() =>
                            onShowToast(`Xem thông tin sinh viên ${student.fullName}`)
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Xem thông tin"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setStudentToDelete({
                              id: student.id || student.studentCode || '',
                              name: student.fullName,
                            })
                          }
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Gỡ khỏi lớp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h4 className="text-base font-extrabold text-slate-800">
              Lớp học chưa có sinh viên tham gia
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hãy chia sẻ mã PIN hoặc chiếu mã QR trên máy chiếu để sinh viên tham gia vào khóa học.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl font-mono text-sm font-black text-indigo-900 tracking-wider">
              {joinCode}
            </div>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(joinCode);
                }
                onShowToast(`Đã sao chép mã mời: ${joinCode}`);
              }}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép mã mời</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Xác nhận gỡ sinh viên</h4>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa sinh viên <strong>{studentToDelete.name}</strong> khỏi danh sách khóa học?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
