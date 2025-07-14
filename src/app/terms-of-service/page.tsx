import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/icons/arrow-left-icon';

const PROHIBITED_ACTIVITIES = [
  "Violating Instagram's Terms of Service or Community Guidelines",
  "Using the service for spam, harassment, or abusive behavior",
  "Attempting to access unauthorized Instagram accounts",
  "Distributing malware, viruses, or harmful content",
  "Engaging in illegal activities or violating applicable laws",
  "Reverse engineering or attempting to extract our source code",
  "Using automated tools beyond our provided service",
  "Sharing your account credentials with unauthorized parties"
];

const SERVICE_FEATURES = [
  "Instagram comment automation and response management",
  "Direct message automation for customer engagement",
  "AI-powered content generation and responses",
  "Contact management and segmentation tools",
  "Analytics and performance tracking",
  "Integration with Instagram Business and Creator accounts"
];

const SUBSCRIPTION_TERMS = [
  "Monthly subscriptions renew automatically on the same calendar day",
  "Annual subscriptions renew automatically after 12 months",
  "You may cancel your subscription at any time",
  "Cancellations take effect at the end of your current billing period",
  "No refunds for partial billing periods unless required by law",
  "Free trial periods (if offered) automatically convert to paid subscriptions"
];

const TermsOfServicePage = () => {
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
          <h1 className="text-4xl font-bold text-white text-center">Terms of Service</h1>
          <p className="mt-4 text-lg text-purple-100 text-center">
            Please read these terms carefully before using our service.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introduction */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Prolychat ("Company," "we," "our," or "us"). These Terms of Service ("Terms") govern your use of our 
              Instagram automation platform located at prolychat.com and related services (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, 
              you may not access or use the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you and Prolychat. Please read them carefully.
            </p>
          </section>

          {/* Service Description */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Prolychat is a Software-as-a-Service (SaaS) platform that provides Instagram automation tools. Our Service includes:
            </p>
            <ul className="list-none space-y-3">
              {SERVICE_FEATURES.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Our Service integrates with Instagram through official Meta APIs and requires your authorization to access your Instagram account.
            </p>
          </section>

          {/* Account Requirements */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Requirements and Registration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Eligibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must be at least 18 years old and have the legal capacity to enter into contracts. 
                  By using our Service, you represent that you meet these requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the security of your account credentials. You must notify us immediately 
                  of any unauthorized access to your account.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instagram Integration</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must have a valid Instagram Business or Creator account and comply with Instagram's Terms of Service. 
                  You grant us permission to access your Instagram account as necessary to provide our Service.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Terms */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Billing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Plans</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We offer monthly and annual subscription plans. Your subscription includes access to our Service 
                  features as described in your selected plan.
                </p>
                <ul className="list-none space-y-2">
                  {SUBSCRIPTION_TERMS.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">•</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Payments are processed by our third-party payment processor, LemonSqueezy. By subscribing, you agree to 
                  LemonSqueezy's terms and authorize them to charge your payment method.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Changes</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify subscription prices. Existing subscribers will be notified 30 days 
                  before any price changes take effect.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Permitted Use</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may use our Service only for lawful purposes and in accordance with these Terms. 
                  You must comply with all applicable laws and Instagram's policies.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You agree not to engage in any of the following activities:</p>
                <ul className="list-none space-y-2">
                  {PROHIBITED_ACTIVITIES.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-3">×</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Intellectual Property</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service, including all content, features, and functionality, is owned by Prolychat and is protected by 
                  copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of any content you create or upload. You grant us a limited license to use your content 
                  solely to provide our Service to you.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  Content generated by our AI features is provided as-is. You are responsible for reviewing and approving 
                  all AI-generated content before it is published.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Handling</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
              which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our Service, you consent to the collection and use of your information as described in our 
              <Link href="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline ml-1">Privacy Policy</Link>.
            </p>
          </section>

          {/* Service Availability */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain high service availability but cannot guarantee uninterrupted service. 
                  Scheduled maintenance will be communicated in advance when possible.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Modifications</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any part of our Service at any time. 
                  We will provide reasonable notice for material changes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Dependencies</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Service depends on Instagram's APIs and policies. Changes to Instagram's platform may affect 
                  our Service functionality.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Termination by You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your subscription at any time through your account settings or by contacting our support team. 
                  Your access will continue until the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may suspend or terminate your account if you violate these Terms, engage in prohibited activities, 
                  or for any other reason at our sole discretion.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your access to the Service will cease, and we may delete your account and associated data 
                  in accordance with our Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                  WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instagram Integration Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are not affiliated with Instagram or Meta. Instagram is a trademark of Meta Platforms, Inc. 
                  We cannot guarantee continued access to Instagram's APIs.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROLYCHAT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
            </p>
            <p className="text-gray-700 leading-relaxed">
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATING TO THE SERVICE SHALL NOT EXCEED THE AMOUNT 
              YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          {/* Indemnification */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Prolychat from any claims, damages, or expenses arising from your use 
              of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* Governing Law */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to conflict of law principles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispute Resolution</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from these Terms will be resolved through binding arbitration in accordance with 
                  the rules of [Arbitration Authority]. Class action lawsuits are waived.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may modify these Terms at any time. Material changes will be communicated via email or through our Service. 
              Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to the modified Terms, you must stop using the Service and may cancel your subscription.
            </p>
          </section>

          {/* Contact Information */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-medium">Legal Department</p>
              <p className="text-gray-700">Email: <a href="mailto:legal@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">legal@prolychat.com</a></p>
              <p className="text-gray-700">Support: <a href="mailto:prolychat.helpdesk@gmail.com" className="text-purple-600 hover:text-purple-700 underline">prolychat.helpdesk@gmail.com</a></p>
            </div>
          </section>

          {/* Severability */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability and Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Prolychat regarding 
              the Service and supersede all prior agreements and understandings.
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

export default TermsOfServicePage; 