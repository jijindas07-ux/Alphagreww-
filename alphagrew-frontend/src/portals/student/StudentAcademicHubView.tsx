import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Skeleton } from '@/design-system';
import { mockStudentService } from '@/services/mock/mockStudentService';

export const StudentAcademicHubView: React.FC = () => {
  const { data: timetable, isLoading: ttLoading } = useQuery({
    queryKey: ['student-timetable'],
    queryFn: () => mockStudentService.getTimetable(),
  });

  const { data: subjects, isLoading: subLoading } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: () => mockStudentService.getEnrolledSubjects(),
  });

  const { data: attendance, isLoading: attLoading } = useQuery({
    queryKey: ['student-attendance-summary'],
    queryFn: () => mockStudentService.getAttendanceSummary(),
  });

  // Simple error handling: toast on error (not shown here for brevity)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Hub"
        subtitle="Timetable, subjects, and attendance overview"
      />

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>Your classes for the current week</CardDescription>
        </CardHeader>
        <CardContent>
          {ttLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Faculty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetable?.map((slot, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{slot.day}</TableCell>
                    <TableCell>{slot.start} - {slot.end}</TableCell>
                    <TableCell>{slot.subject}</TableCell>
                    <TableCell>{slot.faculty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Subjects</CardTitle>
          <CardDescription>Current semester courses</CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.code}</TableCell>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.faculty}</TableCell>
                    <TableCell>{sub.credits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Overall attendance per subject</CardDescription>
        </CardHeader>
        <CardContent>
          {attLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {attendance?.map(item => (
                <Badge key={item.subjectId} variant={item.percentage >= 75 ? 'emerald' : 'rose'}>
                  {item.subjectName}: {item.percentage}%
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

