import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Button } from '@/design-system';

interface UnderConstructionViewProps {
  title: string;
  subtitle?: string;
  backPath?: string;
}

export const UnderConstructionView: React.FC<UnderConstructionViewProps> = ({
  title,
  subtitle = 'This screen will be implemented in subsequent phases according to the blueprint.',
  backPath,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          backPath && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate(backPath)}
            >
              Back to Dashboard
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="py-16 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Construction className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
            {title} Module
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">
            This module interface is mapped in the blueprint and scheduled for Phase 2/3/4 implementation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

