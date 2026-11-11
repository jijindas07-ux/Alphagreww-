// Mock service for Student Portal
// Provides fake data for the Student Dashboard, Academic Hub, Results, Placement Drives, and Profile.
// This mirrors the shape of the existing mockStaffService but tailored for student use.

export interface DashboardData {
  studentName: string;
  studentId: string;
  avatarUrl?: string;
  attendancePercentage: number;
  gpa: number;
  upcomingExams: Exam[];
  announcements: Announcement[];
  placementDrives: PlacementDriveSummary[];
}

export interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  subject: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO
}

export interface PlacementDriveSummary {
  id: string;
  company: string;
  role: string;
  deadline: string; // ISO
  status: 'Open' | 'Closed' | 'Applied' | 'Rejected' | 'Selected';
}

export interface TimetableSlot {
  day: string; // e.g., "Monday"
  start: string; // HH:mm
  end: string;   // HH:mm
  subject: string;
  faculty: string;
  location?: string;
}

export interface SubjectEnrollment {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  syllabusUrl?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  url: string;
  subjectId: string;
}

export interface AttendanceRecord {
  date: string; // ISO
  status: 'Present' | 'Absent' | 'On Leave';
}

export interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  percentage: number;
}

export interface ResultSemester {
  semester: string; // e.g., "Fall 2024"
  gpa: number;
  subjects: ResultSubject[];
  publishedOn?: string; // ISO or null if not yet published
}

export interface ResultSubject {
  id: string;
  code: string;
  name: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  department: string;
  course: string;
  batch: string;
  semester: string;
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string; // ISO
}

export interface Language {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface PlacementDriveDetail extends PlacementDriveSummary {
  description: string;
  eligibility: EligibilityCriteria;
  applied: boolean;
  applicationStatus?: 'Pending' | 'Under Review' | 'Rejected' | 'Selected';
}

export interface EligibilityCriteria {
  minGPA?: number;
  requiredCourses?: string[];
  departmentsAllowed?: string[];
}

// Utility to simulate async delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockStudentService = {
  async getDashboard(): Promise<DashboardData> {
    await delay(200);
    return {
      studentName: 'Alex Johnson',
      studentId: 'STU-2023001',
      avatarUrl: '/avatars/student-1.png',
      attendancePercentage: 88,
      gpa: 3.65,
      upcomingExams: [
        { id: 'exam-01', title: 'Data Structures Midterm', date: '2024-11-20', subject: 'CS201' },
        { id: 'exam-02', title: 'Linear Algebra Final', date: '2024-12-05', subject: 'MA102' },
      ],
      announcements: [
        {
          id: 'ann-01',
          title: 'Winter Break Schedule',
          content: 'Campus will remain closed from Dec 24 to Jan 2.',
          date: '2024-11-10',
        },
        {
          id: 'ann-02',
          title: 'Placement Drive Registration',
          content: 'Register for upcoming placement drives by Dec 15.',
          date: '2024-11-08',
        },
      ],
      placementDrives: [
        { id: 'pd-01', company: 'TechNova', role: 'Software Engineer', deadline: '2024-12-15', status: 'Open' },
        { id: 'pd-02', company: 'FinBank', role: 'Data Analyst', deadline: '2024-12-10', status: 'Applied' },
      ],
    };
  },

  async getTimetable(): Promise<TimetableSlot[]> {
    await delay(150);
    return [
      { day: 'Monday', start: '09:00', end: '10:30', subject: 'CS201 - Data Structures', faculty: 'Dr. Maya Patel' },
      { day: 'Monday', start: '11:00', end: '12:30', subject: 'MA102 - Linear Algebra', faculty: 'Prof. Rahul Singh' },
      { day: 'Tuesday', start: '10:00', end: '11:30', subject: 'CS202 - Algorithms', faculty: 'Dr. Maya Patel' },
      // ... more slots
    ];
  },

  async getEnrolledSubjects(): Promise<SubjectEnrollment[]> {
    await delay(120);
    return [
      { id: 'sub-01', code: 'CS201', name: 'Data Structures', faculty: 'Dr. Maya Patel', credits: 4, syllabusUrl: '/syllabi/cs201.pdf' },
      { id: 'sub-02', code: 'MA102', name: 'Linear Algebra', faculty: 'Prof. Rahul Singh', credits: 3 },
      { id: 'sub-03', code: 'CS202', name: 'Algorithms', faculty: 'Dr. Maya Patel', credits: 4 },
    ];
  },

  async getStudyMaterials(): Promise<StudyMaterial[]> {
    await delay(100);
    return [
      { id: 'mat-01', title: 'Data Structures Lecture 1 Slides', url: '/materials/ds-lecture1.pdf', subjectId: 'sub-01' },
      { id: 'mat-02', title: 'Linear Algebra Chapter 5 Notes', url: '/materials/la-ch5.pdf', subjectId: 'sub-02' },
    ];
  },

  async getAttendanceHistory(_subjectId: string): Promise<AttendanceRecord[]> {
    await delay(100);
    // generate mock records for the last 30 days
    const records: AttendanceRecord[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const status = Math.random() < 0.85 ? 'Present' : 'Absent';
      records.push({ date: iso, status });
    }
    return records;
  },

  async getAttendanceSummary(): Promise<AttendanceSummary[]> {
    await delay(80);
    return [
      { subjectId: 'sub-01', subjectName: 'Data Structures', percentage: 92 },
      { subjectId: 'sub-02', subjectName: 'Linear Algebra', percentage: 78 },
      { subjectId: 'sub-03', subjectName: 'Algorithms', percentage: 85 },
    ];
  },

  async getResults(): Promise<ResultSemester[]> {
    await delay(200);
    return [
      {
        semester: 'Fall 2023',
        gpa: 3.58,
        publishedOn: '2024-01-15',
        subjects: [
          { id: 'res-01', code: 'CS101', name: 'Intro to CS', marksObtained: 88, maxMarks: 100, grade: 'A' },
          { id: 'res-02', code: 'MA101', name: 'Calculus I', marksObtained: 75, maxMarks: 100, grade: 'B+' },
        ],
      },
      {
        semester: 'Spring 2024',
        gpa: 3.72,
        publishedOn: '2024-06-20',
        subjects: [
          { id: 'res-03', code: 'CS201', name: 'Data Structures', marksObtained: 92, maxMarks: 100, grade: 'A' },
          { id: 'res-04', code: 'MA102', name: 'Linear Algebra', marksObtained: 81, maxMarks: 100, grade: 'A-' },
        ],
      },
    ];
  },

  async getPlacementDrives(): Promise<PlacementDriveDetail[]> {
    await delay(150);
    return [
      {
        id: 'pd-01',
        company: 'TechNova',
        role: 'Software Engineer',
        deadline: '2024-12-15',
        status: 'Open',
        description: 'Work on cutting‑edge AI products with a dynamic team.',
        eligibility: { minGPA: 3.4, departmentsAllowed: ['Computer Science', 'IT'] },
        applied: false,
      },
      {
        id: 'pd-02',
        company: 'FinBank',
        role: 'Data Analyst',
        deadline: '2024-12-10',
        status: 'Applied',
        description: 'Analyze financial datasets and build predictive models.',
        eligibility: { minGPA: 3.2 },
        applied: true,
        applicationStatus: 'Pending',
      },
    ];
  },

  async applyToPlacementDrive(driveId: string): Promise<boolean> {
    await delay(120);
    // In a real service this would persist, here we simply return true.
    console.log(`Mock application submitted for drive ${driveId}`);
    return true;
  },

  async getProfile(): Promise<Profile> {
    await delay(120);
    return {
      id: 'STU-2023001',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.edu',
      phone: '+1 555 123 4567',
      address: '123 College Ave, Cityville',
      department: 'Computer Science',
      course: 'B.Tech',
      batch: '2020-2024',
      semester: '6',
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
      projects: [
        { id: 'proj-01', title: 'Campus Event App', description: 'A mobile app for campus event management.', link: 'https://github.com/alex/campus-event' },
      ],
      certifications: [
        { id: 'cert-01', title: 'AWS Certified Developer', issuer: 'Amazon', date: '2023-09-15' },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Intermediate' },
      ],
      interests: ['Open Source', 'Machine Learning', 'UI/UX Design'],
    };
  },

  async updateProfile(updated: Partial<Profile>): Promise<Profile> {
    await delay(150);
    // Return merged mock profile for demonstration.
    const current = await this.getProfile();
    return { ...current, ...updated } as Profile;
  },
};

