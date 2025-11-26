import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-development-only';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    subscriptionStatus: string;
  };
}

export function generateToken(user: any): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      subscriptionStatus: user.subscriptionStatus 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    
    // Log access for compliance
    await logActivity(decoded.id, 'api_access', 'authentication', req.path, {
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export async function requireSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  // Check if trial has expired
  if (req.user.subscriptionStatus === 'trial') {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (user && user.trialEndsAt && new Date() > user.trialEndsAt) {
      return res.status(403).json({ 
        error: 'Trial period has expired. Please upgrade your subscription.',
        subscriptionStatus: 'expired'
      });
    }
  }

  next();
}

export async function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

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
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}