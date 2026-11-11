import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  TrendingUp,
  Award,
  Users,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  Button,
  Badge,
  SearchInput,
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { PlacementDrive } from '@/types/placement.types';

export const PlacementOversightView: React.FC = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'drives' | 'outcomes'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  const { data: drives = [], isLoading: isLoadingDrives } = useQuery({
    queryKey: ['admin', 'placementDrives'],
    queryFn: () => mockAdminService.getUpcomingPlacementDrives(),
  });

  const { data: outcomes = [], isLoading: isLoadingOutcomes } = useQuery({
    queryKey: ['admin', 'placementOutcomes'],
    queryFn: () => mockAdminService.getPlacementOutcomes(),
  });

  const { data: deptStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin', 'placementDeptStats'],
    queryFn: () => mockAdminService.getPlacementDeptStats(),
  });

  const totalPlaced = deptStats.reduce((a, d) => a + d.placedCount, 0);
  const totalEligible = deptStats.reduce((a, d) => a + d.totalEligible, 0);
  const avgPackage = deptStats.length > 0 ? (deptStats.reduce((a, d) => a + d.averagePackage, 0) / deptStats.length).toFixed(1) : '8.8';
  const highestPackage = deptStats.length > 0 ? Math.max(...deptStats.map((d) => d.highestPackage)) : 44;

  const filteredDrives = drives.filter(
    (d) =>
      d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutcomes = outcomes.filter(
    (o) =>
      o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Placement Oversight"
        subtitle="Campus-wide placement statistics, department performance, corporate drive activity, and student outcomes."
        badge={<Badge variant="emerald" size="md">{drives.length} Active & Upcoming Drives</Badge>}
        actions={
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => addToast({ title: 'Report Exported', description: 'Placement analytics PDF generated for AICTE / NAAC accreditation.', type: 'success' })}
          >
            Export Accreditation Report
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Placed Students" value={totalPlaced.toLocaleString()} delta={{ value: 84.6, trend: 'up', label: `${((totalPlaced / (totalEligible || 1)) * 100).toFixed(1)}% placement rate` }} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Active & Upcoming Drives" value={`${drives.length} Companies`} secondaryText="Tier 1 & Tier 2 recruiters" icon={<Briefcase className="w-5 h-5" />} iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50" />
        <StatCard label="Average Package (CTC)" value={`${avgPackage} LPA`} secondaryText="Across all departments" icon={<TrendingUp className="w-5 h-5" />} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatCard label="Highest Package Offered" value={`${highestPackage} LPA`} secondaryText="Super Dream Offer" icon={<Award className="w-5 h-5" />} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {(['overview', 'drives', 'outcomes'] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
              {tab === 'overview' ? 'Department Performance' : tab === 'drives' ? `Company Drives (${drives.length})` : `Student Outcomes (${outcomes.length})`}
            </button>
          ))}
        </div>

        {activeTab !== 'overview' && (
          <div className="w-full sm:w-72">
            <SearchInput placeholder={activeTab === 'drives' ? 'Search companies...' : 'Search students...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </div>

      {/* Tab: Department Performance */}
      {activeTab === 'overview' && (
        isLoadingStats ? <Skeleton className="h-64 w-full rounded-xl" /> : (
          <div className="space-y-5">
            {deptStats.map((dept) => (
              <Card key={dept.departmentCode} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="indigo" size="sm" className="font-mono">{dept.departmentCode}</Badge>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{dept.departmentName}</h3>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Eligible</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{dept.totalEligible}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Placed</span>
                        <span className="font-mono font-bold text-emerald-600">{dept.placedCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Placement %</span>
                        <span className="font-mono font-bold text-indigo-600">{dept.placementRate}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avg CTC</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{dept.averagePackage} LPA</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Highest CTC</span>
                        <span className="font-mono font-bold text-purple-600">{dept.highestPackage} LPA</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-40">
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${dept.placementRate}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block text-center font-mono">{dept.placementRate}% Placed</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab: Company Drives */}
      {activeTab === 'drives' && (
        isLoadingDrives ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredDrives.length === 0 ? (
          <EmptyState icon={Briefcase} title="No drives found" description="No placement drives matched your search." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Company & Role</th>
                    <th className="py-3.5 px-4">Package (CTC)</th>
                    <th className="py-3.5 px-4">Drive Date</th>
                    <th className="py-3.5 px-4">Eligible Depts</th>
                    <th className="py-3.5 px-4">Applicants</th>
                    <th className="py-3.5 px-4">Selected</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredDrives.map((drive) => (
                    <tr key={drive.id} onClick={() => setSelectedDrive(drive)} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{drive.companyName}</span>
                        <span className="text-[11px] text-slate-500">{drive.roleTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{drive.packageOffered}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">{drive.driveDate}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {drive.eligibleDepartments.map((d) => <Badge key={d} variant="neutral" size="sm" className="font-mono text-[10px]">{d}</Badge>)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-zinc-100">{drive.applicantsCount}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{drive.selectedCount}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={drive.status === 'ongoing' ? 'emerald' : drive.status === 'upcoming' ? 'sky' : 'neutral'} size="sm">
                          {drive.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedDrive(drive); }}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Tab: Student Outcomes */}
      {activeTab === 'outcomes' && (
        isLoadingOutcomes ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredOutcomes.length === 0 ? (
          <EmptyState icon={Award} title="No outcomes found" description="No student placement outcomes matched your search." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Company & Role</th>
                    <th className="py-3.5 px-4">Package</th>
                    <th className="py-3.5 px-4">Offer Category</th>
                    <th className="py-3.5 px-4">Offer Status</th>
                    <th className="py-3.5 px-4">Selection Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredOutcomes.map((out) => (
                    <tr key={out.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{out.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{out.registrationNumber}</span>
                      </td>
                      <td className="py-3.5 px-4"><Badge variant="indigo" size="sm" className="font-mono">{out.departmentCode}</Badge></td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{out.companyName}</span>
                        <span className="text-[11px] text-slate-500">{out.roleTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{out.packageOffered}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={out.policyClassification === 'Super Dream Offer' ? 'purple' : out.policyClassification === 'Dream Offer' ? 'indigo' : 'neutral'} size="sm">
                          {out.policyClassification}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={out.offerLetterStatus === 'accepted' ? 'emerald' : out.offerLetterStatus === 'issued' ? 'sky' : 'amber'} size="sm">
                          {out.offerLetterStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{out.selectionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Drive Detail Drawer */}
      <SlideOverDrawer isOpen={!!selectedDrive} onClose={() => setSelectedDrive(null)} title={selectedDrive?.companyName || 'Drive Details'} subtitle={`Recruitment Drive · ${selectedDrive?.roleTitle}`} width="lg">
        {selectedDrive && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{selectedDrive.companyName}</h3>
                <Badge variant={selectedDrive.status === 'ongoing' ? 'emerald' : 'sky'} size="sm">{selectedDrive.status.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-slate-500">{selectedDrive.roleTitle} · {selectedDrive.location}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 block">Package CTC</span>
                <span className="font-mono text-lg font-bold text-emerald-600">{selectedDrive.packageOffered}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 block">Min CGPA</span>
                <span className="font-mono text-lg font-bold text-indigo-600">{selectedDrive.minimumCgpa}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 block">Max Backlogs</span>
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-zinc-100">{selectedDrive.maxBacklogs}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/10 text-center">
                <span className="text-[10px] text-sky-600 block">Applicants</span>
                <span className="font-mono text-lg font-bold text-sky-600">{selectedDrive.applicantsCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 text-center">
                <span className="text-[10px] text-amber-600 block">Shortlisted</span>
                <span className="font-mono text-lg font-bold text-amber-600">{selectedDrive.shortlistedCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 text-center">
                <span className="text-[10px] text-emerald-600 block">Selected</span>
                <span className="font-mono text-lg font-bold text-emerald-600">{selectedDrive.selectedCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Eligible Departments</h4>
              <div className="flex gap-2 flex-wrap">
                {selectedDrive.eligibleDepartments.map((d) => <Badge key={d} variant="indigo" size="sm" className="font-mono">{d}</Badge>)}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedDrive(null)}>Close</Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

