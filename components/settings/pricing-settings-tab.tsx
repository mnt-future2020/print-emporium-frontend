"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Package,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { axiosInstance } from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

interface Threshold {
  minAmount: number;
  charge: number;
}

interface PricingSettings {
  deliveryThresholds: Threshold[];
  regionalDeliveryChargeTN: number;
  regionalDeliveryChargeOutsideTN: number;
  packingThresholds: Threshold[];
  isDeliveryEnabled: boolean;
  isPackingEnabled: boolean;
}

interface PricingSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function PricingSettingsTab({ onMessage }: PricingSettingsTabProps) {
  const [settings, setSettings] = useState<PricingSettings>({
    deliveryThresholds: [],
    regionalDeliveryChargeTN: 0,
    regionalDeliveryChargeOutsideTN: 0,
    packingThresholds: [],
    isDeliveryEnabled: true,
    isPackingEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/settings/pricing");
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load pricing settings:", error);
      onMessage({ type: "error", text: "Failed to load pricing settings" });
    } finally {
      setIsLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleAddThreshold = (type: "delivery" | "packing") => {
    const key = type === "delivery" ? "deliveryThresholds" : "packingThresholds";
    setSettings((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { minAmount: 0, charge: 0 }],
    }));
  };

  const handleRemoveThreshold = (type: "delivery" | "packing", index: number) => {
    const key = type === "delivery" ? "deliveryThresholds" : "packingThresholds";
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleThresholdChange = (
    type: "delivery" | "packing",
    index: number,
    field: keyof Threshold,
    value: number,
  ) => {
    const key = type === "delivery" ? "deliveryThresholds" : "packingThresholds";
    setSettings((prev) => {
      const newThresholds = [...prev[key]];
      newThresholds[index] = { ...newThresholds[index], [field]: value };
      return { ...prev, [key]: newThresholds };
    });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Sort thresholds by minAmount before saving for consistency
      const sortedSettings = {
        ...settings,
        deliveryThresholds: [...(settings.deliveryThresholds || [])].sort(
          (a, b) => a.minAmount - b.minAmount,
        ),
        packingThresholds: [...settings.packingThresholds].sort(
          (a, b) => a.minAmount - b.minAmount,
        ),
      };

      const response = await axiosInstance.put(
        "/api/settings/pricing",
        sortedSettings,
      );
      if (response.data.success) {
        onMessage({
          type: "success",
          text: "Pricing settings updated successfully",
        });
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to save pricing settings:", error);
      onMessage({ type: "error", text: "Failed to save pricing settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading pricing settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8  mx-auto pb-20 p-8 bg-muted/10 rounded-3xl border border-border/50 shadow-inner">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-indigo-500/10 border border-primary/10 p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Pricing Configuration
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              Configure dynamic delivery fees and packing charges to optimize
              your shipping strategy and increase average order value.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-2 rounded-2xl border border-primary/10 shadow-inner">
            <div className="flex flex-col items-center px-4 py-2 border-r border-primary/10">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Delivery
              </span>
              <span
                className={`text-sm font-bold ${settings.isDeliveryEnabled ? "text-green-500" : "text-muted-foreground"}`}
              >
                {settings.isDeliveryEnabled ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="flex flex-col items-center px-4 py-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Packing
              </span>
              <span
                className={`text-sm font-bold ${settings.isPackingEnabled ? "text-indigo-500" : "text-muted-foreground"}`}
              >
                {settings.isPackingEnabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Delivery Charges Section */}
        <Card className="overflow-hidden border-primary/10 shadow-xl bg-gradient-to-b from-primary/5 to-background">
          <CardHeader className=" border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 ring-4 ring-primary/5">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Delivery Charges
                  </CardTitle>
                  <CardDescription>
                    Configure dynamic delivery fees based on order subtotal
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background/50 px-3 py-1.5 rounded-full border border-primary/10">
                <span className="text-sm font-medium">Enabled</span>
                <Switch
                  checked={settings.isDeliveryEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      isDeliveryEnabled: checked,
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Amount Based Thresholds */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Amount-Based Charges</h3>
                  <p className="text-sm text-muted-foreground">Define delivery fees based on order subtotal</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddThreshold("delivery")}
                  className="gap-2 border-primary/20 hover:border-primary/50"
                >
                  <Plus className="h-4 w-4" />
                  Add Threshold
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {settings.deliveryThresholds?.map((threshold, index) => (
                    <motion.div
                      key={`delivery-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end gap-3 p-4 rounded-xl bg-muted/30 border border-border"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs font-semibold">Min Order (₹)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            value={threshold.minAmount}
                            onChange={(e) => handleThresholdChange("delivery", index, "minAmount", Number(e.target.value))}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs font-semibold">Delivery Fee (₹)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            value={threshold.charge}
                            onChange={(e) => handleThresholdChange("delivery", index, "charge", Number(e.target.value))}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveThreshold("delivery", index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!settings.deliveryThresholds || settings.deliveryThresholds.length === 0) && (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl text-muted-foreground">
                    No amount-based charges defined.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-8" />

            {/* Regional Fixed Charges */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-700">Regional Surcharges</h3>
                <p className="text-sm text-muted-foreground">Additional fixed charges added based on delivery state</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold text-primary">Tamil Nadu</Label>
                    <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Fixed Charge</div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 font-bold">₹</span>
                    <Input
                      type="number"
                      value={settings.regionalDeliveryChargeTN}
                      onChange={(e) => setSettings(prev => ({ ...prev, regionalDeliveryChargeTN: Number(e.target.value) }))}
                      className="pl-7 h-12 bg-background border-primary/20 focus:border-primary text-lg font-bold"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">Applied to orders within Tamil Nadu (Additive)</p>
                </div>

                <div className="space-y-3 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold text-indigo-600">Outside Tamil Nadu</Label>
                    <div className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Fixed Charge</div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600/40 font-bold">₹</span>
                    <Input
                      type="number"
                      value={settings.regionalDeliveryChargeOutsideTN}
                      onChange={(e) => setSettings(prev => ({ ...prev, regionalDeliveryChargeOutsideTN: Number(e.target.value) }))}
                      className="pl-7 h-12 bg-background border-indigo-500/20 focus:border-indigo-600 text-lg font-bold"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">Applied to orders outside Tamil Nadu (Additive)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
              <div className="p-1.5 h-fit bg-primary/10 rounded-full">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-primary">
                  Pro Tip: Free Delivery
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Set a threshold with{" "}
                  <span className="font-bold">₹0 charge</span> to offer free
                  delivery. This encourages users to buy more to reach the
                  threshold!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packing Charges Section */}
        <Card className="overflow-hidden border-indigo-500/10 shadow-xl bg-gradient-to-b from-indigo-500/5 to-background">
          <CardHeader className=" border-b border-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/5">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Packing Charges
                  </CardTitle>
                  <CardDescription>
                    Configure dynamic packing fees based on order value
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background/50 px-3 py-1.5 rounded-full border border-indigo-500/10">
                <span className="text-sm font-medium">Enabled</span>
                <Switch
                  checked={settings.isPackingEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      isPackingEnabled: checked,
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Packing Tiers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddThreshold("packing")}
                  className="gap-2 border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                >
                  <Plus className="h-4 w-4" />
                  Add Tier
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {settings.packingThresholds.map((threshold, index) => (
                    <motion.div
                      key={`packing-${index}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-end gap-4 p-4 rounded-xl bg-muted/30 border border-border group relative transition-all hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground ml-1">
                          Order Value From (₹)
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₹
                          </div>
                          <Input
                            type="number"
                            value={threshold.minAmount}
                            onChange={(e) =>
                              handleThresholdChange(
                                "packing",
                                index,
                                "minAmount",
                                Number(e.target.value),
                              )
                            }
                            className="pl-7 bg-background"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground ml-1">
                          Packing Fee (₹)
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₹
                          </div>
                          <Input
                            type="number"
                            value={threshold.charge}
                            onChange={(e) =>
                              handleThresholdChange(
                                "packing",
                                index,
                                "charge",
                                Number(e.target.value),
                              )
                            }
                            className={`pl-7 bg-background ${threshold.charge === 0 ? "border-green-500/50 text-green-600 font-medium" : ""}`}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveThreshold("packing", index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {settings.packingThresholds.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground text-sm font-medium">
                    No packing tiers defined.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Packing will be free for all orders.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between p-6 bg-background/80 rounded-2xl border border-primary/20 sticky bottom-6 z-20 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          Thresholds are automatically sorted from lowest to highest amount.
        </div>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="gap-2 px-10 py-6 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {isSaving ? "Saving Configuration..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
