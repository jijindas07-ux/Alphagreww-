import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Briefcase,
  TrendingUp,
  Download,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Modal,
  SlideOverDrawer,
  Input,
  useToast,
} from '@/design-system';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { DashboardSummary, YearTrendPoint } from '@/services/mock/mockDb';
import type { Department } from '@/types/academic.types';
import type { PlacementDrive, PendingRegistration, ActivityFeedItem } from '@/types/placement.types';

export const DashboardOverview: React.FC = () => {
  const { success, error, info } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [yearTrends, setYearTrends] = useState<YearTrendPoint[]>([]);
  const [placementDrives, setPlacementDrives] = useState<PlacementDrive[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);

  // Modals & Drawers state
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [rejectingItem, setRejectingItem] = useState<PendingRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Load all initial data from mockAdminService
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sum, depts, trends, drives, registrations, acts] = await Promise.all([
        mockAdminService.getDashboardSummary(),
        mockAdminService.getDepartments(),
        mockAdminService.getYearTrends(),
        mockAdminService.getUpcomingPlacementDrives(),
        mockAdminService.getPendingRegistrations(),
        mockAdminService.getActivityFeed(),
      ]);

      setSummary(sum);
      setDepartments(depts);
      setYearTrends(trends);
      setPlacementDrives(drives);
      setPendingRegistrations(registrations);
      setActivities(acts);
    } catch {
      error('Failed to load dashboard data', 'Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Approving a Registration
  const handleApproveRegistration = async (reg: PendingRegistration) => {
    setIsSubmittingAction(true);
    try {
      await mockAdminService.approveRegistration(reg.id);
      success('Student Approved', `${reg.name} has been enrolled in ${reg.departmentCode}.`);
      await loadDashboardData();
    } catch {
      error('Error approving student', 'An unexpected error occurred.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Rejecting a Registration
  const handleConfirmRejection = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      error('Reason Required', 'Please state the reason for rejecting the registration.');
      return;
    }

    setIsSubmittingAction(true);
    try {
      await mockAdminService.rejectRegistration(rejectingItem.id, rejectionReason);
      info('Registration Rejected', `${rejectingItem.name} was rejected with reason.`);
      setRejectingItem(null);
      setRejectionReason('');
      await loadDashboardData();
    } catch {
      error('Error rejecting student', 'An unexpected error occurred.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Compute Total Enrollment Capacity across all depts
  const totalIntake = departments.reduce((acc, d) => acc + d.intake, 0);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Title, Term Badge, and Action Buttons */}
      <PageHeader
        title="Institution Overview"
        subtitle="Academic performance metrics, campus operations, and placement intelligence for Academic Year 2026-27."
        badge={
          <Badge variant="indigo" size="md" dot>
            Semester 5 & 7 In-Session
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={isLoading ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} />}
              onClick={loadDashboardData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => success('Report Generated', 'Compliance summary exported as PDF.')}
            >
              Export Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Briefcase className="w-3.5 h-3.5" />}
              onClick={() => info('New Drive', 'Opening drive creation wizard...')}
            >
              New Placement Drive
            </Button>
          </>
        }
      />

      {/* 2. Primary KPI Stat Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled Students"
          value={isLoading || !summary ? '—' : summary.totalStudents.toLocaleString()}
          delta={{ value: summary?.totalStudentsDelta || 8.4, trend: 'up', label: 'vs last term' }}
          icon={<GraduationCap className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400"
          sparkline={[1420, 1560, 1680, 1750, 1842]}
        />
        <StatCard
          label="Faculty & Academic Staff"
          value={isLoading || !summary ? '—' : summary.totalStaff}
          delta={{ value: summary?.totalStaffDelta || 4.1, trend: 'up', label: '12:1 student ratio' }}
          icon={<Users className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400"
          sparkline={[112, 116, 120, 124, 128]}
        />
        <StatCard
          label="Active Placement Drives"
          value={isLoading || !summary ? '—' : `${summary.activePlacementDrives} Companies`}
          delta={{ value: 2, trend: 'up', label: '3 scheduled next week' }}
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
          sparkline={[4, 5, 6, 7, 8]}
        />
        <StatCard
          label="Overall Placement Rate"
          value={isLoading || !summary ? '—' : `${summary.placementRate}%`}
          delta={{ value: summary?.placementRateDelta || 5.2, trend: 'up', label: 'Avg 8.75 LPA' }}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
          sparkline={[72, 76, 79, 81, 85]}
        />
      </div>

      {/* 3. Middle Section: Trend Chart & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5-Year Enrollment & Placement Trend (8 Columns) */}
        <Card className="lg:col-span-8 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Enrollment & Placement Trajectory</CardTitle>
              <CardDescription>
                Five-year comparative growth between enrolled students and placed candidates.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
                Enrolled
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Placed
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {/* SVG Visual Bar/Area Chart */}
            <div className="h-64 w-full flex items-end justify-between gap-4 pt-4 pb-2 px-2 border-b border-slate-100 dark:border-zinc-800/80">
              {yearTrends.map((point) => {
                const maxEnrolled = 2000;
                const enrolledHeight = Math.round((point.enrolled / maxEnrolled) * 200);
                const placedHeight = Math.round((point.placed / maxEnrolled) * 200);
                const placementPercent = Math.round((point.placed / point.enrolled) * 100);

                return (
                  <div key={point.year} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {placementPercent}%
                    </div>
                    <div className="w-full flex items-end justify-center gap-1.5">
                      <div
                        style={{ height: `${enrolledHeight}px` }}
                        className="w-1/2 max-w-[36px] bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-t-md transition-all group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900"
                        title={`Enrolled: ${point.enrolled}`}
                      />
                      <div
                        style={{ height: `${placedHeight}px` }}
                        className="w-1/2 max-w-[36px] bg-emerald-500/90 rounded-t-md transition-all group-hover:bg-emerald-400 shadow-xs"
                        title={`Placed: ${point.placed}`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 font-mono">
                      {point.year}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Highlights */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">
                  Highest Package
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                  44.0 LPA (Google)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">
                  Average Package
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                  8.75 LPA
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">
                  Total Offers 2026
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                  1,558 Offers
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Department Distribution (4 Columns) */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle>Department Capacity</CardTitle>
            <CardDescription>
              Student strength and academic staffing across faculties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept) => {
              const share = Math.round((dept.studentCount / (summary?.totalStudents || 1842)) * 100);

              return (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dept.colorHex || '#6366F1' }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {dept.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-zinc-400 font-medium">
                      {dept.studentCount} ({share}%)
                    </span>
                  </div>

                  {/* Segmented Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${share}%`,
                        backgroundColor: dept.colorHex || '#6366F1',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                    <span>HOD: {dept.hodName}</span>
                    <span>{dept.staffCount} Faculty members</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <div className="p-4 bg-slate-50/60 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800/80 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Total Approved Intake</span>
            <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">
              {totalIntake} Seats / Year
            </span>
          </div>
        </Card>
      </div>

      {/* 4. Lower Section: Pending Onboarding & Upcoming Placement Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Student Self-Registration Approvals (6 Columns) */}
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Pending Onboarding Approvals</CardTitle>
                {pendingRegistrations.length > 0 && (
                  <Badge variant="amber" size="sm">
                    {pendingRegistrations.length} Pending
                  </Badge>
                )}
              </div>
              <CardDescription>
                Students who registered online requiring administrative verification.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => info('Onboarding', 'Navigating to master onboarding console...')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {pendingRegistrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All registration requests have been processed.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {pendingRegistrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </span>
                        <Badge size="sm" variant="neutral">
                          {item.departmentCode}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.registrationNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {item.email} · {item.year} · {item.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:border-emerald-800/60"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => handleApproveRegistration(item)}
                        disabled={isSubmittingAction}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => setRejectingItem(item)}
                        disabled={isSubmittingAction}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="p-3.5 px-5 bg-slate-50/60 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Automated email verification is enabled.</span>
            <span className="text-indigo-600 font-medium">Batch invite faculty →</span>
          </div>
        </Card>

        {/* Right: Upcoming Corporate Placement Drives (6 Columns) */}
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Placement Drives in Progress</CardTitle>
                <Badge variant="emerald" size="sm">
                  {placementDrives.length} Drives Active
                </Badge>
              </div>
              <CardDescription>
                Upcoming on-campus corporate recruitment rounds.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => info('Placement', 'Opening full drives pipeline...')}
            >
              All Drives
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {placementDrives.slice(0, 4).map((drive) => (
                <div
                  key={drive.id}
                  onClick={() => setSelectedDrive(drive)}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                        {drive.companyName}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {drive.packageOffered}
                      </Badge>
                      <Badge
                        variant={drive.status === 'ongoing' ? 'emerald' : 'sky'}
                        size="sm"
                      >
                        {drive.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {drive.roleTitle} · {drive.location}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Eligible: {drive.eligibleDepartments.join(', ')}</span>
                      <span>· Min CGPA: {drive.minimumCgpa}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="block text-xs font-bold font-mono text-slate-800 dark:text-zinc-200">
                        {drive.applicantsCount}
                      </span>
                      <span className="text-[10px] text-slate-400">applied</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-3.5 px-5 bg-slate-50/60 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Next Drive: Google Assessment on Nov 24</span>
            <span className="text-indigo-600 font-medium">Configure Eligibility Rules →</span>
          </div>
        </Card>
      </div>

      {/* 5. Live Campus Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>System & Campus Activity Stream</CardTitle>
            <CardDescription>
              Chronological immutable ledger of academic moderation, results, and placements.
            </CardDescription>
          </div>
          <Badge variant="neutral" size="sm">
            Live Telemetry
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {activities.map((act) => {
              const categoryBadge = {
                marks: { label: 'Examination', variant: 'indigo' as const },
                placement: { label: 'Placement', variant: 'emerald' as const },
                academic: { label: 'Academic', variant: 'sky' as const },
                onboarding: { label: 'Onboarding', variant: 'amber' as const },
                system: { label: 'System', variant: 'neutral' as const },
              }[act.category];

              return (
                <div
                  key={act.id}
                  className="p-3.5 px-5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {act.actorName}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-zinc-400">({act.actorRole})</span>{' '}
                      <span className="text-slate-600 dark:text-zinc-300">{act.action}</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {act.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge size="sm" variant={categoryBadge.variant}>
                      {categoryBadge.label}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 6. Rejection Modal */}
      <Modal
        isOpen={Boolean(rejectingItem)}
        onClose={() => setRejectingItem(null)}
        title="Reject Student Registration"
        description={`Provide a documented justification for rejecting ${rejectingItem?.name}'s self-registration application.`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRejectingItem(null)}
              disabled={isSubmittingAction}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmRejection}
              isLoading={isSubmittingAction}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason"
            placeholder="e.g. Invalid Roll Number / Discrepancy in enrollment records"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            helperText="The student will receive this notification and can re-submit after correction."
            required
            autoFocus
          />
        </div>
      </Modal>

      {/* 7. SlideOver Drawer: Placement Drive Details */}
      <SlideOverDrawer
        isOpen={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        title={selectedDrive?.companyName}
        subtitle={`${selectedDrive?.roleTitle} · ${selectedDrive?.packageOffered}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelectedDrive(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                info('Drive Console', `Opening management console for ${selectedDrive?.companyName}`);
                setSelectedDrive(null);
              }}
            >
              Manage Drive Roster
            </Button>
          </>
        }
      >
        {selectedDrive && (
          <div className="space-y-6 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Applicants
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-zinc-100">
                  {selectedDrive.applicantsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Shortlisted
                </span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  {selectedDrive.shortlistedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Selected
                </span>
                <span className="text-base font-bold font-mono text-indigo-600">
                  {selectedDrive.selectedCount}
                </span>
              </div>
            </div>

            {/* Criteria Box */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/30 border border-slate-200/70 dark:border-zinc-800">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Eligibility Criteria
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Minimum CGPA:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {selectedDrive.minimumCgpa} CGPA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Allowed Backlogs:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {selectedDrive.maxBacklogs} active
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Eligible Departments:</span>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {selectedDrive.eligibleDepartments.map((dept) => (
                      <Badge key={dept} size="sm" variant="indigo">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Selection Timeline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 flex justify-between">
                  <span>Round 1: Online Technical Aptitude</span>
                  <span className="font-mono text-slate-400">{selectedDrive.driveDate}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 flex justify-between">
                  <span>Round 2: System Design & Coding</span>
                  <span className="font-mono text-slate-400">+2 Days</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 flex justify-between">
                  <span>Round 3: Behavioral & HR Interview</span>
                  <span className="font-mono text-slate-400">+4 Days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};
