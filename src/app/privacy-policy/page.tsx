import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/icons/arrow-left-icon';

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
          <h1 className="text-4xl font-bold text-white text-center font-hubot">Privacy Policy</h1>
          <p className="mt-4 text-lg text-purple-100 text-center font-mona">
            Your privacy is important to us. This policy explains how we handle your data.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introduction */}
          <section className="border-b border-gray-100 pb-6">
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              At Prolychat, Inc. ("Prolychat", "we, us") we consider the privacy and the security of personal data to be extremely important.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We process personal data for (1) our own purposes and (2) under instructions of our customers who use Prolychat service ("Service"), upload and keep certain information in it in accordance with the applicable data protection laws and regulations. In the second case, we strictly adhere to customers' instructions and do not use data for any other purposes than providing the Service (see details in Data Processing Addendum).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              In this Privacy Policy, we describe how we process the personal data of the following data subjects for our own purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4 font-mona">
              <li className="text-gray-700">our customers, their end users and representatives,</li>
              <li className="text-gray-700">website users,</li>
              <li className="text-gray-700">newsletter subscribers,</li>
              <li className="text-gray-700">potential customers,</li>
              <li className="text-gray-700">our counterparties and their representatives.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              It covers information collected in the Service, on our website{' '}
              <a href="https://www.prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                www.prolychat.com
              </a>
              , or other websites administered by Prolychat where Privacy Policy is placed (the "Site"), in our Mobile apps and in other sources.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              For a detailed description of how we process your personal data in case you apply for roles with us, please consult the Candidate Privacy Statement.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              If you have any questions or suggestions concerning our privacy practices, please email us at{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>
              . Please also send us an email, if you would like to request data access or deletion, or to exercise other rights as a data subject.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4 font-mona">
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">How We Collect Personal Data</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">What Types of Personal Data We Process</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">For Which Purposes We Use Personal Data</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">How We Share Personal Data</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Your Data Protection Rights & Choices</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">For How Long We Retain Personal Data</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">International Data Transfers</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Children's Information</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Automated Decision Making</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Security</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Legal Basis for Processing Your Personal Data (Brazil, EEA, UK Visitors/Customers Only)</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">For California Residents</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Changes to Our Privacy Policy</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">How to Contact Us</li>
            </ol>
          </section>

          {/* 1. How We Collect Personal Data */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">1. How We Collect Personal Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              What personal data we collect depends largely on the interaction that takes place between you and Prolychat, most of which can be categorized under the following:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">When you use Prolychat Service or interact with an entity that uses a Prolychat Service</h3>
                <p className="text-gray-700 font-mona">
                  When you use Prolychat Service, we store all the content you provide, including information related to you as a customer or an end user of the Service. We gather this information from you directly when you enter it, or from integrations that you linked to the Service (Facebook, Instagram, etc.). When you ask us to sign DPA or other documents, we also receive data about you and your representatives. In some cases, we can receive information from third parties, e.g. from a payment service provider on whether your payment was successful.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">When you send us emails or message us</h3>
                <p className="text-gray-700 font-mona">
                  When we receive emails or messages from you in the chat, we can store the content of such emails, attachments as well as your contact details.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">When you submit forms on the Site or participate in our events</h3>
                <p className="text-gray-700 font-mona">
                  When you complete forms on the Site (contact us, subscription, demo request, event registration, etc.) we collect your contact details and information you complete in the form. If we arrange joint events together with our partners, we can receive information from our partners.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">When you use the Site</h3>
                <p className="text-gray-700 font-mona">
                  When you use the Site, we collect certain information, as described in more detail below that may, alone or in combination with other information, constitute personal data (e.g. cookie files).
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">When you join our communities</h3>
                <p className="text-gray-700 font-mona">
                  When you join our Facebook and other groups, we can see data in your profile and process comments you posted in our groups. However, we don't gather that information or copy it into our systems, but rather just have access to it.
                </p>
              </div>
            </div>
          </section>

          {/* 2. What Types of Personal Data We Process */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">2. What Types of Personal Data We Process</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We collect and process the following personal data:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Customer account details</h3>
                <p className="text-gray-700 font-mona">
                  To create or update your account and provide the Service we collect from you and third-party integrations (e.g. Facebook, Instagram) information about you, as a customer or end-user of the Service. This includes id, name, email, status, linked pages and accounts, products in use, location, gender, etc.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Financial information</h3>
                <p className="text-gray-700 font-mona">
                  To process your payments for the Service subscription, we need your credit card details (last four digits of the card number), account details and payment information.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Contact details and business data</h3>
                <p className="text-gray-700 font-mona">
                  We receive information about our customers and potential customers for cooperation and communication purposes. This includes full name, title, company, email or other contact details as may be necessary.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Usage data, logs and other technical data</h3>
                <p className="text-gray-700 font-mona">
                  When you interact with the Service, metadata and log files are collected automatically. Log data may include the Internet Protocol (IP) address, your browser type and settings, the date and time you used the Service, information about browser configuration plugins, language preferences, the pages or features which you browsed, time spent on those pages or features, the frequency of pages and functions use, the links clicked on or used.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Customer Content</h3>
                <p className="text-gray-700 font-mona">
                  As you use our Service or interact with our Service, you may import into our system personal data you have collected from your users or from you, customers, prospective customers, social media and messaging platform contacts (collectively "Subscribers") or other individuals. We process this data only on your behalf as our customer.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <p className="text-yellow-800 font-mona">
                <strong>Important:</strong> We ask that you not send or disclose to us any sensitive personal data (e.g., social security numbers, information related to racial or ethnic origin, political opinions, religion or other beliefs, health, biometrics or genetic characteristics, criminal background, union membership, etc.) on or through the Service.
              </p>
            </div>
          </section>

          {/* 3. For Which Purposes We Use Personal Data */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">3. For Which Purposes We Use Personal Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We collect and process your personal data for the following purposes:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">To operate the Service</h3>
                <p className="text-gray-700 font-mona">
                  We use data to enter into the agreement with you as a customer and operate, maintain and administer your account in the Service, as well as to communicate with you regarding the account and to respond to Service-related requests, questions and feedback.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">To provide the Service</h3>
                <p className="text-gray-700 font-mona">
                  We process Customer Content information on your behalf as a customer (see details in Data Processing Addendum).
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">To communicate with you and inform you about the Service</h3>
                <p className="text-gray-700 font-mona">
                  If you request information from us, register for the Service, complete a form or feedback on a Site, or participate in our surveys, promotions or events, we may send you Prolychat-related marketing communications if permitted by law.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">To comply with law</h3>
                <p className="text-gray-700 font-mona">
                  We use your personal data as necessary to comply with applicable laws, including sanction requirements, accounting and tax obligations, legal processes or audits.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">For compliance and safety</h3>
                <p className="text-gray-700 font-mona">
                  We use your personal data as we believe necessary to enforce the terms and conditions that govern the Service, protect our rights, privacy, safety or property, and investigate and deter against fraudulent, harmful, unauthorized, unethical or illegal activity.
                </p>
              </div>
            </div>
          </section>

          {/* 4. How We Share Personal Data */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">4. How We Share Personal Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We do not sell your data to third parties for commercial or advertising purposes. We share your data as described in this Privacy Policy or upon obtaining your consent for such data sharing.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Service Providers</h3>
                <p className="text-gray-700 font-mona">
                  We employ third-party companies and individuals to help us with performance of certain activities, e.g. payment service providers. We also use third-party software to process data (e.g. CRM, email agent, cloud storage solutions, etc.). These third parties are permitted to use personal data about you only to perform these tasks for lawful business purposes.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Third-party Applications and Integrations</h3>
                <p className="text-gray-700 font-mona">
                  For the provision of the Service we receive and share data with integrations and apps linked by customers (Facebook, Instagram, Stripe, Paypal, etc.).
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 font-hubot">Compliance with Laws and Law Enforcement</h3>
                <p className="text-gray-700 font-mona">
                  Prolychat may disclose information about you to government or law enforcement officials as required by law, to comply with applicable laws and lawful requests, enforce our terms and conditions, and protect our rights and safety.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Your Data Protection Rights */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">5. Your Data Protection Rights & Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You have the following rights depending on the applicable legislation in your jurisdiction:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4 font-mona mb-4">
              <li className="text-gray-700">Access your personal data that Prolychat collects</li>
              <li className="text-gray-700">Update, correct incomplete, inaccurate, or outdated data</li>
              <li className="text-gray-700">Request information about data sharing and with whom it is shared</li>
              <li className="text-gray-700">Object to processing of your personal data (EEA, UK, Brazil, Switzerland residents)</li>
              <li className="text-gray-700">Request portability of your personal data where technically possible</li>
              <li className="text-gray-700">Withdraw consent at any time (where processing is based on consent)</li>
              <li className="text-gray-700">Complain to a data protection authority about our collection and use of your personal data</li>
            </ul>

            <p className="text-gray-700 leading-relaxed font-mona">
              You may submit your request by sending an email to{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>. We will respond to all requests in accordance with applicable data protection laws.
            </p>
          </section>

          {/* 6. Data Retention */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">6. For How Long We Retain Personal Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We will retain and process personal data until you terminate the Agreement with us as set forth under the Terms of Service or based on your explicit request.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              We may also store some data during a retention period required by law or timeframe necessary to resolve disputes, prevent abuse, and enforce our agreements.
            </p>
          </section>

          {/* 7. International Data Transfers */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">7. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Your personal data may be stored and processed in any country where we have facilities or in which we engage service providers, including in the U.S. We implement preventive controls for data transfer, including standard contractual clauses and global corporate standards.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              In the event that transfers to non-adequate jurisdictions are necessary, we will take reasonable steps to ensure that the information is processed with the same level of security.
            </p>
          </section>

          {/* 8. Children's Information */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">8. Children's Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              The Site and/or the Service are not intended for use by anyone under the age of 18, nor does Prolychat knowingly collect or solicit personal data from anyone under the age of 18.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              If you are a parent or legal guardian of a child under 18 and believe that we might have any information from or about such a child, please contact us. We do not sell any Personal Data of our customers, including those aged between 13 and 18.
            </p>
          </section>

          {/* 9. Security */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">9. Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We take reasonable and appropriate measures to protect personal data from loss, misuse, and unauthorized access, disclosure, alteration, and destruction, taking into account the risks involved in the processing and the nature of the personal data.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              Despite these efforts, we cannot guarantee the security of personal data during its transmission or its storage in our systems. If you have any questions about the security of your personal data, you may contact us by email{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>.
            </p>
          </section>

          {/* 10. Legal Basis (GDPR) */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">10. Legal Basis for Processing (Brazil, EEA, UK Visitors/Customers Only)</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              If you are located in Brazil, the EEA or the UK, our legal basis for collecting and using personal data includes:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4 font-mona">
              <li className="text-gray-700">Contract performance - to provide our Service</li>
              <li className="text-gray-700">Legitimate interests - to communicate with you, conduct events, compliance and safety</li>
              <li className="text-gray-700">Consent - for certain cookie files and marketing communications</li>
              <li className="text-gray-700">Legal obligation - to comply with applicable laws</li>
            </ul>
          </section>

          {/* 11. California Residents */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">11. For California Residents</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              California residents have specific rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4 font-mona mb-4">
              <li className="text-gray-700">Right to know what personal information is collected about you</li>
              <li className="text-gray-700">Right to delete personal information</li>
              <li className="text-gray-700">Right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li className="text-gray-700">Right to non-discrimination for exercising your privacy rights</li>
            </ul>

            <p className="text-gray-700 leading-relaxed font-mona">
              To request information or exercise your rights, please contact us at{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>. We will respond within 45 calendar days of receipt.
            </p>
          </section>

          {/* 12. Changes to Privacy Policy */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">12. Changes to Our Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We may need to change this Privacy Policy from time to time to reflect legal, technical or business developments. When we update our Privacy Policy, we will take appropriate measures to inform you before its entry into force, consistent with the significance of the changes we make.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              You can see when this Privacy Policy was last updated by checking the "Last updated" date displayed at the bottom of this Privacy Policy.
            </p>
          </section>

          {/* 13. Contact Us */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">13. How to Contact Us</h2>
            <p className="text-gray-700 leading-relaxed font-mona">
              If you require any more information or have any questions about our privacy policy, please feel free to contact us by email at{' '}
              <a href="mailto:privacy@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">
                privacy@prolychat.com
              </a>.
            </p>
          </section>

          {/* Last Updated */}
          <section className="pt-4">
            <p className="text-sm text-gray-500 text-center font-mona">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 text-center mt-2 font-mona">
              Effective date: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
