import { notFound } from "next/navigation";

import { getAllServices, Service } from "@/lib/service-api";
import { constructMetadata } from "@/lib/metadata-utils";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  Printer,
  Maximize2,
  FileText,
  IndianRupee,
  Upload,
  MessageCircle,
  Star,
  Zap,
  Shield,
} from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const resolvedParams = await params;

  try {
    const res = await getAllServices("active,coming-soon");
    if (res.success && res.data) {
      const service = res.data.find(
        (s: Service) => s._id === resolvedParams.slug,
      );
      if (service) {
        const isComingSoon = service.status === "coming-soon";
        return {
          title: `${service.name} — Print Emporium`,
          description:
            service.description ||
            (isComingSoon
              ? `${service.name} is coming soon to Print Emporium. A world-class printing experience, crafted with excellence.`
              : `Professional ${service.name} printing services. Upload and print now.`),
          openGraph: {
            title: `${service.name} — Print Emporium`,
            description:
              service.description ||
              `Professional ${service.name} printing services.`,
          },
        };
      }
    }
  } catch (error) {
    console.error("Failed to generate metadata:", error);
  }

  return constructMetadata("services");
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const resolvedParams = await params;
  let service: Service | null = null;
  let allServices: Service[] = [];

  try {
    const res = await getAllServices("active,coming-soon");
    if (res.success && res.data) {
      allServices = res.data;
      service =
        res.data.find((s: Service) => s._id === resolvedParams.slug) || null;
    }
  } catch (error) {
    console.error("[ServiceDetail] Failed to fetch service:", error);
  }

  if (!service) {
    notFound();
  }

  const isComingSoon = service.status === "coming-soon";

  const ranges = service.basePriceRanges || [];
  const displayPrice =
    ranges.length > 0
      ? Math.min(...ranges.map((r) => r.price))
      : service.basePricePerPage;
  const isQuote =
    service.customQuotation && !displayPrice && ranges.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">

        {/* Back Navigation */}
        <div className="mb-16">
          <Link
            href="/services"
            className="group inline-flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Back to Services
          </Link>
        </div>

        {/* Hero Section — Editorial Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">

          {/* Left / Top: Typography & CTA */}
          <div className="order-2 lg:order-1 space-y-10">
            <div>
              {/* Status badge */}
              {isComingSoon ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-widest mb-8">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  Coming Soon
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest mb-8">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Available Now
                </div>
              )}

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-foreground mb-6 text-balance">
                {service.name}
              </h1>

              {/* Premium coming-soon tagline */}
              {isComingSoon && (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg text-pretty font-medium">
                  We&apos;re building{" "}
                  <span className="text-foreground">{service.name}</span> with
                  uncompromising excellence. Something exceptional is on its
                  way.
                </p>
              )}

              {/* Description */}
              {service.description && (
                <p
                  className={`text-base text-muted-foreground leading-relaxed max-w-lg text-pretty ${isComingSoon ? "mt-4 text-muted-foreground/80" : "text-lg md:text-xl font-medium"}`}
                >
                  {service.description}
                </p>
              )}
            </div>

            {/* Price (hidden for coming-soon) */}
            {!isComingSoon && (
              <div className="flex items-center gap-3">
                {isQuote ? (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-muted border border-border">
                    <span className="font-semibold text-base text-primary uppercase tracking-wide">
                      Custom Quote
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border shadow-sm">
                    {ranges.length > 0 && (
                      <span className="text-xs text-muted-foreground font-light">From</span>
                    )}
                    <IndianRupee className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-black text-3xl text-foreground tabular-nums">
                      {displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground font-light">/page</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {isComingSoon ? (
                <>
                  <span
                    role="status"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-muted text-muted-foreground font-bold cursor-not-allowed select-none border border-border"
                  >
                    <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                    Available Soon
                  </span>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-border text-foreground font-bold hover:bg-muted transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Browse Other Services
                  </Link>
                </>
              ) : service.customQuotation ? (
                <>
                  <Link
                    href={`/contact?subject=Inquiry for ${encodeURIComponent(service.name)}`}
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-300 shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Request a Quote
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-border text-foreground font-bold hover:bg-muted transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Browse Services
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/order/${service._id}`}
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-300 shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                    Upload &amp; Print Now
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-border text-foreground font-bold hover:bg-muted transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Browse Services
                  </Link>
                </>
              )}
            </div>

            {/* Coming-soon notice */}
            {isComingSoon && (
              <div className="flex items-center gap-3 text-muted-foreground border-l-2 border-amber-500/40 pl-4 py-1">
                <Shield className="w-5 h-5 text-amber-500/60" aria-hidden="true" />
                <span className="text-sm font-medium">
                  This service is currently under preparation.
                </span>
              </div>
            )}
          </div>

          {/* Right / Bottom: Portrait Image */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-muted shadow-2xl shadow-black/5 border border-border/50">
              {service.image ? (
                <Image
                  src={typeof service.image === "string" ? service.image : ""}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Layers className="h-24 w-24 text-muted-foreground/20" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Service Capabilities */}
        {!service.customQuotation &&
          ((service.printTypes?.length || 0) > 0 ||
            (service.paperSizes?.length || 0) > 0 ||
            (service.paperTypes?.length || 0) > 0 ||
            (service.bindingOptions?.length || 0) > 0) && (
          <section className="mb-32">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
                {isComingSoon ? "Planned Features" : "Service Features"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 text-balance">
                {isComingSoon
                  ? "What to Expect"
                  : "Comprehensive Printing Options"}
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed text-pretty">
                {isComingSoon
                  ? "This service will offer a complete range of professional printing options."
                  : "Choose from our extensive range of printing configurations."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.printTypes && service.printTypes.length > 0 && (
                <CapabilityCard icon={Printer} title="Print Options">
                  {service.printTypes.map((type) => {
                    const isPerCopy = (type.pricePerCopy || 0) > 0 && (type.pricePerPage || 0) === 0;
                    const price = isPerCopy ? type.pricePerCopy : type.pricePerPage;
                    return (
                      <CapabilityRow
                        key={type.value}
                        label={type.value.replace(/-/g, " ")}
                        price={price > 0 ? `+₹${price}/${isPerCopy ? "copy" : "page"}` : undefined}
                      />
                    );
                  })}
                </CapabilityCard>
              )}

              {service.paperSizes && service.paperSizes.length > 0 && (
                <CapabilityCard icon={Maximize2} title="Paper Sizes">
                  {service.paperSizes.map((size) => {
                    const isPerCopy = (size.pricePerCopy || 0) > 0 && (size.pricePerPage || 0) === 0;
                    const price = isPerCopy ? size.pricePerCopy : size.pricePerPage;
                    return (
                      <CapabilityRow
                        key={size.value}
                        label={size.value}
                        uppercase
                        price={price > 0 ? `+₹${price}/${isPerCopy ? "copy" : "page"}` : undefined}
                      />
                    );
                  })}
                </CapabilityCard>
              )}

              {service.paperTypes && service.paperTypes.length > 0 && (
                <CapabilityCard icon={FileText} title="Paper Types">
                  {service.paperTypes.map((type) => (
                    <CapabilityRow key={type.value} label={type.value.replace(/-/g, " ")} />
                  ))}
                </CapabilityCard>
              )}

              {service.bindingOptions && service.bindingOptions.length > 0 && (
                <CapabilityCard icon={Layers} title="Binding Options">
                  {service.bindingOptions.map((option) => (
                    <CapabilityRow key={option.value} label={option.value.replace(/-/g, " ")} />
                  ))}
                </CapabilityCard>
              )}
            </div>
          </section>
        )}

        {/* Custom Quotation Highlights */}
        {service.customQuotation && (
          <section className="mb-32">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
                Service Highlights
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Tailored to Your Needs
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed text-pretty">
                Get personalized printing solutions with expert consultation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: "Custom Design Consultation",
                  description: "Work directly with our design experts to bring your vision to life.",
                },
                {
                  title: "Specialized Printing Solutions",
                  description: "Access to advanced printing techniques and premium materials.",
                },
                {
                  title: "Bulk Order Discounts",
                  description: "Competitive pricing for large volume orders.",
                },
                {
                  title: "Priority Expert Support",
                  description: "Dedicated support team for your custom projects.",
                },
              ].map((highlight) => (
                <div
                  key={highlight.title}
                  className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{highlight.title}</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Value Pillars — "why choose us" reinforces trust after the concrete service details */}
        <section className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Built for Excellence
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed text-pretty">
              Every order is crafted to the highest standards of quality and precision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Star,
                title: "Premium Quality",
                description: "Industry-leading materials and printing technology for flawless results.",
              },
              {
                icon: Zap,
                title: "Fast Turnaround",
                description: "Optimized workflows designed to deliver quickly without losing precision.",
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                description: "100% satisfaction guarantee on every single printed page.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5 transition-colors group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
              Explore More
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Related Services
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices
              .filter((s: Service) => s._id !== service._id)
              .slice(0, 3)
              .map((rel: Service, idx: number) => (
                <Link
                  key={rel._id}
                  href={`/services/${rel._id}`}
                  className="group"
                  style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: "both" }}
                >
                  <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    {/* Image */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted">
                      {rel.image ? (
                        <Image
                          src={typeof rel.image === "string" ? rel.image : ""}
                          alt={rel.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <Layers className="h-16 w-16 text-muted-foreground/20" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {rel.name}
                      </h3>
                      {rel.description && (
                        <p className="text-sm text-muted-foreground font-light line-clamp-2">
                          {rel.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Closing CTA — final conversion ask, ends the page */}
        <section className="mb-32 rounded-3xl border border-border/50 bg-linear-to-r from-primary-950 to-primary-900 text-white p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.08),transparent_50%)]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              {isComingSoon ? "Stay Tuned for the Launch" : "Ready to Get Started?"}
            </h2>
            <p className="text-lg text-white/70 font-light leading-relaxed text-pretty">
              {isComingSoon
                ? "This service is currently under preparation. Explore our other professional printing services in the meantime."
                : service.customQuotation
                  ? "Contact us today for a personalized quote tailored to your project."
                  : "Upload your files and place your order in minutes."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              {isComingSoon ? (
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-primary-950 font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  Browse All Services
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              ) : service.customQuotation ? (
                <Link
                  href={`/contact?subject=Inquiry for ${encodeURIComponent(service.name)}`}
                  className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-primary-950 font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Request Quote
                </Link>
              ) : (
                <Link
                  href={`/order/${service._id}`}
                  className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-primary-950 font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Upload &amp; Print Now
                </Link>
              )}
              {!isComingSoon && (
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  View All Services
                </Link>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─────────── Subcomponents ───────────

function CapabilityCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-[#e5edf5] dark:border-border bg-white dark:bg-card p-7 space-y-5"
      style={{
        boxShadow:
          "rgba(50,50,93,0.06) 0px 10px 30px 0px, rgba(0,0,0,0.03) 0px 4px 12px 0px",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden={true} />
        </div>
        <h3 className="text-lg font-normal tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CapabilityRow({
  label,
  price,
  uppercase,
}: {
  label: string;
  price?: string;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/40 border border-[#e5edf5] dark:border-border">
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2
          className="h-4 w-4 text-primary/60 shrink-0"
          aria-hidden="true"
        />
        <span
          className={`text-sm font-normal text-foreground truncate ${uppercase ? "uppercase" : "capitalize"}`}
        >
          {label}
        </span>
      </div>
      {price && (
        <span className="text-xs font-medium text-primary tabular-nums shrink-0">
          {price}
        </span>
      )}
    </div>
  );
}
