"use client";

import { useState, useCallback, useEffect } from "react";
import { Service } from "@/lib/service-api";
import {
  OrderItem,
  OrderStep,
  UploadedFile,
  ServiceConfiguration,
  DeliveryInfo,
  DEFAULT_CONFIGURATION,
  DEFAULT_DELIVERY_INFO,
} from "@/lib/order-types";
import {
  calculateItemPricing,
  getDeliveryCharge,
  getPackingCharge,
  calculateOrderTotals,
} from "@/lib/pricing-utils";
import { axiosInstance } from "@/lib/axios";
import { generateId } from "@/lib/file-utils";
import { StepIndicator } from "./step-indicator";
import { FileUploadStep } from "./file-upload-step";
import { ConfigureStep } from "./configure-step";
import { ReviewStep } from "./review-step";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderWizardProps {
  service: Service;
  onLoadAllServices?: () => Promise<Service[]>;
}

export function OrderWizard({ service, onLoadAllServices }: OrderWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OrderStep>("upload");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [saveDetails, setSaveDetails] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pe:saveDetails") === "1";
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>(() => {
    if (typeof window === "undefined") return DEFAULT_DELIVERY_INFO;
    if (window.localStorage.getItem("pe:saveDetails") !== "1") {
      return DEFAULT_DELIVERY_INFO;
    }
    try {
      const raw = window.localStorage.getItem("pe:deliveryInfo");
      if (!raw) return DEFAULT_DELIVERY_INFO;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DELIVERY_INFO, ...parsed };
    } catch {
      return DEFAULT_DELIVERY_INFO;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveDetails) {
      window.localStorage.setItem("pe:saveDetails", "1");
      try {
        window.localStorage.setItem(
          "pe:deliveryInfo",
          JSON.stringify(deliveryInfo),
        );
      } catch {
        // storage full or disabled — ignore
      }
    } else {
      window.localStorage.removeItem("pe:saveDetails");
      window.localStorage.removeItem("pe:deliveryInfo");
    }
  }, [deliveryInfo, saveDetails]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectedServiceForUpload, setSelectedServiceForUpload] =
    useState<Service>(service);
  const [allServices, setAllServices] = useState<Service[]>([service]);
  const [pricingSettings, setPricingSettings] = useState<any>(null);

  // Fetch pricing settings on mount
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/settings/pricing");
        if (response.data.success) {
          setPricingSettings(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch pricing settings:", error);
      }
    };
    fetchPricingSettings();
  }, []);

  // Handle loading all services when user wants to add different service
  const handleLoadAllServices = useCallback(async () => {
    if (onLoadAllServices && allServices.length === 1) {
      const services = await onLoadAllServices();
      setAllServices(services);
    }
  }, [onLoadAllServices, allServices.length]);

  // Handle file upload completion
  const handleFileUploaded = useCallback(
    (file: UploadedFile, selectedService?: Service) => {
      const serviceToUse = selectedService || selectedServiceForUpload;
      // Customer must manually pick each option — start with blank selections.
      // copies is the only sensible default (1).
      const blankConfig = {
        ...DEFAULT_CONFIGURATION,
        printType: "",
        paperSize: "",
        paperType: "",
        gsm: "",
        printSide: "",
        bindingOption: "",
        copies: 1,
      };
      const newItem: OrderItem = {
        id: generateId(),
        serviceId: serviceToUse._id || "",
        serviceName: serviceToUse.name,
        service: serviceToUse,
        file,
        configuration: blankConfig,
        pricing: calculateItemPricing(serviceToUse, blankConfig, file.pageCount),
      };

      setOrderItems((prev) => [...prev, newItem]);
    },
    [selectedServiceForUpload],
  );

  // Handle file removal
  const handleFileRemoved = useCallback((fileId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.file.id !== fileId));
  }, []);

  // Handle configuration change
  const handleConfigurationChange = useCallback(
    (itemId: string, config: ServiceConfiguration) => {
      setOrderItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const newPricing = calculateItemPricing(
              item.service,
              config,
              item.file.pageCount,
            );
            return { ...item, configuration: config, pricing: newPricing };
          }
          return item;
        }),
      );
    },
    [],
  );

  // Handle delivery info change
  const handleDeliveryInfoChange = useCallback((info: DeliveryInfo) => {
    setDeliveryInfo(info);
  }, []);

  // Calculate order totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.pricing.subtotal,
    0,
  );
  const deliveryCharge = getDeliveryCharge(
    subtotal,
    deliveryInfo.state,
    pricingSettings,
  );
  const packingCharge = getPackingCharge(subtotal, pricingSettings);
  const { total } = calculateOrderTotals(
    orderItems.map((item) => item.pricing.subtotal),
    deliveryCharge,
    packingCharge,
  );

  // Navigation handlers
  const goToStep = (step: OrderStep) => setCurrentStep(step);

  const canProceedToConfig =
    orderItems.length > 0 &&
    orderItems.every((item) => item.file.status === "ready");

  // Require the customer to explicitly pick every option before continuing.
  // Binding is optional only if the service has no binding options at all.
  const canProceedToReview = orderItems.every((item) => {
    const c = item.configuration;
    const svc = item.service;
    const bindingRequired = (svc.bindingOptions?.length || 0) > 0;
    return (
      !!c.printType &&
      !!c.paperSize &&
      !!c.paperType &&
      !!c.gsm &&
      !!c.printSide &&
      (!bindingRequired || !!c.bindingOption) &&
      c.copies > 0
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            type="button"
            onClick={() => router.push("/services")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 "
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to services
          </button>
          <h1 className="text-2xl md:text-3xl  tracking-tight text-foreground">
            Place Order
          </h1>
          <p className="text-sm text-muted-foreground  mt-1">
            {orderItems.length === 0
              ? service.name
              : orderItems.length === 1
                ? orderItems[0].serviceName
                : `${orderItems.length} services selected`}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Content */}
      <div className="container mx-auto px-4 py-6">
        {currentStep === "upload" && (
          <FileUploadStep
            orderItems={orderItems}
            onFileUploaded={handleFileUploaded}
            onFileRemoved={handleFileRemoved}
            onNext={() => goToStep("configure")}
            canProceed={canProceedToConfig}
            availableServices={allServices}
            selectedService={selectedServiceForUpload}
            onServiceChange={setSelectedServiceForUpload}
            onLoadAllServices={handleLoadAllServices}
          />
        )}

        {currentStep === "configure" && (
          <ConfigureStep
            orderItems={orderItems}
            activeItemIndex={activeItemIndex}
            onActiveItemChange={setActiveItemIndex}
            onConfigurationChange={handleConfigurationChange}
            onBack={() => goToStep("upload")}
            onNext={() => goToStep("review")}
            canProceed={canProceedToReview}
          />
        )}

        {currentStep === "review" && (
          <ReviewStep
            orderItems={orderItems}
            deliveryInfo={deliveryInfo}
            onDeliveryInfoChange={handleDeliveryInfoChange}
            saveDetails={saveDetails}
            onSaveDetailsChange={setSaveDetails}
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            packingCharge={packingCharge}
            total={total}
            onBack={() => goToStep("configure")}
            pricingSettings={pricingSettings}
          />
        )}
      </div>
    </div>
  );
}
