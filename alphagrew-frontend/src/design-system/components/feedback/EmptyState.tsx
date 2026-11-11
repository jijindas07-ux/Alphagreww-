import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '../button/Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'magic';
}

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateAction;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  const renderIcon = () => {
    if (!icon) return <Inbox className="w-5 h-5" />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5" />;
    }
    return icon as React.ReactNode;
  };

  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      const actionObj = action as EmptyStateAction;
      return (
        <Button size="sm" onClick={actionObj.onClick} variant={actionObj.variant || 'primary'}>
          {actionObj.label}
        </Button>
      );
    }
    return action as React.ReactNode;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/30',
        className
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mb-3">
        {renderIcon()}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{renderAction()}</div>}
    </div>
  );
};

