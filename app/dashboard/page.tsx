"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { AdminAnalytics } from "@/components/dashboard/admin-analytics";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show admin analytics dashboard for admin users
  if (user.role === "admin") {
    return (
      <div className="p-6">
        <AdminAnalytics />
      </div>
    );
  }

  // Show profile tab for regular users
  return (
    <div className="p-6">
      <ProfileTab user={user} />
    </div>
  );
}
