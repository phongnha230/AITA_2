import * as React from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  values: number[];
  color?: string;
  fillColor?: string;
  height?: number;
  width?: number;
  className?: string;
  showTrend?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  values,
  color = '#2563eb',
  fillColor,
  height = 36,
  width = 120,
  className,
}) => {
  const uid = useId();
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Map values to coordinates with 2px padding
  const padding = 2;
  const h = height - padding * 2;
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = padding + h - ((v - min) / range) * h;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`;

  return (
    <div className={cn('inline-flex items-center overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        aria-label="Sparkline trend chart"
      >
        <defs>
          <linearGradient id={`${uid}-spark`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fillColor || color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${uid}-spark)`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Highlight latest point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};
