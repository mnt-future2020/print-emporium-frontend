"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { login, signup } from "@/lib/auth-api";
import { useAuth } from "@/components/providers/auth-provider";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useCompanySettings } from "@/hooks/use-company-settings";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const { settings, loading } = useCompanySettings();
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError(null);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const response = await login(formData.email, formData.password);
        if (response.success && response.data?.user) {
          // Update the auth context with the user data
          authLogin(response.data.user);
          // Redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        if (!formData.name.trim()) {
          throw new Error("Name is required");
        }
        const response = await signup(
          formData.email,
          formData.password,
          formData.name,
        );
        if (response.success && response.data?.user) {
          // Update the auth context with the user data
          authLogin(response.data.user);
          // Redirect to dashboard
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card text-foreground selection:bg-primary/20 selection:text-primary-foreground font-sans flex overflow-hidden">
      {/* ---------------- LEFT PANEL (FORM) ---------------- */}
      <div className="w-full lg:w-[48%] relative flex flex-col justify-center items-center p-6 lg:p-24 bg-card z-20">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
            <CompanyLogo
              width={250}
              height={250}
              className="rounded-xl transform group-hover:rotate-6 transition-transform duration-300 "
            />
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "login"
                  ? "Please enter your details to sign in."
                  : "Enter your details to get started for free."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground ml-1">
                      Full Name
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl border-border bg-background focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground ml-1">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-11 rounded-xl border-border bg-background focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-sm font-medium text-foreground">
                  Password
                </Label>
                {mode === "login" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl border-border bg-background focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {mode === "login" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton
            callbackURL="/dashboard"
            className="w-full h-11 rounded-xl"
            mode={mode}
          />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-12 lg:hidden text-center text-xs text-muted-foreground">
          © 2024{" "}
          {loading ? "Loading..." : settings?.companyName || "PrintEmporium"}.
          All rights reserved.
        </div>
      </div>

      {/* ---------------- RIGHT PANEL (VISUAL) ---------------- */}
      <div className="hidden lg:block w-[52%] bg-primary relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=2574&auto=format&fit=crop')",
            animation: "kenburns 30s ease-out infinite alternate",
          }}
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/40 to-primary/20" />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 z-10">
          <div className="flex justify-end">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm text-sm font-medium text-white">
              Premium Printing Solutions
            </div>
          </div>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Masterpieces in Every Print.
              </h2>
              <div className="space-y-4">
                {[
                  "High-fidelity color reproduction",
                  "Premium paper stocks & finishes",
                  "Dedicated expert support team",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-white/90"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-primary bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground overflow-hidden`}
                >
                  <Image
                    src={`https://i.pravatar.cc/100?img=${i + 15}`}
                    alt="User"
                    width={40}
                    height={40}
                    sizes="40px"
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                +2k
              </div>
            </div>
            <div className="text-sm font-medium text-white/90">
              Trusted by 2,000+ businesses
            </div>
          </div>
        </div>

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>
    </div>
  );
}
