import React from 'react';
import { Briefcase, TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/design-system';

export const PlacementDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Placement Command Center"
        subtitle="Coordinate corporate drives, student eligibility screening, and company shortlists."
        badge={<Badge variant="emerald" size="md">2026 Batch Active</Badge>}
        actions={
          <>
            <Button size="sm" variant="secondary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Filter Eligible Pool
            </Button>
            <Button size="sm" variant="primary" leftIcon={<Briefcase className="w-3.5 h-3.5" />}>
              Post New Drive
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Eligible Pool"
          value="1,420 Students"
          secondaryText="Zero active backlogs"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Placed Students"
          value="1,202 Placed"
          delta={{ value: 84.6, trend: 'up', label: '84.6% placed' }}
          icon={<Award className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Ongoing Drives"
          value="8 Companies"
          secondaryText="Google, Microsoft, Amazon..."
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
        />
        <StatCard
          label="Average CTC"
          value="8.75 LPA"
          delta={{ value: 12.4, trend: 'up', label: 'Highest: 44 LPA' }}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Pipeline Summary</CardTitle>
          <CardDescription>Overall recruitment status across engineering disciplines.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">CSE Department</span>
              <span className="font-mono text-emerald-600 font-bold">92.4% Placed (536 / 580)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">IT Department</span>
              <span className="font-mono text-emerald-600 font-bold">88.2% Placed (344 / 390)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">ECE Department</span>
              <span className="font-mono text-emerald-600 font-bold">81.0% Placed (356 / 440)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">Mechanical Engineering</span>
              <span className="font-mono text-emerald-600 font-bold">75.0% Placed (324 / 432)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

