import { NextResponse } from 'next/server';
import { createLemonSqueezyCheckoutSession } from '@/lib/lemonsqueezy/checkout-utils';
import { PrismaClient, SUBSCRIPTION_PLAN } from '@prisma/client';

const prisma = new PrismaClient();
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

// Variant IDs from separate monthly and yearly products - clean checkout experience
const VARIANT_IDS: Record<SUBSCRIPTION_PLAN, { monthly: string; yearly: string }> = {
  [SUBSCRIPTION_PLAN.PRO]: {
    monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!, // From "Prolychat Monthly" product
    yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,   // From "Prolychat Yearly" product
  },
  [SUBSCRIPTION_PLAN.FREE]: {
    monthly: '', // Free plan doesn't need variant IDs
    yearly: '',
  },
};

interface CheckoutRequest {
  userId: string;
  userEmail: string;
  plan: SUBSCRIPTION_PLAN;
  billingCycle?: 'monthly' | 'yearly'; // Added billing cycle parameter
}

export async function POST(req: Request) {
  try {
    const { 
      userId: clerkUserId, 
      userEmail, 
      plan, 
      billingCycle = 'monthly' // Default to monthly if not specified
    } = (await req.json()) as CheckoutRequest;

    if (!clerkUserId || !userEmail || !plan) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get the appropriate variant ID based on plan and billing cycle
    const variantConfig = VARIANT_IDS[plan];
    if (!variantConfig) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    const variantId = billingCycle === 'yearly' ? variantConfig.yearly : variantConfig.monthly;
    if (!variantId) {
      return new NextResponse(`No variant ID configured for ${plan} ${billingCycle} plan`, { status: 400 });
    }

    console.log(`Creating checkout session for user ${clerkUserId}, plan: ${plan}, billing: ${billingCycle}, variant: ${variantId}`);

    const { url } = await createLemonSqueezyCheckoutSession({
      storeId: STORE_ID,
      variantId,
      userEmail,
      userId: clerkUserId,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
} 