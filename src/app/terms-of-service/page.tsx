import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/icons/arrow-left-icon';

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
          <h1 className="text-4xl font-bold text-white text-center font-hubot">Terms of Service</h1>
          <p className="mt-4 text-lg text-purple-100 text-center font-mona">
            Please read these terms carefully before using our service.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introduction */}
          <section className="border-b border-gray-100 pb-6">
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              These Terms of Service constitute a legally binding agreement between you and Prolychat Software Pvt Ltd("Prolychat Software Pvt Ltd", "we," "our", "us" or "Prolychat") governing your use of our products, services, information, contents and tools, mobile application (the "App"), and website (the "Site" and collectively with the foregoing, the "Services").
            </p>
            
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mb-4">
              <p className="text-yellow-800 font-mona">
                <strong>YOU ACKNOWLEDGE AND AGREE THAT, BY CLICKING ON THE "I AGREE" OR SIMILAR BUTTON, REGISTERING FOR AN ACCOUNT, DOWNLOADING THE APP OR ANY APP UPGRADES, USING THE APP ON YOUR MOBILE DEVICE, VISITING THE SITE, ACCESSING OR USING THE SERVICES, OR PARTICIPATING IN AN ELECTRONIC CONVERSATION FACILITATED BY THE SERVICES (ANY SUCH PARTICIPANT, A "CONVERSATION PARTICIPANT"), YOU ARE INDICATING THAT YOU HAVE READ, UNDERSTAND AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE, WHETHER OR NOT YOU HAVE REGISTERED VIA THE SITE OR THE APP. IF YOU DO NOT AGREE TO THESE TERMS OF SERVICE, THEN YOU HAVE NO RIGHT TO ACCESS OR USE THE SERVICES.</strong>
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              These Terms of Service apply to all users of the Services, including without limitation browsers, vendors, customers, merchants, consumers, content contributors, Business Owners (as defined below) and Agencies (as defined below). These Terms of Service are effective as of the date you first click "I agree" (or similar button or checkbox) or use or access the Services, whichever is earlier.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              If you accept or agree to these Terms of Service on behalf of your employer or another legal entity, you represent and warrant that (i) you have full legal authority to bind your employer or such entity to these Terms of Services; (ii) you have read and understand these Terms of Service; and (iii) you agree to these Terms of Service on behalf of the party that you represent. In such event, "you" and "your" will refer and apply to your employer or such other legal entity.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Any personal data you submit to us or which we collect about you is governed by our Privacy Policy ("Privacy Policy"), available at{' '}
              <a href="https://prolychat.com/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">
                https://prolychat.com/privacy-policy
              </a>. You acknowledge that by using the Services, you have reviewed the Privacy Policy. The Privacy Policy is incorporated by reference into these Terms of Service and together form and are hereinafter referred to as this "Agreement."
            </p>

            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-red-800 font-mona">
                <strong>PLEASE NOTE: THIS AGREEMENT GOVERNS HOW DISPUTES BETWEEN YOU AND PROLYCHAT SOFTWARE PVT LTD CAN BE RESOLVED. IT CONTAINS A BINDING AND FINAL ARBITRATION PROVISION. PLEASE READ CAREFULLY AS IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING, IF APPLICABLE, YOUR RIGHT TO OPT OUT OF ARBITRATION.</strong>
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4 font-mona">
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Our Services</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Account, Password and Security</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Agencies and Business Owners</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">User Generated Content</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Communication by Email</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Communication with Prolychat and its Clients</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Prohibited Uses</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Representations and Warranties; Compliance with Laws</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Billing and Payment</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Termination and Suspension</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Links to Third-Party Websites; Optional Third-Party Tools</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Ownership and Intellectual Property Rights</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Copyright Complaints and Copyright Agent</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Confidential Information</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Disclaimer of Warranties</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Indemnification</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Dispute Resolution – Arbitration</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Governing Law</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">No Agency; No Employment</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">General Provisions</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Changes to this Agreement and the Services</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">No Rights of Third Parties</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Notices and Consent to Receive Notices Electronically</li>
              <li className="text-purple-600 hover:text-purple-700 cursor-pointer">Contacting Us</li>
            </ol>
          </section>

          {/* 1. Our Services */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">1. Our Services</h2>
            <p className="text-gray-700 leading-relaxed font-mona">
              We provide a platform that enables businesses and individuals to create automated chat flows that they can deploy across a wide range of messaging services, social media and other third-party platforms. If you purchase or use our Services, you're doing so through Prolychat, and such purchase and use is subject to this Agreement; provided, that if you've entered into a separate agreement or order form with us governing the purchase or use of our Services, such separate agreement or order form will govern in the event of a conflict with this Agreement.
            </p>
          </section>

          {/* 2. Account, Password and Security */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">2. Account, Password and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You must register with Prolychat and create an account to use the Services (an "Account") and as part of that process you will be requested to provide certain information, including without limitation your name and email address, which may be provided by linking certain services, including without limitation Google, Instagram or Facebook to your Account.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              By using the Services, you agree to provide true, accurate, current and complete information as prompted by the registration process and to maintain and promptly update the Account information to keep it accurate, current and complete. You are the sole authorized user of your Account. You are responsible for maintaining the confidentiality of any login and password provided by you or given to you by Prolychat for accessing the Services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You are solely and fully responsible for all activities that occur under your password or Account, even if not authorized by you. Users are responsible for the content users upload to their Account and use of any user's Account, and Prolychat expressly disclaims any liability derived therefrom. Should you suspect that any unauthorized party may be using your password or Account or you suspect any other breach of security, you agree to contact Prolychat immediately.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              The person signing up for the Services will be the contracting party ("Account Representative") for the purposes of these Terms of Service and will be the person who is authorized to use any corresponding Account we provide to the Account Representative in connection with the Services; provided, however, that if you are signing up for the Services on behalf of your employer, your employer shall be the Account Representative.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              By providing your email address and by using the Services, you hereby affirmatively consent to Prolychat's use of your email address in order to (i) perform and improve upon the Services, (ii) facilitate the carrying out of our Services, and (iii) provide you with information and reminders regarding your registration, changes and updates, service outages, or alterations.
            </p>
          </section>

          {/* 3. Agencies and Business Owners */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">3. Agencies and Business Owners</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed font-mona">
                A "Business Owner" is any individual or entity that uses Prolychat's Services to market, support, develop, or otherwise commercialise their business, services, or products. An "Agency" is any service provider retained or hired by a Business Owner to create and/or manage a Prolychat account and use the Services on the Business Owner's behalf. An Agency is not required for a Business Owner to use the Services.
              </p>
              <p className="text-gray-700 leading-relaxed font-mona">
                Notwithstanding the foregoing in Section 2, if you are an Agency using our Services to provide services to a Business Owner, you (i) agree to correctly identify such Business Owner as an administrator on the Account and, if applicable, on the applicable Facebook page, Instagram page and on any other applicable page on any other applicable platform, and (ii) confirm you are authorized to use the Services and the Account on behalf of the Business Owner.
              </p>
              <p className="text-gray-700 leading-relaxed font-mona">
                The Business Owner shall be the sole and exclusive account representative of any Account created on its behalf by an Agency; provided that the Agency shall maintain its rights and interests in and to all flows or other intellectual property associated with the automation work product created by such Agency for the Business Owner (such work product, the "Agency Content").
              </p>
              <p className="text-gray-700 leading-relaxed font-mona">
                In the event of a termination of the relationship between a Business Owner and its Agency, the Business Owner will promptly notify Prolychat of such termination or update access using the team members section on their dashboard. Following the transfer of an Account from an Agency to the Business Owner, the Business Owner shall be solely responsible for the payment of any subscription plans and/or fees due with respect to the Account.
              </p>
            </div>
          </section>

          {/* 4. User Generated Content */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">4. User Generated Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              "User Generated Content" is defined as any content, information, and materials that may be textual, audio, or visual that you or any Conversation Participant provide, submit, upload, publish, or make otherwise available to the Services and our users. You are solely responsible for your and your Conversation Participants' User Generated Content, and we act merely as a passive conduit for your online distribution and publication of User Generated Content.
            </p>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg mb-4">
              <p className="text-blue-800 mb-2 font-hubot font-semibold">You acknowledge and agree that Prolychat:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 font-mona">
                <li className="text-blue-800">Is not involved in the creation or development of User Generated Content.</li>
                <li className="text-blue-800">Disclaims any responsibility for User Generated Content.</li>
                <li className="text-blue-800">Cannot be liable for claims arising out of or relating to User Generated Content.</li>
                <li className="text-blue-800">Is not obligated to monitor, review, or remove User Generated Content, but reserves the right to limit or remove User Generated Content on the Services at its sole discretion.</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You hereby represent and warrant to Prolychat that your User Generated Content (i) will not be false, inaccurate, incomplete or misleading; (ii) will not infringe on any third party's copyright, patent, trademark, trade secret or other proprietary right or rights of publicity, personality or privacy; (iii) will not violate any law, statute, ordinance, or regulation; (iv) will not be defamatory, libelous, unlawfully threatening, or unlawfully harassing; (v) will not be obscene or contain pornography or be harmful to minors; (vi) will not contain any viruses, Trojan Horses, worms, time bombs, cancelbots or other computer programming routines that are intended to damage, detrimentally interfere with, surreptitiously intercept or expropriate any system, data or personal information; (vii) will not represent you being employed or directly engaged by or affiliated with Prolychat; and (viii) will not create liability for Prolychat or cause Prolychat to lose the services of its ISPs or other suppliers.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              By making available any User Generated Content through the Services, you hereby grant to Prolychat permission to use, process or disclose such User Generated Content on, through or by means of the Services, for the purposes of providing the Services to you, modifying, improving and operating the Services and/or as otherwise permitted by this Agreement. We do not claim any ownership rights in any such User Generated Content and nothing in this Agreement will be deemed to restrict any rights that you may have to use and exploit any such User Generated Content.
            </p>
          </section>

          {/* 5. Communication by Email */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">5. Communication by Email</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              If you would like to communicate with your users via email, you hereby agree to the following Compliance and Indemnity Terms ("CIT"). You are required to use the Services in full compliance with all applicable laws and regulations, including without limitation, all state and central laws specifically including but not limited to the Information Technology Act, 2000 (as amended), the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Telecom Commercial Communications Customer Preference Regulations, 2018 issued by the Telecom Regulatory Authority of India (TRAI), collectively referred to as "Electronic Messaging Laws".
            </p>
            
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mb-4">
              <p className="text-yellow-800 font-mona">
                By making any use of the Services, you expressly warrant that you are and shall continue to act in full compliance with the law, including any amendments to these laws or new applicable regulations. Any breach of the applicable laws, including unauthorized messaging, spamming, or data privacy violations, may result in penalties as per Indian law, and you agree to indemnify the company for any losses or damages arising from your failure to comply.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You agree that you have read and understand the Electronic Messaging Laws and any similar state or provincial/territorial laws, and all other applicable laws and regulations. You understand that in some cases, applicable state and local restrictions are more restrictive than the central rules. You should review these rules with your own legal counsel to ensure that you understand and comply. Prolychat will not assume responsibility for ensuring that your activities meet applicable legal requirements.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              You agree to indemnify, defend and hold harmless Prolychat, along with its owners, members, directors, officers, agents, employees, contractors, consultants and vendors from and against any and all claims, suits, fines, costs, expenses, judgments and fees, including reasonable attorney's fees, court costs and expenses, arising out of a claim alleging any violation by you of the law, or alleging facts that would constitute a breach of your warranties or obligations contained in these Terms of Service, including this CIT.
            </p>
          </section>

          {/* 6. Communication with Prolychat and its Clients */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">6. Communication with Prolychat and its Clients</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You verify that any contact information provided to Prolychat and its clients, including, but not limited to, your email address, is true and accurate. You further verify that you are the email subscriber and/or that you own any email addresses that you provide to Prolychat and its clients.
            </p>
            <p className="text-gray-700 leading-relaxed font-mona">
              You acknowledge that by voluntarily providing your email addresses to Prolychat and its clients, you expressly agree to be contacted at the email addresses you provide. You consent to receive emails on behalf of Prolychat and its clients relating to this agreement, any transaction with Prolychat and its clients, matters related to your account, and promotions from Prolychat and its clients.
            </p>
          </section>

          {/* 7. Prohibited Uses */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">7. Prohibited Uses</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the Services:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4 font-mona mb-4">
              <li className="text-gray-700">for any unlawful purpose;</li>
              <li className="text-gray-700">to conduct any unlawful acts or solicit others to perform or participate in any unlawful acts;</li>
              <li className="text-gray-700">to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances;</li>
              <li className="text-gray-700">to use the Services for any purpose or in any manner that infringes upon or violates the rights, including but not limited to intellectual property rights, of us or any third party;</li>
              <li className="text-gray-700">to harass, abuse, insult, harm, defame, slander, stalk, threaten, disparage, intimidate, discriminate in any way, including, but not limited to, discrimination based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
              <li className="text-gray-700">to submit false or misleading information;</li>
              <li className="text-gray-700">to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services;</li>
              <li className="text-gray-700">for any obscene or immoral purpose;</li>
              <li className="text-gray-700">to interfere with or circumvent the security features of the Services;</li>
              <li className="text-gray-700">to interfere with or carry out any activity that threatens the performance, security, or proper functioning of the Services;</li>
              <li className="text-gray-700">to attempt to compromise the system integrity or security or decipher any transmissions to or from the servers running the Services;</li>
              <li className="text-gray-700">to attempt to access unauthorized Accounts or to collect or track the personal information of others;</li>
              <li className="text-gray-700">to abuse any trial offerings with respect to the Services;</li>
              <li className="text-gray-700">in any way which violates the policies of Facebook, Instagram, or any other platform with which Prolychat does business;</li>
              <li className="text-gray-700">to copy, distribute, or disclose any part of the Services in any medium other than as allowed by the Services and these Terms of Service;</li>
              <li className="text-gray-700">to use any automated system (other than any functionalities of the Services), including without limitation "robots," "spiders," "offline readers," etc., to access the Services;</li>
              <li className="text-gray-700">to transmit spam, chain letters, or other unsolicited email or attempt to phish, pharm, pretext, spider, crawl, or scrape;</li>
              <li className="text-gray-700">to impersonate another person or otherwise misrepresent your affiliation with a person or entity, conduct fraud, hide, or attempt to hide your identity;</li>
              <li className="text-gray-700">to attempt to decipher, decompile, disassemble, or reverse engineer any of the software or algorithms used to provide the Services; or</li>
              <li className="text-gray-700">to encourage or enable any other individual to do any of the foregoing.</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              We reserve the right to terminate your use of the Services or any related website for violating any of the prohibited uses.
            </p>

            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-red-800 font-mona">
                We preserve the right to limit access to the platform for users whose actions result in degrading the experience of other platform users, Prolychat's employees, affiliates, or partners or the employees, affiliates, or partners of any other platform, including without limitation, Facebook and Instagram.
              </p>
            </div>
          </section>

          {/* 8. Representations and Warranties; Compliance with Laws */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">8. Representations and Warranties; Compliance with Laws</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You represent and warrant that: (i) you are 18 years of age or older or are at least of the legally required age in the jurisdiction in which you reside, and are otherwise capable of entering into binding contracts, and (ii) you have the right, authority and capacity to enter into this Agreement and to abide by the terms and conditions of this Agreement, and that you will so abide.
            </p>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900 mb-2 font-hubot">GDPR Compliance Notice</h3>
              <p className="text-blue-800 mb-2 font-mona">
                If you are located in the European Economic Area ("EEA") or serve end-users in the EEA market, you represent and warrant that in using the Services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 font-mona">
                <li className="text-blue-800">you acknowledge that the Services are not currently GDPR-compliant. By using the Services, you assume full responsibility for ensuring that your use of the Services complies with applicable data protection laws, including the General Data Protection Regulation (GDPR);</li>
                <li className="text-blue-800">you will not use the Services to collect, manage, or process personal data of users in the EEA unless you have obtained explicit consent and have implemented appropriate data protection measures;</li>
                <li className="text-blue-800">you will ensure that your posted privacy policy accurately reflects the limitations of using a non-GDPR-compliant service and informs users about the nature of the data being processed;</li>
                <li className="text-blue-800">you agree that Prolychat will not be responsible for ensuring GDPR compliance in connection with the data you process using the Services. You remain fully liable for any legal claims, penalties, or damages arising from non-compliance with GDPR or other applicable data protection laws;</li>
                <li className="text-blue-800">you agree not to use the Services to collect, manage, or process sensitive customer information (e.g., health, financial, or government-issued identification data), for which Prolychat or the service provider will bear no responsibility or liability.</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed font-mona">
              You agree to indemnify and hold Prolychat and its officers and directors harmless from any claims, demands, and losses, including attorney's fees, arising out of your breach of any part of the representations and warranties in this Section.
            </p>
          </section>

          {/* 9. Billing and Payment */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">9. Billing and Payment</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed font-mona">
                Unless we separately agree with you that you will receive an invoice from us for the Services that requires you to pay us directly, payment and any other expenses must be paid through the third party payment processing system (the "PSP") as indicated on the Services. You may be required to register with the PSP, agree to terms of service of the PSP, provide your payment details to the PSP and go through a vetting process at the request of the PSP to set up an account with the PSP (the "PSP Services Agreement").
              </p>

              <p className="text-gray-700 leading-relaxed font-mona">
                All prices and fees displayed on the Services are exclusive of applicable central, state or other governmental sales, goods and services or other taxes, fees or charges now in force or enacted in the future ("Taxes"). Any applicable Taxes are based on the rates applicable to the billing address you provide to us and will be calculated at the time a transaction is charged to your Account. Unless otherwise indicated, all prices, fees and other charges are in Indian Rupees (INR), and all payments shall be in Indian currency.
              </p>

              <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2 font-hubot">Subscription Plans</h3>
                <p className="text-green-800 font-mona">
                  Our charges for subscription plans (monthly, annual, or other period, as applicable from time to time) and fees for any additional Services are posted on the Site and may be changed from time to time. If you have signed up for a Prolychat subscription plan (each a, "Subscription Plan") and any part of a month, year, or other period is included in the Term, then payment will be due for the full month, full year, or full other period, as applicable.
                </p>
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2 font-hubot">No Refund Policy</h3>
                <p className="text-red-800 font-mona">
                  All purchases are final and non-refundable. Prolychat does not offer refunds for any portion of a prepaid month or year under any circumstances, including if services are discontinued or your access is terminated. By using our Services, you acknowledge and agree that you are not entitled to any refunds. If you have any questions or concerns regarding your purchase, please contact our customer support team at{' '}
                  <a href="mailto:contact@prolychat.com" className="text-red-600 hover:text-red-700 underline">
                    contact@prolychat.com
                  </a>.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 font-hubot">Trial Periods</h3>
                <p className="text-blue-800 mb-2 font-mona">
                  From time to time, we may offer trials of paid Services for a specified period without payment or at a reduced rate (a "Trial"). Important trial terms:
                </p>
                <p className="text-blue-800 font-mona">
                  <strong>UNLESS YOU CANCEL A TRIAL BEFORE THE END OF THE TRIAL PERIOD, YOU WILL AUTOMATICALLY BECOME A RECURRING SUBSCRIBER TO THE SERVICES YOU CHOSE TO SIGN UP FOR UNDER THE TRIAL AND THE PAYMENT METHOD YOU PROVIDED WILL AUTOMATICALLY BE CHARGED THE THEN-CURRENT APPLICABLE PRICE. IF YOU CANCEL THE TRIAL DURING THE TRIAL PERIOD, YOU WILL LOSE ACCESS TO THE SERVICES. TO CANCEL, YOU MUST LOG INTO YOUR ACCOUNT AND FOLLOW THE PROMPTS ON THE ACCOUNT PAGE.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* 10. Termination and Suspension */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">10. Termination and Suspension</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed font-mona">
                Unless otherwise agreed to in writing between you and Prolychat, either party may terminate these Terms of Service for any or no cause, at any time. You may cancel and delete your Account at any time by either using the features on the Services to do so. After cancellation, you will no longer have access to your Account, your profile or any other information through the Services.
              </p>

              <p className="text-gray-700 leading-relaxed font-mona">
                We reserve the right to refuse the Services to anyone for any reason at any time. Prolychat may terminate or limit your right to use the Services in the event that we are investigating or believe that you have breached any provision of this Agreement without any notice.
              </p>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2 font-hubot">Data Deletion</h3>
                <p className="text-yellow-800 font-mona">
                  Following the termination or cancellation of your Account, we reserve the right to delete all your data, including any User Generated Content, in the normal course of operation. Your data cannot be recovered once your Account is terminated or canceled.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed font-mona">
                If there is no activity in your Account (which includes login activity, conversation activity, payment transactions or a planned broadcast) for at least 18 months, consecutively, we will endeavor to notify you by email or by other means, but will not be liable for any failure to do so, and give you the option of keeping your Account open. If you do not respond to our notice within thirty days, we reserve the right to close your account and delete all your data.
              </p>
            </div>
          </section>

          {/* 11. Links to Third-Party Websites; Optional Third-Party Tools */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">11. Links to Third-Party Websites; Optional Third-Party Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              The Services may contain links (such as hyperlinks) to third-party websites. Such links do not constitute endorsement by Prolychat or association with those websites, their content or their operators. Such links are provided as an information service, for reference and convenience only. Prolychat does not control any such websites and is not responsible for their availability or accuracy, or content, advertising, products, or services.
            </p>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900 mb-2 font-hubot">Third-Party Account Integration</h3>
              <p className="text-blue-800 font-mona">
                As part of the functionality of the Services, you may link your Account with online accounts you may have with third-party service providers, such as Facebook, Instagram, WhatsApp and Telegram (each such account, a "Third-Party Account"). You represent that you are entitled to disclose your Third-Party Account login information to Prolychat and/or grant Prolychat access to your Third-Party Account without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed font-mona">
              We may provide you with access to third-party tools ("Third-Party Tools") which we do not monitor and over which we have no control or input. You acknowledge and agree that we provide access to such tools on an "as-is" and "as-available" basis without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of Third-Party Tools.
            </p>
          </section>

          {/* 12. Ownership and Intellectual Property Rights */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">12. Ownership and Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              All text, graphics, editorial content, data, formatting, graphs, designs, HTML, look and feel, photographs, music, sounds, images, software, videos, designs, trademarks, logos, typefaces and other content (collectively "Proprietary Material") that users see or read through the Services is owned by Prolychat, excluding User Generated Content, which users hereby grant Prolychat a non-exclusive license to use.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Proprietary Material is protected in all forms, media and technologies now known or hereinafter developed. Prolychat owns all Proprietary Material, as well as the coordination, selection, arrangement and enhancement of such Proprietary Materials as a Collective Work under the United States Copyright Act, as amended. The Proprietary Material is protected by the domestic and international laws governing copyright, patents, and other proprietary rights.
            </p>

            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2 font-hubot">Feedback</h3>
              <p className="text-green-800 font-mona">
                Additionally, you may choose to or we may invite you to submit comments, ideas, or feedback about the Services, including without limitation about how to improve our services or our products ("Feedback"). By submitting any Feedback, you agree that your disclosure is gratuitous, unsolicited, and without restriction and will not place Prolychat under any fiduciary or other obligation, and that we are free to use the Feedback without any additional compensation to you.
              </p>
            </div>
          </section>

          {/* 13. Copyright Complaints and Copyright Agent */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">13. Copyright Complaints and Copyright Agent</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Prolychat respects the intellectual property of others and expects users to do the same. If you believe, in good faith, that any materials provided on or in connection with the Services infringe upon your copyright or other intellectual property right, please send the following information to Prolychat at:
            </p>
            
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-gray-700 font-semibold mb-2 font-hubot">Prolychat Software Pvt Ltd</p>
              <p className="text-gray-700 font-mona">Email: <a href="mailto:legal@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">legal@prolychat.com</a></p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-2 font-mona">Please include the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 font-mona">
              <li className="text-gray-700">A description of the copyrighted work that you claim has been infringed, including the URL or other specific location on the Services where the material you claim is infringed is located;</li>
              <li className="text-gray-700">A description of the location where the original or an authorized copy of the copyrighted work exists;</li>
              <li className="text-gray-700">Your address, telephone number, and e-mail address;</li>
              <li className="text-gray-700">A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</li>
              <li className="text-gray-700">A statement by you, made under penalty of perjury, that the information in your notice is accurate, and that you are the copyright owner or authorized to act on the copyright owner's behalf;</li>
              <li className="text-gray-700">An electronic or physical signature of the owner of the copyright or the person authorized to act on behalf of the owner of the copyright interest.</li>
            </ul>
          </section>

          {/* 14. Confidential Information */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">14. Confidential Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You acknowledge that Confidential Information (as defined below) is a valuable, special and unique asset of Prolychat and agree that you will not disclose, transfer, use (or seek to induce others to disclose, transfer or use) any Confidential Information for any purpose other than using the Services in accordance with these Terms of Service.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              The term "Confidential Information" shall mean any and all of Prolychat's trade secrets, confidential and proprietary information, and all other information and data of Prolychat that is not generally known to the public or other third parties who could derive value, economic or otherwise, from its use or disclosure. Confidential Information shall be deemed to include technical data, know-how, research, product plans, products, services, customers, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, strategic and other proprietary and confidential information relating to Prolychat or Prolychat's business, operations or properties.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              You shall return all originals and any copies of any and all materials containing Confidential Information to Prolychat upon termination of this Agreement for any reason whatsoever.
            </p>
          </section>

          {/* 15. Disclaimer of Warranties */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">15. Disclaimer of Warranties</h2>
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg mb-4">
              <p className="text-red-800 font-mona">
                <strong>THE SERVICES IS PROVIDED ON AN "AS IS" BASIS WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong>
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Prolychat MAKES NO WARRANTIES OR REPRESENTATIONS ABOUT THE RELIABILITY, TIMELINESS, SECURITY, ACCURACY OR COMPLETENESS OF THE SERVICES, ANY CONTENT PROVIDED BY OR TRANSMITTED VIA THE SERVICES OR THE CONTENT OF ANY SITES LINKED TO THE SERVICES, AND ASSUMES NO LIABILITY OR RESPONSIBILITY IN CONTRACT, WARRANTY OR IN TORT FOR ANY BUGS, ERRORS, MISTAKES, OR INACCURACIES OF CONTENT, PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES.
            </p>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <p className="text-yellow-800 font-mona">
                <strong>UNDER NO CIRCUMSTANCES WILL Prolychat AND AFFILIATES OR THEIR CORPORATE PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, AGENTS, SUPPLIERS OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, ACTUAL, CONSEQUENTIAL, ECONOMIC, SPECIAL OR EXEMPLARY DAMAGES ARISING IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICES. IF, NOTWITHSTANDING THE FOREGOING EXCLUSIONS, IT IS DETERMINED THAT Prolychat AND AFFILIATES OR THEIR CORPORATE PARTNERS ARE LIABLE FOR DAMAGES, IN NO EVENT WILL THE AGGREGATE LIABILITY EXCEED THE LOWER OF (I) THE TOTAL FEES PAID BY YOU TO Prolychat DURING THE SIX MONTHS PRIOR TO THE TIME SUCH CLAIM AROSE OR (II) TEN THOUSAND INDIAN RUPEES (₹10,000).</strong>
              </p>
            </div>
          </section>

          {/* 16. Indemnification */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">16. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You hereby agree to indemnify, defend, and hold harmless Prolychat and its officers, directors, employees, agents, attorneys, insurers, successors and assigns (the "Indemnified Parties") from and against any and all Liabilities incurred in connection with (i) your use or inability to use the Services, (ii) your breach or violation of this Agreement; (iii) your violation of any law, or the rights of any user or third party; and (iv) any content submitted by you or using your Account to the Services.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              You also agree to indemnify the Indemnified Parties for any Liabilities resulting from your use of software robots, spiders, crawlers, or similar data gathering and extraction tools, or any other action you take that imposes an unreasonable burden or loan on our infrastructure. Prolychat reserves the right, in its own sole discretion, to assume the exclusive defense and control at its own expense of any matter otherwise subject to your indemnification.
            </p>
          </section>

          {/* 17. Dispute Resolution – Arbitration */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">17. Dispute Resolution – Arbitration</h2>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg mb-4">
              <p className="text-blue-800 font-mona">
                The Terms and the relationship between you and Prolychat shall be governed by the laws of India. Any claim you may have against Prolychat must be resolved through arbitration or any other form of alternate dispute resolution within the territorial jurisdictions of the courts of Kanpur only.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You agree that any cause of action brought by you and arising out of or related to your use of the service and/or the website must commence within a reasonable time and in any event within one (1) year after the cause of action accrues, except that Prolychat may commence any such cause of action in accordance with the applicable statute of limitations under Indian law. Otherwise such cause of action is permanently barred.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              These Terms shall inure to the benefit of and be binding upon each party's successors and assigns. Prolychat respects the laws of India and submits itself to its jurisdiction. In the event wherein deemed necessary, Prolychat contrary to the terms and conditions set herein, shall provide the relevant information(s) or cooperate with the law enforcement agencies of the India.
            </p>
          </section>

          {/* 18. Governing Law */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">18. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed font-mona">
              This Agreement and your use of the Services will be governed by, and will be construed under, the laws of India, without regard to choice of law principles. This choice of law provision is only intended to specify the use of Indian law to interpret this Agreement.
            </p>
          </section>

          {/* 19. No Agency; No Employment */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">19. No Agency; No Employment</h2>
            <p className="text-gray-700 leading-relaxed font-mona">
              No agency, partnership, joint venture, employer-employee or franchiser-franchisee relationship is intended or created by this Agreement.
            </p>
          </section>

          {/* 20. General Provisions */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">20. General Provisions</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Failure by Prolychat to enforce any provision of this Agreement will not be construed as a waiver of any provision or right. This Agreement constitutes the complete and exclusive agreement between you and Prolychat with respect to its subject matter and supersedes and governs any and all prior agreements or communications.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              The provisions of this Agreement are intended to be interpreted in a manner which makes them valid, legal, and enforceable. In the event any provision is found to be partially or wholly invalid, illegal or unenforceable, (i) such provision shall be modified or restructured to the extent and in the manner necessary to render it valid, legal, and enforceable or, (ii) if such provision cannot be so modified or restructured, it shall be excised from the Agreement without affecting the validity, legality or enforceability of any of the remaining provisions.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              This Agreement may not be assigned or transferred by you without our prior written approval. We may assign or transfer this Agreement without your consent, including but not limited to assignments: (1) to a parent or subsidiary, (2) to an acquirer of assets, or (3) to any other successor or acquirer. Any assignment in violation of this section shall be null and void. This Agreement will inure to the benefit of Prolychat, its successors and assigns.
            </p>
          </section>

          {/* 21. Changes to this Agreement and the Services */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">21. Changes to this Agreement and the Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Prolychat reserves the right, at its sole and absolute discretion, to change, modify, add to, supplement, suspend, discontinue, or delete any of the terms and conditions of this Agreement (including these Terms of Service and Privacy Policy) and review, improve, modify or discontinue, temporarily or permanently, the Services or any content or information through the Services at any time, effective with or without prior notice and without any liability to Prolychat.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              Prolychat will endeavor to notify you of material changes by email but will not be liable for any failure to do so. If any future changes to this Agreement are unacceptable to you or cause you to no longer be in compliance with this Agreement, you must terminate, and immediately stop using, the Services.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              Your continued use of the Services following any revision to this Agreement constitutes your complete and irrevocable acceptance of any and all such changes. Prolychat may also impose limits on certain features or restrict your access to part or all of the Services without notice or liability.
            </p>
          </section>

          {/* 22. No Rights of Third Parties */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">22. No Rights of Third Parties</h2>
            <p className="text-gray-700 leading-relaxed font-mona">
              None of the terms of this Agreement are enforceable by any persons who are not a party to this Agreement.
            </p>
          </section>

          {/* 23. Notices and Consent to Receive Notices Electronically */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">23. Notices and Consent to Receive Notices Electronically</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              You consent to receive any agreements, notices, disclosures and other communications (collectively, "Notices") to which this Agreement refers electronically, including without limitation by e-mail or by posting Notices on this Site. You agree that all Notices that we provide to you electronically satisfy any legal requirement that such communications be in writing.
            </p>

            <p className="text-gray-700 leading-relaxed font-mona">
              Unless otherwise specified in this Agreement, all notices under this Agreement will be in writing and will be deemed to have been duly given when received, if personally delivered or sent by certified or registered mail, return receipt requested; when receipt is electronically confirmed, if transmitted by facsimile or email; or the day after it is sent, if sent for next day delivery by a recognized overnight delivery service.
            </p>
          </section>

          {/* 24. Contacting Us */}
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-hubot">24. Contacting Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-mona">
              If you have any questions about these Terms of Service or about the Services, please contact us:
            </p>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-semibold mb-2 font-hubot">Prolychat Software Pvt Ltd</p>
              <p className="text-gray-700 font-mona">Support: <a href="https://prolychat.com/support" className="text-purple-700 underline">prolychat.com/support</a></p>
              <p className="text-gray-700 font-mona">Email: <a href="mailto:legal@prolychat.com" className="text-purple-600 hover:text-purple-700 underline">legal@prolychat.com</a></p>
            </div>
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

export default TermsOfServicePage;

