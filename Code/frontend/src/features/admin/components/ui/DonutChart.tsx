import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 26,
  centerLabel = 'Tổng số',
  centerValue,
  className,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-6', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label="Donut Chart"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((item) => {
            const percent = item.value / total;
            const strokeDashoffset = circumference * (1 - percent);
            const rotation = accumulatedPercent * 360;
            accumulatedPercent += percent;

            return (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'stroke-dashoffset 0.5s ease, stroke-width 0.2s',
                }}
                className="hover:opacity-90"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {centerValue !== undefined ? centerValue : total.toLocaleString('en-US')}
          </span>
          {centerLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 w-full text-xs">
        {data.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-slate-900">{item.value.toLocaleString('en-US')}</span>
                <span className="text-slate-400 font-mono text-[11px]">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
