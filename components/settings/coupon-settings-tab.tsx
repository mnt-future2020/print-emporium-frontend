"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  Calendar,
  Percent,
  IndianRupee,
  Activity,
  User,
  AlertCircle,
  Pencil,
  Copy,
  Settings2,
  Truck,
  Share2,
} from "lucide-react";
import { ShareCouponDialog } from "./share-coupon-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkCreateCoupons,
  Coupon,
} from "@/lib/coupon-api";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface CouponSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function CouponSettingsTab({ onMessage }: CouponSettingsTabProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
    code: "",
    type: "percentage",
    value: 0,
    minOrderAmount: 0,
    isActive: true,
    displayInCheckout: true,
    description: "",
    maxDiscountAmount: 0,
    usageLimit: undefined,
  });
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState({
    count: 10,
    prefix: "FREE",
    type: "free-delivery" as "percentage" | "fixed" | "free-delivery",
    value: 0,
    minOrderAmount: 0,
    description: "Free Delivery Coupon",
    usageLimit: 1,
    displayInCheckout: true,
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Sharing State
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [couponToShare, setCouponToShare] = useState<Coupon | null>(null);

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllCoupons();
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Failed to load coupons:", error);
      onMessage({ type: "error", text: "Failed to load coupons" });
    } finally {
      setIsLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleSaveCoupon = async () => {
    setIsActionLoading(true);
    try {
      if (currentCoupon._id) {
        const response = await updateCoupon(currentCoupon._id, currentCoupon);
        if (response.success) {
          onMessage({ type: "success", text: "Coupon updated successfully" });
          loadCoupons();
          setIsDialogOpen(false);
        }
      } else {
        const response = await createCoupon(currentCoupon);
        if (response.success) {
          onMessage({ type: "success", text: "Coupon created successfully" });
          loadCoupons();
          setIsDialogOpen(false);
        }
      }
    } catch (error: any) {
      onMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save coupon",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setIsActionLoading(true);
    try {
      const response = await deleteCoupon(couponToDelete);
      if (response.success) {
        onMessage({ type: "success", text: "Coupon deleted successfully" });
        loadCoupons();
      }
    } catch (error) {
      onMessage({ type: "error", text: "Failed to delete coupon" });
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleBulkGenerate = async () => {
    setIsActionLoading(true);
    try {
      const response = await bulkCreateCoupons(bulkData);
      if (response.success) {
        onMessage({
          type: "success",
          text: `Successfully generated ${response.count} coupons`,
        });
        loadCoupons();
        setIsBulkDialogOpen(false);
      }
    } catch (error: any) {
      onMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to generate bulk coupons",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentCoupon({
      code: "",
      type: "percentage",
      value: 0,
      minOrderAmount: 0,
      isActive: true,
      displayInCheckout: true,
      description: "",
      maxDiscountAmount: 0,
      usageLimit: undefined,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setCurrentCoupon({ ...coupon });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading coupons...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto pb-20 p-8 bg-muted/10 rounded-3xl border border-border/50 shadow-inner">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-background to-indigo-500/10 border border-primary/10 p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Coupon Management
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              Create and manage promotional discount codes to drive sales and
              reward customer loyalty.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsBulkDialogOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Copy className="h-4 w-4" />
              Bulk Generate
            </Button>
            <Button onClick={openAddDialog} className="gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {coupons.map((coupon) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="overflow-hidden border-primary/10 shadow-lg hover:shadow-xl transition-shadow group h-full flex flex-col">
                <CardHeader className="p-5 border-b border-primary/5 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20 font-bold text-sm tracking-wider px-3"
                        >
                          {coupon.code}
                        </Badge>
                        {!coupon.isActive && (
                          <Badge variant="secondary" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                        {!coupon.displayInCheckout && (
                          <Badge variant="outline" className="text-[10px]">
                            Hidden from Checkout
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {coupon.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCouponToShare(coupon);
                          setIsShareDialogOpen(true);
                        }}
                        className="h-8 w-8 hover:bg-indigo-50 text-indigo-500"
                        title="Share Coupon"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(coupon)}
                        className="h-8 w-8 hover:bg-primary/10 text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCouponToDelete(coupon._id);
                          setIsConfirmOpen(true);
                        }}
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Discount
                      </p>
                      <div className="flex items-center gap-1.5 font-bold text-lg">
                        {coupon.type === "percentage" ? (
                          <>
                            {coupon.value}
                            <Percent className="h-4 w-4 text-indigo-500" />
                          </>
                        ) : coupon.type === "fixed" ? (
                          <>
                            <IndianRupee className="h-4 w-4 text-green-500" />
                            {coupon.value}
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <Truck className="h-5 w-5" />
                            <span className="text-sm">Free Delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Min. Order
                      </p>
                      <div className="flex items-center gap-1.5 font-bold text-lg">
                        <IndianRupee className="h-4 w-4 text-slate-400" />
                        {coupon.minOrderAmount}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-primary/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        Uses
                      </div>
                      <span className="font-medium text-foreground">
                        {coupon.usedCount} / {coupon.usageLimit || "∞"}
                      </span>
                    </div>
                    {coupon.expiryDate && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Expires
                        </div>
                        <span className="font-medium text-foreground">
                          {format(new Date(coupon.expiryDate), "dd MMM yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {coupons.length === 0 && (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-muted-foreground">
              No coupons yet
            </h3>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Create your first discount code to start your promotion.
            </p>
            <Button onClick={openAddDialog} variant="outline">
              Create First Coupon
            </Button>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] rounded-3xl border-primary/20 shadow-2xl overflow-hidden p-0 flex flex-col">
          <div className="bg-linear-to-br from-primary/10 to-indigo-500/10 p-6 border-b border-primary/10 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              {currentCoupon._id ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              Configure your discount code settings below.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="code"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Coupon Code
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    placeholder="E.g. SUMMER50"
                    value={currentCoupon.code || ""}
                    onChange={(e) =>
                      setCurrentCoupon({
                        ...currentCoupon,
                        code: e.target.value,
                      })
                    }
                    className="uppercase font-mono font-bold tracking-widest bg-muted/30 border-primary/10 focus:border-primary h-12 text-lg"
                  />
                  <Ticket className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Discount Type
                </Label>
                <Select
                  value={currentCoupon.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setCurrentCoupon({ ...currentCoupon, type: value })
                  }
                >
                  <SelectTrigger
                    id="type"
                    className="h-12 bg-muted/30 border-primary/10"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    <SelectItem value="free-delivery">Free Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentCoupon.type !== "free-delivery" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="value"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                  >
                    Discount Value
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currentCoupon.type === "percentage" ? (
                        <Percent className="h-4 w-4" />
                      ) : (
                        <IndianRupee className="h-4 w-4" />
                      )}
                    </div>
                    <Input
                      id="value"
                      type="number"
                      value={currentCoupon.value ?? 0}
                      onChange={(e) =>
                        setCurrentCoupon({
                          ...currentCoupon,
                          value: Number(e.target.value),
                        })
                      }
                      className="pl-9 h-12 bg-muted/30 border-primary/10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="minOrder"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Min Order Amount (₹)
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="minOrder"
                    type="number"
                    value={currentCoupon.minOrderAmount ?? 0}
                    onChange={(e) =>
                      setCurrentCoupon({
                        ...currentCoupon,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                    className="pl-9 h-12 bg-muted/30 border-primary/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="usageLimit"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Usage Limit
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="∞"
                    value={currentCoupon.usageLimit || ""}
                    onChange={(e) =>
                      setCurrentCoupon({
                        ...currentCoupon,
                        usageLimit: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="pl-9 h-12 bg-muted/30 border-primary/10"
                  />
                </div>
              </div>

              {currentCoupon.type === "percentage" && (
                <div className="space-y-2 col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label
                    htmlFor="maxDiscount"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                  >
                    Max Discount Amount (₹)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="No limit"
                      value={currentCoupon.maxDiscountAmount || ""}
                      onChange={(e) =>
                        setCurrentCoupon({
                          ...currentCoupon,
                          maxDiscountAmount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="pl-9 h-12 bg-muted/30 border-primary/10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="expiry"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={
                    currentCoupon.expiryDate
                      ? new Date(currentCoupon.expiryDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      expiryDate: e.target.value,
                    })
                  }
                  className="h-12 bg-muted/30 border-primary/10"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="E.g. Christmas Special Discount"
                  value={currentCoupon.description || ""}
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      description: e.target.value,
                    })
                  }
                  className="h-12 bg-muted/30 border-primary/10"
                />
              </div>

              <div className="flex items-center justify-between col-span-2 p-3 bg-muted/20 rounded-xl border border-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Active Status</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Toggle to enable or disable this coupon immediately.
                  </p>
                </div>
                <Switch
                  checked={currentCoupon.isActive}
                  onCheckedChange={(checked) =>
                    setCurrentCoupon({ ...currentCoupon, isActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between col-span-2 p-3 bg-muted/20 rounded-xl border border-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Show in Checkout</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Whether this coupon should be visible in the checkout
                    "Available Offers" list.
                  </p>
                </div>
                <Switch
                  checked={currentCoupon.displayInCheckout}
                  onCheckedChange={(checked) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      displayInCheckout: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 p-6 border-t border-primary/5 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCoupon}
              disabled={isActionLoading}
              className="rounded-xl shadow-lg shadow-primary/20 px-8"
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {currentCoupon._id ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-primary/20 shadow-2xl overflow-hidden p-0">
          <div className="bg-linear-to-br from-primary/10 to-indigo-500/10 p-6 border-b border-primary/10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-primary" />
              Bulk Create Coupons
            </DialogTitle>
            <DialogDescription>
              Generate multiple unique coupon codes at once.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Coupon Count
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={bulkData.count}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, count: Number(e.target.value) })
                  }
                  className="h-12 bg-muted/30 border-primary/10"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Code Prefix
                </Label>
                <Input
                  placeholder="E.g. FREE, BDAY"
                  value={bulkData.prefix}
                  onChange={(e) =>
                    setBulkData({
                      ...bulkData,
                      prefix: e.target.value.toUpperCase(),
                    })
                  }
                  className="h-12 uppercase font-mono bg-muted/30 border-primary/10"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Coupon Type
                </Label>
                <Select
                  value={bulkData.type}
                  onValueChange={(value: any) =>
                    setBulkData({ ...bulkData, type: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free-delivery">Free Delivery</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bulkData.type !== "free-delivery" && (
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Value
                  </Label>
                  <Input
                    type="number"
                    value={bulkData.value}
                    onChange={(e) =>
                      setBulkData({
                        ...bulkData,
                        value: Number(e.target.value),
                      })
                    }
                    className="h-12 bg-muted/30 border-primary/10"
                  />
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Min Order Amount (₹)
                </Label>
                <Input
                  type="number"
                  value={bulkData.minOrderAmount}
                  onChange={(e) =>
                    setBulkData({
                      ...bulkData,
                      minOrderAmount: Number(e.target.value),
                    })
                  }
                  className="h-12 bg-muted/30 border-primary/10"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Usage Limit (Per Coupon)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={bulkData.usageLimit}
                  onChange={(e) =>
                    setBulkData({
                      ...bulkData,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  className="h-12 bg-muted/30 border-primary/10"
                />
              </div>

              <div className="flex items-center justify-between col-span-2 p-3 bg-muted/20 rounded-xl border border-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Show in Checkout</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Whether these coupons should be visible in the "Available
                    Offers" list.
                  </p>
                </div>
                <Switch
                  checked={bulkData.displayInCheckout}
                  onCheckedChange={(checked) =>
                    setBulkData({ ...bulkData, displayInCheckout: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 p-6 border-t border-primary/5">
            <Button
              variant="outline"
              onClick={() => setIsBulkDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkGenerate}
              disabled={isActionLoading}
              className="rounded-xl shadow-lg shadow-primary/20 px-8"
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Generate Coupons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Share Coupon Dialog */}
      {couponToShare && (
        <ShareCouponDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          couponCode={couponToShare.code}
          description={couponToShare.description}
          discountType={couponToShare.type}
          discountValue={couponToShare.value}
        />
      )}
    </div>
  );
}
