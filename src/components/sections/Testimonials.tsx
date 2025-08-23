"use client";

import Marquee from "@/components/magicui/marquee";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-primary/20 p-1 py-0.5 font-bold text-primary dark:bg-primary/20 dark:text-primary",
        className
      )}
    >
      {children}
    </span>
  );
};

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const TestimonialCard = ({
  description,
  name,
  img,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      // light styles
      " border border-neutral-200 bg-white",
      // dark styles
      "dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props} // Spread the rest of the props here
  >
    <div className="select-none text-sm font-normal text-neutral-700 dark:text-neutral-400 font-mona">
      {description}
      <div className="flex flex-row py-1">
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
      </div>
    </div>

    <div className="flex w-full select-none items-center justify-start gap-5">
      <Image
        width={40}
        height={40}
        src={img || ""}
        alt={name}
        className="h-10 w-10 rounded-full ring-1 ring-border ring-offset-4"
      />

      <div>
        <p className="font-medium text-neutral-500 font-mona">{name}</p>
        <p className="text-xs font-normal text-neutral-400 font-mona">{role}</p>
      </div>
    </div>
  </div>
);

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Social Media Manager at Fashion Forward",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
    description: (
      <p>
        The Instagram automation tools have completely transformed how we manage
        customer engagement.
        <Highlight>
          Response time improved from hours to minutes!
        </Highlight>{" "}
        Our followers love the quick, personalized replies.
      </p>
    ),
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Director at TechStart Solutions",
    img: "https://randomuser.me/api/portraits/men/91.jpg",
    description: (
      <p>
        Managing multiple Instagram accounts used to be a nightmare. Now it&apos;s
        effortless with automated responses and smart engagement tools.
        <Highlight>Freed up 20+ hours per week for content creation.</Highlight>{" "}
        Game-changer for our marketing team.
      </p>
    ),
  },
  {
    name: "Priya Patel",
    role: "Founder at EcoBeauty Co",
    img: "https://randomuser.me/api/portraits/women/83.jpg",
    description: (
      <p>
        As a small business, we couldn&apos;t afford to miss customer inquiries.
        The automation ensures we never do.
        <Highlight>
          Customer satisfaction scores increased by 40%.
        </Highlight>{" "}
        Essential tool for any growing business.
      </p>
    ),
  },
  {
    name: "David Kim",
    role: "CEO at Digital Marketing Pro",
    img: "https://randomuser.me/api/portraits/men/45.jpg",
    description: (
      <p>
        The comment automation features have made our Instagram presence feel
        incredibly responsive and personal.
        <Highlight>
          Engagement rates doubled in just two months.
        </Highlight>{" "}
        Our clients are amazed by the results.
      </p>
    ),
  },
  {
    name: "Amanda Foster",
    role: "Brand Manager at Lifestyle Co",
    img: "https://randomuser.me/api/portraits/women/5.jpg",
    description: (
      <p>
        Managing customer inquiries across multiple time zones was impossible
        before. Now our automation handles it perfectly.
        <Highlight>
          24/7 customer support without the overhead.
        </Highlight>{" "}
        Our international customers love the instant responses.
      </p>
    ),
  },
  {
    name: "James Wilson",
    role: "E-commerce Owner at Urban Outfitters",
    img: "https://randomuser.me/api/portraits/men/14.jpg",
    description: (
      <p>
        The automated reply system has been incredible for our customer service.
        <Highlight>
          Social media ROI increased by 300% this quarter.
        </Highlight>{" "}
        More sales, happier customers, less stress.
      </p>
    ),
  },
  {
    name: "Lisa Thompson",
    role: "Social Media Specialist at HealthTech",
    img: "https://randomuser.me/api/portraits/women/56.jpg",
    description: (
      <p>
        Our healthcare brand needed to maintain a personal touch while scaling
        rapidly. The automation tools deliver exactly that.
        <Highlight>
          Professional responses that feel genuinely caring.
        </Highlight>{" "}
        Perfect balance of efficiency and empathy.
      </p>
    ),
  },
  {
    name: "Carlos Mendez",
    role: "Marketing Manager at Food & Beverage Co",
    img: "https://randomuser.me/api/portraits/men/18.jpg",
    description: (
      <p>
        Restaurant customers expect quick responses, especially during peak hours.
        The automation ensures we never miss an opportunity.
        <Highlight>
          Table bookings from Instagram increased by 60%.
        </Highlight>{" "}
        Our waitstaff can focus on in-person service.
      </p>
    ),
  },
  {
    name: "Rachel Green",
    role: "Content Creator at Travel Adventures",
    img: "https://randomuser.me/api/portraits/women/73.jpg",
    description: (
      <p>
        As a travel influencer, I need to engage with followers even when
        I&apos;m exploring remote locations.
        <Highlight>
          Never miss a comment, no matter where I am.
        </Highlight>{" "}
        The automation keeps my community engaged 24/7.
      </p>
    ),
  },
  {
    name: "Michael Chang",
    role: "Digital Marketing Consultant",
    img: "https://randomuser.me/api/portraits/men/25.jpg",
    description: (
      <p>
        I manage social media for multiple clients, and this platform has
        revolutionized my workflow.
        <Highlight>
          Can handle 10x more accounts with better results.
        </Highlight>{" "}
        My clients are thrilled with the improved engagement.
      </p>
    ),
  },
  {
    name: "Natalie Brooks",
    role: "Customer Success Manager at SaaS Startup",
    img: "https://randomuser.me/api/portraits/women/78.jpg",
    description: (
      <p>
        Our startup needed to scale customer support without hiring more staff.
        The automation tools have been perfect.
        <Highlight>
          Support tickets resolved 3x faster.
        </Highlight>{" "}
        Our customers get instant help, our team stays lean.
      </p>
    ),
  },
  {
    name: "Ahmed Hassan",
    role: "Founder at Local Business Network",
    img: "https://randomuser.me/api/portraits/men/54.jpg",
    description: (
      <p>
        Running a local business network means managing dozens of social media
        accounts. This platform makes it manageable and effective.
        <Highlight>
          Unified approach across all our member businesses.
        </Highlight>{" "}
        Everyone wins with better customer engagement.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <Section
      title="Testimonials"
      subtitle="What our customers are saying"
      className="max-w-8xl"
    >
      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-background from-20%"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-background from-20%"></div>
      </div>
    </Section>
  );
} 