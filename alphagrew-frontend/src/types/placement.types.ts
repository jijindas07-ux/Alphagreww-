export type DriveStatus = 'upcoming' | 'ongoing' | 'shortlisting' | 'completed' | 'cancelled';

export interface PlacementDrive {
  id: number;
  companyName: string;
  companyLogoUrl?: string;
  roleTitle: string;
  packageOffered: string; // e.g. "12.5 LPA"
  packageNumeric: number; // in LPA for analytics
  driveDate: string;
  location: string;
  eligibleDepartments: string[];
  minimumCgpa: number;
  maxBacklogs: number;
  status: DriveStatus;
  applicantsCount: number;
  shortlistedCount: number;
  selectedCount: number;
}

export interface PendingRegistration {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  departmentCode: string;
  year: string;
  submittedAt: string;
  status: 'pending_approval' | 'approved' | 'rejected';
}

export interface ActivityFeedItem {
  id: number;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'academic' | 'placement' | 'onboarding' | 'marks' | 'system';
}

export interface MetricStat {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label: string;
  };
  secondaryText?: string;
  sparkline?: number[];
}

export interface StudentPlacementOutcome {
  id: number;
  studentId: number;
  studentName: string;
  registrationNumber: string;
  departmentCode: string;
  companyName: string;
  roleTitle: string;
  packageOffered: string;
  packageNumeric: number;
  offerLetterStatus: 'issued' | 'accepted' | 'declined' | 'pending';
  selectionDate: string;
  policyClassification: 'First Offer' | 'Dream Offer' | 'Super Dream Offer';
}

export interface PlacementDepartmentStat {
  departmentCode: string;
  departmentName: string;
  totalEligible: number;
  placedCount: number;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
}


