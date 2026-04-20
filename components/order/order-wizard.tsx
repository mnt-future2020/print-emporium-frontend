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
      const newItem: OrderItem = {
        id: generateId(),
        serviceId: serviceToUse._id || "",
        serviceName: serviceToUse.name,
        service: serviceToUse,
        file,
        configuration: {
          ...DEFAULT_CONFIGURATION,
          printType: serviceToUse.printTypes[0]?.value || "",
          paperSize: serviceToUse.paperSizes[0]?.value || "",
          paperType: serviceToUse.paperTypes[0]?.value || "",
          gsm: serviceToUse.gsmOptions[0]?.value || "",
          printSide: serviceToUse.printSides[0]?.value || "",
          bindingOption: serviceToUse.bindingOptions[0]?.value || "",
          copies: 1,
        },
        pricing: calculateItemPricing(
          serviceToUse,
          {
            ...DEFAULT_CONFIGURATION,
            printType: serviceToUse.printTypes[0]?.value || "",
            paperSize: serviceToUse.paperSizes[0]?.value || "",
            paperType: serviceToUse.paperTypes[0]?.value || "",
            gsm: serviceToUse.gsmOptions[0]?.value || "",
            printSide: serviceToUse.printSides[0]?.value || "",
            bindingOption: serviceToUse.bindingOptions[0]?.value || "",
            copies: 1,
          },
          file.pageCount,
        ),
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

  const canProceedToReview = orderItems.every(
    (item) =>
      item.configuration.printType &&
      item.configuration.paperSize &&
      item.configuration.copies > 0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/services")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Place Order</h1>
              <p className="text-sm text-muted-foreground">
                {orderItems.length === 0
                  ? service.name
                  : orderItems.length === 1
                    ? orderItems[0].serviceName
                    : `${orderItems.length} services selected`}
              </p>
            </div>
          </div>
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
