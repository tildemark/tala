/**
 * Comprehensive 2025 Seed Data with Audit Trail
 * Complete dataset for development including journal entries, invoices, and audit logs
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface AuditLog {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  description?: string;
  createdAt: string;
  previousHash?: string | null;
  dataHash?: string;
  hashVerified?: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  changesBefore?: Record<string, unknown>;
  changesAfter?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

const computeAuditDataHash = (
  previousHash: string | null,
  entityType: string,
  entityId: string,
  action: string,
  createdAt: string,
  userId: string
): string => {
  const payload = `${previousHash || ''}${entityType}${entityId}${action}${createdAt}${userId}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const buildAuditChain = (logs: any[]) => {
  const grouped: Record<string, any[]> = {};

  logs.forEach(log => {
    const key = `${log.entityType}:${log.entityId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const chained: any[] = [];

  Object.values(grouped).forEach(group => {
    const sorted = group.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let previousHash: string | null = null;
    sorted.forEach(entry => {
      const dataHash = computeAuditDataHash(
        previousHash,
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.createdAt,
        entry.user.id
      );

      const auditEntry = {
        ...entry,
        previousHash,
        dataHash,
        hashVerified: dataHash === computeAuditDataHash(
          previousHash,
          entry.entityType,
          entry.entityId,
          entry.action,
          entry.createdAt,
          entry.user.id
        ),
      };

      chained.push(auditEntry);
      previousHash = dataHash;
    });
  });

  return chained;
};

const seed2025Data = async (tenantId: string) => {
  console.log('ðŸŒ± Seeding comprehensive 2025 data for tenant:', tenantId);

  // Create sample customers
  const customer1 = await prisma.contact.upsert({
    where: { tenantId_email: { tenantId, email: 'acme@example.com' } },
    update: {},
    create: {
      tenantId,
      type: 'customer',
      name: 'Acme Corporation',
      email: 'acme@example.com',
      phone: '+63-2-1234-5678',
      address: '123 Business Ave, Manila',
      city: 'Manila',
      province: 'Metro Manila',
      zipCode: '1000',
      country: 'Philippines',
      taxId: '123-456-789-000',
      isActive: true,
    },
  });

  const customer2 = await prisma.contact.upsert({
    where: { tenantId_email: { tenantId, email: 'startup@example.com' } },
    update: {},
    create: {
      tenantId,
      type: 'customer',
      name: 'Tech Startup Inc',
      email: 'startup@example.com',
      phone: '+63-917-123-4567',
      address: '456 Innovation St, Makati',
      city: 'Makati',
      province: 'Metro Manila',
      zipCode: '1200',
      country: 'Philippines',
      taxId: '987-654-321-000',
      isActive: true,
    },
  });

  const vendor = await prisma.contact.upsert({
    where: { tenantId_email: { tenantId, email: 'supplier@example.com' } },
    update: {},
    create: {
      tenantId,
      type: 'vendor',
      name: 'Reliable Suppliers',
      email: 'supplier@example.com',
      phone: '+63-2-9876-5432',
      address: '789 Supply Rd, Quezon City',
      city: 'Quezon City',
      province: 'Metro Manila',
      zipCode: '1110',
      country: 'Philippines',
      taxId: '555-666-777-000',
      isActive: true,
    },
  });

  console.log('âœ… Created sample contacts');

  // Generate audit logs from actual journal entries and invoices
  const auditLogs: AuditLog[] = [];
  let auditId = 0;

  // Sample journal entries from seed data
  const journalEntries = [
    {
      journalNumber: 'JE-2025-0001',
      description: 'Opening balance - Company started with capital investment',
      totalDebit: 500000.00,
      totalCredit: 500000.00,
      createdAt: '2025-01-01T08:00:00Z',
      postedAt: '2025-01-01T08:15:00Z',
    },
    {
      journalNumber: 'JE-2025-0002',
      description: 'Purchase office equipment on credit from Superior Supplies',
      totalDebit: 250000.00,
      totalCredit: 250000.00,
      createdAt: '2025-01-02T09:00:00Z',
      postedAt: '2025-01-02T09:30:00Z',
    },
    {
      journalNumber: 'JE-2025-0003',
      description: 'Purchase office furniture on credit',
      totalDebit: 120000.00,
      totalCrebit: 120000.00,
      createdAt: '2025-01-03T10:00:00Z',
      postedAt: '2025-01-03T10:30:00Z',
    },
    {
      journalNumber: 'JE-2025-0004',
      description: 'Initial inventory purchase for resale',
      totalDebit: 150000.00,
      totalCredit: 150000.00,
      createdAt: '2025-01-05T08:00:00Z',
      postedAt: '2025-01-05T08:30:00Z',
    },
    {
      journalNumber: 'JE-2025-0005',
      description: 'Sales revenue from Acme Corporation - cash sale',
      totalDebit: 75000.00,
      totalCredit: 75000.00,
      createdAt: '2025-01-06T09:00:00Z',
      postedAt: '2025-01-06T09:30:00Z',
    },
  ];

  // Sample invoices from seed data
  const invoices = [
    {
      invoiceNumber: 'SI-2025-0001',
      type: 'SalesInvoice',
      date: '2025-01-06',
      customer: 'Acme Corporation',
      total: 84000.00,
      createdAt: '2025-01-06T08:00:00Z',
      sentAt: '2025-01-06T08:30:00Z',
      paymentDate: '2025-01-12T10:00:00Z',
    },
    {
      invoiceNumber: 'SI-2025-0002',
      type: 'SalesInvoice',
      date: '2025-02-08',
      customer: 'TechStart Philippines',
      total: 184800.00,
      createdAt: '2025-02-08T09:15:00Z',
      sentAt: '2025-02-08T09:45:00Z',
      paymentDate: '2025-02-25T14:00:00Z',
    },
    {
      invoiceNumber: 'SI-2025-0003',
      type: 'SalesInvoice',
      date: '2025-02-10',
      customer: 'Global Traders Inc',
      total: 140000.00,
      createdAt: '2025-02-10T10:00:00Z',
      sentAt: '2025-02-10T10:30:00Z',
      paymentDate: '2025-03-05T09:00:00Z',
    },
    {
      invoiceNumber: 'PI-2025-0001',
      type: 'PurchaseInvoice',
      date: '2025-01-02',
      vendor: 'Superior Supplies Co',
      total: 280000.00,
      createdAt: '2025-01-02T07:30:00Z',
      sentAt: '2025-01-02T08:00:00Z',
      paymentDate: '2025-01-18T14:00:00Z',
    },
    {
      invoiceNumber: 'PI-2025-0002',
      type: 'PurchaseInvoice',
      date: '2025-01-05',
      vendor: 'Quality Imports Ltd',
      total: 168000.00,
      createdAt: '2025-01-05T08:00:00Z',
      sentAt: '2025-01-05T08:30:00Z',
      paymentDate: '2025-01-19T10:00:00Z',
    },
    {
      invoiceNumber: 'PI-2025-0003',
      type: 'PurchaseInvoice',
      date: '2025-02-03',
      vendor: 'Industrial Materials Inc',
      total: 95200.00,
      createdAt: '2025-02-03T09:00:00Z',
      sentAt: '2025-02-03T09:30:00Z',
      paymentDate: '2025-02-03T12:00:00Z',
    },
  ];

  // Map of users
  const users = [
    { id: 'user-001', firstName: 'Anna', lastName: 'Lopez', email: 'anna@tala.test' },
    { id: 'user-002', firstName: 'Miguel', lastName: 'Reyes', email: 'miguel@tala.test' },
    { id: 'user-003', firstName: 'Leah', lastName: 'Cruz', email: 'leah@tala.test' },
  ];

  // Generate audit logs for journal entries
  journalEntries.forEach((je, idx) => {
    const user1 = users[0];
    const user2 = users[1 + (idx % 2)];

    // Creation event
    auditLogs.push({
      id: `AUD-2025-${String(++auditId).padStart(4, '0')}`,
      tenantId,
      entityType: 'JournalEntry',
      entityId: je.journalNumber,
      action: 'Created',
      description: je.description,
      createdAt: je.createdAt,
      user: user1,
      changesBefore: {},
      changesAfter: {
        journalNumber: je.journalNumber,
        totalDebit: je.totalDebit,
        totalCredit: je.totalCredit,
        status: 'draft',
      },
      ipAddress: '127.0.0.1',
      userAgent: 'web-browser',
    });

    // Posted event
    if (je.postedAt) {
      auditLogs.push({
        id: `AUD-2025-${String(++auditId).padStart(4, '0')}`,
        tenantId,
        entityType: 'JournalEntry',
        entityId: je.journalNumber,
        action: 'Posted',
        description: `${je.journalNumber} posted and approved`,
        createdAt: je.postedAt,
        user: user2,
        changesBefore: { status: 'draft' },
        changesAfter: { status: 'posted' },
        ipAddress: '127.0.0.1',
        userAgent: 'web-browser',
      });
    }
  });

  // Generate audit logs for invoices
  invoices.forEach((inv, idx) => {
    const user1 = users[0];
    const user2 = users[1 + (idx % 2)];

    // Creation event
    auditLogs.push({
      id: `AUD-2025-${String(++auditId).padStart(4, '0')}`,
      tenantId,
      entityType: inv.type,
      entityId: inv.invoiceNumber,
      action: 'Created',
      description: `${inv.type} ${inv.invoiceNumber} created - ${inv.customer || inv.vendor}`,
      createdAt: inv.createdAt,
      user: user1,
      changesBefore: {},
      changesAfter: {
        invoiceNumber: inv.invoiceNumber,
        total: inv.total,
        status: 'draft',
      },
      ipAddress: '127.0.0.1',
      userAgent: 'web-browser',
    });

    // Sent event
    if (inv.sentAt) {
      auditLogs.push({
        id: `AUD-2025-${String(++auditId).padStart(4, '0')}`,
        tenantId,
        entityType: inv.type,
        entityId: inv.invoiceNumber,
        action: 'Sent',
        description: `${inv.invoiceNumber} sent to ${inv.customer || inv.vendor}`,
        createdAt: inv.sentAt,
        user: user2,
        changesBefore: { status: 'draft' },
        changesAfter: { status: 'sent' },
        ipAddress: '127.0.0.1',
        userAgent: 'web-browser',
      });
    }

    // Payment event (if applicable)
    if (inv.paymentDate) {
      auditLogs.push({
        id: `AUD-2025-${String(++auditId).padStart(4, '0')}`,
        tenantId,
        entityType: inv.type,
        entityId: inv.invoiceNumber,
        action: 'Paid',
        description: `Payment received/made for ${inv.invoiceNumber} - PHP ${inv.total.toFixed(2)}`,
        createdAt: inv.paymentDate,
        user: user1,
        changesBefore: { status: 'sent', paymentDate: null },
        changesAfter: { status: 'paid', paymentDate: inv.paymentDate, amountPaid: inv.total },
        ipAddress: '127.0.0.1',
        userAgent: 'web-browser',
      });
    }
  });

  const chainedAudits = buildAuditChain(auditLogs);

  console.log(`âœ… Generated ${chainedAudits.length} chained audit events from real data`);

  // Log summary
  const jeAudits = chainedAudits.filter(a => a.entityType === 'JournalEntry').length;
  const siAudits = chainedAudits.filter(a => a.entityType === 'SalesInvoice').length;
  const piAudits = chainedAudits.filter(a => a.entityType === 'PurchaseInvoice').length;

  console.log(`ðŸ“Š Audit Trail Summary:`);
  console.log(`  - Journal Entry events: ${jeAudits}`);
  console.log(`  - Sales Invoice events: ${siAudits}`);
  console.log(`  - Purchase Invoice events: ${piAudits}`);
  console.log(`  - Total audit events (chained): ${chainedAudits.length}`);

  return {
    contacts: { customer1, customer2, vendor },
    auditLogs: chainedAudits,
  };
};

export default seed2025Data;

// Helper to format currency with exactly 2 decimal places
export function formatCurrency2(amount: number): string {
  return (Math.round(amount * 100) / 100).toFixed(2);
}

export async function main() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'acme' },
    });

    if (!tenant) {
      console.log('â„¹ï¸  No tenant found; create one first via seed.ts');
      return;
    }

    await seed2025Data(tenant.id);
    console.log('âœ… 2025 seed data complete');
  } catch (err) {
    console.error('Seed 2025 error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => process.exit(0));