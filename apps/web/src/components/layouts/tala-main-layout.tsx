'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TALAMainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: '📑' },
    { label: 'Journal Entries', href: '/accounting/journal-entries', icon: '📝' },
    { label: 'General Ledger', href: '/accounting/general-ledger', icon: '📖' },
    { label: 'Trial Balance', href: '/accounting/trial-balance', icon: '⚖️' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-card border-r border-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-center">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-primary">TALA</h1>
            ) : (
              <span className="text-2xl">🧮</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                'hover:bg-secondary text-foreground'
              )}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-secondary"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-foreground">TALA Accounting System</h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
