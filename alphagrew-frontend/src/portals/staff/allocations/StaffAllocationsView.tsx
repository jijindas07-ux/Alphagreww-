import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  Calendar,
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
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { AllocatedSubject } from '@/types/staff.types';

export const StaffAllocationsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<AllocatedSubject | null>(null);

  const { data: allocated = [], isLoading } = useQuery({
    queryKey: ['staff-allocated-subjects'],
    queryFn: () => mockStaffService.getAllocatedSubjects(),
  });

  const filtered = allocated.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.subjectCode.toLowerCase().includes(q) ||
      s.subjectName.toLowerCase().includes(q) ||
      s.batchName.toLowerCase().includes(q)
    );
  });

  const totalCredits = allocated.reduce((acc, curr) => acc + curr.credits, 0);
  const totalStudentsEnrolled = allocated.reduce((acc, curr) => acc + curr.totalEnrolled, 0);
  const totalTeachingHours = allocated.reduce(
    (acc, curr) => acc + curr.lectureHours + curr.practicalHours + curr.tutorialHours,
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Allocated Subjects & Syllabus Progress"
        subtitle="Current semester teaching load, student enrollments, and syllabus delivery milestones."
        badge={<Badge variant="sky">Academic Term 2026-2027</Badge>}
        actions={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
            onClick={() => navigate('/staff/timetable')}
          >
            Class Timetable
          </Button>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Subjects"
          value={`${allocated.length} Courses`}
          secondaryText="Theory & Laboratory"
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          label="Total Credits"
          value={`${totalCredits} Credits`}
          secondaryText="Approved by Academic Council"
          icon={<Award className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Weekly Contact Hours"
          value={`${totalTeachingHours} Hours`}
          secondaryText="Lectures + Practicals"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        <StatCard
          label="Total Scholars Taught"
          value={`${totalStudentsEnrolled} Students`}
          secondaryText="Across 3 B.Tech Batches"
          icon={<Users className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* 3. Subjects Cards Grid */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle>Instructional Allotment Roster</CardTitle>
            <CardDescription>
              Click any subject to view module units, lesson plans, and textbook references
            </CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search code or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects match query"
              description="Try adjusting your search criteria."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        {subject.subjectCode} · {subject.credits} Credits
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          subject.internalMarksStatus === 'verified'
                            ? 'emerald'
                            : subject.internalMarksStatus === 'submitted'
                              ? 'sky'
                              : 'amber'
                        }
                      >
                        Marks: {subject.internalMarksStatus}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                      {subject.subjectName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {subject.batchName} · Section {subject.section} · Room {subject.roomNumber}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Enrolled</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {subject.totalEnrolled} Scholars
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Schedule</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {subject.lectureHours}L + {subject.practicalHours}P / wk
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Avg Attendance</span>
                        <span className="font-semibold text-emerald-600">
                          {subject.averageAttendance}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>Syllabus Coverage</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {subject.syllabusCompletionPercentage}% ({subject.completedTopicsCount}/{subject.totalTopicsCount} Units)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${subject.syllabusCompletionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Subject Syllabus Detail Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        title={`${selectedSubject?.subjectCode}: ${selectedSubject?.subjectName}`}
        description={`${selectedSubject?.credits} Credits · ${selectedSubject?.lectureHours} Lectures/wk · ${selectedSubject?.roomNumber}`}
        width="md"
      >
        {selectedSubject && (
          <div className="space-y-5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Cohort:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedSubject.batchName} (Sec {selectedSubject.section})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Enrolled Students:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedSubject.totalEnrolled} Scholars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Scheduled Lecture:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedSubject.nextLectureTime || 'Consult Timetable'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                Curriculum Modules Breakdown
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span>Module 1: Foundations & Architecture</span>
                    <Badge size="sm" variant="emerald">Completed</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    System models, clock synchronization, Lamport timestamps, vector clocks.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span>Module 2: Consensus & Mutual Exclusion</span>
                    <Badge size="sm" variant="emerald">Completed</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ricart-Agrawala, token rings, Paxos consensus, Raft leader election.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span>Module 3: Distributed Transactions & Sharding</span>
                    <Badge size="sm" variant="amber">In Progress</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Two-phase commit (2PC), distributed lock managers, ACID across microservices.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span>Module 4: Fault Tolerance & Replication</span>
                    <Badge size="sm" variant="neutral">Upcoming</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Byzantine fault tolerance, gossip protocols, eventual consistency.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/staff/attendance')}
              >
                Mark Attendance
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/staff/marks-entry')}
              >
                Enter Marks
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};
