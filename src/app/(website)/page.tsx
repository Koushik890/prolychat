import { HeroSection } from "@/components/sections/hero-section";
import Solution from "@/components/sections/solution";
import HowItWorks from "@/components/sections/how-it-works";
import TestimonialsCarousel from "@/components/sections/testimonials-carousel";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import PricingSection from "@/components/sections/Pricing";

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