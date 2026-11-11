import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Users,
  GraduationCap,
  Layers,
  MapPin,
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
import type { Department } from '@/types/academic.types';

export const DepartmentsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'departments' | 'campuses'>('departments');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isAddCampusModalOpen, setIsAddCampusModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states for new Department
  const [newDept, setNewDept] = useState({
    code: '',
    name: '',
    hodName: '',
    intake: 120,
    staffCount: 20,
    colorHex: '#6366F1',
    labsCount: 4,
  });

  // Form states for new Campus
  const [newCampus, setNewCampus] = useState({
    code: '',
    name: '',
    directorName: '',
    location: '',
    landAreaAcres: 25,
    totalBuildings: 6,
    totalStudents: 0,
    status: 'active' as const,
  });

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  const { data: campuses = [], isLoading: isLoadingCampuses } = useQuery({
    queryKey: ['admin', 'campuses'],
    queryFn: () => mockAdminService.getCampuses(),
  });

  // Add Department Mutation
  const addDeptMutation = useMutation({
    mutationFn: (deptData: typeof newDept) =>
      mockAdminService.createDepartment({
        ...deptData,
        studentCount: 0,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      addToast({
        title: 'Department Created',
        description: `${created.name} (${created.code}) successfully added.`,
        type: 'success',
      });
      setIsAddDeptModalOpen(false);
      setNewDept({
        code: '',
        name: '',
        hodName: '',
        intake: 120,
        staffCount: 20,
        colorHex: '#6366F1',
        labsCount: 4,
      });
    },
  });

  // Add Campus Mutation
  const addCampusMutation = useMutation({
    mutationFn: (campusData: typeof newCampus) => mockAdminService.createCampus(campusData),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campuses'] });
      addToast({
        title: 'Campus Added',
        description: `${created.name} (${created.code}) registered into institution network.`,
        type: 'success',
      });
      setIsAddCampusModalOpen(false);
      setNewCampus({
        code: '',
        name: '',
        directorName: '',
        location: '',
        landAreaAcres: 25,
        totalBuildings: 6,
        totalStudents: 0,
        status: 'active',
      });
    },
  });

  // Filtered lists
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.hodName && d.hodName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCampuses = campuses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIntake = departments.reduce((acc, d) => acc + d.intake, 0);
  const totalStudents = departments.reduce((acc, d) => acc + d.studentCount, 0);
  const totalFaculty = departments.reduce((acc, d) => acc + d.staffCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments & Campus Sites"
        subtitle="Manage academic faculties, physical campuses, departmental intake quotas, and leadership heads."
        badge={<Badge variant="indigo" size="md">{departments.length} Academic Faculties</Badge>}
        actions={
          activeTab === 'departments' ? (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddDeptModalOpen(true)}
            >
              Add Department
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddCampusModalOpen(true)}
            >
              Register Campus Site
            </Button>
          )
        }
      />

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Academic Departments"
          value={departments.length}
          secondaryText="Across 2 campuses"
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Total Approved Intake"
          value={`${totalIntake} Seats`}
          secondaryText="Annual freshman capacity"
          icon={<GraduationCap className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Enrolled Students"
          value={totalStudents.toLocaleString()}
          secondaryText="Across all 4 batches"
          icon={<Users className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Faculty-Student Ratio"
          value={totalFaculty > 0 ? `1 : ${Math.round(totalStudents / totalFaculty)}` : '1 : 14'}
          secondaryText="Accreditation compliant"
          icon={<Layers className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'departments'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Academic Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('campuses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'campuses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Campus Locations ({campuses.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            placeholder={activeTab === 'departments' ? 'Search by name, code or HOD...' : 'Search campuses...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'departments' ? (
        isLoadingDepts ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments found"
            description="No academic departments matched your search query. Try clearing your filter or add a new department."
            action={{
              label: 'Add Department',
              onClick: () => setIsAddDeptModalOpen(true),
            }}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Dept Code & Title</th>
                    <th className="py-3.5 px-4">Head of Department</th>
                    <th className="py-3.5 px-4">Annual Intake</th>
                    <th className="py-3.5 px-4">Enrolled Students</th>
                    <th className="py-3.5 px-4">Faculty Count</th>
                    <th className="py-3.5 px-4">Specialized Labs</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredDepartments.map((dept) => (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDept(dept)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: dept.colorHex || '#6366F1' }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                              {dept.name}
                            </span>
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              {dept.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">
                          {dept.hodName || 'Not Assigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                          {dept.intake} Seats
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {dept.studentCount} Students
                          </span>
                          <div className="w-28 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (dept.studentCount / (dept.intake * 4)) * 100)}%`,
                                backgroundColor: dept.colorHex || '#6366F1',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">
                        {dept.staffCount} Faculty
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-zinc-400">
                        {dept.labsCount || 6} Research Labs
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDept(dept);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* Campus Sites Tab */
        isLoadingCampuses ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : filteredCampuses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No campus sites found"
            description="No campuses matched your search."
            action={{
              label: 'Add Campus Site',
              onClick: () => setIsAddCampusModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampuses.map((campus) => (
              <Card key={campus.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Badge variant="indigo" size="sm" className="mb-2 font-mono">
                        {campus.code}
                      </Badge>
                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        {campus.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {campus.location}
                      </p>
                    </div>
                    <Badge variant="emerald" size="sm">
                      {campus.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Director / Head</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {campus.directorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Land Area</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                        {campus.landAreaAcres} Acres
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Infrastructure</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                        {campus.totalBuildings} Academic Blocks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  <span className="text-xs text-slate-500 font-mono">
                    <strong className="text-slate-800 dark:text-zinc-200">{campus.totalStudents}</strong> Enrolled Students
                  </span>
                  <Button size="sm" variant="secondary" className="h-7 text-xs">
                    Manage Campus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddDeptModalOpen}
        onClose={() => setIsAddDeptModalOpen(false)}
        title="Add Academic Department"
        description="Configure a new degree-granting department, annual intake quota, and assigned leadership."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addDeptMutation.isPending}
              disabled={!newDept.code || !newDept.name}
              onClick={() => addDeptMutation.mutate(newDept)}
            >
              Create Department
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Code"
            placeholder="e.g. CSE, ECE, MECH"
            value={newDept.code}
            onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
            helperText="Standard 3 to 5 letter uppercase identifier"
            required
          />
          <Input
            label="Department Full Name"
            placeholder="e.g. Computer Science & Engineering"
            value={newDept.name}
            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            required
          />
          <Input
            label="Head of Department (HOD)"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={newDept.hodName}
            onChange={(e) => setNewDept({ ...newDept, hodName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Annual Intake (Seats)"
              type="number"
              value={newDept.intake}
              onChange={(e) => setNewDept({ ...newDept, intake: Number(e.target.value) })}
              required
            />
            <Input
              label="Initial Faculty Count"
              type="number"
              value={newDept.staffCount}
              onChange={(e) => setNewDept({ ...newDept, staffCount: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Add Campus Modal */}
      <Modal
        isOpen={isAddCampusModalOpen}
        onClose={() => setIsAddCampusModalOpen(false)}
        title="Register Physical Campus"
        description="Add a physical institution facility or regional campus."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddCampusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addCampusMutation.isPending}
              disabled={!newCampus.code || !newCampus.name}
              onClick={() => addCampusMutation.mutate(newCampus)}
            >
              Register Campus
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Campus Code"
            placeholder="e.g. MAIN-CAMPUS, CITY-CAMPUS"
            value={newCampus.code}
            onChange={(e) => setNewCampus({ ...newCampus, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Campus Name"
            placeholder="e.g. Alpha University Main Campus"
            value={newCampus.name}
            onChange={(e) => setNewCampus({ ...newCampus, name: e.target.value })}
            required
          />
          <Input
            label="Director / Campus Dean"
            placeholder="e.g. Dr. Arthur Vance"
            value={newCampus.directorName}
            onChange={(e) => setNewCampus({ ...newCampus, directorName: e.target.value })}
          />
          <Input
            label="Physical Address / Location"
            placeholder="e.g. North Tech Corridor, Bangalore"
            value={newCampus.location}
            onChange={(e) => setNewCampus({ ...newCampus, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Land Area (Acres)"
              type="number"
              value={newCampus.landAreaAcres}
              onChange={(e) => setNewCampus({ ...newCampus, landAreaAcres: Number(e.target.value) })}
            />
            <Input
              label="Academic Blocks"
              type="number"
              value={newCampus.totalBuildings}
              onChange={(e) => setNewCampus({ ...newCampus, totalBuildings: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Department Detail SlideOverDrawer */}
      <SlideOverDrawer
        isOpen={!!selectedDept}
        onClose={() => setSelectedDept(null)}
        title={selectedDept?.name || 'Department Details'}
        subtitle={`Academic Faculty Profile · ${selectedDept?.code}`}
        width="lg"
      >
        {selectedDept && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Head of Department</span>
                <Badge variant="indigo" size="sm">
                  Active Tenure
                </Badge>
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {selectedDept.hodName || 'Prof. Unassigned'}
              </p>
              <p className="text-xs text-slate-500">
                Authorized for marks moderation, faculty period allocation, and syllabus ratification.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 block">Total Capacity</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
                  {selectedDept.intake * 4} Students
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">4 Cohort Batches</span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 block">Current Enrollment</span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedDept.studentCount} Students
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                  {Math.round((selectedDept.studentCount / (selectedDept.intake * 4)) * 100)}% Capacity Fill
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Affiliated Programs & Degrees
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      Bachelor of Technology (B.Tech)
                    </span>
                    <span className="text-[11px] text-slate-500">4 Years · 8 Semesters · 160 Credits</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Autonomous
                  </Badge>
                </div>
                <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      Master of Technology (M.Tech)
                    </span>
                    <span className="text-[11px] text-slate-500">2 Years · 4 Semesters · 80 Credits</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    PG Program
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Department Laboratories & Centers
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-semibold block text-slate-800 dark:text-zinc-200">Lab 1: High Performance Compute</span>
                  <span className="text-[11px] text-slate-500">64 GPU Workstations</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-semibold block text-slate-800 dark:text-zinc-200">Lab 2: Cloud & Virtualization</span>
                  <span className="text-[11px] text-slate-500">Private OpenStack Cluster</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-semibold block text-slate-800 dark:text-zinc-200">Lab 3: IoT & Embedded Systems</span>
                  <span className="text-[11px] text-slate-500">40 Hardware Benches</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                  <span className="font-semibold block text-slate-800 dark:text-zinc-200">Lab 4: AI & Deep Learning Studio</span>
                  <span className="text-[11px] text-slate-500">NVIDIA Tensor Core Rig</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDept(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

