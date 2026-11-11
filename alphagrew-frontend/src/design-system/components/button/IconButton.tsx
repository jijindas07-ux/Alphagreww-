import React from 'react';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-7 h-7 rounded-md p-1',
      sm: 'w-8 h-8 rounded-lg p-1.5',
      md: 'w-9 h-9 rounded-lg p-2',
      lg: 'w-10 h-10 rounded-xl p-2.5',
    };

    const variantClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs dark:bg-indigo-500',
      secondary:
        'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-800',
      ghost:
        'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/80',
      outline:
        'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800',
      destructive: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40',
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

