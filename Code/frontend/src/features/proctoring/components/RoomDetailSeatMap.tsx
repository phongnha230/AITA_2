'use client';

import React from 'react';
import { StationCard } from './StationCard';
import type { StudentExamStation } from '../types/proctoring.types';

interface RoomDetailSeatMapProps {
  stations: StudentExamStation[];
  viewMode: 'seatmap' | 'grid';
  onInspectStation: (station: StudentExamStation) => void;
}

export const RoomDetailSeatMap: React.FC<RoomDetailSeatMapProps> = ({
  stations,
  viewMode,
  onInspectStation,
}) => {
  const rowA = stations.slice(0, 12);
  const rowB = stations.slice(12, 24);

  if (viewMode === 'seatmap') {
    return (
      <div className="space-y-6">
        {/* Row A */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Dãy bàn A (Vị trí PC-01 → PC-12)
            </h3>
            <span className="text-[11px] text-slate-400">{rowA.length} máy trong dãy</span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {rowA.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onInspect={() => onInspectStation(station)}
              />
            ))}
          </div>
        </div>

        {/* Row B */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Dãy bàn B (Vị trí PC-13 → PC-24)
            </h3>
            <span className="text-[11px] text-slate-400">{rowB.length} máy trong dãy</span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {rowB.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onInspect={() => onInspectStation(station)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          onInspect={() => onInspectStation(station)}
        />
      ))}
    </div>
  );
};
