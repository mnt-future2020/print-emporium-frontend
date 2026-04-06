"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  CreditCard,
  ImageIcon,
  FileText,
  Loader2,
  ChevronRight,
  Globe,
  Truck,
  Palette,
  Layers,
  ShieldCheck,
  Clock,
  Gift,
  Scan,
  BookOpen,
  Tags,
  ShoppingBag,
  Zap,
  Star,
  Play,
  CheckCircle2,
  type LucideIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getAllHeroSlides, type HeroSlide } from "@/lib/hero-slide-api";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const IconMap: Record<string, LucideIcon> = {
  Printer,
  CreditCard,
  Image: ImageIcon,
  FileText,
  Globe,
  Truck,
  Palette,
  Layers,
  ShieldCheck,
  Clock,
  Gift,
  Scan,
  BookOpen,
  Tags,
  ShoppingBag,
  Zap,
  Star,
};

export default function PremiumHeroCarousel() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  // Fetch Slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await getAllHeroSlides();
        if (res.success && res.data.length > 0) {
          setSlides(res.data);
        } else {
          // Fallback content if no slides found
          setSlides([
            {
              _id: "1",
              title: "Professional Printing Services",
              subtitle:
                "Quality printing solutions for all your business and personal needs in Chennai.",
              image:
                "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=2000&auto=format&fit=crop", // Placeholder
              ctaText: "Explore Services",
              ctaLink: "/services",
              features: ["High Quality", "Fast Delivery", "Custom Designs"],
              order: 1,
              isActive: true,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Carousel State Sync
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
      setProgress(0); // Reset progress on manual change
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Auto-play Progress
  useEffect(() => {
    if (!carouselApi || slides.length <= 1) return;

    // Reset progress when slide changes
    progressRef.current = 0;
    setProgress(0);

    const timer = setInterval(() => {
      progressRef.current += 1;
      setProgress(progressRef.current);

      if (progressRef.current >= 100) {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext();
        } else {
          carouselApi.scrollTo(0);
        }
        progressRef.current = 0;
        setProgress(0);
      }
    }, 60); // 60ms * 100 = 6000ms duration

    return () => clearInterval(timer);
  }, [carouselApi, currentSlide, slides.length]);

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center bg-background rounded-3xl m-4 border border-border/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="w-full bg-background pt-4 pb-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            loop: true,
            align: "center",
          }}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => {
              const Icon = slide.iconName
                ? IconMap[slide.iconName] || Printer
                : Printer;
              return (
                <CarouselItem key={slide._id || index} className="w-full">
                  <div className="relative w-full h-screen sm:h-[700px] md:h-[calc(100vh-120px)] min-h-[600px] rounded-2xl md:rounded-3xl overflow-hidden group shadow-2xl shadow-primary/10 border border-border/50">
                    {/* --- Background Image --- */}
                    <div className="absolute inset-0">
                      <Image
                        src={
                          typeof slide.image === "string"
                            ? slide.image
                            : "/placeholder-hero.jpg"
                        }
                        alt={slide.title}
                        fill
                        className="object-cover object-center transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-110"
                        preload={index === 0}
                        sizes="100vw"
                      />
                      {/* Cinematic Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    </div>

                    {/* --- Content --- */}
                    <div className="absolute inset-0 z-20 flex items-start md:items-center justify-center md:justify-start pt-12 md:pt-0">
                      <div className="container mx-auto px-4 md:px-12 lg:px-20 text-center md:text-left">
                        <div className="w-full md:max-w-5xl flex flex-col items-center md:items-start">
                          {/* Badge/Icon */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                              y: index === currentSlide ? 0 : 20,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Professional Quality Guaranteed
                          </motion.div>

                          {/* Heading */}
                          <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                              y: index === currentSlide ? 0 : 30,
                            }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight md:leading-tight tracking-tight mb-4 md:mb-6 drop-shadow-lg w-full max-w-full"
                          >
                            {slide.title}
                          </motion.h1>

                          {/* Subtitle */}
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                              y: index === currentSlide ? 0 : 20,
                            }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-white/90 text-sm sm:text-base md:text-2xl leading-relaxed font-normal md:font-light max-w-xs md:max-w-2xl mb-6 md:mb-10 drop-shadow-md"
                          >
                            {slide.subtitle}
                          </motion.p>

                          {/* Features List */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                            }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="hidden md:flex flex-wrap gap-x-8 gap-y-3 mb-10 text-white/90"
                          >
                            {slide.features?.slice(0, 3).map((feature, fi) => (
                              <div
                                key={fi}
                                className="flex items-center gap-2 text-base font-medium"
                              >
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                {feature}
                              </div>
                            ))}
                          </motion.div>

                          {/* Buttons */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                              y: index === currentSlide ? 0 : 20,
                            }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex flex-col gap-3 w-full max-w-xs md:max-w-none md:flex-row md:gap-4 md:w-auto mt-2 md:mt-0"
                          >
                            <Link
                              href={slide.ctaLink || "/services"}
                              className="w-full md:w-auto"
                            >
                              <Button
                                size="lg"
                                className="w-full md:w-auto h-12 md:h-16 px-8 md:px-10 text-base md:text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)] md:shadow-[0_0_40px_-10px_rgba(var(--primary),0.6)] group-hover:scale-105 transition-transform"
                              >
                                {slide.ctaText || "Get Started"}
                                <Upload className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                              </Button>
                            </Link>

                            {slide.secondaryCtaText && (
                              <Link
                                href={slide.secondaryCtaLink || "/about"}
                                className="w-full md:w-auto"
                              >
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="w-full md:w-auto h-12 md:h-16 px-8 md:px-10 text-base md:text-lg rounded-full border-white/30 bg-white/5 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                                >
                                  {slide.secondaryCtaText}
                                </Button>
                              </Link>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* --- Controls Overlay --- */}
          <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-30 container mx-auto px-4 md:px-10 pointer-events-none">
            <div className="flex items-center justify-center md:justify-between">
              {/* Pagination Dots / Progress */}
              <div className="flex gap-2 md:gap-3 pointer-events-auto">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => carouselApi?.scrollTo(i)}
                    className="group relative h-1.5 rounded-full bg-white/20 overflow-hidden transition-all duration-300 hover:h-2"
                    style={{
                      width:
                        currentSlide === i ? "40px md:60px" : "15px md:20px",
                    }}
                  >
                    {currentSlide === i && (
                      <motion.div
                        className="absolute inset-0 bg-primary"
                        initial={{ x: "-100%" }}
                        animate={{ x: `${progress - 100}%` }}
                        transition={{ duration: 0 }} // Controlled purely by state updates
                      />
                    )}
                    <div
                      className={cn(
                        "absolute inset-0 bg-white/50",
                        currentSlide === i
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Navigation Buttons (Hidden on Mobile) */}
              <div className="hidden md:flex gap-4 pointer-events-auto">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => carouselApi?.scrollPrev()}
                  className="h-12 w-12 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => carouselApi?.scrollNext()}
                  className="h-12 w-12 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
