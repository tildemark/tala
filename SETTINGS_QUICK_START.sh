#!/usr/bin/env bash

# Settings Module Quick Start Guide
# This file provides quick commands to test and verify the Settings module

echo "🔧 TALA Settings Module - Quick Reference"
echo "=========================================="
echo ""

# Test 1: Fetch all settings
echo "✓ Test 1: Fetch All Settings"
echo "Command: curl http://localhost:3004/api/settings"
echo ""

# Test 2: Fetch company settings
echo "✓ Test 2: Fetch Company Settings"
echo "Command: curl http://localhost:3004/api/settings/company"
echo ""

# Test 3: Update company settings
echo "✓ Test 3: Update Company Settings"
echo "Command:"
echo 'curl -X PUT http://localhost:3004/api/settings/company \'
echo '  -H "Content-Type: application/json" \'
echo "  -d '{\"companyName\": \"TALA Inc\"}'"
echo ""

# Test 4: Update financial settings
echo "✓ Test 4: Update Financial Settings"
echo "Command:"
echo 'curl -X PUT http://localhost:3004/api/settings/financial \'
echo '  -H "Content-Type: application/json" \'
echo "  -d '{\"taxRate\": 12, \"currency\": \"PHP\"}'"
echo ""

# Test 5: Generate API Key
echo "✓ Test 5: Generate New API Key"
echo "Command: curl -X POST http://localhost:3004/api/settings/security/generate-api-key"
echo ""

# Test 6: Change Password
echo "✓ Test 6: Change Password"
echo "Command:"
echo 'curl -X POST http://localhost:3004/api/settings/security/change-password \'
echo '  -H "Content-Type: application/json" \'
echo "  -d '{\"currentPassword\": \"oldpass\", \"newPassword\": \"newpass123\"}'"
echo ""

# Test 7: Export Settings
echo "✓ Test 7: Export Settings"
echo "Command: curl http://localhost:3004/api/settings/export?format=json"
echo ""

# Test 8: Reset to Defaults
echo "✓ Test 8: Reset to Defaults"
echo "Command:"
echo 'curl -X POST http://localhost:3004/api/settings/reset \'
echo '  -H "Content-Type: application/json" \'
echo "  -d '{\"confirm\": true}'"
echo ""

echo "📱 Web UI Access"
echo "==============="
echo "Settings Page: http://localhost:3001/settings"
echo "API Documentation: http://localhost:3004/api-docs"
echo ""

echo "📚 Documentation"
echo "==============="
echo "- SETTINGS_MODULE_DOCS.md - Comprehensive documentation"
echo "- SETTINGS_IMPLEMENTATION_REPORT.md - Implementation details"
echo "- src/hooks/useSettings.ts - React hook with examples"
echo "- src/app/settings/page.tsx - UI component source"
echo ""
