"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, RefreshCw, ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";
import { trackOrder, type TrackingResponse, type TrackingActivity } from "@/lib/shiprocket-api";

interface Props {
  orderId: string;
  awb?: string | null;
  courierName?: string | null;
  lastStatus?: string | null;
}

const fmt = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export function CustomerTracking({ orderId, awb, courierName, lastStatus }: Props) {
  const [tracking, setTracking] = useState<TrackingResponse["tracking"] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async (notifyOnError = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await trackOrder(orderId);
      setTracking(result.tracking || null);
    } catch (err) {
      if (notifyOnError) {
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e?.response?.data?.message || "Failed to fetch tracking");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch once on mount if we have an AWB
  useEffect(() => {
    if (awb) fetchTracking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, awb]);

  if (!awb) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
        <Truck className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Your order will be picked up by a courier soon — tracking details will appear here.
        </p>
      </div>
    );
  }

  const activities: TrackingActivity[] = tracking?.shipment_track_activities || [];
  const headline = tracking?.shipment_track?.[0]?.current_status || lastStatus || "In transit";
  const courier = tracking?.shipment_track?.[0]?.courier_name || courierName;
  const etd = tracking?.etd;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          Shipment Tracking
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fetchTracking(true)}
          disabled={loading}
          className="h-8 px-2"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">AWB</p>
          <p className="font-mono font-medium truncate" title={awb}>{awb}</p>
        </div>
        {courier && (
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Courier</p>
            <p className="font-medium truncate">{courier}</p>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
          <p className="font-medium truncate">{headline}</p>
        </div>
        {etd && (
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ETD</p>
            <p className="font-medium truncate">{etd}</p>
          </div>
        )}
      </div>

      {tracking?.track_url && (
        <a
          href={tracking.track_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Track on courier site <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {activities.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Recent updates
          </p>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {activities.map((a, i) => (
              <div key={i} className="text-xs flex gap-3">
                <span className="text-muted-foreground whitespace-nowrap shrink-0">
                  {fmt(a.date)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.activity || a.status || "—"}</p>
                  {a.location && (
                    <p className="text-muted-foreground inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {a.location}
                    </p>
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
