import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout-wrapper";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import { DynamicFavicon } from "@/components/dynamic-favicon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: Dynamic metadata is not supported in the root layout
// This will be handled in individual pages if needed
export const metadata: Metadata = {
  title: "Professional Printing Services",
  description:
    "Quality printing solutions for all your business and personal needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicFavicon />
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
