"use client";

import { OrderItem, ServiceConfiguration } from "@/lib/order-types";
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
import { ArrowLeft, ArrowRight, FileText, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigureStepProps {
  orderItems: OrderItem[];
  activeItemIndex: number;
  onActiveItemChange: (index: number) => void;
  onConfigurationChange: (itemId: string, config: ServiceConfiguration) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function ConfigureStep({
  orderItems,
  activeItemIndex,
  onActiveItemChange,
  onConfigurationChange,
  onBack,
  onNext,
  canProceed,
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

      <div className="grid grid-cols-1 gap-6">
        {/* File Selector (for multiple files) */}
        {orderItems.length > 1 && (
          <div>
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
        <div className="space-y-6">
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
                      {service.printTypes.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="capitalize">
                            {opt.value.replace("-", " ")}
                          </span>
                        </SelectItem>
                      ))}
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
                      {service.paperSizes.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="uppercase">{opt.value}</span>
                        </SelectItem>
                      ))}
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
                      {service.paperTypes.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="capitalize">
                            {opt.value.replace("-", " ")}
                          </span>
                        </SelectItem>
                      ))}
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
                      {service.gsmOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.value} GSM
                        </SelectItem>
                      ))}
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
                      {service.printSides.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="capitalize">
                            {opt.value.replace("-", " ")}
                          </span>
                        </SelectItem>
                      ))}
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
                        .map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="capitalize">
                              {opt.value.replace("-", " ")}
                            </span>
                          </SelectItem>
                        ))}
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
