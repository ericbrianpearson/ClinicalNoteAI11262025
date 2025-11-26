import { Request, Response, NextFunction } from 'express';
import { hasPermission, canAccessResource, UserRole, Permission, PermissionAudit } from '@shared/rbac';
import { secureLog } from './logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    permissions: Permission[];
    isActive: boolean;
  };
}

// Audit trail for HIPAA compliance
async function logPermissionCheck(audit: PermissionAudit) {
  try {
    secureLog.info('Permission check performed', {
      userId: audit.userId,
      userRole: audit.userRole,
      permission: audit.permission,
      resource: audit.resource,
      action: audit.action,
      granted: audit.granted,
      timestamp: audit.timestamp,
      ipAddress: audit.ipAddress,
      userAgent: audit.userAgent
    });
    
    // Store in audit table for compliance
    // In production, this would write to a secure audit log database
  } catch (error) {
    console.error('Failed to log permission check:', error);
  }
}

// Middleware to check if user has required permission
export function requirePermission(permission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      const hasRequiredPermission = hasPermission(user.role, permission);
      
      // Log permission check for audit trail
      await logPermissionCheck({
        userId: user.id,
        userRole: user.role,
        permission,
        resource: req.path,
        action: req.method,
        granted: hasRequiredPermission,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      if (!hasRequiredPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
}

// Middleware to check if user can access resource type
export function requireResourceAccess(resourceType: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const canAccess = canAccessResource(user.role, resourceType);
      
      // Log resource access check
      await logPermissionCheck({
        userId: user.id,
        userRole: user.role,
        permission: 'RESOURCE_ACCESS' as Permission,
        resource: resourceType,
        action: req.method,
        granted: canAccess,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      if (!canAccess) {
        return res.status(403).json({ 
          error: `Access denied to ${resourceType}`,
          code: 'RESOURCE_ACCESS_DENIED',
          resourceType,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during resource access check',
        code: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
}

// Middleware to check multiple permissions (user must have at least one)
export function requireAnyPermission(permissions: Permission[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const hasAnyRequiredPermission = permissions.some(permission => 
        hasPermission(user.role, permission)
      );
      
      // Log permission check
      await logPermissionCheck({
        userId: user.id,
        userRole: user.role,
        permission: permissions[0], // Log first permission for reference
        resource: req.path,
        action: req.method,
        granted: hasAnyRequiredPermission,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      if (!hasAnyRequiredPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissions,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
}

// Middleware for role-based route protection
export function requireRole(role: UserRole) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (user.role !== role) {
        // Log role check
        await logPermissionCheck({
          userId: user.id,
          userRole: user.role,
          permission: 'ROLE_ACCESS' as Permission,
          resource: req.path,
          action: req.method,
          granted: false,
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(403).json({ 
          error: `Role ${role} required`,
          code: 'INSUFFICIENT_ROLE',
          required: role,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during role check',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
}

// Enhanced authentication middleware with RBAC
export async function authenticateWithRBAC(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verify JWT token (implement your token verification logic)
    // This is a simplified version - in production use proper JWT verification
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Attach user to request
    req.user = user;
    
    // Log authentication
    secureLog.info('User authenticated', {
      userId: user.id,
      userRole: user.role,
      endpoint: req.path,
      method: req.method,
      ipAddress: req.ip
    });

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
}

// Mock token verification - replace with actual JWT verification
async function verifyToken(token: string) {
  // In production, implement proper JWT verification with your secret key
  try {
    // Mock user for development
    if (token === 'test-token') {
      return {
        id: 1,
        email: 'admin@nexxusbridge.com',
        role: 'admin' as UserRole,
        permissions: [],
        isActive: true
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Utility function to get user's effective permissions
export function getUserPermissions(user: { role: UserRole }) {
  const { ROLE_PERMISSIONS } = require('@shared/rbac');
  return ROLE_PERMISSIONS[user.role] || [];
}