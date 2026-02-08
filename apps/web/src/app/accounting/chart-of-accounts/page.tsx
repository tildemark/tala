/**
 * Chart of Accounts Page
 * Manage the general ledger account structure
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

interface ChartOfAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: boolean;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '',
    debitBalance: true,
  });

  const accountTypes = [
    { value: 'Asset', label: 'Asset' },
    { value: 'Liability', label: 'Liability' },
    { value: 'Equity', label: 'Equity' },
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Expense', label: 'Expense' },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chart-of-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3001/api/chart-of-accounts/${editingId}`
        : 'http://localhost:3001/api/chart-of-accounts';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAccounts();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          accountCode: '',
          accountName: '',
          accountType: '',
          debitBalance: true,
        });
        alert(`Account ${editingId ? 'updated' : 'created'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save account'}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert(`Failed to save account: ${error}`);
    }
  };

  const handleEdit = (account: ChartOfAccount) => {
    setFormData({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debitBalance: account.debitBalance,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      accountCode: '',
      accountName: '',
      accountType: '',
      debitBalance: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/chart-of-accounts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAccounts();
        alert('Account deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting account: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error}`);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || account.accountType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-4xl font-bold text-tala-primary">Chart of Accounts</h1>
          <p className="text-slate-600 mt-2">Manage your general ledger account structure</p>
        </div>
        <Button onClick={() => editingId ? handleCancel() : setShowForm(!showForm)} className="bg-tala-primary hover:bg-tala-primary/90">
          {showForm ? '✕ Cancel' : '+ New Account'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-tala-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <CardTitle className="text-tala-primary">
              {editingId ? `Edit Account: ${formData.accountName || 'Loading...'}` : 'Create New Account'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update account details' : 'Add a new account to your chart of accounts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Code"
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  placeholder="e.g., 1000"
                  required
                />
                <Input
                  label="Account Name"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Cash in Bank"
                  required
                />
                <Select
                  label="Account Type"
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  options={accountTypes}
                  required
                />
                <Select
                  label="Normal Balance"
                  value={formData.debitBalance ? 'debit' : 'credit'}
                  onChange={(e) => setFormData({ ...formData, debitBalance: e.target.value === 'debit' })}
                  options={[
                    { value: 'debit', label: 'Debit' },
                    { value: 'credit', label: 'Credit' },
                  ]}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => handleCancel()}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-tala-primary hover:bg-tala-primary/90">
                  {editingId ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="🔍 Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...accountTypes,
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card className="border-slate-200 bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
          <CardTitle className="text-tala-primary">Accounts ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No accounts found. Create your first account to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-tala-primary/20 hover:bg-slate-50">
                  <TableHead className="font-bold text-tala-primary">Code</TableHead>
                  <TableHead className="font-bold text-tala-primary">Account Name</TableHead>
                  <TableHead className="font-bold text-tala-primary">Type</TableHead>
                  <TableHead className="font-bold text-tala-primary">Balance</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Current Balance</TableHead>
                  <TableHead className="font-bold text-tala-primary">Status</TableHead>
                  <TableHead className="font-bold text-tala-primary text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => {
                  const typeColors: { [key: string]: string } = {
                    Asset: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
                    Liability: 'bg-red-100 text-red-800 border-l-4 border-red-500',
                    Equity: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
                    Revenue: 'bg-green-100 text-green-800 border-l-4 border-green-500',
                    Expense: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500',
                  };
                  
                  const typeColor = typeColors[account.accountType as keyof typeof typeColors] || 'bg-slate-100 text-slate-800';

                  return (
                    <TableRow key={account.id} className="border-b border-slate-200 hover:bg-tala-primary/5 transition-colors">
                      <TableCell className="font-bold text-slate-900">{account.accountCode}</TableCell>
                      <TableCell className="font-medium text-slate-800">{account.accountName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                          {account.accountType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          account.debitBalance 
                            ? 'bg-slate-200 text-slate-700' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {account.debitBalance ? '↓ Debit' : '↑ Credit'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {formatCurrency(0)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            account.isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {account.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(account)} title="Edit" className="hover:bg-tala-primary/10 text-tala-primary">
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(account.id)}
                            title="Delete"
                            className="hover:bg-red-100 text-red-600"
                          >
                            🗑️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
