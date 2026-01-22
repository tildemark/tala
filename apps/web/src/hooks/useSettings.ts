/**
 * useSettings Hook
 * Manages application settings with API integration
 */

'use client';

import { useState, useEffect } from 'react';

export interface AppSettings {
  company: {
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
  };
  financial: {
    currency: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
    taxRate: number;
    standardTaxRate: number;
    smallTaxpayerThreshold: number;
    defaultPaymentTerms: number;
  };
  preferences: {
    dateFormat: string;
    timeFormat: string;
    theme: string;
    language: string;
    decimalsPlaces: number;
    defaultView: string;
    exportFormat: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiration: number;
    lastPasswordChange: string;
    apiKey: string;
    apiKeyLastGenerated: string;
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings');
      const json = await response.json();
      if (json.success) {
        setSettings(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section: keyof AppSettings, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/settings/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (json.success) {
        setSettings(prev => prev ? { ...prev, [section]: json.data } : null);
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to update settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAllSettings = async (allSettings: AppSettings) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSettings),
      });
      const json = await response.json();
      if (json.success) {
        setSettings(json.data);
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to update settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateNewApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/security/generate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      if (json.success && settings) {
        setSettings({
          ...settings,
          security: {
            ...settings.security,
            apiKey: json.data.apiKey,
            apiKeyLastGenerated: json.data.apiKeyLastGenerated,
          },
        });
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to generate API key');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await response.json();
      if (json.success && settings) {
        setSettings({
          ...settings,
          security: {
            ...settings.security,
            lastPasswordChange: json.data.lastPasswordChange,
          },
        });
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to change password');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = async (format: 'json' = 'json') => {
    try {
      const response = await fetch(`/api/settings/export?format=${format}`);
      const json = await response.json();
      if (json.success) {
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to export settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const resetSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const json = await response.json();
      if (json.success) {
        setSettings(json.data);
        return json.data;
      } else {
        throw new Error(json.error || 'Failed to reset settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateAllSettings,
    generateNewApiKey,
    changePassword,
    exportSettings,
    resetSettings,
  };
}
