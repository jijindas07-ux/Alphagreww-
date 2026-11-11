import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardOverview } from '@/portals/admin/DashboardOverview';
import { DepartmentsView } from '@/portals/admin/organization/DepartmentsView';
import { CoursesView } from '@/portals/admin/organization/CoursesView';
import { BatchesView } from '@/portals/admin/cohorts/BatchesView';
import { StudentsDirectoryView } from '@/portals/admin/people/StudentsDirectoryView';
import { StaffDirectoryView } from '@/portals/admin/people/StaffDirectoryView';
import { OnboardingView } from '@/portals/admin/people/OnboardingView';
import { AttendanceAuditView } from '@/portals/admin/attendance/AttendanceAuditView';
import { MarksEngineView } from '@/portals/admin/marks/MarksEngineView';
import { PlacementOversightView } from '@/portals/admin/placement/PlacementOversightView';
import { FinanceView } from '@/portals/admin/finance/FinanceView';
import { SystemSettingsView } from '@/portals/admin/system/SystemSettingsView';
import { FacultyDashboard } from '@/portals/staff/FacultyDashboard';
import { StaffAllocationsView } from '@/portals/staff/allocations/StaffAllocationsView';
import { PeriodAttendanceView } from '@/portals/staff/attendance/PeriodAttendanceView';
import { StaffMarksEntryView } from '@/portals/staff/marks/StaffMarksEntryView';
import { StaffTimetableView } from '@/portals/staff/timetable/StaffTimetableView';
import { HodModerationQueueView } from '@/portals/staff/hod/HodModerationQueueView';
import { FacultyWorkloadView } from '@/portals/staff/hod/FacultyWorkloadView';
import { StaffAnnouncementsView } from '@/portals/staff/announcements/StaffAnnouncementsView';
import { StaffProfileView } from '@/portals/staff/profile/StaffProfileView';
import { PlacementDashboard } from '@/portals/placement/PlacementDashboard';
import { StudentDashboard } from '@/portals/student/StudentDashboard';
import { StudentAcademicHubView } from '@/portals/student/StudentAcademicHubView';
import { StudentResultsView } from '@/portals/student/StudentResultsView';
import { StudentProfileView } from '@/portals/student/StudentProfileView';
import { StudentPlacementDrivesView } from '@/portals/student/StudentPlacementDrivesView';
import { UnderConstructionView } from '@/portals/common/UnderConstructionView';
import { useAuth } from '@/hooks/useAuth';

export const AppRoutes: React.FC = () => {
  const { activeRole } = useAuth();

  // Root redirect based on active role
  const getRootRedirect = () => {
    switch (activeRole) {
      case 'staff':
        return '/staff/dashboard';
      case 'placement_officer':
        return '/placement/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />

        {/* 1. Admin Portal Routes */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="announcements" element={<UnderConstructionView title="Announcements Broadcast" backPath="/admin/dashboard" />} />

          {/* Organization */}
          <Route path="departments" element={<DepartmentsView />} />
          <Route path="courses" element={<CoursesView />} />

          {/* Cohorts */}
          <Route path="batches" element={<BatchesView />} />

          {/* People */}
          <Route path="students" element={<StudentsDirectoryView />} />
          <Route path="staff" element={<StaffDirectoryView />} />
          <Route path="onboarding" element={<OnboardingView />} />

          {/* Academics */}
          <Route path="attendance" element={<AttendanceAuditView />} />
          <Route path="marks-engine" element={<MarksEngineView />} />

          {/* Corporate & Finance */}
          <Route path="placement" element={<PlacementOversightView />} />
          <Route path="finance" element={<FinanceView />} />

          {/* System Settings */}
          <Route path="settings" element={<SystemSettingsView />} />
          <Route path="roles" element={<SystemSettingsView />} />
          <Route path="audit" element={<SystemSettingsView />} />
        </Route>

        {/* 2. Staff / Faculty Portal Routes */}
        <Route path="/staff">
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="allocations" element={<StaffAllocationsView />} />
          <Route path="attendance" element={<PeriodAttendanceView />} />
          <Route path="marks-entry" element={<StaffMarksEntryView />} />
          <Route path="timetable" element={<StaffTimetableView />} />
          <Route path="hod-queue" element={<HodModerationQueueView />} />
          <Route path="workload" element={<FacultyWorkloadView />} />
          <Route path="announcements" element={<StaffAnnouncementsView />} />
          <Route path="profile" element={<StaffProfileView />} />
        </Route>

        {/* 3. Placement Officer Portal Routes */}
        <Route path="/placement">
          <Route index element={<Navigate to="/placement/dashboard" replace />} />
          <Route path="dashboard" element={<PlacementDashboard />} />
          <Route path="drives" element={<UnderConstructionView title="Company Drives & Rounds" backPath="/placement/dashboard" />} />
          <Route path="eligibility" element={<UnderConstructionView title="Student Eligibility Evaluator" backPath="/placement/dashboard" />} />
          <Route path="applications" element={<UnderConstructionView title="Candidate Applications Kanban" backPath="/placement/dashboard" />} />
          <Route path="reports" element={<UnderConstructionView title="Batch Placement Reports" backPath="/placement/dashboard" />} />
        </Route>

        {/* 4. Student Portal Routes */}
        <Route path="/student">
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="academic" element={<StudentAcademicHubView />} />
          <Route path="grades" element={<StudentResultsView />} />
          <Route path="attendance" element={<StudentAcademicHubView />} />
          <Route path="timetable" element={<StudentAcademicHubView />} />
          <Route path="profile" element={<StudentProfileView />} />
          <Route path="drives" element={<StudentPlacementDrivesView />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
