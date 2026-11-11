export type MarksWorkflowStage = 'draft' | 'submitted' | 'verified' | 'approved' | 'locked';

export interface SubjectMarksRoster {
  id: number;
  subjectCode: string;
  subjectName: string;
  departmentCode: string;
  semesterNumber: number;
  academicYear: string;
  facultyName: string;
  totalStudents: number;
  enteredCount: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  status: MarksWorkflowStage;
  submittedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface StudentMarkEntry {
  studentId: number;
  registrationNumber: string;
  studentName: string;
  internalMarks: number;
  maxInternal: number;
  externalMarks: number;
  maxExternal: number;
  totalMarks: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
  resultStatus: 'PASS' | 'FAIL' | 'ABSENT';
}

export interface GradeRule {
  grade: string;
  gradePoint: number;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  colorClass: string;
}

export interface SemesterPublishingStatus {
  departmentCode: string;
  courseCode: string;
  semesterNumber: number;
  batchName: string;
  totalSubjects: number;
  approvedSubjects: number;
  isReadyToPublish: boolean;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
}

export interface MarksAuditRecord {
  id: number;
  subjectCode: string;
  subjectName: string;
  departmentCode: string;
  semesterNumber: number;
  actorName: string;
  actorRole: string;
  action: 'DRAFT_SAVED' | 'SUBMITTED' | 'MODERATED_VERIFIED' | 'DEAN_APPROVED' | 'PUBLISHED' | 'UNLOCKED';
  previousStatus: MarksWorkflowStage;
  newStatus: MarksWorkflowStage;
  reason?: string;
  timestamp: string;
}

