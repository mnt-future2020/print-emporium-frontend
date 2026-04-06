"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Mail, Building, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { MessageDisplay } from "@/components/ui/message-display";
import { GeneralSettingsTab } from "@/components/settings/general-settings-tab";
import { EmailSettingsTab } from "@/components/settings/email-settings-tab";
import { SEOSettingsTab } from "@/components/settings/seo-settings-tab";
import { HeroCarouselTab } from "@/components/settings/hero-carousel-tab";
import { PaymentGatewayTab } from "@/components/settings/payment-gateway-tab";
import { PricingSettingsTab } from "@/components/settings/pricing-settings-tab";
import { CouponSettingsTab } from "@/components/settings/coupon-settings-tab";
import { Layout, CreditCard, ReceiptIndianRupee, Ticket } from "lucide-react";

export default function DashboardSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMessage = (newMessage: { type: "success" | "error"; text: string }) => {
    setMessage(newMessage);
    // Auto-clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          icon={Settings}
          title="Dashboard Settings"
          description="Manage your application settings and configuration"
        />

        {/* Message Display */}
        <MessageDisplay message={message} />

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 lg:w-fit">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                General Settings
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Config
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO Settings
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Hero Carousel
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Gateway
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <ReceiptIndianRupee className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Coupons
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6">
              <GeneralSettingsTab onMessage={handleMessage} />
            </TabsContent>

            {/* Email Configuration Tab */}
            <TabsContent value="email" className="space-y-6">
              <EmailSettingsTab onMessage={handleMessage} />
            </TabsContent>

            {/* SEO Settings Tab */}
            <TabsContent value="seo" className="space-y-6">
              <SEOSettingsTab onMessage={handleMessage} />
            </TabsContent>

            {/* Hero Carousel Tab */}
            <TabsContent value="hero" className="space-y-6">
              <HeroCarouselTab onMessage={handleMessage} />
            </TabsContent>

            {/* Payment Gateway Tab */}
            <TabsContent value="payment" className="space-y-6">
              <PaymentGatewayTab onMessage={handleMessage} />
            </TabsContent>

            {/* Pricing Settings Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <PricingSettingsTab onMessage={handleMessage} />
            </TabsContent>

            {/* Coupon Settings Tab */}
            <TabsContent value="coupons" className="space-y-6">
              <CouponSettingsTab onMessage={handleMessage} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}