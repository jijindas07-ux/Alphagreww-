import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
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
  SearchInput,
  Skeleton,
} from '@/design-system';
import { useAuth } from '@/hooks/useAuth';
import { mockStaffService } from '@/services/mock/mockStaffService';

export const FacultyWorkloadView: React.FC = () => {
  const { isHod, toggleHodRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: workload = [], isLoading } = useQuery({
    queryKey: ['staff-faculty-workload'],
    queryFn: () => mockStaffService.getFacultyWorkload(),
  });

  // Non-HOD Guard Screen
  if (!isHod) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Department Faculty Instructional Workload"
          subtitle="Department Head administrative authority is required to view faculty allocation hours."
          badge={<Badge variant="neutral">Restricted Access</Badge>}
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            HOD Authorization Required
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            Instructional workload quotas and allocation rebalancing are reserved for Heads of Department.
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

  const filteredWorkload = useMemo(() => {
    return workload.filter((f) => {
      const matchesSearch =
        f.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || f.status.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [workload, searchTerm, statusFilter]);

  const totalTeachingHours = workload.reduce((acc, curr) => acc + curr.totalHoursPerWeek, 0);
  const avgHours = workload.length > 0 ? (totalTeachingHours / workload.length).toFixed(1) : 0;
  const overloadedCount = workload.filter((f) => f.status === 'overloaded').length;
  const optimalCount = workload.filter((f) => f.status === 'optimal').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Faculty Instructional Workload & Hour Allotment"
        subtitle="Computer Science & Engineering · Teaching credit distribution, UGC/AICTE hour ceilings, and load rebalancing."
        badge={
          <Badge variant="rose">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
            HOD Console
          </Badge>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Department Faculty"
          value={`${workload.length} Instructors`}
          secondaryText="CSE Core & Adjunct"
          icon={<Users className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          label="Average Workload"
          value={`${avgHours} hrs/wk`}
          secondaryText="UGC ceiling is 18 hrs"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Optimal Allocation"
          value={`${optimalCount} Faculty`}
          secondaryText="Within prescribed limits"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Overloaded Instructors"
          value={`${overloadedCount} Flagged`}
          secondaryText="Requires adjunct reallocation"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
        />
      </div>

      {/* 3. Workload Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Department Teaching Credit Roster
            </CardTitle>
            <CardDescription>
              Detailed breakdown of lecture, practical, and tutorial hours per faculty member
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <SearchInput
                placeholder="Search faculty or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${statusFilter === 'ALL'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OPTIMAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${statusFilter === 'OPTIMAL'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Optimal
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OVERLOADED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${statusFilter === 'OVERLOADED'
                    ? 'bg-white dark:bg-zinc-800 text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Overloaded
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    <th className="p-3">Faculty Member</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Allocated Subjects</th>
                    <th className="p-3 text-center">Theory / Lab</th>
                    <th className="p-3">Weekly Hours Load</th>
                    <th className="p-3 text-right">Workload Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredWorkload.map((faculty) => {
                    const percentageOfMax = Math.min(
                      100,
                      Number(((faculty.totalHoursPerWeek / faculty.prescribedHours) * 100).toFixed(0))
                    );

                    return (
                      <tr
                        key={faculty.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold flex items-center justify-center text-xs shrink-0">
                              {faculty.facultyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                {faculty.facultyName}
                                {faculty.isHod && (
                                  <Badge size="sm" variant="rose" className="text-[9px] py-0">
                                    HOD
                                  </Badge>
                                )}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">
                                {faculty.employeeId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-zinc-400 font-medium">
                          {faculty.designation}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {faculty.allocatedSubjects.map((sub, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                              >
                                {sub.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {faculty.lectureHours}L + {faculty.labHours}P
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-zinc-200">
                                {faculty.totalHoursPerWeek} hrs
                              </span>
                              <span className="text-slate-400">/ max {faculty.prescribedHours}</span>
                            </div>
                            <div className="w-36 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${faculty.status === 'overloaded'
                                    ? 'bg-rose-500'
                                    : faculty.status === 'optimal'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                style={{ width: `${percentageOfMax}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            size="sm"
                            variant={
                              faculty.status === 'optimal'
                                ? 'emerald'
                                : faculty.status === 'overloaded'
                                  ? 'rose'
                                  : 'amber'
                            }
                          >
                            {faculty.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
