"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SignInPromptProps {
  onSignInClick: () => void;
}

export function SignInPrompt({ onSignInClick }: SignInPromptProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds if not authenticated and not on auth pages
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading || isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50 w-[350px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-slate-100 p-1">
                <svg viewBox="0 0 24 24" className="h-full w-full">
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-slate-700">Sign in to Print Emporium</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-slate-900 leading-tight">Welcome to Print Emporium</p>
                <p className="text-[13px] text-slate-500">Sign in to track your orders and more</p>
              </div>
            </div>

            <Button onClick={onSignInClick} className="w-full h-11 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-md shadow-sm transition-all">
              Continue to Sign In
            </Button>
            
            <p className="mt-4 text-center text-[11px] text-slate-400 leading-tight">
              To continue, our system will share your session and profile picture with this site. See this site's{" "}
              <Link href="/privacy" className="text-blue-500 hover:underline">privacy policy</Link> and{" "}
              <Link href="/terms" className="text-blue-500 hover:underline">terms of service</Link>.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
