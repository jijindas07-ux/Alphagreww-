import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle2,
  History,
  Check,
  X,
  UserX,
  Calendar,
  AlertCircle,
  Download,
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
  SearchInput,
  Modal,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { AttendanceStudentEntry } from '@/types/staff.types';

export const PeriodAttendanceView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Form selection state
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('CS501');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSessionType, setSelectedSessionType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [studentSearch, setStudentSearch] = useState('');

  // History filters
  const [historySubjectFilter, setHistorySubjectFilter] = useState('ALL');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Queries
  const { data: subjects = [] } = useQuery({
    queryKey: ['staff-allocated-subjects'],
    queryFn: () => mockStaffService.getAllocatedSubjects(),
  });

  const { data: rosterData, isLoading: isLoadingRoster } = useQuery({
    queryKey: ['staff-attendance-roster', selectedSubjectCode, selectedDate],
    queryFn: () => mockStaffService.getAttendanceRoster(selectedSubjectCode, selectedDate),
  });

  const { data: existingSession, isLoading: isLoadingCheck } = useQuery({
    queryKey: ['staff-check-attendance', selectedDate, selectedPeriod, selectedSubjectCode],
    queryFn: () => mockStaffService.checkAttendanceExists(selectedDate, selectedPeriod, selectedSubjectCode),
  });

  const { data: historySessions = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['staff-attendance-history', historySubjectFilter],
    queryFn: () => mockStaffService.getAttendanceHistory({ subjectCode: historySubjectFilter }),
  });

  // Local student records state
  const [students, setStudents] = useState<AttendanceStudentEntry[]>([]);

  // When roster or existing session loads, initialize local student list
  React.useEffect(() => {
    if (existingSession && existingSession.records) {
      setStudents(JSON.parse(JSON.stringify(existingSession.records)));
    } else if (rosterData?.students) {
      setStudents(JSON.parse(JSON.stringify(rosterData.students)));
    }
  }, [rosterData, existingSession]);

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.subjectCode === selectedSubjectCode) || subjects[0];
  }, [subjects, selectedSubjectCode]);

  // Derived counts
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const leaveCount = students.filter((s) => s.status === 'leave').length;
  const attendanceRate = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 0;

  const isAlreadySubmitted = existingSession?.status === 'submitted';

  // Quick actions
  const handleMarkAll = (status: 'present' | 'absent') => {
    if (isAlreadySubmitted) return;
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: status,
      }))
    );
    addToast({
      title: status === 'present' ? 'All Marked Present' : 'All Marked Absent',
      description: `Updated status for ${totalCount} enrolled scholars.`,
      type: 'info',
    });
  };

  const handleToggleStatus = (studentId: number, newStatus: 'present' | 'absent' | 'leave') => {
    if (isAlreadySubmitted) return;
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (asStatus: 'draft' | 'submitted') => {
      const timeSlots: Record<number, string> = {
        1: '09:00 - 10:00 AM',
        2: '10:15 - 11:15 AM',
        3: '11:30 - 12:30 PM',
        4: '01:30 - 03:30 PM',
        5: '03:45 - 04:45 PM',
      };

      return mockStaffService.saveAttendanceSession({
        id: existingSession?.id,
        date: selectedDate,
        periodNumber: selectedPeriod,
        timeSlot: timeSlots[selectedPeriod] || '09:00 - 10:00 AM',
        subjectCode: currentSubject?.subjectCode || selectedSubjectCode,
        subjectName: currentSubject?.subjectName || 'Distributed Systems',
        departmentCode: currentSubject?.departmentCode || 'CSE',
        batchName: currentSubject?.batchName || 'Batch 2023-2027',
        section: currentSubject?.section || 'A',
        semesterNumber: currentSubject?.semesterNumber || 5,
        academicYear: '2026-2027',
        sessionType: selectedSessionType,
        status: asStatus,
        records: students,
      });
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['staff-today-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['staff-check-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff-attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['staff-summary'] });

      setIsSubmitModalOpen(false);
      addToast({
        title: saved.status === 'submitted' ? 'Attendance Submitted Successfully' : 'Draft Saved',
        description: `Logged for ${saved.subjectCode} Period ${saved.periodNumber} (${saved.presentCount}/${saved.totalStudents} Present - ${saved.attendancePercentage}%).`,
        type: 'success',
      });
    },
  });

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Period Attendance Registry"
        subtitle="Record live class attendance, manage daily student rosters, and audit past roll calls."
        badge={<Badge variant="indigo">Daily Roll Call</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'mark' ? 'primary' : 'outline'}
              leftIcon={<Clock className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('mark')}
            >
              Mark Session
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'history' ? 'primary' : 'outline'}
              leftIcon={<History className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('history')}
            >
              Session History ({historySessions.length})
            </Button>
          </div>
        }
      />

      {/* 2. TAB: MARK ATTENDANCE */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Controls Bar: Subject, Period, Date, Class */}
          <Card className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Assigned Subject & Class
                </label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.subjectCode}>
                      {sub.subjectCode} - {sub.subjectName} (Sec {sub.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Lecture / Lab Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value={1}>Period 1 (09:00 - 10:00 AM)</option>
                  <option value={2}>Period 2 (10:15 - 11:15 AM)</option>
                  <option value={3}>Period 3 (11:30 - 12:30 PM)</option>
                  <option value={4}>Period 4 (01:30 - 03:30 PM - Lab Slot)</option>
                  <option value={5}>Period 5 (03:45 - 04:45 PM)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Session Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Session Type
                </label>
                <select
                  value={selectedSessionType}
                  onChange={(e) => setSelectedSessionType(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="Lecture">Lecture (Theory)</option>
                  <option value="Lab">Practical / Laboratory</option>
                  <option value="Tutorial">Tutorial / Discussion</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Duplicate Submission Warning Banner */}
          {isAlreadySubmitted && (
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Attendance Already Finalized & Submitted
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Session for {selectedSubjectCode} (Period {selectedPeriod}) on {selectedDate} was submitted at {existingSession?.submittedAt}. The roster below is locked to prevent accidental duplicate submission.
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="md">
                Locked & Audited
              </Badge>
            </div>
          )}

          {/* Quick Metrics & Attendance Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Present"
              value={`${presentCount} Students`}
              secondaryText={`${attendanceRate}% of class`}
              icon={<Check className="w-5 h-5" />}
              iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
            />
            <StatCard
              label="Absent"
              value={`${absentCount} Students`}
              secondaryText="Marked absent"
              icon={<X className="w-5 h-5" />}
              iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
            />
            <StatCard
              label="On Leave"
              value={`${leaveCount} Students`}
              secondaryText="Approved medical / on-duty"
              icon={<UserX className="w-5 h-5" />}
              iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
            />
            <StatCard
              label="Total Enrolled"
              value={`${totalCount} Students`}
              secondaryText={`${currentSubject?.batchName || 'Batch 2023-2027'} · Sec ${currentSubject?.section || 'A'}`}
              icon={<Calendar className="w-5 h-5" />}
              iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
            />
          </div>

          {/* Student Roster Table Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Student Class Roster</span>
                  <Badge variant="neutral" size="sm">
                    {filteredStudents.length} of {totalCount}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentSubject?.subjectName} ({currentSubject?.subjectCode}) · Period {selectedPeriod}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="w-full sm:w-56">
                  <SearchInput
                    placeholder="Search roll no or name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                {!isAlreadySubmitted && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAll('present')}
                      className="text-xs"
                    >
                      Mark All Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAll('absent')}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Clear / Reset
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingRoster || isLoadingCheck ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <EmptyState
                  icon={AlertCircle}
                  title="No students found"
                  description="No scholars matched your search query in this batch roster."
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
                        <th className="p-3">Past Attendance</th>
                        <th className="p-3 text-right">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                      {filteredStudents.map((student, idx) => (
                        <tr
                          key={student.studentId}
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-zinc-200">
                            {student.rollNo}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0">
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-zinc-100">
                                  {student.studentName}
                                </p>
                                {student.remarks && (
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                    {student.remarks}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">
                            {student.registerNumber}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    student.overallAttendancePercentage >= 85
                                      ? 'bg-emerald-500'
                                      : student.overallAttendancePercentage >= 75
                                      ? 'bg-sky-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${student.overallAttendancePercentage}%` }}
                                />
                              </div>
                              <span
                                className={`font-mono text-[11px] font-semibold ${
                                  student.overallAttendancePercentage < 75
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-600 dark:text-zinc-300'
                                }`}
                              >
                                {student.overallAttendancePercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 p-0.5 bg-slate-50/60 dark:bg-zinc-900">
                              <button
                                type="button"
                                disabled={isAlreadySubmitted}
                                onClick={() => handleToggleStatus(student.studentId, 'present')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                  student.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                                } ${isAlreadySubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                disabled={isAlreadySubmitted}
                                onClick={() => handleToggleStatus(student.studentId, 'absent')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                  student.status === 'absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                                } ${isAlreadySubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                disabled={isAlreadySubmitted}
                                onClick={() => handleToggleStatus(student.studentId, 'leave')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                  student.status === 'leave'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                                } ${isAlreadySubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Action Bar at bottom */}
              {!isAlreadySubmitted && (
                <div className="mt-5 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      Summary:
                    </span>{' '}
                    {presentCount} Present · {absentCount} Absent · {leaveCount} On Leave ({attendanceRate}%)
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveMutation.mutate('draft')}
                      isLoading={saveMutation.isPending}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => setIsSubmitModalOpen(true)}
                    >
                      Finalize & Submit Roll Call
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. TAB: ATTENDANCE HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle>Session History & Audit Logs</CardTitle>
              <CardDescription>
                Audited attendance entries recorded by faculty with timestamp and count verification
              </CardDescription>
            </div>
            <div className="flex items-center gap-2.5">
              <select
                value={historySubjectFilter}
                onChange={(e) => setHistorySubjectFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-700 dark:text-zinc-300 font-medium outline-none"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.subjectCode}>
                    {s.subjectCode} - {s.subjectName}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : historySessions.length === 0 ? (
              <EmptyState
                icon={History}
                title="No attendance records found"
                description="No historical attendance sessions match the current filter."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <th className="p-3">Date</th>
                      <th className="p-3">Subject & Session</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Cohort</th>
                      <th className="p-3">Present / Total</th>
                      <th className="p-3">Attendance %</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {historySessions.map((session) => (
                      <tr
                        key={session.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">
                          {session.date}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                            {session.subjectCode}
                          </span>
                          <span className="text-slate-700 dark:text-zinc-300">
                            {session.subjectName}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          Period {session.periodNumber} ({session.timeSlot})
                        </td>
                        <td className="p-3 text-slate-500">
                          {session.batchName} · Sec {session.section}
                        </td>
                        <td className="p-3 font-medium">
                          <span className="text-emerald-600 font-semibold">
                            {session.presentCount}
                          </span>{' '}
                          / {session.totalStudents}
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={
                              session.attendancePercentage >= 85
                                ? 'emerald'
                                : session.attendancePercentage >= 75
                                ? 'sky'
                                : 'rose'
                            }
                          >
                            {session.attendancePercentage}%
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            size="sm"
                            variant={session.status === 'submitted' ? 'emerald' : 'amber'}
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                          {session.submittedAt || 'Draft'}
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
        title="Finalize & Submit Period Attendance"
        description="Once submitted, the attendance register for this period will be locked and audited in the institutional records. Low attendance scholars will be automatically alerted."
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
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate('submitted')}
            >
              Confirm & Submit
            </Button>
          </div>
        }
      >
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {currentSubject?.subjectCode} - {currentSubject?.subjectName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Period & Slot:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              Period {selectedPeriod} · {selectedDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Class Attendance:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {presentCount} Present, {absentCount} Absent, {leaveCount} Leave ({attendanceRate}%)
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
