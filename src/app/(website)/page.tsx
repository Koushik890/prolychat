import { HeroSection } from "@/components/sections/hero-section";
import Solution from "@/components/sections/solution";
import HowItWorks from "@/components/sections/how-it-works";
import TestimonialsCarousel from "@/components/sections/testimonials-carousel";
import Features from "@/components/sections/features";
import Testimonials from "@/components/sections/testimonials";
import PricingSection from "@/components/sections/pricing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Solution />
      <HowItWorks />
      <TestimonialsCarousel />
      <Features />
      <Testimonials />
      <PricingSection />
    </div>
  );
}