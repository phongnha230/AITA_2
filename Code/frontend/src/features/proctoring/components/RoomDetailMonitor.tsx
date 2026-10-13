'use client';

import { useState, useEffect } from 'react';
import { MOCK_EXAM_ROOMS, INITIAL_STATIONS_LAB302 } from '../services/proctoring.data';
import type { StudentExamStation } from '../types/proctoring.types';
import { InspectStationModal } from './InspectStationModal';
import { BroadcastModal } from './BroadcastModal';
import { RoomDetailHeader } from './RoomDetailHeader';
import { RoomDetailSeatMap } from './RoomDetailSeatMap';
import { RoomDetailToolbar } from './RoomDetailToolbar';
import { RoomDetailStandbyView } from './RoomDetailStandbyView';

interface RoomDetailMonitorProps {
  roomId: string;
}

export function RoomDetailMonitor({ roomId }: RoomDetailMonitorProps) {
  const room = MOCK_EXAM_ROOMS.find((r) => r.id === roomId) || MOCK_EXAM_ROOMS[0];

  const [stations, setStations] = useState<StudentExamStation[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(room.secondsLeft);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'working' | 'submitted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'seatmap' | 'grid'>('seatmap');

  // Modals state
  const [inspectStation, setInspectStation] = useState<StudentExamStation | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Countdown timer
  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, secondsLeft]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleExtendTime = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
    showToast(`Đã cộng thêm +${mins} phút cho ca thi!`);
  };

  const handleForceSubmit = (stationId: string) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          return {
            ...s,
            status: 'submitted',
            submittedAt: time,
            score: Number(((s.passedCases / s.totalCases) * 10).toFixed(1)),
          };
        }
        return s;
      })
    );
    setInspectStation(null);
    showToast(`Đã thu bài máy thi thành công!`);
  };

  const handleBroadcast = (msg: string) => {
    setBroadcastOpen(false);
    showToast(`Đã gửi thông báo tới tất cả máy: "${msg}"`);
  };

  // Filtered stations
  const filteredStations = stations.filter((s) => {
    if (filter === 'working' && s.status !== 'working' && s.status !== 'compiling') return false;
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

  const workingCount = stations.filter((s) => s.status === 'working' || s.status === 'compiling').length;
  const submittedCount = stations.filter((s) => s.status === 'submitted').length;
  const submittedWithScores = stations.filter((s) => s.status === 'submitted' && s.score !== undefined);
  const avgScore =
    submittedWithScores.length > 0
      ? (
          submittedWithScores.reduce((acc, cur) => acc + (cur.score || 0), 0) /
          submittedWithScores.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* 1. Header & Controls */}
      <RoomDetailHeader
        room={room}
        secondsLeft={secondsLeft}
        isPaused={isPaused}
        formatTimer={formatTimer}
        onTogglePause={() => setIsPaused(!isPaused)}
        onExtendTime={handleExtendTime}
        onOpenBroadcast={() => setBroadcastOpen(true)}
        totalStationsCount={stations.length}
        workingCount={workingCount}
        submittedCount={submittedCount}
        avgScore={avgScore}
      />

      {/* 2. Toolbar (Filter tabs, Search, Mock controls) */}
      <RoomDetailToolbar
        filter={filter}
        setFilter={setFilter}
        stationsCount={stations.length}
        workingCount={workingCount}
        submittedCount={submittedCount}
        hasStations={stations.length > 0}
        onClearStations={() => {
          setStations([]);
          showToast('Đã xóa dữ liệu máy thi và đưa phòng máy về trạng thái Chờ.');
        }}
        onLoadMockStations={() => {
          setStations(INITIAL_STATIONS_LAB302);
          showToast('Đã nạp danh sách thí sinh phòng thi để kiểm thử.');
        }}
        onExportCsv={() => showToast('Đang xuất biên bản ca thi dạng CSV...')}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 3. Stations List / Standby State */}
      {stations.length === 0 ? (
        <RoomDetailStandbyView
          roomName={room.name}
          onLoadMockStations={() => {
            setStations(INITIAL_STATIONS_LAB302);
            showToast('Đã nạp danh sách thí sinh phòng thi để kiểm thử.');
          }}
        />
      ) : (
        <RoomDetailSeatMap
          stations={filteredStations}
          viewMode={viewMode}
          onInspectStation={(st) => setInspectStation(st)}
        />
      )}

      {/* Modals */}
      <InspectStationModal
        station={inspectStation}
        onClose={() => setInspectStation(null)}
        onForceSubmit={handleForceSubmit}
      />

      <BroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSend={handleBroadcast}
        roomName={room.name}
      />
    </div>
  );
}
