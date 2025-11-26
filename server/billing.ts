import { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, logActivity } from './auth';

// Initialize Stripe only if API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== '') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
};

export function registerBillingRoutes(app: Express) {
  // Create checkout session
  app.post('/api/billing/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { priceId, planType } = req.body;
      const userId = req.user!.id;

      // Test mode - simulate subscription activation
      if (!stripe) {
        await logActivity(userId, 'subscription_checkout_initiated_test', 'billing', 'test_session', {
          planType,
          priceId,
          testMode: true,
        });

        // Simulate successful subscription activation in test mode
        await db.update(users)
          .set({
            subscriptionStatus: 'active',
            subscriptionId: 'test_subscription_' + Date.now(),
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          })
          .where(eq(users.id, userId));

        return res.json({ 
          sessionId: 'test_session_' + Date.now(),
          testMode: true,
          message: 'Test mode: Subscription activated immediately'
        });
      }

      // Get user from database
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let customerId = user.customerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: userId.toString(),
            practiceType: user.practiceType,
          },
        });
        customerId = customer.id;

        // Update user with customer ID
        await db.update(users)
          .set({ customerId })
          .where(eq(users.id, userId));
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        metadata: {
          userId: userId.toString(),
          planType,
        },
      });

      await logActivity(userId, 'subscription_checkout_initiated', 'billing', session.id, {
        planType,
        priceId,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Checkout session creation error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Get billing portal session
  app.post('/api/billing/create-portal-session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || !user.customerId) {
        return res.status(404).json({ error: 'No billing account found' });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.customerId,
        return_url: `${req.headers.origin}/dashboard`,
      });

      await logActivity(userId, 'billing_portal_accessed', 'billing', session.id);

      res.json({ url: session.url });
    } catch (error) {
      console.error('Portal session creation error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  // Stripe webhook handler
  app.post('/api/billing/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Get subscription status
  app.get('/api/billing/subscription', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let subscriptionData = null;
      if (user.subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
          subscriptionData = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            priceId: subscription.items.data[0]?.price.id,
          };
        } catch (stripeError) {
          console.error('Failed to fetch Stripe subscription:', stripeError);
        }
      }

      res.json({
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        subscription: subscriptionData,
      });
    } catch (error) {
      console.error('Subscription fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.userId || '0');
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  await db.update(users)
    .set({
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, userId));

  await logActivity(userId, 'subscription_activated', 'billing', subscription.id, {
    planType: session.metadata?.planType,
    amount: session.amount_total,
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = parseInt(customer.metadata?.userId || '0');
  
  if (!userId) return;

  await db.update(users)
    .set({
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, userId));

  await logActivity(userId, 'payment_succeeded', 'billing', invoice.id, {
    amount: invoice.amount_paid,
    currency: invoice.currency,
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = parseInt(customer.metadata?.userId || '0');
  
  if (!userId) return;

  await logActivity(userId, 'payment_failed', 'billing', invoice.id, {
    amount: invoice.amount_due,
    currency: invoice.currency,
    nextPaymentAttempt: invoice.next_payment_attempt,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = parseInt(customer.metadata?.userId || '0');
  
  if (!userId) return;

  const status = subscription.status === 'active' ? 'active' : 
                subscription.status === 'past_due' ? 'active' : 'canceled';

  await db.update(users)
    .set({
      subscriptionStatus: status,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, userId));

  await logActivity(userId, 'subscription_updated', 'billing', subscription.id, {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = parseInt(customer.metadata?.userId || '0');
  
  if (!userId) return;

  await db.update(users)
    .set({
      subscriptionStatus: 'canceled',
      subscriptionId: null,
    })
    .where(eq(users.id, userId));

  await logActivity(userId, 'subscription_canceled', 'billing', subscription.id);
}