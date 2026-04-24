"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Calendar,
  RotateCcw,
  CreditCard as CreditCardIcon,
  Printer,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { TrackingModal } from "./tracking-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MarkAsShippedDialog } from "@/components/admin/mark-as-shipped-dialog";
import { downloadOrderSlip, downloadShippingLabel } from "@/lib/pdf-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  loadRazorpayScript,
  createPaymentOrder as createRazorpayOrder,
  verifyPayment,
} from "@/lib/payment-api";

interface OrderItem {
  serviceName: string;
  fileName?: string;
  pageCount?: number;
  file: {
    name: string;
    pageCount: number;
    filePublicId?: string;
    pdfPublicId?: string;
  };
  configuration: {
    printType: string;
    paperSize: string;
    paperType: string;
    gsm: number;
    printSide: string;
    copies: number;
    bindingOption?: string;
  };
  pricing: {
    pricePerPage: number;
    basePricePerPage?: number;
    pricePerCopy?: number;
    totalPages: number;
    copies: number;
    subtotal: number;
  };
  fileUrl?: string | null;
  pdfUrl?: string | null;
}

interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentId?: string;
  trackingNumber?: string;
  items: OrderItem[];
  deliveryInfo: {
    fullName: string;
    phone: string;
    email: string;
    doorNumber: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    deliveryNotes?: string;
    scheduleDelivery?: boolean;
    scheduledDate?: string;
  };
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    packingCharge: number;
    discount: number;
    total: number;
    couponCode?: string;
  };
  couponCode?: string;
  notes?: string;
  userId?: { name: string; email: string };
  createdAt: string;
  invoiceEmailSent?: boolean;
  estimatedDelivery?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface AxiosErrorShape {
  response?: { data?: { message?: string; error?: string } };
}

interface OrdersTabProps {
  user: { role: string; name?: string; email?: string };
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color:
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color:
      "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200",
  },
  printing: {
    label: "Printing",
    icon: Package,
    color:
      "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-destructive bg-destructive/10",
  },
};

export function OrdersTab({ user }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    id: string;
    status: string;
    orderNumber: string;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReordering, setIsReordering] = useState<string | null>(null);
  const [reorderConfirmOpen, setReorderConfirmOpen] = useState(false);
  const [reorderId, setReorderId] = useState<string | null>(null);

  // PDF & Shipping State
  const [markAsShippedOpen, setMarkAsShippedOpen] = useState(false);

  const handleDownloadOrderSlip = async (orderId: string, size: string) => {
    toast.info(`Generating ${size} Order Slip...`);
    const result = await downloadOrderSlip(orderId, size);
    if (result.success) {
      toast.success("Order Slip downloaded");
    } else {
      toast.error("Failed to download Order Slip");
    }
  };

  const handleReprintLabel = async (order: Order) => {
    if (!order.trackingNumber) {
      toast.error("No tracking number available");
      return;
    }
    toast.info("Generating Shipping Label...");
    const result = await downloadShippingLabel(order._id, {
      awb: order.trackingNumber,
      courier: "",
      size: "4x6",
    });
    if (result.success) {
      toast.success("Label downloaded");
    } else {
      toast.error("Failed to download Label");
    }
  };

  const isAdminOrEmployee = user.role === "admin" || user.role === "employee";

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = isAdminOrEmployee
        ? "/api/orders/admin/all"
        : "/api/orders/my-orders";
      const params: Record<string, string | number> = { page, limit: 10 };

      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const response = await axiosInstance.get(endpoint, { params });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch orders:", err);
      setError((err as AxiosErrorShape).response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o._id === orderId);

    if (newStatus === "shipped") {
      setStatusUpdateData({
        id: orderId,
        status: newStatus,
        orderNumber: order?.orderNumber || "",
      });
      setTrackingModalOpen(true);
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/api/orders/admin/${orderId}/status`,
        { status: newStatus },
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err: unknown) {
      console.error("Failed to update order status:", err);
      toast.error(
        (err as AxiosErrorShape).response?.data?.message || "Failed to update order status",
      );
    }
  };

  const handleTrackingConfirm = async (trackingNumber: string) => {
    if (!statusUpdateData) return;

    try {
      setIsUpdatingStatus(true);
      const response = await axiosInstance.put(
        `/api/orders/admin/${statusUpdateData.id}/status`,
        { status: statusUpdateData.status, trackingNumber },
      );

      if (response.data.success) {
        toast.success(
          `Order #${statusUpdateData.orderNumber} status updated to Shipped`,
        );
        setTrackingModalOpen(false);
        setStatusUpdateData(null);
        fetchOrders();
        if (selectedOrder?._id === statusUpdateData.id) {
          setSelectedOrder({
            ...selectedOrder,
            status: statusUpdateData.status,
            trackingNumber,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Failed to update order status:", err);
      toast.error(
        (err as AxiosErrorShape).response?.data?.message || "Failed to update order status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkCashPaid = async (order: { _id: string; orderNumber: string }) => {
    if (!confirm(`Mark order #${order.orderNumber} as paid by cash?`)) return;
    try {
      const response = await axiosInstance.put(
        `/api/orders/admin/${order._id}/status`,
        { paymentStatus: "paid", paymentMethod: "cash", status: "confirmed" },
      );
      if (response.data.success) {
        toast.success(`Order #${order.orderNumber} marked as paid (cash)`);
        fetchOrders();
        if (selectedOrder?._id === order._id) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: "paid", paymentMethod: "cash", status: "confirmed" });
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || "Failed to update payment status");
    }
  };

  const handleReorder = async (orderId: string) => {
    setReorderId(orderId);
    setReorderConfirmOpen(true);
  };

  const handleInitPayment = async (order: Order) => {
    try {
      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(
          "Failed to load payment gateway. Please retry from your order history.",
        );
        return;
      }

      // 2. Create Payment Order (Razorpay)
      const paymentOrder = await createRazorpayOrder(order._id || order.id!);
      if (!paymentOrder.success) {
        toast.error(
          "Failed to initiate payment. Please retry from your order history.",
        );
        return;
      }

      // 3. Open Checkout
      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Print Emporium",
        description: `Order #${order.orderNumber}`,
        order_id: paymentOrder.id,
        prefill: {
          name: order.deliveryInfo?.fullName,
          email: order.deliveryInfo?.email,
          contact: order.deliveryInfo?.phone,
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async function (paymentResponse: RazorpayResponse) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: order._id || order.id!,
            });

            if (verifyRes.success) {
              toast.success("Payment successful! Order confirmed.");
              fetchOrders();
              if (selectedOrder && selectedOrder._id === (order._id || order.id!)) {
                setSelectedOrder({ ...selectedOrder, paymentStatus: "paid" });
              }
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Verification error", error);
            toast.error("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled", {
              description:
                "You can retry payment anytime from your order history.",
            });
          },
        },
      };

      const paymentObject = new (window as unknown as { Razorpay: new (opts: object) => { open: () => void } }).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast.error("Failed to initiate payment gateway.");
    }
  };

  const confirmReorder = async () => {
    if (!reorderId) return;

    try {
      setIsReordering(reorderId);
      const response = await axiosInstance.post(
        `/api/orders/${reorderId}/reorder`,
      );

      if (response.data.success) {
        const orderData = response.data.order;
        toast.success("Reorder created! Please complete the payment.");
        handleInitPayment(orderData);
        fetchOrders();
      }
    } catch (err: unknown) {
      console.error("Failed to reorder:", err);
      toast.error((err as AxiosErrorShape).response?.data?.error || "Failed to reorder");
      fetchOrders();
    } finally {
      setIsReordering(null);
      setReorderId(null);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    if (order.paymentStatus !== "paid") {
      toast.error("Invoice can only be generated for paid orders");
      return;
    }

    try {
      toast.info("Generating invoice...");

      // Download invoice from backend
      const response = await axiosInstance.get(
        `/api/orders/${order._id}/invoice`,
        {
          responseType: "blob",
        },
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (err: unknown) {
      console.error("Failed to download invoice:", err);
      toast.error((err as AxiosErrorShape).response?.data?.error || "Failed to download invoice");
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchOrders}>Try Again</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isAdminOrEmployee ? "All Orders" : "My Orders"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdminOrEmployee
                ? "Manage and track all customer orders"
                : "View and track your order history"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="printing">Printing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p className="text-muted-foreground">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "You haven't placed any orders yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[
              order.status as keyof typeof statusConfig
            ] || {
              label: order.status,
              icon: Clock,
              color: "text-muted-foreground bg-muted",
            };
            const StatusIcon = statusInfo.icon;

            const isScheduled =
              order.deliveryInfo?.scheduleDelivery && order.estimatedDelivery;

            return (
              <Card
                key={order._id}
                className={cn(
                  "p-6 hover:shadow-md transition-shadow",
                  isScheduled && "border-2 border-primary/30 bg-primary/5",
                )}
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-foreground text-lg">
                          #{order.orderNumber}
                        </h3>
                        {isScheduled && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                            <Calendar className="h-3 w-3" />
                            Scheduled:{" "}
                            {new Date(
                              order.estimatedDelivery!,
                            ).toLocaleDateString()}
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusInfo.color,
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                          )}
                        >
                          {order.paymentStatus === "paid"
                            ? "Paid"
                            : "Pending Payment"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ordered on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                      {isAdminOrEmployee &&
                        order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus(order._id, value)
                            }
                          >
                            <SelectTrigger className="w-full sm:w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="printing">Printing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 sm:flex-initial"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {!isAdminOrEmployee && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReorder(order._id)}
                          disabled={isReordering === order._id}
                          className="flex-1 sm:flex-initial bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {isReordering === order._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Reorder
                        </Button>
                      )}
                      {!isAdminOrEmployee &&
                        order.paymentStatus !== "paid" &&
                        order.status !== "cancelled" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleInitPayment(order)}
                            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      {isAdminOrEmployee &&
                        order.paymentStatus !== "paid" &&
                        order.status !== "cancelled" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkCashPaid(order)}
                            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            Cash Paid
                          </Button>
                        )}
                    </div>
                  </div>

                  {/* Customer & Order Info Grid */}
                  {isAdminOrEmployee && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Customer
                        </p>
                        <p className="font-medium text-sm">
                          {order.deliveryInfo?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.deliveryInfo?.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Location
                        </p>
                        <p className="font-medium text-sm">
                          {order.deliveryInfo?.city || "N/A"},{" "}
                          {order.deliveryInfo?.state || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.deliveryInfo?.pincode || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Order Value
                        </p>
                        <div className="flex flex-col">
                          <p className="font-bold text-lg text-primary">
                            ₹{order.pricing?.total?.toFixed(2) || "0.00"}
                          </p>
                          {order.pricing?.discount > 0 && (
                            <span className="text-[10px] text-green-600 font-bold uppercase">
                              - ₹{order.pricing.discount.toFixed(2)} Off
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.items?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Items Summary */}
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item: OrderItem, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-3 bg-muted/40 rounded-lg border border-border/50 gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {item.serviceName || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.fileName || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                              {item.pageCount || 0} pages
                            </span>
                            <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                              {item.configuration?.copies || 1} copies
                            </span>
                          </div>
                          {isAdminOrEmployee && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <p className="text-[10px] text-muted-foreground/80 font-medium uppercase">
                                {item.configuration?.printType} •{" "}
                                {item.configuration?.paperSize} •{" "}
                                {item.configuration?.paperType}
                              </p>
                              <div className="flex gap-1">
                                {item.fileUrl && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-primary/10 text-primary">
                                    <Download className="h-2 w-2" />
                                    ORIGINAL
                                  </span>
                                )}
                                {item.pdfUrl && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-primary/10 text-primary">
                                    <FileText className="h-2 w-2" />
                                    PDF
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                          <span className="text-[10px] text-muted-foreground sm:hidden">Item Total</span>
                          <p className="font-bold text-primary">
                            ₹{item.pricing?.subtotal?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No items</p>
                    )}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>

                  {/* User View - Simple Summary */}
                  {!isAdminOrEmployee && (
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-muted-foreground">
                          {order.items?.length || 0} item(s)
                        </p>
                        <div className="flex flex-col items-end">
                          {order.pricing?.discount > 0 && (
                            <p className="text-[10px] font-bold text-green-600 line-through opacity-70">
                              ₹
                              {(
                                order.pricing.total + order.pricing.discount
                              ).toFixed(2)}
                            </p>
                          )}
                          <p className="font-bold text-xl text-primary">
                            ₹{order.pricing?.total?.toFixed(2) || "0.00"}
                          </p>
                          {order.pricing?.discount > 0 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                              Saved ₹{order.pricing.discount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    {selectedOrder.deliveryInfo?.scheduleDelivery &&
                      selectedOrder.estimatedDelivery && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-primary text-primary-foreground shrink-0">
                          <Calendar className="h-4 w-4" />
                          Scheduled Delivery
                        </span>
                      )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Admin PDF Actions */}
                  {isAdminOrEmployee && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Order Slip
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownloadOrderSlip(selectedOrder._id, "A4")
                            }
                          >
                            Download A4
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownloadOrderSlip(selectedOrder._id, "A3")
                            }
                          >
                            Download A3
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownloadOrderSlip(
                                selectedOrder._id,
                                "Letter",
                              )
                            }
                          >
                            Download Letter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {(selectedOrder.status === "processing" ||
                        selectedOrder.status === "printing" ||
                        selectedOrder.status === "confirmed") && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                          onClick={() => setMarkAsShippedOpen(true)}
                        >
                          <Truck className="h-4 w-4" />
                          Mark Shipped
                        </Button>
                      )}

                      {selectedOrder.status === "shipped" &&
                        selectedOrder.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleReprintLabel(selectedOrder)}
                          >
                            <Printer className="h-4 w-4" />
                            Label
                          </Button>
                        )}
                    </>
                  )}

                  {selectedOrder.paymentStatus === "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Invoice
                    </Button>
                  )}
                  {!isAdminOrEmployee &&
                    selectedOrder.paymentStatus !== "paid" &&
                    selectedOrder.status !== "cancelled" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleInitPayment(selectedOrder)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        <CreditCardIcon className="h-4 w-4" />
                        Complete Payment
                      </Button>
                    )}
                  {isAdminOrEmployee &&
                    selectedOrder.paymentStatus !== "paid" &&
                    selectedOrder.status !== "cancelled" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkCashPaid(selectedOrder)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      >
                        <CreditCardIcon className="h-4 w-4" />
                        Mark Paid (Cash)
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Order Status */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Status
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Order Status</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusConfig[
                              selectedOrder.status as keyof typeof statusConfig
                            ]?.color || "text-muted-foreground bg-muted",
                          )}
                        >
                          {statusConfig[
                            selectedOrder.status as keyof typeof statusConfig
                          ]?.label || selectedOrder.status}
                        </span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">Tracking Number</span>
                          <span className="text-xs font-mono font-bold text-primary">
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Payment Status</span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                          )}
                        >
                          {selectedOrder.paymentStatus === "paid"
                            ? "Paid"
                            : "Pending"}
                        </span>
                      </div>
                      {selectedOrder.paymentId && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">Payment ID</span>
                          <span className="text-xs font-mono">
                            {selectedOrder.paymentId}
                          </span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            selectedOrder.deliveryInfo?.scheduleDelivery
                              ? "bg-primary/10 border-2 border-primary/30"
                              : "bg-muted",
                          )}
                        >
                          <span className="text-sm font-medium flex items-center gap-2">
                            {selectedOrder.deliveryInfo?.scheduleDelivery && (
                              <Calendar className="h-4 w-4 text-primary" />
                            )}
                            {selectedOrder.deliveryInfo?.scheduleDelivery
                              ? "Scheduled Delivery"
                              : "Est. Delivery"}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold",
                              selectedOrder.deliveryInfo?.scheduleDelivery &&
                                "text-primary",
                            )}
                          >
                            {new Date(
                              selectedOrder.estimatedDelivery,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Information
                    </h3>
                    <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Full Name
                        </p>
                        <p className="font-medium">
                          {selectedOrder.deliveryInfo?.fullName || "N/A"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium truncate">
                            {selectedOrder.deliveryInfo?.phone || "N/A"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-xs truncate" title={selectedOrder.deliveryInfo?.email}>
                            {selectedOrder.deliveryInfo?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {selectedOrder.deliveryInfo?.address || "N/A"}
                        </p>
                        <p className="font-medium">
                          {selectedOrder.deliveryInfo?.city || ""},{" "}
                          {selectedOrder.deliveryInfo?.state || ""} -{" "}
                          {selectedOrder.deliveryInfo?.pincode || ""}
                        </p>
                      </div>
                      {selectedOrder.deliveryInfo?.deliveryNotes && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Delivery Notes
                          </p>
                          <p className="font-medium">
                            {selectedOrder.deliveryInfo.deliveryNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Items ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: OrderItem, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-muted rounded-lg space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm sm:text-base text-foreground break-words">
                                {item.serviceName || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 break-all bg-muted-foreground/5 p-1.5 rounded-md border border-border/50">
                                {item.fileName || "N/A"}
                              </p>
                            </div>
                            <p className="font-black text-primary text-lg whitespace-nowrap self-end sm:self-start">
                              ₹{item.pricing?.subtotal?.toFixed(2) || "0.00"}
                            </p>
                          </div>

                          {/* File Download Buttons */}
                          <div className="flex gap-2 pt-2">
                            {item.fileUrl && (
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Download className="h-3 w-3 mr-2" />
                                  Original File
                                </Button>
                              </a>
                            )}
                            {item.pdfUrl && (
                              <a
                                href={item.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <FileText className="h-3 w-3 mr-2" />
                                  PDF File
                                </Button>
                              </a>
                            )}
                            {!item.fileUrl && !item.pdfUrl && (
                              <p className="text-xs text-muted-foreground">
                                No files available
                              </p>
                            )}
                          </div>

                          {/* Configuration Details */}
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-border/50">
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Pages</p>
                              <p className="font-bold">{item.pageCount || 0}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Copies</p>
                              <p className="font-bold">{item.configuration?.copies || 1}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Print</p>
                              <p className="font-bold capitalize">{item.configuration?.printType || "N/A"}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Size</p>
                              <p className="font-bold uppercase">{item.configuration?.paperSize || "N/A"}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Paper</p>
                              <p className="font-bold capitalize">{item.configuration?.paperType || "N/A"}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">GSM</p>
                              <p className="font-bold">{item.configuration?.gsm || "N/A"}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Side</p>
                              <p className="font-bold capitalize">{item.configuration?.printSide || "N/A"}</p>
                            </div>
                            <div className="bg-muted-foreground/5 p-2 rounded-lg border border-border/50">
                              <p className="text-muted-foreground mb-0.5">Binding</p>
                              <p className="font-bold capitalize">{item.configuration?.bindingOption || "None"}</p>
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          {isAdminOrEmployee && (
                            <div className="text-xs space-y-1 pt-2 border-t border-border">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Base Price/Page:
                                </span>
                                <span>
                                  ₹
                                  {item.pricing?.basePricePerPage?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Final Price/Page:
                                </span>
                                <span>
                                  ₹
                                  {item.pricing?.pricePerPage?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>
                              {(item.pricing?.pricePerCopy || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Price/Copy (Binding etc):
                                  </span>
                                  <span>
                                    ₹
                                    {item.pricing?.pricePerCopy?.toFixed(2) ||
                                      "0.00"}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium">
                                <span>Total Pages × Copies:</span>
                                <span>
                                  {item.pricing?.totalPages || 0} ×{" "}
                                  {item.pricing?.copies || 1}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-sm">
                          No items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div>
                    <h3 className="font-semibold mb-3">Pricing Summary</h3>
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          ₹
                          {selectedOrder.pricing?.subtotal?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>

                      {selectedOrder.pricing?.deliveryCharge > 0 && (
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">
                            Delivery Charge
                          </span>
                          <span className="font-medium">
                            ₹{selectedOrder.pricing.deliveryCharge.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {selectedOrder.pricing?.packingCharge > 0 && (
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">
                            Packing Charge
                          </span>
                          <span className="font-medium">
                            ₹{selectedOrder.pricing.packingCharge.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {selectedOrder.pricing?.discount > 0 && (
                        <div className="flex justify-between text-sm py-1 text-green-600 font-bold">
                          <div className="flex flex-col">
                            <span>
                              Discount (
                              {selectedOrder.pricing.couponCode || "Coupon"})
                            </span>
                          </div>
                          <span>
                            -₹{selectedOrder.pricing.discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-primary/10 mt-2">
                        <span>Total Paid</span>
                        <span className="text-primary text-2xl">
                          ₹{selectedOrder.pricing?.total?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedOrder && (
        <MarkAsShippedDialog
          open={markAsShippedOpen}
          onOpenChange={setMarkAsShippedOpen}
          orderId={selectedOrder._id}
          onSuccess={() => {
            fetchOrders();
            setSelectedOrder({
              ...selectedOrder,
              status: "shipped",
            });
          }}
        />
      )}

      <TrackingModal
        isOpen={trackingModalOpen}
        onClose={() => {
          setTrackingModalOpen(false);
          setStatusUpdateData(null);
        }}
        onConfirm={handleTrackingConfirm}
        isLoading={isUpdatingStatus}
        orderNumber={statusUpdateData?.orderNumber}
      />

      <ConfirmationModal
        isOpen={reorderConfirmOpen}
        onClose={() => setReorderConfirmOpen(false)}
        onConfirm={confirmReorder}
        title="Reorder Confirmation"
        description="Are you sure you want to reorder this previous order? All items and delivery details will be copied to a new order."
        confirmLabel="Reorder Now"
        variant="default"
      />
    </div>
  );
}
