"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/cta-section";
import OurJourneySection from "@/components/our-journey-section";
import { useCompanySettings } from "@/hooks/use-company-settings";
import {
  Target,
  Eye,
  Heart,
  CheckCircle2,
  Zap,
  Users,
  Award,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AboutPageProps {
  achievements?: Array<{ label: string; value: string }>;
}

const defaultAchievements = [
  { label: "Companies Supported", value: "300+" },
  { label: "Projects Finalized", value: "800+" },
  { label: "Happy Customers", value: "99%" },
  { label: "Recognized Awards", value: "10+" },
];

export default function AboutPage({
  achievements = defaultAchievements,
}: AboutPageProps) {
  const { settings, loading } = useCompanySettings();
  return (
    <div className="flex flex-col min-h-screen bg-base-50 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary-100/30 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-violet-100/30 rounded-full blur-[120px] mix-blend-multiply animate-blob [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      </div>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-20 pb-20 lg:pt-30 lg:pb-32 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-primary-200/50 backdrop-blur-sm shadow-sm">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-900 tracking-wide uppercase">
                  Our Story
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-primary-950 leading-[1.1]">
                Crafting Excellence <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-violet-600">
                  In Every Detail.
                </span>
              </h1>

              <p className="text-xl text-base-600 leading-relaxed max-w-lg">
                {loading
                  ? "Loading..."
                  : settings?.companyName || "PrintEmporium"}{" "}
                combines artisanal craftsmanship with cutting-edge technology to
                deliver printing solutions that define premium quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/services">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-primary-900 hover:bg-primary-800 text-white shadow-xl shadow-primary-900/10 text-lg"
                  >
                    Explore Our Work
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 px-8 rounded-2xl text-primary-900 hover:bg-primary-50 text-lg"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-4/3 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary-900/10">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80"
                  alt="Premium Printing Process"
                  fill
                  className="object-cover"
                  preload={true}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Floating Glass Card */}
                <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 rounded-xl bg-primary-600 text-white">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 text-lg">
                        Precision Engineered
                      </h3>
                      <p className="text-primary-900/70 text-sm mt-1">
                        Every pixel perfect, every color exact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-linear-to-br from-primary-300 to-violet-300 rounded-full blur-3xl opacity-40 -z-10" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-linear-to-br from-indigo-300 to-primary-300 rounded-full blur-3xl opacity-40 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS SECTION ---------------- */}
      <section className="py-20 bg-primary-900 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-primary-200 mb-2 font-mono tracking-tighter">
                  {item.value}
                </div>
                <div className="text-primary-200/80 font-medium uppercase tracking-wider text-sm">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- MISSION/VALUES GRID ---------------- */}
      <section className="py-24 bg-indigo-50/30 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-950 mb-6">
              Driven by Values
            </h2>
            <p className="text-xl text-base-600">
              The core principles that guide every print, every project, and
              every partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Our Mission",
                text: "To empower businesses with print materials that leave a lasting impression, combining speed alongside uncompromising quality.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                text: "To revolutionize the printing industry by integrating sustainable practices with next-generation digital technology.",
              },
              {
                icon: Heart,
                title: "Core Values",
                text: "We believe in transparency, innovation, and an obsessive attention to detail in everything we create.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-[2rem] bg-white border border-base-200 shadow-xl shadow-base-200/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <card.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-950 mb-4">
                    {card.title}
                  </h3>
                  <p className="text-base-600 leading-relaxed">{card.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- OUR JOURNEY SECTION ---------------- */}
      <OurJourneySection />

      {/* ---------------- TEAM SECTION (COMMENTED OUT) ---------------- */}
      {/* <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-950 skew-y-3 origin-top-left transform scale-110" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                The Curators of Quality
              </h2>
              <p className="text-xl text-primary-200/80">
                Meet the passionate experts behind your perfect prints.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-primary-700 text-primary-700 hover:bg-primary-800 hover:text-white h-12 rounded-xl"
            >
              Join Our Team
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white/80 text-sm font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {member.role}
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {member.name}
                    </h3>
                  </div>
                </div>
                <p className="text-primary-200/80 leading-relaxed pl-2 border-l-2 border-primary-700">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ---------------- FEATURES GRID ---------------- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-950">
              Why Industry Leaders Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Quality Guaranteed",
                desc: "Rigorous 50-point quality check on every single order.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Same-day production available for urgent deadlines.",
              },
              {
                icon: Users,
                title: "Expert Support",
                desc: "Direct access to dedicated print specialists.",
              },
              {
                icon: Award,
                title: "Award Winning",
                desc: "Recognized excellence in specialized print techniques.",
              },
              {
                icon: Target,
                title: "Custom Solutions",
                desc: "Bespoke packaging and branding tailored to you.",
              },
              {
                icon: Heart,
                title: "Sustainability",
                desc: "FSC-certified papers and eco-friendly soy inks.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-base-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-base-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        primaryButtonText="Get a Custom Quote"
        primaryButtonHref="/contact"
        secondaryButtonHref="/services"
      />
    </div>
  );
}
