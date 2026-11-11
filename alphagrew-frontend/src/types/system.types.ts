export interface InstitutionProfile {
  name: string;
  code: string;
  domain: string;
  tagline: string;
  accreditation: string;
  affiliatedUniversity: string;
  establishedYear: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  primaryColor: string;
  logoUrl?: string;
}

export interface RolePermissionMatrixItem {
  moduleId: string;
  moduleName: string;
  description: string;
  capabilities: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    publish: boolean;
  };
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  assignedUsersCount: number;
  isSystemRole: boolean;
  permissions: RolePermissionMatrixItem[];
}

export interface SystemAuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  ipAddress: string;
  module: 'AUTH' | 'ORGANIZATION' | 'COHORTS' | 'PEOPLE' | 'MARKS_ENGINE' | 'ATTENDANCE' | 'PLACEMENT' | 'FINANCE' | 'SYSTEM';
  action: string;
  targetResource: string;
  severity: 'info' | 'warning' | 'critical';
  details?: string;
}

