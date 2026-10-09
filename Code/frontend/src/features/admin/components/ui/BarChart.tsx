import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  subLabel?: string;
}

interface BarChartProps {
  data: BarItem[];
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  primaryColor = '#2563eb',
  secondaryColor = '#10b981',
  primaryLabel = 'Primary',
  secondaryLabel,
  height = 180,
  className,
}) => {
  const max =
    Math.max(
      ...data.map((d) => Math.max(d.value, d.secondaryValue ?? 0)),
      10,
    ) * 1.15;

  return (
    <div className={cn('w-full space-y-3', className)}>
      {(primaryLabel || secondaryLabel) && (
        <div className="flex items-center justify-end gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primaryColor }} />
            <span className="text-slate-600">{primaryLabel}</span>
          </div>
          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: secondaryColor }} />
              <span className="text-slate-600">{secondaryLabel}</span>
            </div>
          )}
        </div>
      )}

      <div
        className="relative flex items-end justify-between gap-3 pt-6 border-b border-slate-100"
        style={{ height }}
      >
        {/* Background grid lines */}
        {[0.25, 0.5, 0.75].map((level) => (
          <div
            key={level}
            className="absolute left-0 right-0 border-t border-dashed border-slate-100 pointer-events-none"
            style={{ bottom: `${level * 100}%` }}
          />
        ))}

        {data.map((item) => {
          const h1 = Math.min(100, Math.max(4, (item.value / max) * 100));
          const h2 = item.secondaryValue
            ? Math.min(100, Math.max(4, (item.secondaryValue / max) * 100))
            : 0;

          return (
            <div key={item.label} className="group relative flex-1 flex flex-col items-center h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {item.label}: {item.value}
                {item.secondaryValue !== undefined && ` / ${item.secondaryValue}%`}
              </div>

              <div className="flex items-end gap-1 w-full justify-center h-full">
                {/* Primary Bar */}
                <div
                  className="w-full max-w-[20px] rounded-t-md transition-all duration-300 hover:brightness-110"
                  style={{
                    height: `${h1}%`,
                    backgroundColor: primaryColor,
                  }}
                />
                {/* Secondary Bar (if present) */}
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[20px] rounded-t-md transition-all duration-300 hover:brightness-110"
                    style={{
                      height: `${h2}%`,
                      backgroundColor: secondaryColor,
                    }}
                  />
                )}
              </div>

              <span className="mt-2 block truncate text-[11px] font-semibold text-slate-600 w-full text-center">
                {item.label}
              </span>
              {item.subLabel && (
                <span className="block text-[10px] text-slate-400 truncate">
                  {item.subLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
