"use client";

import { useAuth } from "@/hooks/use-auth";
import { EmployeesTab } from "@/components/dashboard/employees-tab";
import { Loader2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only admins can access this page
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <EmployeesTab />
    </div>
  );
}
