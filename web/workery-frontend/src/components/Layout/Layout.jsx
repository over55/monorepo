// File Path: web/workery-frontend/src/components/Layout/Layout.jsx
// Modernized Layout Component with Tailwind v4

import React, { useState, useEffect } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check localStorage for sidebar collapsed state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true" && !isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Listen for storage changes to sync collapsed state
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebarCollapsed");
      setSidebarCollapsed(savedState === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener("sidebarCollapsedChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sidebarCollapsedChanged",
        handleStorageChange,
      );
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Close sidebar when switching to desktop
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Has its own logic for when to show */}
      <TopNavbar onMenuToggle={handleMenuToggle} isMobile={isMobile} />

      {/* Sidebar - Has its own logic for when to show */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <main className="pt-[60px] min-h-[calc(100vh-60px)] transition-all duration-300">
        {/* Desktop: Add left margin based on sidebar state */}
        <div
          className={`
          transition-all duration-300
          ${!isMobile ? (sidebarCollapsed ? "ml-16" : "ml-64") : ""}
        `}
        >
          {/* Content Container with responsive padding */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
