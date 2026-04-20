"use client";

import { useState, useEffect } from "react";
import { X, Save, IndianRupee, Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllServiceOptions,
  upsertService,
  type Service,
  type ServiceOption,
  type OptionPricing,
} from "@/lib/service-api";
import { ImageUpload } from "@/components/ui/image-upload";
import { CategoryManagerDialog } from "./category-manager-dialog";
import { BindingRangeEditor } from "./binding-range-editor";
import { NumberStepper } from "@/components/ui/number-stepper";
import { cn } from "@/lib/utils";

interface ServiceFormModalProps {
  service?: Service;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategorySectionProps {
  id: keyof Service;
  label: string;
  category: string;
  options: ServiceOption[];
  formData: Partial<Service>;
  toggleOption: (category: keyof Service, option: ServiceOption) => void;
  updateOptionPrice: (
    category: keyof Service,
    value: string,
    pricingType: "perPage" | "perCopy",
    amount: number,
  ) => void;
  setManagerConfig: (
    config: { category: string; label: string } | null,
  ) => void;
  updateOptionRanges?: (
    category: keyof Service,
    value: string,
    ranges: { min: number; max: number; price: number }[],
  ) => void;
}

function CategorySection({
  id,
  label,
  category,
  options: categoryOptions,
  formData,
  toggleOption,
  updateOptionPrice,
  setManagerConfig,
  updateOptionRanges,
}: CategorySectionProps) {
  const selectedOptions = (formData[id] as OptionPricing[]) || [];
  const availableOptions = categoryOptions?.filter(
    (opt) => !selectedOptions.find((o) => o.value === opt.value),
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor={category} className="text-sm font-medium">
          {label} ({selectedOptions.length} selected)
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setManagerConfig({ category, label })}
          className="h-8 gap-1.5 text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Manage
        </Button>
      </div>

      <Select
        onValueChange={(val) => {
          const opt = categoryOptions?.find((o) => o.value === val);
          if (opt) toggleOption(id, opt);
        }}
      >
        <SelectTrigger id={category} className="h-10 rounded-lg">
          <SelectValue placeholder={`Add ${label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {availableOptions?.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              All added
            </div>
          ) : (
            availableOptions?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedOptions.length > 0 && (
        <div className="space-y-2">
          {selectedOptions.map((selected) => {
            const isPerPage = selected.pricePerPage !== 0;
            return (
              <div
                key={selected.value}
                className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg border border-border/30"
              >
                <span className="text-sm flex-1">
                  {category === "bindingOption" ? (
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selected.value}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground mr-1">
                            Base:
                          </span>
                          <NumberStepper
                            size="sm"
                            value={selected.fixedPrice || 0}
                            onChange={(v) =>
                              updateOptionPrice(
                                id,
                                selected.value,
                                "perCopy",
                                v,
                              )
                            }
                            step={1}
                            min={0}
                            placeholder="₹"
                            ariaLabel="Binding fixed price"
                            className="w-24"
                          />
                        </div>
                      </div>
                      {updateOptionRanges && (
                        <BindingRangeEditor
                          ranges={selected.priceRanges || []}
                          onChange={(ranges) =>
                            updateOptionRanges(id, selected.value, ranges)
                          }
                        />
                      )}
                    </div>
                  ) : (
                    selected.value
                  )}
                </span>

                {category !== "bindingOption" && (
                  <>
                    <Select
                      defaultValue={isPerPage ? "perPage" : "perCopy"}
                      onValueChange={(type) => {
                        const amount = isPerPage
                          ? selected.pricePerPage
                          : selected.pricePerCopy;
                        updateOptionPrice(
                          id,
                          selected.value,
                          type as "perPage" | "perCopy",
                          amount,
                        );
                      }}
                    >
                      <SelectTrigger className="h-8 w-20 text-xs rounded">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perPage">Per Page</SelectItem>
                        <SelectItem value="perCopy">Per Copy</SelectItem>
                      </SelectContent>
                    </Select>

                    <NumberStepper
                      size="sm"
                      value={
                        isPerPage
                          ? selected.pricePerPage
                          : selected.pricePerCopy
                      }
                      onChange={(v) => {
                        const type = isPerPage ? "perPage" : "perCopy";
                        updateOptionPrice(id, selected.value, type, v);
                      }}
                      step={1}
                      min={category === "printSide" ? undefined : 0}
                      placeholder="₹"
                      ariaLabel="Option price"
                      className="w-28"
                    />
                  </>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const opt = categoryOptions?.find(
                      (o) => o.value === selected.value,
                    );
                    if (opt) toggleOption(id, opt);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ServiceFormModal({
  service,
  onClose,
  onSuccess,
}: ServiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ [key: string]: ServiceOption[] }>(
    {},
  );
  const [formData, setFormData] = useState<Partial<Service>>(
    service || {
      name: "",
      image: null,
      basePricePerPage: 0,
      basePriceRanges: [],
      customQuotation: false,
      printTypes: [],
      paperSizes: [],
      paperTypes: [],
      gsmOptions: [],
      printSides: [],
      bindingOptions: [],
      status: "active",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managerConfig, setManagerConfig] = useState<{
    category: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const categories = [
        "printType",
        "paperSize",
        "paperType",
        "gsm",
        "printSide",
        "bindingOption",
      ];
      const results = await Promise.all(
        categories.map((cat) => getAllServiceOptions(cat, true)),
      );
      const newOptions: { [key: string]: ServiceOption[] } = {};
      categories.forEach((cat, index) => {
        newOptions[cat] = results[index].data;
      });
      setOptions(newOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to load options");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Service name validation
    const name = formData.name?.trim() || "";
    if (!name) {
      newErrors.name = "Service name is required";
    } else if (name.length < 2) {
      newErrors.name = "Service name must be at least 2 characters";
    } else if (name.length > 100) {
      newErrors.name = "Service name must be less than 100 characters";
    }

    // Base price validation
    const basePrice = formData.basePricePerPage ?? 0;
    const basePriceRanges = formData.basePriceRanges || [];
    if (basePrice < 0) {
      newErrors.basePricePerPage = "Price cannot be negative";
    } else if (
      !formData.customQuotation &&
      basePrice === 0 &&
      basePriceRanges.length === 0
    ) {
      newErrors.basePricePerPage =
        "Base price (fallback or at least one price range) is required";
    }

    for (const range of basePriceRanges) {
      if (range.min < 0 || range.max < 0 || range.price < 0) {
        newErrors.basePricePerPage =
          "Base price ranges cannot have negative values";
        break;
      }
      if (range.min >= range.max) {
        newErrors.basePricePerPage =
          "Base price range min must be less than max";
        break;
      }
    }

    // Option validations (only for non-custom-quotation services)
    if (!formData.customQuotation) {
      const printTypes = (formData.printTypes as OptionPricing[]) || [];
      const paperSizes = (formData.paperSizes as OptionPricing[]) || [];

      if (printTypes.length === 0) {
        newErrors.printTypes = "At least one print type is required";
      }
      if (paperSizes.length === 0) {
        newErrors.paperSizes = "At least one paper size is required";
      }

      // Validate option prices
      const optionCategories = [
        { key: "printTypes", label: "Print Types", data: printTypes },
        { key: "paperSizes", label: "Paper Sizes", data: paperSizes },
        {
          key: "paperTypes",
          label: "Paper Types",
          data: (formData.paperTypes as OptionPricing[]) || [],
        },
        {
          key: "gsmOptions",
          label: "GSM Options",
          data: (formData.gsmOptions as OptionPricing[]) || [],
        },
        {
          key: "printSides",
          label: "Print Sides",
          data: (formData.printSides as OptionPricing[]) || [],
        },
      ];

      for (const { key, label, data } of optionCategories) {
        for (const opt of data) {
          const price = (opt.pricePerPage || 0) + (opt.pricePerCopy || 0);
          // Only allow negative prices for printSides
          if (price < 0 && key !== "printSides") {
            newErrors[key] = `${label} cannot have negative prices`;
            break;
          }
        }
      }

      // Validate binding options
      const bindingOpts = (formData.bindingOptions as OptionPricing[]) || [];
      for (const opt of bindingOpts) {
        if ((opt.fixedPrice || 0) < 0) {
          newErrors.bindingOptions =
            "Binding options cannot have negative prices";
          break;
        }
        if (opt.priceRanges) {
          for (const range of opt.priceRanges) {
            if (range.min < 0 || range.max < 0 || range.price < 0) {
              newErrors.bindingOptions =
                "Binding price ranges cannot have negative values";
              break;
            }
            if (range.min >= range.max) {
              newErrors.bindingOptions =
                "Binding range min must be less than max";
              break;
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const serviceData = {
        ...formData,
        name: formData.name?.trim() || "",
      };

      const res = service?._id
        ? await upsertService({ id: service._id, ...serviceData })
        : await upsertService(serviceData as Service);
      if (res.success) {
        toast.success(service ? "Service updated" : "Service created");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to save");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (category: keyof Service, option: ServiceOption) => {
    const currentList = (formData[category] as OptionPricing[]) || [];
    const exists = currentList.find((item) => item.value === option.value);

    if (exists) {
      setFormData({
        ...formData,
        [category]: currentList.filter((item) => item.value !== option.value),
      });
    } else {
      setFormData({
        ...formData,
        [category]: [
          ...currentList,
          {
            value: option.value,
            pricePerPage: option.pricePerPage || 0,
            pricePerCopy: option.pricePerCopy || 0,
            minPages: option.minPages || 0,
            fixedPrice: option.fixedPrice || 0,
            priceRanges: option.priceRanges || [],
          },
        ],
      });
    }
  };

  const updateOptionPrice = (
    category: keyof Service,
    value: string,
    pricingType: "perPage" | "perCopy",
    amount: number,
  ) => {
    const currentList = (formData[category] as OptionPricing[]) || [];
    const updated = currentList.map((item) => {
      if (item.value === value) {
        return pricingType === "perPage"
          ? { ...item, pricePerPage: amount, pricePerCopy: 0 }
          : { ...item, pricePerCopy: amount, pricePerPage: 0 };
      }
      return item;
    });
    setFormData({ ...formData, [category]: updated });
  };

  const updateOptionRanges = (
    category: keyof Service,
    value: string,
    ranges: { min: number; max: number; price: number }[],
  ) => {
    const currentList = (formData[category] as OptionPricing[]) || [];
    const updated = currentList.map((item) => {
      if (item.value === value) {
        return { ...item, priceRanges: ranges };
      }
      return item;
    });
    setFormData({ ...formData, [category]: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background w-full max-w-2xl rounded-xl border border-border/50 shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">
              {service ? "Update Service" : "Create Service"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Service Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g., Printing, Design"
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={cn("h-10 rounded-lg", errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Service Image
            </label>
            <ImageUpload
              value={formData.image || null}
              onChange={(image) => setFormData({ ...formData, image })}
            />
          </div>

          <div className="space-y-3 border border-border/50 p-4 rounded-lg bg-muted/20">
            <div className="flex justify-between items-center">
              <label htmlFor="basePrice" className="text-sm font-medium">
                Base Price Per Page <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground">
                Fallback when no range matches
              </span>
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-12 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <NumberStepper
                id="basePrice"
                value={formData.basePricePerPage || 0}
                onChange={(v) => {
                  setFormData({ ...formData, basePricePerPage: v });
                  if (errors.basePricePerPage)
                    setErrors({ ...errors, basePricePerPage: "" });
                }}
                step={1}
                min={0}
                placeholder="Fallback base price"
                leftPadding="pl-5"
                className={cn(
                  "w-full",
                  errors.basePricePerPage && "border-red-500",
                )}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price Ranges by Page Count
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Define per-page price based on total sheet count (e.g., 0–50
                pages, 51–100 pages).
              </p>
              <BindingRangeEditor
                ranges={formData.basePriceRanges || []}
                onChange={(ranges) => {
                  setFormData({ ...formData, basePriceRanges: ranges });
                  if (errors.basePricePerPage)
                    setErrors({ ...errors, basePricePerPage: "" });
                }}
              />
            </div>

            {errors.basePricePerPage && (
              <p className="text-xs text-red-500">{errors.basePricePerPage}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 border border-border/50 p-4 rounded-lg bg-muted/20">
            <Switch
              id="customQuotation"
              checked={formData.customQuotation || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, customQuotation: checked })
              }
            />
            <div className="items-center gap-2">
              <Label
                htmlFor="customQuotation"
                className="text-sm font-semibold"
              >
                Custom Quotation Service
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable this to treat orders as leads without immediate print
                configuration.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={formData.status || "active"}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  status: val as "active" | "inactive",
                })
              }
            >
              <SelectTrigger id="status" className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!formData.customQuotation && (
            <div className="border-t border-border/50 pt-5">
              <h3 className="text-sm font-semibold mb-4">Service Options</h3>
              <div className="space-y-5">
                <div>
                  <CategorySection
                    id="printTypes"
                    label="Print Types"
                    category="printType"
                    options={options.printType || []}
                    formData={formData}
                    toggleOption={toggleOption}
                    updateOptionPrice={updateOptionPrice}
                    setManagerConfig={setManagerConfig}
                  />
                  {errors.printTypes && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.printTypes}
                    </p>
                  )}
                </div>
                <div>
                  <CategorySection
                    id="paperSizes"
                    label="Paper Sizes"
                    category="paperSize"
                    options={options.paperSize || []}
                    formData={formData}
                    toggleOption={toggleOption}
                    updateOptionPrice={updateOptionPrice}
                    setManagerConfig={setManagerConfig}
                  />
                  {errors.paperSizes && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.paperSizes}
                    </p>
                  )}
                </div>
                <CategorySection
                  id="paperTypes"
                  label="Paper Types"
                  category="paperType"
                  options={options.paperType || []}
                  formData={formData}
                  toggleOption={toggleOption}
                  updateOptionPrice={updateOptionPrice}
                  setManagerConfig={setManagerConfig}
                />
                <CategorySection
                  id="gsmOptions"
                  label="GSM Options"
                  category="gsm"
                  options={options.gsm || []}
                  formData={formData}
                  toggleOption={toggleOption}
                  updateOptionPrice={updateOptionPrice}
                  setManagerConfig={setManagerConfig}
                />
                <CategorySection
                  id="printSides"
                  label="Print Sides"
                  category="printSide"
                  options={options.printSide || []}
                  formData={formData}
                  toggleOption={toggleOption}
                  updateOptionPrice={updateOptionPrice}
                  setManagerConfig={setManagerConfig}
                />
                <div>
                  <CategorySection
                    id="bindingOptions"
                    label="Binding Options"
                    category="bindingOption"
                    options={options.bindingOption || []}
                    formData={formData}
                    toggleOption={toggleOption}
                    updateOptionPrice={updateOptionPrice}
                    setManagerConfig={setManagerConfig}
                    updateOptionRanges={updateOptionRanges}
                  />
                  {errors.bindingOptions && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bindingOptions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="h-10 rounded-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Service"}
          </Button>
        </div>
      </div>

      {managerConfig && (
        <CategoryManagerDialog
          category={managerConfig.category}
          categoryLabel={managerConfig.label}
          options={options[managerConfig.category] || []}
          onClose={() => setManagerConfig(null)}
          onRefresh={fetchOptions}
        />
      )}
    </div>
  );
}
