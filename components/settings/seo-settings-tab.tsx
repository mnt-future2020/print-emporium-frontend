"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  Trash2,
  FileText,
  Tag,
  Image as ImageIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  getAllSEOSettings,
  upsertSEOSettings,
  deleteSEOSettings,
  SEOSettings,
} from "@/lib/seo-api";

interface SEOSettingsTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

const AVAILABLE_PAGES = [
  { value: "home", label: "Home Page" },
  { value: "about", label: "About Page" },
  { value: "services", label: "Services Page" },

  { value: "contact", label: "Contact Page" },
];

export function SEOSettingsTab({ onMessage }: SEOSettingsTabProps) {
  const [allSettings, setAllSettings] = useState<SEOSettings[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [currentSettings, setCurrentSettings] = useState<SEOSettings>({
    pageName: "home",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadAllSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await getAllSEOSettings();
      if (response.success) {
        setAllSettings(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load SEO settings:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  useEffect(() => {
    // Load settings for selected page
    const pageSettings = allSettings.find((s) => s.pageName === selectedPage);
    if (pageSettings) {
      setCurrentSettings(pageSettings);
    } else {
      setCurrentSettings({
        pageName: selectedPage,
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        ogImage: null,
      });
    }
  }, [selectedPage, allSettings]);

  const handleSettingsChange = (
    field: keyof SEOSettings,
    value: string | object | null,
  ) => {
    setCurrentSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const response = await upsertSEOSettings(currentSettings);
      if (response.success) {
        onMessage({ type: "success", text: response.message });
        await loadAllSettings();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save SEO settings";
      onMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsLoading(true);

    try {
      const response = await deleteSEOSettings(selectedPage);
      if (response.success) {
        onMessage({ type: "success", text: response.message });
        await loadAllSettings();
        setCurrentSettings({
          pageName: selectedPage,
          metaTitle: "",
          metaDescription: "",
          keywords: "",
          ogImage: null,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete SEO settings";
      onMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const hasSettings = allSettings.some((s) => s.pageName === selectedPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          SEO Settings
        </CardTitle>
        <CardDescription>
          Manage meta tags and SEO information for different pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page Selector */}
        <div className="space-y-2">
          <Label htmlFor="page-selector" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Select Page
          </Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger id="page-selector">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_PAGES.map((page) => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                  {allSettings.some((s) => s.pageName === page.value) && (
                    <span className="ml-2 text-xs text-green-600">
                      ✓ Configured
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Meta Title */}
        <div className="space-y-2">
          <Label
            htmlFor="metaTitle"
            className="flex items-center justify-between"
          >
            <span>Meta Title</span>
            <span className="text-xs text-muted-foreground">
              {currentSettings.metaTitle?.length || 0}/60 characters
            </span>
          </Label>
          <Input
            id="metaTitle"
            value={currentSettings.metaTitle || ""}
            onChange={(e) => handleSettingsChange("metaTitle", e.target.value)}
            placeholder="Enter meta title for this page"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 50-60 characters. This appears in search results.
          </p>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label
            htmlFor="metaDescription"
            className="flex items-center justify-between"
          >
            <span>Meta Description</span>
            <span className="text-xs text-muted-foreground">
              {currentSettings.metaDescription?.length || 0}/160 characters
            </span>
          </Label>
          <Textarea
            id="metaDescription"
            value={currentSettings.metaDescription || ""}
            onChange={(e) =>
              handleSettingsChange("metaDescription", e.target.value)
            }
            placeholder="Enter meta description for this page"
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 150-160 characters. Shows up in search results below
            the title.
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Keywords
          </Label>
          <Input
            id="keywords"
            value={currentSettings.keywords || ""}
            onChange={(e) => handleSettingsChange("keywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of relevant keywords for this page.
          </p>
        </div>

        <Separator />

        {/* OG Image */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Social Media Preview Image (OG Image)
          </h3>
          <ImageUpload
            value={currentSettings.ogImage}
            onChange={(value) => handleSettingsChange("ogImage", value)}
            label="Open Graph Image"
            aspectRatio="wide"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Recommended: 1200x630px. This image appears when your page is shared
            on social media.
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !hasSettings}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Settings
          </Button>

          <Button
            onClick={saveSettings}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save SEO Settings
          </Button>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete SEO Settings"
          description={`Are you sure you want to delete SEO settings for ${selectedPage}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}
