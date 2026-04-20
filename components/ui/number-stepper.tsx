"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md";
  leftPadding?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  placeholder = "0",
  disabled = false,
  id,
  size = "md",
  leftPadding,
  className,
  inputClassName,
  ariaLabel,
}: NumberStepperProps) {
  const clamp = (n: number) => {
    let next = n;
    if (typeof min === "number" && next < min) next = min;
    if (typeof max === "number" && next > max) next = max;
    const decimals = (String(step).split(".")[1] || "").length;
    return decimals > 0 ? Number(next.toFixed(decimals)) : next;
  };

  const dec = () => onChange(clamp((value || 0) - step));
  const inc = () => onChange(clamp((value || 0) + step));

  const dims =
    size === "sm"
      ? { h: "h-8", btn: "w-7", icon: "h-3 w-3", text: "text-xs" }
      : { h: "h-10", btn: "w-9", icon: "h-4 w-4", text: "text-sm" };

  const atMin = typeof min === "number" && (value || 0) <= min;
  const atMax = typeof max === "number" && (value || 0) >= max;

  return (
    <div
      className={cn(
        "relative inline-flex items-stretch rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-all",
        disabled && "opacity-50 pointer-events-none",
        dims.h,
        className,
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || atMin}
        aria-label="Decrease"
        className={cn(
          "flex items-center justify-center border-r border-input text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          dims.btn,
        )}
      >
        <Minus className={dims.icon} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || raw === "-") {
            onChange(0);
            return;
          }
          const n = Number(raw);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className={cn(
          "flex-1 min-w-0 bg-transparent text-center font-medium outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          dims.text,
          leftPadding,
          inputClassName,
        )}
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || atMax}
        aria-label="Increase"
        className={cn(
          "flex items-center justify-center border-l border-input text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          dims.btn,
        )}
      >
        <Plus className={dims.icon} />
      </button>
    </div>
  );
}
