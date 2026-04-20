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
      {ranges.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-3 px-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Min Pgs
          </label>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Max Pgs
          </label>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Price (₹)
          </label>
          <div className="w-8" />
        </div>
      )}

      <div className="space-y-2">
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
            className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-3 items-center group"
          >
            <NumberStepper
              value={range.min}
              onChange={(v) => updateRange(idx, "min", v)}
              min={0}
              step={1}
              ariaLabel="Range min pages"
              className="w-full"
            />
            <NumberStepper
              value={range.max === Infinity ? 0 : range.max}
              onChange={(v) => updateRange(idx, "max", v)}
              min={0}
              step={1}
              placeholder="∞"
              ariaLabel="Range max pages"
              className="w-full"
            />
            <NumberStepper
              value={range.price}
              onChange={(v) => updateRange(idx, "price", v)}
              min={0}
              step={1}
              ariaLabel="Range price"
              className="w-full"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeRange(idx)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
