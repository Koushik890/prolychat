import { useState } from 'react';
import { SUBSCRIPTION_PLAN } from '@prisma/client';

interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  plan: SUBSCRIPTION_PLAN;
  billingCycle?: 'monthly' | 'yearly';
}

export function useLemonSqueezy() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async ({ userId, userEmail, plan, billingCycle = 'monthly' }: CreateCheckoutOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`Creating LemonSqueezy checkout for plan: ${plan}, billing: ${billingCycle}`);

      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          plan,
          billingCycle,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const data = await response.json();
      console.log('Redirecting to LemonSqueezy checkout:', data.url);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Checkout session error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCustomerPortal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payment/customer-portal');
      if (!response.ok) {
        throw new Error('Failed to get customer portal URL');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No customer portal URL found');
      }

      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCheckoutSession,
    redirectToCustomerPortal,
  };
} 