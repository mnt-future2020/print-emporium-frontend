"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AccessDeniedDisplay } from "@/components/ui/access-denied-display";
import { FloatingWhatsAppButton } from "@/components/ui/whatsapp-floating";
import { SignInPrompt } from "@/components/ui/sign-in-prompt";
import { AuthModal } from "@/components/ui/auth-modal";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardPage = pathname.startsWith("/dashboard");

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      {!isAuthPage && !isDashboardPage && <Navbar />}
      <AccessDeniedDisplay />
      <main className={!isAuthPage && !isDashboardPage ? "pt-16" : ""}>
        {children}
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
      <FloatingWhatsAppButton />
      <SignInPrompt onSignInClick={() => openAuthModal("login")} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
