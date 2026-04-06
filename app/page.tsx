import PremiumHeroCarousel from "@/components/premium-hero-carousel";
import ServicesSection from "@/components/services-section";
import HowItWorksSection from "@/components/how-it-works-section";
import FeaturesSection from "@/components/features-section";
import StatsSection from "@/components/stats-section";
import TestimonialsSection from "@/components/testimonials-section";
import CTASection from "@/components/cta-section";
import { constructMetadata } from "@/lib/metadata-utils";
import { getAllServices } from "@/lib/service-api";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await constructMetadata("home");
}

export default async function Home() {
  // Fetch services on server-side
  let services = [];
  try {
    const res = await getAllServices("active");
    if (res.success && res.data) {
      services = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch services for home page:", error);
  }

  return (
    <>
      <PremiumHeroCarousel />
      <ServicesSection services={services} />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection primaryButtonHref="/services" secondaryButtonHref="/about" />
    </>
  );
}
