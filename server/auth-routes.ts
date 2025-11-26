import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateToken, authenticateToken, logActivity, type AuthenticatedRequest } from "./auth-middleware";

export function registerAuthRoutes(app: Express) {
  // Login endpoint
  app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ], async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user);

      // Log successful login
      await logActivity(user.id, 'LOGIN', 'USER', user.id.toString(), { email }, req);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register endpoint
  app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().isLength({ min: 1 }),
    body('lastName').trim().isLength({ min: 1 })
  ], async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        username: email, // Use email as username for simplicity
        passwordHash,
        firstName,
        lastName,
        practiceType: 'family_medicine',
        role: 'practitioner',
        subscriptionStatus: 'trial',
        isActive: true
      }).returning();

      // Generate token
      const token = generateToken(newUser);

      // Log registration
      await logActivity(newUser.id, 'REGISTER', 'USER', newUser.id.toString(), { email }, req);

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          subscriptionStatus: newUser.subscriptionStatus
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        await logActivity(req.user.id, 'LOGOUT', 'USER', req.user.id.toString(), {}, req);
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update subscription status
  app.patch('/api/auth/subscription', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { subscriptionStatus } = req.body;
      
      if (!['trial', 'active', 'inactive', 'cancelled'].includes(subscriptionStatus)) {
        return res.status(400).json({ error: 'Invalid subscription status' });
      }

      await db.update(users)
        .set({ subscriptionStatus })
        .where(eq(users.id, req.user.id));

      await logActivity(req.user.id, 'UPDATE_SUBSCRIPTION', 'USER', req.user.id.toString(), { subscriptionStatus }, req);

      res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}