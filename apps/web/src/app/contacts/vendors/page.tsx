/**
 * Vendors Page
 * Manage vendor relationships and contact information
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface Vendor {
  id: string;
  name: string;
  vendorType: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    vendorType: 'supplier',
    contactEmail: '',
    contactPhone: '',
    city: '',
    address: '',
    province: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3001/api/vendors/${editingId}`
        : 'http://localhost:3001/api/vendors';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchVendors();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          vendorType: 'supplier',
          contactEmail: '',
          contactPhone: '',
          city: '',
          address: '',
          province: '',
          zipCode: '',
        });
        alert(`Vendor ${editingId ? 'updated' : 'created'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save vendor'}`);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert(`Failed to save vendor: ${error}`);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      vendorType: vendor.vendorType,
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
      city: vendor.city || '',
      address: '',
      province: '',
      zipCode: '',
    });
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      vendorType: 'supplier',
      contactEmail: '',
      contactPhone: '',
      city: '',
      address: '',
      province: '',
      zipCode: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/vendors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchVendors();
        alert('Vendor deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting vendor: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert(`Failed to delete vendor: ${error}`);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || vendor.vendorType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-4xl font-bold text-tala-primary">Vendors</h1>
          <p className="text-slate-600 mt-2">Manage your vendor relationships</p>
        </div>
        <Button onClick={() => editingId ? handleCancel() : setShowForm(!showForm)} className="bg-tala-primary hover:bg-tala-primary/90">
          {showForm ? '✕ Cancel' : '+ New Vendor'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-tala-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
            <CardTitle className="text-tala-primary">
              {editingId ? `Edit Vendor: ${formData.name || 'Loading...'}` : 'Add New Vendor'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update vendor details' : 'Create a new vendor record'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vendor Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Superior Supplies"
                  required
                />
                <Select
                  label="Vendor Type"
                  value={formData.vendorType}
                  onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                  options={[
                    { value: 'supplier', label: 'Supplier' },
                    { value: 'contractor', label: 'Contractor' },
                    { value: 'service_provider', label: 'Service Provider' },
                  ]}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@vendor.com"
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
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => handleCancel()}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-tala-primary hover:bg-tala-primary/90">
                  {editingId ? 'Update Vendor' : 'Create Vendor'}
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
                { value: 'supplier', label: 'Supplier' },
                { value: 'contractor', label: 'Contractor' },
                { value: 'service_provider', label: 'Service Provider' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="border-slate-200 bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5 border-b border-tala-primary/10">
          <CardTitle className="text-tala-primary">Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No vendors found. Create your first vendor to get started.</p>
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
                  <TableHead className="text-right font-bold text-tala-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="border-b border-slate-200 hover:bg-tala-primary/5 transition-colors">
                    <TableCell className="font-bold text-slate-900">{vendor.name}</TableCell>
                    <TableCell className="capitalize text-slate-700">{vendor.vendorType.replace('_', ' ')}</TableCell>
                    <TableCell className="text-slate-700">{vendor.contactEmail || '-'}</TableCell>
                    <TableCell className="text-slate-700">{vendor.contactPhone || '-'}</TableCell>
                    <TableCell className="text-slate-700">{vendor.city || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(vendor)} title="Edit" className="hover:bg-tala-primary/10 text-tala-primary">
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(vendor.id)}
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
