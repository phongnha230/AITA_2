'use client';

import React from 'react';
import type { StudentExamStation } from '../../mocks/live-proctoring.mock';
import { LiveStationCard } from './LiveStationCard';

interface LiveProctoringGridProps {
  rowAStations: StudentExamStation[];
  rowBStations: StudentExamStation[];
  selectedRoom: string;
  onInspect: (station: StudentExamStation) => void;
  onForceSubmit: (studentId: string) => void;
}

export const LiveProctoringGrid: React.FC<LiveProctoringGridProps> = ({
  rowAStations,
  rowBStations,
  selectedRoom,
  onInspect,
  onForceSubmit,
}) => {
  return (
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
            {rowAStations.map((station) => (
              <LiveStationCard
                key={station.id}
                station={station}
                onInspect={onInspect}
                onForceSubmit={onForceSubmit}
              />
            ))}
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
            {rowBStations.map((station) => (
              <LiveStationCard
                key={station.id}
                station={station}
                onInspect={onInspect}
                onForceSubmit={onForceSubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
