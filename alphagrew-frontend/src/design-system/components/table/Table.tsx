import React from 'react';
import { cn } from '@/utils/cn';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
    <table className={cn('w-full text-left text-xs border-collapse', className)} {...props} />
  </div>
);

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, ...props }) => (
  <thead
    className={cn(
      'border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/75 dark:bg-zinc-900/90 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none',
      className
    )}
    {...props}
  />
);

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody: React.FC<TableBodyProps> = ({ className, ...props }) => (
  <tbody
    className={cn('divide-y divide-slate-100 dark:divide-zinc-800/80 font-normal', className)}
    {...props}
  />
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => (
  <tr
    className={cn(
      'transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 text-slate-700 dark:text-zinc-300',
      className
    )}
    {...props}
  />
);

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => (
  <th
    className={cn('px-4 py-3 text-left font-semibold text-slate-500 dark:text-zinc-400', className)}
    {...props}
  />
);

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 align-middle', className)} {...props} />
);

