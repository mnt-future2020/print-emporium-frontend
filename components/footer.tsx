import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { getAllServices, Service } from "@/lib/service-api";

export default function Footer() {
  const { settings, loading } = useCompanySettings();
  const [services, setServices] = useState<{ name: string; href: string }[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getAllServices("active");
        if (res.success && res.data) {
          setServices(
            res.data.slice(0, 5).map((s: Service) => ({
              name: s.name,
              href: `/services`,
            }))
          );
        }
      } catch {
        // Fallback to empty — services section won't render
      }
    };
    fetchServices();
  }, []);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: settings?.socialMedia?.facebook || "#facebook",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: settings?.socialMedia?.twitter || "#twitter",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: settings?.socialMedia?.linkedin || "#linkedin",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: settings?.socialMedia?.instagram || "#instagram",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-background via-muted/30 to-background pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="group">
            <div className="flex items-center ">
              <CompanyLogo
                width={200}
                height={200}
                className="rounded-xl  group-hover:scale-105 transition-transform duration-300"
                showFallback={true}
              />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              {loading
                ? "Loading..."
                : settings?.companyDescription ||
                  "Your trusted partner for high-quality printing solutions in Chennai. From business cards to large format prints, we deliver excellence in every project."}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6">
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center group text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center group text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="text-muted-foreground flex items-start text-sm">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  {loading
                    ? "Loading..."
                    : settings?.companyAddress ||
                      "123 Print Street, T. Nagar, Chennai, Tamil Nadu 600017"}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${
                    loading ? "" : settings?.companyPhone || "+914412345678"
                  }`}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center group text-sm"
                >
                  <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                  {loading
                    ? "Loading..."
                    : settings?.companyPhone || "+91 44 1234 5678"}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${
                    loading
                      ? ""
                      : settings?.companyEmail || "info@printemporium.com"
                  }`}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center group text-sm"
                >
                  <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                  {loading
                    ? "Loading..."
                    : settings?.companyEmail || "info@printemporium.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm font-medium text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              {loading
                ? "Loading..."
                : settings?.companyName || "The Print Emporium"}
              . All rights reserved.
            </p>
            <div className="flex gap-6 text-xs">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
