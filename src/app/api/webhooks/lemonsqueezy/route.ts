import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { type Order, type Subscription, getCustomer, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { PrismaClient, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from '@prisma/client';
import { updateUserLemonSqueezyPaymentDetails } from '@/lib/lemonsqueezy/payment-details';

const prisma = new PrismaClient();
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

// Initialize LemonSqueezy with API key
lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature');

    // Log the request headers for debugging
    console.log('LemonSqueezy webhook received:', {
      headers: Object.fromEntries(req.headers.entries()),
      bodyLength: body.length,
      hasSignature: !!signature,
    });

    // Validate signature if present
    if (signature) {
      const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
      const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
      const signature_buffer = Buffer.from(signature, 'utf8');

      if (!crypto.timingSafeEqual(signature_buffer, digest)) {
        console.warn('LemonSqueezy webhook: Invalid signature');
        // Still return 200 to avoid retries for test pings
        if (process.env.NODE_ENV === 'development') {
          return new NextResponse('Signature verification failed but accepted in development', { status: 200 });
        }
        return new NextResponse('Invalid signature', { status: 400 });
      }
    } else {
      console.warn('LemonSqueezy webhook: Missing signature header');
      // Still return 200 to avoid retries for test pings in development
      if (process.env.NODE_ENV === 'development') {
        return new NextResponse('Missing signature but accepted in development', { status: 200 });
      }
      return new NextResponse('Webhook signature missing', { status: 400 });
    }

    // Parse event data
    let event;
    try {
      event = JSON.parse(body);
      console.log('LemonSqueezy webhook event type:', event?.meta?.event_name);
    } catch (error) {
      console.error('LemonSqueezy webhook: Failed to parse JSON body', error);
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    // Handle the case of test pings or simulator events which might not have user_id
    if (!event?.meta?.custom_data?.user_id) {
      console.log('LemonSqueezy webhook: No user_id in custom_data, likely a test ping');
      // For test pings or verification, we still return 200 to confirm the endpoint works
      return new NextResponse('Webhook received - no user data to process', { status: 200 });
    }

    const clerkUserId = event.meta.custom_data.user_id;
    
    // Get the user from the database directly using Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      console.warn(`LemonSqueezy webhook: User not found for Clerk ID: ${clerkUserId}`);
      // Return 200 to avoid retries for non-existent users
      return new NextResponse('User not found - webhook acknowledged', { status: 200 });
    }

    const userId = user.id;
    console.log(`LemonSqueezy webhook: Processing event ${event.meta.event_name} for user ${userId}`);

    switch (event.meta.event_name) {
      case 'order_created':
        await handleOrderCreated(event as Order, userId);
        break;
      case 'subscription_created':
        await handleSubscriptionCreated(event as Subscription, userId);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(event as Subscription, userId);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event as Subscription, userId);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(event as Subscription, userId);
        break;
      default:
        console.warn('LemonSqueezy webhook: Unhandled event type:', event.meta.event_name);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('LemonSqueezy webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function handleOrderCreated(data: Order, userId: string) {
  const { customer_id, status, first_order_item } = data.data.attributes;
  const customerId = customer_id.toString();

  const { data: customer, error } = await getCustomer(customerId);
  if (error) {
    throw new Error(`Error fetching customer portal URL: ${error}`);
  }

  const lemonSqueezyCustomerPortalUrl = customer.data.attributes.urls.customer_portal;
  if (!lemonSqueezyCustomerPortalUrl) {
    throw new Error('No customer portal URL found');
  }

  if (status === 'paid') {
    await updateUserLemonSqueezyPaymentDetails(
      {
        customerId,
        userId,
        subscriptionPlan: SUBSCRIPTION_PLAN.PRO,
        subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
        lemonSqueezyCustomerPortalUrl,
      },
      prisma
    );
  }
}

async function handleSubscriptionCreated(data: Subscription, userId: string) {
  const { customer_id, status } = data.data.attributes;
  const customerId = customer_id.toString();

  if (status === 'active') {
    await updateUserLemonSqueezyPaymentDetails(
      {
        customerId,
        userId,
        subscriptionPlan: SUBSCRIPTION_PLAN.PRO,
        subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      },
      prisma
    );
  }
}

async function handleSubscriptionUpdated(data: Subscription, userId: string) {
  const { customer_id, status } = data.data.attributes;
  const customerId = customer_id.toString();

  if (status === 'active' || status === 'past_due') {
    await updateUserLemonSqueezyPaymentDetails(
      {
        customerId,
        userId,
        subscriptionStatus: status === 'active' ? SUBSCRIPTION_STATUS.ACTIVE : SUBSCRIPTION_STATUS.PAST_DUE,
      },
      prisma
    );
  }
}

async function handleSubscriptionCancelled(data: Subscription, userId: string) {
  const { customer_id } = data.data.attributes;
  const customerId = customer_id.toString();

  await updateUserLemonSqueezyPaymentDetails(
    {
      customerId,
      userId,
      subscriptionStatus: SUBSCRIPTION_STATUS.CANCEL_AT_PERIOD_END,
    },
    prisma
  );
}

async function handleSubscriptionExpired(data: Subscription, userId: string) {
  const { customer_id } = data.data.attributes;
  const customerId = customer_id.toString();

  await updateUserLemonSqueezyPaymentDetails(
    {
      customerId,
      userId,
      subscriptionPlan: SUBSCRIPTION_PLAN.FREE,
      subscriptionStatus: undefined,
    },
    prisma
  );
}