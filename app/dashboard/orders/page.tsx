"use client";

import { useAuth } from "@/hooks/use-auth";
import { OrdersTab } from "@/components/dashboard/orders-tab";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <OrdersTab user={user} />
    </div>
  );
}
