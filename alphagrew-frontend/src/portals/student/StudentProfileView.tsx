import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Skeleton } from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockStudentService } from '@/services/mock/mockStudentService';

export const StudentProfileView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => mockStudentService.getProfile(),
  });

  const mutation = useMutation({
    mutationFn: (updated: Partial<any>) => mockStudentService.updateProfile(updated),
    onSuccess: (data) => {
      queryClient.setQueryData(['student-profile'], data);
      addToast({
        title: 'Profile Saved',
        description: 'Your changes have been saved successfully.',
        type: 'success',
      });
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to save profile.',
        type: 'error',
      });
    },
  });

  const [formState, setFormState] = useState<any>({});

  React.useEffect(() => {
    if (profile) {
      setFormState({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
        department: profile.department,
        course: profile.course,
        batch: profile.batch,
        semester: profile.semester,
        skills: profile.skills?.join(', ') || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updated = {
      ...formState,
      skills: formState.skills?.split(',').map((s: string) => s.trim()),
    } as any;
    mutation.mutate(updated);
  };

  if (isLoading || !profile) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Personal and academic information" />
      <Card>
        <CardHeader>
          <CardTitle>{profile.name}</CardTitle>
          <CardDescription>{profile.department} • {profile.course}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formState.name} onChange={(e) => handleChange('name', e.target.value)} />
            <Input label="Email" type="email" value={formState.email} onChange={(e) => handleChange('email', e.target.value)} />
            <Input label="Phone" value={formState.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            <Input label="Address" value={formState.address} onChange={(e) => handleChange('address', e.target.value)} />
            <Input label="Department" value={formState.department} onChange={(e) => handleChange('department', e.target.value)} />
            <Input label="Course" value={formState.course} onChange={(e) => handleChange('course', e.target.value)} />
            <Input label="Batch" value={formState.batch} onChange={(e) => handleChange('batch', e.target.value)} />
            <Input label="Semester" value={formState.semester} onChange={(e) => handleChange('semester', e.target.value)} />
            <Input label="Skills (comma separated)" value={formState.skills} onChange={(e) => handleChange('skills', e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={mutation.isPending} className="mt-4 w-full md:w-auto" >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

