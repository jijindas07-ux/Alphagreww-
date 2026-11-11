export interface FeeSummary {
  totalExpectedINR: number;
  totalCollectedINR: number;
  totalOutstandingINR: number;
  collectionPercentage: number;
  defaultersCount: number;
  scholarshipDisbursedINR: number;
}

export interface StudentFeeRecord {
  id: number;
  studentId: number;
  studentName: string;
  registrationNumber: string;
  departmentCode: string;
  batch: string;
  semester: string;
  totalFee: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'overdue';
  lastPaymentDate?: string;
}

export interface FeeTransaction {
  id: string;
  receiptNumber: string;
  studentName: string;
  registrationNumber: string;
  departmentCode: string;
  amount: number;
  paymentMethod: 'UPI' | 'Netbanking' | 'Credit Card' | 'Demand Draft' | 'Cash';
  transactionDate: string;
  status: 'success' | 'pending' | 'failed';
}

export interface FeeStructureItem {
  id: number;
  program: string;
  academicYear: string;
  tuitionFee: number;
  developmentFee: number;
  labLibraryFee: number;
  examinationFee: number;
  totalPerYear: number;
}

