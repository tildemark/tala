"use strict";
/**
 * TALA Cache Service
 * Provides tenant-prefixed Redis caching for heavy financial reports
 * Key format: tenant:{tenantId}:report:{reportName}:{additionalContext}
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCacheManager = exports.CacheService = exports.CacheKeyBuilder = void 0;
const redis_1 = require("redis");
/**
 * Cache Key Builder with tenant-prefix strategy
 */
class CacheKeyBuilder {
    /**
     * Build a tenant-prefixed cache key
     * @param tenantId - Tenant identifier
     * @param reportName - Report name (e.g., trial_balance, general_ledger)
     * @param context - Additional context for key uniqueness (e.g., period, filters)
     * @returns Formatted cache key
     */
    static buildReportKey(tenantId, reportName, context) {
        if (!context) {
            return `tenant:${tenantId}:report:${reportName}`;
        }
        return `tenant:${tenantId}:report:${reportName}:${context}`;
    }
    /**
     * Build cache key for Trial Balance report
     * @param tenantId - Tenant identifier
     * @param period - Reporting period (e.g., 2024-01, 2024-Q1)
     * @param filters - Additional filters as context
     * @returns Formatted cache key
     */
    static buildTrialBalanceKey(tenantId, period, filters) {
        const filterContext = filters
            ? Object.entries(filters)
                .map(([k, v]) => `${k}=${v}`)
                .join('|')
            : '';
        return this.buildReportKey(tenantId, 'trial_balance', `${period}${filterContext ? `:${filterContext}` : ''}`);
    }
    /**
     * Build cache key for General Ledger report
     * @param tenantId - Tenant identifier
     * @param accountCode - Chart of account code
     * @param period - Reporting period
     * @param filters - Additional filters
     * @returns Formatted cache key
     */
    static buildGeneralLedgerKey(tenantId, accountCode, period, filters) {
        const filterContext = filters
            ? Object.entries(filters)
                .map(([k, v]) => `${k}=${v}`)
                .join('|')
            : '';
        return this.buildReportKey(tenantId, 'general_ledger', `${accountCode}:${period}${filterContext ? `:${filterContext}` : ''}`);
    }
    /**
     * Build cache key for Income Statement report
     */
    static buildIncomeStatementKey(tenantId, period) {
        return this.buildReportKey(tenantId, 'income_statement', period);
    }
    /**
     * Build cache key for Balance Sheet report
     */
    static buildBalanceSheetKey(tenantId, period) {
        return this.buildReportKey(tenantId, 'balance_sheet', period);
    }
    /**
     * Build cache key for Cash Flow Statement report
     */
    static buildCashFlowStatementKey(tenantId, period) {
        return this.buildReportKey(tenantId, 'cash_flow_statement', period);
    }
    /**
     * Build pattern for invalidating all reports for a tenant
     * @param tenantId - Tenant identifier
     * @returns Pattern for KEYS command
     */
    static buildTenantPattern(tenantId) {
        return `tenant:${tenantId}:report:*`;
    }
    /**
     * Build pattern for invalidating specific report type across all tenants
     * @param reportName - Report name
     * @returns Pattern for KEYS command
     */
    static buildReportPattern(reportName) {
        return `tenant:*:report:${reportName}:*`;
    }
}
exports.CacheKeyBuilder = CacheKeyBuilder;
/**
 * TALA Cache Service
 * Manages Redis connections and provides caching operations with tenant isolation
 */
class CacheService {
    /**
     * Initialize Redis connection
     */
    static async connect() {
        if (this.client) {
            return; // Already connected
        }
        if (this.isConnecting && this.connectionPromise) {
            await this.connectionPromise; // Wait for ongoing connection
            return;
        }
        this.isConnecting = true;
        this.connectionPromise = (async () => {
            try {
                this.client = (0, redis_1.createClient)({
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                    password: process.env.REDIS_PASSWORD,
                    socket: {
                        reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
                    },
                });
                this.client.on('error', (err) => {
                    console.error('[Cache] Redis error:', err);
                });
                this.client.on('connect', () => {
                    console.log('[Cache] Redis connected');
                });
                this.client.on('disconnect', () => {
                    console.log('[Cache] Redis disconnected');
                });
                await this.client.connect();
            }
            finally {
                this.isConnecting = false;
            }
        })();
        await this.connectionPromise;
    }
    /**
     * Disconnect from Redis
     */
    static async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
    /**
     * Get Redis client instance
     */
    static getClient() {
        if (!this.client) {
            throw new Error('Cache service not connected. Call connect() first.');
        }
        return this.client;
    }
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null
     */
    static async get(key) {
        const client = this.getClient();
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    }
    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - Time to live in seconds (default: 3600)
     */
    static async set(key, value, ttlSeconds = 3600) {
        const client = this.getClient();
        await client.setEx(key, ttlSeconds, JSON.stringify(value));
    }
    /**
     * Check if key exists in cache
     */
    static async exists(key) {
        const client = this.getClient();
        return (await client.exists(key)) > 0;
    }
    /**
     * Delete key from cache
     */
    static async delete(key) {
        const client = this.getClient();
        await client.del(key);
    }
    /**
     * Delete multiple keys from cache
     */
    static async deleteMany(keys) {
        if (keys.length === 0)
            return;
        const client = this.getClient();
        await client.del(keys);
    }
    /**
     * Invalidate all reports for a tenant
     * @param tenantId - Tenant identifier
     */
    static async invalidateTenantReports(tenantId) {
        const client = this.getClient();
        const pattern = CacheKeyBuilder.buildTenantPattern(tenantId);
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
    }
    /**
     * Invalidate specific report type for a tenant
     * @param tenantId - Tenant identifier
     * @param reportName - Report name
     */
    static async invalidateTenantReport(tenantId, reportName) {
        const client = this.getClient();
        const pattern = `tenant:${tenantId}:report:${reportName}:*`;
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
    }
    /**
     * Get or set pattern - fetch from cache or compute and cache
     * @param key - Cache key
     * @param fetcher - Function to fetch value if not cached
     * @param ttlSeconds - Time to live in seconds
     * @returns Cached or fetched value
     */
    static async getOrSet(key, fetcher, ttlSeconds = 3600) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await fetcher();
        await this.set(key, value, ttlSeconds);
        return value;
    }
    /**
     * Increment a counter in cache
     */
    static async increment(key, amount = 1) {
        const client = this.getClient();
        return await client.incrBy(key, amount);
    }
    /**
     * Decrement a counter in cache
     */
    static async decrement(key, amount = 1) {
        const client = this.getClient();
        return await client.decrBy(key, amount);
    }
    /**
     * Get statistics about cached reports for a tenant
     */
    static async getTenantCacheStats(tenantId) {
        const client = this.getClient();
        const pattern = CacheKeyBuilder.buildTenantPattern(tenantId);
        const keys = await client.keys(pattern);
        return {
            totalKeys: keys.length,
            keys,
        };
    }
    /**
     * Get TTL for a key (in seconds)
     */
    static async getTTL(key) {
        const client = this.getClient();
        return await client.ttl(key);
    }
    /**
     * Set TTL for an existing key
     */
    static async setTTL(key, ttlSeconds) {
        const client = this.getClient();
        return await client.expire(key, ttlSeconds);
    }
}
exports.CacheService = CacheService;
CacheService.client = null;
CacheService.isConnecting = false;
CacheService.connectionPromise = null;
/**
 * Report Cache Manager
 * Provides high-level interface for caching financial reports
 */
class ReportCacheManager {
    /**
     * Cache trial balance report
     * @param tenantId - Tenant identifier
     * @param period - Reporting period
     * @param data - Report data to cache
     * @param ttlSeconds - Cache TTL (default: 24 hours for reports)
     */
    static async cacheTrialBalance(tenantId, period, data, ttlSeconds = 86400) {
        const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, period);
        await CacheService.set(key, data, ttlSeconds);
    }
    /**
     * Get cached trial balance report
     */
    static async getTrialBalance(tenantId, period) {
        const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, period);
        return await CacheService.get(key);
    }
    /**
     * Cache general ledger report
     */
    static async cacheGeneralLedger(tenantId, accountCode, period, data, ttlSeconds = 86400) {
        const key = CacheKeyBuilder.buildGeneralLedgerKey(tenantId, accountCode, period);
        await CacheService.set(key, data, ttlSeconds);
    }
    /**
     * Get cached general ledger report
     */
    static async getGeneralLedger(tenantId, accountCode, period) {
        const key = CacheKeyBuilder.buildGeneralLedgerKey(tenantId, accountCode, period);
        return await CacheService.get(key);
    }
    /**
     * Invalidate trial balance cache for a tenant
     */
    static async invalidateTrialBalance(tenantId) {
        await CacheService.invalidateTenantReport(tenantId, 'trial_balance');
    }
    /**
     * Invalidate general ledger cache for a tenant
     */
    static async invalidateGeneralLedger(tenantId) {
        await CacheService.invalidateTenantReport(tenantId, 'general_ledger');
    }
    /**
     * Cache income statement report
     */
    static async cacheIncomeStatement(tenantId, period, data, ttlSeconds = 86400) {
        const key = CacheKeyBuilder.buildIncomeStatementKey(tenantId, period);
        await CacheService.set(key, data, ttlSeconds);
    }
    /**
     * Get cached income statement report
     */
    static async getIncomeStatement(tenantId, period) {
        const key = CacheKeyBuilder.buildIncomeStatementKey(tenantId, period);
        return await CacheService.get(key);
    }
    /**
     * Cache balance sheet report
     */
    static async cacheBalanceSheet(tenantId, period, data, ttlSeconds = 86400) {
        const key = CacheKeyBuilder.buildBalanceSheetKey(tenantId, period);
        await CacheService.set(key, data, ttlSeconds);
    }
    /**
     * Get cached balance sheet report
     */
    static async getBalanceSheet(tenantId, period) {
        const key = CacheKeyBuilder.buildBalanceSheetKey(tenantId, period);
        return await CacheService.get(key);
    }
    /**
     * Cache cash flow statement report
     */
    static async cacheCashFlowStatement(tenantId, period, data, ttlSeconds = 86400) {
        const key = CacheKeyBuilder.buildCashFlowStatementKey(tenantId, period);
        await CacheService.set(key, data, ttlSeconds);
    }
    /**
     * Get cached cash flow statement report
     */
    static async getCashFlowStatement(tenantId, period) {
        const key = CacheKeyBuilder.buildCashFlowStatementKey(tenantId, period);
        return await CacheService.get(key);
    }
    /**
     * Invalidate income statement cache for a tenant
     */
    static async invalidateIncomeStatement(tenantId) {
        await CacheService.invalidateTenantReport(tenantId, 'income_statement');
    }
    /**
     * Invalidate balance sheet cache for a tenant
     */
    static async invalidateBalanceSheet(tenantId) {
        await CacheService.invalidateTenantReport(tenantId, 'balance_sheet');
    }
    /**
     * Invalidate cash flow statement cache for a tenant
     */
    static async invalidateCashFlowStatement(tenantId) {
        await CacheService.invalidateTenantReport(tenantId, 'cash_flow_statement');
    }
}
exports.ReportCacheManager = ReportCacheManager;
exports.default = CacheService;
//# sourceMappingURL=index.js.map