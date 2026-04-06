"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Clock, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { useCompanySettings } from "@/hooks/use-company-settings";

export default function ContactHero() {
  const { settings, loading } = useCompanySettings();

  const contactMethods = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      detail: settings?.companyEmail || "hello@printemporium.com",
      subDetail: "Response within 24 hours",
      href: `mailto:${settings?.companyEmail || "hello@printemporium.com"}`,
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Call",
      detail: settings?.companyPhone || "+91 94431 12345",
      subDetail: settings?.workingHours || "Mon - Sat, 9:00 AM - 8:00 PM",
      href: `tel:${settings?.companyPhone?.replace(/\s/g, "") || "+919443112345"}`,
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "WhatsApp",
      detail: settings?.whatsappNumber || "+91 94431 12345",
      subDetail: "Direct chat for quick queries",
      href: `https://wa.me/${settings?.whatsappNumber?.replace(/[^\d]/g, "") || "919443112345"}`,
    },
  ];

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="relative bg-white border-b border-slate-200 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Column: Content */}
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
                  Contact Us
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-4 sm:mb-6 tracking-tight">
                  Get in touch <br /> with our experts.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
                  Have a question about our printing services or need a custom quote? 
                  Our team is here to provide you with the professional assistance you need.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Main Office</h3>
                  <p className="text-slate-600 text-xs sm:text-sm break-words">{settings?.companyAddress || "Trichy - Tanjore Main Road, Thuvakudi, Trichy, Tamil Nadu 620015"}</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Contact Cards */}
            <div className="grid gap-3 sm:gap-4">
              {contactMethods.map((method, i) => (
                <motion.a
                  key={i}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300 shrink-0">
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{method.title}</h3>
                    <p className="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors break-words">{method.detail}</p>
                    <p className="text-xs text-slate-500 mt-1">{method.subDetail}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-colors shrink-0 hidden sm:block" />
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mt-2 sm:mt-4 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium border border-emerald-100"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="break-words">Available Support: {settings?.workingHours || "Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 6:00 PM"}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
