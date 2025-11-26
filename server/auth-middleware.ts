import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users, auditLogs } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    subscriptionStatus: string;
  };
}

// Simple authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Role-based access control
export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Subscription validation
export function requireSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const validStatuses = ['trial', 'active'];
  if (!validStatuses.includes(req.user.subscriptionStatus)) {
    return res.status(403).json({ 
      error: 'Active subscription required',
      subscriptionStatus: req.user.subscriptionStatus
    });
  }

  next();
}

// Generate JWT token
export function generateToken(user: any): string {
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus
  }, JWT_SECRET, { expiresIn: '24h' });
}

// Activity logging for compliance
export async function logActivity(
  userId: number | null,
  action: string,
  resourceType: string,
  resourceId: string,
  details: any = {},
  req?: Request
) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resourceType,
      resourceId,
      details: JSON.stringify(details),
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('User-Agent') || 'unknown',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}