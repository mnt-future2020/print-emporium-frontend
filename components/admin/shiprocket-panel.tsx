"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Truck,
  Send,
  PackageCheck,
  CalendarClock,
  FileText,
  RefreshCw,
  ExternalLink,
  Star,
  Plane,
  Ship,
  MapPin,
  Weight,
  IndianRupee,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  pushOrderToShiprocket,
  assignOrderAwb,
  getOrderCouriers,
  schedulePickup,
  trackOrder,
  fetchLabel,
  type TrackingResponse,
  type TrackingActivity,
  type ShiprocketCourier,
  type OrderCouriersResult,
} from "@/lib/shiprocket-api";

interface ShiprocketMetaShape {
  orderId?: string | null;
  shipmentId?: string | null;
  awbCode?: string | null;
  courierId?: number | null;
  courierName?: string | null;
  labelUrl?: string | null;
  lastStatus?: string | null;
  lastStatusAt?: string | null;
  lastSyncedAt?: string | null;
}

interface OrderShape {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber?: string | null;
  shiprocket?: ShiprocketMetaShape;
}

interface Props {
  order: OrderShape;
  onUpdated: () => void;
}

type ActionKey = "push" | "awb" | "pickup" | "label" | "track" | null;

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const errMsg = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message || fallback;
};

export function ShiprocketPanel({ order, onUpdated }: Props) {
  const sr = order.shiprocket || {};
  const [busy, setBusy] = useState<ActionKey>(null);
  const [tracking, setTracking] = useState<TrackingResponse["tracking"] | null>(null);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [couriers, setCouriers] = useState<ShiprocketCourier[]>([]);
  const [courierContext, setCourierContext] = useState<OrderCouriersResult["context"] | null>(null);
  const [recommendedId, setRecommendedId] = useState<number | null>(null);
  const [assigningCourierId, setAssigningCourierId] = useState<number | null>(null);

  const run = async <T,>(key: ActionKey, fn: () => Promise<T>, successMsg: string) => {
    if (busy) return;
    setBusy(key);
    const toastId = toast.loading(`${successMsg}...`);
    try {
      await fn();
      toast.success(successMsg, { id: toastId });
      onUpdated();
    } catch (err) {
      toast.error(errMsg(err, "Shiprocket request failed"), { id: toastId });
    } finally {
      setBusy(null);
    }
  };

  const handlePush = () => run("push", () => pushOrderToShiprocket(order._id), "Order pushed to Shiprocket");
  const handleAwb = () => run("awb", () => assignOrderAwb(order._id), "AWB assigned");
  const handlePickup = () => run("pickup", () => schedulePickup(order._id), "Pickup scheduled");

  const openCourierModal = async () => {
    setCourierModalOpen(true);
    setCouriersLoading(true);
    setCouriers([]);
    setCourierContext(null);
    setRecommendedId(null);
    try {
      const result = await getOrderCouriers(order._id);
      setCouriers(result.couriers || []);
      setCourierContext(result.context || null);
      setRecommendedId(result.recommendedId ?? null);
      if (!result.couriers?.length) {
        toast.error("No serviceable couriers for this pincode");
      }
    } catch (err) {
      toast.error(errMsg(err, "Failed to load couriers"));
      setCourierModalOpen(false);
    } finally {
      setCouriersLoading(false);
    }
  };

  const handleSelectCourier = async (courier: ShiprocketCourier) => {
    if (assigningCourierId) return;
    setAssigningCourierId(courier.courier_company_id);
    const toastId = toast.loading(`Assigning ${courier.courier_name}...`);
    try {
      await assignOrderAwb(order._id, courier.courier_company_id);
      toast.success(`AWB assigned via ${courier.courier_name}`, { id: toastId });
      setCourierModalOpen(false);
      onUpdated();
    } catch (err) {
      toast.error(errMsg(err, "Failed to assign AWB"), { id: toastId });
    } finally {
      setAssigningCourierId(null);
    }
  };

  const handleLabel = async () => {
    if (busy) return;
    setBusy("label");
    const toastId = toast.loading("Generating label...");
    try {
      const result = await fetchLabel(order._id);
      if (result.labelUrl) {
        window.open(result.labelUrl, "_blank", "noopener,noreferrer");
        toast.success("Label opened", { id: toastId });
        onUpdated();
      } else {
        toast.error("No label URL returned", { id: toastId });
      }
    } catch (err) {
      toast.error(errMsg(err, "Failed to generate label"), { id: toastId });
    } finally {
      setBusy(null);
    }
  };

  const handleTrack = async () => {
    if (busy) return;
    setBusy("track");
    const toastId = toast.loading("Fetching tracking...");
    try {
      const result = await trackOrder(order._id);
      setTracking(result.tracking || null);
      toast.success("Tracking refreshed", { id: toastId });
      onUpdated();
    } catch (err) {
      toast.error(errMsg(err, "Failed to fetch tracking"), { id: toastId });
    } finally {
      setBusy(null);
    }
  };

  const isPaid = order.paymentStatus === "paid";
  const canPush = isPaid && order.status === "printing";
  const hasShipment = !!sr.shipmentId;
  const hasAwb = !!sr.awbCode;
  const activities: TrackingActivity[] = tracking?.shipment_track_activities || [];

  // Step progress: 1=Push 2=AWB 3=Pickup 4=Done
  const currentStep = !hasShipment ? 1 : !hasAwb ? 2 : 3;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          Shiprocket
        </h3>
        {sr.lastStatus && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {sr.lastStatus}
          </span>
        )}
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-1">
        {[
          { step: 1, label: "Push" },
          { step: 2, label: "AWB" },
          { step: 3, label: "Pickup" },
        ].map((s, i) => (
          <div key={s.step} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  currentStep > s.step
                    ? "bg-green-500 text-white"
                    : currentStep === s.step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > s.step ? "✓" : s.step}
              </div>
              <span className={`text-[10px] font-medium ${
                currentStep >= s.step ? "text-foreground" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-px flex-1 mx-1 ${
                currentStep > s.step ? "bg-green-500" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Meta — compact grid */}
      {(sr.orderId || sr.awbCode) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs p-3 rounded-md bg-muted/30">
          {sr.awbCode && <Meta label="AWB" value={sr.awbCode} mono />}
          {sr.courierName && <Meta label="Courier" value={sr.courierName} />}
          {sr.orderId && <Meta label="SR Order" value={sr.orderId} mono />}
          {sr.shipmentId && <Meta label="Shipment" value={sr.shipmentId} mono />}
          {sr.lastSyncedAt && <Meta label="Synced" value={fmtDate(sr.lastSyncedAt)} />}
        </div>
      )}

      {/* Current Action — prominent single CTA based on current step */}
      <div className="space-y-2">
        {!hasShipment && (
          <>
            <Button
              size="sm"
              className="w-full"
              onClick={handlePush}
              disabled={!canPush || busy === "push"}
            >
              {busy === "push" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Push to Shiprocket
            </Button>
            {!canPush && (
              <p className="text-[11px] text-muted-foreground text-center">
                Requires paid + printing status
              </p>
            )}
          </>
        )}

        {hasShipment && !hasAwb && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={openCourierModal}
              disabled={!!busy || couriersLoading}
            >
              {couriersLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PackageCheck className="h-4 w-4 mr-2" />}
              Select Courier
            </Button>
            <Button size="sm" variant="outline" onClick={handleAwb} disabled={busy === "awb"}>
              {busy === "awb" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PackageCheck className="h-4 w-4 mr-2" />}
              Auto
            </Button>
          </div>
        )}

        {hasShipment && hasAwb && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handlePickup} disabled={busy === "pickup"}>
              {busy === "pickup" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-2" />}
              Schedule Pickup
            </Button>
            <Button size="sm" variant="outline" onClick={handleLabel} disabled={busy === "label"}>
              {busy === "label" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Label
            </Button>
            <Button size="sm" variant="outline" onClick={handleTrack} disabled={busy === "track"}>
              {busy === "track" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            </Button>
          </div>
        )}
      </div>

      {/* Courier selection */}
      <CourierSelectionDialog
        open={courierModalOpen}
        onOpenChange={setCourierModalOpen}
        couriers={couriers}
        context={courierContext}
        recommendedId={recommendedId}
        loading={couriersLoading}
        assigningCourierId={assigningCourierId}
        onSelect={handleSelectCourier}
      />

      {/* Tracking timeline */}
      {activities.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tracking timeline
            </p>
            {tracking?.track_url && (
              <a
                href={tracking.track_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
              >
                Open on Shiprocket <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {activities.map((a, i) => (
              <div key={i} className="text-xs flex gap-3">
                <span className="text-muted-foreground whitespace-nowrap shrink-0">
                  {fmtDate(a.date)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.activity || a.status || "—"}</p>
                  {a.location && (
                    <p className="text-muted-foreground truncate">{a.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`truncate font-medium ${mono ? "font-mono" : ""}`} title={value}>
        {value}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
//  Courier Selection Dialog (Shiprocket-style)
// ──────────────────────────────────────────────────────────────

type CourierTab = "recommended" | "air" | "surface" | "all";

const inferCourierType = (name: string): "air" | "surface" => {
  const lower = name.toLowerCase();
  if (lower.includes("air") || lower.includes("express") || lower.includes("priority")) return "air";
  return "surface";
};

const fmtPickup = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

function CourierSelectionDialog({
  open,
  onOpenChange,
  couriers,
  context,
  recommendedId,
  loading,
  assigningCourierId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  couriers: ShiprocketCourier[];
  context: OrderCouriersResult["context"] | null;
  recommendedId: number | null;
  loading: boolean;
  assigningCourierId: number | null;
  onSelect: (c: ShiprocketCourier) => void;
}) {
  const [tab, setTab] = useState<CourierTab>("all");

  const withType = couriers.map((c) => ({
    ...c,
    _type: inferCourierType(c.courier_name),
    _isRecommended: recommendedId ? c.courier_company_id === recommendedId : false,
  }));

  const recommended = withType.filter(
    (c) => c._isRecommended || (c.rating != null && c.rating >= 4.0),
  );
  const air = withType.filter((c) => c._type === "air");
  const surface = withType.filter((c) => c._type === "surface");

  const filtered =
    tab === "recommended" && recommended.length > 0
      ? recommended
      : tab === "air"
        ? air
        : tab === "surface"
          ? surface
          : withType;

  const cheapestRate = withType.length > 0 ? Math.min(...withType.map((c) => courierTotal(c))) : 0;
  const pickupLabel = fmtPickup();

  const tabs: { key: CourierTab; label: string; count: number }[] = [
    { key: "recommended", label: "Recommended", count: recommended.length },
    { key: "air", label: "Air", count: air.length },
    { key: "surface", label: "Surface", count: surface.length },
    { key: "all", label: "All", count: couriers.length },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] p-0 gap-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-xl">Select Courier Partner</DialogTitle>
          {context && (
            <div className="flex flex-wrap gap-4 pt-2">
              <ContextChip icon={MapPin} label="Deliver To" value={context.deliveryPincode} />
              <ContextChip icon={Weight} label="Weight" value={`${context.weightKg} kg`} />
              <ContextChip icon={IndianRupee} label="Order Value" value={`₹${context.orderValue.toLocaleString()}`} />
              <ContextChip icon={Package} label="Payment" value="Prepaid" />
            </div>
          )}
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-[10px] font-semibold bg-muted rounded-full px-1.5 py-0.5">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No {tab !== "all" ? tab : ""} couriers found for this pincode.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Best performing info banner */}
              {tab === "recommended" && recommended.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground mb-2">
                  <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold">Best performing couriers</span> — selected based on
                    delivery performance and rating for this pincode.
                  </p>
                </div>
              )}

              {/* Table header */}
              <div className="grid grid-cols-[1fr_60px_90px_90px_80px_80px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <span>Courier Partner</span>
                <span className="text-center">Rating</span>
                <span>Pickup</span>
                <span>Est. Delivery</span>
                <span className="text-right">Charges</span>
                <span className="text-right">Action</span>
              </div>

              {/* Courier rows */}
              {filtered.map((c) => {
                const isCheapest = courierTotal(c) === cheapestRate;
                const isRecommended = c._isRecommended;
                const ratingColor =
                  (c.rating || 0) >= 4
                    ? "bg-green-500"
                    : (c.rating || 0) >= 3
                      ? "bg-yellow-500"
                      : "bg-orange-500";

                return (
                  <div
                    key={c.courier_company_id}
                    className={`grid grid-cols-[1fr_60px_90px_90px_80px_80px] gap-2 items-center rounded-lg border p-3 transition-colors ${
                      isRecommended
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/20 hover:bg-muted/30"
                    }`}
                  >
                    {/* Courier info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-6 h-6 rounded bg-muted flex items-center justify-center">
                          {c._type === "air" ? (
                            <Plane className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Ship className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                            {c.courier_name}
                            {isRecommended && (
                              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                                Recommended
                              </span>
                            )}
                            {isCheapest && !isRecommended && (
                              <span className="shrink-0 rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-[9px] font-bold text-green-700 dark:text-green-300">
                                Cheapest
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {c._type.charAt(0).toUpperCase() + c._type.slice(1)}
                            {c.min_weight ? ` · Min: ${c.min_weight} kg` : c.charge_weight ? ` · ${c.charge_weight} kg` : ""}
                            {c.rto_charges ? ` · RTO: ₹${c.rto_charges}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex justify-center">
                      {c.rating ? (
                        <div className={`w-8 h-8 rounded-full ${ratingColor} text-white flex items-center justify-center text-xs font-bold`}>
                          {c.rating.toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Pickup */}
                    <p className="text-xs text-muted-foreground">
                      {c.suppress_date || c.expected_pickup_date || pickupLabel}
                    </p>

                    {/* Delivery */}
                    <div>
                      <p className="text-xs font-medium">{c.etd || "—"}</p>
                      {c.estimated_delivery_days && (
                        <p className="text-[10px] text-muted-foreground">{c.estimated_delivery_days} days</p>
                      )}
                    </div>

                    {/* Rate */}
                    <ChargesCell courier={c} />

                    {/* Action */}
                    <div className="text-right">
                      <Button
                        size="sm"
                        className="h-8 text-xs px-3"
                        onClick={() => onSelect(c)}
                        disabled={assigningCourierId !== null}
                      >
                        {assigningCourierId === c.courier_company_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Ship Now"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground shrink-0">
            {filtered.length} courier{filtered.length > 1 ? "s" : ""} found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function courierTotal(c: ShiprocketCourier): number {
  return c.total_charges || c.rate;
}

function ChargesCell({ courier: c }: { courier: ShiprocketCourier }) {
  const total = courierTotal(c);
  const freight = Number(c.freight_charge) || 0;
  const hasBreakdown = freight > 0 && total > freight;

  const chargeLabels: Record<string, string> = {
    freight_charge: "Freight charges",
    freight_charges: "Freight charges",
    whatsapp_charge: "Notify Charges",
    whatsapp_charges: "Notify Charges",
    notify_charges: "Notify Charges",
    cod_charge: "COD charges",
    cod_charges: "COD charges",
    coverage_charge: "Coverage charges",
    coverage_charges: "Coverage charges",
    call_before_delivery_charges: "Call Before Delivery",
  };

  const charges: { label: string; amount: number }[] = [];
  for (const [key, val] of Object.entries(c)) {
    if ((key.endsWith("_charge") || key.endsWith("_charges")) && key !== "rto_charges" && key !== "total_charges") {
      const n = Number(val);
      if (n > 0) {
        const lowerKey = key.toLowerCase();
        const label = chargeLabels[lowerKey] || chargeLabels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
        charges.push({ label, amount: n });
      }
    }
  }

  return (
    <div className="text-right group relative">
      <p className="text-sm font-bold cursor-default">
        ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {hasBreakdown && charges.length > 1 && (
        <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block w-52 rounded-lg border border-border bg-popover p-3 shadow-lg text-xs space-y-1">
          {charges.map((ch) => (
            <div key={ch.label} className="flex justify-between">
              <span className="text-muted-foreground">{ch.label}</span>
              <span>₹{ch.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold pt-1 border-t border-border">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ContextChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
