import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/order-api";
import { downloadShippingLabel } from "@/lib/pdf-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MarkAsShippedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}

export function MarkAsShippedDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: MarkAsShippedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState("");
  const [courier, setCourier] = useState("");
  const [size, setSize] = useState("4x6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb || !courier) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // 1. Update status to shipped
      const statusRes = await updateOrderStatus(orderId, {
        status: "shipped",
        trackingNumber: awb,
        notes: `Shipped via ${courier} (AWB: ${awb})`,
      });

      if (!statusRes.success) {
        throw new Error("Failed to update order status");
      }

      toast.success("Order marked as shipped");

      // 2. Generate and download label
      await downloadShippingLabel(orderId, { awb, courier, size });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error marking as shipped:", error);
      toast.error("Failed to mark as shipped");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark as Shipped</DialogTitle>
          <DialogDescription>
            Enter shipping details to generate the label and update order
            status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="awb" className="text-right">
              AWB / Tracking
            </Label>
            <Input
              id="awb"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              className="col-span-3"
              placeholder="Ex: 123456789"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courier" className="text-right">
              Courier
            </Label>
            <Input
              id="courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="col-span-3"
              placeholder="Ex: BlueDart, Delhivery"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">
              Label Size
            </Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4x6">4" x 6" (Standard)</SelectItem>
                <SelectItem value="4x4">4" x 4"</SelectItem>
                <SelectItem value="4x2">4" x 2"</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm & Download Label
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
