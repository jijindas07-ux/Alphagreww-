import React, { createContext, useContext, useState } from 'react';
import type { UserRole, UserSession } from '@/types/auth.types';

interface AuthContextValue {
  user: UserSession;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  isRole: (role: UserRole) => boolean;
  isHod: boolean;
  toggleHodRole: () => void;
}

const mockSessionsByRole: Record<UserRole, UserSession> = {
  super_admin: {
    id: 1,
    name: 'Dr. Robert Vance',
    email: 'robert.vance@alphagrew.ai',
    role: 'super_admin',
    status: 'active',
    title: 'Platform System Administrator',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: ['all'],
  },
  institution_admin: {
    id: 2,
    name: 'Prof. Evelyn Reed',
    email: 'evelyn.reed@apex.edu',
    role: 'institution_admin',
    status: 'active',
    title: 'Dean of Academic Affairs',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: [
      'dashboard.view',
      'students.view',
      'students.create',
      'departments.view',
      'departments.create',
      'marks.view',
      'marks.publish',
      'placement.view',
      'activity.view',
    ],
  },
  staff: {
    id: 3,
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@apex.edu',
    role: 'staff',
    status: 'active',
    title: 'Associate Professor & HOD',
    departmentCode: 'CSE',
    departmentName: 'Computer Science & Engineering',
    designationName: 'Head of Department',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: [
      'dashboard.view',
      'students.view',
      'attendance.view',
      'attendance.mark',
      'marks.view',
      'marks.create',
      'marks.approve',
    ],
  },
  placement_officer: {
    id: 4,
    name: 'Vikram Mehta',
    email: 'vikram.mehta@apex.edu',
    role: 'placement_officer',
    status: 'active',
    title: 'Head of Training & Placements (TPO)',
    designationName: 'Placement Officer',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: [
      'dashboard.view',
      'students.view',
      'placement.view',
      'placement.create',
      'placement.manage',
      'reports.view',
    ],
  },
  student: {
    id: 5,
    name: 'Devon Patel',
    email: 'devon.patel@student.apex.edu',
    role: 'student',
    status: 'active',
    title: 'Final Year B.Tech Scholar',
    departmentCode: 'CSE',
    departmentName: 'Computer Science & Engineering',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: [
      'dashboard.view',
      'profile.view',
      'profile.edit',
      'marks.view',
      'attendance.view',
      'placement.view',
      'placement.apply',
      'resumes.manage',
      'interviews.practice',
    ],
  },
  recruiter: {
    id: 6,
    name: 'Elena Rostova',
    email: 'elena.r@google.com',
    role: 'recruiter',
    status: 'active',
    title: 'University Talent Partner',
    institutionId: 1,
    institutionName: 'Apex Institute of Technology',
    institutionCode: 'APEX',
    permissions: [],
  },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'alphagrew_active_mock_role';
const HOD_STORAGE_KEY = 'alphagrew_mock_is_hod';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    return saved && mockSessionsByRole[saved] ? saved : 'institution_admin';
  });

  const [isHod, setIsHod] = useState<boolean>(() => {
    const saved = localStorage.getItem(HOD_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY, role);
  };

  const toggleHodRole = () => {
    setIsHod((prev) => {
      const next = !prev;
      localStorage.setItem(HOD_STORAGE_KEY, String(next));
      return next;
    });
  };

  const isRole = (role: UserRole) => activeRole === role;

  const baseUser = mockSessionsByRole[activeRole];
  const user: UserSession = React.useMemo(() => {
    if (activeRole === 'staff') {
      return {
        ...baseUser,
        title: isHod ? 'Associate Professor & HOD' : 'Assistant Professor',
        designationName: isHod ? 'Head of Department' : 'Assistant Professor',
        permissions: isHod
          ? ['dashboard.view', 'students.view', 'attendance.view', 'attendance.mark', 'marks.view', 'marks.create', 'marks.approve', 'department.hod']
          : ['dashboard.view', 'students.view', 'attendance.view', 'attendance.mark', 'marks.view', 'marks.create'],
      };
    }
    return baseUser;
  }, [activeRole, baseUser, isHod]);

  return (
    <AuthContext.Provider value={{ user, activeRole, switchRole, isRole, isHod, toggleHodRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
