"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Save, Loader2, TestTube, Eye, EyeOff } from "lucide-react";
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
import { useCompanySettings } from "@/hooks/use-company-settings";

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
}

interface EmailSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function EmailSettingsTab({ onMessage }: EmailSettingsTabProps) {
  const { settings: companySettings, loading: companyLoading } =
    useCompanySettings();
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    senderEmail: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        "/api/settings/email-configuration"
      );
      if (response.data.success) {
        const emailConfig = response.data.emailConfig;
        setSettings({
          smtpHost: emailConfig.smtpHost || "",
          smtpPort: emailConfig.smtpPort || "",
          smtpUsername: emailConfig.smtpUsername || "",
          smtpPassword: emailConfig.smtpPassword || "",
          senderEmail: emailConfig.senderEmail || "",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        // 403 errors are displayed globally, don't show duplicate message
        console.warn("Access denied to email configuration");
        return;
      }
      console.error("Failed to load email settings:", error);
      onMessage({ type: "error", text: "Failed to load email settings" });
    }
  }, [onMessage]);

  // Load settings on component mount - only once
  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsChange = (field: keyof EmailSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.put(
        "/api/settings/email-configuration",
        settings
      );
      if (response.data.success) {
        onMessage({
          type: "success",
          text: "Email settings saved successfully",
        });
        await loadSettings(); // Reload to get updated data
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to save email settings";

      onMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfiguration = async (email: string) => {
    if (!email) {
      onMessage({ type: "error", text: "Please enter a test email address" });
      return;
    }

    setIsTesting(true);

    try {
      const response = await axiosInstance.post(
        "/api/settings/email-configuration/test",
        {
          testEmail: email,
          message: `This is a test email from ${
            companyLoading
              ? "Loading..."
              : companySettings?.companyName || "PrintEmporium"
          } dashboard settings.`,
        }
      );

      if (response.data.success) {
        onMessage({ type: "success", text: "Test email sent successfully!" });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to send test email";

      onMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SMTP Configuration
        </CardTitle>
        <CardDescription>
          Configure email settings for sending notifications and password resets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SMTP Host */}
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={settings.smtpHost}
              onChange={(e) => handleSettingsChange("smtpHost", e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>

          {/* SMTP Port */}
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              value={settings.smtpPort}
              onChange={(e) => handleSettingsChange("smtpPort", e.target.value)}
              placeholder="587"
            />
          </div>

          {/* SMTP Username */}
          <div className="space-y-2">
            <Label htmlFor="smtpUsername">SMTP Username</Label>
            <Input
              id="smtpUsername"
              value={settings.smtpUsername}
              onChange={(e) =>
                handleSettingsChange("smtpUsername", e.target.value)
              }
              placeholder="your-email@gmail.com"
            />
          </div>

          {/* SMTP Password */}
          <div className="space-y-2">
            <Label htmlFor="smtpPassword">SMTP Password</Label>
            <div className="relative">
              <Input
                id="smtpPassword"
                type={showPassword ? "text" : "password"}
                value={settings.smtpPassword}
                onChange={(e) =>
                  handleSettingsChange("smtpPassword", e.target.value)
                }
                placeholder="Enter SMTP password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Sender Email */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="senderEmail">Sender Email</Label>
            <Input
              id="senderEmail"
              type="email"
              value={settings.senderEmail}
              onChange={(e) =>
                handleSettingsChange("senderEmail", e.target.value)
              }
              placeholder="noreply@yourcompany.com"
            />
          </div>
        </div>

        <Separator />

        {/* Test Email Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Email Configuration
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                type="email"
              />
            </div>
            <Button
              onClick={() => testEmailConfiguration(testEmail)}
              disabled={isTesting || !testEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Send Test Email
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
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
            Save Email Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
