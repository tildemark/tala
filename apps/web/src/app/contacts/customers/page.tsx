/**
 * Customers Page
 * Manage customer relationships and contact information
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  customerType: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    customerType: 'individual',
    contactEmail: '',
    contactPhone: '',
    city: '',
    creditLimit: 0,
    address: '',
    province: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchCustomers();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3001/api/customers/${editingId}`
        : 'http://localhost:3001/api/customers';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCustomers();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          customerType: 'individual',
          contactEmail: '',
          contactPhone: '',
          city: '',
          creditLimit: 0,
          address: '',
          province: '',
          zipCode: '',
        });
        alert(`Customer ${editingId ? 'updated' : 'created'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save customer'}`);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Failed to save customer: ${error}`);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      customerType: customer.customerType,
      contactEmail: customer.contactEmail || '',
      contactPhone: customer.contactPhone || '',
      city: customer.city || '',
      creditLimit: customer.creditLimit,
      address: '',
      province: '',
      zipCode: '',
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      customerType: 'individual',
      contactEmail: '',
      contactPhone: '',
      city: '',
      creditLimit: 0,
      address: '',
      province: '',
      zipCode: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCustomers();
        alert('Customer deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting customer: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(`Failed to delete customer: ${error}`);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || customer.customerType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-4xl font-bold text-tala-primary">Customers</h1>
          <p className="text-slate-600 mt-2">Manage your customer relationships</p>
        </div>
        <Button onClick={() => editingId ? handleCancel() : setShowForm(!showForm)} className="bg-tala-primary hover:bg-tala-primary/90">
          {showForm ? '✕ Cancel' : '+ New Customer'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-tala-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <CardTitle className="text-tala-primary">
              {editingId ? `Edit Customer: ${formData.name || 'Loading...'}` : 'Add New Customer'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update customer details' : 'Create a new customer record'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., ABC Corporation"
                  required
                />
                <Select
                  label="Customer Type"
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  options={[
                    { value: 'individual', label: 'Individual' },
                    { value: 'corporate', label: 'Corporate' },
                    { value: 'ngo', label: 'NGO' },
                  ]}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@company.com"
                />
                <Input
                  label="Phone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+63-2-1234-5678"
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Manila"
                />
                <Input
                  label="Credit Limit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => handleCancel()}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-tala-primary hover:bg-tala-primary/90">
                  {editingId ? 'Update Customer' : 'Create Customer'}
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
            <Input
              placeholder="🔍 Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'individual', label: 'Individual' },
                { value: 'corporate', label: 'Corporate' },
                { value: 'ngo', label: 'NGO' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-slate-200 bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
          <CardTitle className="text-tala-primary">Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No customers found. Create your first customer to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-tala-primary/20 hover:bg-slate-50">
                  <TableHead className="font-bold text-tala-primary">Name</TableHead>
                  <TableHead className="font-bold text-tala-primary">Type</TableHead>
                  <TableHead className="font-bold text-tala-primary">Email</TableHead>
                  <TableHead className="font-bold text-tala-primary">Phone</TableHead>
                  <TableHead className="font-bold text-tala-primary">City</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Credit Limit</TableHead>
                  <TableHead className="text-right font-bold text-tala-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-b border-slate-200 hover:bg-tala-primary/5 transition-colors">
                    <TableCell className="font-bold text-slate-900">{customer.name}</TableCell>
                    <TableCell className="capitalize text-slate-700">{customer.customerType}</TableCell>
                    <TableCell className="text-slate-700">{customer.contactEmail || '-'}</TableCell>
                    <TableCell className="text-slate-700">{customer.contactPhone || '-'}</TableCell>
                    <TableCell className="text-slate-700">{customer.city || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      ₱{customer.creditLimit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(customer)} title="Edit" className="hover:bg-tala-primary/10 text-tala-primary">
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          title="Delete"
                          className="hover:bg-red-100 text-red-600"
                        >
                          🗑️
                        </Button>
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
