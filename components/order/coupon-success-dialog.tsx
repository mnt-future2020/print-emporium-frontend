"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Ticket, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing-utils";
import { useEffect } from "react";

interface CouponSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  couponCode: string;
  discount: number;
  isFreeDelivery: boolean;
  newTotal: number;
  autoDismissMs?: number; // optional auto-close
}

export function CouponSuccessDialog({
  open,
  onClose,
  couponCode,
  discount,
  isFreeDelivery,
  newTotal,
  autoDismissMs = 0,
}: CouponSuccessDialogProps) {
  useEffect(() => {
    if (!open || !autoDismissMs) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border border-[#e5edf5] dark:border-border bg-white dark:bg-card gap-0">

        <DialogTitle className="sr-only">Coupon applied successfully</DialogTitle>
        <DialogDescription className="sr-only">
          Your coupon {couponCode} has been applied to the order.
        </DialogDescription>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative"
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />

              <div className="p-6 sm:p-8 text-center">
                {/* Animated success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.05,
                    type: "spring",
                    stiffness: 320,
                    damping: 18,
                  }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" strokeWidth={2} />
                </motion.div>

                <h2 className="text-xl font-light tracking-tight text-foreground mb-2">
                  Coupon Applied
                </h2>
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-5">
                  Discount has been added to your order.
                </p>

                {/* Coupon code chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 mb-5">
                  <Ticket className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-mono font-medium text-primary tracking-wide">
                    {couponCode}
                  </span>
                </div>

                {/* Savings summary */}
                <div
                  className="rounded-md border border-[#e5edf5] dark:border-border bg-muted/30 px-5 py-4 mb-5 text-left"
                  style={{
                    boxShadow:
                      "rgba(50,50,93,0.04) 0px 4px 12px 0px, rgba(0,0,0,0.02) 0px 2px 4px 0px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-light flex items-center gap-1.5">
                      <TrendingDown className="h-3 w-3" />
                      You saved
                    </span>
                    <span className="text-base font-medium text-emerald-600">
                      {isFreeDelivery ? "Free delivery" : formatPrice(discount)}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-light">
                      New total
                    </span>
                    <span className="text-lg font-semibold text-foreground tracking-tight">
                      {formatPrice(newTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full rounded-md text-sm font-normal h-10"
                  style={{
                    boxShadow:
                      "rgba(50,50,93,0.2) 0px 4px 8px -2px, rgba(0,0,0,0.08) 0px 2px 4px -2px",
                  }}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
