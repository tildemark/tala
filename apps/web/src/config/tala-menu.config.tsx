import {
  LayoutDashboard,
  FileText,
  BookOpen,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  Settings,
  Shield,
  Activity,
} from 'lucide-react';
import { MenuConfig } from '@/config/types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  { heading: 'Accounting' },
  {
    title: 'Chart of Accounts',
    icon: BookOpen,
    path: '/accounting/chart-of-accounts',
  },
  {
    title: 'Journal Entries',
    icon: FileText,
    path: '/accounting/journal-entries',
  },
  {
    title: 'General Ledger',
    icon: Activity,
    path: '/accounting/general-ledger',
  },
  { heading: 'Invoicing' },
  {
    title: 'Sales Invoices',
    icon: Receipt,
    path: '/invoicing/sales',
  },
  {
    title: 'Purchase Invoices',
    icon: Receipt,
    path: '/invoicing/purchases',
  },
  { heading: 'Reports' },
  {
    title: 'Trial Balance',
    icon: TrendingUp,
    path: '/reports/trial-balance',
  },
  {
    title: 'Income Statement',
    icon: TrendingUp,
    path: '/reports/income-statement',
  },
  {
    title: 'Balance Sheet',
    icon: TrendingUp,
    path: '/reports/balance-sheet',
  },
  {
    title: 'Cash Flow Statement',
    icon: TrendingUp,
    path: '/reports/cash-flow',
  },
  { heading: 'Contacts' },
  {
    title: 'Customers',
    icon: Users,
    path: '/contacts/customers',
  },
  {
    title: 'Vendors',
    icon: Building2,
    path: '/contacts/vendors',
  },
  { heading: 'System' },
  {
    title: 'Audit Trail',
    icon: Shield,
    path: '/audit',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];
