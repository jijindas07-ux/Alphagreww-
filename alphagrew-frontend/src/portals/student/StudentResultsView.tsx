import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Skeleton } from '@/design-system';
import { mockStudentService } from '@/services/mock/mockStudentService';

export const StudentResultsView: React.FC = () => {
  const { data: semesters, isLoading } = useQuery({
    queryKey: ['student-results'],
    queryFn: () => mockStudentService.getResults(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results"
        subtitle="Semester-wise marks, grades and GPA"
      />
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        semesters?.map((sem, idx) => (
          <Card key={idx} className="mb-4">
            <CardHeader>
              <CardTitle>{sem.semester}</CardTitle>
              <CardDescription>
                GPA: {sem.gpa}{' '}
                {sem.publishedOn ? (
                  <Badge variant="indigo" size="sm">Published on {new Date(sem.publishedOn).toLocaleDateString()}</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Pending</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sem.subjects.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.code}</TableCell>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.marksObtained}/{sub.maxMarks}</TableCell>
                      <TableCell>{sub.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

