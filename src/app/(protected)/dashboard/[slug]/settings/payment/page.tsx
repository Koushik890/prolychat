'use client'

import React, { useState } from 'react'
import SettingsHeader from '@/components/global/settings/settings-header'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Billing from '@/components/global/billing'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DollarSign, CheckCircle, Users, Loader2 } from 'lucide-react'
import { useQueryUser } from '@/hooks/user-queries'
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from '@prisma/client'
import { useLemonSqueezy } from '@/hooks/use-lemonsqueezy'
import { format } from 'date-fns'

const PaymentSettingsPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const userSlug = params?.slug as string || ''
  const tab = searchParams.get('tab') || 'overview'
  const { data: userData, isLoading: isUserLoading } = useQueryUser()
  const { redirectToCustomerPortal, isLoading: isPortalLoading } = useLemonSqueezy()
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      href: `/dashboard/${userSlug}/settings/payment?tab=overview`
    },
    {
      label: 'All plans',
      value: 'all-plans',
      href: `/dashboard/${userSlug}/settings/payment?tab=all-plans`
    }
  ]

  // Define the font family to match SettingsHeader
  const fontFamily = 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Apple Color Emoji", Inter, Roboto, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif'
  
  // Add inline styles to ensure font overrides work
  const headingStyle = {
    fontFamily: fontFamily
  }

  // Get subscription data from user profile
  const subscription = userData?.data?.subscription
  const currentPlan = subscription?.plan || SUBSCRIPTION_PLAN.FREE
  const subscriptionStatus = subscription?.subscriptionStatus
  
  // Format renewal date - use current date + 30 days if no subscription data
  const renewalDate = subscription?.updatedAt 
    ? format(new Date(new Date(subscription.updatedAt).setMonth(new Date(subscription.updatedAt).getMonth() + 1)), 'MMM dd, yyyy')
    : format(new Date(new Date().setDate(new Date().getDate() + 30)), 'MMM dd, yyyy')
  
  // Determine pricing based on plan
  const planPrice = currentPlan === SUBSCRIPTION_PLAN.PRO ? '$99' : 'Free'

  // Format plan name for display
  const planName = currentPlan === SUBSCRIPTION_PLAN.PRO 
    ? 'Pro plan monthly' 
    : 'Free plan'

  // Features available based on current plan
  const planFeatures = currentPlan === SUBSCRIPTION_PLAN.PRO
    ? [
        					'Access to Proly AI for automated content management',
        'Advanced analytics and insights',
        'Unlimited automations for social media',
        'Priority customer support'
      ]
    : [
        'Set up billable rates for detailed project overviews',
        'Define tasks to break up your projects',
        'Invite your team members'
      ]

  const handleManageBilling = async () => {
    if (currentPlan === SUBSCRIPTION_PLAN.FREE) {
      // Redirect to All plans tab
      router.push(`/dashboard/${userSlug}/settings/payment?tab=all-plans`)
    } else {
      // Redirect to customer portal
      await redirectToCustomerPortal()
    }
  }

  const isLoading = isUserLoading || isPortalLoading

  return (
    <div className="space-y-6 font-sans">
      {/* Header and main navigation */}
      <div className="settings-header-with-subnav">
        <SettingsHeader userSlug={userSlug} />
        
        {/* Payment tabs navigation - positioned to appear connected to the header */}
        <div className="bg-white/75 backdrop-blur-md border-b border-gray-200/20 -mt-[2px] -mx-8 w-[calc(100%+4rem)]">
          <div className="px-8 pb-0">
            <nav className="flex space-x-8" aria-label="Payment tabs">
              {tabs.map((item) => (
                <Link
                  key={item.value}
                  href={item.href}
                  className={cn(
                    'py-4 px-1 text-sm font-medium border-b-2 -mb-[2px] whitespace-nowrap',
                    tab === item.value
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                  style={headingStyle}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-4">
        {tab === 'overview' ? (
          <div className="grid md:grid-cols-2 gap-8" style={{ marginBottom: '2rem' }}>
            {/* Plan details card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-1">My Plan</h2>
                <p className="text-base text-gray-600 mb-4">
                  {subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE 
                    ? `Your subscription will renew on ${renewalDate}`
                    : currentPlan === SUBSCRIPTION_PLAN.PRO && subscriptionStatus === SUBSCRIPTION_STATUS.CANCEL_AT_PERIOD_END
                      ? `Your subscription will end on ${renewalDate}`
                      : currentPlan === SUBSCRIPTION_PLAN.FREE
                        ? 'You are currently on the free plan'
                        : `Your subscription will renew on ${renewalDate}`
                  }
                </p>
                
                {currentPlan === SUBSCRIPTION_PLAN.PRO && subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE && (
                  <Link 
                    href="#" 
                    className="text-purple-500 font-medium hover:text-purple-600"
                    onClick={(e) => {
                      e.preventDefault()
                      handleManageBilling()
                    }}
                  >
                    Cancel Subscription
                  </Link>
                )}
              </div>
              
              <div className="border-t border-gray-100">
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase mb-2">CURRENT PLAN</div>
                      <div className="text-gray-900">{planName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase mb-2">COST</div>
                      <div className="flex items-center">
                        <span className="text-gray-900">{planPrice}</span>
                        <button className="ml-2 text-gray-400 hover:text-gray-500 bg-gray-100 rounded-full h-5 w-5 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10V7M7 4H7.005M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6">
                  <div className="flex justify-center">
                    <Button 
                      className="w-9/12 h-10 mt-3 rounded-lg text-white text-base font-medium hover:bg-[#b43cb4]" 
                      style={{ backgroundColor: "#c84cc8", borderColor: "#c84cc8" }}
                      onClick={handleManageBilling}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        currentPlan === SUBSCRIPTION_PLAN.FREE ? 'Upgrade Plan' : 'Manage Billing'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Plan features card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    {currentPlan === SUBSCRIPTION_PLAN.PRO
                      ? 'You are using Pro'
                      : 'You are using Free'
                    }
                  </h2>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded",
                    currentPlan === SUBSCRIPTION_PLAN.PRO
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {currentPlan === SUBSCRIPTION_PLAN.PRO ? 'PRO' : 'FREE'}
                  </span>
                </div>
                <p className="text-base text-gray-600 mb-6">Here are some of the things you can do now:</p>
                
                <ul className="space-y-6">
                  {planFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 text-gray-400 mr-4">
                        {index === 0 ? (
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        ) : index === 1 ? (
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="mt-10 w-9/12 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm"
                    onClick={() => router.push(`/dashboard/${userSlug}/settings/payment?tab=all-plans`)}
                  >
                    {currentPlan === SUBSCRIPTION_PLAN.PRO 
                      ? 'View all available plans' 
                      : 'Get more insights with our Premium plan'
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* All plans content */}
            <Billing />
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentSettingsPage
