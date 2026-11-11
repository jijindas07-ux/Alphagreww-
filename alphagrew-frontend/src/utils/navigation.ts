import {
  LayoutDashboard,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  UserPlus,
  Clock,
  Award,
  Briefcase,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  BrainCircuit,
  PieChart,
  Bell,
  FileCheck2,
  Receipt,
} from 'lucide-react';
import type { PortalNavConfig } from '@/types/common.types';

export const ADMIN_NAV_CONFIG: PortalNavConfig = {
  portalRole: 'institution_admin',
  portalName: 'Admin Portal',
  groups: [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'admin-dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { id: 'admin-announcements', label: 'Announcements', path: '/admin/announcements', icon: Bell, badge: 2 },
      ],
    },
    {
      id: 'academics',
      label: 'Academics & Structure',
      items: [
        { id: 'admin-departments', label: 'Departments', path: '/admin/departments', icon: Building2 },
        { id: 'admin-courses', label: 'Courses & Subjects', path: '/admin/courses', icon: BookOpen },
        { id: 'admin-batches', label: 'Batches & Cohorts', path: '/admin/batches', icon: Users },
        { id: 'admin-attendance-audit', label: 'Attendance Audit', path: '/admin/attendance', icon: Clock },
        { id: 'admin-marks-engine', label: 'Marks & Results', path: '/admin/marks-engine', icon: Award, badge: '5-Stage', badgeVariant: 'indigo' },
      ],
    },
    {
      id: 'people',
      label: 'Campus Community',
      items: [
        { id: 'admin-students', label: 'Students', path: '/admin/students', icon: GraduationCap },
        { id: 'admin-staff', label: 'Staff & Faculty', path: '/admin/staff', icon: Users },
        { id: 'admin-onboarding', label: 'Onboarding & Approvals', path: '/admin/onboarding', icon: UserPlus, badge: 4, badgeVariant: 'amber' },
      ],
    },
    {
      id: 'placement',
      label: 'Corporate & Finance',
      items: [
        { id: 'admin-placement', label: 'Placement Oversight', path: '/admin/placement', icon: Briefcase, badge: '8 Drives', badgeVariant: 'emerald' },
        { id: 'admin-finance', label: 'Finance & Fee Dues', path: '/admin/finance', icon: Receipt },
      ],
    },
    {
      id: 'system',
      label: 'Institution Settings',
      items: [
        { id: 'admin-settings', label: 'Branding & Campus', path: '/admin/settings', icon: Settings },
        { id: 'admin-roles', label: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },
        { id: 'admin-audit', label: 'Audit Logs', path: '/admin/audit', icon: FileCheck2 },
      ],
    },
  ],
};

export const STAFF_NAV_CONFIG: PortalNavConfig = {
  portalRole: 'staff',
  portalName: 'Faculty Portal',
  groups: [
    {
      id: 'overview',
      label: 'Teaching Dashboard',
      items: [
        { id: 'staff-dashboard', label: 'My Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
        { id: 'staff-allocations', label: 'Allocated Subjects', path: '/staff/allocations', icon: BookOpen },
        { id: 'staff-announcements', label: 'Announcements', path: '/staff/announcements', icon: Bell, badge: 2 },
      ],
    },
    {
      id: 'daily',
      label: 'Classroom & Grading',
      items: [
        { id: 'staff-attendance', label: 'Period Attendance', path: '/staff/attendance', icon: Clock },
        { id: 'staff-marks-entry', label: 'Marks Entry Grid', path: '/staff/marks-entry', icon: Award, badge: 'Due', badgeVariant: 'amber' },
        { id: 'staff-timetable', label: 'My Timetable', path: '/staff/timetable', icon: Calendar },
      ],
    },
    {
      id: 'hod',
      label: 'Department HOD Console',
      items: [
        { id: 'staff-hod-queue', label: 'Moderation Queue', path: '/staff/hod-queue', icon: CheckCircle2, badge: 3, badgeVariant: 'rose' },
        { id: 'staff-workload', label: 'Faculty Workload', path: '/staff/workload', icon: PieChart },
      ],
    },
    {
      id: 'account',
      label: 'Personal & Profile',
      items: [
        { id: 'staff-profile', label: 'Faculty Profile', path: '/staff/profile', icon: Users },
      ],
    },
  ],
};

export const PLACEMENT_NAV_CONFIG: PortalNavConfig = {
  portalRole: 'placement_officer',
  portalName: 'Placement Portal',
  groups: [
    {
      id: 'overview',
      label: 'Recruitment Hub',
      items: [
        { id: 'placement-dashboard', label: 'Placement Command', path: '/placement/dashboard', icon: LayoutDashboard },
        { id: 'placement-drives', label: 'Company Drives', path: '/placement/drives', icon: Briefcase, badge: 8, badgeVariant: 'emerald' },
      ],
    },
    {
      id: 'candidates',
      label: 'Candidates & Engine',
      items: [
        { id: 'placement-eligibility', label: 'Eligibility Evaluator', path: '/placement/eligibility', icon: Sparkles, badgeVariant: 'indigo' },
        { id: 'placement-applications', label: 'Applications Pipeline', path: '/placement/applications', icon: GraduationCap },
        { id: 'placement-reports', label: 'Batch Reports', path: '/placement/reports', icon: PieChart },
      ],
    },
  ],
};

export const STUDENT_NAV_CONFIG: PortalNavConfig = {
  portalRole: 'student',
  portalName: 'Student Portal',
  groups: [
    {
      id: 'academics',
      label: 'My Academics',
      items: [
        { id: 'student-dashboard', label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
        { id: 'student-progress', label: 'Grades & SGPA', path: '/student/grades', icon: Award },
        { id: 'student-attendance', label: 'Attendance Tracker', path: '/student/attendance', icon: Clock, badge: '88%' },
        { id: 'student-timetable', label: 'Class Timetable', path: '/student/timetable', icon: Calendar },
      ],
    },
    {
      id: 'career',
      label: 'AI Career Hub',
      items: [
        { id: 'student-career-profile', label: 'Career Profile', path: '/student/profile', icon: GraduationCap },
        { id: 'student-resume-ats', label: 'Resume ATS Optimizer', path: '/student/resume', icon: Sparkles, badge: '86/100', badgeVariant: 'emerald' },
        { id: 'student-ai-mock', label: 'AI Mock Interview', path: '/student/ai-interview', icon: BrainCircuit, badge: 'Practice', badgeVariant: 'indigo' },
        { id: 'student-readiness', label: 'Placement Readiness', path: '/student/readiness', icon: PieChart },
      ],
    },
    {
      id: 'placement',
      label: 'Placement Drives',
      items: [
        { id: 'student-drives', label: 'Available Drives', path: '/student/drives', icon: Briefcase, badge: 5, badgeVariant: 'emerald' },
      ],
    },
  ],
};

