"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Upload, MessageSquare, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function ServicesHero() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* Primary Heading */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
              >
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  Premium Quality
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter"
              >
                Fast, Reliable & <br />
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">
                  Professional
                </span>{" "}
                Printing
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium"
              >
                From business essentials to high-end marketing materials, we
                bring your vision to life with surgical precision and doorstep
                delivery.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="h-16 px-10 text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <a href="#services">
                  <Upload className="w-5 h-5 mr-3" />
                  Order Now
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg font-bold rounded-2xl border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link href="/contact">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Get a Quote
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-wrap gap-10 pt-4"
            >
              <div className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Fast Turnaround
                  </div>
                  <div className="text-xs text-slate-500 font-bold">
                    24h Express Option
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Quality Assured
                  </div>
                  <div className="text-xs text-slate-500 font-bold">
                    Military-Grade Accuracy
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual Element - Glass How It Works Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full max-w-xl">
              {/* Glassmorphic Background Card */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/50 -rotate-2" />

              {/* Main Content Card */}
              <motion.div className="relative bg-white/80 backdrop-blur-md rounded-[3rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-14">
                <div className="mb-12">
                  <Badge className="bg-primary/10 text-primary-700 border-primary/20 mb-4 px-4 py-1.5 uppercase font-black tracking-[0.2em] text-[10px]">
                    Workflow Cycle
                  </Badge>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                    How It <span className="text-primary italic">Operates</span>
                  </h3>
                </div>

                {/* Steps List */}
                <div className="space-y-10">
                  {[
                    {
                      icon: <Upload />,
                      title: "Upload Document",
                      desc: "Drag & drop your documents or browse. Secure cloud processing.",
                    },
                    {
                      icon: <CheckCircle2 />,
                      title: "Configure Print",
                      desc: "Select paper, color, binding, and delivery preferences.",
                    },
                    {
                      icon: <Shield />,
                      title: "Secure Checkout",
                      desc: "Review details and complete payment via encrypted gateways.",
                    },
                    {
                      icon: <Zap />,
                      title: "Precision Delivery",
                      desc: "Professional quality check and fast doorstep delivery.",
                    },
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex gap-6 group"
                    >
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                          <span className="w-6 h-6 flex items-center justify-center">
                            {step.icon}
                          </span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[10px] font-black text-slate-900">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}
