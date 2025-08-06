// File: src/services/Services.jsx

import React, { createContext, useContext, useEffect } from "react";

// ========================================
// SERVICE CLASS IMPORTS
// ========================================

// ========================================
// SERVICE CREATION & DEPENDENCY INJECTION
// ========================================

function createServices() {
  console.log(
    "[Services] 🚀 Creating service instances with dependency injection...",
  );

  // ========================================
  // 1. CORE SERVICES (No Dependencies)
  // ========================================

  // const authManager = new AuthManager();
  // console.log("[Services] ✓ AuthManager created");

  // ========================================
  // 2. AUTH-DEPENDENT SERVICES
  // ========================================

  // const meManager = new MeManager(authManager);
  // const tokenManager = new TokenManager(authManager);
  // console.log("[Services] ✓ Auth-dependent managers created");

  // ========================================
  // 3. USER SERVICES
  // ========================================

  // ========================================
  // 6. API CLIENT SETUP
  // ========================================

  // setApiClientAuthManager(authManager);
  // console.log("[Services] ✓ ApiClient configured with AuthManager");

  // ========================================
  // 7. Dashboard Services
  // ========================================

  // const dashboardManager = new DashboardManager(authManager);
  // console.log("[Services] ✓ Dashboard manager created");

  // ========================================
  // 8. MANAGER CROSS-REFERENCES (For Cache Invalidation)
  // ========================================

  // ========================================
  // 9. SERVICE REGISTRY
  // ========================================

  const services = {
    // // Core services (singletons)
    // authManager,
    // localStorageService: LocalStorageService,
    // apiClient: ApiClient,
    // // Auth & User Management
    // meManager,
    // tokenManager,
    // recoveryManager,
    // // Dashboard
    // dashboardManager,
  };

  console.log(
    "[Services] ✅ Service registry created with",
    Object.keys(services).length,
    "services",
  );

  return services;
}

// ========================================
// REACT CONTEXT & PROVIDER
// ========================================

const ServiceContext = createContext();

export function ServiceProvider({ children }) {
  const services = createServices();

  // ========================================
  // SERVICE INITIALIZATION
  // ========================================

  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log("[Services] 🚀 Starting service initialization...");

        // TODO - Add code here

        console.log("[Services] 🎉 All services initialized successfully!");
      } catch (error) {
        console.error(
          "[Services] ❌ Critical service initialization failure:",
          error,
        );
      }
    };

    initializeServices();
  }, [services]);

  // ========================================
  // ERROR HANDLING
  // ========================================

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error("[Services] 🚨 Unhandled promise rejection:", event.reason);
    };

    const handleError = (event) => {
      console.error("[Services] 🚨 Unhandled error:", event.error);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  // ========================================
  // DEVELOPMENT DEBUG INFO
  // ========================================

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[Services] 🔧 Development mode - adding debug info");
      console.log("[Services] Available services:", Object.keys(services));

      console.log(
        "[Services] 🏗️ Architecture: Single-file service boundary with full DI",
      );
    }
  }, [services]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}
