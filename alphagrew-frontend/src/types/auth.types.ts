export type UserRole =
  | 'super_admin'
  | 'institution_admin'
  | 'staff'
  | 'placement_officer'
  | 'student'
  | 'recruiter';

export type UserStatus = 'active' | 'pending_approval' | 'rejected' | 'suspended';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  title?: string;
  departmentCode?: string;
  departmentName?: string;
  designationName?: string;
  institutionId: number;
  institutionName: string;
  institutionCode: string;
  permissions: string[];
}

export interface RoleOption {
  role: UserRole;
  label: string;
  portalName: string;
  description: string;
  defaultPath: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'institution_admin',
    label: 'Institution Admin',
    portalName: 'Admin Portal',
    description: 'Campus master data, academic hierarchy, result publishing, and audit logs',
    defaultPath: '/admin/dashboard',
  },
  {
    role: 'staff',
    label: 'Staff / Faculty',
    portalName: 'Faculty Portal',
    description: 'Attendance marking, marks entry, subject allocations, and HOD moderation',
    defaultPath: '/staff/dashboard',
  },
  {
    role: 'placement_officer',
    label: 'Placement Officer',
    portalName: 'Placement Portal',
    description: 'Corporate recruitment drives, eligibility engine, and application pipeline',
    defaultPath: '/placement/dashboard',
  },
  {
    role: 'student',
    label: 'Student',
    portalName: 'Student Portal',
    description: 'Academic grade cards, attendance tracking, AI mock interviews, and career profile',
    defaultPath: '/student/dashboard',
  },
];

