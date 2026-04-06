"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Package,
  IndianRupee,
  User,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomerDetails } from "@/lib/customer-api";
import { format } from "date-fns";
import { toast } from "sonner";
import { Order } from "@/lib/order-api";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ customer: any; orders: Order[] } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getCustomerDetails(id as string);
      if (res.success) {
        setData({
          customer: res.customer,
          orders: res.orders,
        });
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground animate-pulse">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center space-y-4">
        <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Customer not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { customer, orders } = data;

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.pricing.total, 0),
    avgOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.pricing.total, 0) /
          orders.length
        : 0,
    lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    printing: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    shipped: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    delivered: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="p-8 mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Details
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View detailed profile and order history for {customer.name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Profile */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-card to-muted/20">
            <CardContent className="p-8 pt-10 text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto ring-4 ring-background shadow-xl">
                <AvatarImage src={customer.image} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {customer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-bold tracking-wider"
                  >
                    {customer.role}
                  </Badge>
                  {customer.banned && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] font-bold tracking-wider"
                    >
                      Banned
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-3 pt-6 text-sm text-left border-t border-border/50">
                <div className="flex items-center gap-3 text-muted-foreground group">
                  <div className="p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground group">
                  <div className="p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    Joined{" "}
                    {format(new Date(customer.createdAt), "MMMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground group">
                  <div className="p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    Updated{" "}
                    {format(new Date(customer.updatedAt), "MMM dd, hh:mm a")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer stats in short card */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="hover:border-primary/50 transition-colors cursor-default border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
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
                      Lifetime Value
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{stats.totalSpent.toLocaleString()}
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
                      Avg. Order
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{stats.avgOrderValue.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-xl font-bold">
                  Order History
                </CardTitle>
                <CardDescription>
                  List of all orders placed by this customer.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Order ID
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-40">
                          <Package className="h-12 w-12" />
                          <p className="font-medium">No order history found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order._id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-6 font-mono text-sm font-semibold text-primary">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              {format(
                                new Date(order.createdAt),
                                "MMM dd, yyyy",
                              )}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(order.createdAt), "hh:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize text-[10px] font-bold ${
                              statusColors[order.status] || ""
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          ₹{order.pricing.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() =>
                              router.push(`/dashboard/orders/${order._id}`)
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
