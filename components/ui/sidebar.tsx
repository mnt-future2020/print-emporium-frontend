"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CompanyLogo } from "@/components/ui/company-logo";

export interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isSpecial?: boolean;
  hasDropdown?: boolean;
  subLinks?: SidebarLink[];
}

export interface SidebarUser {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface SidebarProps {
  links: SidebarLink[];
  user?: SidebarUser;
  className?: string;
  onLinkClick?: (href: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ links, user, className, onLinkClick, onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to open
  const [isPinned, setIsPinned] = useState(true); // Track if sidebar is pinned open
  const [isMobile, setIsMobile] = useState(false); // Default to false for SSR
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "Profile",
    "My Team",
  ]); // Track which menus are expanded

  // Check if we're on mobile
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
      setIsPinned(false);
    } else {
      setIsExpanded(true);
      setIsPinned(true);
    }
  }, [isMobile]);

  const handleLinkClick = (href: string) => {
    if (onLinkClick) {
      onLinkClick(href);
    }
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col w-[280px] h-screen bg-white border-r border-border" />
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-foreground border border-border"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay for Mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isMobileOpen ? 280 : 0) : isExpanded ? 280 : 80,
          x: isMobile && !isMobileOpen ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 md:relative z-50 h-screen flex flex-col bg-white border-r border-border shadow-sm",
          !isMobile && !isExpanded && "w-20",
          !isMobile && isExpanded && "w-[280px]",
          isMobile && !isMobileOpen && "w-0 border-none pointer-events-none",
          isMobile && isMobileOpen && "w-[280px]",
          className,
        )}
        onMouseEnter={() => !isPinned && !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isPinned && !isMobile && setIsExpanded(false)}
      >
        {/* Header / Logo */}
        <div className="h-28 flex items-center px-6 border-b border-border relative">
          <AnimatePresence mode="wait">
            {isExpanded || (isMobile && isMobileOpen) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <CompanyLogo
                  width={180}
                  height={180}
                  className="rounded-lg"
                  showFallback={true}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <CompanyLogo
                  width={150}
                  height={150}
                  className="rounded-lg"
                  showFallback={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Close Button */}
          {isMobile && isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <motion.button
            onClick={togglePin}
            className="absolute -right-3 top-24 z-50 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary-600 shadow-sm hover:shadow-md transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isPinned ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.div>
          </motion.button>
        )}

        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map((link, index) => {
            const isCollapsed = !isMobile && !isPinned && !isExpanded;
            const isMenuExpanded = expandedMenus.includes(link.label);
            const toggleMenu = (e: React.MouseEvent) => {
              if (link.hasDropdown) {
                e.stopPropagation();
                setExpandedMenus((prev) =>
                  prev.includes(link.label)
                    ? prev.filter((item) => item !== link.label)
                    : [...prev, link.label],
                );
              }
            };

            return (
              <div key={link.href}>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={(e) => {
                    if (link.hasDropdown) {
                      toggleMenu(e);
                    } else {
                      handleLinkClick(link.href);
                    }
                  }}
                  className={cn(
                    "group relative w-full flex items-center gap-3 rounded-lg transition-all duration-200",
                    isCollapsed
                      ? "justify-center p-3"
                      : "justify-start px-4 py-3",
                    link.isActive && !link.hasDropdown
                      ? isCollapsed
                        ? "bg-primary-50 text-primary-600 shadow-sm"
                        : "bg-primary-50 text-primary-600 font-semibold shadow-sm border border-primary-100"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 w-5 h-5 transition-transform group-hover:scale-110",
                      link.isActive
                        ? "text-primary-600"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {link.icon}
                  </span>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate flex-1 text-left"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && link.hasDropdown && (
                    <motion.div
                      animate={{ rotate: isMenuExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
                    </motion.div>
                  )}

                  {isCollapsed && link.isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {!isCollapsed && link.hasDropdown && isMenuExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-4 pl-4 border-l border-border mt-1 space-y-1"
                    >
                      {link.subLinks?.map((subLink, subIndex) => (
                        <motion.button
                          key={subLink.href}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: subIndex * 0.05 }}
                          onClick={() => handleLinkClick(subLink.href)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors",
                            subLink.isActive
                              ? "text-primary-600 font-medium bg-primary-50/50"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                        >
                          {subLink.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-muted/30">
          <div
            className={cn(
              "flex items-center gap-3",
              !isExpanded && !isMobile && !isPinned ? "justify-center" : "",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>

            <AnimatePresence>
              {(isExpanded || (isMobile && isMobileOpen)) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logout Button */}
            {onLogout && (
              <AnimatePresence>
                {(isExpanded || (isMobile && isMobileOpen)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={onLogout}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Logout Button (Collapsed State) */}
          {onLogout && !isExpanded && !isMobile && !isPinned && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onLogout}
              className="mt-2 w-full flex justify-center p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
