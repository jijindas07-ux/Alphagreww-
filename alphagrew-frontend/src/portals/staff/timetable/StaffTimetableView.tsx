import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
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
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { TimetableCell } from '@/types/staff.types';

const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const PERIODS = [
  { number: 1, slot: '09:00 - 10:00 AM' },
  { number: 2, slot: '10:15 - 11:15 AM' },
  { number: 3, slot: '11:30 - 12:30 PM' },
  { number: 4, slot: '01:30 - 03:30 PM' },
  { number: 5, slot: '03:45 - 04:45 PM' },
];

export const StaffTimetableView: React.FC = () => {
  const navigate = useNavigate();

  const { data: cells = [], isLoading } = useQuery({
    queryKey: ['staff-timetable'],
    queryFn: () => mockStaffService.getTimetable(),
  });

  const getCellForSlot = (day: string, periodNumber: number): TimetableCell | undefined => {
    return cells.find((c) => c.day === day && c.periodNumber === periodNumber);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Weekly Instructional Timetable"
        subtitle="Weekly class slots, classroom room assignments, and laboratory hours for Odd Term 2026."
        badge={<Badge variant="indigo">Teaching Schedule</Badge>}
        actions={
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Clock className="w-3.5 h-3.5" />}
            onClick={() => navigate('/staff/attendance')}
          >
            Mark Period Attendance
          </Button>
        }
      />

      {/* 2. Timetable Grid Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Weekly Lecture & Practical Matrix
            </CardTitle>
            <CardDescription>
              Click any populated session to launch roll call or inspect subject details
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    <th className="p-3.5 w-28 bg-slate-100/50 dark:bg-zinc-800 text-center">Day / Time</th>
                    {PERIODS.map((p) => (
                      <th key={p.number} className="p-3.5 min-w-[170px] text-center border-l border-slate-200/60 dark:border-zinc-800">
                        <div>Period {p.number}</div>
                        <div className="font-mono text-[10px] text-slate-400 font-normal">
                          {p.slot}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-zinc-100 bg-slate-50/50 dark:bg-zinc-900/50 text-center">
                        {day}
                      </td>
                      {PERIODS.map((period) => {
                        const cell = getCellForSlot(day, period.number);

                        return (
                          <td
                            key={period.number}
                            className="p-2 border-l border-slate-100 dark:border-zinc-800/80 align-top"
                          >
                            {cell ? (
                              <div
                                onClick={() => navigate('/staff/attendance')}
                                className="p-2.5 rounded-lg border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer group flex flex-col justify-between h-24"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                                      {cell.subjectCode}
                                    </span>
                                    <Badge
                                      size="sm"
                                      variant={cell.sessionType === 'Lab' ? 'purple' : 'neutral'}
                                      className="text-[9px] py-0 px-1"
                                    >
                                      {cell.sessionType}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 mt-1 line-clamp-1">
                                    {cell.subjectName}
                                  </p>
                                </div>

                                <div className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-indigo-100/60 dark:border-indigo-900/30 flex items-center justify-between">
                                  <span>{cell.roomNumber}</span>
                                  <span>{cell.batchName.split(' ')[1]} ({cell.section})</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-24 rounded-lg border border-dashed border-slate-100 dark:border-zinc-800/60 flex items-center justify-center text-[11px] text-slate-300 dark:text-zinc-600 font-mono">
                                Free Slot
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
