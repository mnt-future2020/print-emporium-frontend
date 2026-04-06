"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Clock,
  Printer,
  DollarSign,
  Users,
  FileText,
  Truck,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: "Fast Turnaround Time",
    description:
      "Get your prints delivered quickly without compromising on quality. We understand deadlines matter.",
    icon: <Clock className="size-6" />,
  },
  {
    title: "High-Quality Printing",
    description:
      "State-of-the-art printing technology ensures vibrant colors and sharp details on every project.",
    icon: <Printer className="size-6" />,
  },
  {
    title: "Affordable Pricing",
    description:
      "Competitive rates that fit your budget. Quality printing doesn&apos;t have to break the bank.",
    icon: <DollarSign className="size-6" />,
  },
  {
    title: "Professional Service",
    description:
      "Our experienced team provides expert guidance and support throughout your printing journey.",
    icon: <Users className="size-6" />,
  },
  {
    title: "Wide Format Options",
    description:
      "From business cards to large banners, we handle all sizes and formats with precision.",
    icon: <FileText className="size-6" />,
  },
  {
    title: "Delivery Service",
    description:
      "Convenient delivery options to get your prints right to your doorstep, on time, every time.",
    icon: <Truck className="size-6" />,
  },
];

const FeatureCard = ({
  title,
  description,
  icon,
  index,
}: Feature & { index: number }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 3) && "lg:border-l border-border",
        index < 3 && "lg:border-b border-border"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

export default function FeaturesSection() {
  return (
    <section className="bg-indigo-50/30 py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Why Choose Our{" "}
            <span className="text-primary">Printing Services</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We deliver exceptional printing solutions tailored to your needs
            with unmatched quality and service.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
