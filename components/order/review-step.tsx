"use client";

import { useState, useRef } from "react";
import { OrderItem, DeliveryInfo } from "@/lib/order-types";
import { INDIAN_STATES } from "@/lib/india-states";
import { lookupPincode, type PostOffice } from "@/lib/pincode-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/pricing-utils";
import { formatFileSize } from "@/lib/file-utils";
import { createOrder } from "@/lib/order-api";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  FileText,
  MapPin,
  CreditCard,
  CheckCircle2,
  Eye,
  X,
  Loader2,
  ShieldCheck,
  Truck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  loadRazorpayScript,
  createPaymentOrder as createRazorpayOrder,
  verifyPayment,
} from "@/lib/payment-api";
import { validateCoupon, getActiveCoupons, Coupon } from "@/lib/coupon-api";
import { Ticket, Info as LucideInfo, ChevronRight, Gift } from "lucide-react";
import { useEffect } from "react";

// Component for printing (hidden from screen)
interface PrintableOrderSummaryProps {
  orderItems: OrderItem[];
  deliveryInfo: DeliveryInfo;
  total: number;
  innerRef: React.RefObject<HTMLDivElement | null>;
}

const PrintableOrderSummary = ({
  orderItems,
  deliveryInfo,
  total,
  innerRef,
}: PrintableOrderSummaryProps) => (
  <div
    className="p-8 bg-white text-black font-sans hidden print:block"
    ref={innerRef}
  >
    <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold uppercase">Order Summary</h1>
        <p className="text-sm">
          Print Emporium - Professional Printing Services
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm">{new Date().toLocaleDateString()}</p>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-300">
        Delivery Details
      </h2>
      <p>
        <strong>Name:</strong> {deliveryInfo.fullName}
      </p>
      <p>
        <strong>Phone:</strong> {deliveryInfo.phone}
      </p>
      <p>
        <strong>Email:</strong> {deliveryInfo.email}
      </p>
      <p>
        <strong>Address:</strong> {deliveryInfo.doorNumber},{" "}
        {deliveryInfo.address}
        {deliveryInfo.landmark ? `, ${deliveryInfo.landmark}` : ""},{" "}
        {deliveryInfo.city}, {deliveryInfo.state} - {deliveryInfo.pincode}
      </p>
    </div>

    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-300">
        Order Items
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-gray-300">Service / File</th>
            <th className="p-2 border border-gray-300 text-center">Config</th>
            <th className="p-2 border border-gray-300 text-right">Qty</th>
            <th className="p-2 border border-gray-300 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, idx) => (
            <tr key={idx}>
              <td className="p-2 border border-gray-300">
                <div className="font-bold">{item.serviceName}</div>
                <div className="text-xs">
                  {item.file.name} ({item.file.pageCount} pgs)
                </div>
              </td>
              <td className="p-2 border border-gray-300 text-xs">
                {item.configuration.printType}, {item.configuration.paperSize},{" "}
                {item.configuration.gsm}GSM
              </td>
              <td className="p-2 border border-gray-300 text-right">
                {item.configuration.copies}
              </td>
              <td className="p-2 border border-gray-300 text-right font-medium">
                {formatPrice(item.pricing.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end">
      <div className="w-1/2 space-y-2">
        <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-black">
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>

    <div className="mt-12 text-center text-xs text-gray-400">
      <p>Thank you for choosing Print Emporium!</p>
    </div>
  </div>
);

interface ReviewStepProps {
  orderItems: OrderItem[];
  deliveryInfo: DeliveryInfo;
  onDeliveryInfoChange: (info: DeliveryInfo) => void;
  saveDetails: boolean;
  onSaveDetailsChange: (next: boolean) => void;
  subtotal: number;
  deliveryCharge: number;
  packingCharge: number;
  total: number;
  onBack: () => void;
  pricingSettings?: any;
}

export function ReviewStep({
  orderItems,
  deliveryInfo,
  onDeliveryInfoChange,
  saveDetails,
  onSaveDetailsChange,
  subtotal,
  deliveryCharge,
  packingCharge,
  total,
  onBack,
  pricingSettings,
}: ReviewStepProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<OrderItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isApproved, setIsApproved] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  // Pincode lookup state
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const pincodeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      pincodeAbortRef.current?.abort();
    };
  }, []);

  const fetchPincodeDetails = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      setPostOffices([]);
      setPincodeError("");
      return;
    }
    // Cancel any in-flight lookup
    pincodeAbortRef.current?.abort();
    const controller = new AbortController();
    pincodeAbortRef.current = controller;

    setPincodeLoading(true);
    setPincodeError("");
    try {
      const result = await lookupPincode(pincode, controller.signal);
      if (controller.signal.aborted) return;
      if (!result) {
        setPostOffices([]);
        setPincodeError("Pincode not found — enter city/state manually");
        return;
      }
      setPostOffices(result.postOffices);
      const firstCity =
        result.postOffices[0]?.name || result.district || "";
      onDeliveryInfoChange({
        ...deliveryInfo,
        pincode,
        state: result.state,
        city: deliveryInfo.city || firstCity,
      });
      setErrors((prev) => ({ ...prev, state: "", city: "", pincode: "" }));
    } catch (err: any) {
      if (
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED"
      ) {
        return; // superseded by newer lookup — stay silent
      }
      setPincodeError("Couldn't fetch location — enter city/state manually");
      setPostOffices([]);
    } finally {
      if (!controller.signal.aborted) setPincodeLoading(false);
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getActiveCoupons();
        if (response.success) {
          setActiveCoupons(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch active coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  const componentRef = useRef<HTMLDivElement>(null);

  const updateDeliveryInfo = (
    key: keyof DeliveryInfo,
    value: string | boolean,
  ) => {
    onDeliveryInfoChange({ ...deliveryInfo, [key]: value });
    // Clear error when user types / corrects
    if (errors[key as string]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // Per-field validators. Return empty string when valid.
  const FIELD_ORDER = [
    "fullName",
    "phone",
    "email",
    "pincode",
    "state",
    "city",
    "doorNumber",
    "address",
    "scheduledDate",
  ] as const;

  const validateField = (
    key: (typeof FIELD_ORDER)[number],
    info: DeliveryInfo,
  ): string => {
    switch (key) {
      case "fullName": {
        const n = info.fullName.trim();
        if (!n) return "Full name is required";
        if (n.length < 2) return "Name must be at least 2 characters";
        if (n.length > 60) return "Name must be under 60 characters";
        if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(n))
          return "Use letters, spaces, dots, apostrophes or hyphens only";
        return "";
      }
      case "phone": {
        const p = info.phone.trim();
        if (!p) return "Phone number is required";
        if (!/^[6-9]\d{9}$/.test(p))
          return "Enter a valid 10-digit Indian mobile number";
        return "";
      }
      case "email": {
        const e = info.email.trim();
        if (!e) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e))
          return "Enter a valid email address";
        if (e.length > 254) return "Email is too long";
        return "";
      }
      case "pincode": {
        const p = info.pincode.trim();
        if (!p) return "Pincode is required";
        if (!/^\d{6}$/.test(p)) return "Enter a valid 6-digit pincode";
        return "";
      }
      case "state": {
        const s = info.state.trim();
        if (!s) return "Select a state";
        if (!(INDIAN_STATES as readonly string[]).includes(s))
          return "Pick a valid Indian state";
        return "";
      }
      case "city": {
        const c = info.city.trim();
        if (!c) return "City / locality is required";
        if (c.length < 2) return "City must be at least 2 characters";
        return "";
      }
      case "doorNumber": {
        const d = info.doorNumber.trim();
        if (!d) return "Door / House no. is required";
        if (d.length > 30) return "Keep door number under 30 characters";
        return "";
      }
      case "address": {
        const a = info.address.trim();
        if (!a) return "Street address is required";
        if (a.length < 5) return "Address must be at least 5 characters";
        if (a.length > 250) return "Address is too long";
        return "";
      }
      case "scheduledDate": {
        if (!info.scheduleDelivery) return "";
        if (!info.scheduledDate) return "Please select a delivery date";
        const selected = new Date(info.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(selected.getTime())) return "Invalid date";
        if (selected < today) return "Delivery date cannot be in the past";
        return "";
      }
    }
  };

  const handleFieldBlur = (key: (typeof FIELD_ORDER)[number]) => {
    const msg = validateField(key, deliveryInfo);
    setErrors((prev) => ({ ...prev, [key]: msg }));
  };

  const focusField = (fieldId: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Radix Select trigger is a button — focus() works on both input and button.
    setTimeout(() => {
      (el as HTMLElement).focus({ preventScroll: true });
    }, 300);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const key of FIELD_ORDER) {
      const msg = validateField(key, deliveryInfo);
      if (msg) newErrors[key] = msg;
    }
    setErrors(newErrors);

    const firstErrorKey = FIELD_ORDER.find((k) => newErrors[k]);
    if (firstErrorKey) focusField(firstErrorKey);

    return Object.keys(newErrors).length === 0;
  };

  // Helper to build aria props for an input that may have an error
  const ariaFor = (key: string) =>
    errors[key]
      ? { "aria-invalid": true as const, "aria-describedby": `${key}-error` }
      : {};

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const response = await validateCoupon(couponCode, subtotal);
      if (response.success) {
        setAppliedCoupon(response.data);
        toast.success(`Coupon "${response.data.code}" applied!`);
      } else {
        setCouponError(response.message || "Invalid coupon code");
      }
    } catch (error: any) {
      setCouponError(
        error.response?.data?.message || "Failed to validate coupon",
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const isFreeDeliveryApplied = appliedCoupon?.type === "free-delivery";
  const currentDiscount = appliedCoupon
    ? isFreeDeliveryApplied
      ? deliveryCharge
      : appliedCoupon.discount
    : 0;
  const finalTotal = Math.max(0, total - currentDiscount);

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Upload files to get permanent URLs via backend
      toast.info("Uploading files...");
      const uploadedItems = await Promise.all(
        orderItems.map(async (item) => {
          try {
            // 1. Convert original file to base64
            const originalFile = item.file.originalFile || item.file.file;
            const pdfFile = item.file.originalFile ? item.file.file : null; // If original exists, then .file is the converted PDF

            const reader = new FileReader();
            const fileData = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(originalFile);
            });

            let pdfData = null;
            if (pdfFile) {
              const pdfReader = new FileReader();
              pdfData = await new Promise<string>((resolve, reject) => {
                pdfReader.onload = () => resolve(pdfReader.result as string);
                pdfReader.onerror = reject;
                pdfReader.readAsDataURL(pdfFile);
              });
            }

            // Upload via backend API
            const uploadResponse = await axiosInstance.post(
              "/api/orders/upload-file",
              {
                fileData,
                pdfData,
                fileName: item.file.name,
              },
            );

            if (!uploadResponse.data.success) {
              throw new Error("File upload failed");
            }

            return {
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              file: {
                name: item.file.name,
                size: item.file.size,
                pageCount: item.file.pageCount,
                filePublicId: uploadResponse.data.filePublicId, // Original file public_id
                pdfPublicId: uploadResponse.data.pdfPublicId, // PDF file public_id
              },
              configuration: item.configuration,
              pricing: item.pricing,
            };
          } catch (error) {
            console.error("File upload error:", error);
            throw new Error(`Failed to upload ${item.file.name}`);
          }
        }),
      );

      // 2. Create the Order in Backend
      toast.info("Creating order...");
      const orderPayload = {
        items: uploadedItems,
        deliveryInfo,
        pricing: {
          subtotal,
          deliveryCharge,
          packingCharge,
          discount: currentDiscount,
          total: finalTotal,
        },
        couponCode: appliedCoupon?.code,
      };

      const orderResponse = await createOrder(orderPayload);
      if (!orderResponse.success) {
        throw new Error("Failed to create order");
      }

      const order = orderResponse.order;

      // 3. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(
          "Failed to load payment gateway. Please check your internet connection.",
        );
        setIsProcessing(false);
        return;
      }

      // 4. Create Payment Order (Razorpay)
      const paymentOrder = await createRazorpayOrder(order.id);
      if (!paymentOrder.success) {
        toast.error("Failed to initiate payment. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 5. Open Checkout
      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount, // Amount is in paise
        currency: paymentOrder.currency,
        name: "Print Emporium",
        description: `Order #${order.orderNumber}`,
        order_id: paymentOrder.id, // Razorpay Order ID
        prefill: {
          name: deliveryInfo.fullName,
          email: deliveryInfo.email,
          contact: deliveryInfo.phone,
        },
        theme: {
          color: "#7c3aed", // TODO: Use primary color from theme
        },
        handler: async function (response: any) {
          try {
            // 6. Verify Payment on Backend
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id,
            });

            if (verifyRes.success) {
              toast.success("Payment successful! Order confirmed.");
              if (!saveDetails) {
                try {
                  window.localStorage.removeItem("pe:deliveryInfo");
                } catch {}
              }
              router.push(`/order/success/${order.id}`);
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Verification error", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast("Payment cancelled", {
              description:
                "You can retry payment from the dashboard order history.",
            });
            // Redirecting to order details even if unpaid/cancelled so they can retry?
            // Or stay here?
            // Usually better to redirect to dashboard where they see "Pending Payment" status.
            router.push(`/dashboard?tab=orders&order=${order.id}`);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: unknown) {
      console.error("Order process failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.";
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review & Pay
        </h2>
        <p className="text-muted-foreground">
          Review your order details and complete the payment to confirm.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Order Items ({orderItems.length})
            </h3>

            <div className="space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                            {item.file.name}
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
                            {item.serviceName}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(item.file.size)} •{" "}
                          {item.file.pageCount} pages
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewFile(item)}
                        className="h-8 text-xs shrink-0 self-start sm:self-auto"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Preview
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-background border border-border capitalize">
                        {item.configuration.printType.replace("-", " ")}
                      </span>
                      <span className="px-2 py-1 rounded bg-background border border-border uppercase">
                        {item.configuration.paperSize}
                      </span>
                      <span className="px-2 py-1 rounded bg-background border border-border capitalize">
                        {item.configuration.paperType.replace("-", " ")}
                      </span>
                      <span className="px-2 py-1 rounded bg-background border border-border">
                        {item.configuration.gsm} GSM
                      </span>
                      <span className="px-2 py-1 rounded bg-background border border-border capitalize">
                        {item.configuration.printSide.replace("-", " ")}
                      </span>
                      <span className="px-2 py-1 rounded bg-background border border-border">
                        {item.configuration.copies}{" "}
                        {item.configuration.copies > 1 ? "copies" : "copy"}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {item.pricing.totalPages} pages × {item.pricing.copies}{" "}
                        {item.pricing.copies > 1 ? "copies" : "copy"} × ₹
                        {item.pricing.pricePerPage}/page
                      </span>
                      <span className="font-bold text-foreground text-base sm:text-lg">
                        {formatPrice(item.pricing.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={deliveryInfo.fullName}
                  onChange={(e) =>
                    updateDeliveryInfo("fullName", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("fullName")}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={60}
                  className={cn(errors.fullName && "border-destructive")}
                  {...ariaFor("fullName")}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-xs text-destructive">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  value={deliveryInfo.phone}
                  onChange={(e) =>
                    updateDeliveryInfo(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  onBlur={() => handleFieldBlur("phone")}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  maxLength={10}
                  className={cn(errors.phone && "border-destructive")}
                  {...ariaFor("phone")}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-xs text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  onBlur={() => handleFieldBlur("email")}
                  {...ariaFor("email")}
                  value={deliveryInfo.email}
                  onChange={(e) => updateDeliveryInfo("email", e.target.value)}
                  placeholder="your@email.com"
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <div className="relative">
                  <Input
                    id="pincode"
                    value={deliveryInfo.pincode}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      updateDeliveryInfo("pincode", val);
                      if (val.length === 6) void fetchPincodeDetails(val);
                      else {
                        setPostOffices([]);
                        setPincodeError("");
                      }
                    }}
                    onBlur={() => handleFieldBlur("pincode")}
                    placeholder="6-digit pincode"
                    className={cn(errors.pincode && "border-destructive")}
                    {...ariaFor("pincode")}
                  />
                  {pincodeLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {errors.pincode && (
                  <p id="pincode-error" className="text-xs text-destructive">
                    {errors.pincode}
                  </p>
                )}
                {pincodeError && !errors.pincode && (
                  <p className="text-xs text-amber-600">{pincodeError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={deliveryInfo.state}
                  onValueChange={(v) => {
                    updateDeliveryInfo("state", v);
                    // immediately revalidate on pick
                    setErrors((prev) => ({ ...prev, state: "" }));
                  }}
                >
                  <SelectTrigger
                    id="state"
                    onBlur={() => handleFieldBlur("state")}
                    className={cn(errors.state && "border-destructive")}
                    {...ariaFor("state")}
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p id="state-error" className="text-xs text-destructive">
                    {errors.state}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">City / Locality *</Label>
                {postOffices.length > 0 ? (
                  <Select
                    value={deliveryInfo.city}
                    onValueChange={(v) => {
                      updateDeliveryInfo("city", v);
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                  >
                    <SelectTrigger
                      id="city"
                      onBlur={() => handleFieldBlur("city")}
                      className={cn(errors.city && "border-destructive")}
                      {...ariaFor("city")}
                    >
                      <SelectValue placeholder="Select locality" />
                    </SelectTrigger>
                    <SelectContent>
                      {postOffices.map((p) => (
                        <SelectItem key={p.name} value={p.name}>
                          {p.name}
                          {p.district ? ` — ${p.district}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="city"
                    value={deliveryInfo.city}
                    onChange={(e) => updateDeliveryInfo("city", e.target.value)}
                    onBlur={() => handleFieldBlur("city")}
                    autoComplete="address-level2"
                    placeholder="Enter a 6-digit pincode to auto-fill, or type manually"
                    className={cn(errors.city && "border-destructive")}
                    {...ariaFor("city")}
                  />
                )}
                {errors.city && (
                  <p id="city-error" className="text-xs text-destructive">
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="doorNumber">Door / House / Flat No. *</Label>
                <Input
                  id="doorNumber"
                  value={deliveryInfo.doorNumber}
                  onChange={(e) =>
                    updateDeliveryInfo("doorNumber", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("doorNumber")}
                  placeholder="e.g., 12B, Flat 304"
                  autoComplete="address-line2"
                  maxLength={30}
                  className={cn(errors.doorNumber && "border-destructive")}
                  {...ariaFor("doorNumber")}
                />
                {errors.doorNumber && (
                  <p id="doorNumber-error" className="text-xs text-destructive">
                    {errors.doorNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Street / Area *</Label>
                <Textarea
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) =>
                    updateDeliveryInfo("address", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("address")}
                  placeholder="Street name, area, colony"
                  autoComplete="address-line1"
                  maxLength={250}
                  rows={2}
                  className={cn(errors.address && "border-destructive")}
                  {...ariaFor("address")}
                />
                {errors.address && (
                  <p id="address-error" className="text-xs text-destructive">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  value={deliveryInfo.landmark || ""}
                  onChange={(e) =>
                    updateDeliveryInfo("landmark", e.target.value)
                  }
                  placeholder="Near …"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                <Input
                  id="deliveryNotes"
                  value={deliveryInfo.deliveryNotes}
                  onChange={(e) =>
                    updateDeliveryInfo("deliveryNotes", e.target.value)
                  }
                  placeholder="Any special instructions"
                />
              </div>

              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                <Checkbox
                  id="saveDetails"
                  checked={saveDetails}
                  onCheckedChange={(v) => onSaveDetailsChange(v === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="saveDetails"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Save my details for next time
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stored only on this device. Uncheck any time to clear.
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Delivery Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <Label
                      htmlFor="scheduleDelivery"
                      className="text-base font-semibold cursor-pointer"
                    >
                      Schedule Delivery
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Choose a specific date for delivery
                    </p>
                  </div>
                </div>
                <Switch
                  id="scheduleDelivery"
                  checked={deliveryInfo.scheduleDelivery || false}
                  onCheckedChange={(checked) => {
                    const newInfo = {
                      ...deliveryInfo,
                      scheduleDelivery: checked,
                    };
                    if (!checked) {
                      newInfo.scheduledDate = "";
                    }
                    onDeliveryInfoChange(newInfo);

                    // Clear errors
                    if (errors.scheduleDelivery) {
                      setErrors((prev) => ({ ...prev, scheduleDelivery: "" }));
                    }
                    if (!checked && errors.scheduledDate) {
                      setErrors((prev) => ({ ...prev, scheduledDate: "" }));
                    }
                  }}
                />
              </div>

              {deliveryInfo.scheduleDelivery && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="scheduledDate">Delivery Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={deliveryInfo.scheduledDate || ""}
                    onChange={(e) =>
                      updateDeliveryInfo("scheduledDate", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("scheduledDate")}
                    min={new Date().toISOString().split("T")[0]}
                    className={cn(errors.scheduledDate && "border-destructive")}
                    {...ariaFor("scheduledDate")}
                  />
                  {errors.scheduledDate && (
                    <p
                      id="scheduledDate-error"
                      className="text-xs text-destructive"
                    >
                      {errors.scheduledDate}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your order will be delivered on the selected date
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-4">
            {/* Final Summary Card */}
            <div className="bg-card rounded-2xl border-2 border-primary/20 p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {pricingSettings?.isDeliveryEnabled && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">
                          Delivery Charge
                        </span>
                        {(deliveryCharge === 0 || isFreeDeliveryApplied) && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase">
                            Free
                          </span>
                        )}
                        {!isFreeDeliveryApplied && deliveryCharge > 0 && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                            Standard
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-medium",
                          deliveryCharge === 0 || isFreeDeliveryApplied
                            ? "text-green-600"
                            : "text-foreground",
                        )}
                      >
                        {deliveryCharge === 0 || isFreeDeliveryApplied
                          ? "Free"
                          : formatPrice(deliveryCharge)}
                      </span>
                    </div>

                    {/* Delivery Progress Bar */}
                    {(() => {
                      const freeThreshold =
                        pricingSettings.deliveryThresholds?.find(
                          (t: any) => t.charge === 0,
                        )?.minAmount;
                      if (freeThreshold && subtotal < freeThreshold) {
                        const progress = (subtotal / freeThreshold) * 100;
                        const remaining = freeThreshold - subtotal;
                        return (
                          <div className="pt-1">
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-muted-foreground">
                                Add {formatPrice(remaining)} for free delivery
                              </span>
                              <span className="font-medium text-primary">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                              <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {pricingSettings?.isPackingEnabled && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Packing Charge
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPrice(packingCharge)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  {!appliedCoupon ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="coupon"
                          className="text-xs font-semibold text-muted-foreground ml-1"
                        >
                          Have a coupon?
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="coupon"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Enter code"
                              className={cn(
                                "pl-9 uppercase",
                                couponError && "border-destructive",
                              )}
                            />
                          </div>
                          <Button
                            id="apply-coupon-btn"
                            type="button"
                            variant="secondary"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode}
                          >
                            {isApplyingCoupon ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-[10px] text-destructive ml-1">
                            {couponError}
                          </p>
                        )}
                      </div>

                      {/* Available Offers Discovery */}
                      {activeCoupons.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center gap-2 mb-3">
                            <Gift className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                              Available Offers
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {activeCoupons.map((coupon) => (
                              <button
                                key={coupon._id}
                                type="button"
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                  setTimeout(() => {
                                    document
                                      .getElementById("apply-coupon-btn")
                                      ?.click();
                                  }, 50);
                                }}
                                className="w-full text-left p-2.5 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all group flex items-center justify-between outline-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-black text-primary font-mono lowercase">
                                      {coupon.code}
                                    </span>
                                    <span className="text-[10px] font-bold py-0.5 px-1.5 bg-primary/10 text-primary rounded-md">
                                      {coupon.type === "percentage"
                                        ? `${coupon.value}% OFF`
                                        : `₹${coupon.value} OFF`}
                                    </span>
                                  </div>
                                  {coupon.description && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                      {coupon.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <Ticket className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-700 uppercase">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[10px] text-green-600">
                            {isFreeDeliveryApplied
                              ? "Delivery charge waived"
                              : `-${formatPrice(appliedCoupon.discount)} discount applied`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeCoupon}
                        className="h-8 w-8 text-green-700 hover:bg-green-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">
                      Total Amount
                    </span>
                    <span className="text-2xl font-black text-primary">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div
                  className={cn(
                    "flex gap-3 p-4 rounded-xl border transition-all duration-300",
                    isApproved
                      ? "bg-primary/5 border-primary/20 shadow-inner"
                      : "bg-muted/50 border-border",
                  )}
                >
                  <div className="pt-0.5">
                    <Checkbox
                      id="approval"
                      checked={isApproved}
                      onCheckedChange={(checked) =>
                        setIsApproved(checked as boolean)
                      }
                      className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                  <Label
                    htmlFor="approval"
                    className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none font-medium"
                  >
                    I have reviewed and I approve the{" "}
                    <strong className="text-foreground">uploaded files</strong>,{" "}
                    <strong className="text-foreground">page count</strong>, and{" "}
                    <strong className="text-foreground">
                      print specifications
                    </strong>{" "}
                    for this order.
                  </Label>
                </div>

                <Button
                  className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !isApproved}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatPrice(finalTotal)}`
                  )}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/30">
                  <ShieldCheck className="h-4 w-4 text-green-500 mb-1" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                    Secure Payment
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/30">
                  <CheckCircle2 className="h-4 w-4 text-primary mb-1" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                    Quality Guarantee
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/30">
                  <Truck className="h-4 w-4 text-blue-500 mb-1" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-muted-foreground mt-4 px-4">
              By placing this order, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>

      <PrintableOrderSummary
        innerRef={componentRef}
        orderItems={orderItems}
        deliveryInfo={deliveryInfo}
        total={total}
      />

      {/* Navigation */}
      <div className="mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Configure
        </Button>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setPreviewFile(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            <h3 className="text-lg font-semibold mb-4">File Preview</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{previewFile.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(previewFile.file.size)} •{" "}
                    {previewFile.file.pageCount} pages
                  </p>
                </div>
              </div>

              {previewFile.file.type.startsWith("image/") ||
              previewFile.file.type === "application/pdf" ||
              previewFile.file.name.toLowerCase().endsWith(".pdf") ? (
                <div className="border border-border rounded-xl overflow-hidden bg-muted/20 shadow-inner relative group">
                  {previewFile.file.type.startsWith("image/") &&
                  !previewFile.file.name.toLowerCase().endsWith(".pdf") ? (
                    <Image
                      src={previewFile.file.previewUrl}
                      alt={previewFile.file.name}
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-[600px] object-contain mx-auto transition-transform group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div className="relative h-[600px] w-full bg-white">
                      <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <iframe
                        src={previewFile.file.previewUrl}
                        className="w-full h-full border-none"
                        title={previewFile.file.name}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-border border-dashed rounded-xl p-16 text-center bg-muted/30">
                  <FileText className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground font-semibold text-lg">
                    Preview Generates on Printing
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                    A full preview of {previewFile.file.name} will be available
                    in the final print set.
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">Print Configuration</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Print Type:</span>
                    <span className="capitalize">
                      {previewFile.configuration.printType.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper Size:</span>
                    <span className="uppercase">
                      {previewFile.configuration.paperSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper Type:</span>
                    <span className="capitalize">
                      {previewFile.configuration.paperType.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GSM:</span>
                    <span>{previewFile.configuration.gsm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Print Side:</span>
                    <span className="capitalize">
                      {previewFile.configuration.printSide.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Copies:</span>
                    <span>{previewFile.configuration.copies}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
