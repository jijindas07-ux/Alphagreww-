import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Mail,
  Send,
  Clock,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { PendingRegistration } from '@/types/placement.types';

export const OnboardingView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'queue' | 'invite'>('queue');
  const [selectedForAction, setSelectedForAction] = useState<PendingRegistration | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Single Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'student' | 'faculty' | 'hod'>('student');
  const [inviteDept, setInviteDept] = useState('CSE');

  const { data: pendingQueue = [], isLoading: isLoadingQueue } = useQuery({
    queryKey: ['admin', 'pendingRegistrations'],
    queryFn: () => mockAdminService.getPendingRegistrations(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => mockAdminService.getDepartments(),
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => mockAdminService.approveRegistration(id),
    onSuccess: (reg) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboardSummary'] });
      addToast({
        title: 'Registration Approved',
        description: `${reg.name} has been admitted and credentials issued via email.`,
        type: 'success',
      });
      setSelectedForAction(null);
      setActionType(null);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      mockAdminService.rejectRegistration(id, reason),
    onSuccess: (reg) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingRegistrations'] });
      addToast({
        title: 'Registration Rejected',
        description: `Application for ${reg.name} was rejected. Notification dispatched.`,
        type: 'info',
      });
      setSelectedForAction(null);
      setActionType(null);
      setRejectionReason('');
    },
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    addToast({
      title: 'Invitation Dispatched',
      description: `Secure onboarding link sent to ${inviteEmail} for role ${inviteRole.toUpperCase()}.`,
      type: 'success',
    });
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding & Self-Registration Hub"
        subtitle="Review self-registered admissions, verify identity documents, and dispatch role-based portal invitations."
        badge={<Badge variant="amber" size="md">{pendingQueue.length} Pending Approvals</Badge>}
        actions={
          activeTab === 'queue' ? (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('invite')}
            >
              Send Direct Invitations
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Clock className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('queue')}
            >
              Back to Approval Queue
            </Button>
          )
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Queue"
          value={`${pendingQueue.length} Profiles`}
          secondaryText="Awaiting admin sign-off"
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        <StatCard
          label="Auto-Verified Records"
          value="98.2%"
          secondaryText="Biometric & Aadhaar linked"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Active Invitation Links"
          value="18 Sent"
          secondaryText="Expiring within 72 hrs"
          icon={<Mail className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Rejection Rate"
          value="2.4%"
          secondaryText="Document mismatch flag"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'queue'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Registration Approval Queue ({pendingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'invite'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Invite New Users
        </button>
      </div>

      {/* Tab 1: Pending Queue */}
      {activeTab === 'queue' ? (
        isLoadingQueue ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : pendingQueue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All registrations reviewed"
            description="The onboarding queue is completely clear. No pending applicant profiles await review."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Applicant Profile</th>
                    <th className="py-3.5 px-4">Roll / Reg Number</th>
                    <th className="py-3.5 px-4">Department & Class</th>
                    <th className="py-3.5 px-4">Submitted At</th>
                    <th className="py-3.5 px-4">Document Status</th>
                    <th className="py-3.5 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {pendingQueue.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                            {reg.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                              {reg.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {reg.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {reg.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                          {reg.departmentCode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {reg.year}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {reg.submittedAt}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="emerald" size="sm">
                          Verified OK
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs px-2.5"
                            onClick={() => {
                              setSelectedForAction(reg);
                              setActionType('reject');
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-7 text-xs px-2.5"
                            onClick={() => {
                              setSelectedForAction(reg);
                              setActionType('approve');
                            }}
                          >
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* Tab 2: Invite Users */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Dispatch Portal Invitation
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Send an onboarding invitation link with pre-assigned role permissions.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <Input
                label="Recipient Full Name"
                placeholder="e.g. Rahul Dev"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="rahul.dev@alphagrew.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Designated Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="student">Student (Self-Service)</option>
                    <option value="faculty">Instructional Faculty</option>
                    <option value="hod">Head of Department (HOD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" variant="primary" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Dispatch Invitation Link
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Bulk CSV Admission Import
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Import cohorts in batch using standardized university templates.
            </p>

            <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Drop your applicant roster CSV here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports columns: RollNo, Name, Email, Dept, Batch, Semester
                </p>
              </div>
              <Button size="sm" variant="secondary" className="text-xs h-7">
                Browse Files
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal: Approve / Reject */}
      <Modal
        isOpen={!!selectedForAction}
        onClose={() => {
          setSelectedForAction(null);
          setActionType(null);
        }}
        title={actionType === 'approve' ? 'Confirm Student Admission' : 'Reject Admission Application'}
        description={
          actionType === 'approve'
            ? `Are you sure you want to approve ${selectedForAction?.name} (${selectedForAction?.registrationNumber})? This will generate their institutional profile and active credentials.`
            : `Please provide an official justification for rejecting the application of ${selectedForAction?.name}.`
        }
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedForAction(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            {actionType === 'approve' ? (
              <Button
                variant="primary"
                size="sm"
                isLoading={approveMutation.isPending}
                onClick={() => selectedForAction && approveMutation.mutate(selectedForAction.id)}
              >
                Confirm Admission
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                isLoading={rejectMutation.isPending}
                disabled={!rejectionReason.trim()}
                onClick={() =>
                  selectedForAction &&
                  rejectMutation.mutate({
                    id: selectedForAction.id,
                    reason: rejectionReason,
                  })
                }
              >
                Confirm Rejection
              </Button>
            )}
          </div>
        }
      >
        {actionType === 'reject' && (
          <div className="space-y-3">
            <Input
              label="Rejection Justification"
              placeholder="e.g. Mismatch in Higher Secondary Marksheet transcript"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

