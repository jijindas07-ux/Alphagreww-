import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck2,
  Building2,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Card,
  Button,
  Badge,
  Input,
  SearchInput,
  Modal,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { InstitutionProfile, RoleDefinition } from '@/types/system.types';

export const SystemSettingsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'branding' | 'roles' | 'audit'>('branding');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<InstitutionProfile | null>(null);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin', 'institutionProfile'],
    queryFn: () => mockAdminService.getInstitutionProfile(),
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => mockAdminService.getRoles(),
  });

  const { data: auditLogs = [], isLoading: isLoadingAudit } = useQuery({
    queryKey: ['admin', 'systemAuditLogs'],
    queryFn: () => mockAdminService.getSystemAuditLogs(),
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (p: InstitutionProfile) => mockAdminService.updateInstitutionProfile(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'institutionProfile'] });
      addToast({ title: 'Profile Updated', description: 'Institution branding and contact details saved.', type: 'success' });
      setIsEditProfileModalOpen(false);
    },
  });

  // Toggle Permission Mutation
  const togglePermMutation = useMutation({
    mutationFn: (args: { roleId: string; moduleId: string; capability: keyof RoleDefinition['permissions'][0]['capabilities']; value: boolean }) =>
      mockAdminService.updateRolePermission(args.roleId, args.moduleId, args.capability, args.value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      addToast({ title: 'Permission Updated', description: 'Role capability toggled successfully.', type: 'info' });
    },
  });

  const filteredAudit = auditLogs.filter(
    (log) =>
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const severityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertCircle className="w-4 h-4 text-rose-500" />;
    if (sev === 'warning') return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-sky-500" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration & Governance"
        subtitle="Institution branding, RBAC permission matrix, and immutable system audit log."
        badge={<Badge variant="indigo" size="md">Tenant Admin</Badge>}
      />

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {(['branding', 'roles', 'audit'] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
              {tab === 'branding' ? 'Institution Branding' : tab === 'roles' ? `Roles & Permissions (${roles.length})` : `Audit Logs (${auditLogs.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'audit' && (
          <div className="w-full sm:w-72">
            <SearchInput placeholder="Search audit logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </div>

      {/* Tab: Branding */}
      {activeTab === 'branding' && (
        isLoadingProfile ? <Skeleton className="h-64 w-full rounded-xl" /> : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Institution Identity</h3>
                <Button size="sm" variant="secondary" onClick={() => { setEditProfile({ ...profile }); setIsEditProfileModalOpen(true); }}>
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-xl" style={{ backgroundColor: profile.primaryColor }}>
                    AG
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">{profile.name}</h4>
                    <p className="text-slate-500">{profile.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block">Institution Code</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{profile.code}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block">Web Domain</span>
                    <span className="font-mono font-bold text-indigo-600">{profile.domain}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block">Established</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{profile.establishedYear}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block">Primary Brand Color</span>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: profile.primaryColor }} />
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{profile.primaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-5">Contact & Accreditation</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-[10px] text-indigo-600 block uppercase tracking-wider font-semibold">Accreditation Status</span>
                  <span className="font-bold text-sm text-indigo-600 block mt-1">{profile.accreditation}</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Affiliated University</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{profile.affiliatedUniversity}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Registrar Email</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200">{profile.contactEmail}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Contact Phone</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200">{profile.contactPhone}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Campus Address</span>
                    <span className="text-slate-800 dark:text-zinc-200">{profile.address}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : null
      )}

      {/* Tab: Roles & Permissions */}
      {activeTab === 'roles' && (
        isLoadingRoles ? <Skeleton className="h-64 w-full rounded-xl" /> : (
          <div className="space-y-6">
            {roles.map((role) => (
              <Card key={role.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{role.name}</h3>
                      {role.isSystemRole && <Badge variant="indigo" size="sm">System Role</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded">
                    {role.assignedUsersCount} Users Assigned
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Module</th>
                        <th className="py-2.5 px-3 text-center">View</th>
                        <th className="py-2.5 px-3 text-center">Create</th>
                        <th className="py-2.5 px-3 text-center">Edit</th>
                        <th className="py-2.5 px-3 text-center">Delete</th>
                        <th className="py-2.5 px-3 text-center">Approve</th>
                        <th className="py-2.5 px-3 text-center">Publish</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                      {role.permissions.map((perm) => (
                        <tr key={perm.moduleId} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{perm.moduleName}</span>
                            <span className="text-[10px] text-slate-400">{perm.description}</span>
                          </td>
                          {(Object.keys(perm.capabilities) as Array<keyof typeof perm.capabilities>).map((cap) => (
                            <td key={cap} className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => togglePermMutation.mutate({ roleId: role.id, moduleId: perm.moduleId, capability: cap, value: !perm.capabilities[cap] })}
                                className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                                  perm.capabilities[cap]
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                                }`}
                              >
                                {perm.capabilities[cap] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-2 h-0.5 bg-slate-300 dark:bg-zinc-600 rounded-full" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        isLoadingAudit ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredAudit.length === 0 ? (
          <EmptyState icon={FileCheck2} title="No audit entries found" description="No system audit log entries matched your search." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Sev</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor & Role</th>
                    <th className="py-3.5 px-4">Module</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target Resource</th>
                    <th className="py-3.5 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredAudit.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">{severityIcon(log.severity)}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{log.actorName}</span>
                        <span className="text-[11px] text-slate-500">{log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4"><Badge variant="neutral" size="sm" className="font-mono">{log.module}</Badge></td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{log.action.replace(/_/g, ' ')}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 max-w-xs truncate">{log.targetResource}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Edit Institution Profile" description="Update institutional identity, contact details, and web domain." size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEditProfileModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={updateProfileMutation.isPending} disabled={!editProfile?.name} onClick={() => editProfile && updateProfileMutation.mutate(editProfile)}>Save Changes</Button>
          </div>
        }
      >
        {editProfile && (
          <div className="space-y-4">
            <Input label="Institution Name" value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} required />
            <Input label="Tagline / Accreditation Subtitle" value={editProfile.tagline} onChange={(e) => setEditProfile({ ...editProfile, tagline: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Institution Code" value={editProfile.code} onChange={(e) => setEditProfile({ ...editProfile, code: e.target.value })} />
              <Input label="Web Domain" value={editProfile.domain} onChange={(e) => setEditProfile({ ...editProfile, domain: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Registrar Email" type="email" value={editProfile.contactEmail} onChange={(e) => setEditProfile({ ...editProfile, contactEmail: e.target.value })} />
              <Input label="Contact Phone" value={editProfile.contactPhone} onChange={(e) => setEditProfile({ ...editProfile, contactPhone: e.target.value })} />
            </div>
            <Input label="Campus Address" value={editProfile.address} onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  );
};

