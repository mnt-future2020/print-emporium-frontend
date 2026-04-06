"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Package,
  IndianRupee,
  Truck,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderByIdAdmin, Order } from "@/lib/order-api";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Download, ChevronDown, Printer } from "lucide-react";
import { downloadOrderSlip } from "@/lib/pdf-service";
import { MarkAsShippedDialog } from "@/components/admin/mark-as-shipped-dialog";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShippedDialogOpen, setIsShippedDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await getOrderByIdAdmin(id as string);
      if (res.success) {
        setOrder(res.order);
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSlip = async (size: string) => {
    if (!order) return;
    toast.promise(downloadOrderSlip(order._id, size), {
      loading: `Generating ${size} Order Slip...`,
      success: "Download started",
      error: "Failed to download",
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground animate-pulse">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    printing: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    shipped: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    delivered: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-600 border-green-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
    refunded: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <div className="p-8 mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Order #{order.orderNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Download PDF
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Order Slip</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleDownloadSlip("A4")}>
                    A4 Size
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadSlip("A3")}>
                    A3 Size
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadSlip("Letter")}
                  >
                    Letter Size
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* Add more download options here if needed, e.g. Invoice */}
            </DropdownMenuContent>
          </DropdownMenu>

          {(order.status === "processing" ||
            order.status === "printing" ||
            order.status === "confirmed") && (
            <Button onClick={() => setIsShippedDialogOpen(true)}>
              Mark as Shipped
            </Button>
          )}
        </div>
      </div>

      <MarkAsShippedDialog
        open={isShippedDialogOpen}
        onOpenChange={setIsShippedDialogOpen}
        orderId={order._id}
        onSuccess={fetchOrderDetails}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Summary */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-card to-muted/20">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Order Number
                </h3>
                <p className="text-2xl font-bold text-primary font-mono">
                  {order.orderNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${statusColors[order.status] || ""}`}
                  >
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Payment
                  </p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      paymentStatusColors[order.paymentStatus] || ""
                    }`}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Stats */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="hover:border-primary/50 transition-colors cursor-default border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Total Items
                    </p>
                    <p className="text-2xl font-bold">{order.items.length}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-default border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{order.pricing.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-default border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Order Date
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {order.estimatedDelivery && (
              <Card className="hover:border-primary/50 transition-colors cursor-default border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                        Est. Delivery
                      </p>
                      <p className="text-sm font-medium">
                        {format(
                          new Date(order.estimatedDelivery),
                          "MMM dd, yyyy",
                        )}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="border-border/50 shadow-lg border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Service
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Configuration
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Copies
                    </TableHead>
                    <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Price
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx} className="group hover:bg-muted/30">
                      <TableCell className="pl-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">
                            {item.serviceName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <span>
                            {item.configuration.paperSize} -{" "}
                            {item.configuration.paperType}
                          </span>
                          <span className="text-muted-foreground">
                            {item.configuration.printType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.configuration.copies}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-semibold">
                        ₹{item.pricing.subtotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₹{order.pricing.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Delivery Charge
                </span>
                <span className="font-medium">
                  ₹{order.pricing.deliveryCharge.toLocaleString()}
                </span>
              </div>
              {order.pricing.packingCharge > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Packing Charge
                  </span>
                  <span className="font-medium">
                    ₹{order.pricing.packingCharge.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-t-2 border-border">
                <span className="font-bold">Total</span>
                <span className="text-lg font-bold text-primary">
                  ₹{order.pricing.total.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Recipient Name
                  </p>
                  <p className="font-medium">{order.deliveryInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Phone
                  </p>
                  <p className="font-medium">{order.deliveryInfo.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                  Address
                </p>
                <p className="text-sm">
                  {order.deliveryInfo.address}, {order.deliveryInfo.city},{" "}
                  {order.deliveryInfo.state} {order.deliveryInfo.pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Payment Method
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {order.paymentMethod}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Payment Status
                  </p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      paymentStatusColors[order.paymentStatus] || ""
                    }`}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              {order.paymentId && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm">{order.paymentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {order.notes && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
