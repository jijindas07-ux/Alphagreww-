import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Users,
  GraduationCap,
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
  Input,
  Modal,
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { useAuth } from '@/hooks/useAuth';
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { HodModerationItem } from '@/types/staff.types';

export const HodModerationQueueView: React.FC = () => {
  const queryClient = useQueryClient();
  const { isHod, toggleHodRole } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');
  const [selectedItem, setSelectedItem] = useState<HodModerationItem | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<HodModerationItem | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Queries
  const { data: queue = [], isLoading: isLoadingQueue } = useQuery({
    queryKey: ['staff-hod-queue'],
    queryFn: () => mockStaffService.getHodModerationQueue(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['staff-department-analytics'],
    queryFn: () => mockStaffService.getDepartmentAnalytics(),
  });

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: ({ queueId, notes }: { queueId: number; notes?: string }) => {
      return mockStaffService.verifyHodRoster(queueId, notes);
    },
    onSuccess: (verified) => {
      queryClient.invalidateQueries({ queryKey: ['staff-hod-queue'] });
      queryClient.invalidateQueries({ queryKey: ['staff-marks-rosters'] });
      queryClient.invalidateQueries({ queryKey: ['staff-summary'] });
      setSelectedItem(null);
      addToast({
        title: 'Marks Roster Verified & Endorsed',
        description: `${verified.subjectCode} (${verified.assessmentName}) verified by HOD. Ready for final Dean sign-off.`,
        type: 'success',
      });
    },
  });

  const returnMutation = useMutation({
    mutationFn: ({ queueId, reason }: { queueId: number; reason: string }) => {
      return mockStaffService.returnHodRoster(queueId, reason);
    },
    onSuccess: (returned) => {
      queryClient.invalidateQueries({ queryKey: ['staff-hod-queue'] });
      queryClient.invalidateQueries({ queryKey: ['staff-marks-rosters'] });
      queryClient.invalidateQueries({ queryKey: ['staff-summary'] });
      setReturnModalItem(null);
      setReturnReason('');
      if (selectedItem?.id === returned.id) setSelectedItem(null);
      addToast({
        title: 'Marks Roster Returned to Faculty',
        description: `Returned ${returned.subjectCode} with feedback to instructor ${returned.facultyName}.`,
        type: 'warning',
      });
    },
  });

  // Non-HOD Guard Screen
  if (!isHod) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="HOD Moderation & Quality Console"
          subtitle="Department Head administrative authority is required to review and verify marks rosters."
          badge={<Badge variant="neutral">Restricted Access</Badge>}
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Head of Department Authorization Required
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            You are currently logged in as regular faculty. To inspect and test moderation queues, approve faculty mark submissions, and view departmental performance analytics, toggle into HOD mode.
          </p>
          <div className="mt-5">
            <Button
              size="md"
              variant="primary"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              onClick={toggleHodRole}
            >
              Simulate: Enable HOD Role Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const pendingQueue = queue.filter((q) => q.status === 'submitted');
  const verifiedQueue = queue.filter((q) => q.status === 'verified');

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Department HOD Moderation & Quality Console"
        subtitle="Computer Science & Engineering · Scrutinize faculty mark sheets, evaluate academic performance, and endorse grading curves."
        badge={
          <Badge variant="rose" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
            HOD Authorization
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'queue' ? 'primary' : 'outline'}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('queue')}
            >
              Moderation Queue ({pendingQueue.length})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'analytics' ? 'primary' : 'outline'}
              leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('analytics')}
            >
              Department Analytics
            </Button>
          </div>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Awaiting HOD Sign-off"
          value={`${pendingQueue.length} Rosters`}
          secondaryText="From department instructors"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
        />
        <StatCard
          label="Verified This Cycle"
          value={`${verifiedQueue.length} Rosters`}
          secondaryText="Forwarded to Dean"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Department Pass Rate"
          value={`${analytics?.overallPassPercentage || 89.2}%`}
          secondaryText="Across 580 CSE Scholars"
          icon={<GraduationCap className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          label="Faculty Teaching Strength"
          value={`${analytics?.totalFaculty || 42} Faculty`}
          secondaryText="4 Overloaded, 1 Underloaded"
          icon={<Users className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
      </div>

      {/* 3. TAB: MODERATION QUEUE */}
      {activeTab === 'queue' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle>Faculty Submissions Queue</CardTitle>
              <CardDescription>
                Examine score distribution, pass ratios, and individual student marks before formal verification
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingQueue ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : queue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Moderation queue clear"
                description="All submitted faculty mark rosters have been reviewed."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <th className="p-3">Subject & Assessment</th>
                      <th className="p-3">Instructor / Faculty</th>
                      <th className="p-3">Cohort</th>
                      <th className="p-3">Class Average</th>
                      <th className="p-3">Pass Percentage</th>
                      <th className="p-3">Submission Timestamp</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {queue.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="p-3">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                            {item.subjectCode}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-zinc-100">
                            {item.subjectName}
                          </span>
                          <p className="text-[10px] text-slate-500">{item.assessmentName}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            {item.facultyName}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400">
                            {item.facultyEmployeeId}
                          </p>
                        </td>
                        <td className="p-3 text-slate-500">
                          {item.batchName} · Sec {item.section} ({item.totalStudents} students)
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {item.averageMarks} / {item.maxMarks}
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={item.passPercentage >= 85 ? 'emerald' : 'amber'}
                          >
                            {item.passPercentage}%
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          {item.submittedAt}
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={
                              item.status === 'verified'
                                ? 'emerald'
                                : item.status === 'returned'
                                ? 'rose'
                                : 'amber'
                            }
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                              className="text-xs h-7"
                            >
                              Inspect
                            </Button>
                            {item.status === 'submitted' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => verifyMutation.mutate({ queueId: item.id })}
                                  isLoading={verifyMutation.isPending}
                                  className="text-xs h-7"
                                >
                                  Verify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setReturnModalItem(item)}
                                  className="text-xs h-7"
                                >
                                  Return
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. TAB: DEPARTMENT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {analytics?.semesterBreakdown.map((sem, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {sem.semester}
                  </span>
                  <Badge variant="indigo" size="sm">
                    Avg SGPA: {sem.averageSgpa}
                  </Badge>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Pass Rate</span>
                      <span className="font-semibold text-emerald-600">{sem.passRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sem.passRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Attendance Compliance</span>
                      <span className="font-semibold text-sky-600">{sem.attendance}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${sem.attendance}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Quality Alerts</CardTitle>
              <CardDescription>Automated risk indicators flagged by the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    14 Scholars with Attendance Below 75% Threshold
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                    CSE 5th Semester Section B has 8 scholars nearing debarment. Advisory notifications have been triggered to parent guardians.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sky-900 dark:text-sky-200">
                    Syllabus Completion Pace on Track
                  </h4>
                  <p className="text-sky-700 dark:text-sky-300 mt-0.5">
                    Department average syllabus completion is at 64.5% vs scheduled 60% milestone for Week 10.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. Detail SlideOver Drawer to Inspect Student Marks */}
      <SlideOverDrawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={`${selectedItem?.subjectCode}: ${selectedItem?.subjectName}`}
        description={`${selectedItem?.assessmentName} · Instructor: ${selectedItem?.facultyName}`}
        width="lg"
      >
        {selectedItem && (
          <div className="space-y-5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Cohort</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedItem.batchName} ({selectedItem.section})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Average Score</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedItem.averageMarks} / {selectedItem.maxMarks}
                </span>
              </div>
            </div>

            {/* Entries list */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                Student Marks Breakdown
              </h4>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800">
                    <tr className="text-slate-500 font-semibold text-[10px]">
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Student</th>
                      <th className="p-2.5 text-center">Score</th>
                      <th className="p-2.5 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {selectedItem.entries?.map((e) => (
                      <tr key={e.studentId}>
                        <td className="p-2.5 font-mono">{e.rollNo}</td>
                        <td className="p-2.5 font-medium">{e.studentName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {e.isAbsent ? 'ABS' : e.marks}
                        </td>
                        <td className="p-2.5 text-right">
                          <Badge size="sm" variant={e.grade === 'F' ? 'rose' : 'emerald'}>
                            {e.grade || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Endorsement actions in drawer */}
            {selectedItem.status === 'submitted' && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setReturnModalItem(selectedItem);
                  }}
                >
                  Return with Comments
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate({ queueId: selectedItem.id })}
                >
                  Verify & Endorse
                </Button>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>

      {/* 6. Return Submission Modal */}
      <Modal
        isOpen={Boolean(returnModalItem)}
        onClose={() => setReturnModalItem(null)}
        title="Return Marks Roster to Instructor"
        description="Provide a mandatory reason or instructions for the instructor to revise the scores before re-submitting."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReturnModalItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!returnReason.trim()}
              isLoading={returnMutation.isPending}
              onClick={() => {
                if (returnModalItem) {
                  returnMutation.mutate({
                    queueId: returnModalItem.id,
                    reason: returnReason,
                  });
                }
              }}
            >
              Confirm & Return Roster
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Mandatory Return Comments / Feedback"
            placeholder="e.g. Please re-evaluate question 4 scoring for section B or verify absentee medical leaves."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
};
