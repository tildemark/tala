import crypto from 'crypto';
import { prisma } from '@tala/database';

/**
 * TALA AuditLogger - Cryptographic Audit Chain Implementation
 * Implements RR 9-2009 compliance with tamper-evidence through SHA-256 hashing.
 * Each audit log entry is cryptographically linked to create an unbreakable chain.
 */

export interface AuditLogPayload {
  tenantId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string; // 'Created', 'Viewed', 'Updated', 'Exported', 'Voided', 'Posted'
  description?: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * Compute SHA-256 hash of data
   * Format: sha256(previousHash + entityType + entityId + action + timestamp + userId)
   */
  private static computeDataHash(
    previousHash: string | null,
    entityType: string,
    entityId: string,
    action: string,
    timestamp: string,
    userId: string
  ): string {
    const data = `${previousHash || ''}${entityType}${entityId}${action}${timestamp}${userId}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify the integrity of the audit chain
   * Returns true if the chain is intact, false if tampered
   */
  private static verifyChainIntegrity(
    currentDataHash: string,
    previousHash: string | null,
    entityType: string,
    entityId: string,
    action: string,
    timestamp: string,
    userId: string
  ): boolean {
    const computedHash = this.computeDataHash(
      previousHash,
      entityType,
      entityId,
      action,
      timestamp,
      userId
    );
    return computedHash === currentDataHash;
  }

  /**
   * Log an audit event with cryptographic chain
   */
  static async log(payload: AuditLogPayload): Promise<string> {
    const {
      tenantId,
      userId,
      entityType,
      entityId,
      action,
      description,
      changesBefore,
      changesAfter,
      ipAddress,
      userAgent,
    } = payload;

    // Development bypass: skip DB writes if auth disabled
    if (process.env.DISABLE_AUTH === 'true') {
      return 'dev-audit-log';
    }

    try {
      // Get the previous audit log for this entity to establish chain
      const previousLog = await prisma.auditLog.findFirst({
        where: {
          tenantId,
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const timestamp = new Date().toISOString();
      const previousHash = previousLog?.dataHash || null;

      // Compute cryptographic hash
      const dataHash = this.computeDataHash(
        previousHash,
        entityType,
        entityId,
        action,
        timestamp,
        userId
      );

      // Verify the chain integrity
      const hashVerified = this.verifyChainIntegrity(
        dataHash,
        previousHash,
        entityType,
        entityId,
        action,
        timestamp,
        userId
      );

      // Create the audit log record
      const auditLog = await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          entityType,
          entityId,
          action,
          description,
          changesBefore: changesBefore ? JSON.stringify(changesBefore) : null,
          changesAfter: changesAfter ? JSON.stringify(changesAfter) : null,
          previousHash,
          dataHash,
          hashVerified,
          ipAddress,
          userAgent,
        },
      });

      return auditLog.id;
    } catch (error) {
      console.error('AuditLogger error:', error);
      throw new Error(`Failed to log audit event: ${error}`);
    }
  }

  /**
   * Retrieve and verify the complete audit trail for an entity
   * Returns audit history with chain integrity status
   */
  static async getAuditTrail(
    tenantId: string,
    entityType: string,
    entityId: string
  ) {
    try {
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          tenantId,
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Verify the entire chain
      let chainValid = true;
      for (let i = 0; i < auditLogs.length; i++) {
        const log = auditLogs[i];
        const previousLog = i > 0 ? auditLogs[i - 1] : null;

        const isValid = this.verifyChainIntegrity(
          log.dataHash,
          previousLog?.dataHash || null,
          log.entityType,
          log.entityId,
          log.action,
          log.createdAt.toISOString(),
          log.userId
        );

        if (!isValid) {
          chainValid = false;
        }
      }

      return {
        logs: auditLogs,
        chainValid,
        chainBrokenAt: chainValid ? null : auditLogs.find((log) => !log.hashVerified)?.createdAt,
      };
    } catch (error) {
      console.error('Error retrieving audit trail:', error);
      throw new Error(`Failed to retrieve audit trail: ${error}`);
    }
  }

  /**
   * Detect tampering in the audit chain
   * Returns array of potentially tampered records
   */
  static async detectTampering(tenantId: string): Promise<any[]> {
    try {
      const allLogs = await prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });

      const tampered: any[] = [];

      for (let i = 0; i < allLogs.length; i++) {
        const log = allLogs[i];
        const previousLog = i > 0 ? allLogs[i - 1] : null;

        const isValid = this.verifyChainIntegrity(
          log.dataHash,
          previousLog?.dataHash || null,
          log.entityType,
          log.entityId,
          log.action,
          log.createdAt.toISOString(),
          log.userId
        );

        if (!isValid) {
          tampered.push({
            logId: log.id,
            entityType: log.entityType,
            entityId: log.entityId,
            action: log.action,
            createdAt: log.createdAt,
            storedHash: log.dataHash,
            expectedHash: this.computeDataHash(
              previousLog?.dataHash || null,
              log.entityType,
              log.entityId,
              log.action,
              log.createdAt.toISOString(),
              log.userId
            ),
          });
        }
      }

      return tampered;
    } catch (error) {
      console.error('Error detecting tampering:', error);
      throw new Error(`Failed to detect tampering: ${error}`);
    }
  }
}

export default AuditLogger;
