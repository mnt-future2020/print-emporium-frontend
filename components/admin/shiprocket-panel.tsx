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
    try {
      const result = await getOrderCouriers(order._id);
      setCouriers(result.couriers || []);
      setCourierContext(result.context || null);
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
  const hasShipment = !!sr.shipmentId;
  const hasAwb = !!sr.awbCode;
  const activities: TrackingActivity[] = tracking?.shipment_track_activities || [];

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
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

      {/* Meta */}
      {(sr.orderId || sr.shipmentId || sr.awbCode) && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {sr.orderId && (
            <Meta label="SR Order ID" value={sr.orderId} mono />
          )}
          {sr.shipmentId && (
            <Meta label="Shipment ID" value={sr.shipmentId} mono />
          )}
          {sr.awbCode && (
            <Meta label="AWB" value={sr.awbCode} mono />
          )}
          {sr.courierName && (
            <Meta label="Courier" value={sr.courierName} />
          )}
          {sr.lastStatusAt && (
            <Meta label="Last status at" value={fmtDate(sr.lastStatusAt)} />
          )}
          {sr.lastSyncedAt && (
            <Meta label="Last synced" value={fmtDate(sr.lastSyncedAt)} />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!hasShipment && (
          <Button
            size="sm"
            variant="default"
            onClick={handlePush}
            disabled={!isPaid || busy === "push"}
            title={isPaid ? "Create the order on Shiprocket" : "Mark order as paid first"}
          >
            {busy === "push" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Push to Shiprocket
          </Button>
        )}

        {hasShipment && !hasAwb && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={openCourierModal}
              disabled={!!busy || couriersLoading}
            >
              {couriersLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PackageCheck className="h-4 w-4 mr-2" />
              )}
              Select Courier
            </Button>
            <Button size="sm" variant="outline" onClick={handleAwb} disabled={busy === "awb"}>
              {busy === "awb" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PackageCheck className="h-4 w-4 mr-2" />}
              Auto (cheapest)
            </Button>
          </>
        )}

        {hasShipment && hasAwb && (
          <Button size="sm" variant="outline" onClick={handlePickup} disabled={busy === "pickup"}>
            {busy === "pickup" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-2" />}
            Schedule Pickup
          </Button>
        )}

        {hasShipment && (
          <Button size="sm" variant="outline" onClick={handleLabel} disabled={busy === "label"}>
            {busy === "label" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {sr.labelUrl ? "Open Label" : "Generate Label"}
          </Button>
        )}

        {hasAwb && (
          <Button size="sm" variant="outline" onClick={handleTrack} disabled={busy === "track"}>
            {busy === "track" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Tracking
          </Button>
        )}
      </div>

      {!isPaid && !hasShipment && (
        <p className="text-xs text-muted-foreground">
          Order must be marked as paid before it can be pushed to Shiprocket.
        </p>
      )}

      {/* Courier selection */}
      <Dialog open={courierModalOpen} onOpenChange={setCourierModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Select Courier Partner</DialogTitle>
            <DialogDescription>
              {courierContext
                ? `To ${courierContext.deliveryPincode} · ${courierContext.weightKg} kg · order ₹${courierContext.orderValue.toLocaleString()}`
                : "Serviceable couriers for this order, cheapest first."}
            </DialogDescription>
          </DialogHeader>

          {couriersLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : couriers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No serviceable couriers found for this pincode.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {couriers.map((c, i) => (
                <div
                  key={c.courier_company_id}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                    i === 0 ? "border-primary/50 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="truncate">{c.courier_name}</span>
                      {i === 0 && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Cheapest
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.etd ? `ETD ${c.etd}` : null}
                      {c.etd && c.estimated_delivery_days ? " · " : null}
                      {c.estimated_delivery_days
                        ? `${c.estimated_delivery_days} days`
                        : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">₹{c.rate}</span>
                    <Button
                      size="sm"
                      onClick={() => handleSelectCourier(c)}
                      disabled={assigningCourierId !== null}
                    >
                      {assigningCourierId === c.courier_company_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Ship"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
