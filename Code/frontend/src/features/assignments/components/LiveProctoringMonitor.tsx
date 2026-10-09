'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Megaphone,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Monitor,
  Terminal,
  RefreshCw,
  Search,
  CheckCircle2,
  CheckCircle,
  Eye,
  Radio,
  X,
  Send,
  UserCheck,
  Hourglass,
  LayoutGrid,
  List,
  Award,
  Users,
  AlertCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  FileCode,
  Database,
  Download,
  Building2,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment } from '../types/assignment.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';


interface StudentExamStation {
  id: string;
  pcNumber: string;
  studentName: string;
  studentCode: string;
  initials: string;
  status: 'working' | 'submitted';
  startTime: string;
  submittedAt?: string;
  score?: number;
  passedCases: number;
  totalCases: number;
  testAttempts: number;
  maxAttempts: number;
  currentProblem: string;
}

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
  const [stations, setStations] = useState<StudentExamStation[]>([
    {
      id: '1',
      pcNumber: 'PC-01',
      studentName: 'Lê Tuấn Hùng',
      studentCode: 'SE170123',
      initials: 'LH',
      status: 'working',
      startTime: '08:00:15',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 4,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '2',
      pcNumber: 'PC-02',
      studentName: 'Nguyễn Thảo Ly',
      studentCode: 'SE171569',
      initials: 'NL',
      status: 'submitted',
      startTime: '08:00:10',
      submittedAt: '08:38:22',
      score: 10.0,
      passedCases: 5,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '3',
      pcNumber: 'PC-03',
      studentName: 'Phan Quốc Bảo',
      studentCode: 'SE172450',
      initials: 'PB',
      status: 'working',
      startTime: '08:00:20',
      passedCases: 2,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '4',
      pcNumber: 'PC-04',
      studentName: 'Đỗ Hoàng Nam',
      studentCode: 'SE173004',
      initials: 'ĐN',
      status: 'working',
      startTime: '08:00:12',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 5,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '5',
      pcNumber: 'PC-05',
      studentName: 'Vũ Tiến Dũng',
      studentCode: 'SE170882',
      initials: 'VD',
      status: 'submitted',
      startTime: '08:00:05',
      submittedAt: '08:35:40',
      score: 10.0,
      passedCases: 5,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '6',
      pcNumber: 'PC-06',
      studentName: 'Trần Mai Chi',
      studentCode: 'SE172102',
      initials: 'TC',
      status: 'working',
      startTime: '08:00:18',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '7',
      pcNumber: 'PC-07',
      studentName: 'Hoàng Anh Quân',
      studentCode: 'SE170911',
      initials: 'HQ',
      status: 'submitted',
      startTime: '08:00:14',
      submittedAt: '08:41:05',
      score: 8.5,
      passedCases: 4,
      totalCases: 5,
      testAttempts: 4,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '8',
      pcNumber: 'PC-08',
      studentName: 'Phạm Đức Trọng',
      studentCode: 'SE171120',
      initials: 'PT',
      status: 'working',
      startTime: '08:00:25',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '9',
      pcNumber: 'PC-09',
      studentName: 'Ngô Minh Khang',
      studentCode: 'SE172551',
      initials: 'NK',
      status: 'submitted',
      startTime: '08:00:08',
      submittedAt: '08:32:15',
      score: 10.0,
      passedCases: 5,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '10',
      pcNumber: 'PC-10',
      studentName: 'Bùi Phương Thảo',
      studentCode: 'SE173110',
      initials: 'BT',
      status: 'working',
      startTime: '08:00:30',
      passedCases: 2,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '11',
      pcNumber: 'PC-11',
      studentName: 'Đặng Quốc Huy',
      studentCode: 'SE170342',
      initials: 'ĐH',
      status: 'submitted',
      startTime: '08:00:16',
      submittedAt: '08:44:10',
      score: 9.0,
      passedCases: 4,
      totalCases: 5,
      testAttempts: 5,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '12',
      pcNumber: 'PC-12',
      studentName: 'Trịnh Gia Hân',
      studentCode: 'SE171889',
      initials: 'TH',
      status: 'working',
      startTime: '08:00:22',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '13',
      pcNumber: 'PC-13',
      studentName: 'Lý Kiến Văn',
      studentCode: 'SE172005',
      initials: 'LV',
      status: 'working',
      startTime: '08:00:19',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 4,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '14',
      pcNumber: 'PC-14',
      studentName: 'Nguyễn Đình Trí',
      studentCode: 'SE170776',
      initials: 'NT',
      status: 'submitted',
      startTime: '08:00:06',
      submittedAt: '08:30:50',
      score: 10.0,
      passedCases: 5,
      totalCases: 5,
      testAttempts: 1,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '15',
      pcNumber: 'PC-15',
      studentName: 'Cao Minh Tú',
      studentCode: 'SE171442',
      initials: 'CT',
      status: 'working',
      startTime: '08:00:24',
      passedCases: 1,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '16',
      pcNumber: 'PC-16',
      studentName: 'Hồ Thanh Phong',
      studentCode: 'SE172883',
      initials: 'HP',
      status: 'submitted',
      startTime: '08:00:12',
      submittedAt: '08:45:30',
      score: 7.5,
      passedCases: 3,
      totalCases: 5,
      testAttempts: 6,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '17',
      pcNumber: 'PC-17',
      studentName: 'Dương Gia Bảo',
      studentCode: 'SE170559',
      initials: 'DB',
      status: 'working',
      startTime: '08:00:28',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '18',
      pcNumber: 'PC-18',
      studentName: 'Võ Tuyết Nhi',
      studentCode: 'SE171990',
      initials: 'VN',
      status: 'submitted',
      startTime: '08:00:11',
      submittedAt: '08:37:18',
      score: 10.0,
      passedCases: 5,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Hoàn thành bài thi',
    },
    {
      id: '19',
      pcNumber: 'PC-19',
      studentName: 'Mai Văn Hậu',
      studentCode: 'SE172334',
      initials: 'MH',
      status: 'working',
      startTime: '08:00:26',
      passedCases: 2,
      totalCases: 5,
      testAttempts: 2,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '20',
      pcNumber: 'PC-20',
      studentName: 'Tô Ánh Nguyệt',
      studentCode: 'SE173441',
      initials: 'TN',
      status: 'working',
      startTime: '08:00:15',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 4,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '21',
      pcNumber: 'PC-21',
      studentName: 'Phan Thành Đạt',
      studentCode: 'SE170228',
      initials: 'PĐ',
      status: 'working',
      startTime: '08:00:32',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '22',
      pcNumber: 'PC-22',
      studentName: 'Huỳnh Khánh Linh',
      studentCode: 'SE171667',
      initials: 'HL',
      status: 'working',
      startTime: '08:00:21',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 3,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
    {
      id: '23',
      pcNumber: 'PC-23',
      studentName: 'Đoàn Nhật Quang',
      studentCode: 'SE172774',
      initials: 'ĐQ',
      status: 'working',
      startTime: '08:00:17',
      passedCases: 3,
      totalCases: 5,
      testAttempts: 4,
      maxAttempts: 10,
      currentProblem: 'Câu 1 (Số nguyên tố)',
    },
    {
      id: '24',
      pcNumber: 'PC-24',
      studentName: 'Trịnh Nhật Nam',
      studentCode: 'SE173229',
      initials: 'TN',
      status: 'working',
      startTime: '08:00:23',
      passedCases: 4,
      totalCases: 5,
      testAttempts: 5,
      maxAttempts: 10,
      currentProblem: 'Câu 2 (Thuật toán đảo mảng)',
    },
  ]);

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
  const progressPercent = Math.round((submittedCount / totalCount) * 100);

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
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 uppercase tracking-wider font-black">
              CA THI ĐANG DIỄN RA (LIVE)
            </span>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={selectedRoom}
                onChange={(e) => {
                  const val = e.target.value as 'LAB-302' | 'LAB-204' | 'LAB-401';
                  setSelectedRoom(val);
                  showToast(`Đã chuyển phòng thi sang ${val}`);
                }}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="LAB-302">Phòng Lab 302 (Toà Alpha - 24 máy)</option>
                <option value="LAB-204">Phòng Lab 204 (Toà Beta - 24 máy)</option>
                <option value="LAB-401">Phòng Lab 401 (Toà Gamma - 24 máy)</option>
              </select>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs">Khóa PE Kiosk</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedAssignment ? selectedAssignment.title : 'Kỳ thi Thực hành PE PRF192 - Spring 2025'}
            </h1>
            {selectedAssignment?.course && (
              <Badge variant="outline" className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0">
                {selectedAssignment.course.code}
              </Badge>
            )}
          </div>

          {/* Database Exam Selector Dropdown */}
          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs font-semibold text-slate-600 shrink-0">
              Chọn Đề Thi:
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-w-xs truncate"
            >
              {loadingAssignments && <option value="">Đang tải đề thi...</option>}
              {!loadingAssignments && assignments.length === 0 && (
                <option value="">Chưa có đề thi</option>
              )}
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.course?.code || 'PE'} - {a.testCases?.length || 0} tests)
                </option>
              ))}
            </select>
            {selectedAssignment && (
              <span className="text-[11px] text-slate-500">
                ({selectedAssignment.testCases?.length || 5} testcases)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Giám sát phòng thi: Theo dõi sinh viên đang làm bài và danh sách bài thi đã được nộp thành công.
          </p>
        </div>

        {/* Digital Countdown Timer & Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-slate-950 text-white border border-slate-800 flex items-center gap-3 shadow-md">
            <Clock className={`w-5 h-5 ${secondsLeft < 600 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Thời gian còn lại
              </div>
              <div
                className={`font-mono text-2xl font-black tracking-widest ${
                  secondsLeft < 600 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}
              >
                {formatTime(secondsLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Tiếp tục tính giờ' : 'Tạm dừng ca thi'}
              className="h-10 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Tiếp tục</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">Tạm dừng</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExtendTime(5)}
              className="h-10 px-3 rounded-xl border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+5 Phút</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setBroadcastModal(true)}
              className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phát thông báo</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. STATS OVERVIEW CARDS & PROGRESS BAR */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Tổng số máy thi</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{totalCount} Thí sinh</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              <Hourglass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-blue-700">Đang làm bài</div>
              <div className="text-xl font-black text-blue-900 mt-0.5">{workingCount} Thí sinh</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-700">Đã nộp bài rồi</div>
              <div className="text-xl font-black text-emerald-900 mt-0.5">{submittedCount} Thí sinh</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-800">Điểm TB (đã nộp)</div>
              <div className="text-xl font-black text-amber-900 mt-0.5">{avgScore} / 10.0</div>
            </div>
          </div>
        </div>

        {/* Live Submission Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Tiến độ thu bài phòng thi:</span>
              <span className="text-slate-500">
                {submittedCount}/{totalCount} thí sinh ({progressPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Đã nộp ({submittedCount})
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Đang làm ({workingCount})
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              title={`Đã nộp: ${submittedCount}`}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${100 - progressPercent}%` }}
              title={`Đang làm: ${workingCount}`}
            />
          </div>
        </div>
      </Card>


      {/* 3. FILTER TABS, SEARCH & VIEW SWITCHER */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className={`h-8 px-3.5 rounded-lg text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-white hover:bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({totalCount})
          </Button>

          <Button
            variant={filter === 'working' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('working')}
            className={`h-8 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === 'working'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Đang làm bài ({workingCount})</span>
          </Button>

          <Button
            variant={filter === 'submitted' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('submitted')}
            className={`h-8 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === 'submitted'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Đã nộp bài ({submittedCount})</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export CSV Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportAttendanceCsv}
            title="Xuất biên bản danh sách phòng thi ra CSV"
            className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất biên bản ca thi (CSV)</span>
          </Button>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, MSSV, số máy (PC-01)..."
              className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
            />
          </div>


          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              title="Chế độ sơ đồ lưới máy thi (2 dãy bàn)"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Chế độ bảng danh sách"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>


      {/* 4. MAIN STUDENT STATIONS DISPLAY */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* Row A: PC-01 to PC-12 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Dãy Bàn A (Vị trí PC-01 ➔ PC-12)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {rowAStations.length} máy trong dãy
              </span>
            </div>
            {rowAStations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Không có thí sinh nào khớp bộ lọc ở Dãy A
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rowAStations.map((station) => {
                  const isSubmitted = station.status === 'submitted';
                  const isNearAttemptLimit = !isSubmitted && station.testAttempts >= 8;

                  return (
                    <div
                      key={station.id}
                      onClick={() => setInspectStudent(station)}
                      className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between relative group ${
                        isSubmitted
                          ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white'
                          : isNearAttemptLimit
                          ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white'
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                            {station.pcNumber}
                          </span>

                          {isSubmitted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ĐÃ NỘP BÀI</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Hourglass className="w-3 h-3 text-blue-600" />
                              <span>ĐANG LÀM</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSubmitted
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            }`}
                          >
                            {station.initials}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {station.studentName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {station.studentCode}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 rounded-xl text-xs space-y-1.5 ${
                            isSubmitted
                              ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
                              : 'bg-slate-50 border border-slate-100 text-slate-700'
                          }`}
                        >
                          {isSubmitted ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-emerald-700">Điểm số chính thức:</span>
                                <span className="font-black text-sm text-emerald-800 font-mono">
                                  {station.score?.toFixed(1)} / 10.0
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                                <span>Nộp bài lúc:</span>
                                <span className="font-mono font-bold text-emerald-800">
                                  {station.submittedAt}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                                <span>Testcase đạt:</span>
                                <span className="font-bold">
                                  {station.passedCases}/{station.totalCases} cases
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Tiến độ hiện tại:</span>
                                <span className="font-bold text-blue-700">
                                  Đạt {station.passedCases}/{station.totalCases} testcase
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Lần nộp thử Sandbox:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    station.testAttempts >= 8 ? 'text-amber-700' : 'text-slate-800'
                                  }`}
                                >
                                  {station.testAttempts} / {station.maxAttempts} lần
                                </span>
                              </div>
                              {isNearAttemptLimit && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Cảnh báo: Sắp hết 10 lượt test!</span>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 truncate pt-0.5 border-t border-slate-100">
                                Đang làm: {station.currentProblem}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Bắt đầu: {station.startTime}</span>

                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceSubmit(station.id);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                          >
                            Thu bài
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Đã khóa bài
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Physical Hallway/Aisle Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-300"></div>
            </div>
            <div className="relative bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 shadow-xs flex items-center gap-2">
              <span>🚶 Lối đi giữa hai dãy máy ({selectedRoom})</span>
            </div>
          </div>

          {/* Row B: PC-13 to PC-24 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Dãy Bàn B (Vị trí PC-13 ➔ PC-24)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {rowBStations.length} máy trong dãy
              </span>
            </div>
            {rowBStations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Không có thí sinh nào khớp bộ lọc ở Dãy B
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rowBStations.map((station) => {
                  const isSubmitted = station.status === 'submitted';
                  const isNearAttemptLimit = !isSubmitted && station.testAttempts >= 8;

                  return (
                    <div
                      key={station.id}
                      onClick={() => setInspectStudent(station)}
                      className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between relative group ${
                        isSubmitted
                          ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white'
                          : isNearAttemptLimit
                          ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white'
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                            {station.pcNumber}
                          </span>

                          {isSubmitted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ĐÃ NỘP BÀI</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Hourglass className="w-3 h-3 text-blue-600" />
                              <span>ĐANG LÀM</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSubmitted
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            }`}
                          >
                            {station.initials}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {station.studentName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {station.studentCode}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 rounded-xl text-xs space-y-1.5 ${
                            isSubmitted
                              ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
                              : 'bg-slate-50 border border-slate-100 text-slate-700'
                          }`}
                        >
                          {isSubmitted ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-emerald-700">Điểm số chính thức:</span>
                                <span className="font-black text-sm text-emerald-800 font-mono">
                                  {station.score?.toFixed(1)} / 10.0
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                                <span>Nộp bài lúc:</span>
                                <span className="font-mono font-bold text-emerald-800">
                                  {station.submittedAt}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                                <span>Testcase đạt:</span>
                                <span className="font-bold">
                                  {station.passedCases}/{station.totalCases} cases
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Tiến độ hiện tại:</span>
                                <span className="font-bold text-blue-700">
                                  Đạt {station.passedCases}/{station.totalCases} testcase
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Lần nộp thử Sandbox:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    station.testAttempts >= 8 ? 'text-amber-700' : 'text-slate-800'
                                  }`}
                                >
                                  {station.testAttempts} / {station.maxAttempts} lần
                                </span>
                              </div>
                              {isNearAttemptLimit && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Cảnh báo: Sắp hết 10 lượt test!</span>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 truncate pt-0.5 border-t border-slate-100">
                                Đang làm: {station.currentProblem}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Bắt đầu: {station.startTime}</span>

                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceSubmit(station.id);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                          >
                            Thu bài
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Đã khóa bài
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Số máy</th>
                  <th className="py-3 px-4">Mã SV</th>
                  <th className="py-3 px-4">Họ và tên thí sinh</th>
                  <th className="py-3 px-4">Trạng thái bài thi</th>
                  <th className="py-3 px-4">Tiến độ Testcase</th>
                  <th className="py-3 px-4">Số lần chạy thử</th>
                  <th className="py-3 px-4">Điểm số</th>
                  <th className="py-3 px-4">Giờ nộp bài</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredStations.map((station) => {
                  const isSubmitted = station.status === 'submitted';

                  return (
                    <tr
                      key={station.id}
                      onClick={() => setInspectStudent(station)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {station.pcNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                        {station.studentCode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {station.studentName}
                      </td>
                      <td className="py-3 px-4">
                        {isSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ĐÃ NỘP BÀI
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            <Hourglass className="w-3 h-3 text-blue-600" />
                            ĐANG LÀM BÀI
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {station.passedCases} / {station.totalCases} cases
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {station.testAttempts} / {station.maxAttempts}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-sm">
                        {isSubmitted ? (
                          <span className="text-emerald-700">{station.score?.toFixed(1)} pts</span>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {station.submittedAt || '--:--:--'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceSubmit(station.id);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                          >
                            Thu bài sớm
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs font-bold">Đã nộp bài</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: CHI TIẾT BÀI THI CỦA THÍ SINH (INSPECT MODAL) */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                  {inspectStudent.pcNumber}
                </span>
                <span className="font-extrabold text-sm text-slate-900">
                  Thông Tin Bài Thi Thí Sinh
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {inspectStudent.studentName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    MSSV: {inspectStudent.studentCode}
                  </div>
                </div>
                <div>
                  {inspectStudent.status === 'submitted' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ĐÃ NỘP BÀI
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      ĐANG LÀM BÀI
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">Giờ vào phòng thi</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {inspectStudent.startTime}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">Giờ nộp bài chính thức</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {inspectStudent.submittedAt || 'Chưa nộp bài'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">Kết quả Testcase Sandbox</div>
                  <div className="font-bold text-blue-700 mt-0.5">
                    Đạt {inspectStudent.passedCases} / {inspectStudent.totalCases} testcases
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">Điểm số đạt được</div>
                  <div className="font-mono font-black text-base text-emerald-700 mt-0.5">
                    {inspectStudent.score !== undefined ? `${inspectStudent.score.toFixed(1)} / 10.0` : '--'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                <strong>Ghi chú giám sát:</strong> Bài thi thực hành PRF192 môn C, sinh viên đã thực hiện {inspectStudent.testAttempts} lần nộp thử nghiệm qua Docker Sandbox.
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Đóng
              </button>

              {inspectStudent.status === 'working' && (
                <button
                  type="button"
                  onClick={() => handleForceSubmit(inspectStudent.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                >
                  Xác nhận thu bài trước hạn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PHÁT THÔNG BÁO CHO THÍ SINH (BROADCAST) */}
      {broadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span className="font-extrabold text-sm text-slate-900">
                  Phát Thông Báo Tới Toàn Bộ Máy Thi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500">
                Nội dung sẽ hiển thị dạng thông báo khẩn cấp trên màn hình Kiosk của toàn bộ 24 thí sinh trong phòng Lab 302:
              </p>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Ví dụ: Còn 15 phút nữa hết giờ ca thi, các em chú ý kiểm tra lại code và bấm nộp bài!"
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Còn 15 phút nữa hết giờ làm bài!',
                  'Còn 5 phút cuối, chuẩn bị nộp bài!',
                  'Chú ý lưu bài trước khi kết thúc ca thi!',
                ].map((quickText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBroadcastMessage(quickText)}
                    className="text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {quickText}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                Gửi thông báo ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
