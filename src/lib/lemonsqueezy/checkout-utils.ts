import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize LemonSqueezy with API key
lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

interface LemonSqueezyCheckoutSessionParams {
  storeId: string;
  variantId: string;
  userEmail: string;
  userId: string;
}

export async function createLemonSqueezyCheckoutSession({ storeId, variantId, userEmail, userId }: LemonSqueezyCheckoutSessionParams) {
  console.log(`Creating LemonSqueezy checkout session with variant: ${variantId}`);
  
  const { data: session, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId
      }
    }
  });

  if (error) {
    console.error('LemonSqueezy checkout creation error:', error);
    throw error;
  }

  if (!session) {
    throw new Error('Checkout session not created');
  }

  console.log(`Checkout session created successfully. URL: ${session.data.attributes.url}`);

  return {
    url: session.data.attributes.url,
    id: session.data.id,
  };
} 