import CTASection from "@/components/cta-section";
import ServicesHero from "@/components/services-hero";
import { constructMetadata } from "@/lib/metadata-utils";
import { getAllServices, Service } from "@/lib/service-api";
import {
  IndianRupee,
  Layers,
  CheckCircle2,
  Printer,
  Maximize2,
  FileText,
  Upload,
  MessageCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await constructMetadata("services");
}

export default async function ServicesPage() {
  let services: Service[] = [];
  let hasError = false;

  try {
    const res = await getAllServices("active,coming-soon");
    if (res.success && res.data) {
      services = res.data;
    } else {
      hasError = true;
    }
  } catch (error) {
    console.error("Failed to fetch services for public page:", error);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <ServicesHero />

      {/* Services Section Header */}
      <div id="services" className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/20 text-primary px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]"
            >
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Choose Your Perfect Print Solution
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Browse our comprehensive range of printing services tailored to
              meet your specific needs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {services.length}
            </span>{" "}
            services available
          </div>
        </div>

        {hasError ? (
          <div className="py-20 text-center">
            <div className="max-w-md mx-auto">
              <Layers className="h-16 w-16 mx-auto mb-4 text-destructive/20" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Unable to Load Services
              </h3>
              <p className="text-muted-foreground mb-6">
                We&apos;re experiencing technical difficulties. Please try
                refreshing the page or contact us directly.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Layers className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Services Coming Soon
            </h3>
            <p className="text-lg">
              Our service catalog is being updated. Please check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const isComingSoon = service.status === "coming-soon";
              
              const CardContent = () => (
                <>
                  {/* Image Section with Gradient Overlay */}
                  <div className="relative aspect-4/3 overflow-hidden bg-muted">
                    {service.image ? (
                      <>
                        <Image
                          src={
                            typeof service.image === "string" ? service.image : ""
                          }
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Layers className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Coming Soon Top-Left Badge */}
                    {isComingSoon && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Coming Soon
                        </Badge>
                      </div>
                    )}

                    {/* Floating Price Badge */}
                    {!isComingSoon && (
                      <div className="absolute top-4 right-4">
                        <div className="px-4 py-2 rounded-2xl bg-background/95 backdrop-blur-xl border border-white/20 shadow-xl">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const ranges = service.basePriceRanges || [];
                              const displayPrice =
                                ranges.length > 0
                                  ? Math.min(...ranges.map((r) => r.price))
                                  : service.basePricePerPage;
                              const isQuote =
                                service.customQuotation &&
                                !displayPrice &&
                                ranges.length === 0;
                              if (isQuote) {
                                return (
                                  <span className="font-black text-sm text-primary uppercase tracking-widest px-1">
                                    Request Quote
                                  </span>
                                );
                              }
                              return (
                                <>
                                  {ranges.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground font-medium mr-0.5">
                                      From
                                    </span>
                                  )}
                                  <IndianRupee className="h-4 w-4 text-primary" />
                                  <span className="font-black text-lg text-foreground">
                                    {displayPrice}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    /page
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">
                        {service.name}
                      </h3>
                      {!service.customQuotation && !isComingSoon && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-background/20 backdrop-blur-sm text-white border-white/30 text-xs font-bold">
                            {service.printTypes?.length || 0} Print Options
                          </Badge>
                          <Badge className="bg-background/20 backdrop-blur-sm text-white border-white/30 text-xs font-bold">
                            {service.paperSizes?.length || 0} Sizes
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {service.customQuotation && !isComingSoon && (
                    /* Custom Quote Banner */
                    <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        Custom Quote Service
                      </span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col space-y-6">
                    {/* Features Grid */}
                    <div className="space-y-4 flex-1">
                      {service.customQuotation || isComingSoon ? (
                        /* Service Highlights for Custom Quotations or Coming Soon preview */
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                              Service Highlights
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "Premium Quality Guaranteed",
                              "Fast Turnaround Options",
                              "Quality Assurance Guarantee",
                              "Priority Expert Consultation",
                            ].map((highlight, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/15 transition-all hover:bg-primary/10 hover:translate-x-1"
                              >
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                  {highlight}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          {service.printTypes?.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <Printer className="h-3.5 w-3.5 text-primary" />
                                Print Options
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {service.printTypes.map((p) => {
                                  const isPerCopy =
                                    (p.pricePerCopy || 0) > 0 &&
                                    (p.pricePerPage || 0) === 0;
                                  const price = isPerCopy
                                    ? p.pricePerCopy
                                    : p.pricePerPage;
                                  return (
                                    <div
                                      key={p.value}
                                      className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold capitalize text-foreground">
                                          {p.value.replace("-", " ")}
                                        </span>
                                        <span className="text-xs text-primary font-bold">
                                          +₹{price}/{isPerCopy ? "copy" : "page"}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {service.paperSizes?.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                                Paper Sizes
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {service.paperSizes.map((p) => {
                                  const isPerCopy =
                                    (p.pricePerCopy || 0) > 0 &&
                                    (p.pricePerPage || 0) === 0;
                                  const price = isPerCopy
                                    ? p.pricePerCopy
                                    : p.pricePerPage;
                                  return (
                                    <div
                                      key={p.value}
                                      className="px-3 py-1.5 rounded-xl bg-muted border border-border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold uppercase text-foreground">
                                          {p.value}
                                        </span>
                                        {price > 0 && (
                                          <span className="text-xs text-muted-foreground font-medium">
                                            +₹{price}/
                                            {isPerCopy ? "copy" : "page"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {service.paperTypes?.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                              <span>
                                <span className="font-semibold text-foreground">
                                  {service.paperTypes.length}
                                </span>{" "}
                                paper types available
                              </span>
                            </div>
                          )}

                          {service.gsmOptions?.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                              <span>
                                <span className="font-semibold text-foreground">
                                  GSM:
                                </span>{" "}
                                {service.gsmOptions
                                  .map((g) => g.value)
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          {service.bindingOptions?.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                Binding Options
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {service.bindingOptions.map((opt) => (
                                  <Badge
                                    key={opt.value}
                                    variant="outline"
                                    className="text-xs font-semibold border-primary/20 text-primary bg-primary/5"
                                  >
                                    {opt.value.replace("-", " ")}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action Button */}
                    {isComingSoon ? (
                      <div className="w-full mt-auto pt-4">
                        <div
                          className="w-full rounded-xl h-12 text-sm font-bold bg-muted text-muted-foreground flex items-center justify-center gap-2 transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    ) : service.customQuotation ? (
                      <Link
                        href={`/contact?subject=Inquiry for ${encodeURIComponent(service.name)}`}
                        className="w-full"
                      >
                        <Button className="w-full rounded-2xl h-14 text-base font-bold bg-background border-2 border-primary text-primary hover:bg-primary hover:text-white hover:border-primary shadow-lg shadow-primary/5 transition-all group-hover:shadow-xl group-hover:shadow-primary/20">
                          <span className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            Request Quote
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/order/${service._id}`} className="w-full">
                        <Button className="w-full rounded-2xl h-14 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all group-hover:shadow-xl group-hover:shadow-primary/30">
                          <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            Upload & Print
                          </span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              );

              if (isComingSoon) {
                return (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug || service._id}`}
                    className="group relative bg-background rounded-2xl border border-border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <CardContent />
                  </Link>
                );
              }

              return (
                <div
                  key={service._id}
                  className="group relative bg-background rounded-2xl border border-border overflow-hidden transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:-translate-y-1"
                >
                  <CardContent />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CTASection
        title="Ready to Print?"
        description="Contact us today for bulk orders and specialized requirements."
        primaryButtonText="Get in Touch"
        primaryButtonHref="/contact"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/about"
        badgeText="Quick Turnaround"
      />
    </div>
  );
}
