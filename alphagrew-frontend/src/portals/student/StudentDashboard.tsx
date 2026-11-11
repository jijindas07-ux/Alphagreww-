import React from 'react';
import { Award, Clock, Sparkles, BrainCircuit, Briefcase, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/design-system';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic & Career Hub"
        subtitle="Track your semester GPA, attendance thresholds, resume ATS diagnostic, and practice AI mock interviews."
        badge={<Badge variant="indigo" size="md">B.Tech CSE · Sem 7</Badge>}
        actions={
          <>
            <Button size="sm" variant="secondary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Optimize Resume ATS
            </Button>
            <Button size="sm" variant="magic" leftIcon={<BrainCircuit className="w-3.5 h-3.5" />}>
              Start AI Mock Interview
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cumulative CGPA"
          value="8.84 CGPA"
          secondaryText="Rank 14 in Department"
          icon={<Award className="w-5 h-5" />}
        />
        <StatCard
          label="Overall Attendance"
          value="88.2%"
          delta={{ value: 2.1, trend: 'up', label: 'Well above 75% cutoff' }}
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Placement Readiness"
          value="86 / 100"
          delta={{ value: 6, trend: 'up', label: 'Top 10% candidate' }}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
        <StatCard
          label="Eligible Drives"
          value="5 Drives"
          secondaryText="Google, Microsoft, Amazon..."
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Corporate Placement Drives</CardTitle>
            <CardDescription>Drives where your CGPA and department are eligible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                  Google · SDE Resident
                </span>
                <span className="text-[11px] text-slate-500">Package: 32.5 LPA · Nov 24</span>
              </div>
              <Button size="sm" variant="primary" className="h-7 text-xs">
                Apply Now
              </Button>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                  Microsoft · Support Engineer
                </span>
                <span className="text-[11px] text-slate-500">Package: 28.0 LPA · Nov 28</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Career Intelligence Suggestions</CardTitle>
            <CardDescription>Tailored feedback from your latest mock interview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 block">
                Practice Database Indexing & B-Trees
              </span>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                Your explanation in Turn 3 could be deepened by explaining composite index ordering.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 block">
                Resume ATS Compatibility: Strong (86%)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                Add 2 more quantified achievements in your Project section to exceed 90%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

