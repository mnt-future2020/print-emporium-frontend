"use client";

import { motion } from "framer-motion";
import { Building2, Briefcase, Globe, Truck, Users, Leaf, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyMilestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const milestones: JourneyMilestone[] = [
  {
    year: "2014",
    title: "Founded in T. Nagar, Chennai",
    description: "Started our journey with a vision to provide quality printing services to the local community.",
    icon: <Building2 className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    year: "2016",
    title: "Expanded to corporate printing services",
    description: "Began serving businesses with professional printing solutions and bulk orders.",
    icon: <Briefcase className="w-5 h-5" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    year: "2018",
    title: "Launched online ordering platform",
    description: "Made printing accessible 24/7 with our easy-to-use online ordering system.",
    icon: <Globe className="w-5 h-5" />,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    year: "2020",
    title: "Introduced home delivery across Chennai",
    description: "Brought convenience to customers' doorsteps with reliable delivery services.",
    icon: <Truck className="w-5 h-5" />,
    color: "from-green-500 to-green-600",
  },
  {
    year: "2022",
    title: "Crossed 50,000 happy customers",
    description: "Reached a major milestone serving thousands of satisfied customers across Chennai.",
    icon: <Users className="w-5 h-5" />,
    color: "from-orange-500 to-orange-600",
  },
  {
    year: "2024",
    title: "Launched eco-friendly printing options",
    description: "Committed to sustainability with recycled paper and eco-friendly ink options.",
    icon: <Leaf className="w-5 h-5" />,
    color: "from-emerald-500 to-emerald-600",
  },
];

const MilestoneCard = ({ milestone, index }: { milestone: JourneyMilestone; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative flex items-center gap-8",
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      )}
    >
      {/* Content Card */}
      <div className={cn(
        "flex-1",
        isEven ? "md:text-right" : "md:text-left"
      )}>
        <div className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
          {/* Year Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-white font-bold text-lg shadow-lg",
            `bg-gradient-to-r ${milestone.color}`
          )}>
            {milestone.year}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {milestone.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {milestone.description}
          </p>

          {/* Corner Accent */}
          <div className={cn(
            "absolute bottom-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
            `bg-gradient-to-r ${milestone.color}`,
            isEven ? "right-0" : "left-0"
          )} />
        </div>
      </div>

      {/* Timeline Node */}
      <div className="relative flex-shrink-0 z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg",
            `bg-gradient-to-br ${milestone.color}`
          )}
        >
          {milestone.icon}
        </motion.div>
      </div>

      {/* Spacer for opposite side */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
};

export default function OurJourneySection() {
  return (
    <section className="w-full py-20 px-4 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold backdrop-blur-sm border border-primary/20">
            <TrendingUp className="w-4 h-4" />
            OUR JOURNEY
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            A Decade of Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From a small print shop to Chennai&apos;s trusted printing partner. Here&apos;s our story of growth, innovation, and commitment to quality.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-b from-primary via-primary to-accent origin-top"
            />
          </div>

          {/* Milestones */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={milestone.year} milestone={milestone} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4 text-lg">
            Join us in our journey towards excellence
          </p>
          <a
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Explore Our Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}
