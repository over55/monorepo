// File Path: monorepo/web/workery-frontend/src/components/Layout/Layout.jsx
import React, { useState } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const styles = {
    layout: {
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
    },
    main: {
      marginTop: "60px", // Account for fixed top navbar
      minHeight: "calc(100vh - 60px)",
    },
  };

  return (
    <div style={styles.layout}>
      <TopNavbar onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

export default Layout;
