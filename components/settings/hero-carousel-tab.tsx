"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
  ChevronUp,
  ChevronDown,
  Layout,
  ExternalLink,
  Edit2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Printer,
  FileText,
  Image as ImageIconIcon,
  ShoppingBag,
  Zap,
  Star,
  Settings as SettingsIcon,
  Globe,
  Truck,
  Palette,
  Layers,
  ShieldCheck,
  Clock,
  Gift,
  Scan,
  BookOpen,
  Tags,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  getAllHeroSlides,
  upsertHeroSlide,
  deleteHeroSlide,
  HeroSlide,
} from "@/lib/hero-slide-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HeroCarouselTabProps {
  onMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function HeroCarouselTab({ onMessage }: HeroCarouselTabProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadSlides = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllHeroSlides();
      if (res.success) {
        setSlides(res.data);
      }
    } catch (error) {
      console.error("Failed to load hero slides:", error);
      onMessage({ type: "error", text: "Failed to load hero slides" });
    } finally {
      setIsLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const handleSave = async () => {
    if (!editingSlide?.title || !editingSlide?.image) {
      toast.error("Title and Image are required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await upsertHeroSlide({
        id: editingSlide._id,
        ...editingSlide,
      });

      if (res.success) {
        toast.success(editingSlide._id ? "Slide updated" : "Slide created");
        setEditingSlide(null);
        await loadSlides();
      }
    } catch (error) {
      console.error("Save slide error:", error);
      toast.error("Failed to save slide");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const res = await deleteHeroSlide(deleteConfirm);
      if (res.success) {
        toast.success("Slide deleted");
        await loadSlides();
      }
    } catch (error) {
      console.error("Delete slide error:", error);
      toast.error("Failed to delete slide");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await upsertHeroSlide({
        id: slide._id,
        isActive: !slide.isActive,
      });
      if (res.success) {
        toast.success(
          res.data.isActive ? "Slide activated" : "Slide deactivated",
        );
        await loadSlides();
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update status");
    }
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap positions
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Update orders
    try {
      await Promise.all(
        newSlides.map((s, idx) =>
          upsertHeroSlide({
            id: s._id,
            order: idx + 1,
            title: s.title,
            image: s.image,
            isActive: s.isActive,
          }),
        ),
      );
      await loadSlides();
      toast.success("Order updated");
    } catch (error) {
      console.error("Move slide error:", error);
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Hero Carousel Management
            </CardTitle>
            <CardDescription>
              Add, edit or remove slides from your home page hero section
            </CardDescription>
          </div>
          <Button
            onClick={() =>
              setEditingSlide({
                title: "",
                subtitle: "",
                image: null,
                features: [],
                ctaText: "Get Started",
                ctaLink: "/services",
                secondaryCtaText: "Learn More",
                secondaryCtaLink: "/about",
                isActive: true,
                order: slides.length + 1,
                iconName: "Printer",
              })
            }
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Slide
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading slides...</p>
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                No slides found. Create your first slide to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-card/50 shadow-sm transition-all hover:shadow-md",
                    !slide.isActive && "opacity-60 saturate-50",
                  )}
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={typeof slide.image === "string" ? slide.image : ""}
                      alt={slide.title}
                      width={1920}
                      height={1080}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold truncate text-lg">
                        {slide.title}
                      </h3>
                      <Badge
                        variant={slide.isActive ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {slide.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {slide.subtitle || "No description provided"}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setEditingSlide(slide)}
                        title="Edit Slide"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-9 w-9",
                          slide.isActive
                            ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                            : "text-green-600 border-green-200 hover:bg-green-50",
                        )}
                        onClick={() => handleToggleActive(slide)}
                        title={slide.isActive ? "Deactivate" : "Activate"}
                      >
                        {slide.isActive ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => slide._id && handleDelete(slide._id)}
                        title="Delete Slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => moveSlide(index, "up")}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === slides.length - 1}
                          onClick={() => moveSlide(index, "down")}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide Editor Modal/Overlay */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="sticky top-0 bg-background z-10 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {editingSlide._id ? "Edit Slide" : "Create New Slide"}
                  </CardTitle>
                  <CardDescription>
                    Configure the content and appearance of your hero slide
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingSlide(null)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Slide Title *</Label>
                    <Input
                      id="title"
                      value={editingSlide.title}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Premium Business Cards"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iconName">Visual Icon</Label>
                    <Select
                      value={editingSlide.iconName}
                      onValueChange={(val) =>
                        setEditingSlide({ ...editingSlide, iconName: val })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { name: "Printer", icon: Printer },
                          { name: "FileText", icon: FileText },
                          { name: "Image", icon: ImageIconIcon },
                          { name: "CreditCard", icon: CreditCard },
                          { name: "ShoppingBag", icon: ShoppingBag },
                          { name: "Zap", icon: Zap },
                          { name: "Star", icon: Star },
                          { name: "Globe", icon: Globe },
                          { name: "Truck", icon: Truck },
                          { name: "Palette", icon: Palette },
                          { name: "Layers", icon: Layers },
                          { name: "ShieldCheck", icon: ShieldCheck },
                          { name: "Clock", icon: Clock },
                          { name: "Gift", icon: Gift },
                          { name: "Scan", icon: Scan },
                          { name: "BookOpen", icon: BookOpen },
                          { name: "Tags", icon: Tags },
                          { name: "Settings", icon: SettingsIcon },
                        ].map((item) => (
                          <SelectItem
                            key={item.name}
                            value={item.name}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-primary" />
                              <span>{item.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle / Description</Label>
                    <Textarea
                      id="subtitle"
                      value={editingSlide.subtitle}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Explain what this service offers..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Features (Comma separated)</Label>
                    <Input
                      value={editingSlide.features?.join(", ")}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          features: e.target.value
                            .split(",")
                            .map((f) => f.trim())
                            .filter((f) => f),
                        })
                      }
                      placeholder="e.g. Same-day service, Quality paper, Low price"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingSlide.features?.map((f, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="px-2 py-1"
                        >
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <ImageUpload
                    value={editingSlide.image || ""}
                    onChange={(val) =>
                      setEditingSlide({ ...editingSlide, image: val })
                    }
                    label="Hero Slide Image *"
                    aspectRatio="video"
                    recommendation="Recommended size: 1920x1080px"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Primary Call to Action
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ctaText">Button Text</Label>
                      <Input
                        id="ctaText"
                        value={editingSlide.ctaText}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            ctaText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaLink">Destination Page</Label>
                      <Select
                        value={editingSlide.ctaLink}
                        onValueChange={(val) =>
                          setEditingSlide({ ...editingSlide, ctaLink: val })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Choose page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Home Page</SelectItem>
                          <SelectItem value="/services">
                            Our Services
                          </SelectItem>
                          <SelectItem value="/about">About Us</SelectItem>
                          <SelectItem value="/contact">Contact Page</SelectItem>
                          <SelectItem value="/login">Login Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label
                      htmlFor="ctaLinkCustom"
                      className="text-[10px] text-muted-foreground"
                    >
                      Or Enter Custom URL
                    </Label>
                    <Input
                      id="ctaLinkCustom"
                      value={editingSlide.ctaLink}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          ctaLink: e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Secondary Call to
                    Action
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sCtaText">Button Text</Label>
                      <Input
                        id="sCtaText"
                        value={editingSlide.secondaryCtaText}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            secondaryCtaText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sCtaLink">Destination Page</Label>
                      <Select
                        value={editingSlide.secondaryCtaLink}
                        onValueChange={(val) =>
                          setEditingSlide({
                            ...editingSlide,
                            secondaryCtaLink: val,
                          })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Choose page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Home Page</SelectItem>
                          <SelectItem value="/services">
                            Our Services
                          </SelectItem>
                          <SelectItem value="/about">About Us</SelectItem>
                          <SelectItem value="/contact">Contact Page</SelectItem>
                          <SelectItem value="/login">Login Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label
                      htmlFor="sCtaLinkCustom"
                      className="text-[10px] text-muted-foreground"
                    >
                      Or Enter Custom URL
                    </Label>
                    <Input
                      id="sCtaLinkCustom"
                      value={editingSlide.secondaryCtaLink}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          secondaryCtaLink: e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t sticky bottom-0 bg-background py-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto px-10 h-12 font-bold"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingSlide._id ? "Update Slide" : "Create Slide"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingSlide(null)}
                  className="w-full md:w-auto px-10 h-12 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Slide"
        description="Are you sure you want to delete this slide? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
