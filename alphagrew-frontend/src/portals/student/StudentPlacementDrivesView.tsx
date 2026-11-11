import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Skeleton } from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import SlideOverDrawer from '@/components/SlideOverDrawer'; // Assuming a generic drawer component exists; if not, replace with appropriate component
import { mockStudentService } from '@/services/mock/mockStudentService';

export const StudentPlacementDrivesView: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: drives, isLoading, isError } = useQuery({
    queryKey: ['student-placement-drives'],
    queryFn: () => mockStudentService.getPlacementDrives(),
  });

  const applyMutation = useMutation({
    mutationFn: (driveId: string) => mockStudentService.applyToPlacementDrive(driveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-placement-drives'] });
      addToast({ title: 'Application Sent', description: 'Your application was submitted successfully.', type: 'success' });
    },
    onError: () => {
      addToast({ title: 'Application Failed', description: 'Could not submit your application.', type: 'error' });
    },
  });

  const [search, setSearch] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (drive: any) => {
    setSelectedDrive(drive);
    setDrawerOpen(true);
  };

  const handleApply = (driveId: string) => {
    applyMutation.mutate(driveId);
  };

  const filteredDrives = drives?.filter(d =>
    d.company.toLowerCase().includes(search.toLowerCase()) ||
    d.role.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError) {
    return <div className="text-red-600">Failed to load placement drives.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Drives"
        subtitle="Explore and apply to available corporate placement opportunities"
      />

      <Input
        placeholder="Search by company or role"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />

      {filteredDrives && filteredDrives.length === 0 && (
        <div className="text-center text-slate-500">No placement drives match your search.</div>
      )}

      {filteredDrives?.map(drive => (
        <Card key={drive.id} className="mb-4">
          <CardHeader>
            <CardTitle>{drive.company} – {drive.role}</CardTitle>
            <CardDescription>
              Deadline: {new Date(drive.deadline).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Badge variant={drive.status === 'Open' ? 'emerald' : drive.status === 'Applied' ? 'sky' : 'neutral'}>
              {drive.status}
            </Badge>
            <div className="flex space-x-2">
              <Button size="sm" variant="primary" onClick={() => openDrawer(drive)}>
                View Details
              </Button>
              {drive.status === 'Open' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleApply(drive.id)}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? 'Applying…' : 'Apply'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Detail Drawer */}
      {selectedDrive && (
        <SlideOverDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`${selectedDrive.company} – ${selectedDrive.role}`}
        >
          <p className="mb-2"><strong>Deadline:</strong> {new Date(selectedDrive.deadline).toLocaleDateString()}</p>
          <p className="mb-2"><strong>Status:</strong> {selectedDrive.status}</p>
          <p className="mb-2"><strong>Description:</strong> {selectedDrive.description}</p>
          <p className="mb-2"><strong>Eligibility:</strong> {selectedDrive.eligibility?.minGPA ? `Min GPA ${selectedDrive.eligibility.minGPA}` : 'None'}</p>
          {selectedDrive.status === 'Open' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleApply(selectedDrive.id)}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Applying…' : 'Apply Now'}
            </Button>
          )}
        </SlideOverDrawer>
      )}
    </div>
  );
};

