"use client";

import FlickeringGrid from "@/components/magicui/flickering-grid";
import Ripple from "@/components/magicui/ripple";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "Maximize Link Clicks",
    description:
      "Ditch the 'link in bio.' Drive higher conversion by sending clickable links directly to your audience's DMs.",
    className: "hover:bg-red-500/10 transition-all duration-500 ease-out",
    content: (
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center -mb-4">
        <img 
          src="/link-clicks.png" 
          alt="Link Clicks Interface"
          className="max-w-full h-48 w-full px-4 object-contain select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
        />
      </div>
    ),
  },
  {
    title: "Increase Engagement by 10X",
    description:
      "Ignite conversations with automated DMs, turning comments into engagement and helping your reels go viral.",
    className:
      "order-3 xl:order-none hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: (
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center -mb-4">
        <img 
          src="/boost engagement.png" 
          alt="Engagement Boost Interface"
          className="max-w-full h-48 w-full px-4 object-contain select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
        />
      </div>
    ),
  },
  {
    title: "24/7 Automated Support",
    description:
      "Our intelligent bots actively engage customers, resolve inquiries, and identify qualified leads continuously, ensuring no opportunity is overlooked.",
    className:
      "md:row-span-2 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <FlickeringGrid
          className="z-0 absolute inset-0 [mask:radial-gradient(circle_at_center,#fff_400px,transparent_0)]"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.1}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <div className="relative z-10 flex items-center justify-center h-full -mt-4">
          <img 
            src="/bot_message.png" 
            alt="Instagram Chat Interface"
            className="max-w-full max-h-[480px] object-contain select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
          />
        </div>
      </>
    ),
  },
  {
    title: "Unlock More Brand Deals",
    description:
      "Leverage higher engagement from reel interactions and link clicks to secure more brand partnerships at premium rates.",
    className:
      "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Ripple className="absolute -bottom-full" />
        <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center -mb-4">
          <img 
            src="/Unlock More.jpg" 
            alt="Brand Deals Interface"
            className="max-w-full h-56 w-full px-4 object-contain select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
          />
        </div>
      </>
    ),
  },
];

export default function Component() {
  return (
    <Section
      title="Why Choose Us"
      subtitle="Instagram Automation That Actually Works"
      description="Built for creators and businesses who want real results without complex setups. Our platform delivers powerful Instagram automation that's simple, effective, and designed specifically for growth."
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={cn(
              "group relative items-start overflow-hidden bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl min-h-[340px]",
              feature.className
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="font-semibold mb-2 text-primary font-mona">
                {feature.title}
              </h3>
              <p className="text-foreground font-mona">{feature.description}</p>
            </div>
            {feature.content}
            <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
