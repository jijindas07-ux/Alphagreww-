import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  FileCheck2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
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
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { SubjectMarksRoster } from '@/types/marks.types';

const STAGE_CONFIG: Record<string, { label: string; color: string; badgeVariant: 'amber' | 'sky' | 'indigo' | 'emerald' | 'rose' | 'neutral' | 'purple' }> = {
  draft: { label: 'Draft', color: 'text-slate-500', badgeVariant: 'neutral' },
  submitted: { label: 'Submitted', color: 'text-amber-600', badgeVariant: 'amber' },
  verified: { label: 'HOD Verified', color: 'text-sky-600', badgeVariant: 'sky' },
  approved: { label: 'Dean Approved', color: 'text-indigo-600', badgeVariant: 'indigo' },
  locked: { label: 'Published & Locked', color: 'text-emerald-600', badgeVariant: 'emerald' },
};

export const MarksEngineView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'review' | 'grades' | 'publishing' | 'audit'>('review');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedRoster, setSelectedRoster] = useState<SubjectMarksRoster | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');

  const { data: rosters = [], isLoading: isLoadingRosters } = useQuery({
    queryKey: ['admin', 'marksRosters'],
    queryFn: () => mockAdminService.getSubjectMarksRosters(),
  });

  const { data: gradeRules = [], isLoading: isLoadingGrades } = useQuery({
    queryKey: ['admin', 'gradeRules'],
    queryFn: () => mockAdminService.getGradeRules(),
  });

  const { data: auditLogs = [], isLoading: isLoadingAudit } = useQuery({
    queryKey: ['admin', 'marksAudit'],
    queryFn: () => mockAdminService.getMarksAudit(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Verify Mutation (HOD step)
  const verifyMutation = useMutation({
    mutationFn: (id: number) => mockAdminService.verifyMarksRoster(id),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksRosters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksAudit'] });
      addToast({ title: 'Marks Verified', description: `${r.subjectName} (${r.subjectCode}) verified by HOD.`, type: 'success' });
      setSelectedRoster(null);
    },
  });

  // Approve Mutation (Dean step)
  const approveMutation = useMutation({
    mutationFn: (id: number) => mockAdminService.approveMarksRoster(id),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksRosters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksAudit'] });
      addToast({ title: 'Marks Approved', description: `${r.subjectName} (${r.subjectCode}) approved by Dean.`, type: 'success' });
      setSelectedRoster(null);
    },
  });

  // Publish Mutation
  const publishMutation = useMutation({
    mutationFn: () => mockAdminService.publishSemesterResults(5, selectedDeptFilter === 'ALL' ? 'ALL' : selectedDeptFilter),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksRosters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksAudit'] });
      addToast({ title: 'Results Published', description: `${res.publishedCount} subject(s) locked and grade cards generated.`, type: 'success' });
      setIsPublishModalOpen(false);
    },
  });

  // Unlock Mutation
  const unlockMutation = useMutation({
    mutationFn: () => mockAdminService.unlockSemesterResults(5, selectedDeptFilter === 'ALL' ? 'ALL' : selectedDeptFilter, unlockReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksRosters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'marksAudit'] });
      addToast({ title: 'Results Unlocked', description: 'Published results rolled back to Approved status for correction.', type: 'warning' });
      setIsUnlockModalOpen(false);
      setUnlockReason('');
    },
  });

  // Filtered rosters
  const filteredRosters = rosters.filter((r) => {
    const matchesSearch = r.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) || r.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || r.departmentCode === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const draftCount = rosters.filter((r) => r.status === 'draft').length;
  const submittedCount = rosters.filter((r) => r.status === 'submitted').length;
  const verifiedCount = rosters.filter((r) => r.status === 'verified').length;
  const approvedCount = rosters.filter((r) => r.status === 'approved').length;
  const lockedCount = rosters.filter((r) => r.status === 'locked').length;

  // Publishing readiness: all rosters must be 'approved' or 'locked'
  const totalForPublish = filteredRosters.length;
  const readyForPublish = filteredRosters.filter((r) => r.status === 'approved').length;
  const alreadyPublished = filteredRosters.filter((r) => r.status === 'locked').length;
  const canPublish = readyForPublish > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="5-Stage Marks & Results Publishing Engine"
        subtitle="Faculty Draft → HOD Verification → Dean Approval → Controller Lock → Student Grade Cards"
        badge={<Badge variant="indigo" size="md">5-Stage Workflow Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {alreadyPublished > 0 && (
              <Button size="sm" variant="destructive" leftIcon={<Unlock className="w-3.5 h-3.5" />} onClick={() => setIsUnlockModalOpen(true)}>
                Emergency Rollback
              </Button>
            )}
            <Button size="sm" variant="primary" leftIcon={<Lock className="w-3.5 h-3.5" />} disabled={!canPublish} onClick={() => setIsPublishModalOpen(true)}>
              Publish Semester Results
            </Button>
          </div>
        }
      />

      {/* Workflow Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">1. Draft</span>
          <span className="font-mono text-xl font-bold text-slate-500">{draftCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-center">
          <span className="text-[10px] text-amber-600 uppercase tracking-wider block">2. Submitted</span>
          <span className="font-mono text-xl font-bold text-amber-600">{submittedCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 text-center">
          <span className="text-[10px] text-sky-600 uppercase tracking-wider block">3. HOD Verified</span>
          <span className="font-mono text-xl font-bold text-sky-600">{verifiedCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-center">
          <span className="text-[10px] text-indigo-600 uppercase tracking-wider block">4. Dean Approved</span>
          <span className="font-mono text-xl font-bold text-indigo-600">{approvedCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
          <span className="text-[10px] text-emerald-600 uppercase tracking-wider block">5. Published</span>
          <span className="font-mono text-xl font-bold text-emerald-600">{lockedCount}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {(['review', 'grades', 'publishing', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
            >
              {tab === 'review' ? `Review Queue (${rosters.length})` : tab === 'grades' ? `Grade Rules (${gradeRules.length})` : tab === 'publishing' ? 'Publishing Readiness' : `Audit Trail (${auditLogs.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'review' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={selectedDeptFilter} onChange={(e) => setSelectedDeptFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="ALL">All Departments</option>
              {departments.map((d) => <option key={d.code} value={d.code}>{d.code}</option>)}
            </select>
            <div className="w-64">
              <SearchInput placeholder="Search subject code or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Tab: Review Queue */}
      {activeTab === 'review' && (
        isLoadingRosters ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredRosters.length === 0 ? (
          <EmptyState icon={Award} title="No subject rosters found" description="No marks rosters matched your filter criteria." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Subject & Faculty</th>
                    <th className="py-3.5 px-4">Dept / Sem</th>
                    <th className="py-3.5 px-4">Students</th>
                    <th className="py-3.5 px-4">Pass / Fail</th>
                    <th className="py-3.5 px-4">Average Score</th>
                    <th className="py-3.5 px-4">Workflow Stage</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredRosters.map((roster) => {
                    const stage = STAGE_CONFIG[roster.status];
                    return (
                      <tr key={roster.id} onClick={() => setSelectedRoster(roster)} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">{roster.subjectName}</span>
                          <span className="text-[11px] text-slate-500">{roster.subjectCode} · {roster.facultyName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300 font-medium">{roster.departmentCode} · Sem {roster.semesterNumber}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">{roster.enteredCount} / {roster.totalStudents}</td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-emerald-600 font-semibold">{roster.passedCount} Pass</span>{' '}
                          <span className="text-slate-400">/</span>{' '}
                          <span className="text-rose-600 font-semibold">{roster.failedCount} Fail</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-indigo-600">{roster.averageScore}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={stage.badgeVariant} size="sm">{stage.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {roster.status === 'submitted' && (
                              <Button size="sm" variant="secondary" className="h-7 text-xs px-2" isLoading={verifyMutation.isPending} onClick={(e) => { e.stopPropagation(); verifyMutation.mutate(roster.id); }}>
                                Verify
                              </Button>
                            )}
                            {roster.status === 'verified' && (
                              <Button size="sm" variant="primary" className="h-7 text-xs px-2" isLoading={approveMutation.isPending} onClick={(e) => { e.stopPropagation(); approveMutation.mutate(roster.id); }}>
                                Approve
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedRoster(roster); }}>
                              Inspect
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Tab: Grade Rules */}
      {activeTab === 'grades' && (
        isLoadingGrades ? <Skeleton className="h-64 w-full rounded-xl" /> : (
          <Card>
            <CardHeader>
              <CardTitle>Institutional Grading Scheme</CardTitle>
              <CardDescription>Grade letter assignments, grade points, and percentage thresholds for SGPA/CGPA calculation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Grade Letter</th>
                      <th className="py-3 px-4">Grade Point</th>
                      <th className="py-3 px-4">Percentage Range</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                    {gradeRules.map((rule) => (
                      <tr key={rule.grade} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-mono font-bold text-base ${rule.colorClass}`}>
                            {rule.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-lg font-bold text-slate-900 dark:text-zinc-100">{rule.gradePoint}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-zinc-200">{rule.minPercentage}% – {rule.maxPercentage}%</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{rule.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Tab: Publishing Readiness */}
      {activeTab === 'publishing' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">Semester Publishing Readiness Check</h3>
            <p className="text-xs text-slate-500 mb-5">All subjects in a semester must reach &quot;Approved&quot; status before results can be locked and published to student grade cards.</p>

            <div className="space-y-3">
              {rosters.map((roster) => {
                const stage = STAGE_CONFIG[roster.status];
                const isReady = roster.status === 'approved' || roster.status === 'locked';
                return (
                  <div key={roster.id} className={`p-4 rounded-xl border flex items-center justify-between ${isReady ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-slate-200/80 dark:border-zinc-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500'}`}>
                        {isReady ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">{roster.subjectCode} · {roster.subjectName}</span>
                        <span className="text-[11px] text-slate-500">{roster.departmentCode} · Sem {roster.semesterNumber} · {roster.facultyName}</span>
                      </div>
                    </div>
                    <Badge variant={stage.badgeVariant} size="sm">{stage.label}</Badge>
                  </div>
                );
              })}
            </div>

            <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">
                  Ready: <strong className="text-emerald-600">{readyForPublish + alreadyPublished}</strong> / {totalForPublish || rosters.length} subjects
                </span>
              </div>
              <Button size="sm" variant="primary" leftIcon={<Lock className="w-3.5 h-3.5" />} disabled={!canPublish} onClick={() => setIsPublishModalOpen(true)}>
                Publish & Lock Results
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Audit Trail */}
      {activeTab === 'audit' && (
        isLoadingAudit ? <Skeleton className="h-64 w-full rounded-xl" /> : auditLogs.length === 0 ? (
          <EmptyState icon={FileCheck2} title="No audit records" description="The marks audit ledger is empty." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor & Role</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Transition</th>
                    <th className="py-3.5 px-4">Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{log.actorName}</span>
                        <span className="text-[11px] text-slate-500">{log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{log.subjectCode}</span>
                        <span className="text-[11px] text-slate-500">{log.subjectName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={log.action === 'PUBLISHED' ? 'emerald' : log.action === 'UNLOCKED' ? 'rose' : 'indigo'} size="sm">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="text-slate-500">{log.previousStatus}</span>
                        <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" />
                        <span className="text-slate-800 dark:text-zinc-200 font-semibold">{log.newStatus}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">{log.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Roster Detail Drawer */}
      <SlideOverDrawer isOpen={!!selectedRoster} onClose={() => setSelectedRoster(null)} title={selectedRoster?.subjectName || 'Marks Roster'} subtitle={`Subject Marks Inspector · ${selectedRoster?.subjectCode}`} width="lg">
        {selectedRoster && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">{selectedRoster.subjectCode}</span>
                <Badge variant={STAGE_CONFIG[selectedRoster.status].badgeVariant} size="sm">{STAGE_CONFIG[selectedRoster.status].label}</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{selectedRoster.subjectName}</h3>
              <p className="text-xs text-slate-500">Faculty: {selectedRoster.facultyName} · Sem {selectedRoster.semesterNumber} · AY {selectedRoster.academicYear}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 block">Enrolled</span>
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-zinc-100">{selectedRoster.totalStudents}</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 text-center">
                <span className="text-[10px] text-emerald-600 block">Passed</span>
                <span className="font-mono text-lg font-bold text-emerald-600">{selectedRoster.passedCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-rose-200/80 dark:border-rose-900/50 text-center">
                <span className="text-[10px] text-rose-600 block">Failed</span>
                <span className="font-mono text-lg font-bold text-rose-600">{selectedRoster.failedCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Workflow Timeline</h4>
              <div className="space-y-2 text-xs">
                {selectedRoster.submittedAt && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span><strong>Submitted:</strong> {selectedRoster.submittedAt}</span>
                  </div>
                )}
                {selectedRoster.verifiedAt && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span><strong>HOD Verified:</strong> {selectedRoster.verifiedAt}</span>
                  </div>
                )}
                {selectedRoster.approvedAt && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span><strong>Dean Approved:</strong> {selectedRoster.approvedAt}</span>
                  </div>
                )}
                {selectedRoster.publishedAt && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span><strong>Published & Locked:</strong> {selectedRoster.publishedAt}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end gap-2">
              {selectedRoster.status === 'submitted' && (
                <Button size="sm" variant="primary" isLoading={verifyMutation.isPending} onClick={() => verifyMutation.mutate(selectedRoster.id)}>
                  Verify Marks (HOD)
                </Button>
              )}
              {selectedRoster.status === 'verified' && (
                <Button size="sm" variant="primary" isLoading={approveMutation.isPending} onClick={() => approveMutation.mutate(selectedRoster.id)}>
                  Approve (Dean)
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setSelectedRoster(null)}>Close</Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Publish Confirmation Modal */}
      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title="Publish & Lock Semester Results" description={`This will finalize ${readyForPublish} approved subject(s), calculate SGPA, and push grade cards to student portals. This action is logged and auditable.`} size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsPublishModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={publishMutation.isPending} onClick={() => publishMutation.mutate()}>Confirm & Publish Results</Button>
          </div>
        }
      />

      {/* Unlock / Rollback Modal */}
      <Modal isOpen={isUnlockModalOpen} onClose={() => setIsUnlockModalOpen(false)} title="Emergency Result Rollback" description="Rolling back published results is a critical administrative action. A mandatory justification is required and will be permanently logged." size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsUnlockModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={!unlockReason.trim()} isLoading={unlockMutation.isPending} onClick={() => unlockMutation.mutate()}>Confirm Rollback</Button>
          </div>
        }
      >
        <Input label="Mandatory Justification" placeholder="e.g. Tabulation error discovered in CS502 internal marks" value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} required />
      </Modal>
    </div>
  );
};

