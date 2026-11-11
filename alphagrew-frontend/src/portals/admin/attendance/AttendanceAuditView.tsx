import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Send,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  Button,
  Badge,
  SearchInput,
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { AttendanceAuditItem } from '@/types/academic.types';

export const AttendanceAuditView: React.FC = () => {
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'compliant' | 'warning' | 'debarred'>('ALL');
  const [selectedAuditStudent, setSelectedAuditStudent] = useState<AttendanceAuditItem | null>(null);

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['admin', 'attendanceAudit'],
    queryFn: () => mockAdminService.getAttendanceAudit(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Warning Letter Dispatch Mutation
  const sendWarningMutation = useMutation({
    mutationFn: (studentId: number) => mockAdminService.sendAttendanceWarning(studentId),
    onSuccess: (res) => {
      addToast({
        title: 'Regulatory Notice Dispatched',
        description: res.message,
        type: 'info',
      });
    },
  });

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || rec.departmentCode === selectedDeptFilter;
    const matchesCompliance = complianceFilter === 'ALL' || rec.status === complianceFilter;
    return matchesSearch && matchesDept && matchesCompliance;
  });

  const totalClasses = attendanceRecords.reduce((acc, r) => acc + r.totalClasses, 0);
  const totalAttended = attendanceRecords.reduce((acc, r) => acc + r.classesAttended, 0);
  const avgAttendance = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : '86.4';

  const atRiskCount = attendanceRecords.filter((r) => r.status === 'warning').length;
  const debarredCount = attendanceRecords.filter((r) => r.status === 'debarred').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution-Wide Attendance Compliance Register"
        subtitle="Monitor academic lecture attendance, regulatory 75% thresholds, automated warning notices, and debarred rosters."
        badge={<Badge variant="indigo" size="md">Mandatory 75% Cutoff</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => {
                addToast({
                  title: 'Compliance Report Exported',
                  description: 'PDF report generated with AICTE biometric attendance logs.',
                  type: 'success',
                });
              }}
            >
              Export Compliance PDF
            </Button>
            <Button
              size="sm"
              variant="destructive"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => {
                addToast({
                  title: 'Automated Notices Dispatched',
                  description: `Warning SMS & email sent to all ${atRiskCount + debarredCount} at-risk students and parents.`,
                  type: 'warning',
                });
              }}
            >
              Dispatch Batch Warnings ({atRiskCount + debarredCount})
            </Button>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Campus Average"
          value={`${avgAttendance}%`}
          secondaryText="Across all active classes"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Compliant Cohort (>75%)"
          value={`${attendanceRecords.filter((r) => r.status === 'compliant').length} Students`}
          secondaryText="Eligible for examinations"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Warning Threshold (65-75%)"
          value={`${atRiskCount} Students`}
          secondaryText="Parent alert active"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        <StatCard
          label="Debarred / Critical (<65%)"
          value={`${debarredCount} Students`}
          secondaryText="Exam hall ticket blocked"
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Compliance Status Pills */}
          <button
            onClick={() => setComplianceFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              complianceFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Students ({attendanceRecords.length})
          </button>
          <button
            onClick={() => setComplianceFilter('compliant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              complianceFilter === 'compliant'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Compliant (&ge;75%)
          </button>
          <button
            onClick={() => setComplianceFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              complianceFilter === 'warning'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Warning (65-75%)
          </button>
          <button
            onClick={() => setComplianceFilter('debarred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              complianceFilter === 'debarred'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Debarred (&lt;65%)
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code}
              </option>
            ))}
          </select>

          <div className="w-64">
            <SearchInput
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance Audit Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No attendance records found"
          description="No students matched your search or compliance filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student Profile</th>
                  <th className="py-3.5 px-4">Dept & Cohort</th>
                  <th className="py-3.5 px-4">Conducted vs Attended</th>
                  <th className="py-3.5 px-4">Cumulative Percentage</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                  <th className="py-3.5 px-4">Last Attended Period</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                {filteredRecords.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedAuditStudent(item)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                          {item.studentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {item.registrationNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        {item.departmentCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.batch} · Sem {item.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {item.classesAttended}
                      </span>{' '}
                      <span className="text-slate-400">/</span>{' '}
                      <span className="text-slate-500">{item.totalClasses} Periods</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.percentage >= 75
                              ? 'text-emerald-600'
                              : item.percentage >= 65
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                        <div className="w-20 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.percentage >= 75
                                ? 'bg-emerald-500'
                                : item.percentage >= 65
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          item.status === 'compliant'
                            ? 'emerald'
                            : item.status === 'warning'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                      >
                        {item.status === 'compliant'
                          ? 'Compliant'
                          : item.status === 'warning'
                          ? 'At Risk (Warning)'
                          : 'Debarred (Critical)'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.lastAttendedDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'compliant' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              sendWarningMutation.mutate(item.studentId);
                            }}
                          >
                            Send Notice
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAuditStudent(item);
                          }}
                        >
                          Breakdown
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Attendance Breakdown Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedAuditStudent}
        onClose={() => setSelectedAuditStudent(null)}
        title={selectedAuditStudent?.studentName || 'Attendance Log'}
        subtitle={`Subject-Wise Attendance Breakdown · ${selectedAuditStudent?.registrationNumber}`}
        width="lg"
      >
        {selectedAuditStudent && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {selectedAuditStudent.registrationNumber}
                </span>
                <Badge
                  variant={
                    selectedAuditStudent.percentage >= 75
                      ? 'emerald'
                      : selectedAuditStudent.percentage >= 65
                      ? 'amber'
                      : 'rose'
                  }
                  size="sm"
                >
                  {selectedAuditStudent.percentage}% Cumulative
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {selectedAuditStudent.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Department of {selectedAuditStudent.departmentCode} · Semester {selectedAuditStudent.semester}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Curriculum Subject Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      CS501 · Design & Analysis of Algorithms
                    </span>
                    <span className="text-[11px] text-slate-500">Faculty: Dr. Aris Thorne</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">
                      42 / 45 (93.3%)
                    </span>
                    <Badge variant="emerald" size="sm">
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      CS502 · Distributed Systems & Cloud
                    </span>
                    <span className="text-[11px] text-slate-500">Faculty: Dr. Sarah Jenkins</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">
                      38 / 45 (84.4%)
                    </span>
                    <Badge variant="emerald" size="sm">
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      CS506 · Cloud Computing Lab
                    </span>
                    <span className="text-[11px] text-slate-500">Faculty: Dr. Sarah Jenkins</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">
                      12 / 12 (100%)
                    </span>
                    <Badge variant="emerald" size="sm">
                      Compliant
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedAuditStudent(null)}>
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

