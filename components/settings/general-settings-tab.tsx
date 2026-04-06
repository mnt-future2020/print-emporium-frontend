"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Loader2,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  FileCheck,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { axiosInstance } from "@/lib/axios";

interface GeneralSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  whatsappNumber: string;
  companyAddress: string;
  companyDescription: string;
  companyLogo: string | { data: string; name: string };
  favicon: string | { data: string; name: string };
  workingHours: string;
  latitude: string;
  longitude: string;
  googleMapEmbed: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  gstNumber: string;
  termsAndConditions: string;
  footerNote: string;
  trackingWebsiteUrl: string;
}

interface GeneralSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function GeneralSettingsTab({ onMessage }: GeneralSettingsTabProps) {
  const [settings, setSettings] = useState<GeneralSettings>({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    whatsappNumber: "",
    companyAddress: "",
    companyDescription: "",
    companyLogo: "",
    favicon: "",
    workingHours: "",
    latitude: "",
    longitude: "",
    googleMapEmbed: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    gstNumber: "",
    termsAndConditions: "",
    footerNote: "",
    trackingWebsiteUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateMapEmbedUrl = useCallback((lat: string, lng: string) => {
    // Create a basic Google Maps embed URL from coordinates
    // This creates a simple map centered on the coordinates with a zoom level
    const zoom = 15; // Default zoom level
    return `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d${
      zoom * 1000
    }!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1sen!2s!4v${Date.now()}!5m2!1sen!2s`;
  }, []);

  const handleGenerateEmbed = useCallback(() => {
    if (settings.latitude && settings.longitude) {
      const embedUrl = generateMapEmbedUrl(
        settings.latitude,
        settings.longitude
      );
      handleSettingsChange("googleMapEmbed", embedUrl);
    }
  }, [settings.latitude, settings.longitude, generateMapEmbedUrl]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/settings");
      if (response.data.success) {
        const generalSettings = response.data.data;
        setSettings({
          companyName: generalSettings.companyName || "",
          companyEmail: generalSettings.companyEmail || "",
          companyPhone: generalSettings.companyPhone || "",
          whatsappNumber: generalSettings.whatsappNumber || "",
          companyAddress: generalSettings.companyAddress || "",
          companyDescription: generalSettings.companyDescription || "",
          companyLogo: generalSettings.companyLogo || "",
          favicon: generalSettings.favicon || "",
          workingHours: generalSettings.workingHours || "",
          latitude: generalSettings.latitude || "",
          longitude: generalSettings.longitude || "",
          googleMapEmbed: generalSettings.googleMapEmbed || "",
          socialMedia: {
            facebook: generalSettings.socialMedia?.facebook || "",
            instagram: generalSettings.socialMedia?.instagram || "",
            twitter: generalSettings.socialMedia?.twitter || "",
            linkedin: generalSettings.socialMedia?.linkedin || "",
          },
          gstNumber: generalSettings.gstNumber || "",
          termsAndConditions: generalSettings.termsAndConditions || "",
          footerNote: generalSettings.footerNote || "",
          trackingWebsiteUrl: generalSettings.trackingWebsiteUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to load general settings:", error);
      onMessage({ type: "error", text: "Failed to load general settings" });
    }
  }, [onMessage]);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingsChange = (
    field: keyof GeneralSettings,
    value: string | object | null
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (
    platform: keyof GeneralSettings["socialMedia"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.put(
        "/api/settings/general",
        settings
      );
      if (response.data.success) {
        onMessage({ type: "success", text: response.data.message });
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
          : "Failed to save general settings";

      onMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/10 shadow-xl bg-gradient-to-b from-primary/5 to-background mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>
          Update your company details and branding information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branding & Identity Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-indigo-500/5 border border-primary/10 p-6 md:p-8 mb-8">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Branding & Identity</h3>
                <p className="text-sm text-muted-foreground">Manage your brand assets and how your business appears to customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Company Logo Card */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-semibold text-foreground/80">Company Logo</Label>
                  <p className="text-xs text-muted-foreground">Appears on invoices, emails, and header</p>
                </div>
                <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-primary/10 p-4 shadow-inner">
                  <ImageUpload
                    value={settings.companyLogo}
                    onChange={(value) => handleSettingsChange("companyLogo", value)}
                    aspectRatio="auto"
                    objectFit="contain"
                    recommendation="Horizontal or Square (Transparent PNG recommended)"
                    className="bg-white/50 dark:bg-black/20 rounded-xl overflow-hidden"
                  />
                </div>
              </div>

              {/* Favicon Card */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-semibold text-foreground/80">Browser Favicon</Label>
                  <p className="text-xs text-muted-foreground">Icon displayed in browser tabs</p>
                </div>
                <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-primary/10 p-4 shadow-inner">
                  <ImageUpload
                    value={settings.favicon}
                    onChange={(value) => handleSettingsChange("favicon", value)}
                    aspectRatio="square"
                    objectFit="contain"
                    recommendation="Square (1:1), 32x32px or 64x64px"
                    className="bg-white/50 dark:bg-black/20 rounded-xl overflow-hidden mx-auto max-w-[160px]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Decorations */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <Separator />

        {/* Basic Company Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  handleSettingsChange("companyName", e.target.value)
                }
                placeholder="Enter company name"
              />
            </div>

            {/* Company Email */}
            <div className="space-y-2">
              <Label htmlFor="companyEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Company Email
              </Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) =>
                  handleSettingsChange("companyEmail", e.target.value)
                }
                placeholder="Enter company email"
              />
            </div>

            {/* Company Phone */}
            <div className="space-y-2">
              <Label htmlFor="companyPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Company Phone
              </Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) =>
                  handleSettingsChange("companyPhone", e.target.value)
                }
                placeholder="Enter company phone"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label
                htmlFor="whatsappNumber"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={(e) =>
                  handleSettingsChange("whatsappNumber", e.target.value)
                }
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          {/* Company Address */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="companyAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Company Address
            </Label>
            <Textarea
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) =>
                handleSettingsChange("companyAddress", e.target.value)
              }
              placeholder="Enter company address"
              rows={3}
            />
          </div>

          {/* Company Description */}
          <div className="space-y-2 mt-6">
            <Label
              htmlFor="companyDescription"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Company Description
            </Label>
            <Textarea
              id="companyDescription"
              value={settings.companyDescription}
              onChange={(e) =>
                handleSettingsChange("companyDescription", e.target.value)
              }
              placeholder="Enter company description"
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* Working Hours */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </h3>
          <div className="space-y-2">
            <Label htmlFor="workingHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Working Hours
            </Label>
            <Textarea
              id="workingHours"
              value={settings.workingHours}
              onChange={(e) =>
                handleSettingsChange("workingHours", e.target.value)
              }
              placeholder="Enter working hours"
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Location Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Location Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latitude */}
            <div className="space-y-2">
              <Label htmlFor="latitude" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Latitude
              </Label>
              <Input
                id="latitude"
                value={settings.latitude}
                onChange={(e) =>
                  handleSettingsChange("latitude", e.target.value)
                }
                placeholder="e.g., 13.0827"
              />
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <Label htmlFor="longitude" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Longitude
              </Label>
              <Input
                id="longitude"
                value={settings.longitude}
                onChange={(e) =>
                  handleSettingsChange("longitude", e.target.value)
                }
                placeholder="e.g., 80.2707"
              />
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>How to get coordinates:</strong> Right-click on Google
              Maps at your location → Click the coordinates that appear at the
              top → Copy latitude,longitude values
            </p>
          </div>

          {/* Google Map Embed */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="googleMapEmbed" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Google Map Embed Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="googleMapEmbed"
                value={settings.googleMapEmbed}
                onChange={(e) =>
                  handleSettingsChange("googleMapEmbed", e.target.value)
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateEmbed}
                disabled={!settings.latitude || !settings.longitude}
                className="shrink-0"
              >
                Generate from Coordinates
              </Button>
            </div>
            <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                How to get Google Maps Embed URL:
              </h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Maps
                  </a>{" "}
                  in your browser
                </li>
                <li>Search for your business location</li>
                <li>
                  Click the Share button (or right-click and select Share)
                </li>
                <li>Click on the Embed a map tab</li>
                <li>
                  Copy the URL from the iframe src attribute (the part inside
                  the quotes after src=)
                </li>
                <li>Paste it in the field above</li>
              </ol>
              <div className="mt-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Alternative:</strong> Enter latitude and longitude
                  coordinates above, then click Generate from Coordinates to
                  create a basic embed URL.
                </p>
              </div>
            </div>
            {settings.googleMapEmbed && (
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Map Preview
                </Label>
                <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                  <iframe
                    src={settings.googleMapEmbed}
                    className="w-full h-64"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                value={settings.socialMedia.facebook}
                onChange={(e) =>
                  handleSocialMediaChange("facebook", e.target.value)
                }
                placeholder="Enter Facebook URL"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={settings.socialMedia.instagram}
                onChange={(e) =>
                  handleSocialMediaChange("instagram", e.target.value)
                }
                placeholder="Enter Instagram URL"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={settings.socialMedia.twitter}
                onChange={(e) =>
                  handleSocialMediaChange("twitter", e.target.value)
                }
                placeholder="Enter Twitter URL"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={settings.socialMedia.linkedin}
                onChange={(e) =>
                  handleSocialMediaChange("linkedin", e.target.value)
                }
                placeholder="Enter LinkedIn URL"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Business Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Business Details
          </h3>

          {/* GST Number */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="gstNumber" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              GST Number
            </Label>
            <Input
              id="gstNumber"
              value={settings.gstNumber}
              onChange={(e) =>
                handleSettingsChange("gstNumber", e.target.value)
              }
              placeholder="Enter GST number"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-2 mb-6">
            <Label
              htmlFor="termsAndConditions"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </Label>
            <Textarea
              id="termsAndConditions"
              value={settings.termsAndConditions}
              onChange={(e) =>
                handleSettingsChange("termsAndConditions", e.target.value)
              }
              placeholder="Enter terms and conditions"
              rows={4}
            />
          </div>

          {/* Footer Note */}
          <div className="space-y-2">
            <Label htmlFor="footerNote" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Footer Note
            </Label>
            <Textarea
              id="footerNote"
              value={settings.footerNote}
              onChange={(e) =>
                handleSettingsChange("footerNote", e.target.value)
              }
              placeholder="Enter footer note"
              rows={3}
            />
          </div>

          {/* Tracking Website URL */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="trackingWebsiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Tracking Website URL
            </Label>
            <Input
              id="trackingWebsiteUrl"
              value={settings.trackingWebsiteUrl}
              onChange={(e) =>
                handleSettingsChange("trackingWebsiteUrl", e.target.value)
              }
              placeholder="e.g., https://www.delhivery.com/"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This URL will be included in shipping notification emails to help users track their orders.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end pt-6 border-t border-primary/10">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="gap-2 px-10 py-6 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isLoading ? "Saving Settings..." : "Save General Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
