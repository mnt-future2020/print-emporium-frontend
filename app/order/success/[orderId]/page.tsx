"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Download,
  Truck,
  MapPin,
  CreditCard,
  Loader2,
  ArrowRight,
  Copy,
  Home,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getOrderById,
  downloadInvoice,
  type Order,
} from "@/lib/order-api";
import { formatPrice } from "@/lib/pricing-utils";
import { cn } from "@/lib/utils";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  razorpay: "Razorpay",
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
  cardless_emi: "Cardless EMI",
  paylater: "Pay Later",
  bank_transfer: "Bank Transfer",
  online: "Online Payment",
  cod: "Cash on Delivery",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatConfig(cfg: Order["items"][number]["configuration"]) {
  const parts: string[] = [];
  if (cfg.printType) parts.push(cfg.printType.replace(/-/g, " "));
  if (cfg.paperSize) parts.push(cfg.paperSize.toUpperCase());
  if (cfg.paperType) parts.push(cfg.paperType.replace(/-/g, " "));
  if (cfg.gsm) parts.push(`${cfg.gsm} GSM`);
  if (cfg.printSide) parts.push(cfg.printSide.replace(/-/g, " "));
  if (cfg.bindingOption && cfg.bindingOption !== "none") {
    parts.push(cfg.bindingOption.replace(/-/g, " "));
  }
  return parts.join(" · ");
}

interface BreakdownRow {
  label: string;
  amount: number;
  unit: "page" | "copy";
  negative?: boolean;
}

function buildItemBreakdown(
  item: Order["items"][number],
): BreakdownRow[] {
  const p = item.pricing;
  const cfg = item.configuration;
  const rows: BreakdownRow[] = [];

  if (p.basePricePerPage) {
    rows.push({
      label: "Base price",
      amount: p.basePricePerPage,
      unit: "page",
    });
  }
  if (p.printTypePrice) {
    rows.push({
      label: `Print type (${cfg.printType.replace(/-/g, " ")})`,
      amount: Math.abs(p.printTypePrice),
      unit: p.printTypeIsPerCopy ? "copy" : "page",
      negative: p.printTypePrice < 0,
    });
  }
  if (p.paperSizePrice) {
    rows.push({
      label: `Paper size (${cfg.paperSize.toUpperCase()})`,
      amount: Math.abs(p.paperSizePrice),
      unit: p.paperSizeIsPerCopy ? "copy" : "page",
      negative: p.paperSizePrice < 0,
    });
  }
  if (p.paperTypePrice) {
    rows.push({
      label: `Paper type (${cfg.paperType.replace(/-/g, " ")})`,
      amount: Math.abs(p.paperTypePrice),
      unit: p.paperTypeIsPerCopy ? "copy" : "page",
      negative: p.paperTypePrice < 0,
    });
  }
  if (p.gsmPrice) {
    rows.push({
      label: `GSM (${cfg.gsm})`,
      amount: Math.abs(p.gsmPrice),
      unit: p.gsmIsPerCopy ? "copy" : "page",
      negative: p.gsmPrice < 0,
    });
  }
  if (p.printSidePrice) {
    rows.push({
      label: `Print side (${cfg.printSide.replace(/-/g, " ")})`,
      amount: Math.abs(p.printSidePrice),
      unit: p.printSideIsPerCopy ? "copy" : "page",
      negative: p.printSidePrice < 0,
    });
  }
  if (p.bindingPrice) {
    rows.push({
      label: `Binding (${cfg.bindingOption.replace(/-/g, " ")})`,
      amount: Math.abs(p.bindingPrice),
      unit: p.bindingIsPerCopy ? "copy" : "page",
      negative: p.bindingPrice < 0,
    });
  }
  return rows;
}

export default function OrderSuccessPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await getOrderById(orderId);
      if (res.success) {
        setOrder(res.order);
      } else {
        setError("Order not found");
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Couldn't load your order. Please check your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // If payment hasn't reconciled yet, re-fetch once after a short delay
  useEffect(() => {
    if (!order) return;
    if (order.paymentStatus === "paid") return;
    const t = setTimeout(() => {
      void fetchOrder();
    }, 2500);
    return () => clearTimeout(t);
  }, [order, fetchOrder]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    if (order.paymentStatus !== "paid") {
      toast.info("Invoice will be available once payment is confirmed");
      return;
    }
    setInvoiceLoading(true);
    try {
      await downloadInvoice(order._id, order.orderNumber);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Couldn't download invoice right now",
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div>
          <h1 className="text-xl font-semibold">Couldn&apos;t load your order</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {error || "Try refreshing, or view it in your dashboard."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
          <Button asChild>
            <Link href="/dashboard?tab=orders">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const discount = order.pricing.discount || 0;
  const couponCode = order.pricing.couponCode;
  const paymentLabel =
    PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Success banner */}
      <div
        className={cn(
          "rounded-2xl border p-6 sm:p-8 text-center relative overflow-hidden",
          isPaid
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200",
        )}
      >
        <div
          className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
            isPaid ? "bg-green-500" : "bg-amber-500",
          )}
        >
          {isPaid ? (
            <CheckCircle2 className="h-9 w-9 text-white" />
          ) : (
            <Loader2 className="h-9 w-9 text-white animate-spin" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {isPaid ? "Payment Successful!" : "Confirming your payment…"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {isPaid
            ? "Thank you — your order has been placed and will be processed shortly."
            : "This usually takes a few seconds. We'll refresh automatically."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-background/70 backdrop-blur rounded-lg px-3 py-1.5 border border-border/50">
          <span className="text-xs text-muted-foreground">Order</span>
          <span className="font-mono font-semibold text-sm">
            {order.orderNumber}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(order.orderNumber, "Order number")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy order number"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="sm:mt-0.5">
              <Badge
                className={cn(
                  "capitalize",
                  isPaid
                    ? "bg-green-500/10 text-green-700 border-green-500/20"
                    : "bg-amber-500/10 text-amber-700 border-amber-500/20",
                )}
                variant="outline"
              >
                {order.paymentStatus}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">Method</dt>
            <dd className="sm:mt-0.5 font-medium">{paymentLabel}</dd>
          </div>
          {order.paymentId && (
            <div className="flex justify-between sm:block sm:col-span-2">
              <dt className="text-muted-foreground">Transaction / Reference</dt>
              <dd className="sm:mt-0.5 flex items-center gap-2 font-mono text-xs sm:text-sm break-all">
                {order.paymentId}
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(order.paymentId as string, "Transaction ID")
                  }
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Copy transaction id"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </dd>
            </div>
          )}
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">Placed on</dt>
            <dd className="sm:mt-0.5">{formatDate(order.createdAt)}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">Order Status</dt>
            <dd className="sm:mt-0.5 capitalize font-medium">{order.status}</dd>
          </div>
        </dl>
      </div>

      {/* Items — with detailed per-item breakdown */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          Items ({order.items.length})
        </h2>
        <ul className="space-y-5 divide-y divide-border/60">
          {order.items.map((item, idx) => {
            const rows = buildItemBreakdown(item);
            return (
              <li key={idx} className="pt-5 first:pt-0">
                {/* Header: file + service + item total */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{item.fileName}</p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase tracking-wider shrink-0"
                      >
                        {item.serviceName}
                      </Badge>
                    </div>
                    {formatConfig(item.configuration) && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {formatConfig(item.configuration)}
                      </p>
                    )}
                  </div>
                  <div className="text-right font-semibold whitespace-nowrap">
                    {formatPrice(item.pricing.subtotal)}
                  </div>
                </div>

                {/* Per-item price composition */}
                <div className="mt-3 rounded-lg bg-muted/40 border border-border/40 p-3 text-xs">
                  <dl className="space-y-1.5">
                    {rows.map((r, ri) => (
                      <div
                        key={ri}
                        className={cn(
                          "flex justify-between gap-2",
                          r.negative && "text-green-700",
                        )}
                      >
                        <dt className="text-muted-foreground capitalize">
                          {r.label}
                        </dt>
                        <dd className="font-mono tabular-nums whitespace-nowrap">
                          {r.negative ? "−" : "+"}
                          {formatPrice(r.amount)}/{r.unit}
                        </dd>
                      </div>
                    ))}

                    <div className="flex justify-between gap-2 pt-2 mt-1 border-t border-border/40">
                      <dt className="text-muted-foreground">Price per page</dt>
                      <dd className="font-mono tabular-nums font-medium">
                        {formatPrice(item.pricing.pricePerPage)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Pages × Copies</dt>
                      <dd className="font-mono tabular-nums">
                        {item.pricing.totalPages} × {item.pricing.copies}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pt-2 mt-1 border-t border-border/40 text-foreground">
                      <dt className="font-medium">Item total</dt>
                      <dd className="font-mono tabular-nums font-semibold">
                        {formatPrice(item.pricing.subtotal)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Overall price breakdown */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h2 className="font-semibold mb-4">Price Breakdown</h2>
        <dl className="space-y-2 text-sm">
          {/* Item-by-item subtotals */}
          {order.items.length > 1 && (
            <div className="pb-2 mb-1 border-b border-border/50 space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground truncate">
                    <span className="text-xs mr-1.5">{idx + 1}.</span>
                    {item.fileName}
                  </dt>
                  <dd className="font-mono tabular-nums whitespace-nowrap">
                    {formatPrice(item.pricing.subtotal)}
                  </dd>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Items subtotal
              {order.items.length > 1 ? ` (${order.items.length} items)` : ""}
            </dt>
            <dd className="font-mono tabular-nums">
              {formatPrice(order.pricing.subtotal)}
            </dd>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>
                Discount
                {couponCode ? (
                  <span className="ml-1 text-xs text-green-700/80">
                    (code: <span className="font-mono">{couponCode}</span>)
                  </span>
                ) : null}
              </dt>
              <dd className="font-mono tabular-nums">
                − {formatPrice(discount)}
              </dd>
            </div>
          )}

          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery charge</dt>
            <dd className="font-mono tabular-nums">
              {order.pricing.deliveryCharge > 0 ? (
                formatPrice(order.pricing.deliveryCharge)
              ) : (
                <span className="text-green-700 font-sans">Free</span>
              )}
            </dd>
          </div>

          {order.pricing.packingCharge > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Packing charge</dt>
              <dd className="font-mono tabular-nums">
                {formatPrice(order.pricing.packingCharge)}
              </dd>
            </div>
          )}

          {/* Pre-tax summary row (informational) */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 mt-1 border-t border-border/40">
            <dt>You saved</dt>
            <dd className="font-mono tabular-nums">
              {discount > 0 ? formatPrice(discount) : formatPrice(0)}
            </dd>
          </div>

          <div className="flex justify-between pt-3 mt-2 border-t border-border text-base font-semibold">
            <dt>Total Paid</dt>
            <dd className="text-primary font-mono tabular-nums">
              {formatPrice(order.pricing.total)}
            </dd>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            All prices are inclusive of applicable taxes. GST (if any) is
            included in item prices.
          </p>
        </dl>
      </div>

      {/* Delivery info */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-primary" />
          Shipping to
        </h2>
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{order.deliveryInfo.fullName}</p>
          <p className="text-muted-foreground">
            {order.deliveryInfo.doorNumber
              ? `${order.deliveryInfo.doorNumber}, `
              : ""}
            {order.deliveryInfo.address}
            {order.deliveryInfo.landmark
              ? `, ${order.deliveryInfo.landmark}`
              : ""}
          </p>
          <p className="text-muted-foreground">
            {order.deliveryInfo.city}, {order.deliveryInfo.state} —{" "}
            {order.deliveryInfo.pincode}
          </p>
          <p className="text-muted-foreground mt-1">
            {order.deliveryInfo.phone} · {order.deliveryInfo.email}
          </p>
          {order.deliveryInfo.scheduleDelivery &&
            order.deliveryInfo.scheduledDate && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs bg-primary/5 text-primary px-2 py-1 rounded-md">
                <Truck className="h-3.5 w-3.5" />
                Scheduled for{" "}
                {new Date(order.deliveryInfo.scheduledDate).toLocaleDateString(
                  "en-IN",
                  { day: "2-digit", month: "short", year: "numeric" },
                )}
              </p>
            )}
        </div>
      </div>

      {/* Next steps / actions */}
      <div className="bg-muted/30 rounded-xl border border-border p-5 sm:p-6">
        <h2 className="font-semibold mb-3">What&apos;s next?</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-5">
          <li>• We&apos;ll email a confirmation to {order.deliveryInfo.email}.</li>
          <li>
            • You can track your order status any time from your dashboard.
          </li>
          <li>• Download the invoice for your records below.</li>
        </ul>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Button
            onClick={handleDownloadInvoice}
            disabled={invoiceLoading || !isPaid}
            variant="default"
            className="gap-2"
          >
            {invoiceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Invoice
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/dashboard?tab=orders&order=${order._id}`}>
              <Truck className="h-4 w-4" />
              Track Order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/services">
              <Home className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
