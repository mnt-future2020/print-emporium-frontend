"use client";

import { useAuth } from "@/hooks/use-auth";
import { ServicesManagement } from "@/components/services/services-management";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only admins can access this page
  if (user.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="p-6">
      <ServicesManagement />
    </div>
  );
}
