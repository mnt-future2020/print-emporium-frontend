"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGroup } from "@/components/ui/animated-group";
import Image from "next/image";
import { useCompanySettings } from "@/hooks/use-company-settings";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function AboutHero() {
  const { settings, loading } = useCompanySettings();
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      <div className="relative pt-24 md:pt-36">
        <motion.div
          className="absolute inset-0 -z-20 w-full h-full opacity-20"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop&crop=entropy&auto=format&q=80)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            y,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 -z-10 size-full bg-linear-to-b from-transparent via-background/50 to-background"
        />

        <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-6">
          <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <AnimatedGroup variants={transitionVariants}>
              <Badge variant="secondary" className="mb-4">
                About{" "}
                {loading
                  ? "Loading..."
                  : settings?.companyName || "PrintEmporium"}
              </Badge>

              <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold bg-linear-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Crafting Excellence in Printing
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                For over a decade, we&apos;ve been at the forefront of printing
                innovation, delivering exceptional quality and service to
                businesses worldwide.
              </p>
            </AnimatedGroup>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
            >
              <div
                key={1}
                className="bg-primary/10 rounded-[14px] border border-primary/20 p-0.5"
              >
                <Button asChild size="lg" className="rounded-xl px-5 text-base">
                  <Link href="#story">
                    <span className="text-nowrap">Our Story</span>
                  </Link>
                </Button>
              </div>
              <Button
                key={2}
                asChild
                size="lg"
                variant="ghost"
                className="h-10.5 rounded-xl px-5"
              >
                <Link href="#contact">
                  <span className="text-nowrap">Get in Touch</span>
                </Link>
              </Button>
            </AnimatedGroup>
          </div>
        </motion.div>

        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
            <div
              aria-hidden
              className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
            />
            <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
              <Image
                className="bg-background aspect-video relative rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2700&h=1440&fit=crop&crop=entropy&auto=format&q=80"
                alt="printing team collaboration"
                width="2700"
                height="1440"
                preload={true}
                loading="eager"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
