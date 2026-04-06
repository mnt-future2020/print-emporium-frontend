"use client";

import { Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ServicesListTab } from "@/components/services/services-list-tab";

export function ServicesManagement() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={Layers}
        title="Services Management"
        description="Configure printing services, dynamic options, and pricing"
      />

      <div className="mt-8">
        <ServicesListTab />
      </div>
    </div>
  );
}
