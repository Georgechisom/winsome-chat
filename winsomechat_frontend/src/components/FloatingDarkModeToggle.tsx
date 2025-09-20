"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function FloatingDarkModeToggle() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check if dark class exists on document element
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
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

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}
