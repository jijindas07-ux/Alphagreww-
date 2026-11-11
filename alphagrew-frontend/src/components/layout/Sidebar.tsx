import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_NAV_CONFIG,
  STAFF_NAV_CONFIG,
  PLACEMENT_NAV_CONFIG,
  STUDENT_NAV_CONFIG,
} from '@/utils/navigation';
import { Badge } from '@/design-system';
import { ROLE_OPTIONS } from '@/types/auth.types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user, activeRole, switchRole, isHod, toggleHodRole } = useAuth();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  // Determine current active navigation config based on activeRole
  const navConfig = React.useMemo(() => {
    switch (activeRole) {
      case 'institution_admin':
      case 'super_admin':
        return ADMIN_NAV_CONFIG;
      case 'staff': {
        if (!isHod) {
          return {
            ...STAFF_NAV_CONFIG,
            groups: STAFF_NAV_CONFIG.groups.filter((g) => g.id !== 'hod'),
          };
        }
        return STAFF_NAV_CONFIG;
      }
      case 'placement_officer':
        return PLACEMENT_NAV_CONFIG;
      case 'student':
        return STUDENT_NAV_CONFIG;
      default:
        return ADMIN_NAV_CONFIG;
    }
  }, [activeRole, isHod]);

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col h-screen shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-all duration-200 ease-in-out select-none z-30',
        isCollapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* 1. Header & Tenant Identity */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs shrink-0">
            AG
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                {user.institutionName}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 tracking-wide uppercase">
                {user.institutionCode} · {navConfig.portalName}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Grouped Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navConfig.groups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'group flex items-center rounded-lg text-xs font-medium transition-all duration-150 relative',
                      isCollapsed
                        ? 'justify-center w-11 h-9 mx-auto'
                        : 'px-2.5 py-2 gap-2.5 justify-between',
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <Badge
                        size="sm"
                        variant={item.badgeVariant || 'neutral'}
                        className="shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {/* Active accent pill on left border */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Collapse Toggle when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. User Card & Mock Role Switcher */}
      <div className="p-3 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 shrink-0 relative">
        <div
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className={cn(
            'flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer',
            isCollapsed ? 'justify-center' : ''
          )}
          title="Click to switch portal / role"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {user.title || user.role}
              </p>
            </div>
          )}
          {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        </div>

        {/* Portal Switching Popup Menu */}
        {roleMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Portal (Dev Mode)
              </p>
            </div>
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => {
                  switchRole(opt.role);
                  setRoleMenuOpen(false);
                }}
                className={cn(
                  'w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer flex flex-col',
                  activeRole === opt.role
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                )}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                  {opt.portalName}
                </span>
              </button>
            ))}

            {activeRole === 'staff' && (
              <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-zinc-800 px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHodRole();
                  }}
                  className={cn(
                    'w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer',
                    isHod
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                  )}
                >
                  <span>Role: {isHod ? 'HOD (Dept Head)' : 'Regular Faculty'}</span>
                  <Badge size="sm" variant={isHod ? 'rose' : 'neutral'}>
                    {isHod ? 'HOD Active' : 'Staff Only'}
                  </Badge>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
