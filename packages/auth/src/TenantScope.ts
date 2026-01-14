import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@tala/database';
import AuditLogger from '@tala/audit';

/**
 * JWT Payload Structure
 */
export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  roleId: string;
  permissions: string[]; // Array of permission codes
  iat: number;
  exp: number;
}

/**
 * Extended Express Request with tenant & user context
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        slug: string;
      };
      user?: {
        id: string;
        email: string;
        roleId: string;
        permissions: string[];
      };
      auth?: JWTPayload;
    }
  }
}

/**
 * TALA TenantScope Middleware
 * Validates JWT, enforces multi-tenancy data isolation, and validates permissions
 */

/**
 * Middleware: Verify JWT and extract tenant context
 * Must be applied before any protected routes
 */
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development bypass: allow requests without JWT when DISABLE_AUTH=true
    if (process.env.DISABLE_AUTH === 'true') {
      req.auth = {
        userId: 'dev-user',
        tenantId: 'dev-tenant',
        email: 'admin@example.com',
        roleId: 'company_admin',
        permissions: [
          'can_view_ledger',
          'can_view_reports',
          'can_create_journal_entry',
          'can_post_ledger',
          'can_manage_reports',
        ],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      req.user = {
        id: 'dev-user',
        email: 'admin@example.com',
        roleId: 'company_admin',
        permissions: req.auth.permissions,
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    req.auth = decoded;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'JWT token has expired',
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid JWT token',
      });
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: String(error),
    });
  }
};

/**
 * Middleware: Validate tenant context and ensure data isolation
 * Runs after verifyJWT
 */
export const validateTenantScope = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Development bypass: inject dummy tenant when auth disabled
    if (process.env.DISABLE_AUTH === 'true') {
      req.tenant = {
        id: 'dev-tenant',
        name: 'Dev Tenant',
        slug: 'dev',
      };
      return next();
    }
    if (!req.auth) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Auth context not found. Run verifyJWT middleware first.',
      });
    }

    // Get tenant ID from JWT
    const { tenantId } = req.auth;

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(403).json({
        error: 'TenantNotFound',
        message: 'Tenant does not exist',
      });
    }

    if (tenant.deletedAt) {
      return res.status(403).json({
        error: 'TenantDeleted',
        message: 'Tenant has been deleted',
      });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'UserNotFound',
        message: 'User does not exist',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'UserInactive',
        message: 'User account is inactive',
      });
    }

    // Verify user belongs to the tenant
    if (user.tenantId !== tenantId) {
      // Log potential unauthorized access attempt
      await AuditLogger.log({
        tenantId,
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        action: 'UnauthorizedAccessAttempt',
        description: `User ${user.email} attempted to access tenant ${tenantId} without proper assignment`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(console.error);

      return res.status(403).json({
        error: 'TenantMismatch',
        message: 'User is not assigned to this tenant',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(console.error);

    // Attach tenant context to request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
    };

    // Update permissions from database (for consistency)
    req.user!.permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.code
    );

    next();
  } catch (error) {
    console.error('TenantScope validation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to validate tenant scope',
    });
  }
};

/**
 * Middleware: Check specific permission
 * Usage: requirePermission('can_post_ledger')
 */
export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Development bypass: skip permission checks
    if (process.env.DISABLE_AUTH === 'true') {
      return next();
    }
    if (!req.user?.permissions.includes(requiredPermission)) {
      // Log unauthorized permission attempt
      AuditLogger.log({
        tenantId: req.tenant?.id || 'unknown',
        userId: req.user?.id || 'unknown',
        entityType: 'Permission',
        entityId: requiredPermission,
        action: 'UnauthorizedPermissionAttempt',
        description: `User lacked permission: ${requiredPermission}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(console.error);

      return res.status(403).json({
        error: 'InsufficientPermissions',
        message: `This action requires the '${requiredPermission}' permission`,
      });
    }
    next();
  };
};

/**
 * Middleware: Ensure tenantId in request matches authenticated tenant
 * Usage: validateTenantIdParam
 * Expects tenantId in query, body, or params
 */
export const validateTenantIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Development bypass: skip tenantId param validation
  if (process.env.DISABLE_AUTH === 'true') {
    return next();
  }
  const requestTenantId = req.query.tenantId ||
    req.body?.tenantId ||
    req.params.tenantId;

  if (requestTenantId && requestTenantId !== req.tenant?.id) {
    AuditLogger.log({
      tenantId: req.tenant?.id || 'unknown',
      userId: req.user?.id || 'unknown',
      entityType: 'Tenant',
      entityId: String(requestTenantId),
      action: 'CrossTenantAccessAttempt',
      description: `Attempted cross-tenant access`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(console.error);

    return res.status(403).json({
      error: 'TenantMismatch',
      message: 'Cannot access resources from a different tenant',
    });
  }

  next();
};

/**
 * Helper: Ensure all database queries are scoped to tenant
 * Usage: In route handlers, always filter by tenantId
 * Example: prisma.chartOfAccount.findMany({ where: { tenantId: req.tenant!.id } })
 */
export const getTenantId = (req: Request): string => {
  if (!req.tenant?.id) {
    throw new Error('Tenant context not found. Did you apply validateTenantScope?');
  }
  return req.tenant.id;
};

export const getUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new Error('User context not found. Did you apply verifyJWT?');
  }
  return req.user.id;
};

/**
 * Full middleware stack for protected routes
 * Usage: router.get('/protected', tenantProtected, (req, res) => { ... })
 */
export const tenantProtected = [verifyJWT, validateTenantScope, validateTenantIdParam];

export default {
  verifyJWT,
  validateTenantScope,
  requirePermission,
  validateTenantIdParam,
  getTenantId,
  getUserId,
  tenantProtected,
};
