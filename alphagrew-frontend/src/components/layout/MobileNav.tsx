import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_NAV_CONFIG,
  STAFF_NAV_CONFIG,
  PLACEMENT_NAV_CONFIG,
  STUDENT_NAV_CONFIG,
} from '@/utils/navigation';
import { IconButton, Badge } from '@/design-system';
import { ROLE_OPTIONS } from '@/types/auth.types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, activeRole, switchRole, isHod, toggleHodRole } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const navConfig =
    activeRole === 'staff'
      ? !isHod
        ? { ...STAFF_NAV_CONFIG, groups: STAFF_NAV_CONFIG.groups.filter((g) => g.id !== 'hod') }
        : STAFF_NAV_CONFIG
      : activeRole === 'placement_officer'
      ? PLACEMENT_NAV_CONFIG
      : activeRole === 'student'
      ? STUDENT_NAV_CONFIG
      : ADMIN_NAV_CONFIG;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              AG
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              {user.institutionName}
            </span>
          </div>
          <IconButton aria-label="Close navigation" onClick={onClose} size="sm">
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Portal Switcher in Mobile Nav */}
        <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Switch Portal:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => {
                  switchRole(opt.role);
                  onClose();
                }}
                className={cn(
                  'px-2 py-1.5 rounded-md text-[11px] font-medium text-left truncate transition-colors',
                  activeRole === opt.role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60'
                )}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {activeRole === 'staff' && (
            <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
              <button
                type="button"
                onClick={toggleHodRole}
                className={cn(
                  'w-full px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between',
                  isHod
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                )}
              >
                <span>HOD Mode: {isHod ? 'Enabled' : 'Disabled'}</span>
                <span className="text-[10px] font-semibold underline">Toggle</span>
              </button>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navConfig.groups.map((group) => (
            <div key={group.id} className="space-y-1">
              <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge size="sm" variant={item.badgeVariant || 'neutral'}>
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
