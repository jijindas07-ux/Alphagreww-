import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  GraduationCap,
  Layers,
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
import type { Subject } from '@/types/academic.types';

export const CoursesView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'courses' | 'subjects'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    degreeType: 'B.Tech' as const,
    departmentId: 1,
    departmentCode: 'CSE',
    durationYears: 4,
    totalSemesters: 8,
    totalCredits: 160,
    activeBatches: 4,
  });

  // New Subject Form State
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    courseId: 1,
    courseCode: 'BTECH-CSE',
    departmentCode: 'CSE',
    semesterNumber: 5,
    credits: 4,
    type: 'theory' as const,
    lectureHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    maxInternalMarks: 40,
    maxExternalMarks: 60,
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => mockAdminService.getCourses(),
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => mockAdminService.getSubjects(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Create Course Mutation
  const addCourseMutation = useMutation({
    mutationFn: (data: typeof newCourse) => mockAdminService.createCourse(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      addToast({
        title: 'Program Added',
        description: `${created.name} (${created.code}) successfully established.`,
        type: 'success',
      });
      setIsAddCourseModalOpen(false);
      setNewCourse({
        code: '',
        name: '',
        degreeType: 'B.Tech',
        departmentId: 1,
        departmentCode: 'CSE',
        durationYears: 4,
        totalSemesters: 8,
        totalCredits: 160,
        activeBatches: 4,
      });
    },
  });

  // Create Subject Mutation
  const addSubjectMutation = useMutation({
    mutationFn: (data: typeof newSubject) => mockAdminService.createSubject(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      addToast({
        title: 'Subject Added',
        description: `${created.name} (${created.code}) added to semester ${created.semesterNumber} curriculum.`,
        type: 'success',
      });
      setIsAddSubjectModalOpen(false);
      setNewSubject({
        code: '',
        name: '',
        courseId: 1,
        courseCode: 'BTECH-CSE',
        departmentCode: 'CSE',
        semesterNumber: 5,
        credits: 4,
        type: 'theory',
        lectureHours: 3,
        tutorialHours: 1,
        practicalHours: 0,
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      });
    },
  });

  // Filters
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || c.departmentCode === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || s.departmentCode === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses & Subject Registry"
        subtitle="Curriculum planning, degree programs, credit allocations, and subject evaluation schemes."
        badge={<Badge variant="indigo" size="md">{subjects.length} Registered Subjects</Badge>}
        actions={
          activeTab === 'courses' ? (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddCourseModalOpen(true)}
            >
              Add Degree Program
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddSubjectModalOpen(true)}
            >
              Add Subject Roster
            </Button>
          )
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Degree Programs"
          value={courses.length}
          secondaryText="UG & PG Autonomous"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          label="Curriculum Subjects"
          value={subjects.length}
          secondaryText="Across 8 semesters"
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Elective Course Pool"
          value={subjects.filter((s) => s.type === 'elective').length}
          secondaryText="Specialized minors"
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
        <StatCard
          label="Average Credits / Degree"
          value="160 Credits"
          secondaryText="AICTE & UGC benchmark"
          icon={<Layers className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* Tab Switcher & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Degree Programs ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Subject Registry ({subjects.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} Department
              </option>
            ))}
          </select>

          <div className="w-64">
            <SearchInput
              placeholder={activeTab === 'courses' ? 'Search programs...' : 'Search subjects by code or title...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'courses' ? (
        isLoadingCourses ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No degree programs found"
            description="No degree courses matched your filter criteria."
            action={{
              label: 'Add Degree Program',
              onClick: () => setIsAddCourseModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="indigo" size="sm" className="font-mono">
                      {course.code}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {course.degreeType}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Offered by Department of {course.departmentCode}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 mt-4 border-y border-slate-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {course.durationYears} Years
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Semesters</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {course.totalSemesters} Sems
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Credits</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {course.totalCredits} Cr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    <strong className="text-slate-800 dark:text-zinc-200">{course.activeBatches}</strong> Active Batches
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => {
                      setActiveTab('subjects');
                      setSelectedDeptFilter(course.departmentCode);
                    }}
                  >
                    View Curriculum
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Subjects Registry Tab */
        isLoadingSubjects ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects found"
            description="No subjects matched your search or department filter."
            action={{
              label: 'Add Subject',
              onClick: () => setIsAddSubjectModalOpen(true),
            }}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Subject Code & Title</th>
                    <th className="py-3.5 px-4">Department & Sem</th>
                    <th className="py-3.5 px-4">Subject Type</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">L - T - P Breakdown</th>
                    <th className="py-3.5 px-4">Max Marks (Int / Ext)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredSubjects.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                            {sub.name}
                          </span>
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                            {sub.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {sub.departmentCode} · Sem {sub.semesterNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            sub.type === 'theory'
                              ? 'indigo'
                              : sub.type === 'practical'
                              ? 'emerald'
                              : 'purple'
                          }
                          size="sm"
                        >
                          {sub.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {sub.credits} Credits
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-zinc-400">
                        {sub.lectureHours} - {sub.tutorialHours} - {sub.practicalHours} Hrs/Wk
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-800 dark:text-zinc-200 font-semibold">
                          {sub.maxInternalMarks} Internal
                        </span>{' '}
                        <span className="text-slate-400">/</span>{' '}
                        <span className="text-slate-800 dark:text-zinc-200 font-semibold">
                          {sub.maxExternalMarks} External
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubject(sub);
                          }}
                        >
                          Syllabus & Scheme
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        title="Add Degree Program"
        description="Establish a degree syllabus, credit requirements, and duration."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addCourseMutation.isPending}
              disabled={!newCourse.code || !newCourse.name}
              onClick={() => addCourseMutation.mutate(newCourse)}
            >
              Establish Program
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Program Code"
            placeholder="e.g. BTECH-AI, MTECH-VLSI"
            value={newCourse.code}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Program Name"
            placeholder="e.g. B.Tech in Artificial Intelligence & Machine Learning"
            value={newCourse.name}
            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Degree Level
              </label>
              <select
                value={newCourse.degreeType}
                onChange={(e) => setNewCourse({ ...newCourse, degreeType: e.target.value as any })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
                <option value="MCA">MCA (Master of Computer App.)</option>
                <option value="Ph.D">Ph.D Doctoral Program</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Parent Department
              </label>
              <select
                value={newCourse.departmentCode}
                onChange={(e) => setNewCourse({ ...newCourse, departmentCode: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Duration (Years)"
              type="number"
              value={newCourse.durationYears}
              onChange={(e) => setNewCourse({ ...newCourse, durationYears: Number(e.target.value) })}
            />
            <Input
              label="Total Semesters"
              type="number"
              value={newCourse.totalSemesters}
              onChange={(e) => setNewCourse({ ...newCourse, totalSemesters: Number(e.target.value) })}
            />
            <Input
              label="Graduation Credits"
              type="number"
              value={newCourse.totalCredits}
              onChange={(e) => setNewCourse({ ...newCourse, totalCredits: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        title="Add Subject to Curriculum"
        description="Register a subject with credit parameters and internal/external mark scheme."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addSubjectMutation.isPending}
              disabled={!newSubject.code || !newSubject.name}
              onClick={() => addSubjectMutation.mutate(newSubject)}
            >
              Add Subject
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              placeholder="e.g. CS504, EC602"
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Subject Type
              </label>
              <select
                value={newSubject.type}
                onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value as any })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="theory">Theory Lecture Course</option>
                <option value="practical">Laboratory / Practical</option>
                <option value="elective">Departmental Elective</option>
              </select>
            </div>
          </div>

          <Input
            label="Subject Full Title"
            placeholder="e.g. Database Management & Warehousing"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Department
              </label>
              <select
                value={newSubject.departmentCode}
                onChange={(e) => setNewSubject({ ...newSubject, departmentCode: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Semester"
              type="number"
              min={1}
              max={8}
              value={newSubject.semesterNumber}
              onChange={(e) => setNewSubject({ ...newSubject, semesterNumber: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input
              label="Credits"
              type="number"
              value={newSubject.credits}
              onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
            />
            <Input
              label="L (Lect)"
              type="number"
              value={newSubject.lectureHours}
              onChange={(e) => setNewSubject({ ...newSubject, lectureHours: Number(e.target.value) })}
            />
            <Input
              label="T (Tut)"
              type="number"
              value={newSubject.tutorialHours}
              onChange={(e) => setNewSubject({ ...newSubject, tutorialHours: Number(e.target.value) })}
            />
            <Input
              label="P (Lab)"
              type="number"
              value={newSubject.practicalHours}
              onChange={(e) => setNewSubject({ ...newSubject, practicalHours: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <Input
              label="Internal Marks Weightage"
              type="number"
              value={newSubject.maxInternalMarks}
              onChange={(e) => setNewSubject({ ...newSubject, maxInternalMarks: Number(e.target.value) })}
              helperText="Continuous assessment"
            />
            <Input
              label="External Marks Weightage"
              type="number"
              value={newSubject.maxExternalMarks}
              onChange={(e) => setNewSubject({ ...newSubject, maxExternalMarks: Number(e.target.value) })}
              helperText="Semester end exam"
            />
          </div>
        </div>
      </Modal>

      {/* Subject Detail Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
        title={selectedSubject?.name || 'Subject Details'}
        subtitle={`Course Syllabus & Scheme · ${selectedSubject?.code}`}
        width="lg"
      >
        {selectedSubject && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedSubject.code}
                </span>
                <Badge variant="indigo" size="sm">
                  {selectedSubject.credits} Academic Credits
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {selectedSubject.name}
              </h3>
              <p className="text-xs text-slate-500">
                Department of {selectedSubject.departmentCode} · Semester {selectedSubject.semesterNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-400 block">Weekly Contact Hours</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {selectedSubject.lectureHours + selectedSubject.tutorialHours + selectedSubject.practicalHours} Hours / Week
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  L: {selectedSubject.lectureHours} | T: {selectedSubject.tutorialHours} | P: {selectedSubject.practicalHours}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-400 block">Evaluation Scheme</span>
                <span className="font-mono text-sm font-bold text-emerald-600">
                  {selectedSubject.maxInternalMarks} Int + {selectedSubject.maxExternalMarks} Ext
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Total {selectedSubject.maxInternalMarks + selectedSubject.maxExternalMarks} Marks
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Syllabus Modules (Units 1 - 5)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                    Unit 1: Foundations & Core Mathematical Models
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formal specifications, state space exploration, asymptotic complexity bounds, recurrence relations.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                    Unit 2: Distributed Synchronization & Consensus
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Logical clocks, vector time, Paxos, Raft consensus protocols, Byzantine fault tolerance.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                    Unit 3: Storage Architectures & Distributed File Systems
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Consistent hashing, replication strategies, GFS, HDFS, Cassandra LSM-tree storage engine.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedSubject(null)}>
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

