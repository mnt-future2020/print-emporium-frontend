"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Trash2,
  Save,
  Loader2,
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
  packingThresholds: Threshold[];
  isPackingEnabled: boolean;
}

interface PricingSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function PricingSettingsTab({ onMessage }: PricingSettingsTabProps) {
  const [settings, setSettings] = useState<PricingSettings>({
    packingThresholds: [],
    isPackingEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/settings/pricing");
      if (response.data.success) {
        setSettings({
          packingThresholds: response.data.data.packingThresholds || [],
          isPackingEnabled: response.data.data.isPackingEnabled ?? true,
        });
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

  const handleAddThreshold = () => {
    setSettings((prev) => ({
      ...prev,
      packingThresholds: [...prev.packingThresholds, { minAmount: 0, charge: 0 }],
    }));
  };

  const handleRemoveThreshold = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      packingThresholds: prev.packingThresholds.filter((_, i) => i !== index),
    }));
  };

  const handleThresholdChange = (
    index: number,
    field: keyof Threshold,
    value: number,
  ) => {
    setSettings((prev) => {
      const newThresholds = [...prev.packingThresholds];
      newThresholds[index] = { ...newThresholds[index], [field]: value };
      return { ...prev, packingThresholds: newThresholds };
    });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const sortedSettings = {
        ...settings,
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
          text: "Packing charges updated successfully",
        });
        setSettings({
          packingThresholds: response.data.data.packingThresholds || [],
          isPackingEnabled: response.data.data.isPackingEnabled ?? true,
        });
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
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto pb-20">
      {/* Packing Charges */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
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
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
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
                onClick={handleAddThreshold}
                className="gap-2"
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
                    className="flex items-end gap-4 p-4 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-muted-foreground ml-1">
                        Order Value From (₹)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={threshold.minAmount}
                          onChange={(e) =>
                            handleThresholdChange(
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={threshold.charge}
                          onChange={(e) =>
                            handleThresholdChange(
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
                      onClick={() => handleRemoveThreshold(index)}
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

      {/* Save */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          Thresholds are automatically sorted from lowest to highest amount.
        </div>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
