import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt,
  DollarSign,
  AlertTriangle,
  Users,
  Download,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  SearchInput,
  Modal,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { mockAdminService } from '@/services/mock/mockAdminService';
import type { StudentFeeRecord, FeeTransaction } from '@/types/finance.types';

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const FinanceView: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'outstanding' | 'transactions' | 'structure'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<FeeTransaction['paymentMethod']>('UPI');

  const { data: feeSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['admin', 'feeSummary'],
    queryFn: () => mockAdminService.getFeeSummary(),
  });

  const { data: feeRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['admin', 'feeRecords'],
    queryFn: () => mockAdminService.getStudentFeeRecords(),
  });

  const { data: transactions = [], isLoading: isLoadingTxns } = useQuery({
    queryKey: ['admin', 'feeTransactions'],
    queryFn: () => mockAdminService.getFeeTransactions(),
  });

  const { data: feeStructures = [], isLoading: isLoadingStructures } = useQuery({
    queryKey: ['admin', 'feeStructures'],
    queryFn: () => mockAdminService.getFeeStructures(),
  });

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: () => {
      if (!selectedFeeRecord) throw new Error('No record');
      return mockAdminService.recordFeePayment(selectedFeeRecord.id, paymentAmount, paymentMethod);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      addToast({ title: 'Payment Recorded', description: `Transaction ${res.transactionId} recorded for ₹${paymentAmount.toLocaleString('en-IN')}.`, type: 'success' });
      setIsPaymentModalOpen(false);
      setSelectedFeeRecord(null);
      setPaymentAmount(0);
    },
  });

  const filteredRecords = feeRecords.filter(
    (r) => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (t) => t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Fee Collection Management"
        subtitle="Institution-wide fee collection, outstanding dues, payment transactions, and academic year fee structures."
        badge={<Badge variant="indigo" size="md">AY 2025-26</Badge>}
        actions={
          <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => addToast({ title: 'Finance Report Generated', description: 'Fee collection summary PDF exported.', type: 'success' })}>
            Export Collection Report
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Expected Revenue" value={feeSummary ? formatINR(feeSummary.totalExpectedINR) : '—'} secondaryText="Annual Academic Year" icon={<DollarSign className="w-5 h-5" />} />
        <StatCard label="Collected Amount" value={feeSummary ? formatINR(feeSummary.totalCollectedINR) : '—'} delta={feeSummary ? { value: feeSummary.collectionPercentage, trend: 'up', label: `${feeSummary.collectionPercentage}% collected` } : undefined} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatCard label="Outstanding Dues" value={feeSummary ? formatINR(feeSummary.totalOutstandingINR) : '—'} secondaryText="Pending payment recovery" icon={<AlertTriangle className="w-5 h-5" />} iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50" />
        <StatCard label="Fee Defaulters" value={feeSummary ? `${feeSummary.defaultersCount} Students` : '—'} secondaryText="Examination bar at risk" icon={<Users className="w-5 h-5" />} iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50" />
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(['overview', 'outstanding', 'transactions', 'structure'] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
              {tab === 'overview' ? 'Collection Summary' : tab === 'outstanding' ? `Outstanding Dues (${feeRecords.filter((r) => r.status !== 'paid').length})` : tab === 'transactions' ? `Recent Transactions (${transactions.length})` : 'Fee Structures'}
            </button>
          ))}
        </div>

        {(activeTab === 'outstanding' || activeTab === 'transactions') && (
          <div className="w-full sm:w-72">
            <SearchInput placeholder="Search student or receipt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </div>

      {/* Tab: Collection Summary (Visual) */}
      {activeTab === 'overview' && (
        isLoadingSummary ? <Skeleton className="h-64 w-full rounded-xl" /> : feeSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">Revenue Collection Progress</h3>
              <div className="space-y-4">
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-6 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${feeSummary.collectionPercentage}%` }}>
                    {feeSummary.collectionPercentage}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <span className="text-[10px] text-emerald-600 block">Collected</span>
                    <span className="font-mono font-bold text-emerald-600 text-base">{formatINR(feeSummary.totalCollectedINR)}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10">
                    <span className="text-[10px] text-rose-600 block">Outstanding</span>
                    <span className="font-mono font-bold text-rose-600 text-base">{formatINR(feeSummary.totalOutstandingINR)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">Scholarship & Financial Aid</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-[10px] text-indigo-600 block uppercase tracking-wider font-semibold">Total Scholarships Disbursed</span>
                  <span className="font-mono font-bold text-2xl text-indigo-600 block mt-1">{formatINR(feeSummary.scholarshipDisbursedINR)}</span>
                  <span className="text-xs text-slate-500 block mt-1">Merit-based & government-funded aid for qualifying students</span>
                </div>

                <div className="text-xs text-slate-500">
                  <p>Category breakdown: Merit (42%), Govt. Aid (35%), Sports (12%), Need-based (11%)</p>
                </div>
              </div>
            </Card>
          </div>
        ) : null
      )}

      {/* Tab: Outstanding Dues */}
      {activeTab === 'outstanding' && (
        isLoadingRecords ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredRecords.length === 0 ? (
          <EmptyState icon={Receipt} title="No fee records found" description="No student fee records matched your search." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student & Roll No</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Total Fee</th>
                    <th className="py-3.5 px-4">Paid Amount</th>
                    <th className="py-3.5 px-4">Balance Due</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{rec.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{rec.registrationNumber}</span>
                      </td>
                      <td className="py-3.5 px-4"><Badge variant="indigo" size="sm" className="font-mono">{rec.departmentCode}</Badge></td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-zinc-200">₹{rec.totalFee.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">₹{rec.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{rec.balanceDue > 0 ? `₹${rec.balanceDue.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{rec.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={rec.status === 'paid' ? 'emerald' : rec.status === 'partial' ? 'amber' : 'rose'} size="sm">{rec.status.toUpperCase()}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {rec.balanceDue > 0 && (
                          <Button size="sm" variant="primary" className="h-7 text-xs px-2" onClick={() => { setSelectedFeeRecord(rec); setPaymentAmount(rec.balanceDue); setIsPaymentModalOpen(true); }}>
                            Record Payment
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Tab: Recent Transactions */}
      {activeTab === 'transactions' && (
        isLoadingTxns ? <Skeleton className="h-64 w-full rounded-xl" /> : filteredTransactions.length === 0 ? (
          <EmptyState icon={CreditCard} title="No transactions found" description="No payment transactions matched your search." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Receipt No</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Transaction Date</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{txn.receiptNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{txn.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{txn.registrationNumber}</span>
                      </td>
                      <td className="py-3.5 px-4"><Badge variant="indigo" size="sm" className="font-mono">{txn.departmentCode}</Badge></td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">₹{txn.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4"><Badge variant="neutral" size="sm">{txn.paymentMethod}</Badge></td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{txn.transactionDate}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={txn.status === 'success' ? 'emerald' : txn.status === 'pending' ? 'amber' : 'rose'} size="sm">{txn.status.toUpperCase()}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Tab: Fee Structures */}
      {activeTab === 'structure' && (
        isLoadingStructures ? <Skeleton className="h-64 w-full rounded-xl" /> : (
          <Card>
            <CardHeader>
              <CardTitle>Academic Year Fee Structure</CardTitle>
              <CardDescription>Program-wise annual fee breakdown for the current academic year.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Program</th>
                      <th className="py-3 px-4">Tuition Fee</th>
                      <th className="py-3 px-4">Development Fee</th>
                      <th className="py-3 px-4">Lab & Library</th>
                      <th className="py-3 px-4">Exam Fee</th>
                      <th className="py-3 px-4">Total / Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/80">
                    {feeStructures.map((fs) => (
                      <tr key={fs.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">{fs.program}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">₹{fs.tuitionFee.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">₹{fs.developmentFee.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">₹{fs.labLibraryFee.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">₹{fs.examinationFee.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">₹{fs.totalPerYear.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Fee Payment" description={selectedFeeRecord ? `Recording payment for ${selectedFeeRecord.studentName} (${selectedFeeRecord.registrationNumber}). Outstanding balance: ₹${selectedFeeRecord.balanceDue.toLocaleString('en-IN')}` : ''} size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={recordPaymentMutation.isPending} disabled={paymentAmount <= 0} onClick={() => recordPaymentMutation.mutate()}>Confirm Payment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Payment Amount (₹)" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} required />
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as FeeTransaction['paymentMethod'])}
              className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="UPI">UPI</option>
              <option value="Netbanking">Net Banking</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Demand Draft">Demand Draft</option>
              <option value="Cash">Cash (Counter)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

