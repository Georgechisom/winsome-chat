"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { Menu, X } from "lucide-react";
import { FloatingDarkModeToggle } from "./FloatingDarkModeToggle";
import { useWallet } from "@/hooks/useWallet";
import { usePriceAutomation } from "@/hooks/usePriceAutomation";

const baseNavLinks = [
  { name: "Home", href: "/" },
  { name: "Profiles", href: "/profiles" },
  { name: "Chat", href: "/chats" },
  { name: "About Us", href: "/about" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected } = useWallet();
  const { ownerAddress } = usePriceAutomation();

  // Check if current user is admin
  const isAdmin =
    address &&
    ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  // Add admin link if user is admin
  const navLinks = [
    ...baseNavLinks,
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(scrolled);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        scrolled.toString()
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-border flex items-center justify-between px-4 h-14 md:h-16">
        <div className="flex items-center space-x-4">
          <div
            className="text-lg font-bold cursor-pointer"
            onClick={() => handleNavClick("/")}
          >
            Winsome Chat
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm md:text-base font-semibold rounded-md px-2 py-1 hover:brightness-110 hover:scale-105 transition-transform duration-150 ${
                  pathname === link.href
                    ? "text-primary-foreground bg-primary"
                    : "text-foreground"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <ConnectKitButton />
          </div>
          <div className="ml-4">
            <FloatingDarkModeToggle />
          </div>
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-14 right-0 w-64 h-full bg-background shadow-lg border-l border-border z-50 p-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-base font-semibold rounded-md px-2 py-2 hover:brightness-110 hover:scale-105 transition-transform duration-150 ${
                pathname === link.href
                  ? "text-primary-foreground bg-primary"
                  : "text-foreground"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
      <div className="progress-line" />
    </>
  );
}
