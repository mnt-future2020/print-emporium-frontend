"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Package,
  Clock,
  Star,
  Award,
  Bell,
  Settings,
  FileText,
  Zap,
  Lock,
  Activity,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProfileTabProps {
  user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
  // Calculate days since account creation
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(user.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-8 mx-auto">
      {/* Hero Welcome Section with Glassmorphic Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-8 md:p-12">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
            {/* User Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-white/20 to-white/10">
                    <span className="text-4xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                {user.emailVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white/20 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight break-words">
                  Welcome back, {user.name}!
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                    user.role === "admin"
                      ? "bg-yellow-500/20 text-yellow-100 border-yellow-400/30"
                      : "bg-white/10 text-white border-white/20"
                  }`}
                >
                  <Award className="h-3 w-3" />
                  {user.role === "admin"
                    ? "Admin"
                    : user.role === "employee"
                      ? "Employee"
                      : "User"}
                </span>
              </div>
              <p className="text-primary-100 text-base sm:text-lg flex items-center gap-2 truncate max-w-full">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <div className="flex items-center gap-4 text-sm text-primary-50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Active for {daysSinceCreation} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Status Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {user.banned ? "Inactive" : "Active"}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Account Status
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                Protected
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure & Verified</span>
            </div>
          </div>
        </Card>

        {/* Email Verification Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary-500/10">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              {user.emailVerified ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Email Status
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {user.emailVerified ? "Verified" : "Pending"}
              </p>
            </div>
            {!user.emailVerified && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary-600 hover:text-primary-700"
              >
                Verify Now →
              </Button>
            )}
          </div>
        </Card>

        {/* Orders Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                View All
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-blue-600 hover:text-blue-700"
              asChild
            >
              <Link href="/dashboard/orders">Browse Orders →</Link>
            </Button>
          </div>
        </Card>

        {/* User Since Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                User Since
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-purple-600" />
              <span>{daysSinceCreation} days of excellence</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-primary-50 hover:border-primary-300 transition-all group"
            asChild
          >
            <Link href="/services">
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 rounded-lg bg-primary-100 group-hover:bg-primary-200 transition-colors">
                  <FileText className="h-5 w-5 text-primary-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">
                    Browse Services
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Explore our offerings
                  </p>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all group"
            asChild
          >
            <Link href="/contact">
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Package className="h-5 w-5 text-blue-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Request Quote</p>
                  <p className="text-sm text-muted-foreground">
                    Get instant pricing
                  </p>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-purple-50 hover:border-purple-300 transition-all group"
            asChild
          >
            <Link href="/contact">
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Bell className="h-5 w-5 text-purple-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">
                    Contact Support
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We're here to help
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Full Name
                </p>
                <p className="text-base font-semibold text-foreground mt-1">
                  {user.name}
                </p>
              </div>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Email Address
                </p>
                <p className="text-base font-semibold text-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        {/* Authentication & Security */}
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary-600" />
            Security & Authentication
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <>
                    <div className="p-2 rounded-lg bg-white">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Google OAuth
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Secure sign-in
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-lg bg-primary-100">
                      <Mail className="h-5 w-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Email & Password
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Traditional login
                      </p>
                    </div>
                  </>
                )}
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Last Updated
                </p>
                <p className="text-base font-semibold text-foreground mt-1">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
