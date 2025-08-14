'use client'

import React, { useState } from 'react'
import SettingsHeader from '@/components/global/settings/settings-header'
import { useParams } from 'next/navigation'
import styles from './payment.module.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQueryUser } from '@/hooks/user-queries'
import { useLemonSqueezy } from '@/hooks/use-lemonsqueezy'
import { useUser } from '@clerk/nextjs'
import { SUBSCRIPTION_PLAN } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type BillingCycle = "annual" | "monthly"

const PaymentSettingsPage = () => {
  const params = useParams()
  const userSlug = params?.slug as string || ''
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual")
  const { data: userData } = useQueryUser()
  const { user } = useUser()
  const { createCheckoutSession, isLoading: checkoutLoading } = useLemonSqueezy()
  
  // Get current subscription plan (FREE = Starter, PRO = Growth)
  const currentPlan = userData?.data?.subscription?.plan || 'FREE'

  // Customer portal mutation for plan management
  const { mutate: createPortal, isPending: portalLoading } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payment/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData?.data?.id,
        }),
      })
      const data = await res.json()
      return data
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: () => {
      toast.error('Failed to open customer portal. Please try again.')
    }
  })

  // Handle subscription upgrade to PRO
  const handleUpgrade = async () => {
    if (!user?.id || !user?.emailAddresses?.[0]?.emailAddress) {
      toast.error('Please make sure you are logged in.')
      return
    }

    // Map billing cycle from UI state to API format
    const apiCycle = billingCycle === 'annual' ? 'yearly' : 'monthly'

    await createCheckoutSession({
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
      plan: SUBSCRIPTION_PLAN.PRO,
      billingCycle: apiCycle,
    })
  }

  // Handle subscription downgrade (through customer portal)
  const handleDowngrade = async () => {
    createPortal()
  }

  const isLoading = checkoutLoading || portalLoading

  const plans = {
    starter: {
      name: "Starter Plan",
      description: "For Small Teams & Startups",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Boost engagement with target responses",
        "Automate comment replies to enhance audience interaction",
        "Turn followers into customers with targeted messaging",
      ],
    },
    growth: {
      name: "Growth Plan",
      description: "For Scaling Teams & Businesses",
      monthlyPrice: 5,
      annualPrice: 4,
      features: [
        "All features from Free Plan",
        "AI-powered response generation",
        "Advanced analytics and insights",
        "Priority customer support",
        "Custom branding options",
      ],
      basePlan: "Starter",
    },
  }

  return (
    <div className={styles.paymentPageContainer}>
      {/* Sticky Header */}
      <div className={styles.stickyHeaderContainer}>
        <SettingsHeader userSlug={userSlug} />
      </div>
      
      {/* Scrollable Content */}
      <div className={styles.scrollableContent}>
        <div className="min-h-screen w-full bg-white text-gray-800">
          <div
            className="relative flex flex-col items-center justify-center px-4 pt-32 pb-16 md:pt-40 md:pb-24"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(244, 235, 255, 0.4), transparent 30%), radial-gradient(circle at bottom right, rgba(244, 235, 255, 0.4), transparent 30%)",
            }}
          >
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #eef2f9 1px, transparent 1px), linear-gradient(to bottom, #eef2f9 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.5,
              }}
            />
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Choose a Plan That
                <br />
                <span className="bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
                  Scales With You.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Find the perfect plan to streamline your marketing, automate campaigns, and drive smarter collaboration. No
                hidden fees, cancel anytime.
              </p>

              <div className="mt-10 flex justify-center">
                <div className="inline-flex rounded-full bg-gray-100 p-1">
                  <Button
                    onClick={() => setBillingCycle("annual")}
                    className={cn(
                      "rounded-full px-6 py-2 text-sm font-semibold",
                      billingCycle === "annual"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-transparent text-gray-600 hover:bg-white/50",
                    )}
                  >
                    Annual
                    <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                      -20%
                    </span>
                  </Button>
                  <Button
                    onClick={() => setBillingCycle("monthly")}
                    className={cn(
                      "rounded-full px-6 py-2 text-sm font-semibold",
                      billingCycle === "monthly"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-transparent text-gray-600 hover:bg-white/50",
                    )}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 grid w-full max-w-4xl gap-8 md:grid-cols-2">
              {/* Starter Plan */}
              <Card className="flex flex-col rounded-2xl border shadow-lg">
                <CardHeader className="p-6">
                  <p className="text-sm font-semibold text-gray-500">{plans.starter.description}</p>
                  <CardTitle className="mt-2 text-3xl font-bold text-gray-900">{plans.starter.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between p-6 pt-0">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-gray-900">
                        ${billingCycle === "annual" ? plans.starter.annualPrice : plans.starter.monthlyPrice}
                      </span>
                      {billingCycle === "annual" && (
                        <span className="text-xl font-medium text-gray-500 line-through">
                          ${plans.starter.monthlyPrice}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    {currentPlan === 'FREE' ? (
                      <Button variant="outline" className="mt-8 w-full py-3 text-base font-semibold bg-transparent" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="mt-8 w-full py-3 text-base font-semibold bg-transparent"
                        onClick={handleDowngrade}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Get Started'}
                      </Button>
                    )}
                    <ul className="mt-8 space-y-4 text-sm text-gray-600">
                      {plans.starter.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 flex-shrink-0 text-purple-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Plan - Highlighted */}
              <Card className="relative flex flex-col rounded-2xl border-2 border-purple-500 shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-48 rounded-t-2xl bg-gradient-to-b from-purple-100/80 to-transparent" />
                <CardHeader className="relative p-6">
                  <p className="text-sm font-semibold text-gray-500">{plans.growth.description}</p>
                  <CardTitle className="mt-2 text-3xl font-bold text-gray-900">{plans.growth.name}</CardTitle>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col justify-between p-6 pt-0">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-gray-900">
                        ${billingCycle === "annual" ? plans.growth.annualPrice : plans.growth.monthlyPrice}
                      </span>
                      {billingCycle === "annual" && (
                        <span className="text-xl font-medium text-gray-500 line-through">${plans.growth.monthlyPrice}</span>
                      )}
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    {currentPlan === 'PRO' ? (
                      <Button className="mt-8 w-full bg-gray-900 py-3 text-base font-semibold text-white hover:bg-gray-800" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="mt-8 w-full bg-gray-900 py-3 text-base font-semibold text-white hover:bg-gray-800"
                        onClick={handleUpgrade}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Get Started'}
                      </Button>
                    )}
                    <p className="mt-8 text-sm font-semibold text-gray-700">Everything in {plans.growth.basePlan}, PLUS:</p>
                    <ul className="mt-4 space-y-4 text-sm text-gray-600">
                      {plans.growth.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 flex-shrink-0 text-purple-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSettingsPage
