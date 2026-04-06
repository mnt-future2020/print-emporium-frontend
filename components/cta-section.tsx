"use client";

import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/use-company-settings";
import Link from "next/link";

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  backgroundImage?: string;
  badgeText?: string;
}

export default function CTASection({
  title = "Ready to start your next masterpiece?",
  description,
  primaryButtonText = "Start Your Project",
  primaryButtonHref = "/services",
  secondaryButtonText = "View Portfolio",
  secondaryButtonHref = "/about",
  backgroundImage = "/assets/images/cta/cta-background.jpg",
  badgeText,
}: CTASectionProps) {
  const { settings, loading } = useCompanySettings();
  const defaultDescription = `Join 300+ companies who trust ${
    loading ? "Loading..." : settings?.companyName || "PrintEmporium"
  }`;
  const finalDescription = description || defaultDescription;
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="relative rounded-[3rem] overflow-hidden bg-primary-900 text-white p-12 lg:p-24 text-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary-950/80 to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            {badgeText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                  <Rocket className="w-4 h-4 text-primary-400" />
                  {badgeText}
                </div>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-primary-200 text-xl"
            >
              {finalDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href={primaryButtonHref}>
                <Button
                  size="lg"
                  className="bg-white text-primary-950 hover:bg-base-100 h-14 px-8 rounded-2xl text-lg font-semibold group"
                >
                  {primaryButtonText}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={secondaryButtonHref}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 rounded-2xl text-lg backdrop-blur-sm transition-all duration-300"
                >
                  {secondaryButtonText}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
