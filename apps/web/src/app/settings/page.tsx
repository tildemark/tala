/**
 * Settings Module - Main Page
 * Comprehensive settings management for the accounting system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type SettingsTab = 'company' | 'financial' | 'documents' | 'security';

interface CompanySettings {
  companyName: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  emailAddress: string;
  website: string;
  industry: string;
}

interface FinancialSettings {
  currency: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  taxRate: number;
  standardTaxRate: number;
  smallTaxpayerThreshold: number;
  defaultPaymentTerms: number;
}

interface DocumentSequences {
  journalEntryStart: string;
  invoiceStart: string;
  purchaseOrderStart: string;
  vendorCodeStart: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiration: number;
  lastPasswordChange: string;
  apiKey: string;
  apiKeyLastGenerated: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Company Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'TALA Corporation',
    registrationNumber: 'REG-2026-001',
    taxId: '123-456-789-000',
    address: '123 Business Avenue',
    city: 'Manila',
    province: 'Metro Manila',
    zipCode: '1000',
    country: 'Philippines',
    phoneNumber: '+63-2-1234-5678',
    emailAddress: 'info@talacorp.com',
    website: 'www.talacorp.com',
    industry: 'Professional Services',
  });

  // Financial Settings State
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>({
    currency: 'PHP',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '12-31',
    taxRate: 12,
    standardTaxRate: 12,
    smallTaxpayerThreshold: 3000000,
    defaultPaymentTerms: 30,
  });

  // Document Sequences State
  const [documentSequences, setDocumentSequences] = useState<DocumentSequences>({
    journalEntryStart: 'JE-2025-0001',
    invoiceStart: 'SI-2025-0001',
    purchaseOrderStart: 'PO-2025-0001',
    vendorCodeStart: 'VEND-001',
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiration: 90,
    lastPasswordChange: '2025-01-01',
    apiKey: 'sk_live_pending',
    apiKeyLastGenerated: '2025-01-01',
  });

  // Avoid SSR hydration mismatches by generating dynamic values on the client
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const generatedKey = 'sk_live_' + Math.random().toString(36).substr(2, 20);
    setSecuritySettings(prev => ({
      ...prev,
      apiKey: generatedKey,
      apiKeyLastGenerated: today,
      lastPasswordChange: today,
    }));
  }, []);

  const handleCompanyChange = (field: keyof CompanySettings, value: string) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFinancialChange = (field: keyof FinancialSettings, value: string | number) => {
    setFinancialSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentSequencesChange = (field: keyof DocumentSequences, value: string) => {
    setDocumentSequences(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean | number | string) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const settings = {
        company: companySettings,
        financial: financialSettings,
        documentSequences: documentSequences,
        security: securitySettings,
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 20);
    setSecuritySettings(prev => ({
      ...prev,
      apiKey: newKey,
      apiKeyLastGenerated: new Date().toISOString().split('T')[0],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">Manage system configuration and preferences</p>
        </div>
      </div>

      {/* Notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✅ Settings saved successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'company'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            🏢 Company
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'financial'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            💰 Financial
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📄 Document Sequences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            🔒 Security
          </button>
        </nav>
      </div>

      {/* Company Settings Tab */}
      {activeTab === 'company' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    value={companySettings.companyName}
                    onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registration Number
                  </label>
                  <Input
                    value={companySettings.registrationNumber}
                    onChange={(e) => handleCompanyChange('registrationNumber', e.target.value)}
                    placeholder="SEC Registration Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tax ID (BIR-certified)
                  </label>
                  <Input
                    value={companySettings.taxId}
                    onChange={(e) => handleCompanyChange('taxId', e.target.value)}
                    placeholder="xxx-xxx-xxx-xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Industry
                  </label>
                  <Input
                    value={companySettings.industry}
                    onChange={(e) => handleCompanyChange('industry', e.target.value)}
                    placeholder="e.g., Professional Services"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={companySettings.address}
                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>
                  <Input
                    value={companySettings.city}
                    onChange={(e) => handleCompanyChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Province
                  </label>
                  <Input
                    value={companySettings.province}
                    onChange={(e) => handleCompanyChange('province', e.target.value)}
                    placeholder="Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zip Code
                  </label>
                  <Input
                    value={companySettings.zipCode}
                    onChange={(e) => handleCompanyChange('zipCode', e.target.value)}
                    placeholder="Zip Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={companySettings.country}
                    onChange={(e) => handleCompanyChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={companySettings.phoneNumber}
                    onChange={(e) => handleCompanyChange('phoneNumber', e.target.value)}
                    placeholder="+63-2-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={companySettings.emailAddress}
                    onChange={(e) => handleCompanyChange('emailAddress', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website
                  </label>
                  <Input
                    value={companySettings.website}
                    onChange={(e) => handleCompanyChange('website', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={saveSettings} isLoading={loading}>
                Save Company Settings
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Financial Settings Tab */}
      {activeTab === 'financial' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Financial Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Currency
                  </label>
                  <Select
                    value={financialSettings.currency}
                    onChange={(e) => handleFinancialChange('currency', e.target.value)}
                  >
                    <option value="PHP">Philippine Peso (PHP)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fiscal Year Start (MM-DD)
                  </label>
                  <Input
                    type="text"
                    value={financialSettings.fiscalYearStart}
                    onChange={(e) => handleFinancialChange('fiscalYearStart', e.target.value)}
                    placeholder="MM-DD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fiscal Year End (MM-DD)
                  </label>
                  <Input
                    type="text"
                    value={financialSettings.fiscalYearEnd}
                    onChange={(e) => handleFinancialChange('fiscalYearEnd', e.target.value)}
                    placeholder="MM-DD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Standard VAT Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={financialSettings.standardTaxRate}
                    onChange={(e) => handleFinancialChange('standardTaxRate', parseFloat(e.target.value))}
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tax Rate (%) - BIR Compliance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={financialSettings.taxRate}
                    onChange={(e) => handleFinancialChange('taxRate', parseFloat(e.target.value))}
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Small Taxpayer Threshold (₱)
                  </label>
                  <Input
                    type="number"
                    value={financialSettings.smallTaxpayerThreshold}
                    onChange={(e) => handleFinancialChange('smallTaxpayerThreshold', parseFloat(e.target.value))}
                    placeholder="3000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Payment Terms (days)
                  </label>
                  <Input
                    type="number"
                    value={financialSettings.defaultPaymentTerms}
                    onChange={(e) => handleFinancialChange('defaultPaymentTerms', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Note:</strong> These settings are used for BIR compliance and financial reporting. 
                  Please ensure values are accurate and compliant with Philippine regulations.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={saveSettings} isLoading={loading}>
                Save Financial Settings
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Document Sequences Tab */}
      {activeTab === 'documents' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Document Sequence Configuration</h2>
              <p className="text-sm text-slate-600 mb-6">Configure starting numbers for document sequences. Use format: PREFIX-YYYY-NNNN</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Journal Entry Sequence Start
                  </label>
                  <Input
                    value={documentSequences.journalEntryStart}
                    onChange={(e) => handleDocumentSequencesChange('journalEntryStart', e.target.value)}
                    placeholder="e.g., JE-2025-0001"
                  />
                  <p className="text-xs text-slate-500 mt-1">Pattern: JE-YYYY-NNNN</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sales Invoice Sequence Start
                  </label>
                  <Input
                    value={documentSequences.invoiceStart}
                    onChange={(e) => handleDocumentSequencesChange('invoiceStart', e.target.value)}
                    placeholder="e.g., SI-2025-0001"
                  />
                  <p className="text-xs text-slate-500 mt-1">Pattern: SI-YYYY-NNNN</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Order Sequence Start
                  </label>
                  <Input
                    value={documentSequences.purchaseOrderStart}
                    onChange={(e) => handleDocumentSequencesChange('purchaseOrderStart', e.target.value)}
                    placeholder="e.g., PO-2025-0001"
                  />
                  <p className="text-xs text-slate-500 mt-1">Pattern: PO-YYYY-NNNN</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vendor Code Sequence Start
                  </label>
                  <Input
                    value={documentSequences.vendorCodeStart}
                    onChange={(e) => handleDocumentSequencesChange('vendorCodeStart', e.target.value)}
                    placeholder="e.g., VEND-001"
                  />
                  <p className="text-xs text-slate-500 mt-1">Pattern: VEND-NNN</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Note:</strong> Document sequences are used to generate unique identifiers for all financial documents. 
                  All currency values will be displayed with exactly 2 decimal places.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={saveSettings} isLoading={loading}>
                Save Document Sequences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {securitySettings.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSecurityChange('twoFactorEnabled', !securitySettings.twoFactorEnabled)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        securitySettings.twoFactorEnabled
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* Session Timeout */}
                <div className="border-b border-slate-200 pb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    placeholder="30"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Sessions will automatically close after this duration of inactivity
                  </p>
                </div>

                {/* Password Expiration */}
                <div className="border-b border-slate-200 pb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Expiration (days)
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.passwordExpiration}
                    onChange={(e) => handleSecurityChange('passwordExpiration', parseInt(e.target.value))}
                    placeholder="90"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Users will be prompted to change password after this period
                  </p>
                </div>

                {/* Last Password Change */}
                <div className="border-b border-slate-200 pb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Password Change
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{securitySettings.lastPasswordChange}</span>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      Change Password
                    </button>
                  </div>
                </div>

                {/* API Key */}
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">API Key</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-slate-600 break-all">
                        {securitySettings.apiKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(securitySettings.apiKey)}
                        className="ml-4 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded whitespace-nowrap"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">
                      Generated: {securitySettings.apiKeyLastGenerated}
                    </p>
                    <button
                      onClick={generateNewApiKey}
                      className="w-full text-sm bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded font-medium"
                    >
                      🔄 Generate New Key
                    </button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> Keep your API key secure and never share it publicly. 
                    If compromised, generate a new key immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={saveSettings} isLoading={loading}>
                Save Security Settings
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
