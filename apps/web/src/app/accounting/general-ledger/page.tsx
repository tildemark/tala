/**
 * General Ledger Page
 * View detailed account transactions and running balances
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ChartOfAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  normalBalance: string;
  isActive: boolean;
}

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerData {
  account: ChartOfAccount;
  openingBalance: number;
  entries: LedgerEntry[];
  closingBalance: number;
}

export default function GeneralLedgerPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch all accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch ledger data when account is selected
  useEffect(() => {
    if (selectedAccountId && ledgerData === null) {
      fetchLedgerData();
    } else if (selectedAccountId && ledgerData) {
      fetchLedgerData();
    }
  }, [selectedAccountId, startDate, endDate]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/chart-of-accounts');
      if (response.ok) {
        const data = await response.json();
        const accountList = data.data || [];
        setAccounts(accountList);
        // Auto-select first active account
        const firstActive = accountList.find((acc: ChartOfAccount) => acc.isActive);
        if (firstActive) {
          setSelectedAccountId(firstActive.id);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgerData = async () => {
    if (!selectedAccountId) return;

    try {
      const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
      if (!selectedAccount) return;

      // Fetch actual ledger data from API
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `http://localhost:3001/api/general-ledger/${selectedAccountId}?${params.toString()}`
      );

      if (response.ok) {
        const result = await response.json();
        const ledgerEntries = result.data.entries || [];

        setLedgerData({
          account: selectedAccount,
          openingBalance: result.data.openingBalance,
          entries: ledgerEntries,
          closingBalance: result.data.closingBalance,
        });
      } else {
        console.error('Error fetching ledger data');
        // Fallback to mock data if API fails
        setLedgerData({
          account: selectedAccount,
          openingBalance: 50000,
          entries: [],
          closingBalance: 50000,
        });
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      // Fallback to empty state on error
      const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
      if (selectedAccount) {
        setLedgerData({
          account: selectedAccount,
          openingBalance: 50000,
          entries: [],
          closingBalance: 50000,
        });
      }
    }
  };

  const accountOptions = [
    { value: '', label: '📊 Select Account' },
    ...accounts.map((account) => ({
      value: account.id,
      label: `${account.accountCode} - ${account.accountName}`,
    })),
  ];

  const handleAccountChange = (value: string) => {
    // Only update if a valid account is selected (not empty)
    if (value) {
      setSelectedAccountId(value);
    }
    // If empty, keep the previous ledgerData displayed
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Asset: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
      Liability: 'bg-red-100 text-red-800 border-l-4 border-red-500',
      Equity: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
      Revenue: 'bg-green-100 text-green-800 border-l-4 border-green-500',
      Expense: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500',
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tala-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-tala-primary">General Ledger</h1>
        <p className="text-slate-600 mt-2">View detailed transactions and balances for each account</p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={selectedAccountId}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value || 'none'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Account Selected Message */}
      {!ledgerData && !loading && (
        <Card className="border-slate-300 bg-slate-50 shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 text-lg">📝 Select an account from the dropdown above to view its ledger entries</p>
          </CardContent>
        </Card>
      )}

      {/* Account Summary */}
      {ledgerData && (
        <Card className="border-tala-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-tala-primary text-2xl">{ledgerData.account.accountName}</CardTitle>
                <CardDescription className="mt-1">
                  Code: {ledgerData.account.accountCode} • Type: {ledgerData.account.accountType}
                </CardDescription>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getTypeColor(ledgerData.account.accountType)}`}>
                {ledgerData.account.accountType}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-medium">Opening Balance</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(ledgerData.openingBalance)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{ledgerData.entries.length - 1}</p>
              </div>
              <div className="bg-tala-primary/10 p-4 rounded-lg border border-tala-primary/20">
                <p className="text-sm text-tala-primary font-bold">Closing Balance</p>
                <p className="text-2xl font-bold text-tala-primary mt-1">{formatCurrency(ledgerData.closingBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger Entries */}
      {ledgerData && (
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <CardTitle className="text-tala-primary">Ledger Entries ({ledgerData.entries.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-tala-primary/20 hover:bg-slate-50">
                  <TableHead className="font-bold text-tala-primary">Date</TableHead>
                  <TableHead className="font-bold text-tala-primary">Reference</TableHead>
                  <TableHead className="font-bold text-tala-primary">Description</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Debit</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Credit</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerData.entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-b border-slate-200 hover:bg-tala-primary/5 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-mono text-slate-700">{entry.reference}</TableCell>
                    <TableCell className="text-slate-800">{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 ? (
                        <span className="font-bold text-green-700">{formatCurrency(entry.debit)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 ? (
                        <span className="font-bold text-red-700">{formatCurrency(entry.credit)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 bg-slate-50">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {ledgerData && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 font-medium">Total Debits</p>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {formatCurrency(
                    ledgerData.entries.reduce((sum, entry) => sum + entry.debit, 0)
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-slate-600 font-medium">Total Credits</p>
                <p className="text-xl font-bold text-red-700 mt-1">
                  {formatCurrency(
                    ledgerData.entries.reduce((sum, entry) => sum + entry.credit, 0)
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-600 font-medium">Net Change</p>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {formatCurrency(
                    ledgerData.entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0)
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-tala-primary/10 rounded-lg border border-tala-primary/20">
                <p className="text-sm text-tala-primary font-medium">Final Balance</p>
                <p className="text-xl font-bold text-tala-primary mt-1">{formatCurrency(ledgerData.closingBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
