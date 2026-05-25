"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberStepper } from "@/components/ui/number-stepper";

export function BindingRangeEditor({
  ranges = [],
  onChange,
}: {
  ranges?: { min: number; max: number; price: number }[];
  onChange: (ranges: { min: number; max: number; price: number }[]) => void;
}) {
  const addRange = () => {
    // Determine next start page automatically
    const maxPageSoFar = ranges.reduce((max, r) => Math.max(max, r.max), 0);
    const nextStart = maxPageSoFar > 0 ? maxPageSoFar + 1 : 1;
    onChange([...ranges, { min: nextStart, max: nextStart + 49, price: 0 }]);
  };

  const updateRange = (
    index: number,
    field: "min" | "max" | "price",
    value: number,
  ) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    onChange(newRanges);
  };

  const removeRange = (index: number) => {
    onChange(ranges.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="space-y-3">
        {ranges.length === 0 && (
          <div className="text-center py-4 border border-dashed rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">
              No specific price ranges defined.
            </p>
          </div>
        )}

        {ranges.map((range, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Range {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRange(idx)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove range"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Min Pgs
                </label>
                <NumberStepper
                  value={range.min}
                  onChange={(v) => updateRange(idx, "min", v)}
                  min={0}
                  step={1}
                  size="sm"
                  ariaLabel="Range min pages"
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Max Pgs
                </label>
                <NumberStepper
                  value={range.max === Infinity ? 0 : range.max}
                  onChange={(v) => updateRange(idx, "max", v)}
                  min={0}
                  step={1}
                  size="sm"
                  placeholder="∞"
                  ariaLabel="Range max pages"
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Price (₹)
                </label>
                <NumberStepper
                  value={range.price}
                  onChange={(v) => updateRange(idx, "price", v)}
                  min={0}
                  step={1}
                  size="sm"
                  ariaLabel="Range price"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addRange}
        className="w-full border-dashed h-9 hover:bg-primary/5 hover:border-primary/50 text-primary/80"
      >
        <Plus className="h-3.5 w-3.5 mr-2" /> Add Price Range
      </Button>
    </div>
  );
}
