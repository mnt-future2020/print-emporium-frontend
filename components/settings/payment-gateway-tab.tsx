"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
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
import { axiosInstance } from "@/lib/axios";

interface PaymentSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret?: string;
}

interface PaymentGatewayTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function PaymentGatewayTab({ onMessage }: PaymentGatewayTabProps) {
  const [settings, setSettings] = useState<PaymentSettings>({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayWebhookSecret: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/settings/payment-gateway");
      if (response.data.success) {
        const paymentConfig = response.data.paymentConfig;
        setSettings({
          razorpayKeyId: paymentConfig.razorpayKeyId || "",
          razorpayKeySecret: paymentConfig.razorpayKeySecret || "",
          razorpayWebhookSecret: paymentConfig.razorpayWebhookSecret || "",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        // 403 errors are displayed globally, don't show duplicate message
        console.warn("Access denied to payment gateway settings");
        setIsPageLoading(false);
        return;
      }
      console.error("Failed to load payment settings:", error);
      onMessage({ type: "error", text: "Failed to load payment settings" });
    } finally {
      setIsPageLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsChange = (
    field: keyof PaymentSettings,
    value: string
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.put(
        "/api/settings/payment-gateway",
        settings
      );
      if (response.data.success) {
        onMessage({
          type: "success",
          text: "Payment gateway settings saved successfully",
        });
        await loadSettings();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save payment settings";
      onMessage({
        type: "error",
        text: errorMessage,
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
          <CreditCard className="h-5 w-5" />
          Razorpay Integration
        </CardTitle>
        <CardDescription>
          Configure your Razorpay API credentials for processing payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Razorpay Key ID */}
          <div className="space-y-2">
            <Label htmlFor="razorpayKeyId">Razorpay API Key (Key ID)</Label>
            <Input
              id="razorpayKeyId"
              value={settings.razorpayKeyId}
              onChange={(e) =>
                handleSettingsChange("razorpayKeyId", e.target.value)
              }
              placeholder="rzp_test_..."
            />
            <p className="text-xs text-muted-foreground">
              Your Razorpay Key ID from the Razorpay Dashboard (Settings &gt;
              API Keys).
            </p>
          </div>

          {/* Razorpay Key Secret */}
          <div className="space-y-2">
            <Label htmlFor="razorpayKeySecret">Razorpay Secret Key</Label>
            <div className="relative">
              <Input
                id="razorpayKeySecret"
                type={showSecret ? "text" : "password"}
                value={settings.razorpayKeySecret}
                onChange={(e) =>
                  handleSettingsChange("razorpayKeySecret", e.target.value)
                }
                placeholder="Enter Secret Key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your Razorpay Key Secret. This will be stored encrypted on the
              server.
            </p>
          </div>

          {/* Razorpay Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="razorpayWebhookSecret">
              Razorpay Webhook Secret
            </Label>
            <div className="relative">
              <Input
                id="razorpayWebhookSecret"
                type={showSecret ? "text" : "password"}
                value={settings.razorpayWebhookSecret}
                onChange={(e) =>
                  handleSettingsChange("razorpayWebhookSecret", e.target.value)
                }
                placeholder="Enter Webhook Secret"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional: Used to verify webhook signatures for payment events.
            </p>
          </div>
        </div>

        <Separator />

        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Security Note</p>
            <p className="text-muted-foreground mt-1">
              These credentials are encrypted at rest and are never exposed to
              the client application after being saved. They are used
              exclusively by the server to communicate with Razorpay.
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
            Save Payment Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
