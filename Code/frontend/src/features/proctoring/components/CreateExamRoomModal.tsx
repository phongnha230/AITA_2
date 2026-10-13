'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Assignment } from '@/features/assignments/types/assignment.types';

interface CreateExamRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  newRoomName: string;
  setNewRoomName: (val: string) => void;
  newBuilding: string;
  setNewBuilding: (val: string) => void;
  newCourseCode: string;
  setNewCourseCode: (val: string) => void;
  selectedAssignmentId: string;
  setSelectedAssignmentId: (val: string) => void;
  setNewExamTitle: (val: string) => void;
  availableExams: Assignment[];
  loadingExams: boolean;
  newProctor: string;
  setNewProctor: (val: string) => void;
  newCapacity: number;
  setNewCapacity: (val: number) => void;
  newSessionTime: string;
  setNewSessionTime: (val: string) => void;
}

export const CreateExamRoomModal: React.FC<CreateExamRoomModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  newRoomName,
  setNewRoomName,
  newBuilding,
  setNewBuilding,
  newCourseCode,
  setNewCourseCode,
  selectedAssignmentId,
  setSelectedAssignmentId,
  setNewExamTitle,
  availableExams,
  loadingExams,
  newProctor,
  setNewProctor,
  newCapacity,
  setNewCapacity,
  newSessionTime,
  setNewSessionTime,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">
            Mở ca thi &amp; Gán phòng máy mới
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Chọn đề thi từ Ngân hàng đề PE và gán vào phòng máy để giám sát trực tuyến.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="room-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Tên phòng máy
              </label>
              <Input
                id="room-name-input"
                aria-label="Tên phòng máy"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Vd: Phòng Lab 305"
                required
                className="h-10 rounded-xl bg-white text-xs"
              />
            </div>
            <div>
              <label htmlFor="room-building-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Tòa nhà / Khu vực
              </label>
              <Input
                id="room-building-input"
                aria-label="Tòa nhà / Khu vực"
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
                placeholder="Vd: Tòa Alpha (Tầng 3)"
                required
                className="h-10 rounded-xl bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="room-course-code-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Mã môn học
              </label>
              <Input
                id="room-course-code-input"
                aria-label="Mã môn học"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="Vd: PRF192"
                required
                className="h-10 rounded-xl bg-white font-mono uppercase text-xs"
              />
            </div>
            <div>
              <label htmlFor="room-exam-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn Đề Thi (Từ Database)
              </label>
              <select
                id="room-exam-select"
                aria-label="Chọn Đề Thi (Từ Database)"
                value={selectedAssignmentId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedAssignmentId(id);
                  const found = availableExams.find((x) => x.id === id);
                  if (found) {
                    setNewExamTitle(found.title);
                    if (found.course?.code) {
                      setNewCourseCode(found.course.code.split('_')[0]);
                    }
                  }
                }}
                className="h-10 w-full rounded-xl border border-input bg-white px-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {loadingExams ? (
                  <option value="">Đang tải danh sách đề thi...</option>
                ) : availableExams.length === 0 ? (
                  <option value="">Chưa có đề thi trong CSDL</option>
                ) : (
                  availableExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.course?.code ? `[${exam.course.code}] ` : ''}{exam.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="room-proctor-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Cán bộ coi thi
              </label>
              <Input
                id="room-proctor-input"
                aria-label="Cán bộ coi thi"
                value={newProctor}
                onChange={(e) => setNewProctor(e.target.value)}
                placeholder="Vd: TS. Nguyễn Văn A"
                required
                className="h-10 rounded-xl bg-white text-xs"
              />
            </div>
            <div>
              <label htmlFor="room-capacity-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Sức chứa (Máy thi)
              </label>
              <Input
                id="room-capacity-input"
                aria-label="Sức chứa (Máy thi)"
                type="number"
                min={1}
                max={50}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                required
                className="h-10 rounded-xl bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="room-session-time-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Ca thi &amp; Khung giờ
            </label>
            <Input
              id="room-session-time-input"
              aria-label="Ca thi & Khung giờ"
              value={newSessionTime}
              onChange={(e) => setNewSessionTime(e.target.value)}
              placeholder="Vd: Ca 2: 10:00 - 11:30"
              required
              className="h-10 rounded-xl bg-white text-xs"
            />
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border text-foreground hover:bg-muted text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
            >
              Tạo phòng thi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
