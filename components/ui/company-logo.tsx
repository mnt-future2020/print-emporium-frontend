"use client";

import { useCompanyLogo } from "@/hooks/use-company-logo";
import { Printer } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
}

export function CompanyLogo({
  className = "",
  width = 120,
  height = 40,
  showFallback = true,
}: CompanyLogoProps) {
  const { logo, isLoading } = useCompanyLogo();

  if (isLoading) {
    return (
      <div
        className={cn("animate-pulse bg-muted rounded", className)}
        style={{ width, height }}
      />
    );
  }

  if (logo) {
    return (
      <div
        className={cn("relative overflow-hidden", className)}
        style={{ width, height }}
      >
        <Image
          src={logo}
          alt="Company Logo"
          fill
          className="object-contain"
          sizes={`${width}px`}
        />
      </div>
    );
  }

  // Fallback to icon if no logo and showFallback is true
  if (showFallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground rounded",
          className,
        )}
        style={{ width, height }}
      >
        <Printer size={Math.min(width, height) * 0.6} strokeWidth={2} />
      </div>
    );
  }

  return null;
}
