/**
 * Journal Entries Page
 * Create and manage double-entry accounting transactions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';

interface JournalEntry {
  id: string;
  journalNumber: string;
  entryDate: string;
  description: string;
  status: 'draft' | 'posted' | 'voided';
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  createdAt: string;
}

interface LineItem {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface ChartOfAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    referenceNo: '',
  });
  const [lineItems, setLineItems] = useState<Array<{
    accountId: string;
    debit: string;
    credit: string;
  }>>([
    { accountId: '', debit: '', credit: '' },
    { accountId: '', debit: '', credit: '' },
  ]);

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/journal-entries');
      if (response.ok) {
        const data = await response.json();
        const fetchedEntries = (data.data || []).map((entry: any) => ({
          id: entry.id,
          journalNumber: entry.journalNumber,
          entryDate: entry.entryDate,
          description: entry.description,
          status: entry.status || 'draft',
          totalDebit: entry.totalDebit || 0,
          totalCredit: entry.totalCredit || 0,
          isBalanced: Math.abs((entry.totalDebit || 0) - (entry.totalCredit || 0)) < 0.01,
          createdAt: entry.createdAt,
        }));
        setEntries(fetchedEntries);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chart-of-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { accountId: '', debit: '', credit: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 2) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const totalDebit = lineItems.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { totalDebit, totalCredit, difference } = calculateTotals();

    if (Math.abs(difference) > 0.01) {
      alert('Entry must balance! Debits and credits must be equal.');
      return;
    }

    const payload = {
      ...formData,
      items: lineItems
        .filter(item => item.accountId && (item.debit || item.credit))
        .map(item => ({
          accountId: item.accountId,
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
        })),
    };

    try {
      const response = await fetch('http://localhost:3001/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEntries();
        setShowForm(false);
        setFormData({
          entryDate: new Date().toISOString().split('T')[0],
          description: '',
          referenceNo: '',
        });
        setLineItems([
          { accountId: '', debit: '', credit: '' },
          { accountId: '', debit: '', credit: '' },
        ]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating journal entry:', error);
      alert('Failed to create journal entry');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      posted: 'bg-green-100 text-green-800',
      voided: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handlePostEntry = async (entryId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/journal-entries/${entryId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        await fetchEntries();
        alert('Journal entry posted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to post entry'}`);
      }
    } catch (error) {
      console.error('Error posting entry:', error);
      alert('Failed to post journal entry');
    }
  };

  const handleVoidEntry = async (entryId: string) => {
    const reason = prompt('Enter reason for voiding this entry:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3001/api/journal-entries/${entryId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        await fetchEntries();
        alert('Journal entry voided successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to void entry'}`);
      }
    } catch (error) {
      console.error('Error voiding entry:', error);
      alert('Failed to void journal entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/journal-entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEntries();
        alert('Journal entry deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete entry'}`);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete journal entry');
    }
  };

  const { totalDebit, totalCredit, difference } = calculateTotals();
  const isBalanced = Math.abs(difference) < 0.01;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Journal Entries</h1>
          <p className="text-slate-600 mt-1">Record double-entry accounting transactions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Entry'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Journal Entry</CardTitle>
            <CardDescription>Record a new double-entry transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Entry Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Entry Date</Label>
                  <Input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    placeholder="e.g., INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Line Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    + Add Line
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-slate-700">Account</th>
                        <th className="text-right p-3 font-medium text-slate-700">Debit</th>
                        <th className="text-right p-3 font-medium text-slate-700">Credit</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <select
                              value={item.accountId}
                              onChange={(e) => updateLineItem(index, 'accountId', e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                              required
                            >
                              <option value="">Select account...</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.accountCode} - {account.accountName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.debit}
                              onChange={(e) => updateLineItem(index, 'debit', e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-right"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.credit}
                              onChange={(e) => updateLineItem(index, 'credit', e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-right"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-2">
                            {lineItems.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-right">{formatCurrency(totalDebit)}</td>
                        <td className="p-3 text-right">{formatCurrency(totalCredit)}</td>
                        <td></td>
                      </tr>
                      {!isBalanced && (
                        <tr className="bg-red-50">
                          <td colSpan={4} className="p-3 text-red-700 text-sm">
                            ⚠️ Entry is out of balance by {formatCurrency(Math.abs(difference))}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isBalanced}>
                  Create Entry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Journal #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.journalNumber}</TableCell>
                  <TableCell>{formatDate(entry.entryDate)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.totalDebit)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.totalCredit)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" title="View">
                        👁️
                      </Button>
                      {entry.status === 'draft' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handlePostEntry(entry.id)} title="Post">
                            ✓
                          </Button>
                          <Button size="sm" variant="ghost" title="Edit">
                            ✏️
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteEntry(entry.id)} title="Delete" className="text-red-600">
                            🗑️
                          </Button>
                        </>
                      )}
                      {entry.status === 'posted' && (
                        <Button size="sm" variant="ghost" onClick={() => handleVoidEntry(entry.id)} title="Void" className="text-red-600">
                          ✕
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
