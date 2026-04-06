"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  IndianRupee,
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Clock,
  Loader2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";

// Deep blue color palette
const COLOR_PALETTE = {
  primary900: "#0021a0", // Primary dark blue
  primary700: "#003dd0", // Darker shade
  primary600: "#0051ff", // Medium blue
  primary500: "#3d7bff", // Light blue
  primary400: "#6da3ff", // Lighter blue
  primary300: "#8cb8ff", // Even lighter
  primary200: "#b8cdff", // Very light blue
  primary100: "#dfe8ff", // Almost white blue
};

const STATUS_COLORS = {
  pending: COLOR_PALETTE.primary200,
  confirmed: COLOR_PALETTE.primary300,
  processing: COLOR_PALETTE.primary400,
  printing: COLOR_PALETTE.primary500,
  shipped: COLOR_PALETTE.primary600,
  delivered: COLOR_PALETTE.primary700,
  cancelled: "#ef4444",
};

const PIE_COLORS = [
  COLOR_PALETTE.primary900,
  COLOR_PALETTE.primary700,
  COLOR_PALETTE.primary600,
  COLOR_PALETTE.primary500,
  COLOR_PALETTE.primary400,
];

const chartConfig = {
  revenue: { label: "Revenue", color: COLOR_PALETTE.primary600 },
  orders: { label: "Orders", color: COLOR_PALETTE.primary500 },
};

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  statusBreakdown: {
    pending: number;
    confirmed: number;
    processing: number;
    printing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paymentBreakdown: {
    paid: number;
    pending: number;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
    dailyOrders: Array<{ date: string; orders: number; revenue: number }>;
    ordersByService: Array<{ service: string; count: number; revenue: number }>;
    ordersByPaymentMethod: Array<{
      method: string;
      count: number;
      revenue: number;
    }>;
  };
  topCustomers: Array<{
    _id: string;
    totalOrders: number;
    totalSpent: number;
    customerName: string;
    customerEmail: string;
  }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    pricing: { total: number };
    createdAt: string;
    deliveryInfo: { fullName: string };
  }>;
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get(
        `/api/orders/admin/stats?period=${period}`,
      );
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button onClick={fetchStats} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusData = Object.entries(stats.statusBreakdown)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
    }));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className=" mx-auto space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Overview of your business performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-35">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchStats}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueGrowth}
            icon={<IndianRupee className="h-5 w-5" />}
            subtitle={`${formatCurrency(stats.todayRevenue)} today`}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change={stats.orderGrowth}
            icon={<Package className="h-5 w-5" />}
            subtitle={`${stats.todayOrders} today`}
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(Number(stats.averageOrderValue))}
            icon={<ShoppingCart className="h-5 w-5" />}
            subtitle="Per paid order"
          />
          <StatCard
            title="Pending Orders"
            value={stats.statusBreakdown.pending.toString()}
            icon={<Clock className="h-5 w-5" />}
            subtitle={`${
              stats.statusBreakdown.processing + stats.statusBreakdown.printing
            } in progress`}
            variant="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          {/* Revenue Chart */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <AreaChart data={stats.charts.monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLOR_PALETTE.primary600}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLOR_PALETTE.primary600}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const [, month] = value.split("-");
                      const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      return months[parseInt(month) - 1] || value;
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLOR_PALETTE.primary600}
                    fill="url(#fillRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Orders Chart */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">
                Daily Orders (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <BarChart data={stats.charts.dailyOrders.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="orders"
                    fill={COLOR_PALETTE.primary600}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status and Services Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
          {/* Order Status Breakdown */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium ml-auto text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.charts.ordersByService
                  .slice(0, 5)
                  .map((service, index) => (
                    <div key={service.service} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[180px] font-medium text-slate-700">
                          {service.service}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {service.count} orders
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${
                              (service.count /
                                stats.charts.ordersByService[0].count) *
                              100
                            }%`,
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.charts.ordersByPaymentMethod.map((method, index) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="capitalize font-medium text-slate-700">
                        {method.method}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {method.count} orders
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatCurrency(method.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          {/* Top Customers */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCustomers.map((customer, index) => (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-blue-50 to-transparent border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: COLOR_PALETTE.primary600 }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {customer.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {customer.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {customer.totalOrders} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-lg min-w-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.deliveryInfo?.fullName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(order.pricing.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  subtitle,
  variant = "default",
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
  variant?: "default" | "warning";
}) {
  return (
    <Card
      className={`shadow-lg ${
        variant === "warning" ? "border-yellow-500/50 bg-yellow-50/30" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <div className="text-slate-400">{icon}</div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && (
              <span
                className={`flex items-center text-xs font-semibold ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500">{subtitle}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; backgroundColor: string; textColor: string }
  > = {
    pending: {
      label: "Pending",
      backgroundColor: "#dfe8ff",
      textColor: "#0021a0",
    },
    confirmed: {
      label: "Confirmed",
      backgroundColor: "#b8cdff",
      textColor: "#003dd0",
    },
    processing: {
      label: "Processing",
      backgroundColor: "#8cb8ff",
      textColor: "#003dd0",
    },
    printing: {
      label: "Printing",
      backgroundColor: "#6da3ff",
      textColor: "#ffffff",
    },
    shipped: {
      label: "Shipped",
      backgroundColor: "#0051ff",
      textColor: "#ffffff",
    },
    delivered: {
      label: "Delivered",
      backgroundColor: "#003dd0",
      textColor: "#ffffff",
    },
    cancelled: {
      label: "Cancelled",
      backgroundColor: "#fee2e2",
      textColor: "#991b1b",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    backgroundColor: "#f3f4f6",
    textColor: "#6b7280",
  };

  return (
    <span
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
      className="px-2 py-1 rounded-full text-xs font-medium"
    >
      {config.label}
    </span>
  );
}
