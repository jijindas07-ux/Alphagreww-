import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './auth.types';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'neutral' | 'indigo' | 'amber' | 'rose' | 'emerald';
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export interface PortalNavConfig {
  portalRole: UserRole;
  portalName: string;
  groups: NavGroup[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

