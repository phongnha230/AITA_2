import { useId } from 'react';

export interface ChartSeries {
  name: string;
  color: string;
  values: number[];
}

interface AreaChartProps {
  series: ChartSeries[];
  labels?: string[];
  height?: number;
  /** Optional dashed threshold line, expressed in data units. */
  threshold?: { value: number; label: string };
}

const W = 600;

export const AreaChart: React.FC<AreaChartProps> = ({ series, labels, height = 200, threshold }) => {
  const uid = useId();
  const max = Math.max(...series.flatMap((s) => s.values), threshold?.value ?? 0) * 1.15 || 1;
  const toY = (v: number) => height - (v / max) * (height - 10);

  const linePath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (values.length - 1)) * W},${toY(v).toFixed(1)}`).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="h-52 w-full" role="img" aria-label="Biểu đồ">
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.name} id={`${uid}-${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1="0" x2={W} y1={height * r} y2={height * r} stroke="#f1f5f9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {threshold && (
          <line
            x1="0"
            x2={W}
            y1={toY(threshold.value)}
            y2={toY(threshold.value)}
            stroke="#e11d48"
            strokeDasharray="5 4"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {series.map((s, i) => (
          <g key={s.name}>
            <path d={`${linePath(s.values)} L${W},${height} L0,${height} Z`} fill={`url(#${uid}-${i})`} />
            <path d={linePath(s.values)} fill="none" stroke={s.color} strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {threshold && <p className="mt-1 text-xs font-medium text-rose-600">{threshold.label}</p>}
      {labels && (
        <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};
