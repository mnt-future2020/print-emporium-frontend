"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getServiceById, getAllServices, Service } from "@/lib/service-api";
import { OrderWizard } from "@/components/order/order-wizard";
import { Loader2 } from "lucide-react";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceId = params.serviceId as string;

  // Function to fetch all services (called only when user needs extra service)
  const loadAllServices = async (): Promise<Service[]> => {
    try {
      const allServicesResponse = await getAllServices("active");
      if (allServicesResponse.success && allServicesResponse.data) {
        return allServicesResponse.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch all services:", err);
      return [];
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(`/order/${serviceId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [authLoading, isAuthenticated, router, serviceId]);

  // Fetch only the selected service initially
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;

      try {
        setIsLoading(true);

        // Fetch only the selected service
        const serviceResponse = await getServiceById(serviceId);
        if (serviceResponse.success && serviceResponse.data) {
          setService(serviceResponse.data);
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Failed to fetch service:", err);
        setError("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchService();
    }
  }, [serviceId, isAuthenticated]);

  // Handle redirection for custom quotation services
  useEffect(() => {
    if (service && service.customQuotation) {
      router.replace(
        `/contact?subject=Inquiry for ${encodeURIComponent(service.name)}`,
      );
    }
  }, [service, router]);

  // Show loading while checking auth
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching service
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {error || "Service Not Found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            The service you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/services")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return <OrderWizard service={service} onLoadAllServices={loadAllServices} />;
}
