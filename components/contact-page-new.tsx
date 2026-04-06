"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import {
  MapPin,
  Send,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { createLead } from "@/lib/lead-api";
import { toast } from "sonner";
import ContactHero from "@/components/contact-hero";
import CTASection from "@/components/cta-section";

interface FAQ {
  question: string;
  answer: string;
}

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group"
    >
      <div className="relative border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-primary/30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left p-4 sm:p-6 flex items-center justify-between"
        >
          <span className="font-bold text-slate-900 text-sm sm:text-base md:text-lg group-hover:text-primary transition-colors">
            {faq.question}
          </span>
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ml-3 sm:ml-4 text-primary transition-all duration-300",
              isOpen ? "bg-primary text-white rotate-180" : "",
            )}
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed border-t border-slate-200 pt-4 sm:pt-6">
                {faq.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

function ContactPageContent() {
  const { settings, loading } = useCompanySettings();
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: subjectParam || "",
    message: "",
  });

  React.useEffect(() => {
    if (subjectParam) {
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [subjectParam]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const faqs: FAQ[] = [
    {
      question: "What is your typical turnaround for bulk orders?",
      answer:
        "Bulk orders are our specialty. Typically, orders of 500+ units take 5-7 business days, though we offer 'Flash Service' for 48-hour delivery on select materials.",
    },
    {
      question: "Can I request a physical sample before printing?",
      answer:
        "Absolutely! We recommend physical proofs for large-scale projects. Sample kits are available starting at ₹499, which is fully refundable upon order confirmation.",
    },
    {
      question: "Do you provide design assistance for blueprints?",
      answer:
        "Yes, we have specialized CAD-prep experts who ensure your blueprints and technical drawings are perfectly scaled and legible before they ever touch the printer.",
    },
    {
      question: "What sustainable printing options do you have?",
      answer:
        "We offer 100% recycled paper stocks, soy-based inks, and plastic-free packaging options for brands committed to carbon neutrality.",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Validation failed. Check your inputs.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createLead(formData);
      if (response.success) {
        setIsSubmitted(true);
        toast.success("Lead captured successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(response.message || "Failed to submit lead.");
      }
    } catch (error: any) {
      console.error("Lead submission error:", error);
      toast.error(error.response?.data?.message || "Internal server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FeatureCard = ({
    icon,
    title,
    desc,
    className,
  }: {
    icon: any;
    title: string;
    desc: string;
    className?: string;
  }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 transition-all duration-300 hover:border-primary/40 hover:bg-white hover:shadow-lg",
        className || "",
      )}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4 sm:mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
        {title}
      </h4>
      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background Ambience Removed for Simple & Professional Theme */}

      <ContactHero />

      {/* Main Split Content Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 sm:mb-6 leading-tight">
                Send us a{" "}
                <span className="text-primary italic">direct message</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
                Fill out the form below and our team will get back to you with a
                custom solution within 2 business hours.
              </p>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm relative overflow-hidden">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center fill-mode-forwards"
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 sm:mb-8 md:mb-10 relative">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/30 rounded-full"
                    />
                    <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary relative z-10" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                    Submission Sent!
                  </h3>
                  <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-sm mb-8 sm:mb-10 md:mb-12">
                    Our lead management system has assigned your inquiry. We'll
                    reach out to{" "}
                    <span className="text-primary font-bold break-all">
                      {formData.email}
                    </span>{" "}
                    shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="px-6 sm:px-10 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-300 text-slate-900 hover:bg-slate-900 hover:text-white transition-all bg-transparent"
                    onClick={() => setIsSubmitted(false)}
                  >
                    New Inquiry
                  </Button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-8 md:space-y-10 relative z-10"
                >
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-slate-700">
                        Full Name
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(
                          "h-12 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all",
                          errors.name ? "border-red-500/50 bg-red-50" : "",
                        )}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-xs font-bold">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-slate-700">
                        Email Address
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={cn(
                          "h-12 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all",
                          errors.email ? "border-red-500/50 bg-red-50" : "",
                        )}
                        placeholder="you@company.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-xs font-bold">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-slate-700">
                        Project Subject
                      </label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={cn(
                          "h-12 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all",
                          errors.subject ? "border-red-500/50 bg-red-50" : "",
                        )}
                        placeholder="Business cards, banners, etc"
                      />
                      {errors.subject && (
                        <p className="text-red-600 text-xs font-bold">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-slate-700">
                        Phone Number (Optional)
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-12 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="+91 9876 543 210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-700">
                      Project Details
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={cn(
                        "min-h-[140px] sm:min-h-[160px] md:min-h-[180px] rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none p-3 sm:p-4",
                        errors.message ? "border-red-500/50 bg-red-50" : "",
                      )}
                      placeholder="Describe your printing project, materials, quantities, and timeline..."
                    />
                    {errors.message && (
                      <p className="text-red-600 text-xs font-bold">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    disabled={isSubmitting}
                    className="w-full h-12 sm:h-14 md:h-16 rounded-lg sm:rounded-xl lg:rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base sm:text-lg shadow-xl shadow-primary/10 group transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </Button>
                  <p className="text-center text-slate-500 text-xs font-medium flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary/60" />
                    Secure and private submission
                  </p>
                </form>
              )}
            </div>
          </motion.div>

          {/* Info Side - Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 sm:gap-8 lg:gap-10 justify-center h-full"
          >
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight">
                Trusted standard of <br />
                <span className="text-primary">Excellence.</span>
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Join a community of thousands who rely on our expertise for
                their most critical printing needs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Quick Turnaround"
                desc="48-72 hour delivery on most projects with premium rush options available."
              />
              <FeatureCard
                icon={<Globe className="w-5 h-5" />}
                title="Pan-India Shipping"
                desc="Reliable nationwide delivery with real-time tracking and secure packaging."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Quality Guarantee"
                desc="100% satisfaction promise with rigorous quality control and certification."
              />
              <FeatureCard
                icon={<Headphones className="w-5 h-5" />}
                title="Expert Support"
                desc="Dedicated account managers available for consultation and design guidance."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lengthy and Big Map Section */}
      <section className="relative z-10 w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl sm:rounded-2xl lg:rounded-[3rem] overflow-hidden border border-slate-200 group relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] shadow-sm hover:shadow-xl transition-all duration-700">
            <iframe
              src={
                settings?.googleMapEmbed ||
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.002446777647!2d80.2079089759247!3d13.098971987228222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526430b0555555%3A0x6b80585d8847050!2sAnna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1710925761000!5m2!1sen!2sin"
              }
              className="w-full h-full grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 border-none"
              allowFullScreen
              loading="lazy"
              title="Office Location"
            />
            <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 md:top-8 md:left-8 md:right-8 flex justify-center lg:justify-start">
              <div className="p-3 sm:p-5 md:p-8 rounded-lg sm:rounded-xl lg:rounded-[2rem] bg-white/95 backdrop-blur-xl border border-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 md:gap-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000 delay-500 max-w-2xl w-full md:w-auto">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                    <MapPin className="w-6 sm:w-7 h-6 sm:h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1">
                      {settings?.companyName || "The Print Emporium"}{" "}
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-[200px] sm:max-w-[280px]">
                      {settings?.companyAddress || "Chennai, India"}
                    </p>
                  </div>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden md:block" />
                <Button
                  size="lg"
                  variant="default"
                  className="rounded-lg sm:rounded-xl h-12 sm:h-14 px-4 sm:px-8 bg-primary hover:bg-primary/90 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-primary/20 whitespace-nowrap"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      settings?.companyAddress || "",
                    )}`}
                    target="_blank"
                  >
                    Directions
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10 border-t border-slate-200"
      >
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 sm:mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our high-tech printing workflows
            and delivery schedules.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      </motion.section>

      <CTASection
        title="Ready to Elevate Your Global Brand Presence?"
        description={`Join our ecosystem of 2,800+ businesses who leverage ${
          settings?.companyName || "PrintEmporium"
        } for high-authority physical collateral.`}
        primaryButtonText="About Us"
        primaryButtonHref="/about"
        secondaryButtonText="Explore Dynamic Services"
        secondaryButtonHref="/services"
      />
    </div>
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
