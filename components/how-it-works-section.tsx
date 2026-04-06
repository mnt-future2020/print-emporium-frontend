"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Settings2,
  CreditCard,
  Truck,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Upload Your File",
    description:
      "Simply upload your document, image, or design file in any format.",
    icon: <Upload className="w-8 h-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
  },
  {
    number: "02",
    title: "Choose Options",
    description:
      "Select paper size, type, color mode, binding, and number of copies.",
    icon: <Settings2 className="w-8 h-8" />,
    color: "text-green-600",
    bgColor: "bg-green-500",
  },
  {
    number: "03",
    title: "Pay Securely",
    description:
      "Quick checkout with multiple payment options including UPI & cards.",
    icon: <CreditCard className="w-8 h-8" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500",
  },
  {
    number: "04",
    title: "Get Delivered",
    description:
      "Receive your prints at your doorstep or pick up from our store.",
    icon: <Truck className="w-8 h-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-500",
  },
];

const StepCard = ({ step, index }: { step: Step; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Connecting Line - Hidden on mobile, shown on desktop */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-20 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border z-0">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-primary/50 origin-left"
          />
        </div>
      )}

      {/* Card */}
      <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 z-10">
        {/* Number Badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
          {step.number}
        </div>

        {/* Icon Container */}
        <div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110",
            step.bgColor,
            "text-white shadow-lg",
          )}
        >
          {step.icon}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
          {step.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {/* Hover Arrow */}
        <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm font-semibold">Learn more</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>

        {/* Corner Accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-full transform scale-0 group-hover:scale-100 transition-transform duration-500" />
      </div>
    </motion.div>
  );
};

export default function HowItWorksSection() {
  return (
    <section className="w-full py-20 px-4 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold backdrop-blur-sm border border-primary/20">
            <Zap className="w-4 h-4" />
            HOW IT WORKS
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            4 Simple Steps to Perfect Prints
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Getting your prints has never been easier. Just follow these simple
            steps.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Ready to get started with your printing project?
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Browse Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
