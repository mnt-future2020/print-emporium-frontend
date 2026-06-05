"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { axiosInstance } from "@/lib/axios";

interface ShiprocketSettings {
  enabled: boolean;
  email: string;
  password: string;
  pickupLocation: string;
  webhookToken: string;
}

interface ShiprocketTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function ShiprocketTab({ onMessage }: ShiprocketTabProps) {
  const [settings, setSettings] = useState<ShiprocketSettings>({
    enabled: true,
    email: "",
    password: "",
    pickupLocation: "Primary",
    webhookToken: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/settings/shiprocket");
      if (response.data.success) {
        const cfg = response.data.shiprocketConfig || {};
        setSettings({
          enabled: cfg.enabled ?? true,
          email: cfg.email || "",
          password: cfg.password || "",
          pickupLocation: cfg.pickupLocation || "Primary",
          webhookToken: cfg.webhookToken || "",
        });
      }
    } catch (error: unknown) {
      const e = error as { response?: { status?: number } };
      if (e.response?.status === 403) {
        console.warn("Access denied to Shiprocket settings");
        setIsPageLoading(false);
        return;
      }
      console.error("Failed to load Shiprocket settings:", error);
      onMessage({ type: "error", text: "Failed to load Shiprocket settings" });
    } finally {
      setIsPageLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field: keyof ShiprocketSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        "/api/settings/shiprocket",
        settings,
      );
      if (response.data.success) {
        onMessage({
          type: "success",
          text: "Shiprocket settings saved successfully",
        });
        await loadSettings();
      }
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      onMessage({
        type: "error",
        text: e.response?.data?.message || "Failed to save Shiprocket settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shiprocket Integration
        </CardTitle>
        <CardDescription>
          Configure your Shiprocket API user credentials. Get them from
          Shiprocket → Settings → API → Configure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enabled toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Shiprocket</Label>
            <p className="text-xs text-muted-foreground">
              When off, admin actions and webhook handling are paused.
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => handleChange("enabled", v)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="shiprocketEmail">API Email</Label>
            <Input
              id="shiprocketEmail"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="api-user@example.com"
            />
            <p className="text-xs text-muted-foreground">
              The email of the API user created in your Shiprocket dashboard.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="shiprocketPassword">API Password</Label>
            <div className="relative">
              <Input
                id="shiprocketPassword"
                type={showPassword ? "text" : "password"}
                value={settings.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter API password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Stored encrypted on the server. We log into Shiprocket once and
              cache the auth token for ~10 days.
            </p>
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location Nickname</Label>
            <Input
              id="pickupLocation"
              value={settings.pickupLocation}
              onChange={(e) => handleChange("pickupLocation", e.target.value)}
              placeholder="Primary"
            />
            <p className="text-xs text-muted-foreground">
              The nickname of the pickup address configured in Shiprocket
              (Settings → Pickup Addresses). Typically &quot;Primary&quot;.
            </p>
          </div>

          {/* Webhook Token */}
          <div className="space-y-2">
            <Label htmlFor="webhookToken">Webhook Token</Label>
            <div className="relative">
              <Input
                id="webhookToken"
                type={showWebhook ? "text" : "password"}
                value={settings.webhookToken}
                onChange={(e) => handleChange("webhookToken", e.target.value)}
                placeholder="A long random string"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowWebhook((v) => !v)}
              >
                {showWebhook ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Any random string. Add{" "}
              <code className="px-1 py-0.5 rounded bg-muted text-[11px]">
                ?token=&lt;value&gt;
              </code>{" "}
              to your Shiprocket webhook URL.
            </p>
          </div>
        </div>

        <Separator />

        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Security &amp; Validation</p>
            <p className="text-muted-foreground mt-1">
              Credentials are encrypted at rest. On save, we attempt a login
              against Shiprocket and reject the change if it fails.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Shiprocket Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
