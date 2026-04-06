"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const { settings } = useCompanySettings();
  const { login: authLogin, refreshUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError(null);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { login: apiLogin, signup: apiSignup } =
        await import("@/lib/auth-api");

      if (mode === "login") {
        const response = await apiLogin(formData.email, formData.password);
        if (response.success && response.data?.user) {
          authLogin(response.data.user);
          toast.success("Signed in successfully");
          onClose();
        } else {
          setError(response.message || "Invalid credentials");
        }
      } else {
        if (!formData.name.trim()) throw new Error("Name is required");
        const response = await apiSignup(
          formData.email,
          formData.password,
          formData.name,
        );
        if (response.success && response.data?.user) {
          authLogin(response.data.user);
          toast.success("Account created successfully");
          onClose();
        } else {
          setError(response.message || "Signup failed");
        }
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <CompanyLogo
              width={200}
              height={200}
              className="rounded-2xl mb-6 "
            />
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === "login" ? "Welcome Back" : "Get Started"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              {mode === "login"
                ? "Sign in to access your dashboard and orders"
                : "Create an account to start your printing project"}
            </DialogDescription>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Full Name
                  </Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                    placeholder="e.g. Alex Johnson"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Email Address
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
              <span className="bg-white px-4">Social Login</span>
            </div>
          </div>

          <GoogleSignInButton
            callbackURL="/dashboard"
            className="w-full h-12 rounded-xl border-slate-200"
            mode={mode}
          />

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              {mode === "login" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
