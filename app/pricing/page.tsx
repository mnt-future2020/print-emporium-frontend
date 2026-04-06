"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Calculator,
  FileText,
  Layers,
  Copy as CopyIcon,
  Maximize2,
  ArrowRight,
  Printer,
  Minus,
  Plus,
  Info,
  AlertCircle,
  Settings2,
  Zap,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getAllServices, Service } from "@/lib/service-api";
import { motion, AnimatePresence } from "framer-motion";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
};

export default function PricingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);

  // Configuration state
  const [config, setConfig] = useState<Record<string, string>>({
    printType: "",
    paperSize: "",
    paperType: "",
    gsm: "",
    printSide: "",
    bindingOption: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getAllServices("active");
        if (response.success) {
          setServices(response.data);
          if (response.data.length > 0) {
            setSelectedServiceId(response.data[0]._id!);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const selectedService = useMemo(() => {
    return services.find((s) => s._id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Dynamic Binding Filtering
  const availableBindingOptions = useMemo(() => {
    if (!selectedService) return [];

    // 1. Get all options where minPages is satisfied by current pageCount
    const satisfiedOptions = (selectedService.bindingOptions || []).filter(
      (opt) => !opt.minPages || pageCount >= opt.minPages,
    );

    if (satisfiedOptions.length === 0) return [];

    // 2. Find the highest minPages threshold among satisfied options
    const maxSatisfiedMinPages = Math.max(
      ...satisfiedOptions.map((opt) => opt.minPages || 0),
    );

    // 3. Return only options that match this highest threshold
    return satisfiedOptions.filter(
      (opt) => (opt.minPages || 0) === maxSatisfiedMinPages,
    );
  }, [selectedService, pageCount]);

  // Reset config when service changes
  useEffect(() => {
    if (selectedService) {
      setConfig({
        printType: selectedService.printTypes?.[0]?.value || "",
        paperSize: selectedService.paperSizes?.[0]?.value || "",
        paperType: selectedService.paperTypes?.[0]?.value || "",
        gsm: selectedService.gsmOptions?.[0]?.value || "",
        printSide: selectedService.printSides?.[0]?.value || "",
        bindingOption: availableBindingOptions?.[0]?.value || "",
      });
    }
  }, [selectedService]);

  // Update binding if it becomes unavailable due to page count
  useEffect(() => {
    if (config.bindingOption) {
      const isStillAvailable = availableBindingOptions.some(
        (o) => o.value === config.bindingOption,
      );
      if (!isStillAvailable) {
        setConfig((prev) => ({
          ...prev,
          bindingOption: availableBindingOptions[0]?.value || "",
        }));
      }
    }
  }, [availableBindingOptions]);

  const calculatePrice = () => {
    if (!selectedService)
      return {
        total: 0,
        breakdown: [],
        totalForSingleCopy: 0,
        totalPricePerPage: 0,
        flatChargesPerSet: 0,
      };

    let totalPricePerPage = selectedService.basePricePerPage || 0;
    let flatChargesPerSet = 0;
    const breakdown = [];

    breakdown.push({
      label: "Base Processing Rate",
      value: selectedService.basePricePerPage || 0,
      isPerPage: true,
    });

    const categories = [
      {
        name: "printType",
        options: selectedService.printTypes,
        label: "Print Quality",
      },
      {
        name: "paperSize",
        options: selectedService.paperSizes,
        label: "Paper Dimensions",
      },
      {
        name: "paperType",
        options: selectedService.paperTypes,
        label: "Paper Finish",
      },
      {
        name: "gsm",
        options: selectedService.gsmOptions,
        label: "Paper Weight",
      },
      {
        name: "printSide",
        options: selectedService.printSides,
        label: "Print Configuration",
      },
    ];

    categories.forEach((cat) => {
      const selectedOption = cat.options?.find(
        (o) => o.value === config[cat.name],
      );
      if (selectedOption) {
        if (selectedOption.pricePerPage) {
          totalPricePerPage += selectedOption.pricePerPage;
          breakdown.push({
            label: `${cat.label} (${selectedOption.value})`,
            value: selectedOption.pricePerPage,
            isPerPage: true,
          });
        }
        if (selectedOption.pricePerCopy) {
          flatChargesPerSet += selectedOption.pricePerCopy;
          breakdown.push({
            label: `${cat.label} (${selectedOption.value}) Surcharge`,
            value: selectedOption.pricePerCopy,
            isFixed: true,
          });
        }
      }
    });

    const bindingOption = availableBindingOptions.find(
      (o) => o.value === config.bindingOption,
    );
    if (bindingOption) {
      if (bindingOption.fixedPrice) {
        flatChargesPerSet += bindingOption.fixedPrice;
        breakdown.push({
          label: `Binding (${bindingOption.value})`,
          value: bindingOption.fixedPrice,
          isFixed: true,
        });
      }
      if (bindingOption.pricePerPage) {
        totalPricePerPage += bindingOption.pricePerPage;
        breakdown.push({
          label: `Binding (${bindingOption.value}) Rate`,
          value: bindingOption.pricePerPage,
          isPerPage: true,
        });
      }
    }

    const totalForSingleCopy =
      totalPricePerPage * pageCount + flatChargesPerSet;
    const total = totalForSingleCopy * copies;

    return {
      total,
      breakdown,
      totalForSingleCopy,
      totalPricePerPage,
      flatChargesPerSet,
    };
  };

  const {
    total,
    breakdown,
    totalForSingleCopy,
    totalPricePerPage,
    flatChargesPerSet,
  } = calculatePrice();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Calculator className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-muted-foreground font-bold tracking-tight">
          Syncing Live Rates...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/10 selection:text-primary-900">
      <main className="flex-grow pt-20 pb-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10"
            >
              <Calculator className="h-3.5 w-3.5" />
              Instant Pricing
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
            >
              Simple. Transparent. Pricing.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Calculate your exact printing costs in seconds. Transparent rates
              for premium professional service.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-7 space-y-8">
              {/* Service Grid */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Star className="h-4 w-4 fill-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    1. Choose Your Service
                  </h2>
                </div>

                <div className="relative group">
                  <Select
                    value={selectedServiceId}
                    onValueChange={(val) => setSelectedServiceId(val)}
                  >
                    <SelectTrigger className="h-16 bg-white border border-border rounded-2xl hover:border-primary/30 transition-all focus:ring-1 focus:ring-primary/20 shadow-sm flex items-center gap-4 px-5">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Printer className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm text-foreground">
                            {selectedService?.name || "Select a service"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            Service Type
                          </span>
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border bg-white shadow-xl">
                      {services.map((service) => (
                        <SelectItem
                          key={service._id}
                          value={service._id!}
                          className="rounded-lg py-3 px-3 focus:bg-primary/5 focus:text-primary transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-md flex items-center justify-center",
                                selectedServiceId === service._id
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Printer className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {service.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                                {service.description ||
                                  "Highest quality professional printing."}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Dynamic Options */}
              <AnimatePresence mode="wait">
                {selectedService && (
                  <motion.section
                    key={selectedService._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Settings2 className="h-4 w-4" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">
                        2. Document Specifications
                      </h2>
                    </div>

                    <Card className="border border-border/50 bg-white shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden">
                      <CardContent className="p-8 space-y-8">
                        {/* Quantity Block */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Pages */}
                            <div className="space-y-3">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                Total Pages
                              </Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-11 w-11 rounded-lg border-border hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                                  onClick={() =>
                                    setPageCount(Math.max(1, pageCount - 1))
                                  }
                                >
                                  <Minus className="h-4 w-4 stroke-2" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={pageCount}
                                  onChange={(e) =>
                                    setPageCount(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="h-11 text-center font-bold text-lg border-transparent bg-muted/30 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/10 transition-all"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-11 w-11 rounded-lg border-border hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                                  onClick={() => setPageCount(pageCount + 1)}
                                >
                                  <Plus className="h-4 w-4 stroke-2" />
                                </Button>
                              </div>
                            </div>

                            {/* Copies */}
                            <div className="space-y-3">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                Number of Sets
                              </Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-11 w-11 rounded-lg border-border hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 transition-all"
                                  onClick={() =>
                                    setCopies(Math.max(1, copies - 1))
                                  }
                                >
                                  <Minus className="h-4 w-4 stroke-2" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={copies}
                                  onChange={(e) =>
                                    setCopies(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="h-11 text-center font-bold text-lg border-transparent bg-muted/30 rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-100 transition-all"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-11 w-11 rounded-lg border-border hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 transition-all"
                                  onClick={() => setCopies(copies + 1)}
                                >
                                  <Plus className="h-4 w-4 stroke-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="border-b border-border/40" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          {[
                            {
                              id: "printType",
                              label: "Print Type",
                              icon: <Printer className="h-3.5 w-3.5" />,
                              options: selectedService.printTypes,
                            },
                            {
                              id: "paperSize",
                              label: "Dimensions",
                              icon: <Maximize2 className="h-3.5 w-3.5" />,
                              options: selectedService.paperSizes,
                            },
                            {
                              id: "paperType",
                              label: "Paper Finish",
                              icon: <FileText className="h-3.5 w-3.5" />,
                              options: selectedService.paperTypes,
                            },
                            {
                              id: "gsm",
                              label: "Paper Weight",
                              icon: <Layers className="h-3.5 w-3.5" />,
                              options: selectedService.gsmOptions,
                            },
                            {
                              id: "printSide",
                              label: "Print Sides",
                              icon: <Maximize2 className="h-3.5 w-3.5" />,
                              options: selectedService.printSides,
                            },
                            {
                              id: "bindingOption",
                              label: "Binding",
                              icon: <CopyIcon className="h-3.5 w-3.5" />,
                              options: availableBindingOptions,
                            },
                          ].map((cat) =>
                            cat.options && cat.options.length > 0 ? (
                              <div key={cat.id} className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 px-1">
                                  {cat.icon}
                                  {cat.label}
                                </Label>
                                <Select
                                  value={config[cat.id]}
                                  onValueChange={(val) =>
                                    setConfig({ ...config, [cat.id]: val })
                                  }
                                >
                                  <SelectTrigger className="h-12 bg-muted/30 border-transparent rounded-xl hover:bg-muted/50 transition-all focus:ring-1 focus:ring-primary/10 font-medium text-foreground">
                                    <SelectValue placeholder="Select one..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-border bg-white shadow-lg p-1">
                                    {cat.options.map((opt) => (
                                      <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="rounded-md py-2.5 focus:bg-primary/5 focus:text-primary font-medium transition-all"
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span className="text-sm">
                                            {opt.label || opt.value}
                                          </span>
                                          <div className="flex gap-1 ml-4">
                                            {opt.pricePerPage ? (
                                              <span className="text-[9px] text-primary/70 font-bold">
                                                +{formatPrice(opt.pricePerPage)}
                                                /pg
                                              </span>
                                            ) : null}
                                            {opt.fixedPrice ||
                                            opt.pricePerCopy ? (
                                              <span className="text-[9px] text-emerald-600 font-bold">
                                                +
                                                {formatPrice(
                                                  opt.fixedPrice ||
                                                    opt.pricePerCopy ||
                                                    0,
                                                )}
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              cat.id === "bindingOption" &&
                              selectedService.bindingOptions &&
                              selectedService.bindingOptions.length > 0 && (
                                <div
                                  key={cat.id}
                                  className="space-y-2 p-3 rounded-xl bg-amber-50 border border-amber-100/30"
                                >
                                  <div className="flex items-center gap-2 text-amber-700">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                      Binding Unavailable
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-amber-600/80 font-medium leading-tight">
                                    {pageCount} pages minimum required for
                                    current options.
                                  </p>
                                </div>
                              )
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Live Quote */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Calculator className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  3. Live Quote Summary
                </h2>
              </div>

              <div className="relative group">
                {/* Decorative glow background */}
                <div className="absolute -inset-1 rounded-[40px] pointer-events-none" />

                <Card className="border border-border/50 bg-white shadow-xl rounded-3xl overflow-hidden">
                  <div className=" p-8 border-b border-border/40">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                        Estimated Total
                      </p>
                      <motion.div
                        key={total}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-extrabold text-foreground tracking-tight"
                      >
                        {formatPrice(total)}
                      </motion.div>
                      <p className="text-[11px] font-medium text-muted-foreground pt-1">
                        {copies} Set{copies > 1 ? "s" : ""} •{" "}
                        {formatPrice(total / (copies || 1))} per set
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Price Breakdown
                      </h3>

                      <div className="space-y-3">
                        {breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center group"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                                {item.label}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {item.isPerPage
                                  ? `@ ${formatPrice(item.value)}/pg`
                                  : `Fixed surcharge`}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-foreground">
                              {formatPrice(item.value)}
                            </span>
                          </div>
                        ))}

                        <div className="pt-4 mt-2 border-t border-border/40">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-xs font-bold text-foreground">
                              Rate Per Item
                            </span>
                            <span className="text-lg font-extrabold text-primary">
                              {formatPrice(totalForSingleCopy)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          router.push(`/order/${selectedServiceId}`);
                        }}
                        className="w-full h-12 rounded-xl text-sm cursor-pointer font-bold shadow-md shadow-primary/10 transition-all hover:translate-y-[-2px] active:scale-95 group bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                      >
                        Place Your Order
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          Secure
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <Info className="h-3 w-3 text-blue-500" />
                          Live Rates
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* FAQ/Promise Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-22 pt-20 border-t border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground tracking-tight">
                  Bulk Discounts
                </h4>
                <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                  Ordering more than 50 copies? Automatically applies optimized
                  rates to save you money on volume.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground tracking-tight">
                  Price Protection
                </h4>
                <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                  The quote you see here is guaranteed for 24 hours. No hidden
                  fees or surprise surcharges.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground tracking-tight">
                  Fast Estimates
                </h4>
                <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                  Our engine uses real-time market data to provide the most
                  accurate pricing estimates instantly.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
