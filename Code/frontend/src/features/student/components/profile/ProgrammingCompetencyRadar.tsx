'use client';

import { Activity, Bot, Info } from 'lucide-react';

export interface CompetencyCategory {
  key: string;
  label: string;
  shortLabel?: string;
  score: number | null; // null means no real data
}

interface ProgrammingCompetencyRadarProps {
  categories?: CompetencyCategory[];
}

const DEFAULT_CATEGORIES: CompetencyCategory[] = [
  { key: 'dsa', label: 'Cấu trúc dữ liệu & Thuật toán', shortLabel: 'CTDL & Thuật toán', score: null },
  { key: 'oop', label: 'Thiết kế hướng đối tượng (OOP)', shortLabel: 'OOP & Thiết kế', score: null },
  { key: 'clean_code', label: 'Quy chuẩn & Định danh mã', shortLabel: 'Clean Code & Naming', score: null },
  { key: 'debugging', label: 'Gỡ lỗi & Xử lý trường hợp biên', shortLabel: 'Gỡ lỗi & Edge cases', score: null },
  { key: 'performance', label: 'Hiệu năng & Quản lý bộ nhớ', shortLabel: 'Hiệu năng & Bộ nhớ', score: null },
];

export function ProgrammingCompetencyRadar({
  categories = DEFAULT_CATEGORIES,
}: ProgrammingCompetencyRadarProps) {
  // Check if any real data exists
  const hasRealData = categories.some((c) => c.score !== null && Number.isFinite(c.score));

  // Radar geometry constants
  const sizeX = 460;
  const sizeY = 320;
  const cx = 230;
  const cy = 155;
  const radius = 92;
  const numAxes = categories.length;
  const ringLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calculate points for regular polygon at given radius scale
  const getRingPoints = (scale: number): string => {
    return Array.from({ length: numAxes }, (_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
      const r = radius * scale;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  // Calculate axes endpoints and label coordinates
  const axes = categories.map((cat, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
    const xOuter = cx + radius * Math.cos(angle);
    const yOuter = cy + radius * Math.sin(angle);

    // Label position slightly outside radius
    const labelDistance = radius + 20;
    const lx = cx + labelDistance * Math.cos(angle);
    const ly = cy + labelDistance * Math.sin(angle);

    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.cos(angle) > 0.2) textAnchor = 'start';
    else if (Math.cos(angle) < -0.2) textAnchor = 'end';

    // Data vertex if real data is available
    let dataPoint: { x: number; y: number } | null = null;
    if (hasRealData && cat.score !== null) {
      const clampedScore = Math.max(0, Math.min(100, cat.score)) / 100;
      dataPoint = {
        x: cx + radius * clampedScore * Math.cos(angle),
        y: cy + radius * clampedScore * Math.sin(angle),
      };
    }

    return {
      cat,
      angle,
      xOuter,
      yOuter,
      lx,
      ly,
      textAnchor,
      dataPoint,
    };
  });

  const dataPolygonPoints = hasRealData
    ? axes
        .filter((a): a is typeof a & { dataPoint: { x: number; y: number } } => a.dataPoint !== null)
        .map((a) => `${a.dataPoint.x.toFixed(1)},${a.dataPoint.y.toFixed(1)}`)
        .join(' ')
    : '';

  return (
    <section
      aria-label="Đánh giá năng lực lập trình"
      className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Năng lực lập trình</h2>
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Socratic AI
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Phân tích năng lực tổng hợp từ kết quả đánh giá thực tế các bài thi PE.
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Activity className="h-4 w-4" />
        </div>
      </div>

      {/* Spider Web Chart Area */}
      <div className="relative mt-2 flex flex-col items-center">
        <svg
          viewBox={`0 0 ${sizeX} ${sizeY}`}
          className="h-auto w-full max-w-[420px] overflow-visible"
          role="img"
          aria-label="Biểu đồ mạng nhện năng lực lập trình"
        >
          {/* Concentric rings */}
          {ringLevels.map((lvl, idx) => (
            <polygon
              key={lvl}
              points={getRingPoints(lvl)}
              fill={idx % 2 === 1 ? 'rgba(241, 245, 249, 0.4)' : 'none'}
              stroke={idx === ringLevels.length - 1 ? '#CBD5E1' : '#E2E8F0'}
              strokeWidth={idx === ringLevels.length - 1 ? '1.5' : '1'}
              strokeDasharray={idx === ringLevels.length - 1 ? undefined : '2 2'}
            />
          ))}

          {/* Radial axis lines */}
          {axes.map((axis, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={axis.xOuter}
              y2={axis.yOuter}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          ))}

          {/* Data polygon (rendered ONLY if real data exists) */}
          {hasRealData && dataPolygonPoints && (
            <>
              <polygon
                points={dataPolygonPoints}
                fill="rgba(37, 99, 235, 0.25)"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {axes.map(
                (axis, i) =>
                  axis.dataPoint && (
                    <circle
                      key={i}
                      cx={axis.dataPoint.x}
                      cy={axis.dataPoint.y}
                      r="4"
                      fill="#1D4ED8"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  ),
              )}
            </>
          )}

          {/* Axis Labels around the perimeter */}
          {axes.map((axis, i) => (
            <text
              key={i}
              x={axis.lx}
              y={axis.ly}
              textAnchor={axis.textAnchor}
              dominantBaseline="central"
              className="text-[10px] font-semibold fill-slate-600 sm:text-[11px]"
            >
              {axis.cat.shortLabel || axis.cat.label}
            </text>
          ))}
        </svg>

        {/* Empty state overlay when no real competency data exists */}
        {!hasRealData && (
          <div className="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 text-center">
            <p className="text-xs font-bold text-slate-800">
              Chưa đủ dữ liệu đánh giá để tổng hợp năng lực.
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Kết quả năng lực sẽ được tổng hợp khi có đủ dữ liệu đánh giá từ các bài thi PE đã hoàn thành.
            </p>
            <div className="sr-only">
              Chưa đủ dữ liệu đánh giá để tổng hợp năng lực. Kết quả năng lực sẽ được tổng hợp khi có đủ dữ liệu đánh giá từ các bài thi PE.
            </div>
          </div>
        )}
      </div>

      {/* Competency Category Breakdown List */}
      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
        {categories.map((cat) => {
          const hasScore = cat.score !== null && Number.isFinite(cat.score);
          const percent = hasScore ? Math.max(0, Math.min(100, cat.score!)) : 0;

          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{cat.label}</span>
                <span className={`font-semibold tabular-nums ${hasScore ? 'text-blue-700' : 'text-slate-400'}`}>
                  {hasScore ? `${percent}%` : '--'}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    hasScore ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                  style={{ width: `${hasScore ? percent : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Socratic AI Note */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900">
        <div className="flex items-start gap-2">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1 leading-relaxed">
            <p className="font-semibold text-blue-900">Cơ chế đánh giá Rubric:</p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Biểu đồ phân tích đa chiều kết hợp giữa kết quả kiểm thử tự động Docker Sandbox và đánh giá phong cách lập trình từ mô hình Socratic AI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
