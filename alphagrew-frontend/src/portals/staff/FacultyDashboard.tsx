import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Users,
  Bell,
  Check,
  ShieldCheck,
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
  Skeleton,
} from '@/design-system';
import { useAuth } from '@/hooks/useAuth';
import { mockStaffService } from '@/services/mock/mockStaffService';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isHod, toggleHodRole } = useAuth();

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['staff-summary'],
    queryFn: () => mockStaffService.getStaffDashboardSummary(),
  });

  const { data: schedule = [], isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['staff-today-schedule'],
    queryFn: () => mockStaffService.getTodaySchedule(),
  });

  const { data: allocated = [], isLoading: isLoadingAllocated } = useQuery({
    queryKey: ['staff-allocated-subjects'],
    queryFn: () => mockStaffService.getAllocatedSubjects(),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['staff-announcements-recent'],
    queryFn: () => mockStaffService.getAnnouncements(),
  });

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const pendingAttendanceSessions = schedule.filter((s) => !s.attendanceMarked);

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Greeting */}
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle={`${user.title} · ${user.departmentName} (${user.departmentCode}) · Academic Term 2026-2027`}
        badge={
          isHod ? (
            <Badge variant="rose" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
              Department HOD Active
            </Badge>
          ) : (
            <Badge variant="indigo" size="md">
              Faculty Instructional Workspace
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleHodRole}
              className="text-xs"
            >
              Simulate: {isHod ? 'Switch to Regular Staff' : 'Switch to HOD'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Clock className="w-3.5 h-3.5" />}
              onClick={() => navigate('/staff/attendance')}
            >
              Mark Attendance
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Award className="w-3.5 h-3.5" />}
              onClick={() => navigate('/staff/marks-entry')}
            >
              Enter Marks
            </Button>
          </div>
        }
      />

      {/* 2. Top Banner / Pending Alerts if any */}
      {pendingAttendanceSessions.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {pendingAttendanceSessions.length} Attendance Session(s) Pending for Today
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Next up: {pendingAttendanceSessions[0].subjectCode} - {pendingAttendanceSessions[0].subjectName} ({pendingAttendanceSessions[0].timeSlot})
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/staff/attendance')}
            className="shrink-0 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            Mark Session Now
          </Button>
        </div>
      )}

      {/* 3. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Teaching Load"
          value={isLoadingSchedule ? '...' : `${schedule.length} Classes`}
          secondaryText={schedule.length > 0 ? `${schedule.filter(s => s.attendanceMarked).length} completed · ${pendingAttendanceSessions.length} pending` : 'No classes today'}
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          label="Allocated Subjects"
          value={isLoadingAllocated ? '...' : `${allocated.length} Subjects`}
          secondaryText="CS501, CS502, CS506, CS701"
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Pending Marks Rosters"
          value={isLoadingSummary ? '...' : `${summary?.pendingMarksCount || 0} Draft`}
          delta={{ value: summary?.pendingMarksCount || 0, trend: 'neutral', label: 'Due Nov 14' }}
          icon={<Award className="w-5 h-5" />}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        {isHod ? (
          <StatCard
            label="HOD Moderation Queue"
            value={isLoadingSummary ? '...' : `${summary?.hodModerationCount || 0} Awaiting`}
            delta={{ value: summary?.hodModerationCount || 0, trend: 'up', label: 'Faculty submissions' }}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
          />
        ) : (
          <StatCard
            label="Avg Student Attendance"
            value={isLoadingSummary ? '...' : `${summary?.averageDepartmentAttendance || 88.6}%`}
            secondaryText="Across all allocated batches"
            icon={<Users className="w-5 h-5" />}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          />
        )}
      </div>

      {/* 4. Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/staff/attendance')}
          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Period Attendance</h4>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Mark roll call or submit drafts</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/staff/marks-entry')}
          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Marks Entry Grid</h4>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">IA-1, IA-2, and Lab records</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/staff/timetable')}
          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Weekly Timetable</h4>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Slots, lecture halls & labs</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/staff/announcements')}
          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Bell className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Announcements</h4>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Notices & departmental circulars</p>
        </button>
      </div>

      {/* 5. Main Dashboard Split: Today's Schedule + Allocated Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Today's Teaching Schedule
                </CardTitle>
                <CardDescription>{currentDateFormatted} · Scheduled lectures & labs</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/staff/timetable')}
                className="text-xs"
              >
                Full Timetable
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingSchedule ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : schedule.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No classes scheduled for today.
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule.map((period) => (
                    <div
                      key={period.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/30 dark:bg-zinc-900/40"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-14 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Slot</span>
                          <span className="text-xs font-mono font-bold">P{period.periodNumber}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {period.subjectCode}: {period.subjectName}
                            </span>
                            <Badge
                              size="sm"
                              variant={period.sessionType === 'Lab' ? 'purple' : 'neutral'}
                            >
                              {period.sessionType}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            {period.timeSlot} · {period.roomNumber} · {period.batchName} ({period.section}) · {period.enrolledStudentsCount} students
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {period.attendanceMarked ? (
                          <Badge variant="emerald" size="md" className="gap-1 py-1 px-2.5">
                            <Check className="w-3.5 h-3.5" />
                            Submitted
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate('/staff/attendance')}
                            className="text-xs h-8"
                          >
                            Mark Attendance
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocated Subjects Progress Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  Assigned Subjects & Syllabus Progress
                </CardTitle>
                <CardDescription>Curriculum progression and average attendance rates</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/staff/allocations')}
                className="text-xs"
              >
                View Syllabus
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAllocated ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {allocated.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => navigate('/staff/allocations')}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {sub.subjectCode}
                          </span>
                          <Badge
                            size="sm"
                            variant={
                              sub.internalMarksStatus === 'verified'
                                ? 'emerald'
                                : sub.internalMarksStatus === 'submitted'
                                ? 'sky'
                                : 'amber'
                            }
                          >
                            Marks: {sub.internalMarksStatus}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-1 line-clamp-1">
                          {sub.subjectName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {sub.batchName} · Sec {sub.section} · {sub.totalEnrolled} Students
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                          <span>Syllabus Covered</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {sub.syllabusCompletionPercentage}% ({sub.completedTopicsCount}/{sub.totalTopicsCount})
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                            style={{ width: `${sub.syllabusCompletionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deadlines, HOD alerts, Announcements */}
        <div className="space-y-6">
          {/* Marks Deadlines Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Marks Submission Deadlines
              </CardTitle>
              <CardDescription>Upcoming internal assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    CS506: Lab Evaluation
                  </span>
                  <Badge variant="amber" size="sm">
                    Draft Pending
                  </Badge>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Due: Nov 18, 2026 (Mid-term practicals)
                </p>
                <div className="mt-2.5 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/staff/marks-entry')}
                    className="text-[11px] h-7 px-2.5"
                  >
                    Resume Entry
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    CS701: IA-1 Roster
                  </span>
                  <Badge variant="neutral" size="sm">
                    Due Nov 20
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Advanced Cloud Computing · Sem 7
                </p>
              </div>
            </CardContent>
          </Card>

          {/* If HOD: Moderation Quick Card */}
          {isHod && (
            <Card className="border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    HOD Moderation Queue
                  </CardTitle>
                  <Badge variant="rose" size="sm">
                    3 Awaiting
                  </Badge>
                </div>
                <CardDescription>
                  Faculty mark rosters submitted for departmental verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-950/60">
                    <span>CS502: Compiler Design</span>
                    <span className="font-semibold text-rose-700 dark:text-rose-300">Needs Approval</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-950/60">
                    <span>CS503: Database Systems</span>
                    <span className="font-semibold text-rose-700 dark:text-rose-300">Prof. Anand</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => navigate('/staff/hod-queue')}
                  className="w-full mt-2 text-xs"
                >
                  Review Queue Entries
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Circulars / Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Department Circulars
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/staff/announcements')}
                className="text-xs p-1 h-auto"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => navigate('/staff/announcements')}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                      {ann.title}
                    </span>
                    {!ann.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                    <span>{ann.authorName} ({ann.authorRole})</span>
                    <span>{ann.postedDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
