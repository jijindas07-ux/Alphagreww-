import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'indigo'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'sky'
    | 'purple'
    | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 rounded-md gap-1.5 font-medium',
  };

  const variantClasses = {
    neutral:
      'bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/80',
    indigo:
      'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    emerald:
      'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    amber:
      'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    rose:
      'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    sky:
      'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    purple:
      'bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    outline:
      'bg-transparent text-slate-600 border border-slate-300 dark:text-zinc-400 dark:border-zinc-700',
  };

  const dotClasses = {
    neutral: 'bg-slate-400 dark:bg-zinc-400',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
    outline: 'bg-slate-400 dark:bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center tracking-tight select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant])} />}
      {children}
    </span>
  );
};

export const StatusDot: React.FC<{
  status: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}> = ({ status, className }) => {
  const statusColors = {
    online: 'bg-emerald-500 shadow-xs shadow-emerald-500/50',
    offline: 'bg-slate-400 dark:bg-zinc-500',
    busy: 'bg-rose-500 shadow-xs shadow-rose-500/50',
    away: 'bg-amber-500 shadow-xs shadow-amber-500/50',
  };

  return (
    <span className={cn('inline-block w-2 h-2 rounded-full shrink-0', statusColors[status], className)} />
  );
};

