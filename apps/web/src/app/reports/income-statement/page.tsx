'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncomeStatementData {
  success: boolean;
  data: any;
  cached: boolean;
  cacheKey: string;
}

export default function IncomeStatementPage() {
  const [year, setYear] = useState<string>('2025');
  const [month, setMonth] = useState<string>('01');
  const [reportType, setReportType] = useState<'month' | 'year'>('month'); // month or year
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<IncomeStatementData | null>(null);
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
        `http://localhost:3001/api/reports/income-statement?${params.toString()}`,
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
    let filename = `income-statement-${year}`;
    if (reportType === 'month') {
      filename += `-${month}`;
    }
    filename += '.csv';

    let csv = `Income Statement Report\n`;
    if (reportType === 'year') {
      csv += `Year: ${year}\n`;
    } else {
      csv += `Period: ${year}-${month}\n`;
    }
    csv += `\n`;
    csv += `Revenue\n`;
    for (const line of report.revenue) {
      csv += `"${line.description}","${line.amount}"\n`;
    }
    csv += `\nTotal Revenue,${report.totalRevenue}\n`;
    csv += `\nExpenses\n`;
    for (const line of report.expenses) {
      csv += `"${line.description}","${line.amount}"\n`;
    }
    csv += `\nTotal Expenses,${report.totalExpenses}\n`;
    csv += `\nNet Income,${report.netIncome}\n`;

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
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Income Statement Report</h1>
          <p className="mt-2 text-slate-600">Revenue and expenses for the selected period</p>
        </div>
      </div>

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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      {reportData && reportData.success && (
        <Card>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              <span className="text-slate-600">
                {reportData.cached ? '⚡ Cached' : '🔄 Fresh'} | Period: {reportData.data.period}
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between py-2 border-b">
                <span>Total Revenue</span>
                <span className="font-semibold">₱{reportData.data.totalRevenue.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b text-red-600">
                <span>Total Expenses</span>
                <span>(₱{reportData.data.totalExpenses.toFixed(2)})</span>
              </div>

              <div className="flex justify-between py-2 bg-green-100 font-bold text-lg">
                <span>Net Income</span>
                <span>₱{reportData.data.netIncome.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
