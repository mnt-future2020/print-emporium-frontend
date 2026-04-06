"use client";

import { Plus, Trash2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={range.min}
              onChange={(e) => updateRange(idx, "min", Number(e.target.value))}
              className="h-9 px-3 text-sm"
            />
            <Input
              type="number"
              placeholder="∞"
              min={0}
              value={range.max === Infinity ? "" : range.max} // Handle Infinity conceptually if we supported it
              onChange={(e) => updateRange(idx, "max", Number(e.target.value))}
              className="h-9 px-3 text-sm"
            />

            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                min={0}
                value={range.price}
                onChange={(e) =>
                  updateRange(idx, "price", Number(e.target.value))
                }
                className="h-9 pl-8 pr-3 text-sm"
              />
            </div>

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
