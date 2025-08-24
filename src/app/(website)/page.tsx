import { HeroSection } from "@/components/sections/hero-section";
import Logos from "@/components/sections/logos";
import Solution from "@/components/sections/solution";
import HowItWorks from "@/components/sections/how-it-works";
import TestimonialsCarousel from "@/components/sections/testimonials-carousel";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import PricingSection from "@/components/sections/Pricing";
import FAQ from "@/components/sections/faq";
import BlogSection from "@/components/sections/blog";
import CtaSection from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Logos />
      <Solution />
      <HowItWorks />
      <TestimonialsCarousel />
      <Features />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <BlogSection />
      <CtaSection />
      <Footer />
    </div>
  );
}