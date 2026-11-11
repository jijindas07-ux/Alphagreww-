import {
  initialSummary,
  initialDepartments,
  initialYearTrends,
  initialPlacementDrives,
  initialPendingRegistrations,
  initialActivities,
  initialCampuses,
  initialCourses,
  initialSubjects,
  initialAcademicYears,
  initialBatches,
  initialSemesterCohorts,
  initialStudents,
  initialStaff,
  initialAttendanceAudit,
  initialSubjectMarksRosters,
  initialGradeRules,
  initialMarksAudit,
  initialPlacementOutcomes,
  initialPlacementDeptStats,
  initialFeeSummary,
  initialStudentFeeRecords,
  initialFeeTransactions,
  initialFeeStructures,
  initialInstitutionProfile,
  initialRoles,
  initialSystemAuditLogs,
  type DashboardSummary,
  type YearTrendPoint,
} from './mockDb';
import type {
  Department,
  Campus,
  Course,
  Subject,
  AcademicYear,
  Batch,
  SemesterCohort,
  StudentListItem,
  StaffListItem,
  AttendanceAuditItem,
} from '@/types/academic.types';
import type {
  PlacementDrive,
  PendingRegistration,
  ActivityFeedItem,
  StudentPlacementOutcome,
  PlacementDepartmentStat,
} from '@/types/placement.types';
import type {
  SubjectMarksRoster,
  GradeRule,
  MarksAuditRecord,
} from '@/types/marks.types';
import type {
  FeeSummary,
  StudentFeeRecord,
  FeeTransaction,
  FeeStructureItem,
} from '@/types/finance.types';
import type {
  InstitutionProfile,
  RoleDefinition,
  SystemAuditLogEntry,
} from '@/types/system.types';

// In-memory reactive state
let summaryState: DashboardSummary = { ...initialSummary };
let departmentsState: Department[] = [...initialDepartments];
let yearTrendsState: YearTrendPoint[] = [...initialYearTrends];
let placementDrivesState: PlacementDrive[] = [...initialPlacementDrives];
let pendingRegistrationsState: PendingRegistration[] = [...initialPendingRegistrations];
let activitiesState: ActivityFeedItem[] = [...initialActivities];

let campusesState: Campus[] = [...initialCampuses];
let coursesState: Course[] = [...initialCourses];
let subjectsState: Subject[] = [...initialSubjects];
let academicYearsState: AcademicYear[] = [...initialAcademicYears];
let batchesState: Batch[] = [...initialBatches];
let semesterCohortsState: SemesterCohort[] = [...initialSemesterCohorts];
let studentsState: StudentListItem[] = [...initialStudents];
let staffState: StaffListItem[] = [...initialStaff];
let attendanceAuditState: AttendanceAuditItem[] = [...initialAttendanceAudit];

let marksRostersState: SubjectMarksRoster[] = [...initialSubjectMarksRosters];
let gradeRulesState: GradeRule[] = [...initialGradeRules];
let marksAuditState: MarksAuditRecord[] = [...initialMarksAudit];

let placementOutcomesState: StudentPlacementOutcome[] = [...initialPlacementOutcomes];
let placementDeptStatsState: PlacementDepartmentStat[] = [...initialPlacementDeptStats];

let feeSummaryState: FeeSummary = { ...initialFeeSummary };
let studentFeeRecordsState: StudentFeeRecord[] = [...initialStudentFeeRecords];
let feeTransactionsState: FeeTransaction[] = [...initialFeeTransactions];
let feeStructuresState: FeeStructureItem[] = [...initialFeeStructures];

let institutionProfileState: InstitutionProfile = { ...initialInstitutionProfile };
let rolesState: RoleDefinition[] = [...initialRoles];
let systemAuditLogsState: SystemAuditLogEntry[] = [...initialSystemAuditLogs];

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAdminService = {
  // -------------------------------------------------------------
  // DASHBOARD
  // -------------------------------------------------------------
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay(80);
    return { ...summaryState };
  },

  async getYearTrends(): Promise<YearTrendPoint[]> {
    await delay(80);
    return [...yearTrendsState];
  },

  async getActivityFeed(): Promise<ActivityFeedItem[]> {
    await delay(80);
    return [...activitiesState];
  },

  // -------------------------------------------------------------
  // 1. ORGANIZATION (Campuses, Departments, Courses, Subjects)
  // -------------------------------------------------------------
  async getCampuses(): Promise<Campus[]> {
    await delay(90);
    return [...campusesState];
  },

  async createCampus(campus: Omit<Campus, 'id'>): Promise<Campus> {
    await delay(150);
    const newCampus: Campus = { ...campus, id: Date.now() };
    campusesState = [newCampus, ...campusesState];
    return newCampus;
  },

  async getDepartments(): Promise<Department[]> {
    await delay(90);
    return [...departmentsState];
  },

  async createDepartment(dept: Omit<Department, 'id'>): Promise<Department> {
    await delay(150);
    const newDept: Department = { ...dept, id: Date.now() };
    departmentsState = [...departmentsState, newDept];
    return newDept;
  },

  async updateDepartment(dept: Department): Promise<Department> {
    await delay(150);
    departmentsState = departmentsState.map((d) => (d.id === dept.id ? dept : d));
    return dept;
  },

  async getCourses(): Promise<Course[]> {
    await delay(90);
    return [...coursesState];
  },

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    await delay(150);
    const newCourse: Course = { ...course, id: Date.now() };
    coursesState = [...coursesState, newCourse];
    return newCourse;
  },

  async getSubjects(): Promise<Subject[]> {
    await delay(90);
    return [...subjectsState];
  },

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    await delay(150);
    const newSubject: Subject = { ...subject, id: Date.now() };
    subjectsState = [...subjectsState, newSubject];
    return newSubject;
  },

  // -------------------------------------------------------------
  // 2. COHORTS (Academic Years, Batches, Semesters)
  // -------------------------------------------------------------
  async getAcademicYears(): Promise<AcademicYear[]> {
    await delay(90);
    return [...academicYearsState];
  },

  async setActiveAcademicYear(id: number): Promise<AcademicYear[]> {
    await delay(150);
    academicYearsState = academicYearsState.map((ay) => ({
      ...ay,
      isCurrent: ay.id === id,
      status: ay.id === id ? 'active' : ay.status === 'active' ? 'completed' : ay.status,
    }));
    return [...academicYearsState];
  },

  async getBatches(): Promise<Batch[]> {
    await delay(90);
    return [...batchesState];
  },

  async createBatch(batch: Omit<Batch, 'id'>): Promise<Batch> {
    await delay(150);
    const newBatch: Batch = { ...batch, id: Date.now() };
    batchesState = [newBatch, ...batchesState];
    return newBatch;
  },

  async getSemesterCohorts(): Promise<SemesterCohort[]> {
    await delay(90);
    return [...semesterCohortsState];
  },

  // -------------------------------------------------------------
  // 3. PEOPLE (Students, Staff, Onboarding Queue)
  // -------------------------------------------------------------
  async getStudents(): Promise<StudentListItem[]> {
    await delay(100);
    return [...studentsState];
  },

  async createStudent(student: Omit<StudentListItem, 'id'>): Promise<StudentListItem> {
    await delay(150);
    const newStudent: StudentListItem = { ...student, id: Date.now() };
    studentsState = [newStudent, ...studentsState];
    summaryState.totalStudents += 1;
    return newStudent;
  },

  async getStaff(): Promise<StaffListItem[]> {
    await delay(100);
    return [...staffState];
  },

  async createStaff(staff: Omit<StaffListItem, 'id'>): Promise<StaffListItem> {
    await delay(150);
    const newStaff: StaffListItem = { ...staff, id: Date.now() };
    staffState = [newStaff, ...staffState];
    summaryState.totalStaff += 1;
    return newStaff;
  },

  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    await delay(90);
    return [...pendingRegistrationsState];
  },

  async approveRegistration(id: number): Promise<PendingRegistration> {
    await delay(180);
    const target = pendingRegistrationsState.find((item) => item.id === id);
    if (!target) throw new Error('Registration record not found');

    target.status = 'approved';
    pendingRegistrationsState = pendingRegistrationsState.filter((item) => item.id !== id);
    summaryState.totalStudents += 1;

    // Add to students list
    studentsState = [
      {
        id: Date.now(),
        name: target.name,
        registrationNumber: target.registrationNumber,
        email: target.email,
        phone: '+91 98450 00000',
        departmentCode: target.departmentCode,
        year: target.year,
        batch: '2023-2027',
        semester: 3,
        cgpa: 8.5,
        attendancePercentage: 100,
        activeBacklogs: 0,
        placementStatus: 'eligible',
        feeStatus: 'pending',
      },
      ...studentsState,
    ];

    activitiesState = [
      {
        id: Date.now(),
        actorName: 'Admin',
        actorRole: 'Institution Admin',
        action: 'approved student admission registration for',
        target: `${target.name} (${target.registrationNumber})`,
        timestamp: 'Just now',
        category: 'onboarding',
      },
      ...activitiesState,
    ];

    return target;
  },

  async rejectRegistration(id: number, reason: string): Promise<PendingRegistration> {
    await delay(180);
    const target = pendingRegistrationsState.find((item) => item.id === id);
    if (!target) throw new Error('Registration record not found');

    target.status = 'rejected';
    pendingRegistrationsState = pendingRegistrationsState.filter((item) => item.id !== id);

    activitiesState = [
      {
        id: Date.now(),
        actorName: 'Admin',
        actorRole: 'Institution Admin',
        action: `rejected registration of ${target.name}: "${reason}"`,
        target: target.registrationNumber,
        timestamp: 'Just now',
        category: 'onboarding',
      },
      ...activitiesState,
    ];

    return target;
  },

  // -------------------------------------------------------------
  // 4. ATTENDANCE AUDIT & COMPLIANCE
  // -------------------------------------------------------------
  async getAttendanceAudit(): Promise<AttendanceAuditItem[]> {
    await delay(100);
    return [...attendanceAuditState];
  },

  async sendAttendanceWarning(studentId: number): Promise<{ success: boolean; message: string }> {
    await delay(150);
    const student = attendanceAuditState.find((s) => s.studentId === studentId);
    return {
      success: true,
      message: `Regulatory attendance warning letter and SMS dispatched to ${student?.studentName || 'Student'} and parent guardian.`,
    };
  },

  // -------------------------------------------------------------
  // 5. 5-STAGE MARKS PUBLISHING ENGINE
  // -------------------------------------------------------------
  async getSubjectMarksRosters(): Promise<SubjectMarksRoster[]> {
    await delay(100);
    return [...marksRostersState];
  },

  async verifyMarksRoster(rosterId: number): Promise<SubjectMarksRoster> {
    await delay(180);
    const target = marksRostersState.find((r) => r.id === rosterId);
    if (!target) throw new Error('Roster not found');

    target.status = 'verified';
    target.verifiedAt = 'Just now';

    marksAuditState = [
      {
        id: Date.now(),
        subjectCode: target.subjectCode,
        subjectName: target.subjectName,
        departmentCode: target.departmentCode,
        semesterNumber: target.semesterNumber,
        actorName: 'Dr. Sarah Jenkins (HOD)',
        actorRole: 'Head of Department',
        action: 'MODERATED_VERIFIED',
        previousStatus: 'submitted',
        newStatus: 'verified',
        reason: 'HOD verification completed. Marks distribution within acceptable thresholds.',
        timestamp: 'Just now',
      },
      ...marksAuditState,
    ];

    return { ...target };
  },

  async approveMarksRoster(rosterId: number): Promise<SubjectMarksRoster> {
    await delay(180);
    const target = marksRostersState.find((r) => r.id === rosterId);
    if (!target) throw new Error('Roster not found');

    target.status = 'approved';
    target.approvedAt = 'Just now';

    marksAuditState = [
      {
        id: Date.now(),
        subjectCode: target.subjectCode,
        subjectName: target.subjectName,
        departmentCode: target.departmentCode,
        semesterNumber: target.semesterNumber,
        actorName: 'Dr. Arthur Vance (Dean)',
        actorRole: 'Dean Academics',
        action: 'DEAN_APPROVED',
        previousStatus: 'verified',
        newStatus: 'approved',
        reason: 'Dean approval ratified for semester results calculation.',
        timestamp: 'Just now',
      },
      ...marksAuditState,
    ];

    return { ...target };
  },

  async publishSemesterResults(semesterNumber: number, departmentCode: string): Promise<{ success: boolean; publishedCount: number }> {
    await delay(250);
    let count = 0;
    marksRostersState = marksRostersState.map((r) => {
      if (r.semesterNumber === semesterNumber && (departmentCode === 'ALL' || r.departmentCode === departmentCode)) {
        count++;
        return {
          ...r,
          status: 'locked',
          publishedAt: 'Just now',
        };
      }
      return r;
    });

    marksAuditState = [
      {
        id: Date.now(),
        subjectCode: `SEM-${semesterNumber}-${departmentCode}`,
        subjectName: `Semester ${semesterNumber} (${departmentCode}) Official Results`,
        departmentCode,
        semesterNumber,
        actorName: 'Registrar & Controller of Exams',
        actorRole: 'Controller of Examinations',
        action: 'PUBLISHED',
        previousStatus: 'approved',
        newStatus: 'locked',
        reason: 'Results finalized and locked. Grade cards generated for student portals.',
        timestamp: 'Just now',
      },
      ...marksAuditState,
    ];

    return { success: true, publishedCount: count };
  },

  async unlockSemesterResults(semesterNumber: number, departmentCode: string, reason: string): Promise<{ success: boolean }> {
    await delay(200);
    marksRostersState = marksRostersState.map((r) => {
      if (r.semesterNumber === semesterNumber && (departmentCode === 'ALL' || r.departmentCode === departmentCode)) {
        return {
          ...r,
          status: 'approved',
        };
      }
      return r;
    });

    marksAuditState = [
      {
        id: Date.now(),
        subjectCode: `SEM-${semesterNumber}-${departmentCode}`,
        subjectName: `Semester ${semesterNumber} (${departmentCode}) Results Rollback`,
        departmentCode,
        semesterNumber,
        actorName: 'Registrar / Admin',
        actorRole: 'Institution Admin',
        action: 'UNLOCKED',
        previousStatus: 'locked',
        newStatus: 'approved',
        reason: `Emergency Rollback: ${reason}`,
        timestamp: 'Just now',
      },
      ...marksAuditState,
    ];

    return { success: true };
  },

  async getGradeRules(): Promise<GradeRule[]> {
    await delay(70);
    return [...gradeRulesState];
  },

  async getMarksAudit(): Promise<MarksAuditRecord[]> {
    await delay(80);
    return [...marksAuditState];
  },

  // -------------------------------------------------------------
  // 6. PLACEMENT OVERSIGHT
  // -------------------------------------------------------------
  async getUpcomingPlacementDrives(): Promise<PlacementDrive[]> {
    await delay(100);
    return [...placementDrivesState];
  },

  async createPlacementDrive(drive: Omit<PlacementDrive, 'id'>): Promise<PlacementDrive> {
    await delay(150);
    const newDrive: PlacementDrive = { ...drive, id: Date.now() };
    placementDrivesState = [newDrive, ...placementDrivesState];
    summaryState.activePlacementDrives += 1;
    return newDrive;
  },

  async getPlacementOutcomes(): Promise<StudentPlacementOutcome[]> {
    await delay(90);
    return [...placementOutcomesState];
  },

  async getPlacementDeptStats(): Promise<PlacementDepartmentStat[]> {
    await delay(80);
    return [...placementDeptStatsState];
  },

  // -------------------------------------------------------------
  // 7. FINANCE & FEE MANAGEMENT
  // -------------------------------------------------------------
  async getFeeSummary(): Promise<FeeSummary> {
    await delay(80);
    return { ...feeSummaryState };
  },

  async getStudentFeeRecords(): Promise<StudentFeeRecord[]> {
    await delay(90);
    return [...studentFeeRecordsState];
  },

  async getFeeTransactions(): Promise<FeeTransaction[]> {
    await delay(90);
    return [...feeTransactionsState];
  },

  async getFeeStructures(): Promise<FeeStructureItem[]> {
    await delay(80);
    return [...feeStructuresState];
  },

  async recordFeePayment(recordId: number, amountPaid: number, method: FeeTransaction['paymentMethod']): Promise<{ success: boolean; transactionId: string }> {
    await delay(200);
    const record = studentFeeRecordsState.find((r) => r.id === recordId);
    if (!record) throw new Error('Fee record not found');

    record.paidAmount += amountPaid;
    record.balanceDue = Math.max(0, record.totalFee - record.paidAmount);
    record.status = record.balanceDue === 0 ? 'paid' : 'partial';
    record.lastPaymentDate = 'Today';

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTxn: FeeTransaction = {
      id: txnId,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: record.studentName,
      registrationNumber: record.registrationNumber,
      departmentCode: record.departmentCode,
      amount: amountPaid,
      paymentMethod: method,
      transactionDate: 'Just now',
      status: 'success',
    };

    feeTransactionsState = [newTxn, ...feeTransactionsState];
    feeSummaryState.totalCollectedINR += amountPaid;
    feeSummaryState.totalOutstandingINR = Math.max(0, feeSummaryState.totalOutstandingINR - amountPaid);
    feeSummaryState.collectionPercentage = +(
      (feeSummaryState.totalCollectedINR / feeSummaryState.totalExpectedINR) *
      100
    ).toFixed(1);

    return { success: true, transactionId: txnId };
  },

  // -------------------------------------------------------------
  // 8. SYSTEM SETTINGS & AUDIT
  // -------------------------------------------------------------
  async getInstitutionProfile(): Promise<InstitutionProfile> {
    await delay(70);
    return { ...institutionProfileState };
  },

  async updateInstitutionProfile(profile: InstitutionProfile): Promise<InstitutionProfile> {
    await delay(150);
    institutionProfileState = { ...profile };
    return { ...institutionProfileState };
  },

  async getRoles(): Promise<RoleDefinition[]> {
    await delay(80);
    return [...rolesState];
  },

  async updateRolePermission(roleId: string, moduleId: string, capability: keyof RoleDefinition['permissions'][0]['capabilities'], value: boolean): Promise<RoleDefinition> {
    await delay(120);
    const role = rolesState.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found');

    const perm = role.permissions.find((p) => p.moduleId === moduleId);
    if (perm) {
      perm.capabilities[capability] = value;
    }

    return { ...role };
  },

  async getSystemAuditLogs(): Promise<SystemAuditLogEntry[]> {
    await delay(90);
    return [...systemAuditLogsState];
  },
};
