'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashFlowData {
  success: boolean;
  data: any;
  cached: boolean;
  cacheKey: string;
}

export default function CashFlowPage() {
  const [year, setYear] = useState<string>('2025');
  const [month, setMonth] = useState<string>('01');
  const [reportType, setReportType] = useState<'month' | 'year'>('month'); // month or year
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<CashFlowData | null>(null);
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
        `http://localhost:3001/api/reports/cash-flow?${params.toString()}`,
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
    let filename = `cash-flow-${year}`;
    if (reportType === 'month') {
      filename += `-${month}`;
    }
    filename += '.csv';

    let csv = `Cash Flow Statement\n`;
    if (reportType === 'year') {
      csv += `Year: ${year}\n`;
    } else {
      csv += `Period: ${year}-${month}\n`;
    }
    csv += `\n`;
    csv += `Operating Activities\n`;
    csv += `Net Income,${report.operatingActivities?.netIncome || 0}\n`;
    csv += `Total Operating Cash Flow,${report.operatingActivities?.totalOperatingCashFlow || 0}\n`;
    csv += `\nInvesting Activities\n`;
    csv += `Total Investing Cash Flow,${report.investingActivities?.totalInvestingCashFlow || 0}\n`;
    csv += `\nFinancing Activities\n`;
    csv += `Total Financing Cash Flow,${report.financingActivities?.totalFinancingCashFlow || 0}\n`;
    csv += `\nNet Change in Cash,${report.netChangeInCash || 0}\n`;

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
          <h1 className="text-3xl font-bold text-slate-900">Cash Flow Statement</h1>
          <p className="mt-2 text-slate-600">Operating, investing, and financing cash flows</p>
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
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-slate-900 mb-2">Operating Activities</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Net Income</span>
                      <span>₱{reportData.data.operatingActivities.netIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depreciation</span>
                      <span>₱{reportData.data.operatingActivities.depreciation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change in AR</span>
                      <span>₱{reportData.data.operatingActivities.changeInAccountsReceivable.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change in Inventory</span>
                      <span>₱{reportData.data.operatingActivities.changeInInventory.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-semibold">Operating Cash Flow</span>
                      <span className="font-semibold bg-blue-50 px-2 py-1 rounded">
                        ₱{reportData.data.operatingActivities.totalOperatingCashFlow.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-2">Investing Activities</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-semibold">Investing Cash Flow</span>
                      <span className="font-semibold bg-blue-50 px-2 py-1 rounded">
                        ₱{reportData.data.investingActivities.totalInvestingCashFlow.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-2">Financing Activities</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-semibold">Financing Cash Flow</span>
                      <span className="font-semibold bg-blue-50 px-2 py-1 rounded">
                        ₱{reportData.data.financingActivities.totalFinancingCashFlow.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Opening Cash Balance</span>
                    <span>₱{reportData.data.openingCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 border-b pb-2 text-sm">
                    <span>Net Change in Cash</span>
                    <span>₱{reportData.data.netChangeInCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Closing Cash Balance</span>
                    <span>₱{reportData.data.closingCash.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
