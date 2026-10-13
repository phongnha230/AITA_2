'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  UserCheck,
  Laptop,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ExamRoom } from '../types/proctoring.types';

interface RoomCardItemProps {
  room: ExamRoom;
}

export const RoomCardItem: React.FC<RoomCardItemProps> = ({ room }) => {
  const isLive = room.status === 'LIVE';
  const isUpcoming = room.status === 'UPCOMING';
  const progressPct =
    room.totalStudents > 0
      ? Math.round((room.submittedStudents / room.totalStudents) * 100)
      : 0;

  return (
    <Card
      className={`overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        isLive
          ? 'border-emerald-200/90 bg-gradient-to-b from-emerald-50/20 via-white to-white'
          : 'border-slate-200 bg-white'
      }`}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
        <div>
          {/* Top row: Room name + Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isLive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : isUpcoming
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{room.name}</h3>
                <p className="text-[11px] text-slate-500">{room.building}</p>
              </div>
            </div>

            {isLive ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
            ) : isUpcoming ? (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px] font-bold">
                Sắp diễn ra
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] font-semibold text-slate-600">
                Đã kết thúc
              </Badge>
            )}
          </div>

          {/* Exam title & Course Code */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                {room.courseCode}
              </span>
              <span className="text-xs font-semibold text-slate-700 truncate">
                {room.courseName}
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1 font-medium">
              {room.examTitle}
            </p>
          </div>

          {/* Session details */}
          <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                Ca thi
              </span>
              <span className="font-semibold text-slate-800">{room.sessionTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <UserCheck className="h-3.5 w-3.5" />
                Giám thị
              </span>
              <span className="font-medium text-slate-700">{room.proctorName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Laptop className="h-3.5 w-3.5" />
                Quy mô
              </span>
              <span className="font-medium text-slate-700">
                {room.capacity} máy trạm (Kiosk Ready)
              </span>
            </div>
          </div>

          {/* Progress Bar if Live or Completed */}
          {(isLive || room.status === 'COMPLETED') && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Tiến độ nộp bài:</span>
                <span className="font-bold text-slate-800">
                  {room.submittedStudents}/{room.totalStudents} ({progressPct}%)
                </span>
              </div>
              <Progress value={progressPct} className="h-2 bg-slate-100" />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isLive ? (
            <Link href={`/live-proctoring/${room.id}`} className="block">
              <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 group">
                <span>Vào giám sát phòng thi</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : isUpcoming ? (
            <Link href={`/live-proctoring/${room.id}`} className="block">
              <Button variant="outline" className="w-full rounded-xl border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-800 font-semibold text-xs">
                <span>Chuẩn bị mở ca thi</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href={`/live-proctoring/${room.id}`} className="block">
              <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs">
                <span>Xem lại biên bản ca thi</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
