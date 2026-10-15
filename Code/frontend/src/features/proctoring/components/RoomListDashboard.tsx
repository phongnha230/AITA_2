'use client';

import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { MOCK_EXAM_ROOMS } from '../services/proctoring.data';
import type { ExamRoom, RoomStatus } from '../types/proctoring.types';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import { RoomCardItem } from './RoomCardItem';
import { RoomListKpiSection } from './RoomListKpiSection';
import { RoomListFilterSection } from './RoomListFilterSection';

export function RoomListDashboard() {
  const [rooms, setRooms] = useState<ExamRoom[]>(MOCK_EXAM_ROOMS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | RoomStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Load real proctoring sessions from database
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const roomList = await assignmentService.getProctoringRooms();
        if (isMounted && roomList && roomList.length > 0) {
          setRooms(roomList);
        }
      } catch (err) {
        console.error('Lỗi khi nạp danh sách ca thi từ CSDL:', err);
      }
    };
    loadData();
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
      room.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            Giám sát Ca thi Trực tiếp (Live Exam Monitor)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Theo dõi tất cả các Ca thi PE của các môn học đang diễn ra. Bấm vào ca thi để vào màn hình quan sát máy thi của sinh viên theo thời gian thực.
          </p>
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
          <h3 className="mt-4 text-sm font-bold text-slate-900">Không tìm thấy ca thi nào</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? `Không có kết quả nào phù hợp với "${searchTerm}"`
              : 'Thử thay đổi từ khóa tìm kiếm hoặc bấm tab "Tất cả ca thi" để kiểm tra.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCardItem key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
