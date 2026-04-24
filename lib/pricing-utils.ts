// Pricing calculation utilities

import { Service, OptionPricing } from "./service-api";
import { ServiceConfiguration, ItemPricing } from "./order-types";

/**
 * Find option pricing by value
 */
function findOptionPrice(
  options: OptionPricing[],
  value: string,
): OptionPricing | undefined {
  return options.find((opt) => opt.value === value);
}

/**
 * Calculate pricing for a single order item
 */
export function calculateItemPricing(
  service: Service,
  configuration: ServiceConfiguration,
  pageCount: number,
): ItemPricing {
  const { copies } = configuration;

  // Get individual option prices
  const printTypeOpt = findOptionPrice(
    service.printTypes,
    configuration.printType,
  );
  const paperSizeOpt = findOptionPrice(
    service.paperSizes,
    configuration.paperSize,
  );
  const paperTypeOpt = findOptionPrice(
    service.paperTypes,
    configuration.paperType,
  );
  const gsmOpt = findOptionPrice(service.gsmOptions, configuration.gsm);
  const printSideOpt = findOptionPrice(
    service.printSides,
    configuration.printSide,
  );
  const bindingOpt = findOptionPrice(
    service.bindingOptions,
    configuration.bindingOption,
  );

  // Calculate total pages based on print side (Sheet Count)
  let totalPages = pageCount;
  if (configuration.printSide.toLowerCase().includes("double")) {
    totalPages = Math.ceil(pageCount / 2);
  }

  // Resolve effective base price from ranges (fallback to basePricePerPage)
  const effectiveBasePrice =
    service.basePriceRanges && service.basePriceRanges.length > 0
      ? (service.basePriceRanges.find(
          (r) => totalPages >= r.min && totalPages <= r.max,
        )?.price ?? service.basePricePerPage ?? 0)
      : (service.basePricePerPage ?? 0);

  // Determine pricing type for each option (use whichever is > 0)
  const printTypePrice =
    printTypeOpt?.pricePerPage || printTypeOpt?.pricePerCopy || 0;
  const printTypeIsPerCopy =
    (printTypeOpt?.pricePerCopy || 0) > 0 &&
    (printTypeOpt?.pricePerPage || 0) === 0;

  const paperSizePrice =
    paperSizeOpt?.pricePerPage || paperSizeOpt?.pricePerCopy || 0;
  const paperSizeIsPerCopy =
    (paperSizeOpt?.pricePerCopy || 0) > 0 &&
    (paperSizeOpt?.pricePerPage || 0) === 0;

  const paperTypePrice =
    paperTypeOpt?.pricePerPage || paperTypeOpt?.pricePerCopy || 0;
  const paperTypeIsPerCopy =
    (paperTypeOpt?.pricePerCopy || 0) > 0 &&
    (paperTypeOpt?.pricePerPage || 0) === 0;

  const gsmPrice = gsmOpt?.pricePerPage || gsmOpt?.pricePerCopy || 0;
  const gsmIsPerCopy =
    (gsmOpt?.pricePerCopy || 0) > 0 && (gsmOpt?.pricePerPage || 0) === 0;

  const printSidePrice =
    printSideOpt?.pricePerPage || printSideOpt?.pricePerCopy || 0;
  const printSideIsPerCopy =
    (printSideOpt?.pricePerCopy || 0) > 0 &&
    (printSideOpt?.pricePerPage || 0) === 0;

  // Calculate Binding Price with Page Ranges support
  let bindingPrice = 0;

  if (bindingOpt?.priceRanges && bindingOpt.priceRanges.length > 0) {
    // Find matching range based on sheet count (totalPages)
    const range = bindingOpt.priceRanges.find(
      (r) => totalPages >= r.min && totalPages <= r.max,
    );
    if (range) {
      bindingPrice = range.price;
    } else {
      // Fallback if no range matches (optional: assume max range or base fixed)
      // For now, fall back to standard fixed/per-copy/per-page
      bindingPrice =
        bindingOpt?.fixedPrice ||
        bindingOpt?.pricePerCopy ||
        bindingOpt?.pricePerPage ||
        0;
    }
  } else {
    bindingPrice =
      bindingOpt?.fixedPrice ||
      bindingOpt?.pricePerCopy ||
      bindingOpt?.pricePerPage ||
      0;
  }

  const bindingIsPerCopy =
    bindingPrice > 0 || // If resolved from range/fixed, it's per copy
    (bindingOpt?.fixedPrice || 0) > 0 ||
    (bindingOpt?.pricePerCopy || 0) > 0 ||
    (bindingOpt?.pricePerPage || 0) === 0;

  // Calculate price per page (sum of all per-page prices)
  // Ensure the base total per page doesn't go below zero even with negative adjustments
  const pricePerPage = Math.max(0,
    effectiveBasePrice +
    (printTypeIsPerCopy ? 0 : printTypePrice) +
    (paperSizeIsPerCopy ? 0 : paperSizePrice) +
    (paperTypeIsPerCopy ? 0 : paperTypePrice) +
    (gsmIsPerCopy ? 0 : gsmPrice) +
    (printSideIsPerCopy ? 0 : printSidePrice) +
    (bindingIsPerCopy ? 0 : bindingPrice)
  );

  // Calculate per-copy charges
  const pricePerCopy =
    (printTypeIsPerCopy ? printTypePrice : 0) +
    (paperSizeIsPerCopy ? paperSizePrice : 0) +
    (paperTypeIsPerCopy ? paperTypePrice : 0) +
    (gsmIsPerCopy ? gsmPrice : 0) +
    (printSideIsPerCopy ? printSidePrice : 0) +
    (bindingIsPerCopy ? bindingPrice : 0);

  // Calculate subtotal: (price per page * total pages * copies) + (price per copy * copies)
  const subtotal = Math.round((pricePerPage * totalPages * copies + pricePerCopy * copies) * 100) / 100;

  return {
    basePricePerPage: effectiveBasePrice,
    printTypePrice,
    paperSizePrice,
    paperTypePrice,
    gsmPrice,
    printSidePrice,
    bindingPrice,
    printTypeIsPerCopy,
    paperSizeIsPerCopy,
    paperTypeIsPerCopy,
    gsmIsPerCopy,
    printSideIsPerCopy,
    bindingIsPerCopy,
    pricePerPage,
    pricePerCopy,
    subtotal,
    totalPages,
    copies,
  };
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(
  itemSubtotals: number[],
  deliveryCharge: number = 0,
  packingCharge: number = 0,
  discount: number = 0,
): {
  subtotal: number;
  packingCharge: number;
  discount: number;
  total: number;
} {
  const subtotal = Math.round(itemSubtotals.reduce((sum, item) => sum + item, 0) * 100) / 100;
  const total = Math.round(Math.max(
    0,
    subtotal + deliveryCharge + packingCharge - discount,
  ) * 100) / 100;
  return { subtotal, packingCharge, discount, total };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface Threshold {
  minAmount: number;
  charge: number;
}

interface PricingSettings {
  isDeliveryEnabled?: boolean;
  deliveryThresholds?: Threshold[];
  regionalDeliveryChargeTN?: number;
  regionalDeliveryChargeOutsideTN?: number;
  isPackingEnabled?: boolean;
  packingThresholds?: Threshold[];
}

/**
 * Get charge based on thresholds (used for both delivery and packing)
 */
function calculateDynamicCharge(
  amount: number,
  thresholds: Threshold[],
): number {
  if (!thresholds || thresholds.length === 0) return 0;

  // Sort thresholds by minAmount descending to find the highest applicable tier
  const sortedThresholds = [...thresholds].sort(
    (a, b) => b.minAmount - a.minAmount,
  );

  for (const threshold of sortedThresholds) {
    if (amount >= threshold.minAmount) {
      return threshold.charge;
    }
  }

  return 0;
}

/**
 * Get delivery charge based on order value, settings, and region
 */
export function getDeliveryCharge(
  subtotal: number,
  state?: string,
  settings?: PricingSettings,
): number {
  if (settings && !settings.isDeliveryEnabled) return 0;

  let baseCharge = 0;
  let regionalSurcharge = 0;

  if (settings) {
    // 1. Calculate amount-based base charge
    if (settings.deliveryThresholds && settings.deliveryThresholds.length > 0) {
      baseCharge = calculateDynamicCharge(
        subtotal,
        settings.deliveryThresholds,
      );
    } else {
      // Fallback defaults for base charge
      if (subtotal >= 500) baseCharge = 0;
      else if (subtotal >= 200) baseCharge = 30;
      else baseCharge = 50;
    }

    // 2. Add fixed regional surcharge
    const isTN =
      state?.toLowerCase().includes("tamil nadu") ||
      state?.toLowerCase() === "tn";
    if (isTN) {
      regionalSurcharge = settings.regionalDeliveryChargeTN || 0;
    } else {
      regionalSurcharge = settings.regionalDeliveryChargeOutsideTN || 0;
    }

    return baseCharge + regionalSurcharge;
  }

  // Pure fallback if no settings at all
  const isTN =
    state?.toLowerCase().includes("tamil nadu") ||
    state?.toLowerCase() === "tn";
  baseCharge = subtotal >= 500 ? 0 : subtotal >= 200 ? 30 : 50;
  regionalSurcharge = isTN ? 0 : 30; // Default outside TN is +30

  return baseCharge + regionalSurcharge;
}

/**
 * Get packing charge based on order value and settings
 */
export function getPackingCharge(subtotal: number, settings?: PricingSettings): number {
  if (settings && !settings.isPackingEnabled) return 0;

  if (settings && settings.packingThresholds) {
    return calculateDynamicCharge(subtotal, settings.packingThresholds);
  }

  // Fallback defaults
  return 0;
}
