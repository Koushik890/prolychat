import FeaturesAlternating from "@/components/features-alternating";
import Section from "@/components/section";
import { Sparkles, Upload, Zap } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Respond to every comment",
    content:
      "Auto-respond to every Instagram comment in a DM. Keep your audience (and the algorithm) happy — and watch your revenue grow.",
    image: "/insta-respond.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. Build your email list",
    content:
      "Automatically collect emails so you can reach your audience directly - anytime, anywhere without the algorithm.",
    image: "/email-list.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Capture Contact Details",
    content:
      "Capture Instagram profiles and usernames from your interactions. Instantly expand your contact list with emails and phone numbers pulled from profiles.",
    image: "/contact-save.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="Just 3 steps to get started">
      <FeaturesAlternating data={data} />
    </Section>
  );
} 