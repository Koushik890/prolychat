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

    if (!signature) {
      return new NextResponse('Webhook signature missing', { status: 400 });
    }

    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
    const signature_buffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(signature_buffer, digest)) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);
    if (!event?.meta?.custom_data?.user_id) {
      return new NextResponse('Invalid webhook payload', { status: 400 });
    }

    const clerkUserId = event.meta.custom_data.user_id;
    
    // Get the user from the database directly using Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      console.warn(`User not found for Clerk ID: ${clerkUserId}`);
      return new NextResponse('User not found', { status: 404 });
    }

    const userId = user.id;

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
        console.warn('Unhandled webhook event:', event.meta.event_name);
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return new NextResponse('Webhook error', { status: 400 });
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