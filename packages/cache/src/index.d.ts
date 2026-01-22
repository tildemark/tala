/**
 * TALA Cache Service
 * Provides tenant-prefixed Redis caching for heavy financial reports
 * Key format: tenant:{tenantId}:report:{reportName}:{additionalContext}
 */
import { RedisClientType } from 'redis';
export type RedisClient = RedisClientType;
/**
 * Cache Key Builder with tenant-prefix strategy
 */
export declare class CacheKeyBuilder {
    /**
     * Build a tenant-prefixed cache key
     * @param tenantId - Tenant identifier
     * @param reportName - Report name (e.g., trial_balance, general_ledger)
     * @param context - Additional context for key uniqueness (e.g., period, filters)
     * @returns Formatted cache key
     */
    static buildReportKey(tenantId: string, reportName: string, context?: string): string;
    /**
     * Build cache key for Trial Balance report
     * @param tenantId - Tenant identifier
     * @param period - Reporting period (e.g., 2024-01, 2024-Q1)
     * @param filters - Additional filters as context
     * @returns Formatted cache key
     */
    static buildTrialBalanceKey(tenantId: string, period: string, filters?: Record<string, any>): string;
    /**
     * Build cache key for General Ledger report
     * @param tenantId - Tenant identifier
     * @param accountCode - Chart of account code
     * @param period - Reporting period
     * @param filters - Additional filters
     * @returns Formatted cache key
     */
    static buildGeneralLedgerKey(tenantId: string, accountCode: string, period: string, filters?: Record<string, any>): string;
    /**
     * Build cache key for Income Statement report
     */
    static buildIncomeStatementKey(tenantId: string, period: string): string;
    /**
     * Build cache key for Balance Sheet report
     */
    static buildBalanceSheetKey(tenantId: string, period: string): string;
    /**
     * Build cache key for Cash Flow Statement report
     */
    static buildCashFlowStatementKey(tenantId: string, period: string): string;
    /**
     * Build pattern for invalidating all reports for a tenant
     * @param tenantId - Tenant identifier
     * @returns Pattern for KEYS command
     */
    static buildTenantPattern(tenantId: string): string;
    /**
     * Build pattern for invalidating specific report type across all tenants
     * @param reportName - Report name
     * @returns Pattern for KEYS command
     */
    static buildReportPattern(reportName: string): string;
}
/**
 * TALA Cache Service
 * Manages Redis connections and provides caching operations with tenant isolation
 */
export declare class CacheService {
    private static client;
    private static isConnecting;
    private static connectionPromise;
    /**
     * Initialize Redis connection
     */
    static connect(): Promise<void>;
    /**
     * Disconnect from Redis
     */
    static disconnect(): Promise<void>;
    /**
     * Get Redis client instance
     */
    static getClient(): RedisClient;
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null
     */
    static get(key: string): Promise<any>;
    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - Time to live in seconds (default: 3600)
     */
    static set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    /**
     * Check if key exists in cache
     */
    static exists(key: string): Promise<boolean>;
    /**
     * Delete key from cache
     */
    static delete(key: string): Promise<void>;
    /**
     * Delete multiple keys from cache
     */
    static deleteMany(keys: string[]): Promise<void>;
    /**
     * Invalidate all reports for a tenant
     * @param tenantId - Tenant identifier
     */
    static invalidateTenantReports(tenantId: string): Promise<void>;
    /**
     * Invalidate specific report type for a tenant
     * @param tenantId - Tenant identifier
     * @param reportName - Report name
     */
    static invalidateTenantReport(tenantId: string, reportName: string): Promise<void>;
    /**
     * Get or set pattern - fetch from cache or compute and cache
     * @param key - Cache key
     * @param fetcher - Function to fetch value if not cached
     * @param ttlSeconds - Time to live in seconds
     * @returns Cached or fetched value
     */
    static getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    /**
     * Increment a counter in cache
     */
    static increment(key: string, amount?: number): Promise<number>;
    /**
     * Decrement a counter in cache
     */
    static decrement(key: string, amount?: number): Promise<number>;
    /**
     * Get statistics about cached reports for a tenant
     */
    static getTenantCacheStats(tenantId: string): Promise<{
        totalKeys: number;
        keys: string[];
    }>;
    /**
     * Get TTL for a key (in seconds)
     */
    static getTTL(key: string): Promise<number>;
    /**
     * Set TTL for an existing key
     */
    static setTTL(key: string, ttlSeconds: number): Promise<boolean>;
}
/**
 * Report Cache Manager
 * Provides high-level interface for caching financial reports
 */
export declare class ReportCacheManager {
    /**
     * Cache trial balance report
     * @param tenantId - Tenant identifier
     * @param period - Reporting period
     * @param data - Report data to cache
     * @param ttlSeconds - Cache TTL (default: 24 hours for reports)
     */
    static cacheTrialBalance(tenantId: string, period: string, data: any, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached trial balance report
     */
    static getTrialBalance(tenantId: string, period: string): Promise<any | null>;
    /**
     * Cache general ledger report
     */
    static cacheGeneralLedger(tenantId: string, accountCode: string, period: string, data: any, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached general ledger report
     */
    static getGeneralLedger(tenantId: string, accountCode: string, period: string): Promise<any | null>;
    /**
     * Invalidate trial balance cache for a tenant
     */
    static invalidateTrialBalance(tenantId: string): Promise<void>;
    /**
     * Invalidate general ledger cache for a tenant
     */
    static invalidateGeneralLedger(tenantId: string): Promise<void>;
    /**
     * Cache income statement report
     */
    static cacheIncomeStatement(tenantId: string, period: string, data: any, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached income statement report
     */
    static getIncomeStatement(tenantId: string, period: string): Promise<any | null>;
    /**
     * Cache balance sheet report
     */
    static cacheBalanceSheet(tenantId: string, period: string, data: any, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached balance sheet report
     */
    static getBalanceSheet(tenantId: string, period: string): Promise<any | null>;
    /**
     * Cache cash flow statement report
     */
    static cacheCashFlowStatement(tenantId: string, period: string, data: any, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached cash flow statement report
     */
    static getCashFlowStatement(tenantId: string, period: string): Promise<any | null>;
    /**
     * Invalidate income statement cache for a tenant
     */
    static invalidateIncomeStatement(tenantId: string): Promise<void>;
    /**
     * Invalidate balance sheet cache for a tenant
     */
    static invalidateBalanceSheet(tenantId: string): Promise<void>;
    /**
     * Invalidate cash flow statement cache for a tenant
     */
    static invalidateCashFlowStatement(tenantId: string): Promise<void>;
}
export default CacheService;
//# sourceMappingURL=index.d.ts.map