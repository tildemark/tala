'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrialBalanceData {
  success: boolean;
  data: any;
  cached: boolean;
  cacheKey: string;
}

export default function TrialBalancePage() {
  const [year, setYear] = useState<string>('2025');
  const [month, setMonth] = useState<string>('01');
  const [reportType, setReportType] = useState<'month' | 'year'>('month'); // month or year
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<TrialBalanceData | null>(null);
  const [error, setError] = useState('');
  const [skipCache, setSkipCache] = useState(false);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const generateYears = () => {
    const years: string[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      years.push(String(now.getFullYear() - i));
    }
    return years;
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const params = new URLSearchParams();
      params.set('year', year);
      if (reportType === 'month') {
        params.set('month', month);
      }
      params.set('skipCache', String(skipCache));

      const response = await fetch(
        `http://localhost:3001/api/reports/trial-balance?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData?.data) return;

    const report = reportData.data;
    let filename = `trial-balance-${year}`;
    if (reportType === 'month') {
      filename += `-${month}`;
    }
    filename += '.csv';

    let csv = `Trial Balance Report\n`;
    if (reportType === 'year') {
      csv += `Year: ${year}\n`;
    } else {
      csv += `Period: ${year}-${month}\n`;
    }
    csv += `\n`;
    csv += `Account Code,Account Name,Account Type,Debit,Credit,Balance\n`;
    for (const account of report.accounts) {
      csv += `${account.accountCode},"${account.accountName}",${account.accountType},${account.debit},${account.credit},${account.balance}\n`;
    }
    csv += `\nTotal Debits: ${report.totalDebits}\nTotal Credits: ${report.totalCredits}\nBalanced: ${report.isBalanced}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    fetchReport();
  }, [year, month, reportType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trial Balance Report</h1>
          <p className="mt-2 text-slate-600">Account balances for the selected period</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="space-y-4">
          {/* Report Type Selection */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="month"
                checked={reportType === 'month'}
                onChange={(e) => setReportType(e.target.value as 'month' | 'year')}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">By Month</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="year"
                checked={reportType === 'year'}
                onChange={(e) => setReportType(e.target.value as 'month' | 'year')}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">By Year</span>
            </label>
          </div>

          {/* Period Selectors */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'month' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month
                </label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipCache"
                checked={skipCache}
                onChange={(e) => setSkipCache(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="skipCache" className="text-sm text-slate-700">
                Skip Cache
              </label>
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              Refresh
            </Button>
            {reportData && (
              <Button onClick={exportToCSV} variant="secondary">
                📥 CSV
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Report */}
      {reportData && reportData.success && (
        <Card>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              <span className="text-slate-600">
                {reportData.cached ? '⚡ Cached' : '🔄 Fresh'} | Period: {reportData.data.period}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Account Code</th>
                    <th className="px-4 py-2 text-left">Account Name</th>
                    <th className="px-4 py-2 text-right">Debit</th>
                    <th className="px-4 py-2 text-right">Credit</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.accounts.map((account: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-2 font-mono">{account.accountCode}</td>
                      <td className="px-4 py-2">{account.accountName}</td>
                      <td className="px-4 py-2 text-right">{account.debit.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{account.credit.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{account.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
                  <tr>
                    <td colSpan={2} className="px-4 py-2">
                      Total
                    </td>
                    <td className="px-4 py-2 text-right">{reportData.data.totalDebits.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{reportData.data.totalCredits.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{reportData.data.isBalanced ? '✅ Balanced' : '❌ Unbalanced'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
