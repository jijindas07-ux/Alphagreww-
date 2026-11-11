import type {
  TeachingPeriod,
  AllocatedSubject,
  PeriodAttendanceSession,
  AttendanceStudentEntry,
  StaffMarksRoster,
  StaffStudentMarkEntry,
  HodModerationItem,
  FacultyWorkloadItem,
  AnnouncementItem,
  StaffProfileData,
  TimetableCell,
} from '@/types/staff.types';

// In-Memory Reactive State
let todaySchedule: TeachingPeriod[] = [
  {
    id: 'tp-1',
    periodNumber: 1,
    timeSlot: '09:00 - 10:00 AM',
    subjectCode: 'CS501',
    subjectName: 'Distributed Systems',
    roomNumber: 'LH-204',
    batchName: 'Batch 2023-2027',
    section: 'A',
    semesterNumber: 5,
    sessionType: 'Lecture',
    enrolledStudentsCount: 64,
    attendanceMarked: true,
    attendanceStatus: 'completed',
  },
  {
    id: 'tp-2',
    periodNumber: 2,
    timeSlot: '10:15 - 11:15 AM',
    subjectCode: 'CS502',
    subjectName: 'Compiler Design',
    roomNumber: 'LH-102',
    batchName: 'Batch 2023-2027',
    section: 'B',
    semesterNumber: 5,
    sessionType: 'Lecture',
    enrolledStudentsCount: 62,
    attendanceMarked: false,
    attendanceStatus: 'present', // pending today
  },
  {
    id: 'tp-4',
    periodNumber: 4,
    timeSlot: '01:30 - 03:30 PM',
    subjectCode: 'CS506',
    subjectName: 'Cloud Architecture Lab',
    roomNumber: 'ACL-3',
    batchName: 'Batch 2023-2027',
    section: 'A',
    semesterNumber: 5,
    sessionType: 'Lab',
    enrolledStudentsCount: 32,
    attendanceMarked: false,
    attendanceStatus: 'present',
  },
  {
    id: 'tp-5',
    periodNumber: 5,
    timeSlot: '03:45 - 04:45 PM',
    subjectCode: 'CS701',
    subjectName: 'Advanced Cloud Computing',
    roomNumber: 'LH-301',
    batchName: 'Batch 2022-2026',
    section: 'A',
    semesterNumber: 7,
    sessionType: 'Lecture',
    enrolledStudentsCount: 48,
    attendanceMarked: false,
    attendanceStatus: 'present',
  },
];

let allocatedSubjects: AllocatedSubject[] = [
  {
    id: 1,
    subjectCode: 'CS501',
    subjectName: 'Distributed Systems',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'A',
    credits: 4,
    lectureHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    totalEnrolled: 64,
    syllabusCompletionPercentage: 68,
    completedTopicsCount: 24,
    totalTopicsCount: 35,
    averageAttendance: 89.4,
    internalMarksStatus: 'verified',
    nextLectureTime: 'Today, 09:00 AM (Completed)',
    roomNumber: 'LH-204',
  },
  {
    id: 2,
    subjectCode: 'CS502',
    subjectName: 'Compiler Design',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'B',
    credits: 4,
    lectureHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    totalEnrolled: 62,
    syllabusCompletionPercentage: 54,
    completedTopicsCount: 19,
    totalTopicsCount: 35,
    averageAttendance: 84.2,
    internalMarksStatus: 'submitted',
    nextLectureTime: 'Today, 10:15 AM (Next)',
    roomNumber: 'LH-102',
  },
  {
    id: 3,
    subjectCode: 'CS506',
    subjectName: 'Cloud Architecture Lab',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'A',
    credits: 2,
    lectureHours: 0,
    tutorialHours: 0,
    practicalHours: 3,
    totalEnrolled: 32,
    syllabusCompletionPercentage: 80,
    completedTopicsCount: 8,
    totalTopicsCount: 10,
    averageAttendance: 94.1,
    internalMarksStatus: 'draft',
    nextLectureTime: 'Today, 01:30 PM',
    roomNumber: 'ACL-3',
  },
  {
    id: 4,
    subjectCode: 'CS701',
    subjectName: 'Advanced Cloud Computing',
    departmentCode: 'CSE',
    semesterNumber: 7,
    batchName: 'Batch 2022-2026',
    section: 'A',
    credits: 3,
    lectureHours: 3,
    tutorialHours: 0,
    practicalHours: 0,
    totalEnrolled: 48,
    syllabusCompletionPercentage: 45,
    completedTopicsCount: 14,
    totalTopicsCount: 30,
    averageAttendance: 88.0,
    internalMarksStatus: 'draft',
    nextLectureTime: 'Today, 03:45 PM',
    roomNumber: 'LH-301',
  },
];

const mockClassStudents: AttendanceStudentEntry[] = [
  { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', status: 'present', overallAttendancePercentage: 92.5 },
  { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', status: 'present', overallAttendancePercentage: 88.0 },
  { studentId: 103, rollNo: 'CSE-003', registerNumber: '2023CSE003', studentName: 'Rahul Sharma', status: 'present', overallAttendancePercentage: 73.2 },
  { studentId: 104, rollNo: 'CSE-004', registerNumber: '2023CSE004', studentName: 'Sneha Reddy', status: 'present', overallAttendancePercentage: 96.0 },
  { studentId: 105, rollNo: 'CSE-005', registerNumber: '2023CSE005', studentName: 'Vikram Malhotra', status: 'absent', overallAttendancePercentage: 68.5 },
  { studentId: 106, rollNo: 'CSE-006', registerNumber: '2023CSE006', studentName: 'Ananya Iyer', status: 'present', overallAttendancePercentage: 91.0 },
  { studentId: 107, rollNo: 'CSE-007', registerNumber: '2023CSE007', studentName: 'Rohan Verma', status: 'leave', overallAttendancePercentage: 84.0, remarks: 'Medical leave approved' },
  { studentId: 108, rollNo: 'CSE-008', registerNumber: '2023CSE008', studentName: 'Kavya Nair', status: 'present', overallAttendancePercentage: 89.5 },
  { studentId: 109, rollNo: 'CSE-009', registerNumber: '2023CSE009', studentName: 'Arjun Das', status: 'present', overallAttendancePercentage: 79.0 },
  { studentId: 110, rollNo: 'CSE-010', registerNumber: '2023CSE010', studentName: 'Priya Nambiar', status: 'present', overallAttendancePercentage: 94.2 },
  { studentId: 111, rollNo: 'CSE-011', registerNumber: '2023CSE011', studentName: 'Karthik Raja', status: 'absent', overallAttendancePercentage: 66.8 },
  { studentId: 112, rollNo: 'CSE-012', registerNumber: '2023CSE012', studentName: 'Tanvi Joshi', status: 'present', overallAttendancePercentage: 90.0 },
];

let attendanceSessions: PeriodAttendanceSession[] = [
  {
    id: 'att-session-1',
    date: new Date().toISOString().split('T')[0],
    periodNumber: 1,
    timeSlot: '09:00 - 10:00 AM',
    subjectCode: 'CS501',
    subjectName: 'Distributed Systems',
    departmentCode: 'CSE',
    batchName: 'Batch 2023-2027',
    section: 'A',
    semesterNumber: 5,
    academicYear: '2026-2027',
    sessionType: 'Lecture',
    status: 'submitted',
    totalStudents: 12,
    presentCount: 10,
    absentCount: 1,
    leaveCount: 1,
    attendancePercentage: 83.3,
    submittedAt: '2026-11-11 09:55 AM',
    submittedBy: 'Dr. Sarah Jenkins',
    records: JSON.parse(JSON.stringify(mockClassStudents)),
  },
  {
    id: 'att-session-prev-1',
    date: '2026-11-10',
    periodNumber: 2,
    timeSlot: '10:15 - 11:15 AM',
    subjectCode: 'CS502',
    subjectName: 'Compiler Design',
    departmentCode: 'CSE',
    batchName: 'Batch 2023-2027',
    section: 'B',
    semesterNumber: 5,
    academicYear: '2026-2027',
    sessionType: 'Lecture',
    status: 'submitted',
    totalStudents: 12,
    presentCount: 11,
    absentCount: 1,
    leaveCount: 0,
    attendancePercentage: 91.7,
    submittedAt: '2026-11-10 11:10 AM',
    submittedBy: 'Dr. Sarah Jenkins',
    records: JSON.parse(JSON.stringify(mockClassStudents)),
  },
  {
    id: 'att-session-prev-2',
    date: '2026-11-09',
    periodNumber: 4,
    timeSlot: '01:30 - 03:30 PM',
    subjectCode: 'CS506',
    subjectName: 'Cloud Architecture Lab',
    departmentCode: 'CSE',
    batchName: 'Batch 2023-2027',
    section: 'A',
    semesterNumber: 5,
    academicYear: '2026-2027',
    sessionType: 'Lab',
    status: 'submitted',
    totalStudents: 12,
    presentCount: 12,
    absentCount: 0,
    leaveCount: 0,
    attendancePercentage: 100.0,
    submittedAt: '2026-11-09 03:25 PM',
    submittedBy: 'Dr. Sarah Jenkins',
    records: JSON.parse(JSON.stringify(mockClassStudents)),
  },
];

let staffMarksRosters: StaffMarksRoster[] = [
  {
    id: 1,
    subjectCode: 'CS501',
    subjectName: 'Distributed Systems',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'A',
    academicYear: '2026-2027',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    assessmentType: 'IA1',
    maxMarks: 50,
    weightagePercentage: 20,
    passingMarks: 25,
    status: 'verified',
    totalStudents: 12,
    enteredCount: 12,
    averageMarks: 41.5,
    passCount: 11,
    failCount: 1,
    absentCount: 0,
    dueDate: '2026-11-05',
    submittedAt: '2026-11-04 04:30 PM',
    verifiedAt: '2026-11-05 10:15 AM',
    entries: [
      { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', marks: 46, isAbsent: false, percentage: 92, grade: 'A+' },
      { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', marks: 44, isAbsent: false, percentage: 88, grade: 'A' },
      { studentId: 103, rollNo: 'CSE-003', registerNumber: '2023CSE003', studentName: 'Rahul Sharma', marks: 32, isAbsent: false, percentage: 64, grade: 'B' },
      { studentId: 104, rollNo: 'CSE-004', registerNumber: '2023CSE004', studentName: 'Sneha Reddy', marks: 49, isAbsent: false, percentage: 98, grade: 'O' },
      { studentId: 105, rollNo: 'CSE-005', registerNumber: '2023CSE005', studentName: 'Vikram Malhotra', marks: 21, isAbsent: false, percentage: 42, grade: 'F', remarks: 'Needs remedial class' },
      { studentId: 106, rollNo: 'CSE-006', registerNumber: '2023CSE006', studentName: 'Ananya Iyer', marks: 45, isAbsent: false, percentage: 90, grade: 'A+' },
      { studentId: 107, rollNo: 'CSE-007', registerNumber: '2023CSE007', studentName: 'Rohan Verma', marks: 38, isAbsent: false, percentage: 76, grade: 'B+' },
      { studentId: 108, rollNo: 'CSE-008', registerNumber: '2023CSE008', studentName: 'Kavya Nair', marks: 42, isAbsent: false, percentage: 84, grade: 'A' },
      { studentId: 109, rollNo: 'CSE-009', registerNumber: '2023CSE009', studentName: 'Arjun Das', marks: 35, isAbsent: false, percentage: 70, grade: 'B+' },
      { studentId: 110, rollNo: 'CSE-010', registerNumber: '2023CSE010', studentName: 'Priya Nambiar', marks: 48, isAbsent: false, percentage: 96, grade: 'O' },
      { studentId: 111, rollNo: 'CSE-011', registerNumber: '2023CSE011', studentName: 'Karthik Raja', marks: 28, isAbsent: false, percentage: 56, grade: 'C' },
      { studentId: 112, rollNo: 'CSE-012', registerNumber: '2023CSE012', studentName: 'Tanvi Joshi', marks: 44, isAbsent: false, percentage: 88, grade: 'A' },
    ],
  },
  {
    id: 2,
    subjectCode: 'CS502',
    subjectName: 'Compiler Design',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'B',
    academicYear: '2026-2027',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    assessmentType: 'IA1',
    maxMarks: 50,
    weightagePercentage: 20,
    passingMarks: 25,
    status: 'submitted',
    totalStudents: 12,
    enteredCount: 12,
    averageMarks: 38.2,
    passCount: 10,
    failCount: 2,
    absentCount: 0,
    dueDate: '2026-11-12',
    submittedAt: '2026-11-10 03:00 PM',
    entries: [
      { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', marks: 42, isAbsent: false, percentage: 84, grade: 'A' },
      { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', marks: 39, isAbsent: false, percentage: 78, grade: 'B+' },
      { studentId: 103, rollNo: 'CSE-003', registerNumber: '2023CSE003', studentName: 'Rahul Sharma', marks: 28, isAbsent: false, percentage: 56, grade: 'C' },
      { studentId: 104, rollNo: 'CSE-004', registerNumber: '2023CSE004', studentName: 'Sneha Reddy', marks: 47, isAbsent: false, percentage: 94, grade: 'O' },
      { studentId: 105, rollNo: 'CSE-005', registerNumber: '2023CSE005', studentName: 'Vikram Malhotra', marks: 19, isAbsent: false, percentage: 38, grade: 'F' },
      { studentId: 106, rollNo: 'CSE-006', registerNumber: '2023CSE006', studentName: 'Ananya Iyer', marks: 43, isAbsent: false, percentage: 86, grade: 'A' },
      { studentId: 107, rollNo: 'CSE-007', registerNumber: '2023CSE007', studentName: 'Rohan Verma', marks: 36, isAbsent: false, percentage: 72, grade: 'B+' },
      { studentId: 108, rollNo: 'CSE-008', registerNumber: '2023CSE008', studentName: 'Kavya Nair', marks: 40, isAbsent: false, percentage: 80, grade: 'A' },
      { studentId: 109, rollNo: 'CSE-009', registerNumber: '2023CSE009', studentName: 'Arjun Das', marks: 33, isAbsent: false, percentage: 66, grade: 'B' },
      { studentId: 110, rollNo: 'CSE-010', registerNumber: '2023CSE010', studentName: 'Priya Nambiar', marks: 46, isAbsent: false, percentage: 92, grade: 'A+' },
      { studentId: 111, rollNo: 'CSE-011', registerNumber: '2023CSE011', studentName: 'Karthik Raja', marks: 22, isAbsent: false, percentage: 44, grade: 'F' },
      { studentId: 112, rollNo: 'CSE-012', registerNumber: '2023CSE012', studentName: 'Tanvi Joshi', marks: 41, isAbsent: false, percentage: 82, grade: 'A' },
    ],
  },
  {
    id: 3,
    subjectCode: 'CS506',
    subjectName: 'Cloud Architecture Lab',
    departmentCode: 'CSE',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'A',
    academicYear: '2026-2027',
    assessmentName: 'Mid-Term Lab Practical Evaluation',
    assessmentType: 'Lab',
    maxMarks: 50,
    weightagePercentage: 25,
    passingMarks: 25,
    status: 'draft',
    totalStudents: 12,
    enteredCount: 8,
    averageMarks: 44.0,
    passCount: 8,
    failCount: 0,
    absentCount: 0,
    dueDate: '2026-11-18',
    entries: [
      { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', marks: 48, isAbsent: false, percentage: 96, grade: 'O' },
      { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', marks: 45, isAbsent: false, percentage: 90, grade: 'A+' },
      { studentId: 103, rollNo: 'CSE-003', registerNumber: '2023CSE003', studentName: 'Rahul Sharma', marks: 40, isAbsent: false, percentage: 80, grade: 'A' },
      { studentId: 104, rollNo: 'CSE-004', registerNumber: '2023CSE004', studentName: 'Sneha Reddy', marks: 50, isAbsent: false, percentage: 100, grade: 'O' },
      { studentId: 105, rollNo: 'CSE-005', registerNumber: '2023CSE005', studentName: 'Vikram Malhotra', marks: null, isAbsent: false },
      { studentId: 106, rollNo: 'CSE-006', registerNumber: '2023CSE006', studentName: 'Ananya Iyer', marks: 46, isAbsent: false, percentage: 92, grade: 'A+' },
      { studentId: 107, rollNo: 'CSE-007', registerNumber: '2023CSE007', studentName: 'Rohan Verma', marks: 41, isAbsent: false, percentage: 82, grade: 'A' },
      { studentId: 108, rollNo: 'CSE-008', registerNumber: '2023CSE008', studentName: 'Kavya Nair', marks: 43, isAbsent: false, percentage: 86, grade: 'A' },
      { studentId: 109, rollNo: 'CSE-009', registerNumber: '2023CSE009', studentName: 'Arjun Das', marks: 39, isAbsent: false, percentage: 78, grade: 'B+' },
      { studentId: 110, rollNo: 'CSE-010', registerNumber: '2023CSE010', studentName: 'Priya Nambiar', marks: null, isAbsent: false },
      { studentId: 111, rollNo: 'CSE-011', registerNumber: '2023CSE011', studentName: 'Karthik Raja', marks: null, isAbsent: false },
      { studentId: 112, rollNo: 'CSE-012', registerNumber: '2023CSE012', studentName: 'Tanvi Joshi', marks: null, isAbsent: false },
    ],
  },
  {
    id: 4,
    subjectCode: 'CS701',
    subjectName: 'Advanced Cloud Computing',
    departmentCode: 'CSE',
    semesterNumber: 7,
    batchName: 'Batch 2022-2026',
    section: 'A',
    academicYear: '2026-2027',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    assessmentType: 'IA1',
    maxMarks: 50,
    weightagePercentage: 20,
    passingMarks: 25,
    status: 'draft',
    totalStudents: 12,
    enteredCount: 0,
    averageMarks: 0,
    passCount: 0,
    failCount: 0,
    absentCount: 0,
    dueDate: '2026-11-20',
    entries: mockClassStudents.map((s) => ({
      studentId: s.studentId,
      rollNo: s.rollNo,
      registerNumber: s.registerNumber,
      studentName: s.studentName,
      marks: null,
      isAbsent: false,
    })),
  },
];

let hodModerationQueue: HodModerationItem[] = [
  {
    id: 1,
    rosterId: 2,
    subjectCode: 'CS502',
    subjectName: 'Compiler Design',
    facultyName: 'Dr. Sarah Jenkins',
    facultyEmployeeId: 'FAC-CSE-004',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'B',
    totalStudents: 12,
    averageMarks: 38.2,
    passPercentage: 83.3,
    submittedAt: '2026-11-10 03:00 PM',
    status: 'submitted',
    maxMarks: 50,
    passingMarks: 25,
    entries: staffMarksRosters[1].entries,
  },
  {
    id: 2,
    rosterId: 10,
    subjectCode: 'CS503',
    subjectName: 'Database Management Systems',
    facultyName: 'Prof. Anand Kumar',
    facultyEmployeeId: 'FAC-CSE-008',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'A',
    totalStudents: 64,
    averageMarks: 36.4,
    passPercentage: 87.5,
    submittedAt: '2026-11-09 05:15 PM',
    status: 'submitted',
    maxMarks: 50,
    passingMarks: 25,
    entries: [
      { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', marks: 44, isAbsent: false, percentage: 88, grade: 'A' },
      { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', marks: 41, isAbsent: false, percentage: 82, grade: 'A' },
      { studentId: 103, rollNo: 'CSE-003', registerNumber: '2023CSE003', studentName: 'Rahul Sharma', marks: 30, isAbsent: false, percentage: 60, grade: 'C' },
    ],
  },
  {
    id: 3,
    rosterId: 11,
    subjectCode: 'CS504',
    subjectName: 'Web & Mobile Application Architecture',
    facultyName: 'Dr. Meenakshi Sundaram',
    facultyEmployeeId: 'FAC-CSE-012',
    assessmentName: 'Internal Assessment 1 (IA-1)',
    semesterNumber: 5,
    batchName: 'Batch 2023-2027',
    section: 'C',
    totalStudents: 60,
    averageMarks: 41.8,
    passPercentage: 93.3,
    submittedAt: '2026-11-08 11:30 AM',
    status: 'submitted',
    maxMarks: 50,
    passingMarks: 25,
    entries: [
      { studentId: 101, rollNo: 'CSE-001', registerNumber: '2023CSE001', studentName: 'Devon Patel', marks: 48, isAbsent: false, percentage: 96, grade: 'O' },
      { studentId: 102, rollNo: 'CSE-002', registerNumber: '2023CSE002', studentName: 'Aisha Khan', marks: 43, isAbsent: false, percentage: 86, grade: 'A' },
    ],
  },
];

let facultyWorkload: FacultyWorkloadItem[] = [
  {
    id: 1,
    facultyName: 'Dr. Sarah Jenkins',
    employeeId: 'FAC-CSE-004',
    designation: 'Associate Professor & HOD',
    departmentCode: 'CSE',
    isHod: true,
    allocatedSubjects: ['CS501 Distributed Systems', 'CS502 Compiler Design', 'CS506 Cloud Lab', 'CS701 Adv Cloud'],
    totalHoursPerWeek: 14,
    prescribedHours: 14, // HODs have reduced teaching load
    lectureHours: 9,
    labHours: 5,
    status: 'optimal',
  },
  {
    id: 2,
    facultyName: 'Prof. Anand Kumar',
    employeeId: 'FAC-CSE-008',
    designation: 'Associate Professor',
    departmentCode: 'CSE',
    isHod: false,
    allocatedSubjects: ['CS503 Database Systems', 'CS508 DBMS Lab', 'CS302 Data Structures'],
    totalHoursPerWeek: 18,
    prescribedHours: 16,
    lectureHours: 10,
    labHours: 8,
    status: 'optimal',
  },
  {
    id: 3,
    facultyName: 'Dr. Meenakshi Sundaram',
    employeeId: 'FAC-CSE-012',
    designation: 'Assistant Professor',
    departmentCode: 'CSE',
    isHod: false,
    allocatedSubjects: ['CS504 Web Technologies', 'CS509 Full Stack Lab', 'CS703 Mobile Computing', 'CS304 OOP in Java'],
    totalHoursPerWeek: 22,
    prescribedHours: 18,
    lectureHours: 14,
    labHours: 8,
    status: 'overloaded',
  },
  {
    id: 4,
    facultyName: 'Prof. Ramesh Babu',
    employeeId: 'FAC-CSE-015',
    designation: 'Assistant Professor',
    departmentCode: 'CSE',
    isHod: false,
    allocatedSubjects: ['CS505 Operating Systems Internals', 'CS510 OS Lab'],
    totalHoursPerWeek: 16,
    prescribedHours: 18,
    lectureHours: 8,
    labHours: 8,
    status: 'optimal',
  },
  {
    id: 5,
    facultyName: 'Er. Pooja Hegde',
    employeeId: 'FAC-CSE-019',
    designation: 'Lecturer',
    departmentCode: 'CSE',
    isHod: false,
    allocatedSubjects: ['CS305 Digital Electronics Lab', 'CS101 Intro to C Programming'],
    totalHoursPerWeek: 11,
    prescribedHours: 18,
    lectureHours: 5,
    labHours: 6,
    status: 'underloaded',
  },
];

let announcements: AnnouncementItem[] = [
  {
    id: 1,
    title: 'Submission Deadline for IA-1 Marks: Friday Nov 14',
    content: 'All faculty members are requested to complete Internal Assessment 1 evaluation and submit their rosters through the Marks Engine before Friday 5:00 PM. HOD moderation will conclude on Saturday.',
    category: 'Academic',
    targetAudience: 'Faculty Only',
    departmentCode: 'CSE',
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'HOD CSE',
    postedDate: '2026-11-10',
    priority: 'urgent',
    isRead: false,
  },
  {
    id: 2,
    title: 'End-Semester Lab Examination Schedule & External Examiners Notification',
    content: 'The Office of the Controller of Examinations has published the slotting schedule for Odd Semester 2026 Practical Examinations. External examiner nominations have been finalized.',
    category: 'Examination',
    targetAudience: 'All Campus',
    authorName: 'Prof. Evelyn Reed',
    authorRole: 'Dean of Academics',
    postedDate: '2026-11-08',
    priority: 'high',
    isRead: false,
    attachmentName: 'Exam_Schedule_Odd_2026.pdf',
  },
  {
    id: 3,
    title: 'Faculty Development Program on Cloud Native AI Architectures',
    content: 'A 3-day IEEE sponsored workshop on Distributed LLM Training & Kubernetes deployments is scheduled from Nov 24-26. Interested faculty members may register via the portal.',
    category: 'Event',
    targetAudience: 'Department',
    departmentCode: 'CSE',
    authorName: 'Apex Center for Research',
    authorRole: 'R&D Cell',
    postedDate: '2026-11-05',
    priority: 'normal',
    isRead: true,
  },
  {
    id: 4,
    title: 'Institutional Research Grant Seed Funding - Cycle II Applications',
    content: 'Proposals are invited from regular faculty for internal seed funding grants up to ₹3,50,000 for interdisciplinary research projects in Autonomous Systems, Green Computing, and Healthcare IoT.',
    category: 'Administrative',
    targetAudience: 'All Campus',
    authorName: 'Dr. Robert Vance',
    authorRole: 'System Administrator',
    postedDate: '2026-11-01',
    priority: 'normal',
    isRead: true,
  },
];

let staffProfile: StaffProfileData = {
  id: 3,
  name: 'Dr. Sarah Jenkins',
  employeeId: 'FAC-CSE-004',
  email: 'sarah.jenkins@apex.edu',
  phone: '+91 98451 22340',
  designation: 'Associate Professor & HOD',
  departmentName: 'Computer Science & Engineering',
  departmentCode: 'CSE',
  isHod: true,
  qualification: 'Ph.D. in Computer Science (IIT Madras), M.Tech (NITK)',
  joiningDate: '15 July 2018',
  cabinRoom: 'Department Wing B, Room 314',
  bio: 'Specializing in Distributed Systems, Fault Tolerant Computing, and Cloud Orchestration. 12+ years of university teaching and research experience.',
  advisoryClass: 'Class Advisor: B.Tech CSE 2023-2027 (Section A)',
  officeHours: 'Mon & Wed: 02:00 PM - 04:00 PM',
  publicationsCount: 18,
  researchInterests: ['Distributed Systems', 'Cloud Native Computing', 'Consensus Algorithms', 'Edge Computing'],
  notificationPreferences: {
    emailOnMarksSubmission: true,
    smsOnLowAttendance: true,
    dailyScheduleDigest: true,
    hodQueueAlerts: true,
  },
};

const weeklyTimetable: TimetableCell[] = [
  { id: 'tt-1', day: 'Monday', periodNumber: 1, timeSlot: '09:00 - 10:00 AM', subjectCode: 'CS501', subjectName: 'Distributed Systems', roomNumber: 'LH-204', batchName: 'Batch 2023-2027', section: 'A', sessionType: 'Lecture' },
  { id: 'tt-2', day: 'Monday', periodNumber: 3, timeSlot: '11:30 - 12:30 PM', subjectCode: 'CS502', subjectName: 'Compiler Design', roomNumber: 'LH-102', batchName: 'Batch 2023-2027', section: 'B', sessionType: 'Lecture' },
  { id: 'tt-3', day: 'Tuesday', periodNumber: 2, timeSlot: '10:15 - 11:15 AM', subjectCode: 'CS502', subjectName: 'Compiler Design', roomNumber: 'LH-102', batchName: 'Batch 2023-2027', section: 'B', sessionType: 'Lecture' },
  { id: 'tt-4', day: 'Tuesday', periodNumber: 4, timeSlot: '01:30 - 03:30 PM', subjectCode: 'CS506', subjectName: 'Cloud Lab', roomNumber: 'ACL-3', batchName: 'Batch 2023-2027', section: 'A', sessionType: 'Lab' },
  { id: 'tt-5', day: 'Wednesday', periodNumber: 1, timeSlot: '09:00 - 10:00 AM', subjectCode: 'CS501', subjectName: 'Distributed Systems', roomNumber: 'LH-204', batchName: 'Batch 2023-2027', section: 'A', sessionType: 'Lecture' },
  { id: 'tt-6', day: 'Wednesday', periodNumber: 5, timeSlot: '03:45 - 04:45 PM', subjectCode: 'CS701', subjectName: 'Adv Cloud', roomNumber: 'LH-301', batchName: 'Batch 2022-2026', section: 'A', sessionType: 'Lecture' },
  { id: 'tt-7', day: 'Thursday', periodNumber: 2, timeSlot: '10:15 - 11:15 AM', subjectCode: 'CS501', subjectName: 'Distributed Systems', roomNumber: 'LH-204', batchName: 'Batch 2023-2027', section: 'A', sessionType: 'Lecture' },
  { id: 'tt-8', day: 'Thursday', periodNumber: 4, timeSlot: '01:30 - 03:30 PM', subjectCode: 'CS506', subjectName: 'Cloud Lab', roomNumber: 'ACL-3', batchName: 'Batch 2023-2027', section: 'B', sessionType: 'Lab' },
  { id: 'tt-9', day: 'Friday', periodNumber: 2, timeSlot: '10:15 - 11:15 AM', subjectCode: 'CS502', subjectName: 'Compiler Design', roomNumber: 'LH-102', batchName: 'Batch 2023-2027', section: 'B', sessionType: 'Lecture' },
  { id: 'tt-10', day: 'Friday', periodNumber: 5, timeSlot: '03:45 - 04:45 PM', subjectCode: 'CS701', subjectName: 'Adv Cloud', roomNumber: 'LH-301', batchName: 'Batch 2022-2026', section: 'A', sessionType: 'Lecture' },
];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockStaffService = {
  // 1. Dashboard & Schedule
  async getStaffDashboardSummary() {
    await delay(120);
    const pendingAttendance = todaySchedule.filter((p) => !p.attendanceMarked).length;
    const pendingMarks = staffMarksRosters.filter((r) => r.status === 'draft').length;
    const hodQueueCount = hodModerationQueue.filter((m) => m.status === 'submitted').length;

    return {
      totalSubjects: allocatedSubjects.length,
      todayLectures: todaySchedule.length,
      pendingAttendanceCount: pendingAttendance,
      pendingMarksCount: pendingMarks,
      hodModerationCount: hodQueueCount,
      averageDepartmentAttendance: 88.6,
      syllabusCompletionAverage: 61.8,
    };
  },

  async getTodaySchedule(): Promise<TeachingPeriod[]> {
    await delay(120);
    return [...todaySchedule];
  },

  async getAllocatedSubjects(): Promise<AllocatedSubject[]> {
    await delay(150);
    return [...allocatedSubjects];
  },

  async getTimetable(): Promise<TimetableCell[]> {
    await delay(150);
    return [...weeklyTimetable];
  },

  // 2. Attendance Management
  async getAttendanceRoster(subjectCode = 'CS501', _date = new Date().toISOString().split('T')[0]): Promise<{
    subject: AllocatedSubject;
    students: AttendanceStudentEntry[];
  }> {
    await delay(180);
    const sub = allocatedSubjects.find((s) => s.subjectCode === subjectCode) || allocatedSubjects[0];
    return {
      subject: sub,
      students: JSON.parse(JSON.stringify(mockClassStudents)),
    };
  },

  async getAttendanceHistory(filters?: { subjectCode?: string; startDate?: string; endDate?: string }): Promise<PeriodAttendanceSession[]> {
    await delay(180);
    let list = [...attendanceSessions];
    if (filters?.subjectCode && filters.subjectCode !== 'ALL') {
      list = list.filter((s) => s.subjectCode === filters.subjectCode);
    }
    if (filters?.startDate) {
      list = list.filter((s) => s.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((s) => s.date <= filters.endDate!);
    }
    return list;
  },

  async checkAttendanceExists(date: string, periodNumber: number, subjectCode: string): Promise<PeriodAttendanceSession | null> {
    await delay(80);
    return attendanceSessions.find((s) => s.date === date && s.periodNumber === periodNumber && s.subjectCode === subjectCode) || null;
  },

  async saveAttendanceSession(sessionData: Omit<PeriodAttendanceSession, 'id' | 'attendancePercentage' | 'presentCount' | 'absentCount' | 'leaveCount' | 'totalStudents'> & { id?: string }): Promise<PeriodAttendanceSession> {
    await delay(250);
    const presentCount = sessionData.records.filter((r) => r.status === 'present').length;
    const absentCount = sessionData.records.filter((r) => r.status === 'absent').length;
    const leaveCount = sessionData.records.filter((r) => r.status === 'leave').length;
    const totalStudents = sessionData.records.length;
    const attendancePercentage = totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 0;

    const existingIndex = attendanceSessions.findIndex((s) => s.id === sessionData.id || (s.date === sessionData.date && s.periodNumber === sessionData.periodNumber && s.subjectCode === sessionData.subjectCode));

    const newSession: PeriodAttendanceSession = {
      ...sessionData,
      id: sessionData.id || `att-session-${Date.now()}`,
      presentCount,
      absentCount,
      leaveCount,
      totalStudents,
      attendancePercentage,
      submittedAt: sessionData.status === 'submitted' ? new Date().toLocaleString() : undefined,
      submittedBy: 'Dr. Sarah Jenkins',
    };

    if (existingIndex >= 0) {
      attendanceSessions[existingIndex] = newSession;
    } else {
      attendanceSessions.unshift(newSession);
    }

    // Mark matching item in today's schedule as completed if submitted
    if (sessionData.status === 'submitted') {
      todaySchedule = todaySchedule.map((tp) => {
        if (tp.periodNumber === sessionData.periodNumber && tp.subjectCode === sessionData.subjectCode) {
          return { ...tp, attendanceMarked: true, attendanceStatus: 'completed' };
        }
        return tp;
      });
    }

    return newSession;
  },

  // 3. Marks Management
  async getStaffMarksRosters(): Promise<StaffMarksRoster[]> {
    await delay(180);
    return [...staffMarksRosters];
  },

  async getMarksRosterById(id: number): Promise<StaffMarksRoster | null> {
    await delay(120);
    const found = staffMarksRosters.find((r) => r.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async saveMarksDraft(
    rosterId: number,
    entries: StaffStudentMarkEntry[],
    config?: { maxMarks: number; weightagePercentage: number; passingMarks: number }
  ): Promise<StaffMarksRoster> {
    await delay(200);
    const index = staffMarksRosters.findIndex((r) => r.id === rosterId);
    if (index === -1) throw new Error('Roster not found');

    const maxMarks = config?.maxMarks ?? staffMarksRosters[index].maxMarks;
    const passingMarks = config?.passingMarks ?? staffMarksRosters[index].passingMarks;

    const calculatedEntries = entries.map((e) => {
      if (e.isAbsent || e.marks === null || e.marks === undefined) {
        return { ...e, percentage: 0, grade: e.isAbsent ? 'ABS' : undefined };
      }
      const pct = Number(((e.marks / maxMarks) * 100).toFixed(1));
      let grade = 'F';
      if (pct >= 90) grade = 'O';
      else if (pct >= 80) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 60) grade = 'B+';
      else if (pct >= 50) grade = 'B';
      else if (pct >= 40) grade = 'C';
      return { ...e, percentage: pct, grade };
    });

    const enteredValid = calculatedEntries.filter((e) => e.marks !== null && !e.isAbsent);
    const averageMarks = enteredValid.length > 0 ? Number((enteredValid.reduce((acc, curr) => acc + (curr.marks || 0), 0) / enteredValid.length).toFixed(1)) : 0;
    const passCount = calculatedEntries.filter((e) => (e.marks || 0) >= passingMarks && !e.isAbsent).length;
    const failCount = calculatedEntries.filter((e) => e.marks !== null && !e.isAbsent && (e.marks || 0) < passingMarks).length;
    const absentCount = calculatedEntries.filter((e) => e.isAbsent).length;

    const updated: StaffMarksRoster = {
      ...staffMarksRosters[index],
      entries: calculatedEntries,
      maxMarks,
      weightagePercentage: config?.weightagePercentage ?? staffMarksRosters[index].weightagePercentage,
      passingMarks,
      enteredCount: calculatedEntries.filter((e) => e.marks !== null || e.isAbsent).length,
      averageMarks,
      passCount,
      failCount,
      absentCount,
    };

    staffMarksRosters[index] = updated;
    return updated;
  },

  async submitMarksToHod(rosterId: number): Promise<StaffMarksRoster> {
    await delay(250);
    const index = staffMarksRosters.findIndex((r) => r.id === rosterId);
    if (index === -1) throw new Error('Roster not found');

    const updated: StaffMarksRoster = {
      ...staffMarksRosters[index],
      status: 'submitted',
      submittedAt: new Date().toLocaleString(),
    };
    staffMarksRosters[index] = updated;

    // Add to HOD moderation queue
    const queueIndex = hodModerationQueue.findIndex((q) => q.rosterId === rosterId);
    const queueItem: HodModerationItem = {
      id: queueIndex >= 0 ? hodModerationQueue[queueIndex].id : Date.now(),
      rosterId,
      subjectCode: updated.subjectCode,
      subjectName: updated.subjectName,
      facultyName: 'Dr. Sarah Jenkins',
      facultyEmployeeId: 'FAC-CSE-004',
      assessmentName: updated.assessmentName,
      semesterNumber: updated.semesterNumber,
      batchName: updated.batchName,
      section: updated.section,
      totalStudents: updated.totalStudents,
      averageMarks: updated.averageMarks,
      passPercentage: Number(((updated.passCount / updated.totalStudents) * 100).toFixed(1)),
      submittedAt: new Date().toLocaleString(),
      status: 'submitted',
      entries: updated.entries,
      maxMarks: updated.maxMarks,
      passingMarks: updated.passingMarks,
    };

    if (queueIndex >= 0) {
      hodModerationQueue[queueIndex] = queueItem;
    } else {
      hodModerationQueue.unshift(queueItem);
    }

    return updated;
  },

  // 4. HOD Console
  async getHodModerationQueue(): Promise<HodModerationItem[]> {
    await delay(180);
    return [...hodModerationQueue];
  },

  async verifyHodRoster(queueId: number, remarks?: string): Promise<HodModerationItem> {
    await delay(250);
    const qIndex = hodModerationQueue.findIndex((q) => q.id === queueId);
    if (qIndex === -1) throw new Error('Queue item not found');

    const item = hodModerationQueue[qIndex];
    item.status = 'verified';
    item.remarks = remarks || 'Endorsed by HOD';

    // Update roster status
    const rIndex = staffMarksRosters.findIndex((r) => r.id === item.rosterId);
    if (rIndex >= 0) {
      staffMarksRosters[rIndex].status = 'verified';
      staffMarksRosters[rIndex].verifiedAt = new Date().toLocaleString();
    }

    return item;
  },

  async returnHodRoster(queueId: number, reason: string): Promise<HodModerationItem> {
    await delay(250);
    const qIndex = hodModerationQueue.findIndex((q) => q.id === queueId);
    if (qIndex === -1) throw new Error('Queue item not found');

    const item = hodModerationQueue[qIndex];
    item.status = 'returned';
    item.remarks = reason;

    // Update roster status back to draft with return reason
    const rIndex = staffMarksRosters.findIndex((r) => r.id === item.rosterId);
    if (rIndex >= 0) {
      staffMarksRosters[rIndex].status = 'draft';
      staffMarksRosters[rIndex].returnReason = reason;
    }

    return item;
  },

  async getFacultyWorkload(): Promise<FacultyWorkloadItem[]> {
    await delay(180);
    return [...facultyWorkload];
  },

  async getDepartmentAnalytics() {
    await delay(180);
    return {
      departmentName: 'Computer Science & Engineering',
      totalFaculty: 42,
      totalStudentsEnrolled: 580,
      averageAttendanceRate: 88.6,
      overallPassPercentage: 89.2,
      syllabusCompletionRate: 64.5,
      semesterBreakdown: [
        { semester: 'Sem 3 (2nd Year)', passRate: 86.4, attendance: 87.2, averageSgpa: 7.6 },
        { semester: 'Sem 5 (3rd Year)', passRate: 89.8, attendance: 89.5, averageSgpa: 8.1 },
        { semester: 'Sem 7 (4th Year)', passRate: 94.2, attendance: 91.0, averageSgpa: 8.5 },
      ],
      lowAttendanceCount: 14,
      pendingMarksCount: 3,
    };
  },

  // 5. Announcements
  async getAnnouncements(categoryFilter?: string): Promise<AnnouncementItem[]> {
    await delay(150);
    if (!categoryFilter || categoryFilter === 'ALL') {
      return [...announcements];
    }
    return announcements.filter((a) => a.category.toLowerCase() === categoryFilter.toLowerCase());
  },

  async markAnnouncementAsRead(id: number): Promise<void> {
    await delay(100);
    announcements = announcements.map((a) => (a.id === id ? { ...a, isRead: true } : a));
  },

  async createAnnouncement(data: Omit<AnnouncementItem, 'id' | 'postedDate' | 'isRead'>): Promise<AnnouncementItem> {
    await delay(250);
    const newAnnouncement: AnnouncementItem = {
      ...data,
      id: Date.now(),
      postedDate: new Date().toISOString().split('T')[0],
      isRead: true,
    };
    announcements.unshift(newAnnouncement);
    return newAnnouncement;
  },

  // 6. Profile & Preferences
  async getFacultyProfile(): Promise<StaffProfileData> {
    await delay(150);
    return { ...staffProfile };
  },

  async updateFacultyProfile(updated: Partial<StaffProfileData>): Promise<StaffProfileData> {
    await delay(250);
    staffProfile = { ...staffProfile, ...updated };
    return { ...staffProfile };
  },
};

