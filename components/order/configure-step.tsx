"use client";

import { OrderItem, ServiceConfiguration } from "@/lib/order-types";
import { formatPrice } from "@/lib/pricing-utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Minus,
  Plus,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigureStepProps {
  orderItems: OrderItem[];
  activeItemIndex: number;
  onActiveItemChange: (index: number) => void;
  onConfigurationChange: (itemId: string, config: ServiceConfiguration) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  subtotal: number;
}

export function ConfigureStep({
  orderItems,
  activeItemIndex,
  onActiveItemChange,
  onConfigurationChange,
  onBack,
  onNext,
  canProceed,
  subtotal,
}: ConfigureStepProps) {
  const activeItem = orderItems[activeItemIndex];

  if (!activeItem) {
    return null;
  }

  const service = activeItem.service; // Get service from the active item

  const updateConfig = (
    key: keyof ServiceConfiguration,
    value: string | number,
  ) => {
    onConfigurationChange(activeItem.id, {
      ...activeItem.configuration,
      [key]: value,
    });
  };

  const incrementCopies = () => {
    updateConfig("copies", activeItem.configuration.copies + 1);
  };

  const decrementCopies = () => {
    if (activeItem.configuration.copies > 1) {
      updateConfig("copies", activeItem.configuration.copies - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Configure Your Print
        </h2>
        <p className="text-muted-foreground">
          Customize the print settings for each file. The price updates
          automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Selector (for multiple files) */}
        {orderItems.length > 1 && (
          <div className="lg:col-span-3">
            <Label className="text-sm font-medium mb-3 block">
              Select File to Configure
            </Label>
            <div className="flex flex-wrap gap-2">
              {orderItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onActiveItemChange(index)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                    index === activeItemIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.file.pageCount} pages)
                  </span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                    {item.serviceName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 flex-wrap">
              <FileText className="h-5 w-5 text-primary" />
              {activeItem.file.name}
              <span className="text-sm font-normal text-muted-foreground">
                ({activeItem.file.pageCount} pages)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                {activeItem.serviceName}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Print Type */}
              {service.printTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Print Type</Label>
                  <Select
                    value={activeItem.configuration.printType}
                    onValueChange={(v) => updateConfig("printType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select print type" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.printTypes.map((opt) => {
                        const isPerCopy =
                          (opt.pricePerCopy || 0) > 0 &&
                          (opt.pricePerPage || 0) === 0;
                        const price = isPerCopy
                          ? opt.pricePerCopy
                          : opt.pricePerPage;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="capitalize">
                              {opt.value.replace("-", " ")}
                            </span>
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (+₹{price}/{isPerCopy ? "copy" : "page"})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Paper Size */}
              {service.paperSizes.length > 0 && (
                <div className="space-y-2">
                  <Label>Paper Size</Label>
                  <Select
                    value={activeItem.configuration.paperSize}
                    onValueChange={(v) => updateConfig("paperSize", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.paperSizes.map((opt) => {
                        const isPerCopy =
                          (opt.pricePerCopy || 0) > 0 &&
                          (opt.pricePerPage || 0) === 0;
                        const price = isPerCopy
                          ? opt.pricePerCopy
                          : opt.pricePerPage;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="uppercase">{opt.value}</span>
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (+₹{price}/{isPerCopy ? "copy" : "page"})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Paper Type */}
              {service.paperTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Paper Type</Label>
                  <Select
                    value={activeItem.configuration.paperType}
                    onValueChange={(v) => updateConfig("paperType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.paperTypes.map((opt) => {
                        const isPerCopy =
                          (opt.pricePerCopy || 0) > 0 &&
                          (opt.pricePerPage || 0) === 0;
                        const price = isPerCopy
                          ? opt.pricePerCopy
                          : opt.pricePerPage;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="capitalize">
                              {opt.value.replace("-", " ")}
                            </span>
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (+₹{price}/{isPerCopy ? "copy" : "page"})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* GSM */}
              {service.gsmOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Paper GSM</Label>
                  <Select
                    value={activeItem.configuration.gsm}
                    onValueChange={(v) => updateConfig("gsm", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GSM" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.gsmOptions.map((opt) => {
                        const isPerCopy =
                          (opt.pricePerCopy || 0) > 0 &&
                          (opt.pricePerPage || 0) === 0;
                        const price = isPerCopy
                          ? opt.pricePerCopy
                          : opt.pricePerPage;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.value} GSM
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (+₹{price}/{isPerCopy ? "copy" : "page"})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Print Side */}
              {service.printSides.length > 0 && (
                <div className="space-y-2">
                  <Label>Print Side</Label>
                  <Select
                    value={activeItem.configuration.printSide}
                    onValueChange={(v) => updateConfig("printSide", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select print side" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.printSides.map((opt) => {
                        const isPerCopy =
                          (opt.pricePerCopy || 0) > 0 &&
                          (opt.pricePerPage || 0) === 0;
                        const price = isPerCopy
                          ? opt.pricePerCopy
                          : opt.pricePerPage;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="capitalize">
                              {opt.value.replace("-", " ")}
                            </span>
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (+₹{price}/{isPerCopy ? "copy" : "page"})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Binding Option */}
              {service.bindingOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Binding</Label>
                  <Select
                    value={activeItem.configuration.bindingOption}
                    onValueChange={(v) => updateConfig("bindingOption", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select binding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Binding</SelectItem>
                      {service.bindingOptions
                        .filter((opt) => {
                          // New Logic: Check priceRanges first
                          if (opt.priceRanges && opt.priceRanges.length > 0) {
                            // Optionally filter if page count is strictly outside all ranges?
                            // For now, we'll allow it and let it fall back to fixedPrice (or show 0)
                            return true;
                          }

                          // Legacy Logic: Filter based on minPages for multi-option ranges
                          const pageCount = activeItem.file.pageCount;
                          const min = opt.minPages || 0;

                          // If we have ranged options defined as separate entries, use smart filtering
                          // Get all distinct start pages (minPages) sorted ascending
                          const startPages = Array.from(
                            new Set(
                              service.bindingOptions.map(
                                (o) => o.minPages || 0,
                              ),
                            ),
                          ).sort((a, b) => a - b);

                          // Find the next start page cutoff
                          const currentIdx = startPages.indexOf(min);
                          const nextStartPage = startPages[currentIdx + 1];

                          // Determine max for this option
                          const derivedMax =
                            nextStartPage !== undefined
                              ? nextStartPage - 1
                              : Infinity;

                          return pageCount >= min && pageCount <= derivedMax;
                        })
                        .map((opt) => {
                          // Calculate dynamic price
                          const pageCount = activeItem.file.pageCount;
                          const printSide = activeItem.configuration.printSide;
                          const totalSheets =
                            printSide === "double-side"
                              ? Math.ceil(pageCount / 2)
                              : pageCount;

                          let price = opt.fixedPrice || 0;

                          if (opt.priceRanges && opt.priceRanges.length > 0) {
                            const match = opt.priceRanges.find(
                              (r) =>
                                totalSheets >= r.min && totalSheets <= r.max,
                            );
                            if (match) {
                              price = match.price;
                            }
                          } else {
                            // Legacy fallback
                            price =
                              (opt.fixedPrice || 0) > 0
                                ? opt.fixedPrice || 0
                                : Math.max(
                                    opt.pricePerCopy || 0,
                                    opt.pricePerPage || 0,
                                  );
                          }

                          const isPerCopy = true; // Binding is generally per copy

                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="capitalize">
                                {opt.value.replace("-", " ")}
                              </span>
                              {price > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  (+₹{price}/{isPerCopy ? "copy" : "page"})
                                </span>
                              )}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Number of Copies */}
              <div className="space-y-2">
                <Label>Number of Copies</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementCopies}
                    disabled={activeItem.configuration.copies <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={activeItem.configuration.copies}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      updateConfig("copies", Math.max(1, val));
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementCopies}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-4">
            <h3 className="font-semibold text-foreground mb-4">
              Price Breakdown
            </h3>

            {/* Current Item Pricing */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price</span>
                <span>₹{activeItem.pricing.basePricePerPage}/page</span>
              </div>
              {activeItem.pricing.printTypePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print Type</span>
                  <span>
                    +₹{activeItem.pricing.printTypePrice}/
                    {(service.printTypes.find(
                      (opt) => opt.value === activeItem.configuration.printType,
                    )?.pricePerCopy || 0) > 0
                      ? "copy"
                      : "page"}
                  </span>
                </div>
              )}
              {activeItem.pricing.paperSizePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paper Size</span>
                  <span>
                    +₹{activeItem.pricing.paperSizePrice}/
                    {(service.paperSizes.find(
                      (opt) => opt.value === activeItem.configuration.paperSize,
                    )?.pricePerCopy || 0) > 0
                      ? "copy"
                      : "page"}
                  </span>
                </div>
              )}
              {activeItem.pricing.paperTypePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paper Type</span>
                  <span>
                    +₹{activeItem.pricing.paperTypePrice}/
                    {(service.paperTypes.find(
                      (opt) => opt.value === activeItem.configuration.paperType,
                    )?.pricePerCopy || 0) > 0
                      ? "copy"
                      : "page"}
                  </span>
                </div>
              )}
              {activeItem.pricing.gsmPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GSM</span>
                  <span>
                    +₹{activeItem.pricing.gsmPrice}/
                    {(service.gsmOptions.find(
                      (opt) => opt.value === activeItem.configuration.gsm,
                    )?.pricePerCopy || 0) > 0
                      ? "copy"
                      : "page"}
                  </span>
                </div>
              )}
              {activeItem.pricing.printSidePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print Side</span>
                  <span>
                    +₹{activeItem.pricing.printSidePrice}/
                    {(service.printSides.find(
                      (opt) => opt.value === activeItem.configuration.printSide,
                    )?.pricePerCopy || 0) > 0
                      ? "copy"
                      : "page"}
                  </span>
                </div>
              )}
              {activeItem.pricing.bindingPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Binding</span>
                  <span>
                    +₹{activeItem.pricing.bindingPrice}/
                    {(service.bindingOptions.find(
                      (opt) =>
                        opt.value === activeItem.configuration.bindingOption,
                    )?.pricePerPage || 0) > 0
                      ? "page"
                      : "copy"}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per page</span>
                  <span className="font-medium">
                    ₹{activeItem.pricing.pricePerPage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages × Copies</span>
                  <span>
                    {activeItem.pricing.totalPages} ×{" "}
                    {activeItem.pricing.copies}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-medium">
                <span>This File</span>
                <span>{formatPrice(activeItem.pricing.subtotal)}</span>
              </div>
            </div>

            {/* Total for all items */}
            {orderItems.length > 1 && (
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>All Files ({orderItems.length})</span>
                </div>
              </div>
            )}

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          Review Order
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
