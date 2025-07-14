import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/icons/arrow-left-icon';

const USER_RIGHTS = [
  "Access your personal data",
  "Correct inaccurate data",
  "Request deletion of your data (Right to be Forgotten)",
  "Object to processing of your data",
  "Request transfer of your data (Data Portability)",
  "Restrict processing of your data",
  "Withdraw consent at any time"
];

const DATA_COLLECTION_ITEMS = [
  "Account information (name, email address, profile picture)",
  "Instagram account data and credentials (username, profile information)",
  "Social media content and engagement data",
  "Automation preferences and settings",
  "Usage data and analytics",
  "Device information and IP addresses",
  "Cookies and tracking technologies",
  "Payment and billing information (processed by LemonSqueezy)"
];

const DATA_USAGE_ITEMS = [
  "Provide and maintain our Instagram automation services",
  "Process your social media automations and responses",
  "Authenticate and connect your Instagram account",
  "Improve our services and develop new features",
  "Communicate with you about our services and updates",
  "Process payments and manage subscriptions",
  "Comply with legal obligations and prevent fraud",
  "Provide customer support and technical assistance"
];

const THIRD_PARTY_SERVICES = [
  "Instagram/Meta (for social media integration and API access)",
  "LemonSqueezy (for payment processing and subscription management)",
  "Clerk (for user authentication and account management)",
  "Vercel (for hosting and infrastructure)",
  "Analytics providers (for usage statistics and performance monitoring)"
];

const COOKIES_TYPES = [
  "Essential cookies (required for service functionality)",
  "Authentication cookies (to keep you logged in)",
  "Preference cookies (to remember your settings)",
  "Analytics cookies (to understand how you use our service)",
  "Third-party cookies (from integrated services like Instagram)"
];

const PrivacyPolicyPage = () => {
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
          <h1 className="text-4xl font-bold text-white text-center">Privacy Policy</h1>
          <p className="mt-4 text-lg text-purple-100 text-center">
            Your privacy is important to us. This policy explains how we handle your data.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Introduction */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Prolychat ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and protect your information when you use our Instagram automation platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This policy applies to all users of Prolychat services and covers our compliance with the General Data Protection Regulation (GDPR), 
              California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </section>

          {/* Data Controller */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Controller</h2>
            <p className="text-gray-700 leading-relaxed">
              Prolychat is the data controller for the personal information you provide to us. You can contact us at{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>{' '}
              for any privacy-related inquiries.
            </p>
          </section>

          {/* Data Collection */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect and process the following types of information:</p>
            <ul className="list-none space-y-3">
              {DATA_COLLECTION_ITEMS.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Data Usage */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
            <ul className="list-none space-y-3">
              {DATA_USAGE_ITEMS.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Contract Performance:</strong> To provide our Instagram automation services</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Consent:</strong> For marketing communications and optional features</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</span>
              </li>
            </ul>
          </section>

          {/* Third Party Services */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services and Data Sharing</h2>
            <p className="text-gray-700 mb-4">We share your data with the following trusted third-party services:</p>
            <ul className="list-none space-y-3">
              {THIRD_PARTY_SERVICES.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We require all third parties to respect your data's security and handle it according to applicable law. 
              We do not sell your personal information to third parties.
            </p>
          </section>

          {/* Instagram Integration */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Instagram Integration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our service integrates with Instagram through Meta's official APIs. When you connect your Instagram account:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">We access your Instagram profile information and content</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">We can post comments and send messages on your behalf</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Your Instagram data is governed by both our policy and Meta's Privacy Policy</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">You can revoke access at any time through your Instagram settings</span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-none space-y-3">
              {COOKIES_TYPES.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling certain cookies may affect service functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal data for the following periods:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Account Data:</strong> Until account deletion or 2 years after last activity</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Usage Data:</strong> Up to 3 years for analytics and service improvement</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Payment Data:</strong> 7 years for tax and legal compliance (stored by LemonSqueezy)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700"><strong>Support Communications:</strong> 3 years after case closure</span>
              </li>
            </ul>
          </section>

          {/* Security */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement comprehensive security measures to protect your personal data:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Encryption in transit and at rest</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Regular security assessments and monitoring</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Access controls and authentication systems</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Employee training on data protection</span>
              </li>
            </ul>
          </section>

          {/* User Rights */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Your Rights</h2>
            <p className="text-gray-700 mb-4">Under GDPR and CCPA, you have the right to:</p>
            <ul className="list-none space-y-3">
              {USER_RIGHTS.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          {/* California Privacy Rights */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Consumer Privacy Act (CCPA)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are a California resident, you have additional rights under the CCPA:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Right to know what personal information is collected about you</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Right to delete personal information</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Right to opt-out of the sale of personal information (we do not sell personal information)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                <span className="text-gray-700">Right to non-discrimination for exercising your privacy rights</span>
              </li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data may be transferred to and processed in countries outside your residence. We ensure adequate protection 
              through appropriate safeguards, including standard contractual clauses and adequacy decisions.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children 
              under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Contact */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-medium">Privacy Officer</p>
              <p className="text-gray-700">Email: <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">privacy@prolychat.com</a></p>
              <p className="text-gray-700">For general inquiries: <a href="mailto:prolychat.helpdesk@gmail.com" className="text-purple-600 hover:text-purple-700 underline">prolychat.helpdesk@gmail.com</a></p>
            </div>
          </section>

          {/* Changes */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of material changes by email 
              or through our service. Please review this policy periodically for updates.
            </p>
          </section>

          {/* Last Updated */}
          <section className="pt-4">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Effective date: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 