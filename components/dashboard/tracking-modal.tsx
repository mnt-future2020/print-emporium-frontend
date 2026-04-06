"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Loader2 } from "lucide-react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (trackingNumber: string) => void;
  isLoading?: boolean;
  orderNumber?: string;
  initialValue?: string;
}

export function TrackingModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  orderNumber,
  initialValue = "",
}: TrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setTrackingNumber(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(trackingNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Shipping Information
          </DialogTitle>
          <DialogDescription>
            Enter the tracking number for order {orderNumber ? ` #${orderNumber}` : ""}.
            This will be included in the shipment notification email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              placeholder="e.g. 1234567890"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !trackingNumber.trim()}
              className="flex-1 sm:flex-none"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update & Notify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
