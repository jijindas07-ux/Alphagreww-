import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Plus,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  Briefcase,
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
import type { StudentListItem } from '@/types/academic.types';

export const StudentsDirectoryView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState<string>('ALL');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    departmentCode: 'CSE',
    year: 'Year 1',
    batch: '2025-2029',
    semester: 1,
    cgpa: 0,
    attendancePercentage: 100,
    activeBacklogs: 0,
    placementStatus: 'eligible' as const,
    feeStatus: 'pending' as const,
    mentorName: 'Dr. Sarah Jenkins',
    guardianName: '',
    guardianPhone: '',
  });

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: () => mockAdminService.getStudents(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Create Student Mutation
  const addStudentMutation = useMutation({
    mutationFn: (data: typeof newStudent) => mockAdminService.createStudent(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      addToast({
        title: 'Student Admitted',
        description: `${created.name} (${created.registrationNumber}) enrolled in ${created.departmentCode}.`,
        type: 'success',
      });
      setIsAddStudentModalOpen(false);
      setNewStudent({
        name: '',
        registrationNumber: '',
        email: '',
        phone: '',
        departmentCode: 'CSE',
        year: 'Year 1',
        batch: '2025-2029',
        semester: 1,
        cgpa: 0,
        attendancePercentage: 100,
        activeBacklogs: 0,
        placementStatus: 'eligible',
        feeStatus: 'pending',
        mentorName: 'Dr. Sarah Jenkins',
        guardianName: '',
        guardianPhone: '',
      });
    },
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || s.departmentCode === selectedDeptFilter;
    const matchesFee = selectedFeeFilter === 'ALL' || s.feeStatus === selectedFeeFilter;
    return matchesSearch && matchesDept && matchesFee;
  });

  const totalStudents = students.length;
  const avgAttendance = (
    students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (students.length || 1)
  ).toFixed(1);
  const eligiblePlacement = students.filter((s) => s.placementStatus === 'eligible' || s.placementStatus === 'placed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Student Directory"
        subtitle="Search student profiles, academic CGPAs, attendance compliance, backlogs, and fee clearance."
        badge={<Badge variant="indigo" size="md">{totalStudents} Active Students</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddStudentModalOpen(true)}
          >
            Admit New Student
          </Button>
        }
      />

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled Students"
          value={totalStudents.toLocaleString()}
          secondaryText="Across all 4 cohorts"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          label="Average Attendance"
          value={`${avgAttendance}%`}
          secondaryText="Institution wide"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Placement Eligible Pool"
          value={`${eligiblePlacement} Students`}
          secondaryText="Zero active backlogs"
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Attendance At Risk (<75%)"
          value={students.filter((s) => s.attendancePercentage < 75).length}
          secondaryText="Immediate counseling required"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dept Filter */}
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

          {/* Fee Filter */}
          <select
            value={selectedFeeFilter}
            onChange={(e) => setSelectedFeeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Fee Statuses</option>
            <option value="paid">Fee Paid</option>
            <option value="partial">Partial Fee Due</option>
            <option value="pending">Fee Pending</option>
          </select>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name, roll no or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students Data Table */}
      {isLoadingStudents ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="No students matched your search filters."
          action={{
            label: 'Admit New Student',
            onClick: () => setIsAddStudentModalOpen(true),
          }}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student Name & Roll No</th>
                  <th className="py-3.5 px-4">Department & Batch</th>
                  <th className="py-3.5 px-4">Cumulative CGPA</th>
                  <th className="py-3.5 px-4">Attendance %</th>
                  <th className="py-3.5 px-4">Backlogs</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4">Placement Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                            {st.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {st.registrationNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        {st.departmentCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {st.batch} · Sem {st.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={st.cgpa >= 8.5 ? 'emerald' : st.cgpa >= 7.0 ? 'indigo' : 'amber'}
                        size="sm"
                        className="font-mono font-bold"
                      >
                        {st.cgpa > 0 ? `${st.cgpa.toFixed(2)} CGPA` : 'Freshman'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs ${
                            st.attendancePercentage >= 75
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {st.attendancePercentage}%
                        </span>
                        <div className="w-16 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${st.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {st.activeBacklogs === 0 ? (
                        <span className="text-emerald-600 font-medium text-xs">Clean (0)</span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs">{st.activeBacklogs} Backlogs</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          st.feeStatus === 'paid'
                            ? 'emerald'
                            : st.feeStatus === 'partial'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                      >
                        {st.feeStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          st.placementStatus === 'placed'
                            ? 'emerald'
                            : st.placementStatus === 'eligible'
                            ? 'sky'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {st.placementStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(st);
                        }}
                      >
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title="Admit Student Record"
        description="Enroll a new student profile into the university database."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addStudentMutation.isPending}
              disabled={!newStudent.name || !newStudent.registrationNumber}
              onClick={() => addStudentMutation.mutate(newStudent)}
            >
              Admit Student
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Legal Name"
            placeholder="e.g. Rahul Sharma"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration / Roll No"
              placeholder="e.g. CS25B099"
              value={newStudent.registrationNumber}
              onChange={(e) => setNewStudent({ ...newStudent, registrationNumber: e.target.value.toUpperCase() })}
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Department
              </label>
              <select
                value={newStudent.departmentCode}
                onChange={(e) => setNewStudent({ ...newStudent, departmentCode: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Student Email"
              type="email"
              placeholder="rahul.s@student.alphagrew.edu"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              required
            />
            <Input
              label="Mobile Phone"
              type="tel"
              placeholder="+91 98450 12345"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              placeholder="e.g. Ramesh Sharma"
              value={newStudent.guardianName}
              onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
            />
            <Input
              label="Guardian Phone"
              placeholder="+91 98450 99881"
              value={newStudent.guardianPhone}
              onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Student Profile Detail Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.name || 'Student Profile'}
        subtitle={`Academic Record · ${selectedStudent?.registrationNumber}`}
        width="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {selectedStudent.name}
                  </h3>
                  <Badge variant="indigo" size="sm" className="font-mono">
                    {selectedStudent.registrationNumber}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedStudent.departmentCode} · {selectedStudent.batch} · Semester {selectedStudent.semester}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedStudent.email}
                  </span>
                  {selectedStudent.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" /> {selectedStudent.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block">Cumulative CGPA</span>
                <span className="font-mono text-base font-bold text-indigo-600">
                  {selectedStudent.cgpa.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block">Attendance</span>
                <span
                  className={`font-mono text-base font-bold ${
                    selectedStudent.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedStudent.attendancePercentage}%
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block">Active Backlogs</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
                  {selectedStudent.activeBacklogs} Courses
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Guardian & Mentor Information
              </h4>
              <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Faculty Mentor:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedStudent.mentorName || 'Dr. Sarah Jenkins'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Parent / Guardian:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedStudent.guardianName || 'Ramesh Sharma'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Emergency Phone:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200">
                    {selectedStudent.guardianPhone || '+91 98450 99881'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

