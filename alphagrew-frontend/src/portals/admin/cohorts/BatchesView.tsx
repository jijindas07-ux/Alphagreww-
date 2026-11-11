import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  Button,
  Badge,
  Input,
  SearchInput,
  Modal,
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { Batch } from '@/types/academic.types';

export const BatchesView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'batches' | 'academic-years' | 'semesters'>('batches');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    code: '',
    name: '',
    program: 'B.Tech (All Disciplines)',
    departmentCode: 'ALL',
    admissionYear: 2026,
    graduationYear: 2030,
    currentSemester: 1,
    status: 'active' as const,
    studentsCount: 0,
    sections: ['A', 'B', 'C'],
    classAdvisor: '',
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['admin', 'batches'],
    queryFn: () => mockAdminService.getBatches(),
  });

  const { data: academicYears = [], isLoading: isLoadingYears } = useQuery({
    queryKey: ['admin', 'academicYears'],
    queryFn: () => mockAdminService.getAcademicYears(),
  });

  const { data: semesterCohorts = [], isLoading: isLoadingSemesters } = useQuery({
    queryKey: ['admin', 'semesterCohorts'],
    queryFn: () => mockAdminService.getSemesterCohorts(),
  });

  // Create Batch Mutation
  const createBatchMutation = useMutation({
    mutationFn: (data: typeof newBatch) => mockAdminService.createBatch(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
      addToast({
        title: 'Batch Created',
        description: `${created.name} (${created.code}) initialized with ${created.sections.length} class sections.`,
        type: 'success',
      });
      setIsCreateBatchModalOpen(false);
      setNewBatch({
        code: '',
        name: '',
        program: 'B.Tech (All Disciplines)',
        departmentCode: 'ALL',
        admissionYear: 2026,
        graduationYear: 2030,
        currentSemester: 1,
        status: 'active',
        studentsCount: 0,
        sections: ['A', 'B', 'C'],
        classAdvisor: '',
      });
    },
  });

  // Switch Active Term Mutation
  const setActiveYearMutation = useMutation({
    mutationFn: (id: number) => mockAdminService.setActiveAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'academicYears'] });
      addToast({
        title: 'Academic Term Updated',
        description: 'Selected academic calendar year marked as official active term.',
        type: 'success',
      });
    },
  });

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.classAdvisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEnrolled = batches.reduce((acc, b) => acc + b.studentsCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Cohorts & Academic Terms"
        subtitle="Manage admission batches, class section allocations, academic calendar years, and semester lifecycle."
        badge={<Badge variant="indigo" size="md">{batches.length} Active Cohorts</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateBatchModalOpen(true)}
          >
            Create New Batch
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Cohorts"
          value={batches.length}
          secondaryText="4 Undergraduate Classes"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Total Cohort Students"
          value={totalEnrolled.toLocaleString()}
          secondaryText="Enrolled across sections"
          icon={<GraduationCap className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Current Academic Year"
          value="2025 - 2026"
          secondaryText="Odd Term (Fall Semester)"
          icon={<Calendar className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Graduating Class"
          value="Class of 2026"
          secondaryText="Final Year Sem 7 / 8"
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'batches'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Batches & Cohorts ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('academic-years')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'academic-years'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Academic Calendar Terms ({academicYears.length})
          </button>
          <button
            onClick={() => setActiveTab('semesters')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'semesters'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Semester Progress ({semesterCohorts.length})
          </button>
        </div>

        {activeTab === 'batches' && (
          <div className="w-full sm:w-72">
            <SearchInput
              placeholder="Search batches by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab 1: Batches */}
      {activeTab === 'batches' && (
        isLoadingBatches ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : filteredBatches.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No batches found"
            description="No student cohorts matched your search."
            action={{
              label: 'Create New Batch',
              onClick: () => setIsCreateBatchModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBatches.map((batch) => (
              <Card
                key={batch.id}
                onClick={() => setSelectedBatch(batch)}
                className="p-5 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="indigo" size="sm" className="font-mono">
                      {batch.code}
                    </Badge>
                    <Badge variant={batch.status === 'active' ? 'emerald' : 'neutral'} size="sm">
                      {batch.status.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {batch.program} · Current Semester {batch.currentSemester}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 mt-4 border-y border-slate-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Class Strength</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {batch.studentsCount} Students
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sections</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {batch.sections.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {batch.admissionYear} - {batch.graduationYear}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  <span className="text-[11px] text-slate-500">
                    Advisor: <strong className="text-slate-800 dark:text-zinc-200">{batch.classAdvisor}</strong>
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    View Cohort Roster
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Academic Years */}
      {activeTab === 'academic-years' && (
        isLoadingYears ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <div className="space-y-4">
            {academicYears.map((ay) => (
              <Card key={ay.id} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
                        ay.isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          Academic Year {ay.name}
                        </h3>
                        {ay.isCurrent && (
                          <Badge variant="indigo" size="sm">
                            Current Active Term
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Active Term: <strong className="text-slate-700 dark:text-zinc-300">{ay.currentTerm}</strong> ·
                        Duration: {ay.startDate} to {ay.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!ay.isCurrent ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveYearMutation.mutate(ay.id)}
                        isLoading={setActiveYearMutation.isPending}
                      >
                        Set as Active Term
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Live Enrollment Term
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Semester Progress */}
      {activeTab === 'semesters' && (
        isLoadingSemesters ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Semester & Course</th>
                    <th className="py-3.5 px-4">Batch Cohort</th>
                    <th className="py-3.5 px-4">Enrolled Strength</th>
                    <th className="py-3.5 px-4">Syllabus Completion</th>
                    <th className="py-3.5 px-4">Examination Status</th>
                    <th className="py-3.5 px-4">Marks Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {semesterCohorts.map((sem) => (
                    <tr key={sem.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                          Semester {sem.semesterNumber} · {sem.courseCode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Dept: {sem.departmentCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">
                        {sem.batchCode}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {sem.studentCount} Students
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 font-semibold">
                            {sem.syllabusCompletion}% Completed
                          </span>
                          <div className="w-32 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${sem.syllabusCompletion}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            sem.examStatus === 'Evaluated'
                              ? 'emerald'
                              : sem.examStatus === 'In Progress'
                              ? 'amber'
                              : 'sky'
                          }
                          size="sm"
                        >
                          {sem.examStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            sem.marksStatus === 'locked'
                              ? 'emerald'
                              : sem.marksStatus === 'approved'
                              ? 'indigo'
                              : sem.marksStatus === 'verified'
                              ? 'sky'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {sem.marksStatus.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Create Batch Modal */}
      <Modal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        title="Create Student Batch Cohort"
        description="Establish an admission year cohort, graduation timeline, and class sections."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsCreateBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createBatchMutation.isPending}
              disabled={!newBatch.code || !newBatch.name}
              onClick={() => createBatchMutation.mutate(newBatch)}
            >
              Establish Batch
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Cohort Code"
            placeholder="e.g. BATCH-2026-30"
            value={newBatch.code}
            onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Cohort Display Title"
            placeholder="e.g. B.Tech Class of 2030 (Freshman Year)"
            value={newBatch.name}
            onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Admission Year"
              type="number"
              value={newBatch.admissionYear}
              onChange={(e) => setNewBatch({ ...newBatch, admissionYear: Number(e.target.value) })}
            />
            <Input
              label="Graduation Year"
              type="number"
              value={newBatch.graduationYear}
              onChange={(e) => setNewBatch({ ...newBatch, graduationYear: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Head Class Advisor"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={newBatch.classAdvisor}
            onChange={(e) => setNewBatch({ ...newBatch, classAdvisor: e.target.value })}
          />
        </div>
      </Modal>

      {/* Batch Detail Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        title={selectedBatch?.name || 'Cohort Details'}
        subtitle={`Class Details · ${selectedBatch?.code}`}
        width="md"
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <Badge variant="indigo" size="sm" className="font-mono">
                {selectedBatch.code}
              </Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {selectedBatch.name}
              </h3>
              <p className="text-xs text-slate-500">
                Academic cycle: {selectedBatch.admissionYear} to {selectedBatch.graduationYear}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-400 block">Total Strength</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
                  {selectedBatch.studentsCount} Students
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-400 block">Current Semester</span>
                <span className="font-mono text-base font-bold text-indigo-600">
                  Semester {selectedBatch.currentSemester}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Class Sections
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedBatch.sections.map((sec) => (
                  <div
                    key={sec}
                    className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        Section {sec}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ~{Math.round(selectedBatch.studentsCount / selectedBatch.sections.length)} Students
                      </span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      Room {sec}01
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBatch(null)}>
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

