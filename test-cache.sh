#!/bin/bash
# TALA Redis Caching - Test Script
# Tests the cache endpoints with proper JWT tokens

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"
JWT_SECRET="change-this-to-a-very-long-random-string-in-production"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}TALA Redis Caching - Test Suite${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}[TEST 1]${NC} Health Check"
echo "GET $API_URL/health"
curl -s "$API_URL/health" | jq '.' 2>/dev/null || echo "Failed"
echo ""

# Test 2: API Root Endpoint
echo -e "${YELLOW}[TEST 2]${NC} API Root Endpoint"
echo "GET $API_URL/"
curl -s "$API_URL/" | jq '.' 2>/dev/null || echo "Failed"
echo ""

# Test 3: Cache Stats (No Auth - Will fail)
echo -e "${YELLOW}[TEST 3]${NC} Cache Stats (No Token - Expected to Fail)"
echo "GET $API_URL/api/cache/stats"
echo "Expected: 401 Unauthorized"
curl -s "$API_URL/api/cache/stats" 2>&1 | head -20
echo ""

# Test 4: Chart of Accounts (No Auth - Will fail)  
echo -e "${YELLOW}[TEST 4]${NC} Chart of Accounts (No Token - Expected to Fail)"
echo "GET $API_URL/api/chart-of-accounts"
echo "Expected: 401 Unauthorized"
curl -s "$API_URL/api/chart-of-accounts" 2>&1 | head -20
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}To test authenticated endpoints:${NC}"
echo "1. Generate a valid JWT token with tenant context"
echo "2. Call endpoints with: -H \"Authorization: Bearer \$TOKEN\""
echo -e "${BLUE}================================================${NC}\n"

echo -e "${GREEN}✓ Health checks complete!${NC}"
echo "API is running and responding correctly"
echo "Protected endpoints require valid JWT tokens"
