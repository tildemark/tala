'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReportType = 'trial-balance' | 'income-statement' | 'balance-sheet' | 'cash-flow';

interface ReportData {
  success: boolean;
  data: any;
  cached: boolean;
  cacheKey: string;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('trial-balance');
  const [period, setPeriod] = useState<string>('2025-01');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [skipCache, setSkipCache] = useState(false);

  // Generate available periods (last 12 months from current)
  const generatePeriods = () => {
    const periods: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      periods.push(`${year}-${month}`);
    }
    return periods;
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const endpoint =
        reportType === 'trial-balance'
          ? `/api/reports/trial-balance?period=${period}&skipCache=${skipCache}`
          : reportType === 'income-statement'
            ? `/api/reports/income-statement?period=${period}&skipCache=${skipCache}`
            : reportType === 'balance-sheet'
              ? `/api/reports/balance-sheet?period=${period}&skipCache=${skipCache}`
              : `/api/reports/cash-flow?period=${period}&skipCache=${skipCache}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

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

    let csv = '';
    const report = reportData.data;

    if (reportType === 'trial-balance') {
      csv = `Trial Balance Report\nPeriod: ${report.period}\nAs Of: ${report.asOf}\n\n`;
      csv += `Account Code,Account Name,Account Type,Debit,Credit,Balance\n`;
      for (const account of report.accounts) {
        csv += `${account.accountCode},"${account.accountName}",${account.accountType},${account.debit},${account.credit},${account.balance}\n`;
      }
      csv += `\nTotal Debits: ${report.totalDebits}\nTotal Credits: ${report.totalCredits}\nBalanced: ${report.balanced}\n`;
    } else if (reportType === 'income-statement') {
      csv = `Income Statement\nPeriod: ${report.period}\n\n`;
      csv += `Revenue,,${report.revenue.totalRevenue}\n`;
      csv += `Operating Revenue,${report.revenue.operatingRevenue}\n`;
      csv += `Other Income,${report.revenue.otherIncome}\n`;
      csv += `\nExpenses,,${report.expenses.totalExpenses}\n`;
      csv += `Cost of Goods Sold,${report.expenses.costOfGoodsSold}\n`;
      csv += `Operating Expenses,${report.expenses.operatingExpenses}\n`;
      csv += `Other Expenses,${report.expenses.otherExpenses}\n`;
      csv += `\nGross Profit,,${report.expenses.grossProfit}\n`;
      csv += `Net Income,,${report.netIncome}\n`;
      csv += `Income Tax (${report.taxRate * 100}%),,${report.incomeTaxExpense}\n`;
      csv += `Net Income After Tax,,${report.netIncomeAfterTax}\n`;
    } else if (reportType === 'balance-sheet') {
      csv = `Balance Sheet\nAs Of: ${report.asOf}\n\n`;
      csv += `ASSETS\n`;
      csv += `Current Assets,,${report.assets.currentAssets.totalCurrentAssets}\n`;
      csv += `Cash,${report.assets.currentAssets.cash}\n`;
      csv += `Accounts Receivable,${report.assets.currentAssets.accountsReceivable}\n`;
      csv += `Inventory,${report.assets.currentAssets.inventory}\n`;
      csv += `Fixed Assets,,${report.assets.fixedAssets.totalFixedAssets}\n`;
      csv += `PPE,${report.assets.fixedAssets.propertyPlantEquipment}\n`;
      csv += `Accumulated Depreciation,${report.assets.fixedAssets.accumulatedDepreciation}\n`;
      csv += `Total Assets,,${report.assets.totalAssets}\n`;
      csv += `\nLIABILITIES & EQUITY\n`;
      csv += `Current Liabilities,,${report.liabilities.currentLiabilities.totalCurrentLiabilities}\n`;
      csv += `Accounts Payable,${report.liabilities.currentLiabilities.accountsPayable}\n`;
      csv += `Total Liabilities,,${report.liabilities.totalLiabilities}\n`;
      csv += `Total Equity,,${report.equity.totalEquity}\n`;
      csv += `Total Liab. & Equity,,${report.totalLiabilitiesAndEquity}\n`;
      csv += `Balanced,${report.balanced}\n`;
    } else if (reportType === 'cash-flow') {
      csv = `Cash Flow Statement\nPeriod: ${report.period}\n\n`;
      csv += `Operating Activities\n`;
      csv += `Net Income,${report.operatingActivities.netIncome}\n`;
      csv += `Depreciation,${report.operatingActivities.depreciation}\n`;
      csv += `Change in AR,${report.operatingActivities.changeInAccountsReceivable}\n`;
      csv += `Change in Inventory,${report.operatingActivities.changeInInventory}\n`;
      csv += `Change in AP,${report.operatingActivities.changeInAccountsPayable}\n`;
      csv += `Total Operating Cash Flow,${report.operatingActivities.totalOperatingCashFlow}\n`;
      csv += `\nInvesting Activities\n`;
      csv += `Total Investing Cash Flow,${report.investingActivities.totalInvestingCashFlow}\n`;
      csv += `\nFinancing Activities\n`;
      csv += `Total Financing Cash Flow,${report.financingActivities.totalFinancingCashFlow}\n`;
      csv += `\nNet Change in Cash,${report.netChangeInCash}\n`;
      csv += `Opening Cash,${report.openingCash}\n`;
      csv += `Closing Cash,${report.closingCash}\n`;
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToPDF = () => {
    alert('PDF export coming soon! Export to CSV for now.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
          <p className="mt-2 text-slate-600">
            Generate trial balance, income statement, balance sheet, and cash flow statements
          </p>
        </div>
      </div>

      {/* Report Selector */}
      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Type
                </label>
                <Select
                  value={reportType}
                  onValueChange={(val) => setReportType(val as ReportType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial-balance">Trial Balance</SelectItem>
                    <SelectItem value="income-statement">Income Statement</SelectItem>
                    <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                    <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Period (YYYY-MM)
                </label>
                <Select
                  value={period}
                  onValueChange={setPeriod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatePeriods().map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cache Options
                </label>
                <div className="flex items-center space-x-2 pt-2">
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
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={fetchReport} disabled={loading} className="flex-1">
              Generate Report
            </Button>
            {reportData && (
              <>
                <Button
                  onClick={exportToCSV}
                  variant="secondary"
                  className="flex-1"
                >
                  📥 Export CSV
                </Button>
                <Button
                  onClick={exportToPDF}
                  variant="secondary"
                  className="flex-1"
                >
                  📄 Export PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Report Display */}
      {reportData && reportData.success && (
        <Card>
          <div className="space-y-6">
            {/* Report Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Period</p>
                  <p className="font-semibold text-slate-900">{reportData.data.period}</p>
                </div>
                <div>
                  <p className="text-slate-600">Source</p>
                  <p className="font-semibold text-slate-900">
                    {reportData.cached ? '⚡ Cached' : '🔄 Fresh'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Cache Key</p>
                  <p className="font-mono text-xs text-slate-600 break-all">
                    {reportData.cacheKey}
                  </p>
                </div>
              </div>
            </div>

            {/* Report Content - Trial Balance */}
            {reportType === 'trial-balance' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Trial Balance</h3>
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
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        >
                          <td className="px-4 py-2 font-mono">{account.accountCode}</td>
                          <td className="px-4 py-2">{account.accountName}</td>
                          <td className="px-4 py-2 text-right">{account.debit.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{account.credit.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {account.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
                      <tr>
                        <td colSpan={2} className="px-4 py-2">
                          Total
                        </td>
                        <td className="px-4 py-2 text-right">
                          {reportData.data.totalDebits.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {reportData.data.totalCredits.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {reportData.data.balanced ? '✅ Balanced' : '❌ Unbalanced'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Report Content - Income Statement */}
            {reportType === 'income-statement' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Income Statement (Profit & Loss)
                </h3>
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between py-2 border-b">
                      <span>Operating Revenue</span>
                      <span className="font-semibold">
                        ₱{reportData.data.revenue.operatingRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Other Income</span>
                      <span className="font-semibold">
                        ₱{reportData.data.revenue.otherIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 bg-blue-50 font-semibold border-b-2">
                      <span>Total Revenue</span>
                      <span>₱{reportData.data.revenue.totalRevenue.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b text-red-600">
                      <span>Cost of Goods Sold</span>
                      <span>
                        (₱{reportData.data.expenses.costOfGoodsSold.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between py-2 bg-blue-50 font-semibold border-b-2">
                      <span>Gross Profit</span>
                      <span>₱{reportData.data.expenses.grossProfit.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b text-red-600">
                      <span>Operating Expenses</span>
                      <span>
                        (₱{reportData.data.expenses.operatingExpenses.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b text-red-600">
                      <span>Other Expenses</span>
                      <span>
                        (₱{reportData.data.expenses.otherExpenses.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between py-2 bg-green-50 font-semibold border-b-2">
                      <span>Net Income (Operating)</span>
                      <span>₱{reportData.data.netIncome.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b text-red-600">
                      <span>Income Tax ({(reportData.data.taxRate * 100).toFixed(0)}%)</span>
                      <span>
                        (₱{reportData.data.incomeTaxExpense.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between py-2 bg-green-100 font-bold text-lg">
                      <span>Net Income After Tax</span>
                      <span>₱{reportData.data.netIncomeAfterTax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report Content - Balance Sheet */}
            {reportType === 'balance-sheet' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Balance Sheet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-900 mb-4 pb-2 border-b-2">ASSETS</h4>
                    <div className="space-y-2 text-sm">
                      <div className="font-semibold text-slate-700 mb-2">Current Assets</div>
                      <div className="flex justify-between ml-4">
                        <span>Cash</span>
                        <span>
                          ₱{reportData.data.assets.currentAssets.cash.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between ml-4">
                        <span>Accounts Receivable</span>
                        <span>
                          ₱
                          {reportData.data.assets.currentAssets.accountsReceivable.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between ml-4 mb-2">
                        <span>Inventory</span>
                        <span>
                          ₱{reportData.data.assets.currentAssets.inventory.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-2 rounded">
                        <span>Total Current Assets</span>
                        <span className="font-semibold">
                          ₱
                          {reportData.data.assets.currentAssets.totalCurrentAssets.toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-700 mt-4 mb-2">Fixed Assets</div>
                      <div className="flex justify-between ml-4">
                        <span>PPE</span>
                        <span>
                          ₱
                          {reportData.data.assets.fixedAssets.propertyPlantEquipment.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between ml-4 mb-2">
                        <span>Less: Accumulated Depreciation</span>
                        <span>
                          (₱
                          {reportData.data.assets.fixedAssets.accumulatedDepreciation.toFixed(
                            2
                          )}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-2 rounded">
                        <span>Total Assets</span>
                        <span className="font-bold">
                          ₱{reportData.data.assets.totalAssets.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-900 mb-4 pb-2 border-b-2">
                      LIABILITIES & EQUITY
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="font-semibold text-slate-700 mb-2">Current Liabilities</div>
                      <div className="flex justify-between ml-4">
                        <span>Accounts Payable</span>
                        <span>
                          ₱
                          {reportData.data.liabilities.currentLiabilities.accountsPayable.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between ml-4 mb-2">
                        <span>Accrued Expenses</span>
                        <span>
                          ₱
                          {reportData.data.liabilities.currentLiabilities.accruedExpenses.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between bg-red-50 p-2 rounded">
                        <span>Total Liabilities</span>
                        <span className="font-semibold">
                          ₱{reportData.data.liabilities.totalLiabilities.toFixed(2)}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-700 mt-4 mb-2">Equity</div>
                      <div className="flex justify-between ml-4">
                        <span>Capital Stock</span>
                        <span>
                          ₱{reportData.data.equity.capitalStock.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between ml-4 mb-2">
                        <span>Retained Earnings</span>
                        <span>
                          ₱{reportData.data.equity.retainedEarnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between bg-green-50 p-2 rounded mb-2">
                        <span>Total Equity</span>
                        <span className="font-semibold">
                          ₱{reportData.data.equity.totalEquity.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between bg-blue-50 p-2 rounded border-2">
                        <span className="font-bold">Total Liab. & Equity</span>
                        <span className="font-bold">
                          ₱{reportData.data.totalLiabilitiesAndEquity.toFixed(2)}
                        </span>
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
            )}

            {/* Report Content - Cash Flow */}
            {reportType === 'cash-flow' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow Statement</h3>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="font-bold text-slate-900 mb-2">Operating Activities</div>
                      <div className="ml-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Net Income</span>
                          <span>
                            ₱
                            {reportData.data.operatingActivities.netIncome.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Depreciation</span>
                          <span>
                            ₱
                            {reportData.data.operatingActivities.depreciation.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Change in AR</span>
                          <span>
                            ₱
                            {reportData.data.operatingActivities.changeInAccountsReceivable.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Change in Inventory</span>
                          <span>
                            ₱
                            {reportData.data.operatingActivities.changeInInventory.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-semibold">Operating Cash Flow</span>
                          <span className="font-semibold bg-blue-50 px-2 py-1 rounded">
                            ₱
                            {reportData.data.operatingActivities.totalOperatingCashFlow.toFixed(
                              2
                            )}
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
                            ₱
                            {reportData.data.investingActivities.totalInvestingCashFlow.toFixed(
                              2
                            )}
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
                            ₱
                            {reportData.data.financingActivities.totalFinancingCashFlow.toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex justify-between mb-2">
                        <span>Opening Cash Balance</span>
                        <span>₱{reportData.data.openingCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2 border-b pb-2">
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
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
