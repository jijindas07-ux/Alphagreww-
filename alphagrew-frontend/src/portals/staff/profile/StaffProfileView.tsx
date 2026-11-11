import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
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
  Skeleton,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { useAuth } from '@/hooks/useAuth';
import { mockStaffService } from '@/services/mock/mockStaffService';

export const StaffProfileView: React.FC = () => {
  const queryClient = useQueryClient();
  const { isHod, toggleHodRole } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'advisory' | 'preferences'>('overview');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => mockStaffService.getFacultyProfile(),
  });

  // Preferences form state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [hodAlerts, setHodAlerts] = useState(true);

  // Sync initial preferences
  React.useEffect(() => {
    if (profile?.notificationPreferences) {
      setEmailAlerts(profile.notificationPreferences.emailOnMarksSubmission);
      setSmsAlerts(profile.notificationPreferences.smsOnLowAttendance);
      setDailyDigest(profile.notificationPreferences.dailyScheduleDigest);
      setHodAlerts(profile.notificationPreferences.hodQueueAlerts);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (updatedPrefs: any) => {
      return mockStaffService.updateFacultyProfile({
        notificationPreferences: updatedPrefs,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
      addToast({
        title: 'Preferences Updated',
        description: 'Your notification preferences and dispatch channels have been saved.',
        type: 'success',
      });
    },
  });

  const handleSavePreferences = () => {
    updateMutation.mutate({
      emailOnMarksSubmission: emailAlerts,
      smsOnLowAttendance: smsAlerts,
      dailyScheduleDigest: dailyDigest,
      hodQueueAlerts: hodAlerts,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Faculty Identity & Instructional Profile"
        subtitle="Professional credentials, advisory appointments, and account preference settings."
        badge={
          isHod ? (
            <Badge variant="rose">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
              Department HOD
            </Badge>
          ) : (
            <Badge variant="indigo">Faculty Member</Badge>
          )
        }
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={toggleHodRole}
            className="text-xs"
          >
            Simulate: {isHod ? 'Switch to Regular Staff' : 'Switch to HOD'}
          </Button>
        }
      />

      {/* 2. Profile Overview Header Card */}
      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : profile ? (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {profile.name}
                  </h3>
                  <Badge variant={isHod ? 'rose' : 'indigo'} size="sm">
                    {profile.designation}
                  </Badge>
                  <span className="font-mono text-xs text-slate-400">
                    {profile.employeeId}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  {profile.qualification} · Joined {profile.joiningDate}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.cabinRoom}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-center sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Class Advisory
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                {profile.advisoryClass}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block">
                Office Hours: {profile.officeHours}
              </span>
            </div>
          </div>
        </Card>
      ) : null}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          Research & Bio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advisory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          Class Advisor Responsibilities
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          Notification Preferences
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'overview' && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Academic Biography</CardTitle>
              <CardDescription>Areas of specialization and curriculum leadership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                {profile.bio}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 mb-2">
                  Research Specializations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.researchInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-900/40"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scholarly Output</CardTitle>
              <CardDescription>Verified academic metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center text-xs">
                <span className="text-slate-500">Peer-Reviewed Papers</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100">
                  {profile.publicationsCount} Publications
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center text-xs">
                <span className="text-slate-500">Department Rank</span>
                <span className="font-bold text-indigo-600">Senior Faculty / HOD</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center text-xs">
                <span className="text-slate-500">Institutional Email</span>
                <Badge size="sm" variant="emerald">Verified SSO</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'advisory' && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Advisory Batch & Mentorship Duties</CardTitle>
            <CardDescription>
              Mentoring B.Tech Computer Science & Engineering 2023-2027 Cohort (Section A - 64 Scholars)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <span className="text-xs text-slate-500">Mentored Students</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
                  64 Scholars
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Section A (3rd Year)</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <span className="text-xs text-slate-500">Average Batch Attendance</span>
                <h4 className="text-lg font-bold text-emerald-600 mt-1">89.4%</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Compliant with AICTE</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <span className="text-xs text-slate-500">Scholars at Risk</span>
                <h4 className="text-lg font-bold text-rose-600 mt-1">3 Scholars</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Attendance &lt; 75%</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              As class advisor, you are responsible for monitoring academic progress, conducting monthly parent-mentor syncs, endorsing medical leave applications, and recommending students for remedial tutoring.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification & Alert Channels</CardTitle>
            <CardDescription>
              Configure how and when you receive automated institutional alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Email on Marks Submission & Moderation
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Receive email receipts when marks rosters are verified or returned.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    SMS on Low Attendance Warnings
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Alert advisor immediately when any advisee drops below 75% attendance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Daily Schedule Digest
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Receive a 07:30 AM morning summary of today's lectures and pending roll calls.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {isHod && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
                  <div>
                    <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                      HOD Moderation Queue Realtime Notifications
                    </h4>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      Notify immediately when faculty submit new marks sheets for review.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hodAlerts}
                    onChange={(e) => setHodAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <Button
                size="sm"
                variant="primary"
                onClick={handleSavePreferences}
                isLoading={updateMutation.isPending}
              >
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
