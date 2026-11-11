import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/design-system';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  secondaryText?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  sparkline?: number[];
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  secondaryText,
  icon,
  iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
  sparkline,
  className,
}) => {
  // Simple clean SVG sparkline
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = sparkline
      .map((val, i) => {
        const x = (i / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    const isUp = delta?.trend === 'up';

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible shrink-0"
      >
        <polyline
          fill="none"
          stroke={isUp ? '#10B981' : '#6366F1'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:shadow-sm transition-all', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 tracking-tight">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
            {value}
          </p>
        </div>

        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5',
              iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0',
                delta.trend === 'up'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : delta.trend === 'down'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
              )}
            >
              {delta.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : delta.trend === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {delta.value > 0 ? `+${delta.value}%` : `${delta.value}%`}
            </span>
          )}

          <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {secondaryText || (delta?.label ? delta.label : 'vs previous term')}
          </span>
        </div>

        {sparkline && renderSparkline()}
      </div>
    </Card>
  );
};

