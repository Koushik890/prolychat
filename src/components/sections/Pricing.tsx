'use client'

import { useState } from "react"
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export const pricingPlans = [
  {
    name: 'Free Plan',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    features: [
      'Boost engagement with target responses',
      'Automate comment replies to enhance audience interaction',
      'Turn followers into customers with targeted messaging'
    ]
  },
  {
    		name: 'Proly AI Plan',
    description: 'Advanced features for power users',
    monthlyPrice: 99,
    quarterlyPrice: 89,
    features: [
      'All features from Free Plan',
      'AI-powered response generation',
      'Advanced analytics and insights',
      'Priority customer support',
      'Custom branding options'
    ]
  }
]

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly')

  return (
    <section id="pricing" className="mt-20 px-4 py-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-purple-200 opacity-20 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 left-3/4 top-1/2"></div>
      <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">
          Choose your right plan!
        </h2>
        <p className="text-gray-600 mb-8 mt-6 text-lg">
          Select from best plans, ensuring a perfect match. Need more or less?
          Customize your subscription for a seamless fit!
        </p>
        <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingPeriod === 'monthly' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('quarterly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingPeriod === 'quarterly' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarterly (save 10%)
          </button>
        </div>
      </div>
      <div className="flex justify-center items-center w-full">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className="relative bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex-grow">
                <CardHeader className="pb-8">
                  <div className="mb-4">
                    <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                      {plan.name}
                    </span>
                  </div>
                  <CardDescription className="text-gray-600 min-h-[60px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.quarterlyPrice}
                      <span className="text-base font-normal text-gray-600 ml-1">/month</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </div>
              <CardFooter className="mt-auto pt-8">
                <Button 
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Upgrade Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
