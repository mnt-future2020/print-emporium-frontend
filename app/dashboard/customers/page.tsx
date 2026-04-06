"use client";

import { CustomersList } from "@/components/customers/customers-list";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="p-8  mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view users who have placed orders with Print Emporium.
        </p>
      </div>

      <CustomersList />
    </div>
  );
}
