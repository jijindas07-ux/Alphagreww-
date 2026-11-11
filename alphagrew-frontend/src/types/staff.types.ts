import type { MarksWorkflowStage } from './marks.types';

export interface TeachingPeriod {
  id: string;
  periodNumber: number;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  roomNumber: string;
  batchName: string;
  section: string;
  semesterNumber: number;
  sessionType: 'Lecture' | 'Lab' | 'Tutorial';
  enrolledStudentsCount: number;
  attendanceMarked: boolean;
  attendanceStatus?: 'present' | 'absent' | 'draft' | 'completed';
}

export interface AllocatedSubject {
  id: number;
  subjectCode: string;
  subjectName: string;
  departmentCode: string;
  semesterNumber: number;
  batchName: string;
  section: string;
  credits: number;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  totalEnrolled: number;
  syllabusCompletionPercentage: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  averageAttendance: number;
  internalMarksStatus: MarksWorkflowStage;
  nextLectureTime?: string;
  roomNumber: string;
}

export interface AttendanceStudentEntry {
  studentId: number;
  rollNo: string;
  registerNumber: string;
  studentName: string;
  avatarUrl?: string;
  status: 'present' | 'absent' | 'leave';
  overallAttendancePercentage: number;
  remarks?: string;
}

export interface PeriodAttendanceSession {
  id: string;
  date: string;
  periodNumber: number;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  departmentCode: string;
  batchName: string;
  section: string;
  semesterNumber: number;
  academicYear: string;
  sessionType: 'Lecture' | 'Lab' | 'Tutorial';
  status: 'draft' | 'submitted';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  attendancePercentage: number;
  records: AttendanceStudentEntry[];
  submittedAt?: string;
  submittedBy?: string;
}

export interface StaffStudentMarkEntry {
  studentId: number;
  rollNo: string;
  registerNumber: string;
  studentName: string;
  marks: number | null;
  isAbsent: boolean;
  percentage?: number;
  grade?: string;
  remarks?: string;
}

export interface StaffMarksRoster {
  id: number;
  subjectCode: string;
  subjectName: string;
  departmentCode: string;
  semesterNumber: number;
  batchName: string;
  section: string;
  academicYear: string;
  assessmentName: string;
  assessmentType: 'IA1' | 'IA2' | 'Model' | 'Lab' | 'Assignment';
  maxMarks: number;
  weightagePercentage: number;
  passingMarks: number;
  status: MarksWorkflowStage;
  totalStudents: number;
  enteredCount: number;
  averageMarks: number;
  passCount: number;
  failCount: number;
  absentCount: number;
  dueDate: string;
  submittedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  returnReason?: string;
  entries: StaffStudentMarkEntry[];
}

export interface FacultyWorkloadItem {
  id: number;
  facultyName: string;
  employeeId: string;
  designation: string;
  departmentCode: string;
  isHod: boolean;
  allocatedSubjects: string[];
  totalHoursPerWeek: number;
  prescribedHours: number;
  lectureHours: number;
  labHours: number;
  status: 'optimal' | 'overloaded' | 'underloaded';
}

export interface HodModerationItem {
  id: number;
  rosterId: number;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  facultyEmployeeId: string;
  assessmentName: string;
  semesterNumber: number;
  batchName: string;
  section: string;
  totalStudents: number;
  averageMarks: number;
  passPercentage: number;
  submittedAt: string;
  status: 'submitted' | 'verified' | 'returned';
  remarks?: string;
  entries: StaffStudentMarkEntry[];
  maxMarks: number;
  passingMarks: number;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  category: 'Academic' | 'Administrative' | 'Examination' | 'Event';
  targetAudience: 'All Campus' | 'Department' | 'Faculty Only' | 'Students Only';
  departmentCode?: string;
  authorName: string;
  authorRole: string;
  postedDate: string;
  priority: 'normal' | 'high' | 'urgent';
  isRead: boolean;
  attachmentName?: string;
}

export interface StaffProfileData {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  designation: string;
  departmentName: string;
  departmentCode: string;
  isHod: boolean;
  qualification: string;
  joiningDate: string;
  cabinRoom: string;
  bio: string;
  advisoryClass: string;
  officeHours: string;
  publicationsCount: number;
  researchInterests: string[];
  notificationPreferences: {
    emailOnMarksSubmission: boolean;
    smsOnLowAttendance: boolean;
    dailyScheduleDigest: boolean;
    hodQueueAlerts: boolean;
  };
}

export interface TimetableCell {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber: number;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  roomNumber: string;
  batchName: string;
  section: string;
  sessionType: 'Lecture' | 'Lab' | 'Tutorial';
}

