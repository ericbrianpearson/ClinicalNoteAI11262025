import { Express, Request, Response } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, logActivity } from './auth';

export function registerTestBillingRoutes(app: Express) {
  // Test mode checkout session - immediately activates subscription
  app.post('/api/billing/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { priceId, planType } = req.body;
      const userId = req.user!.id;

      await logActivity(userId, 'subscription_checkout_test', 'billing', 'test_session', {
        planType,
        priceId,
        testMode: true,
      });

      // Immediately activate subscription in test mode
      await db.update(users)
        .set({
          subscriptionStatus: 'active',
          subscriptionId: 'test_subscription_' + Date.now(),
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
        .where(eq(users.id, userId));

      res.json({ 
        sessionId: 'test_session_' + Date.now(),
        testMode: true,
        message: 'Test mode: Subscription activated immediately'
      });
    } catch (error) {
      console.error('Test checkout error:', error);
      res.status(500).json({ error: 'Failed to create test subscription' });
    }
  });

  // Test billing portal
  app.post('/api/billing/create-portal-session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    res.json({ 
      url: '/dashboard',
      testMode: true,
      message: 'Test mode: Billing portal not available'
    });
  });

  // Test subscription status
  app.get('/api/billing/subscription', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        testMode: true,
        subscription: null,
      });
    } catch (error) {
      console.error('Subscription fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Test webhook endpoint
  app.post('/api/billing/webhook', async (req: Request, res: Response) => {
    res.json({ received: true, testMode: true });
  });
}