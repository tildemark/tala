/**
 * Sales Invoices Page
 * Create, manage, and track sales invoices
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
}

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    paymentTerms: 'Net 30',
  });

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : customerId;
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/invoices?type=sales');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sales',
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchInvoices();
        setShowForm(false);
        setFormData({
          customerId: '',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{ description: '', quantity: 1, unitPrice: 0 }],
          notes: '',
          paymentTerms: 'Net 30',
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'cash' }),
      });

      if (response.ok) {
        await fetchInvoices();
        alert('Invoice marked as paid!');
      } else {
        alert('Error marking invoice as paid');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchInvoices();
        alert('Invoice deleted successfully!');
      } else {
        alert('Error deleting invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-slate-100 text-slate-800 border border-slate-300',
      sent: 'bg-blue-100 text-blue-800 border border-blue-300',
      paid: 'bg-green-100 text-green-800 border border-green-300',
      overdue: 'bg-red-100 text-red-800 border border-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-800';
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
        <h1 className="text-4xl font-bold text-tala-primary">Sales Invoices</h1>
        <p className="text-slate-600 mt-2">Create and manage customer invoices</p>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-tala-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <CardTitle className="text-tala-primary">Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.id})
                    </option>
                  ))}
                </select>
                <Input
                  label="Invoice Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Line Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].description = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="col-span-4"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="col-span-2"
                    />
                    <div className="col-span-2 flex items-end text-sm font-medium text-slate-700">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          items: formData.items.filter((_, i) => i !== index),
                        });
                      }}
                      className="col-span-2 text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
                    })
                  }
                >
                  + Add Line Item
                </Button>
              </div>

              <Input
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Invoice notes or memo"
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-tala-primary hover:bg-tala-primary/90">
                  Create Invoice
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="🔍 Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <Button onClick={() => setShowForm(!showForm)} className="bg-tala-primary hover:bg-tala-primary/90">
              {showForm ? '✕' : '+ New Invoice'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-slate-200 bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
          <CardTitle className="text-tala-primary">Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No invoices found. Create your first invoice to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-tala-primary/20">
                  <TableHead className="font-bold text-tala-primary">Invoice #</TableHead>
                  <TableHead className="font-bold text-tala-primary">Customer</TableHead>
                  <TableHead className="font-bold text-tala-primary">Date</TableHead>
                  <TableHead className="font-bold text-tala-primary">Due Date</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Amount</TableHead>
                  <TableHead className="font-bold text-tala-primary">Status</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-b border-slate-200 hover:bg-tala-primary/5">
                    <TableCell className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-slate-700">{getCustomerName(invoice.customerId)}</TableCell>
                    <TableCell className="text-slate-700">{formatDate(invoice.date)}</TableCell>
                    <TableCell className="text-slate-700">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="ghost" title="Edit" className="hover:bg-tala-primary/10 text-tala-primary">
                            ✏️
                          </Button>
                        )}
                        {invoice.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkPaid(invoice.id)}
                            title="Mark as Paid"
                            className="hover:bg-green-100 text-green-600"
                          >
                            ✓
                          </Button>
                        )}
                        {invoice.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(invoice.id)}
                            title="Delete"
                            className="hover:bg-red-100 text-red-600"
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
