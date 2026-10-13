'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment } from '../types/assignment.types';
import {
  INITIAL_LIVE_STATIONS,
  StudentExamStation,
} from '../mocks/live-proctoring.mock';
import { LiveProctoringHeader } from './monitor/LiveProctoringHeader';
import { LiveProctoringControls } from './monitor/LiveProctoringControls';
import { LiveStationCard } from './monitor/LiveStationCard';
import { LiveProctoringGrid } from './monitor/LiveProctoringGrid';
import { LiveProctoringTable } from './monitor/LiveProctoringTable';
import { LiveInspectModal } from './monitor/LiveInspectModal';
import { LiveBroadcastModal } from './monitor/LiveBroadcastModal';

export const LiveProctoringMonitor: React.FC = () => {
  // 0. Database Assignments Integration
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);
  const [selectedRoom, setSelectedRoom] = useState<'LAB-302' | 'LAB-204' | 'LAB-401'>('LAB-302');

  // 1. Exam Configuration & Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState(2896); // 48 mins 16 secs
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<'all' | 'working' | 'submitted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Modals state
  const [inspectStudent, setInspectStudent] = useState<StudentExamStation | null>(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3. Representative 24 Student Stations in Lab 302
  const [stations, setStations] = useState<StudentExamStation[]>(INITIAL_LIVE_STATIONS);

  // Fetch real assignments from MySQL database
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingAssignments(true);
      try {
        const data = await assignmentService.getAssignments();
        setAssignments(data);
        if (data.length > 0) {
          setSelectedAssignmentId(data[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải đề thi từ database:', err);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchExams();
  }, []);

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  // When selected exam changes, update totalCases on stations
  useEffect(() => {
    if (!selectedAssignment) return;
    const testCount =
      selectedAssignment.testCases && selectedAssignment.testCases.length > 0
        ? selectedAssignment.testCases.length
        : 5;
    setStations((prev) =>
      prev.map((s) => ({
        ...s,
        totalCases: testCount,
        passedCases: Math.min(s.passedCases, testCount),
      }))
    );
  }, [selectedAssignmentId, selectedAssignment]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleExtendTime = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
    showToast(`Đã gia hạn thêm +${mins} phút cho ca thi!`);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastModal(false);
    showToast(`Đã phát thông báo đến toàn bộ 24 máy thi: "${broadcastMessage}"`);
    setBroadcastMessage('');
  };

  const handleForceSubmit = (studentId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setStations((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const calcScore = Number(((s.passedCases / s.totalCases) * 10).toFixed(1));
          return {
            ...s,
            status: 'submitted',
            submittedAt: timeStr,
            score: calcScore,
            currentProblem: 'Đã thu bài thi',
          };
        }
        return s;
      })
    );

    if (inspectStudent && inspectStudent.id === studentId) {
      setInspectStudent(null);
    }

    const st = stations.find((s) => s.id === studentId);
    showToast(`Đã thu bài thành công cho sinh viên ${st?.studentName} (${st?.pcNumber})!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleExportAttendanceCsv = () => {
    const headers = [
      'STT',
      'So_May',
      'MSSV',
      'Ho_Va_Ten',
      'Trang_Thai',
      'So_Testcase_Dat',
      'Tong_Testcase',
      'Lan_Nop_Thu',
      'Diem_So',
      'Gio_Bat_Dau',
      'Gio_Nop_Bai',
      'Phong_Thi',
    ];

    const rows = stations.map((s, index) => [
      index + 1,
      s.pcNumber,
      s.studentCode,
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.status === 'submitted' ? 'Đã nộp bài' : 'Đang làm bài',
      s.passedCases,
      s.totalCases,
      `${s.testAttempts}/${s.maxAttempts}`,
      s.score !== undefined ? s.score.toFixed(1) : '',
      s.startTime,
      s.submittedAt || '',
      selectedRoom,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Bien_ban_ca_thi_${selectedRoom}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Đã xuất biên bản ca thi phòng ${selectedRoom} ra file CSV thành công!`);
  };

  const totalCount = stations.length;
  const workingCount = stations.filter((s) => s.status === 'working').length;
  const submittedCount = stations.filter((s) => s.status === 'submitted').length;
  const submittedStations = stations.filter((s) => s.status === 'submitted' && s.score !== undefined);
  const avgScore =
    submittedStations.length > 0
      ? (submittedStations.reduce((sum, s) => sum + (s.score || 0), 0) / submittedStations.length).toFixed(1)
      : '0.0';

  const filteredStations = stations.filter((s) => {
    if (filter === 'working' && s.status !== 'working') return false;
    if (filter === 'submitted' && s.status !== 'submitted') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.pcNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPcIndex = (pcNumber: string) => {
    const num = parseInt(pcNumber.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const rowAStations = filteredStations.filter((s) => getPcIndex(s.pcNumber) <= 12);
  const rowBStations = filteredStations.filter((s) => getPcIndex(s.pcNumber) > 12);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & LIVE EXAM CONTROLS BANNER */}
      <LiveProctoringHeader
        selectedRoom={selectedRoom}
        onSelectRoom={(room) => {
          setSelectedRoom(room);
          showToast(`Đã chuyển phòng thi sang ${room}`);
        }}
        selectedAssignment={selectedAssignment}
        selectedAssignmentId={selectedAssignmentId}
        onSelectAssignmentId={setSelectedAssignmentId}
        assignments={assignments}
        loadingAssignments={loadingAssignments}
        secondsLeft={secondsLeft}
        formatTime={formatTime}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onExtendTime={handleExtendTime}
        onOpenBroadcast={() => setBroadcastModal(true)}
        stats={{
          total: totalCount,
          working: workingCount,
          submitted: submittedCount,
          avgScore,
        }}
      />

      {/* 2. FILTER TABS, SEARCH & VIEW SWITCHER */}
      <LiveProctoringControls
        filter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
        workingCount={workingCount}
        submittedCount={submittedCount}
        onExportCsv={handleExportAttendanceCsv}
      />

      {/* 3. MAIN STUDENT STATIONS DISPLAY */}
      {viewMode === 'grid' ? (
        <LiveProctoringGrid
          rowAStations={rowAStations}
          rowBStations={rowBStations}
          selectedRoom={selectedRoom}
          onInspect={setInspectStudent}
          onForceSubmit={handleForceSubmit}
        />
      ) : (
        <LiveProctoringTable
          stations={filteredStations}
          onInspect={setInspectStudent}
          onForceSubmit={handleForceSubmit}
        />
      )}

      {/* 4. MODALS */}
      <LiveInspectModal
        station={inspectStudent}
        onClose={() => setInspectStudent(null)}
        onForceSubmit={handleForceSubmit}
      />

      <LiveBroadcastModal
        open={broadcastModal}
        onClose={() => setBroadcastModal(false)}
        message={broadcastMessage}
        onChangeMessage={setBroadcastMessage}
        onSend={handleSendBroadcast}
        selectedRoom={selectedRoom}
      />
    </div>
  );
};
