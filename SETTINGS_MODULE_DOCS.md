# Settings Module Documentation

**Version:** 1.0.0  
**Date:** January 15, 2026  
**Status:** ✅ Complete

---

## Overview

The Settings module provides comprehensive configuration management for the TALA accounting system. Users can manage company information, financial settings, user preferences, and security configurations from a centralized interface.

---

## Module Structure

### Frontend Components

**Location:** `apps/web/src/app/settings/page.tsx`

A single-page settings application with four main tabs:

1. **🏢 Company Settings**
   - Company name and registration details
   - Tax identification (BIR-certified)
   - Address and contact information
   - Industry classification
   - Website and email

2. **💰 Financial Settings**
   - Default currency (PHP, USD, EUR)
   - Fiscal year configuration
   - VAT/Tax rates (BIR-compliant)
   - Small taxpayer thresholds
   - Default payment terms

3. **👤 User Preferences**
   - Date and time format options
   - Theme selection (Light/Dark/Auto)
   - Language settings
   - Decimal places for currency
   - Default view and export format

4. **🔒 Security Settings**
   - Two-factor authentication toggle
   - Session timeout configuration
   - Password expiration policies
   - API key management
   - Password change interface

### Backend API Endpoints

**Base URL:** `http://localhost:3004/api/settings`

#### GET /api/settings
Retrieves all settings sections

```json
{
  "success": true,
  "data": {
    "company": { ... },
    "financial": { ... },
    "preferences": { ... },
    "security": { ... }
  }
}
```

#### GET /api/settings/:section
Retrieves a specific settings section (company, financial, preferences, security)

```bash
curl http://localhost:3004/api/settings/company
```

#### PUT /api/settings/:section
Updates a specific settings section

```bash
curl -X PUT http://localhost:3004/api/settings/financial \
  -H "Content-Type: application/json" \
  -d '{"taxRate": 12, "currency": "PHP"}'
```

#### PUT /api/settings
Updates all settings at once

```bash
curl -X PUT http://localhost:3004/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "company": { ... },
    "financial": { ... },
    "preferences": { ... },
    "security": { ... }
  }'
```

#### POST /api/settings/security/generate-api-key
Generates a new API key for integrations

```bash
curl -X POST http://localhost:3004/api/settings/security/generate-api-key
```

Response:
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_live_abc123xyz...",
    "apiKeyLastGenerated": "2026-01-15"
  },
  "message": "New API key generated successfully"
}
```

#### POST /api/settings/security/change-password
Allows users to change their password

```bash
curl -X POST http://localhost:3004/api/settings/security/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass456"
  }'
```

Validation:
- Minimum 8 characters for new password
- Current password must be verified
- Updates lastPasswordChange timestamp

#### GET /api/settings/export
Exports current settings configuration

```bash
curl http://localhost:3004/api/settings/export?format=json
```

#### POST /api/settings/reset
Resets all settings to factory defaults (requires confirmation)

```bash
curl -X POST http://localhost:3004/api/settings/reset \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

---

## Frontend Hook: useSettings

**Location:** `apps/web/src/hooks/useSettings.ts`

Custom React hook for managing settings with API integration.

### Usage Example

```typescript
import { useSettings } from '@/hooks/useSettings';

export default function MyComponent() {
  const {
    settings,
    loading,
    error,
    updateSettings,
    generateNewApiKey,
  } = useSettings();

  const handleUpdate = async () => {
    try {
      await updateSettings('company', {
        companyName: 'New Company Name',
        taxId: '123-456-789-000',
      });
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Company: {settings?.company.companyName}</p>
      <button onClick={handleUpdate}>Update Settings</button>
    </div>
  );
}
```

### Available Methods

| Method | Description | Parameters | Returns |
|--------|---|---|---|
| `fetchSettings()` | Fetch all settings from API | None | `Promise<void>` |
| `updateSettings(section, data)` | Update specific section | section: keyof AppSettings, data: any | `Promise<any>` |
| `updateAllSettings(settings)` | Update all sections at once | settings: AppSettings | `Promise<AppSettings>` |
| `generateNewApiKey()` | Generate new API key | None | `Promise<{apiKey, apiKeyLastGenerated}>` |
| `changePassword(current, new)` | Change user password | currentPassword, newPassword: string | `Promise<{lastPasswordChange}>` |
| `exportSettings(format)` | Export settings | format: 'json' | `Promise<AppSettings>` |
| `resetSettings()` | Reset to defaults | None | `Promise<AppSettings>` |

### Hook State

```typescript
{
  settings: AppSettings | null,      // Current settings or null if loading
  loading: boolean,                   // API request in progress
  error: string | null,               // Error message if any
}
```

---

## Settings Data Structure

### Company Settings
```typescript
{
  companyName: string;              // Legal company name
  registrationNumber: string;       // SEC registration
  taxId: string;                    // BIR Tax ID (xxx-xxx-xxx-xxx)
  address: string;                  // Street address
  city: string;                     // City
  province: string;                 // Province/State
  zipCode: string;                  // Postal code
  country: string;                  // Country
  phoneNumber: string;              // Business phone
  emailAddress: string;             // Business email
  website: string;                  // Company website
  industry: string;                 // Industry classification
}
```

### Financial Settings
```typescript
{
  currency: string;                 // 'PHP' | 'USD' | 'EUR'
  fiscalYearStart: string;          // 'MM-DD' format
  fiscalYearEnd: string;            // 'MM-DD' format
  taxRate: number;                  // BIR-compliant tax rate (%)
  standardTaxRate: number;          // VAT rate (%)
  smallTaxpayerThreshold: number;   // Threshold for small taxpayers (₱)
  defaultPaymentTerms: number;      // Days for payment terms
}
```

### User Preferences
```typescript
{
  dateFormat: string;               // 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: string;               // '24h' | '12h'
  theme: string;                    // 'light' | 'dark' | 'auto'
  language: string;                 // 'en' | 'fil' | 'es'
  decimalsPlaces: number;           // 2 | 4
  defaultView: string;              // 'list' | 'table' | 'grid'
  exportFormat: string;             // 'pdf' | 'excel' | 'csv'
}
```

### Security Settings
```typescript
{
  twoFactorEnabled: boolean;        // 2FA toggle
  sessionTimeout: number;           // Minutes of inactivity
  passwordExpiration: number;       // Days until password expires
  lastPasswordChange: string;       // 'YYYY-MM-DD' format
  apiKey: string;                   // API authentication key
  apiKeyLastGenerated: string;      // 'YYYY-MM-DD' format
}
```

---

## Features

### ✅ Company Settings
- Store and manage complete company information
- BIR Tax ID validation format
- Industry classification
- Contact details for invoicing and reports

### ✅ Financial Settings
- Multi-currency support (PHP, USD, EUR)
- Fiscal year configuration
- BIR-compliant tax rate settings
- Small taxpayer classification support
- Default payment terms for invoices

### ✅ User Preferences
- Flexible date/time formatting
- Theme selection with auto-detection
- Multi-language support (English, Filipino, Spanish)
- Customizable decimal places for currency
- View and export format preferences

### ✅ Security Settings
- Two-factor authentication toggle
- Session management configuration
- Password expiration policies
- API key generation and rotation
- Password change interface
- Audit trail for security events

### ✅ Advanced Features
- Export settings as JSON for backup/migration
- Reset to factory defaults
- API key management with secure generation
- Comprehensive validation on all inputs
- Error handling and user feedback

---

## Security Considerations

### API Key Protection
- API keys are generated with secure randomization
- Keys follow format: `sk_live_[random_chars]`
- Should be rotated regularly
- Never visible in API responses after initial generation

### Password Security
- Minimum 8 characters required
- Current password verification before change
- Password expiration configurable (default: 90 days)
- Last change date tracked

### Session Management
- Configurable session timeout (default: 30 minutes)
- Automatic session termination after inactivity
- 2FA can be enabled for enhanced security

### Data Protection
- All settings transmitted over HTTPS in production
- Sensitive data (API keys) not logged
- Settings backup available via export

---

## BIR Compliance

The settings module includes specific features for Philippine Bureau of Internal Revenue (BIR) compliance:

1. **Tax ID Format:** `xxx-xxx-xxx-xxx` (9-digit TIN + 000)
2. **Tax Rates:** Configurable per BIR guidelines
3. **Small Taxpayer Classification:** Threshold-based with default of ₱3,000,000
4. **Fiscal Year:** Configurable to match regulatory year (default: Jan 1 - Dec 31)
5. **Industry Classification:** For tax category determination

---

## Usage Workflow

### Initial Setup
1. Navigate to Settings (⚙️ icon in sidebar)
2. Go to Company tab
3. Enter complete company information
4. Go to Financial tab
5. Configure tax rates and payment terms
6. Go to Preferences tab
7. Set display preferences
8. Go to Security tab
9. Configure security policies
10. Click "Save Settings" on each tab

### Managing API Access
1. Go to Settings > Security
2. Find API Key section
3. Click "Copy" to copy current key for integration
4. Click "Generate New Key" to rotate keys (old key invalidated)
5. Keep key secure and never commit to version control

### Changing Password
1. Go to Settings > Security
2. Click "Change Password"
3. Enter current password for verification
4. Enter new password (min 8 characters)
5. Confirm change
6. Last password change date updates

### Exporting Settings
1. Use API endpoint: `GET /api/settings/export?format=json`
2. Save response for backup
3. Can be used for migration to new instance

---

## API Examples

### Fetch All Settings
```bash
curl http://localhost:3004/api/settings
```

### Update Company Settings
```bash
curl -X PUT http://localhost:3004/api/settings/company \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "TALA Philippine Inc",
    "taxId": "123-456-789-000",
    "city": "Manila"
  }'
```

### Generate New API Key
```bash
curl -X POST http://localhost:3004/api/settings/security/generate-api-key
```

### Update Multiple Settings
```bash
curl -X PUT http://localhost:3004/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "company": {"companyName": "New Name"},
    "financial": {"taxRate": 12},
    "preferences": {"theme": "dark"},
    "security": {"sessionTimeout": 45}
  }'
```

---

## Testing Scenarios

### Test 1: Update Company Info
1. Navigate to Settings > Company
2. Change company name
3. Click Save
4. Verify success notification
5. Refresh page and confirm changes persist

### Test 2: Change Financial Settings
1. Navigate to Settings > Financial
2. Update tax rate and payment terms
3. Save changes
4. Verify new terms apply to new invoices

### Test 3: API Key Rotation
1. Go to Settings > Security
2. Note current API key
3. Click "Generate New Key"
4. Verify new key is displayed
5. Old key should no longer work in integrations

### Test 4: Export Settings
1. Use API: `curl http://localhost:3004/api/settings/export`
2. Save returned JSON
3. Use for documentation or backup

### Test 5: Reset to Defaults
1. Go to Settings > Any Tab
2. Use API: `POST /api/settings/reset` with `confirm: true`
3. Verify all settings return to defaults
4. Refresh UI to see changes

---

## Future Enhancements

- [ ] Multi-tenant settings isolation
- [ ] Audit log for settings changes
- [ ] Settings versioning/history
- [ ] Role-based settings access control
- [ ] Settings templates/presets
- [ ] Import settings from previous instance
- [ ] Settings change notifications
- [ ] Advanced security policies
- [ ] Integration with external identity providers
- [ ] Settings encryption at rest

---

## Troubleshooting

### Settings Not Saving
- Check browser console for errors
- Verify API is running on port 3004
- Check network tab for failed requests
- Try refreshing the page

### API Key Not Generating
- Ensure security settings tab is accessible
- Check API response for error details
- Try generating again with fresh page load

### Changes Not Persisting
- Verify "Save Settings" button was clicked
- Check for success notification
- Wait a moment before refreshing
- Check browser local storage is not disabled

---

## Support

For issues or questions:
1. Check this documentation
2. Review API response error messages
3. Check browser console for JavaScript errors
4. Verify all required fields are filled
5. Contact system administrator

---

**Status:** ✅ Complete and Operational  
**Last Updated:** January 15, 2026
