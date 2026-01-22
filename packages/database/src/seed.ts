import { PrismaClient } from '@prisma/client';
import { seedServiceFirm } from './seed.service-firm';

const prisma = new PrismaClient();

/**
 * TALA RBAC & Default Permissions Setup
 * Seeds default roles and permissions for Philippine business requirements
 */

const DEFAULT_PERMISSIONS = {
  // Ledger & Journal Management
  can_view_ledger: {
    code: 'can_view_ledger',
    description: 'View general ledger and journal entries',
    category: 'ledger',
  },
  can_create_journal_entry: {
    code: 'can_create_journal_entry',
    description: 'Create new journal entries',
    category: 'ledger',
  },
  can_post_ledger: {
    code: 'can_post_ledger',
    description: 'Post journal entries to ledger',
    category: 'ledger',
  },
  can_void_ledger: {
    code: 'can_void_ledger',
    description: 'Void posted entries',
    category: 'ledger',
  },

  // Invoicing
  can_create_invoice: {
    code: 'can_create_invoice',
    description: 'Create sales and purchase invoices',
    category: 'ledger',
  },
  can_approve_invoice: {
    code: 'can_approve_invoice',
    description: 'Approve invoices for posting',
    category: 'ledger',
  },

  // Reporting
  can_view_reports: {
    code: 'can_view_reports',
    description: 'Access financial reports',
    category: 'reporting',
  },
  can_export_general_ledger: {
    code: 'can_export_general_ledger',
    description: 'Export general ledger reports',
    category: 'reporting',
  },
  can_export_bir_forms: {
    code: 'can_export_bir_forms',
    description: 'Export BIR forms (Form 2307, SLS, SLP)',
    category: 'reporting',
  },

  // Audit & Compliance
  can_view_audit_logs: {
    code: 'can_view_audit_logs',
    description: 'View audit trail for all transactions',
    category: 'audit',
  },
  can_detect_tampering: {
    code: 'can_detect_tampering',
    description: 'Detect audit chain tampering',
    category: 'audit',
  },

  // Security & Privacy
  view_sensitive_data: {
    code: 'view_sensitive_data',
    description: 'View unmasked TINs, bank accounts, and personal information',
    category: 'admin',
  },
  can_manage_users: {
    code: 'can_manage_users',
    description: 'Create, update, and deactivate users',
    category: 'admin',
  },
  can_manage_roles: {
    code: 'can_manage_roles',
    description: 'Create and manage roles and permissions',
    category: 'admin',
  },
  can_manage_tenant: {
    code: 'can_manage_tenant',
    description: 'Manage tenant settings and configuration',
    category: 'admin',
  },

  // System
  can_access_system_health: {
    code: 'can_access_system_health',
    description: 'Access system health and diagnostics',
    category: 'admin',
  },
};

const DEFAULT_ROLES = {
  super_admin: {
    name: 'Super Admin',
    description: 'System administrator with full access',
    isSystem: true,
    isDefault: false,
    permissions: Object.keys(DEFAULT_PERMISSIONS), // All permissions
  },
  company_admin: {
    name: 'Company Admin',
    description: 'Tenant-level administrator',
    isSystem: true,
    isDefault: true,
    permissions: [
      'can_view_ledger',
      'can_create_journal_entry',
      'can_post_ledger',
      'can_void_ledger',
      'can_create_invoice',
      'can_approve_invoice',
      'can_view_reports',
      'can_export_general_ledger',
      'can_export_bir_forms',
      'can_view_audit_logs',
      'view_sensitive_data',
      'can_manage_users',
      'can_manage_tenant',
    ],
  },
  accountant: {
    name: 'Accountant',
    description: 'Full access to financial records and BIR reporting',
    isSystem: true,
    isDefault: false,
    permissions: [
      'can_view_ledger',
      'can_create_journal_entry',
      'can_post_ledger',
      'can_void_ledger',
      'can_create_invoice',
      'can_approve_invoice',
      'can_view_reports',
      'can_export_general_ledger',
      'can_export_bir_forms',
      'can_view_audit_logs',
      'view_sensitive_data',
    ],
  },
  clerk: {
    name: 'Clerk',
    description: 'Entry-only access for invoices and vouchers',
    isSystem: true,
    isDefault: false,
    permissions: ['can_create_invoice', 'can_view_ledger'],
  },
  auditor: {
    name: 'Auditor',
    description: 'View-only access for audit and compliance',
    isSystem: true,
    isDefault: false,
    permissions: [
      'can_view_ledger',
      'can_view_reports',
      'can_view_audit_logs',
      'can_detect_tampering',
    ],
  },
};

export async function seedDefaultPermissions(tenantId: string) {
  console.log('🌱 Seeding default permissions for tenant:', tenantId);

  // Create permissions
  for (const [key, permission] of Object.entries(DEFAULT_PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        description: permission.description,
        category: permission.category,
      },
      create: {
        tenantId,
        ...permission,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Created ${Object.keys(DEFAULT_PERMISSIONS).length} permissions`);
}

export async function seedDefaultRoles(tenantId: string) {
  console.log('🌱 Seeding default roles for tenant:', tenantId);

  for (const [key, roleConfig] of Object.entries(DEFAULT_ROLES)) {
    const { permissions, ...roleData } = roleConfig;

    const role = await prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name: roleData.name,
        },
      },
      update: roleData,
      create: {
        tenantId,
        ...roleData,
      },
    });

    // Assign permissions to role
    for (const permissionCode of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`✅ Created role: ${roleData.name}`);
  }
}

export async function seedChartOfAccounts(tenantId: string, industry: string = 'service') {
  console.log('🌱 Seeding chart of accounts for tenant:', tenantId, 'Industry:', industry);

  const chartOfAccounts = [
    // ASSETS
    {
      accountCode: '1000',
      accountName: 'Cash on Hand',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1010',
      accountName: 'Cash in Bank - Checking',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1020',
      accountName: 'Cash in Bank - Savings',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1150',
      accountName: 'Allowance for Doubtful Accounts',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: false,
    },
    {
      accountCode: '1200',
      accountName: 'Inventory',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1300',
      accountName: 'Prepaid Expenses',
      accountType: 'Asset',
      subType: 'Current Asset',
      debitBalance: true,
    },
    {
      accountCode: '1500',
      accountName: 'Equipment',
      accountType: 'Asset',
      subType: 'Fixed Asset',
      debitBalance: true,
    },
    {
      accountCode: '1510',
      accountName: 'Accumulated Depreciation - Equipment',
      accountType: 'Asset',
      subType: 'Fixed Asset',
      debitBalance: false,
    },
    {
      accountCode: '1600',
      accountName: 'Furniture & Fixtures',
      accountType: 'Asset',
      subType: 'Fixed Asset',
      debitBalance: true,
    },
    {
      accountCode: '1610',
      accountName: 'Accumulated Depreciation - Furniture & Fixtures',
      accountType: 'Asset',
      subType: 'Fixed Asset',
      debitBalance: false,
    },

    // LIABILITIES
    {
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2100',
      accountName: 'Accrued Expenses',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2110',
      accountName: 'Income Tax Payable',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2120',
      accountName: 'VAT Payable',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2130',
      accountName: 'EWT Payable',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2200',
      accountName: 'Short-term Debt',
      accountType: 'Liability',
      subType: 'Current Liability',
      debitBalance: false,
    },
    {
      accountCode: '2500',
      accountName: 'Long-term Debt',
      accountType: 'Liability',
      subType: 'Long-term Liability',
      debitBalance: false,
    },

    // EQUITY
    {
      accountCode: '3000',
      accountName: 'Capital Stock',
      accountType: 'Equity',
      debitBalance: false,
    },
    {
      accountCode: '3100',
      accountName: 'Retained Earnings',
      accountType: 'Equity',
      debitBalance: false,
    },
    {
      accountCode: '3200',
      accountName: 'Drawings',
      accountType: 'Equity',
      debitBalance: true,
    },

    // REVENUES
    {
      accountCode: '4000',
      accountName: 'Sales Revenue',
      accountType: 'Revenue',
      debitBalance: false,
    },
    {
      accountCode: '4100',
      accountName: 'Service Revenue',
      accountType: 'Revenue',
      debitBalance: false,
    },
    {
      accountCode: '4200',
      accountName: 'Sales Returns & Allowances',
      accountType: 'Revenue',
      debitBalance: true,
    },
    {
      accountCode: '4300',
      accountName: 'Sales Discounts',
      accountType: 'Revenue',
      debitBalance: true,
    },
    {
      accountCode: '4500',
      accountName: 'Other Income',
      accountType: 'Revenue',
      debitBalance: false,
    },

    // EXPENSES
    {
      accountCode: '5000',
      accountName: 'Cost of Goods Sold',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '5500',
      accountName: 'Salaries & Wages',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '5600',
      accountName: 'Utilities',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '5700',
      accountName: 'Rent Expense',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '5800',
      accountName: 'Depreciation Expense',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '5900',
      accountName: 'Office Supplies',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '6000',
      accountName: 'Professional Fees',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '6100',
      accountName: 'Travel & Transportation',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '6200',
      accountName: 'Advertising & Promotion',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '6300',
      accountName: 'Taxes & Licenses',
      accountType: 'Expense',
      debitBalance: true,
    },
    {
      accountCode: '6400',
      accountName: 'Miscellaneous Expense',
      accountType: 'Expense',
      debitBalance: true,
    },
  ];

  for (const account of chartOfAccounts) {
    await prisma.chartOfAccount.upsert({
      where: {
        tenantId_accountCode: {
          tenantId,
          accountCode: account.accountCode,
        },
      },
      update: account,
      create: {
        tenantId,
        isSystem: true,
        ...account,
      },
    });
  }

  console.log(`✅ Created ${chartOfAccounts.length} chart of accounts`);
}

export async function seedTaxCodes(tenantId: string) {
  console.log('🌱 Seeding BIR tax codes for tenant:', tenantId);

  const taxCodes = [
    // VAT
    {
      code: 'VAT000',
      description: 'VAT 12%',
      taxType: 'VAT',
      rate: 12.0,
      birFormCode: 'VAT001',
    },
    {
      code: 'VAT-EXEMPT',
      description: 'VAT Exempt',
      taxType: 'VAT',
      rate: 0.0,
      birFormCode: 'VAT002',
    },
    {
      code: 'VAT-ZERO',
      description: 'VAT 0% (Export)',
      taxType: 'VAT',
      rate: 0.0,
      birFormCode: 'VAT003',
    },

    // EWT (Expanded Withholding Tax)
    {
      code: 'EWT-001',
      description: 'EWT on Services 5%',
      taxType: 'EWT',
      rate: 5.0,
      birFormCode: 'EWT001',
    },
    {
      code: 'EWT-002',
      description: 'EWT on Payments 2%',
      taxType: 'EWT',
      rate: 2.0,
      birFormCode: 'EWT002',
    },
    {
      code: 'EWT-003',
      description: 'EWT on Contractors 1%',
      taxType: 'EWT',
      rate: 1.0,
      birFormCode: 'EWT003',
    },

    // ATC (Alphalist Tax Codes)
    {
      code: 'ATC-001',
      description: 'Alphalist - Non-Resident Alien',
      taxType: 'ATC',
      rate: 15.0,
      birFormCode: 'ATC001',
    },

    // Non-VAT
    {
      code: 'NON-VAT',
      description: 'Non-VAT',
      taxType: 'NonVAT',
      rate: 0.0,
      birFormCode: 'NVT001',
    },
  ];

  for (const taxCode of taxCodes) {
    await prisma.taxCode.upsert({
      where: {
        tenantId_code: {
          tenantId,
          code: taxCode.code,
        },
      },
      update: taxCode,
      create: {
        tenantId,
        isSystem: true,
        ...taxCode,
      },
    });
  }

  console.log(`✅ Created ${taxCodes.length} tax codes`);
}

export default {
  seedDefaultPermissions,
  seedDefaultRoles,
  seedChartOfAccounts,
  seedTaxCodes,
};

// Auto-run: Seed a default tenant and admin user if none exist
async function main() {
  try {
    const tenantCount = await prisma.tenant.count();
    if (tenantCount > 0) {
      console.log('ℹ️ Tenants already exist; skipping default tenant/user seed');
      return;
    }

    console.log('🌱 Creating default tenant and admin user for development...');
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Acme Corp',
        slug: 'acme',
        industry: 'service',
      },
    });

    await seedDefaultPermissions(tenant.id);
    await seedDefaultRoles(tenant.id);
    await seedChartOfAccounts(tenant.id);
    await seedTaxCodes(tenant.id);

    // Seed service firm with full 2025 data
    await seedServiceFirm();

    const companyAdminRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: 'Company Admin' },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'admin@example.com',
        passwordHash: 'dev-local',
        firstName: 'Dev',
        lastName: 'Admin',
        roleId: companyAdminRole!.id,
        isActive: true,
      },
    });

    console.log('✅ Seeded default tenant:', tenant.slug);
    console.log('✅ Seeded admin user:', user.email);
  } catch (err) {
    console.error('Seed main error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute when run via npm script
main().catch(() => process.exit(0));
