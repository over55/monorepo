// File Path: monorepo/web/workery-frontend/src/services/Services.jsx
import React, { createContext, useContext, useMemo } from "react";
import { AuthAPI } from "./API/AuthAPI";
import { VersionAPI } from "./API/VersionAPI";
import { PasswordResetAPI } from "./API/PasswordResetAPI";
import { TokenStorage } from "./Storage/TokenStorage";
import { AuthManager } from "./Manager/AuthManager";
import { VersionManager } from "./Manager/VersionManager";
import { PasswordResetManager } from "./Manager/PasswordResetManager";
import { getAPIBaseURL, API_ENDPOINTS, ENV_CONFIG } from "./config/APIConfig";

/**
 * Services container for dependency injection
 * Manages all service instances and their dependencies
 */
class ServicesContainer {
  constructor() {
    this._services = new Map();
    this._initialized = false;
  }

  /**
   * Initialize all services with their dependencies
   */
  initialize() {
    if (this._initialized) {
      return;
    }

    // Get API base URL from Vite environment variables
    const baseURL = getAPIBaseURL();

    // Initialize storage services (no dependencies)
    const tokenStorage = new TokenStorage();
    this._services.set("tokenStorage", tokenStorage);

    // Initialize API services (depend on configuration)
    const authAPI = new AuthAPI(baseURL, API_ENDPOINTS);
    this._services.set("authAPI", authAPI);

    const versionAPI = new VersionAPI(baseURL, API_ENDPOINTS);
    this._services.set("versionAPI", versionAPI);

    const passwordResetAPI = new PasswordResetAPI(baseURL, API_ENDPOINTS);
    this._services.set("passwordResetAPI", passwordResetAPI);

    // Initialize manager services (combine API and storage layers)

    // AuthManager needs AuthAPI and TokenStorage
    const authManager = new AuthManager(authAPI, tokenStorage);
    this._services.set("authManager", authManager);

    // VersionManager only needs VersionAPI
    const versionManager = new VersionManager(versionAPI);
    this._services.set("versionManager", versionManager);

    // PasswordResetManager only needs PasswordResetAPI
    const passwordResetManager = new PasswordResetManager(passwordResetAPI);
    this._services.set("passwordResetManager", passwordResetManager);

    this._initialized = true;

    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.group("✅ Services Initialized");
      console.log("🔗 API URL:", baseURL);
      console.log("📦 Available services:", Array.from(this._services.keys()));
      console.log("🏗️ Service dependency map:", {
        authManager: ["authAPI", "tokenStorage"],
        versionManager: ["versionAPI"],
        passwordResetManager: ["passwordResetAPI"],
      });
      console.groupEnd();
    }
  }

  /**
   * Get a service by name
   */
  get(serviceName) {
    if (!this._initialized) {
      this.initialize();
    }

    const service = this._services.get(serviceName);
    if (!service) {
      const availableServices = Array.from(this._services.keys()).join(", ");
      throw new Error(
        `Service '${serviceName}' not found. Available services: ${availableServices}`,
      );
    }

    return service;
  }

  /**
   * Convenience getters for managers (primary interface)
   */
  getAuthManager() {
    return this.get("authManager");
  }

  getVersionManager() {
    return this.get("versionManager");
  }

  getPasswordResetManager() {
    return this.get("passwordResetManager");
  }

  /**
   * Convenience getters for storage services
   */
  getTokenStorage() {
    return this.get("tokenStorage");
  }

  /**
   * Convenience getters for API services (for direct access if needed)
   */
  getAuthAPI() {
    return this.get("authAPI");
  }

  getVersionAPI() {
    return this.get("versionAPI");
  }

  getPasswordResetAPI() {
    return this.get("passwordResetAPI");
  }

  /**
   * Register a new service (for extensions)
   */
  register(serviceName, serviceInstance) {
    if (this._services.has(serviceName)) {
      console.warn(`Service '${serviceName}' is being overridden`);
    }
    this._services.set(serviceName, serviceInstance);
  }

  /**
   * Clear all services (for testing)
   */
  clear() {
    this._services.clear();
    this._initialized = false;
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Get all available service names
   */
  getServiceNames() {
    if (!this._initialized) {
      this.initialize();
    }
    return Array.from(this._services.keys());
  }

  /**
   * Get service information for debugging
   */
  getServiceInfo() {
    if (!this._initialized) {
      this.initialize();
    }

    const info = {};
    this._services.forEach((service, name) => {
      info[name] = {
        type: service.constructor.name,
        initialized: !!service,
      };
    });
    return info;
  }
}

// Create React Context for services
const ServicesContext = createContext(null);

/**
 * ServiceProvider component - wraps your app
 */
export function ServiceProvider({ children }) {
  const services = useMemo(() => {
    const container = new ServicesContainer();
    container.initialize();
    return container;
  }, []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Base hook to access services container
 */
export function useServices() {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return services;
}

/**
 * Hooks to access specific managers (primary interface)
 */
export function useAuthManager() {
  const services = useServices();
  return services.getAuthManager();
}

export function useVersionManager() {
  const services = useServices();
  return services.getVersionManager();
}

export function usePasswordResetManager() {
  const services = useServices();
  return services.getPasswordResetManager();
}

/**
 * Hooks to access storage services
 */
export function useTokenStorage() {
  const services = useServices();
  return services.getTokenStorage();
}

/**
 * Hooks to access API services (for direct access if needed)
 */
export function useAuthAPI() {
  const services = useServices();
  return services.getAuthAPI();
}

export function useVersionAPI() {
  const services = useServices();
  return services.getVersionAPI();
}

export function usePasswordResetAPI() {
  const services = useServices();
  return services.getPasswordResetAPI();
}

/**
 * Hook for debugging services
 */
export function useServiceInfo() {
  const services = useServices();
  return {
    serviceNames: services.getServiceNames(),
    serviceInfo: services.getServiceInfo(),
    isInitialized: services.isInitialized(),
  };
}
