/**
 * Contacts Hub
 * Central management of customers and vendors
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactsPage() {
  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-tala-primary">Contacts</h1>
        <p className="text-slate-600 mt-2">Manage your customers and vendors</p>
      </div>

      {/* Contact Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customers Card */}
        <Link href="/contacts/customers">
          <Card className="border-slate-200 bg-white shadow-md hover:shadow-lg hover:border-tala-primary/30 transition-all cursor-pointer h-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="text-blue-900 text-2xl">👥 Customers</CardTitle>
              <CardDescription className="text-blue-700">Manage customer relationships</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-600">
                Create, edit, and manage your customer database. Track credit limits, contact information, and customer types.
              </p>
              <div className="mt-4 flex items-center text-tala-primary font-semibold">
                Manage Customers →
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Vendors Card */}
        <Link href="/contacts/vendors">
          <Card className="border-slate-200 bg-white shadow-md hover:shadow-lg hover:border-tala-primary/30 transition-all cursor-pointer h-full">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-orange-900 text-2xl">🏢 Vendors</CardTitle>
              <CardDescription className="text-orange-700">Manage vendor relationships</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-600">
                Create, edit, and manage your vendor database. Track vendor types, payment terms, and contact information.
              </p>
              <div className="mt-4 flex items-center text-tala-primary font-semibold">
                Manage Vendors →
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info Section */}
      <Card className="border-tala-primary/20 bg-gradient-to-r from-tala-primary/5 to-tala-secondary/5">
        <CardHeader>
          <CardTitle className="text-tala-primary">Contact Management</CardTitle>
          <CardDescription>Organized contact management for your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-tala-primary font-bold mt-1">✓</span>
            <div>
              <p className="font-semibold text-slate-900">Customer Management</p>
              <p className="text-slate-600 text-sm">Add and maintain customer records with credit limits and payment terms</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tala-primary font-bold mt-1">✓</span>
            <div>
              <p className="font-semibold text-slate-900">Vendor Management</p>
              <p className="text-slate-600 text-sm">Manage supplier and vendor information for procurement</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tala-primary font-bold mt-1">✓</span>
            <div>
              <p className="font-semibold text-slate-900">Full CRUD Operations</p>
              <p className="text-slate-600 text-sm">Create, read, update, and delete contacts as needed</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tala-primary font-bold mt-1">✓</span>
            <div>
              <p className="font-semibold text-slate-900">Search & Filter</p>
              <p className="text-slate-600 text-sm">Quickly find customers and vendors by name, type, or contact info</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
