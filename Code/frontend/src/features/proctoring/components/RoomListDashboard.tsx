'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Radio } from 'lucide-react';
import { MOCK_EXAM_ROOMS } from '../services/proctoring.data';
import type { ExamRoom, RoomStatus } from '../types/proctoring.types';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import type { Assignment } from '@/features/assignments/types/assignment.types';
import { Button } from '@/components/ui/button';
import { CreateExamRoomModal } from './CreateExamRoomModal';
import { RoomCardItem } from './RoomCardItem';
import { RoomListKpiSection } from './RoomListKpiSection';
import { RoomListFilterSection } from './RoomListFilterSection';

export function RoomListDashboard() {
  const [rooms, setRooms] = useState<ExamRoom[]>(MOCK_EXAM_ROOMS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | RoomStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state for creating new session/room
  const [newRoomName, setNewRoomName] = useState('Phòng Lab 305');
  const [newBuilding, setNewBuilding] = useState('Tòa Alpha (Tầng 3)');
  const [newCourseCode, setNewCourseCode] = useState('PRF192');
  const newExamTitleRef = useRef('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [newProctor, setNewProctor] = useState('TS. Nguyễn Văn A');
  const [newCapacity, setNewCapacity] = useState(24);
  const [newSessionTime, setNewSessionTime] = useState('Ca 2: 10:00 - 11:30');

  // Exam list fetched from database
  const [availableExams, setAvailableExams] = useState<Assignment[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Load available exams from database
  useEffect(() => {
    let isMounted = true;
    const loadExams = async () => {
      setLoadingExams(true);
      try {
        const examList = await assignmentService.getAssignments();
        if (isMounted) {
          setAvailableExams(examList);
          if (examList.length > 0) {
            setSelectedAssignmentId(examList[0].id);
            newExamTitleRef.current = examList[0].title;
            if (examList[0].course?.code) {
              setNewCourseCode(examList[0].course.code.split('_')[0]);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi nạp danh sách đề thi từ CSDL:', err);
      } finally {
        if (isMounted) setLoadingExams(false);
      }
    };
    loadExams();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const matchesFilter = filterStatus === 'ALL' || room.status === filterStatus;
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.proctorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalLiveRooms = rooms.filter((r) => r.status === 'LIVE').length;
  const totalStudents = rooms
    .filter((r) => r.status === 'LIVE')
    .reduce((acc, cur) => acc + cur.totalStudents, 0);
  const totalSubmitted = rooms
    .filter((r) => r.status === 'LIVE')
    .reduce((acc, cur) => acc + cur.submittedStudents, 0);
  const submissionRate =
    totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newExamTitleRef.current;
    const created: ExamRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      building: newBuilding,
      courseCode: newCourseCode,
      courseName: title || 'Lập trình chuyên sâu',
      examTitle: title || `Đề thi PE - ${newCourseCode}`,
      proctorName: newProctor,
      capacity: newCapacity,
      status: 'UPCOMING',
      durationSeconds: 5400,
      secondsLeft: 5400,
      totalStudents: 0,
      submittedStudents: 0,
      workingStudents: 0,
      kioskLockEnabled: true,
      sessionTime: newSessionTime,
    };
    setRooms([created, ...rooms]);
    setCreateModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Radio className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>Trung tâm Khảo thí Trực tuyến AITA</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Phòng thi trực tiếp &amp; Quản lý ca thi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Chọn phòng thi đang diễn ra để vào màn hình giám sát máy thi của từng sinh viên theo thời gian thực.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold text-xs sm:text-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Mở ca thi / Gán phòng mới
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <RoomListKpiSection
        totalLiveRooms={totalLiveRooms}
        totalStudents={totalStudents}
        submissionRate={submissionRate}
        totalSubmitted={totalSubmitted}
      />

      {/* 3. Filters & Search Controls */}
      <RoomListFilterSection
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        rooms={rooms}
      />

      {/* 4. Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <Radio className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">Không tìm thấy phòng thi nào</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? `Không có kết quả nào phù hợp với "${searchTerm}"`
              : 'Thử thay đổi từ khóa tìm kiếm hoặc bấm tab "Tất cả phòng" để kiểm tra.'}
          </p>
          {rooms.length === 0 && (
            <div className="mt-5">
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm h-10 px-5"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Mở ca thi / Gán phòng đầu tiên
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCardItem key={room.id} room={room} />
          ))}
        </div>
      )}

      {/* 5. Modal: Tạo ca thi / Gán phòng mới */}
      <CreateExamRoomModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateRoom}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        newBuilding={newBuilding}
        setNewBuilding={setNewBuilding}
        newCourseCode={newCourseCode}
        setNewCourseCode={setNewCourseCode}
        selectedAssignmentId={selectedAssignmentId}
        setSelectedAssignmentId={setSelectedAssignmentId}
        setNewExamTitle={(val) => {
          newExamTitleRef.current = val;
        }}
        availableExams={availableExams}
        loadingExams={loadingExams}
        newProctor={newProctor}
        setNewProctor={setNewProctor}
        newCapacity={newCapacity}
        setNewCapacity={setNewCapacity}
        newSessionTime={newSessionTime}
        setNewSessionTime={setNewSessionTime}
      />
    </div>
  );
}
