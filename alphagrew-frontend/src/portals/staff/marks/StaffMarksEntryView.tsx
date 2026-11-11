import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  AlertCircle,
  FileCheck,
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
  SearchInput,
  Modal,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { StaffStudentMarkEntry } from '@/types/staff.types';
import type { MarksWorkflowStage } from '@/types/marks.types';

const STAGE_STEPS: { stage: MarksWorkflowStage; label: string }[] = [
  { stage: 'draft', label: '1. Faculty Draft' },
  { stage: 'submitted', label: '2. Submitted to HOD' },
  { stage: 'verified', label: '3. HOD Verified' },
  { stage: 'approved', label: '4. Dean Approved' },
  { stage: 'locked', label: '5. Published' },
];

export const StaffMarksEntryView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [selectedRosterId, setSelectedRosterId] = useState<number>(3); // Defaults to CS506 Lab draft
  const [studentSearch, setStudentSearch] = useState('');

  // Assessment Configuration state (editable in Draft mode)
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [weightage, setWeightage] = useState<number>(20);
  const [passingMarks, setPassingMarks] = useState<number>(25);

  // Local student mark entries state
  const [entries, setEntries] = useState<StaffStudentMarkEntry[]>([]);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Queries
  const { data: rosters = [], isLoading: isLoadingRosters } = useQuery({
    queryKey: ['staff-marks-rosters'],
    queryFn: () => mockStaffService.getStaffMarksRosters(),
  });

  const selectedRoster = useMemo(() => {
    return rosters.find((r) => r.id === selectedRosterId) || rosters[0];
  }, [rosters, selectedRosterId]);

  // Sync state when selectedRoster changes
  useEffect(() => {
    if (selectedRoster) {
      setMaxMarks(selectedRoster.maxMarks);
      setWeightage(selectedRoster.weightagePercentage);
      setPassingMarks(selectedRoster.passingMarks);
      setEntries(JSON.parse(JSON.stringify(selectedRoster.entries || [])));
    }
  }, [selectedRoster]);

  // Handle Mark Change with Instant Validation
  const handleMarkChange = (studentId: number, valStr: string) => {
    if (selectedRoster?.status !== 'draft') return;

    setEntries((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;

        if (valStr.trim() === '') {
          return {
            ...item,
            marks: null,
            isAbsent: false,
            percentage: undefined,
            grade: undefined,
          };
        }

        const num = Number(valStr);
        if (isNaN(num)) return item;

        const clampedMarks = num;
        const pct = maxMarks > 0 ? Number(((clampedMarks / maxMarks) * 100).toFixed(1)) : 0;
        let grade = 'F';
        if (pct >= 90) grade = 'O';
        else if (pct >= 80) grade = 'A+';
        else if (pct >= 70) grade = 'A';
        else if (pct >= 60) grade = 'B+';
        else if (pct >= 50) grade = 'B';
        else if (pct >= 40) grade = 'C';

        return {
          ...item,
          marks: clampedMarks,
          isAbsent: false,
          percentage: pct,
          grade,
        };
      })
    );
  };

  const handleToggleAbsent = (studentId: number) => {
    if (selectedRoster?.status !== 'draft') return;

    setEntries((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        const nextAbsent = !item.isAbsent;
        return {
          ...item,
          isAbsent: nextAbsent,
          marks: nextAbsent ? null : item.marks,
          percentage: nextAbsent ? 0 : item.percentage,
          grade: nextAbsent ? 'ABS' : undefined,
        };
      })
    );
  };

  // Live Calculations
  const totalStudents = entries.length;
  const enteredEntries = entries.filter((e) => (e.marks !== null && !e.isAbsent) || e.isAbsent);
  const enteredCount = enteredEntries.length;
  const validMarks = entries.filter((e) => e.marks !== null && !e.isAbsent).map((e) => e.marks as number);
  const classAverage =
    validMarks.length > 0
      ? Number((validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(1))
      : 0;
  const passCount = entries.filter((e) => e.marks !== null && !e.isAbsent && (e.marks || 0) >= passingMarks).length;
  const failCount = entries.filter((e) => e.marks !== null && !e.isAbsent && (e.marks || 0) < passingMarks).length;
  const absentCount = entries.filter((e) => e.isAbsent).length;

  // Validation Check: any mark exceeding max marks?
  const hasInvalidMarks = entries.some(
    (e) => e.marks !== null && !e.isAbsent && ((e.marks as number) > maxMarks || (e.marks as number) < 0)
  );

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: () => {
      return mockStaffService.saveMarksDraft(selectedRosterId, entries, {
        maxMarks,
        weightagePercentage: weightage,
        passingMarks,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['staff-marks-rosters'] });
      queryClient.invalidateQueries({ queryKey: ['staff-summary'] });
      addToast({
        title: 'Draft Marks Saved',
        description: `Saved ${updated.enteredCount}/${updated.totalStudents} entries for ${updated.subjectCode} (${updated.assessmentName}).`,
        type: 'success',
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // First save latest marks
      await mockStaffService.saveMarksDraft(selectedRosterId, entries, {
        maxMarks,
        weightagePercentage: weightage,
        passingMarks,
      });
      // Then submit to HOD
      return mockStaffService.submitMarksToHod(selectedRosterId);
    },
    onSuccess: (submitted) => {
      queryClient.invalidateQueries({ queryKey: ['staff-marks-rosters'] });
      queryClient.invalidateQueries({ queryKey: ['staff-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-hod-queue'] });
      setIsSubmitModalOpen(false);
      addToast({
        title: 'Marks Submitted for HOD Verification',
        description: `${submitted.subjectCode} (${submitted.assessmentName}) is now in the HOD moderation queue.`,
        type: 'success',
      });
    },
  });

  const filteredEntries = useMemo(() => {
    if (!studentSearch.trim()) return entries;
    const q = studentSearch.toLowerCase();
    return entries.filter(
      (e) =>
        e.studentName.toLowerCase().includes(q) ||
        e.rollNo.toLowerCase().includes(q) ||
        e.registerNumber.toLowerCase().includes(q)
    );
  }, [entries, studentSearch]);

  const isReadOnly = selectedRoster?.status !== 'draft';

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Instructional Marks Entry & Grading Engine"
        subtitle="Spreadsheet evaluation for Internal Assessments, Laboratory Practicals, and Coursework weightages."
        badge={<Badge variant="amber">Marks & Grading</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'entry' ? 'primary' : 'outline'}
              leftIcon={<Award className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('entry')}
            >
              Marks Sheet
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'history' ? 'primary' : 'outline'}
              leftIcon={<History className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('history')}
            >
              Submission History ({rosters.length})
            </Button>
          </div>
        }
      />

      {/* 2. TAB: MARKS ENTRY GRID */}
      {activeTab === 'entry' && (
        <div className="space-y-6">
          {/* Assessment & Subject Selector Bar */}
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-80">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Select Subject & Assessment Roster
                </label>
                <select
                  value={selectedRosterId}
                  onChange={(e) => setSelectedRosterId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {rosters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.subjectCode}: {r.subjectName} · {r.assessmentName} ({r.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Configuration Controls */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-20 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold text-center outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                    Passing Mark
                  </label>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-20 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold text-center outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                    Weightage %
                  </label>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={weightage}
                    onChange={(e) => setWeightage(Number(e.target.value))}
                    className="w-20 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold text-center outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Workflow Stage Visualizer */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  Current Workflow Stage:
                </span>
                <Badge
                  variant={
                    selectedRoster?.status === 'verified'
                      ? 'emerald'
                      : selectedRoster?.status === 'submitted'
                        ? 'sky'
                        : selectedRoster?.status === 'approved'
                          ? 'purple'
                          : 'amber'
                  }
                  size="md"
                >
                  {selectedRoster?.status.toUpperCase()}
                </Badge>
              </div>

              {/* Step indicator bar */}
              <div className="grid grid-cols-5 gap-1.5">
                {STAGE_STEPS.map((step, idx) => {
                  const currentIdx = STAGE_STEPS.findIndex(
                    (s) => s.stage === selectedRoster?.status
                  );
                  const isCurrent = currentIdx === idx;
                  const isPast = currentIdx > idx;

                  return (
                    <div
                      key={step.stage}
                      className={`p-2 rounded-lg text-center text-[10px] font-medium border transition-colors ${isCurrent
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : isPast
                            ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-100 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/30 text-slate-400'
                        }`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>

              {selectedRoster?.returnReason && (
                <div className="mt-3 p-3 rounded-lg border border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Returned by HOD:</span> {selectedRoster.returnReason}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Class Average"
              value={`${classAverage} / ${maxMarks}`}
              secondaryText={maxMarks > 0 ? `${((classAverage / maxMarks) * 100).toFixed(1)}% score` : ''}
              icon={<Award className="w-5 h-5" />}
              iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
            />
            <StatCard
              label="Pass Rate"
              value={`${passCount} Passed`}
              secondaryText={`${totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(0) : 0}% passing (≥${passingMarks})`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
            />
            <StatCard
              label="Below Passing"
              value={`${failCount} Need Support`}
              secondaryText={`${absentCount} Absent`}
              icon={<AlertTriangle className="w-5 h-5" />}
              iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
            />
            <StatCard
              label="Entered Entries"
              value={`${enteredCount} / ${totalStudents}`}
              secondaryText={enteredCount === totalStudents ? 'All scores complete' : `${totalStudents - enteredCount} unentered`}
              icon={<FileCheck className="w-5 h-5" />}
              iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
            />
          </div>

          {/* Spreadsheet Entry Table Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Student Marks Ledger</span>
                  {isReadOnly && (
                    <Badge variant="neutral" size="sm" className="gap-1">
                      <Lock className="w-3 h-3" /> Read-Only
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Tab / Enter navigates rows · Max allowable score is {maxMarks} marks
                </CardDescription>
              </div>

              <div className="w-full sm:w-64">
                <SearchInput
                  placeholder="Filter student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingRosters ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : filteredEntries.length === 0 ? (
                <EmptyState
                  icon={AlertCircle}
                  title="No student records"
                  description="No scholars found matching the search criteria."
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Register No</th>
                        <th className="p-3 w-32">
                          Score (Out of {maxMarks})
                        </th>
                        <th className="p-3 w-24 text-center">Absent?</th>
                        <th className="p-3 text-center">Percentage</th>
                        <th className="p-3 text-center">Calculated Grade</th>
                        <th className="p-3 text-right">Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                      {filteredEntries.map((student, idx) => {
                        const isScoreInvalid =
                          student.marks !== null &&
                          !student.isAbsent &&
                          ((student.marks as number) > maxMarks || (student.marks as number) < 0);

                        return (
                          <tr
                            key={student.studentId}
                            className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors ${isScoreInvalid
                                ? 'bg-rose-50/40 dark:bg-rose-950/20'
                                : ''
                              }`}
                          >
                            <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                              {student.rollNo}
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {student.studentName}
                              </span>
                              {student.remarks && (
                                <p className="text-[10px] text-slate-400">{student.remarks}</p>
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">
                              {student.registerNumber}
                            </td>
                            <td className="p-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  disabled={isReadOnly || student.isAbsent}
                                  value={student.marks ?? ''}
                                  onChange={(e) =>
                                    handleMarkChange(student.studentId, e.target.value)
                                  }
                                  placeholder={student.isAbsent ? 'ABS' : '-'}
                                  className={`w-28 h-8 px-2.5 rounded-lg border font-mono font-bold text-xs text-center outline-none transition-all ${isScoreInvalid
                                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 text-rose-700'
                                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                    } disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-zinc-800`}
                                />
                                {isScoreInvalid && (
                                  <span className="block text-[9px] font-semibold text-rose-600 mt-0.5">
                                    Exceeds max ({maxMarks})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                disabled={isReadOnly}
                                checked={student.isAbsent}
                                onChange={() => handleToggleAbsent(student.studentId)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="p-3 text-center font-mono">
                              {student.isAbsent ? (
                                <span className="text-slate-400">-</span>
                              ) : student.marks !== null ? (
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                  {student.percentage}%
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Unentered</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {student.isAbsent ? (
                                <Badge variant="neutral" size="sm">
                                  ABS
                                </Badge>
                              ) : student.grade ? (
                                <Badge
                                  size="sm"
                                  variant={
                                    student.grade === 'O' || student.grade === 'A+'
                                      ? 'emerald'
                                      : student.grade === 'A' || student.grade === 'B+'
                                        ? 'sky'
                                        : student.grade === 'B' || student.grade === 'C'
                                          ? 'amber'
                                          : 'rose'
                                  }
                                >
                                  {student.grade}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {student.isAbsent ? (
                                <span className="text-[11px] font-medium text-amber-600">
                                  Absentee
                                </span>
                              ) : student.marks !== null ? (
                                (student.marks as number) >= passingMarks ? (
                                  <span className="text-[11px] font-semibold text-emerald-600">
                                    PASS
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-rose-600">
                                    REMEDIAL
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-400">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Actions Bar */}
              {!isReadOnly && (
                <div className="mt-5 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 dark:text-zinc-400">
                    {hasInvalidMarks ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Some marks exceed the maximum value of {maxMarks}. Correct them before submission.
                      </span>
                    ) : (
                      <span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          Progress:
                        </span>{' '}
                        {enteredCount}/{totalStudents} scores completed ({((enteredCount / (totalStudents || 1)) * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveDraftMutation.mutate()}
                      isLoading={saveDraftMutation.isPending}
                    >
                      Save Draft Scores
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={hasInvalidMarks || enteredCount === 0}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => setIsSubmitModalOpen(true)}
                    >
                      Submit Roster to HOD
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. TAB: SUBMISSION HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Marks Roster Archive</CardTitle>
            <CardDescription>
              Track all departmental mark sheets across their verification stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRosters ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Assessment Name</th>
                      <th className="p-3">Cohort</th>
                      <th className="p-3">Max Marks</th>
                      <th className="p-3">Class Average</th>
                      <th className="p-3">Pass %</th>
                      <th className="p-3">Workflow Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {rosters.map((roster) => (
                      <tr
                        key={roster.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="p-3">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                            {roster.subjectCode}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-zinc-100">
                            {roster.subjectName}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-zinc-300">
                          {roster.assessmentName}
                        </td>
                        <td className="p-3 text-slate-500">
                          {roster.batchName} ({roster.section})
                        </td>
                        <td className="p-3 font-mono">
                          {roster.maxMarks} (Pass: {roster.passingMarks})
                        </td>
                        <td className="p-3 font-mono font-semibold">
                          {roster.averageMarks > 0 ? `${roster.averageMarks} / ${roster.maxMarks}` : '-'}
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={
                              roster.passCount / (roster.totalStudents || 1) >= 0.8
                                ? 'emerald'
                                : 'amber'
                            }
                          >
                            {roster.totalStudents > 0
                              ? `${((roster.passCount / roster.totalStudents) * 100).toFixed(0)}%`
                              : '-'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={
                              roster.status === 'verified'
                                ? 'emerald'
                                : roster.status === 'submitted'
                                  ? 'sky'
                                  : 'amber'
                            }
                          >
                            {roster.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRosterId(roster.id);
                              setActiveTab('entry');
                            }}
                            className="text-xs h-7"
                          >
                            {roster.status === 'draft' ? 'Resume Entry' : 'Inspect Ledger'}
                          </Button>
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

      {/* 4. Submission Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Marks Roster for HOD Verification"
        description="This will lock the mark sheet and forward it to the Department Head's moderation queue. Once approved by the HOD, it proceeds to the Dean of Academic Affairs."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              Confirm Submission
            </Button>
          </div>
        }
      >
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {selectedRoster?.subjectCode}: {selectedRoster?.subjectName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assessment:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {selectedRoster?.assessmentName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Class Performance:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {enteredCount} Recorded · Avg {classAverage}/{maxMarks} · {passCount} Passing
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
