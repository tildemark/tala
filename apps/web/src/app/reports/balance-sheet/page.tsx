'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface BalanceSheetData {
  success: boolean;
  data: any;
  cached: boolean;
  cacheKey: string;
}

export default function BalanceSheetPage() {
  const [year, setYear] = useState<string>('2025');
  const [month, setMonth] = useState<string>('01');
  const [reportType, setReportType] = useState<'month' | 'year'>('month'); // month or year
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<BalanceSheetData | null>(null);
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
        `http://localhost:3001/api/reports/balance-sheet?${params.toString()}`,
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
    let filename = `balance-sheet-${year}`;
    if (reportType === 'month') {
      filename += `-${month}`;
    }
    filename += '.csv';

    let csv = `Balance Sheet Report\n`;
    if (reportType === 'year') {
      csv += `Year: ${year}\n`;
    } else {
      csv += `Period: ${year}-${month}\n`;
    }
    csv += `\n`;
    csv += `Assets\n`;
    for (const line of report.assets) {
      csv += `"${line.description}","${line.amount}"\n`;
    }
    csv += `\nTotal Assets,${report.totalAssets}\n`;
    csv += `\nLiabilities\n`;
    for (const line of report.liabilities) {
      csv += `"${line.description}","${line.amount}"\n`;
    }
    csv += `\nTotal Liabilities,${report.totalLiabilities}\n`;
    csv += `\nEquity\n`;
    for (const line of report.equity) {
      csv += `"${line.description}","${line.amount}"\n`;
    }
    csv += `\nTotal Equity,${report.totalEquity}\n`;

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
          <h1 className="text-3xl font-bold text-slate-900">Balance Sheet Report</h1>
          <p className="mt-2 text-slate-600">Assets, liabilities, and equity for the selected period</p>
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
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                {generateYears().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>

            {reportType === 'month' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month
                </label>
                <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
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
            <Button onClick={fetchReport} isLoading={loading}>
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
                {reportData.cached ? '⚡ Cached' : '🔄 Fresh'} | As Of: {reportData.data.asOf}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b-2">ASSETS</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-slate-700 mb-2">Current Assets</div>
                  <div className="flex justify-between ml-4">
                    <span>Cash</span>
                    <span>₱{reportData.data.assets.currentAssets.cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span>Accounts Receivable</span>
                    <span>₱{reportData.data.assets.currentAssets.accountsReceivable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between ml-4 mb-2">
                    <span>Inventory</span>
                    <span>₱{reportData.data.assets.currentAssets.inventory.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded">
                    <span>Total Current Assets</span>
                    <span className="font-semibold">₱{reportData.data.assets.currentAssets.totalCurrentAssets.toFixed(2)}</span>
                  </div>

                  <div className="font-semibold text-slate-700 mt-4 mb-2">Fixed Assets</div>
                  <div className="flex justify-between ml-4">
                    <span>PPE</span>
                    <span>₱{reportData.data.assets.fixedAssets.propertyPlantEquipment.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between ml-4 mb-2">
                    <span>Less: Accum. Depreciation</span>
                    <span>(₱{reportData.data.assets.fixedAssets.accumulatedDepreciation.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded">
                    <span>Total Assets</span>
                    <span className="font-bold">₱{reportData.data.assets.totalAssets.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b-2">LIABILITIES & EQUITY</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-slate-700 mb-2">Current Liabilities</div>
                  <div className="flex justify-between ml-4">
                    <span>Accounts Payable</span>
                    <span>₱{reportData.data.liabilities.currentLiabilities.accountsPayable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between ml-4 mb-2">
                    <span>Accrued Expenses</span>
                    <span>₱{reportData.data.liabilities.currentLiabilities.accruedExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-red-50 p-2 rounded">
                    <span>Total Liabilities</span>
                    <span className="font-semibold">₱{reportData.data.liabilities.totalLiabilities.toFixed(2)}</span>
                  </div>

                  <div className="font-semibold text-slate-700 mt-4 mb-2">Equity</div>
                  <div className="flex justify-between ml-4">
                    <span>Capital Stock</span>
                    <span>₱{reportData.data.equity.capitalStock.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between ml-4 mb-2">
                    <span>Retained Earnings</span>
                    <span>₱{reportData.data.equity.retainedEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-green-50 p-2 rounded mb-2">
                    <span>Total Equity</span>
                    <span className="font-semibold">₱{reportData.data.equity.totalEquity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-blue-50 p-2 rounded border-2">
                    <span className="font-bold">Total Liab. & Equity</span>
                    <span className="font-bold">₱{reportData.data.totalLiabilitiesAndEquity.toFixed(2)}</span>
                  </div>
                  <div className="text-center mt-4">
                    {reportData.data.balanced ? (
                      <span className="text-green-600 font-semibold">✅ Balanced</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Unbalanced</span>
                    )}
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
