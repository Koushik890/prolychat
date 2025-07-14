'use client'

import React, { useState } from 'react'
import SettingsHeader from '@/components/global/settings/settings-header'
import { useParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useQueryUser } from '@/hooks/user-queries'
import { SUBSCRIPTION_PLAN } from '@prisma/client'
import styles from './payment.module.css'
import { useLemonSqueezy } from '@/hooks/use-lemonsqueezy'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

const PaymentSettingsPage = () => {
  const params = useParams()
  const userSlug = params?.slug as string || ''
  const { data: userData } = useQueryUser()
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual")
  
  // LemonSqueezy integration
  const { user } = useUser()
  const { createCheckoutSession, isLoading } = useLemonSqueezy()

  const plans = {
    starter: {
      name: "Starter Plan",
      description: "For Small Teams & Startups",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "AI-Powered Contact Management",
        "Email & SMS Campaign Automation",
        "Basic Sales Pipeline Tracking",
        "5 AI-Generated Campaign",
        "Essential Integrations",
        "Standard Support",
      ],
    },
    growth: {
      name: "Growth Plan",
      description: "For Scaling Teams & Businesses",
      monthlyPrice: 5,
      annualPrice: 4,
      features: [
        "Unlimited Contacts & Custom Segmentation",
        "Multi-Channel Campaign Automation",
        "AI-Driven Lead Analytics",
        "Smart Workflow Automation",
        "Team Collaboration",
        "Priority Support",
      ],
      basePlan: "Starter",
    },
  }

  // Get subscription data for current plan badges
  const subscription = userData?.data?.subscription
  const currentPlan = subscription?.plan || SUBSCRIPTION_PLAN.FREE

  // Handle Growth plan checkout
  const handleGrowthPlanCheckout = async () => {
    if (!user?.id || !user?.emailAddresses?.[0]?.emailAddress) {
      toast.error('Please sign in to upgrade your plan')
      return
    }

    try {
      await createCheckoutSession({
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress,
        plan: SUBSCRIPTION_PLAN.PRO,
        billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly',
      })
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout process. Please try again.')
    }
  }

  return (
    <div className={styles.paymentPageContainer}>
      {/* Sticky Header */}
      <div className={styles.stickyHeaderContainer}>
        <SettingsHeader userSlug={userSlug} />
      </div>
      
      {/* Scrollable Content */}
      <div className={styles.scrollableContent}>
        {/* Plans & Pricing Section - Full Width */}
        <div id="pricing-section" className={styles.pricingSection}>
          <div className={`${styles.pricingContainer} ${styles.pricingContent}`}>
            <div
              className={styles.pricingInner}
              style={{
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(244, 235, 255, 0.4), transparent 30%), radial-gradient(circle at bottom right, rgba(244, 235, 255, 0.4), transparent 30%)",
              }}
            >
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #faf7ff 1px, transparent 1px), linear-gradient(to bottom, #faf7ff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  opacity: 0.5,
                }}
              />
              <div className="relative z-10 mx-auto max-w-4xl text-center">
                <h1 className={`${styles.mobileHeading} text-gray-900`}>
                  Choose a Plan That
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Scales With You.
                  </span>
                </h1>
                <p className={`${styles.mobileSubheading} text-gray-600`}>
                  Find the perfect plan to streamline your marketing, automate campaigns, and drive smarter collaboration. No
                  hidden fees, cancel anytime.
                </p>

                <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center">
                  <div className={styles.mobileBillingToggle}>
                    <Button
                      onClick={() => setBillingCycle("annual")}
                      className={cn(
                        styles.mobileBillingButton,
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
                        styles.mobileBillingButton,
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
                
              <div className={`relative z-10 ${styles.pricingCards}`}>
                {/* Starter Plan */}
                <div className={styles.pricingCard}>
                  <div className={styles.pricingCardHeader}>
                    <p className="text-sm font-semibold text-gray-500">{plans.starter.description}</p>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{plans.starter.name}</h3>
                      </div>
                  <div className={styles.pricingCardContent}>
                      <div>
                      <div className={styles.pricingDisplay}>
                        <span className={`${styles.pricingAmount} text-gray-900`}>
                          ${billingCycle === "annual" ? plans.starter.annualPrice : plans.starter.monthlyPrice}
                        </span>
                        {billingCycle === "annual" && (
                          <span className="text-lg sm:text-xl font-medium text-gray-500 line-through">
                            ${plans.starter.monthlyPrice}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      <Button 
                        variant={currentPlan === SUBSCRIPTION_PLAN.FREE ? "default" : "outline"} 
                        disabled={currentPlan === SUBSCRIPTION_PLAN.FREE}
                        className={cn(
                          styles.pricingButton,
                          currentPlan === SUBSCRIPTION_PLAN.FREE 
                            ? "bg-purple-600 text-white cursor-not-allowed opacity-75" 
                            : "bg-transparent hover:bg-gray-50 text-gray-900 border-gray-300"
                        )}
                      >
                        {currentPlan === SUBSCRIPTION_PLAN.FREE ? 'Current Plan' : 'Get Started'}
                      </Button>
                      <ul className={styles.featureList}>
                        {plans.starter.features.map((feature) => (
                          <li key={feature} className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                              <Check className="h-3 w-3" style={{ color: '#8b5cf6' }} />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                  </div>
                </div>
              </div>
              
                {/* Growth Plan - Highlighted */}
                <div className={`${styles.pricingCard} ${styles.pricingCardHighlighted}`}>
                  <div className="absolute inset-x-0 top-0 h-32 sm:h-48 rounded-t-2xl bg-gradient-to-b from-purple-100/80 to-transparent" />
                  <div className={`${styles.pricingCardHeader} relative`}>
                    <p className="text-sm font-semibold text-gray-500">{plans.growth.description}</p>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{plans.growth.name}</h3>
                  </div>
                  <div className={`${styles.pricingCardContent} relative`}>
                    <div>
                      <div className={styles.pricingDisplay}>
                        <span className={`${styles.pricingAmount} text-gray-900`}>
                          ${billingCycle === "annual" ? plans.growth.annualPrice : plans.growth.monthlyPrice}
                        </span>
                        {billingCycle === "annual" && (
                          <span className="text-lg sm:text-xl font-medium text-gray-500 line-through">${plans.growth.monthlyPrice}</span>
                        )}
                        <span className="text-sm text-gray-500">/month</span>
                        </div>
                      <Button 
                        disabled={currentPlan === SUBSCRIPTION_PLAN.PRO || isLoading}
                        onClick={currentPlan !== SUBSCRIPTION_PLAN.PRO ? handleGrowthPlanCheckout : undefined}
                        className={cn(
                          styles.pricingButton,
                          currentPlan === SUBSCRIPTION_PLAN.PRO 
                            ? "bg-purple-600 cursor-not-allowed opacity-75 text-white" 
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        )}
                      >
                        {isLoading 
                          ? 'Processing...' 
                          : currentPlan === SUBSCRIPTION_PLAN.PRO 
                            ? 'Current Plan' 
                            : 'Get Started'
                        }
                      </Button>
                      <p className="mt-6 sm:mt-8 text-sm font-semibold text-gray-700">Everything in {plans.growth.basePlan}, PLUS:</p>
                      <ul className={`${styles.featureList} mt-3 sm:mt-4`}>
                        {plans.growth.features.map((feature) => (
                          <li key={feature} className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                              <Check className="h-3 w-3" style={{ color: '#8b5cf6' }} />
                            </div>
                            <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSettingsPage
