export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Prolychat",
  description: "All rights reserved",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Social Media", "AI Automation", "Instagram", "Engagement", "Comments"],
  links: {
    email: "support@prolychat.com",
    twitter: "https://twitter.com/prolychat",
    discord: "https://discord.gg/prolychat",
    github: "https://github.com/prolychat",
    instagram: "https://instagram.com/prolychat/",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          title: "AI-Powered Automation",
          description: "Streamline your workflow with intelligent automation.",
          href: "#",
        },
        items: [
          {
            href: "#",
            title: "Task Automation",
            description: "Automate repetitive tasks and save time.",
          },
          {
            href: "#",
            title: "Workflow Optimization",
            description: "Optimize your processes with AI-driven insights.",
          },
          {
            href: "#",
            title: "Intelligent Scheduling",
            description: "AI-powered scheduling for maximum efficiency.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "For Small Businesses",
            href: "#",
            description: "Tailored automation solutions for growing companies.",
          },
          {
            title: "Enterprise",
            href: "#",
            description: "Scalable AI automation for large organizations.",
          },
          {
            title: "Developers",
            href: "#",
            description: "API access and integration tools for developers.",
          },
          {
            title: "Healthcare",
            href: "#",
            description: "Specialized automation for healthcare workflows.",
          },
          {
            title: "Finance",
            href: "#",
            description: "AI-driven process automation for financial services.",
          },
          {
            title: "Education",
            href: "#",
            description:
              "Streamline administrative tasks in educational institutions.",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ],
  pricing: [
    {
      name: "Starter Plan",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "Boost engagement with target responses",
        "Automate comment replies to enhance audience interaction",
        "Turn followers into customers with targeted messaging",
      ],
      description: "For Small Teams & Startups",
      buttonText: "Get Started",
      isPopular: false,
    },
    {
      name: "Growth Plan",
      href: "#",
      price: "$5",
      period: "month",
      yearlyPrice: "$4",
      features: [
        "All features from Starter Plan",
        "AI-powered response generation",
        "Advanced analytics and insights",
        "Priority customer support",
        "Custom branding options",
      ],
      description: "For Scaling Teams & Businesses",
      buttonText: "Get Started",
      isPopular: true,
    },
  ],
  faqs: [
    {
      question: "What is Prolychat?",
      answer: (
        <span>
          Prolychat is an AI-powered social media automation platform that helps you
          automate authentic conversations with your audience. Connect your Instagram
          account and let our AI respond to comments and direct messages while maintaining
          your brand voice and personality.
        </span>
      ),
    },
    {
      question: "How does Prolychat work with Instagram?",
      answer: (
        <span>
          Simply connect your Instagram business account through our secure integration.
          Prolychat monitors your posts for new comments and can automatically respond
          based on the automation rules you set up. You maintain full control over
          when and how responses are sent.
        </span>
      ),
    },
    {
      question: "Will the AI responses sound natural and authentic?",
      answer: (
        <span>
          Yes! Prolychat uses advanced AI that understands context and can adapt to your
          brand voice. You can customize response templates, set conversation tone, and
          the AI learns from your preferences to maintain authentic, engaging conversations
          that feel genuinely human.
        </span>
      ),
    },
    {
      question: "Can I control which comments get automated responses?",
      answer: (
        <span>
          Absolutely! You have complete control over your automation rules. Set up keyword
          triggers, choose specific post types to automate, exclude certain words or phrases,
          and always have the option to manually review or override any automated response
          before it's sent.
        </span>
      ),
    },
    {
      question: "Is my Instagram account safe with Prolychat?",
      answer: (
        <span>
          Your security is our top priority. Prolychat uses official Instagram API
          connections with bank-level encryption. We never store your Instagram password,
          and you can revoke access at any time. Our platform is fully compliant with
          Instagram's terms of service and privacy policies.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "#", text: "Features", icon: null },
        { href: "#", text: "Pricing", icon: null },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", text: "About Us", icon: null },
        { href: "#", text: "Blog", icon: null },
        { href: "#", text: "Partners", icon: null },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", text: "Contact", icon: null },
        { href: "#", text: "Support", icon: null },
        { href: "#", text: "Status", icon: null },
      ],
    },
    {
      title: "Social",
      links: [
        {
          href: "https://twitter.com/prolychat",
          text: "Twitter",
          icon: "twitter",
        },
        {
          href: "https://instagram.com/prolychat/",
          text: "Instagram",
          icon: "instagram",
        },
        {
          href: "#",
          text: "Youtube",
          icon: "youtube",
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig; 