import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { IconButton, Badge } from '@/design-system';
import { ROLE_OPTIONS } from '@/types/auth.types';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav }) => {
  const { user, activeRole, switchRole, isHod, toggleHodRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Generate breadcrumbs from location path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const portalName = pathParts[0] || 'admin';
  const pageName = pathParts[1] || 'dashboard';

  const formatBreadcrumb = (str: string) => {
    return str
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <IconButton
          aria-label="Open mobile navigation"
          onClick={onOpenMobileNav}
          className="md:hidden"
          size="sm"
        >
          <Menu className="w-4 h-4" />
        </IconButton>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <span className="capitalize text-slate-400 dark:text-zinc-500">{portalName}</span>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            {formatBreadcrumb(pageName)}
          </span>
        </div>
      </div>

      {/* Right: Search, Portal Switcher, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search / Command Menu Pill */}
        <button
          type="button"
          onClick={() => alert('Search & Command Palette (Cmd + K)')}
          className="hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-slate-100/80 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-400 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Portal Switcher Pill (Dev-Friendly) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold hover:bg-indigo-100/80 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal:</span>
            <span className="capitalize">{activeRole.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Portal
                </p>
              </div>
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => {
                    switchRole(opt.role);
                    setRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col"
                >
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    {opt.description}
                  </span>
                </button>
              ))}

              {activeRole === 'staff' && (
                <div className="p-1.5 mt-1 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      toggleHodRole();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-between text-slate-800 dark:text-zinc-200"
                  >
                    <span>Toggle HOD: {isHod ? 'ON' : 'OFF'}</span>
                    <Badge size="sm" variant={isHod ? 'rose' : 'neutral'}>
                      {isHod ? 'HOD' : 'Faculty'}
                    </Badge>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Staff Role Mode Pill (HOD / Faculty quick toggle) */}
        {activeRole === 'staff' && (
          <button
            type="button"
            onClick={toggleHodRole}
            title="Click to toggle between HOD and regular Faculty role"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100/70"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Role:</span>
            <span className="font-semibold">{isHod ? 'HOD' : 'Faculty'}</span>
          </button>
        )}

        {/* Theme Toggle */}
        <IconButton
          aria-label="Toggle color theme"
          onClick={toggleTheme}
          size="sm"
          className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </IconButton>

        {/* Notifications Popover */}
        <div className="relative">
          <IconButton
            aria-label="View notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            size="sm"
            className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-zinc-950" />
          </IconButton>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-72 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Notifications
                </span>
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    Google SDE Drive Scheduled
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Eligible CSE/IT students notified for Nov 24.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    4 Student Registrations
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Awaiting administrative approval in onboarding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 ring-2 ring-indigo-500/20">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
