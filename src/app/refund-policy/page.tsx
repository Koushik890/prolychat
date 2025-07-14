import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/icons/arrow-left-icon';

const REFUND_EXAMPLES = [
  {
    title: "You forgot to cancel and got charged for next month",
    description: "If you meant to cancel but forgot and haven't used the service since, we'll refund that charge",
    eligible: true
  },
  {
    title: "You tried Prolychat for a few months and just weren't happy with it",
    description: "If our service didn't work out for you after giving it a fair try, you can have your money back",
    eligible: true
  },
  {
    title: "You're taking a break and don't need the service temporarily",
    description: "Going away for a few months? We'll refund the unused portion",
    eligible: true
  },
  {
    title: "There was a billing error or duplicate charge",
    description: "System errors happen - we'll fix them immediately with a full refund",
    eligible: true
  },
  {
    title: "You cancelled your annual plan early and want unused months back",
    description: "We'll refund the unused months on a prorated basis within 30 days of your request",
    eligible: true
  },
  {
    title: "Your account was suspended for policy violations",
    description: "No refunds for accounts terminated due to misuse of our service or spam",
    eligible: false
  }
];

const ALTERNATIVES = [
  {
    title: "Plan Downgrade",
    description: "Switch to a lower plan that better fits your needs",
    icon: "📉"
  },
  {
    title: "Extended Trial",
    description: "Get more time to evaluate the service before making a decision",
    icon: "⏰"
  }
];

const REFUND_TIMELINE = [
  {
    step: "1. Contact Us",
    description: "Email us or use the help widget in your dashboard",
    timeframe: "Takes 2 minutes"
  },
  {
    step: "2. We Review",
    description: "Our team looks at your request and account history",
    timeframe: "1-2 business days"
  },
  {
    step: "3. Decision & Processing",
    description: "We'll email you our decision and process approved refunds",
    timeframe: "2-3 business days"
  },
  {
    step: "4. Money Back",
    description: "Refunds appear in your account via LemonSqueezy",
    timeframe: "5-10 business days"
  }
];

const CANCELLATION_STEPS = [
  "Go to Settings > Billing in your Prolychat account",
  "Click 'Manage Subscription' to open LemonSqueezy",
  "Follow the cancellation process",
  "You'll get a confirmation email when it's done"
];

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-all duration-200 group"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Link>
      </div>

      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white text-center">Refund Policy</h1>
          <p className="mt-4 text-lg text-purple-100 text-center">
            Fair, simple, and customer-friendly. That's how we do refunds.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Quick Summary */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">The Short Version</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <strong>30-day money-back guarantee</strong> - Try us risk-free
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <strong>Prorated annual refunds</strong> - Get money back for unused months
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <strong>Just weren't happy?</strong> Contact us and we'll make it right
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">
                📧 For any refund request: <a href="mailto:prolychat.helpdesk@gmail.com" className="underline">prolychat.helpdesk@gmail.com</a>
              </p>
            </div>
          </section>

          {/* Our Philosophy */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Philosophy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you're ever unhappy with Prolychat for any reason, contact our support team. 
              We believe in treating people the way we'd want to be treated.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We use LemonSqueezy to handle payments and refunds, so your money goes back to the same 
              payment method you used originally. Most refunds are processed within a few days.
            </p>
          </section>

          {/* Examples We'd Grant */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Examples of Refunds We'd Grant</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Here are some real situations where we'd give you your money back:
            </p>
            <div className="space-y-4">
              {REFUND_EXAMPLES.map((example, index) => (
                <div key={index} className="flex items-start p-4 rounded-lg border-2" 
                     style={{
                       borderColor: example.eligible ? '#10B981' : '#EF4444',
                       backgroundColor: example.eligible ? '#ECFDF5' : '#FEF2F2'
                     }}>
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full mr-3 text-white font-bold text-sm"
                        style={{ backgroundColor: example.eligible ? '#10B981' : '#EF4444' }}>
                    {example.eligible ? '✓' : '×'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{example.title}</h4>
                    <p className="text-gray-700 text-sm">{example.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alternatives to Refunds */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternatives to Cash Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sometimes a refund isn't the best solution. We can also offer:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {ALTERNATIVES.map((alternative, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{alternative.icon}</span>
                    <h4 className="font-semibold text-gray-900">{alternative.title}</h4>
              </div>
                  <p className="text-gray-700 text-sm">{alternative.description}</p>
              </div>
              ))}
            </div>
          </section>

          {/* How to Cancel */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Cancel Your Subscription</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can cancel anytime. Here's how:
            </p>
            <div className="space-y-3">
              {CANCELLATION_STEPS.map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3 font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-1">{step}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Canceling stops future billing. You keep access until your current period ends. 
                Refunds depend on your situation - just ask us!
              </p>
            </div>
          </section>

          {/* Refund Process */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How Refunds Work</h2>
            <div className="space-y-6">
              {REFUND_TIMELINE.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-4 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.step}</h4>
                    <p className="text-gray-700 mb-1">{item.description}</p>
                    <p className="text-sm text-purple-600 font-medium">{item.timeframe}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Help</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">📧 Email</p>
                <p className="text-gray-700 text-sm mb-1">
                  <a href="mailto:prolychat.helpdesk@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                    prolychat.helpdesk@gmail.com
                  </a>
                </p>
                <p className="text-xs text-gray-600">Usually reply within 24 hours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">💬 In-App</p>
                <p className="text-gray-700 text-sm mb-1">Help widget in your dashboard</p>
                <p className="text-xs text-gray-600">Fastest way to reach us</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">🔒 Billing</p>
                <p className="text-gray-700 text-sm mb-1">Settings &gt; Billing</p>
                <p className="text-xs text-gray-600">Manage subscriptions directly</p>
              </div>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Situations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Issues</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  If our service is down for more than 24 hours or Instagram makes changes that break our functionality, 
                  we'll provide refunds or credits for the affected time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Errors</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Double charges, wrong amounts, or system errors get fixed immediately with full refunds.
                </p>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <section className="pt-4 text-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Questions about this policy? Email us at{' '}
              <a href="mailto:prolychat.helpdesk@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                prolychat.helpdesk@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage; 