export interface Campus {
  id: number;
  code: string;
  name: string;
  directorName: string;
  location: string;
  landAreaAcres: number;
  totalBuildings: number;
  totalStudents: number;
  status: 'active' | 'inactive';
}

export interface Department {
  id: number;
  code: string;
  name: string;
  hodName?: string;
  intake: number;
  studentCount: number;
  staffCount: number;
  colorHex?: string;
  campusCode?: string;
  labsCount?: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  degreeType: 'B.Tech' | 'M.Tech' | 'MCA' | 'Ph.D';
  departmentId: number;
  departmentCode: string;
  durationYears: number;
  totalSemesters: number;
  totalCredits: number;
  activeBatches: number;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  courseId: number;
  courseCode?: string;
  departmentCode: string;
  semesterNumber: number;
  credits: number;
  type: 'theory' | 'practical' | 'elective';
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  maxInternalMarks: number;
  maxExternalMarks: number;
}

export interface AcademicYear {
  id: number;
  name: string; // e.g. "2025 - 2026"
  startDate: string;
  endDate: string;
  currentTerm: 'Odd (Fall)' | 'Even (Spring)';
  isCurrent: boolean;
  status: 'active' | 'upcoming' | 'completed';
}

export interface Batch {
  id: number;
  code: string;
  name: string;
  program: string;
  departmentCode: string;
  admissionYear: number;
  graduationYear: number;
  currentSemester: number;
  status: 'active' | 'graduated' | 'archived';
  studentsCount: number;
  sections: string[];
  classAdvisor: string;
}

export interface SemesterCohort {
  id: number;
  semesterNumber: number;
  courseCode: string;
  departmentCode: string;
  batchCode: string;
  studentCount: number;
  syllabusCompletion: number;
  examStatus: 'Scheduled' | 'In Progress' | 'Evaluated' | 'Pending';
  marksStatus: 'draft' | 'submitted' | 'verified' | 'approved' | 'locked';
}

export interface StudentListItem {
  id: number;
  name: string;
  registrationNumber: string;
  email: string;
  phone?: string;
  departmentCode: string;
  year: string;
  batch: string;
  semester: number;
  cgpa: number;
  attendancePercentage: number;
  activeBacklogs: number;
  placementStatus: 'eligible' | 'placed' | 'opted_out' | 'debarred';
  feeStatus: 'paid' | 'partial' | 'pending';
  mentorName?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface StaffListItem {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  departmentCode: string;
  designationName: string;
  qualification: string;
  specialization: string;
  phone: string;
  teachingLoadHours: number;
  allocatedSubjects: string[];
  status: 'active' | 'on_leave';
  joinedDate: string;
}

export interface StudentSubjectAttendance {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalConducted: number;
  attended: number;
  percentage: number;
  status: 'compliant' | 'warning' | 'debarred';
}

export interface AttendanceAuditItem {
  id: number;
  studentId: number;
  studentName: string;
  registrationNumber: string;
  departmentCode: string;
  batch: string;
  semester: number;
  totalClasses: number;
  classesAttended: number;
  percentage: number;
  status: 'compliant' | 'warning' | 'debarred';
  lastAttendedDate: string;
}


