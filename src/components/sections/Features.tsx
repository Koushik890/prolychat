import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Key, Megaphone } from "lucide-react";

const data = [
  {
    id: 1,
    title: "Select Posts or Reels",
    content: "Choose your best content for DM automation campaigns.",
    image: "/select-post-reel.png",
    icon: <img src="/Reels.svg" alt="Reels" className="h-6 w-6" />,
  },
  {
    id: 2,
    title: "Define Keywords",
    content: "Configure key terms that will attract your target audience.",
    image: "/configure-keywords.png",
    icon: <Key className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Automate DMs",
    content: "Schedule and send personalized messages with ease.",
    image: "/configure-message.png",
    icon: <img src="/Messages.svg" alt="Automate DMs" className="h-6 w-6" />,
  },
  {
    id: 4,
    title: "Wait to go Viral!",
    content: "Watch your engagement grow effortlessly and organically.",
    video: "/grow-engagement.mp4",
    icon: <Megaphone className="h-6 w-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="Features" subtitle="User Flows and Navigational Structures">
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
} 