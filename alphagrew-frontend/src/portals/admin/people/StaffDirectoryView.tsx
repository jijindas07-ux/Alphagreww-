import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  BookOpen,
  Award,
  Phone,
  Mail,
  Clock,
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
import type { StaffListItem } from '@/types/academic.types';

export const StaffDirectoryView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffListItem | null>(null);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    employeeId: '',
    email: '',
    departmentCode: 'CSE',
    designationName: 'Assistant Professor',
    qualification: 'M.Tech, Ph.D. in Computer Science',
    specialization: '',
    phone: '',
    teachingLoadHours: 14,
    allocatedSubjects: [] as string[],
    status: 'active' as const,
    joinedDate: '2026-08-01',
  });

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => mockAdminService.getStaff(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Create Staff Mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: typeof newStaff) => mockAdminService.createStaff(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      addToast({
        title: 'Faculty Enrolled',
        description: `${created.name} (${created.employeeId}) appointed to Department of ${created.departmentCode}.`,
        type: 'success',
      });
      setIsAddStaffModalOpen(false);
      setNewStaff({
        name: '',
        employeeId: '',
        email: '',
        departmentCode: 'CSE',
        designationName: 'Assistant Professor',
        qualification: 'M.Tech, Ph.D. in Computer Science',
        specialization: '',
        phone: '',
        teachingLoadHours: 14,
        allocatedSubjects: [],
        status: 'active',
        joinedDate: '2026-08-01',
      });
    },
  });

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || s.departmentCode === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const totalStaff = staffList.length;
  const avgWorkload = (
    staffList.reduce((acc, s) => acc + s.teachingLoadHours, 0) / (staffList.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Instructional Staff Directory"
        subtitle="Manage professors, department chairs, teaching allocations, weekly workloads, and specializations."
        badge={<Badge variant="indigo" size="md">{totalStaff} Appointed Faculty</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddStaffModalOpen(true)}
          >
            Appoint Faculty Member
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Faculty & Staff"
          value={totalStaff}
          secondaryText="Across 4 faculties"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Average Teaching Load"
          value={`${avgWorkload} Hrs/Wk`}
          secondaryText="AICTE workload compliant"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Ph.D. Qualified Faculty"
          value="88%"
          secondaryText="Research active profile"
          icon={<Award className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Allocated Subjects"
          value="42 Sections"
          secondaryText="Active semester rosters"
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
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
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search faculty by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Table */}
      {isLoadingStaff ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No faculty members found"
          description="No staff records matched your query."
          action={{
            label: 'Appoint Faculty Member',
            onClick: () => setIsAddStaffModalOpen(true),
          }}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Faculty Name & ID</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Teaching Load</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                {filteredStaff.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStaff(st)}
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
                            {st.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        {st.designationName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="indigo" size="sm" className="font-mono">
                        {st.departmentCode}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                      {st.specialization}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {st.teachingLoadHours} Hours / Week
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.status === 'active' ? 'emerald' : 'amber'} size="sm">
                        {st.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaff(st);
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

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Appoint Faculty Member"
        description="Register a new academic staff member with designation and teaching quota."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addStaffMutation.isPending}
              disabled={!newStaff.name || !newStaff.employeeId}
              onClick={() => addStaffMutation.mutate(newStaff)}
            >
              Confirm Appointment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name with Salutation"
            placeholder="e.g. Dr. Arthur Vance"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              placeholder="e.g. FAC-CSE-009"
              value={newStaff.employeeId}
              onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value.toUpperCase() })}
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Department
              </label>
              <select
                value={newStaff.departmentCode}
                onChange={(e) => setNewStaff({ ...newStaff, departmentCode: e.target.value })}
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
              label="Designation Title"
              placeholder="e.g. Associate Professor"
              value={newStaff.designationName}
              onChange={(e) => setNewStaff({ ...newStaff, designationName: e.target.value })}
              required
            />
            <Input
              label="Teaching Load (Hours/Wk)"
              type="number"
              value={newStaff.teachingLoadHours}
              onChange={(e) => setNewStaff({ ...newStaff, teachingLoadHours: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Specialization / Domain"
            placeholder="e.g. Distributed Consensus & Cloud Storage"
            value={newStaff.specialization}
            onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Official Email"
              type="email"
              placeholder="arthur.v@alphagrew.edu"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
            />
            <Input
              label="Phone Contact"
              type="tel"
              placeholder="+91 98450 77999"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Staff Profile Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.name || 'Faculty Profile'}
        subtitle={`Academic Profile · ${selectedStaff?.employeeId}`}
        width="lg"
      >
        {selectedStaff && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                {selectedStaff.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {selectedStaff.name}
                  </h3>
                  <Badge variant="indigo" size="sm" className="font-mono">
                    {selectedStaff.departmentCode}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                  {selectedStaff.designationName} · {selectedStaff.qualification}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedStaff.email}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" /> {selectedStaff.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block">Weekly Teaching Hours</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
                  {selectedStaff.teachingLoadHours} Hours
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Approved Lecture Quota</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block">Tenure Service</span>
                <span className="font-mono text-base font-bold text-indigo-600">
                  Since {new Date(selectedStaff.joinedDate).getFullYear()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Confirmed Faculty</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Allocated Subjects & Syllabus Duties
              </h4>
              <div className="space-y-2">
                {selectedStaff.allocatedSubjects.length > 0 ? (
                  selectedStaff.allocatedSubjects.map((sub) => (
                    <div
                      key={sub}
                      className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {sub}
                      </span>
                      <Badge variant="indigo" size="sm">
                        Course In-Charge
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No current semester subject allocations.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedStaff(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

