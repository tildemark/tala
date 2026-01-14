/**
 * TALA Cache Service
 * Provides tenant-prefixed Redis caching for heavy financial reports
 * Key format: tenant:{tenantId}:report:{reportName}:{additionalContext}
 */

import { createClient, RedisClientType } from 'redis';

export type RedisClient = RedisClientType;

/**
 * Cache Key Builder with tenant-prefix strategy
 */
export class CacheKeyBuilder {
  /**
   * Build a tenant-prefixed cache key
   * @param tenantId - Tenant identifier
   * @param reportName - Report name (e.g., trial_balance, general_ledger)
   * @param context - Additional context for key uniqueness (e.g., period, filters)
   * @returns Formatted cache key
   */
  static buildReportKey(
    tenantId: string,
    reportName: string,
    context?: string
  ): string {
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
  static buildTrialBalanceKey(
    tenantId: string,
    period: string,
    filters?: Record<string, any>
  ): string {
    const filterContext = filters
      ? Object.entries(filters)
          .map(([k, v]) => `${k}=${v}`)
          .join('|')
      : '';
    return this.buildReportKey(
      tenantId,
      'trial_balance',
      `${period}${filterContext ? `:${filterContext}` : ''}`
    );
  }

  /**
   * Build cache key for General Ledger report
   * @param tenantId - Tenant identifier
   * @param accountCode - Chart of account code
   * @param period - Reporting period
   * @param filters - Additional filters
   * @returns Formatted cache key
   */
  static buildGeneralLedgerKey(
    tenantId: string,
    accountCode: string,
    period: string,
    filters?: Record<string, any>
  ): string {
    const filterContext = filters
      ? Object.entries(filters)
          .map(([k, v]) => `${k}=${v}`)
          .join('|')
      : '';
    return this.buildReportKey(
      tenantId,
      'general_ledger',
      `${accountCode}:${period}${filterContext ? `:${filterContext}` : ''}`
    );
  }

  /**
   * Build pattern for invalidating all reports for a tenant
   * @param tenantId - Tenant identifier
   * @returns Pattern for KEYS command
   */
  static buildTenantPattern(tenantId: string): string {
    return `tenant:${tenantId}:report:*`;
  }

  /**
   * Build pattern for invalidating specific report type across all tenants
   * @param reportName - Report name
   * @returns Pattern for KEYS command
   */
  static buildReportPattern(reportName: string): string {
    return `tenant:*:report:${reportName}:*`;
  }
}

/**
 * TALA Cache Service
 * Manages Redis connections and provides caching operations with tenant isolation
 */
export class CacheService {
  private static client: RedisClient | null = null;
  private static isConnecting = false;
  private static connectionPromise: Promise<void> | null = null;

  /**
   * Initialize Redis connection
   */
  static async connect(): Promise<void> {
    if (this.client) {
      return; // Already connected
    }

    if (this.isConnecting) {
      return this.connectionPromise; // Wait for ongoing connection
    }

    this.isConnecting = true;
    this.connectionPromise = (async () => {
      try {
        this.client = createClient({
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
      } finally {
        this.isConnecting = false;
      }
    })();

    await this.connectionPromise;
  }

  /**
   * Disconnect from Redis
   */
  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Get Redis client instance
   */
  static getClient(): RedisClient {
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
  static async get(key: string): Promise<any> {
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
  static async set(
    key: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const client = this.getClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    return (await client.exists(key)) > 0;
  }

  /**
   * Delete key from cache
   */
  static async delete(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  /**
   * Delete multiple keys from cache
   */
  static async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const client = this.getClient();
    await client.del(keys);
  }

  /**
   * Invalidate all reports for a tenant
   * @param tenantId - Tenant identifier
   */
  static async invalidateTenantReports(tenantId: string): Promise<void> {
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
  static async invalidateTenantReport(
    tenantId: string,
    reportName: string
  ): Promise<void> {
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
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
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
  static async increment(key: string, amount: number = 1): Promise<number> {
    const client = this.getClient();
    return await client.incrBy(key, amount);
  }

  /**
   * Decrement a counter in cache
   */
  static async decrement(key: string, amount: number = 1): Promise<number> {
    const client = this.getClient();
    return await client.decrBy(key, amount);
  }

  /**
   * Get statistics about cached reports for a tenant
   */
  static async getTenantCacheStats(tenantId: string): Promise<{
    totalKeys: number;
    keys: string[];
  }> {
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
  static async getTTL(key: string): Promise<number> {
    const client = this.getClient();
    return await client.ttl(key);
  }

  /**
   * Set TTL for an existing key
   */
  static async setTTL(key: string, ttlSeconds: number): Promise<boolean> {
    const client = this.getClient();
    return await client.expire(key, ttlSeconds);
  }
}

/**
 * Report Cache Manager
 * Provides high-level interface for caching financial reports
 */
export class ReportCacheManager {
  /**
   * Cache trial balance report
   * @param tenantId - Tenant identifier
   * @param period - Reporting period
   * @param data - Report data to cache
   * @param ttlSeconds - Cache TTL (default: 24 hours for reports)
   */
  static async cacheTrialBalance(
    tenantId: string,
    period: string,
    data: any,
    ttlSeconds: number = 86400
  ): Promise<void> {
    const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, period);
    await CacheService.set(key, data, ttlSeconds);
  }

  /**
   * Get cached trial balance report
   */
  static async getTrialBalance(
    tenantId: string,
    period: string
  ): Promise<any | null> {
    const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, period);
    return await CacheService.get(key);
  }

  /**
   * Cache general ledger report
   */
  static async cacheGeneralLedger(
    tenantId: string,
    accountCode: string,
    period: string,
    data: any,
    ttlSeconds: number = 86400
  ): Promise<void> {
    const key = CacheKeyBuilder.buildGeneralLedgerKey(
      tenantId,
      accountCode,
      period
    );
    await CacheService.set(key, data, ttlSeconds);
  }

  /**
   * Get cached general ledger report
   */
  static async getGeneralLedger(
    tenantId: string,
    accountCode: string,
    period: string
  ): Promise<any | null> {
    const key = CacheKeyBuilder.buildGeneralLedgerKey(
      tenantId,
      accountCode,
      period
    );
    return await CacheService.get(key);
  }

  /**
   * Invalidate trial balance cache for a tenant
   */
  static async invalidateTrialBalance(tenantId: string): Promise<void> {
    await CacheService.invalidateTenantReport(tenantId, 'trial_balance');
  }

  /**
   * Invalidate general ledger cache for a tenant
   */
  static async invalidateGeneralLedger(tenantId: string): Promise<void> {
    await CacheService.invalidateTenantReport(tenantId, 'general_ledger');
  }
}

export default CacheService;
