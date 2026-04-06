"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth-api";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useCompanySettings } from "@/hooks/use-company-settings";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { settings, loading } = useCompanySettings();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send reset email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-black/5"
        >
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <CompanyLogo
                  width={250}
                  height={250}
                  className="rounded-xl transform group-hover:rotate-6 transition-transform duration-300 "
                />
              </Link>
            </div>

            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>

              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-foreground">{email}</strong>
              </p>

              <Button asChild className="w-full mb-4">
                <Link href="/login">Back to Login</Link>
              </Button>

              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-black/5"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <CompanyLogo
                width={250}
                height={250}
                className="rounded-xl transform group-hover:rotate-6 transition-transform duration-300 "
              />
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground text-sm">
              No worries! Enter your email address and we&apos;ll send you a
              reset link.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Sending Reset Link...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              We&apos;ll send you a link to reset your password.
            </p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-center text-sm text-muted-foreground">
            Remembered your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
