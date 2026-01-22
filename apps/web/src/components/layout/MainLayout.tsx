/**
 * Main Layout Component
 * Provides navigation and layout structure for the entire application
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  {
    name: 'Accounting',
    href: '/accounting',
    icon: '📚',
    children: [
      { name: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: '📋' },
      { name: 'Journal Entries', href: '/accounting/journal-entries', icon: '📝' },
      { name: 'General Ledger', href: '/accounting/general-ledger', icon: '📖' },
    ],
  },
  {
    name: 'Invoicing',
    href: '/invoicing',
    icon: '🧾',
    children: [
      { name: 'Sales Invoices', href: '/invoicing/sales', icon: '💰' },
      { name: 'Purchase Invoices', href: '/invoicing/purchases', icon: '🛒' },
    ],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: '📈',
    children: [
      { name: 'Trial Balance', href: '/reports/trial-balance', icon: '⚖️' },
      { name: 'Income Statement', href: '/reports/income-statement', icon: '📊' },
      { name: 'Balance Sheet', href: '/reports/balance-sheet', icon: '📄' },
      { name: 'Cash Flow', href: '/reports/cash-flow', icon: '💵' },
    ],
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: '👥',
    children: [
      { name: 'Customers', href: '/contacts/customers', icon: '🙋' },
      { name: 'Vendors', href: '/contacts/vendors', icon: '🤝' },
    ],
  },
  { name: 'Audit Trail', href: '/audit', icon: '🔍' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Accounting', 'Reports', 'Invoicing', 'Contacts']);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-indigo-600">TALA</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Dev Tenant</span>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                DU
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Overlay - Close sidebar when clicked */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 top-16',
            sidebarOpen ? 'w-64' : 'w-0'
          )}
        >
          <nav className="h-full overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                        isActive(item.href)
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </span>
                      <svg
                        className={cn(
                          'h-5 w-5 transition-transform',
                          expandedMenus.includes(item.name) && 'transform rotate-90'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {expandedMenus.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'flex items-center px-3 py-2 text-sm rounded-md',
                              isActive(child.href)
                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            <span className="mr-3">{child.icon}</span>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive(item.href)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            sidebarOpen ? 'ml-64' : 'ml-0'
          )}
        >
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
