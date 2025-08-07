// File Path: web/workery-frontend/src/components/Layout/Layout.jsx

import React, { useState, useEffect } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import { theme } from "../../constants/Theme";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= theme.breakpoints.mobile,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= theme.breakpoints.mobile);
      // Close sidebar on desktop
      if (window.innerWidth > theme.breakpoints.mobile) {
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

  const styles = {
    layout: {
      minHeight: "100vh",
      backgroundColor: theme.colors.light,
    },
    main: {
      marginTop: "60px",
      minHeight: "calc(100vh - 60px)",
    },
  };

  return (
    <div style={styles.layout}>
      <TopNavbar
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isMobile={isMobile}
      />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

export default Layout;
