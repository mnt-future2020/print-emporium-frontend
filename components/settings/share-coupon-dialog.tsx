"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Copy,
  Share2,
  Twitter,
  Mail,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareCouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  couponCode: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free-delivery";
  discountValue: number;
}

export function ShareCouponDialog({
  isOpen,
  onClose,
  couponCode,
  description,
  discountType,
  discountValue,
}: ShareCouponDialogProps) {
  const [copied, setCopied] = useState(false);

  // Generate promotional message based on coupon details
  const getPromoMessage = () => {
    let offerText = "";
    if (discountType === "percentage") {
      offerText = `${discountValue}% OFF`;
    } else if (discountType === "fixed") {
      offerText = `₹${discountValue} OFF`;
    } else {
      offerText = "FREE Delivery";
    }

    return `🎉 Special Offer! Get ${offerText} on your next order at Print Emporium! Use code: ${couponCode}. ${description || "Limited time offer."} Shop now: ${window.location.origin}`;
  };

  const promoMessage = typeof window !== "undefined" ? getPromoMessage() : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoMessage);
      setCopied(true);
      toast.success("Offer details copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Special Offer from Print Emporium",
          text: promoMessage,
          url: window.location.origin,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      toast.error("Web Share not supported on this device");
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(promoMessage)}`,
      color: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(promoMessage)}`,
      color: "bg-black hover:bg-zinc-800 text-white",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=Special Discount for You!&body=${encodeURIComponent(promoMessage)}`,
      color: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
        <div className="bg-linear-to-br from-primary via-indigo-600 to-purple-700 p-6 text-white text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

          <Share2 className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <DialogTitle className="text-2xl font-bold mb-1 relative z-10">
            Share & Promote
          </DialogTitle>
          <DialogDescription className="text-white/80 relative z-10">
            Distribute this coupon to your customers
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6 bg-background">
          {/* Coupon Code Big Display */}
          <div className="text-center space-y-2">
            <Label className="uppercase text-xs font-bold text-muted-foreground tracking-widest">
              Coupon Code
            </Label>
            <div className="bg-muted/30 border-2 border-dashed border-primary/20 rounded-xl p-4 relative group hover:border-primary/50 transition-colors">
              <span className="text-3xl font-mono font-black tracking-widest text-primary selection:bg-primary selection:text-white">
                {couponCode}
              </span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95 group",
                  "bg-muted/20 hover:bg-muted/40",
                )}
                title={`Share on ${link.name}`}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shadow-md",
                    link.color,
                  )}
                >
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {link.name}
                </span>
              </a>
            ))}

            {/* Native Share Button (Mobile mostly) */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95 group bg-muted/20 hover:bg-muted/40"
              title="More Options"
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-md bg-orange-500 hover:bg-orange-600 text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Native
              </span>
            </button>
          </div>

          {/* Promo Message Preview & Copy */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Promotional Message Preview
            </Label>
            <div className="relative">
              <Input
                readOnly
                value={promoMessage}
                className="pr-24 h-12 text-sm bg-muted/20 text-muted-foreground"
              />
              <Button
                size="sm"
                className={cn(
                  "absolute right-1 top-1 bottom-1 px-3 transition-all",
                  copied ? "bg-green-500 hover:bg-green-600 text-white" : "",
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
