"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"; // Shadcn UI switch
import { ConnectKitButton } from "connectkit";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Profiles", href: "/profiles" },
  { name: "Group", href: "/groups" },
  { name: "About Us", href: "/about" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-border flex items-center justify-between px-4 h-14 md:h-16">
      <div>
        {/* <div>winsome logo</div> */}
        <div className="text-lg font-bold">Winsome Chat</div>
      </div>
      <div className="flex items-center space-x-6">
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
      <div className="flex items-center space-x-4">
        <Switch
          checked={darkMode}
          onCheckedChange={handleToggle}
          className="hover:brightness-110 transition"
          aria-label="Toggle dark mode"
        />
        <ConnectKitButton />
      </div>
      <div className="progress-line" />
    </nav>
  );
}
