// File Path: monorepo/web/workery-frontend/src/services/Services.jsx
import React, { createContext, useContext, useMemo } from "react";
import { AuthAPI } from "./API/AuthAPI";
import { VersionAPI } from "./API/VersionAPI";
import { PasswordResetAPI } from "./API/PasswordResetAPI";
import { TenantAPI } from "./API/TenantAPI";
import { DashboardAPI } from "./API/DashboardAPI";
import { TwoFactorAuthAPI } from "./API/TwoFactorAuthAPI";
import { AccountAPI } from "./API/AccountAPI";
import { VehicleTypeAPI } from "./API/VehicleTypeAPI";
import { TagAPI } from "./API/TagAPI";
import { TokenStorage } from "./Storage/TokenStorage";
import { AccountStorage } from "./Storage/AccountStorage";
import { DashboardStorage } from "./Storage/DashboardStorage";
import { TenantStorage } from "./Storage/TenantStorage";
import { VehicleTypeStorage } from "./Storage/VehicleTypeStorage";
import { TagStorage } from "./Storage/TagStorage";
import { AuthManager } from "./Manager/AuthManager";
import { VersionManager } from "./Manager/VersionManager";
import { PasswordResetManager } from "./Manager/PasswordResetManager";
import { TenantManager } from "./Manager/TenantManager";
import { DashboardManager } from "./Manager/DashboardManager";
import { TwoFactorAuthManager } from "./Manager/TwoFactorAuthManager";
import { AccountManager } from "./Manager/AccountManager";
import { VehicleTypeManager } from "./Manager/VehicleTypeManager";
import { TagManager } from "./Manager/TagManager";
import { getAPIBaseURL, API_ENDPOINTS, ENV_CONFIG } from "./Config/APIConfig";

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

    const accountStorage = new AccountStorage();
    this._services.set("accountStorage", accountStorage);

    const dashboardStorage = new DashboardStorage();
    this._services.set("dashboardStorage", dashboardStorage);

    const tenantStorage = new TenantStorage();
    this._services.set("tenantStorage", tenantStorage);

    const vehicleTypeStorage = new VehicleTypeStorage();
    this._services.set("vehicleTypeStorage", vehicleTypeStorage);

    const tagStorage = new TagStorage();
    this._services.set("tagStorage", tagStorage);

    // Initialize API services (depend on configuration)
    const authAPI = new AuthAPI(baseURL, API_ENDPOINTS);
    this._services.set("authAPI", authAPI);

    const versionAPI = new VersionAPI(baseURL, API_ENDPOINTS);
    this._services.set("versionAPI", versionAPI);

    const passwordResetAPI = new PasswordResetAPI(baseURL, API_ENDPOINTS);
    this._services.set("passwordResetAPI", passwordResetAPI);

    const tenantAPI = new TenantAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("tenantAPI", tenantAPI);

    const dashboardAPI = new DashboardAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("dashboardAPI", dashboardAPI);

    const twoFactorAuthAPI = new TwoFactorAuthAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("twoFactorAuthAPI", twoFactorAuthAPI);

    const accountAPI = new AccountAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("accountAPI", accountAPI);

    const vehicleTypeAPI = new VehicleTypeAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("vehicleTypeAPI", vehicleTypeAPI);

    const tagAPI = new TagAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("tagAPI", tagAPI);

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

    // TenantManager needs TenantAPI and TenantStorage
    const tenantManager = new TenantManager(tenantAPI, tenantStorage);
    this._services.set("tenantManager", tenantManager);

    // DashboardManager needs DashboardAPI and DashboardStorage
    const dashboardManager = new DashboardManager(
      dashboardAPI,
      dashboardStorage,
    );
    this._services.set("dashboardManager", dashboardManager);

    // TwoFactorAuthManager needs TwoFactorAuthAPI
    const twoFactorAuthManager = new TwoFactorAuthManager(twoFactorAuthAPI);
    this._services.set("twoFactorAuthManager", twoFactorAuthManager);

    // AccountManager needs AccountAPI and AccountStorage
    const accountManager = new AccountManager(accountAPI, accountStorage);
    this._services.set("accountManager", accountManager);

    // VehicleTypeManager needs VehicleTypeAPI and VehicleTypeStorage
    const vehicleTypeManager = new VehicleTypeManager(
      vehicleTypeAPI,
      vehicleTypeStorage,
    );
    this._services.set("vehicleTypeManager", vehicleTypeManager);

    // TagManager needs TagAPI and TagStorage
    const tagManager = new TagManager(tagAPI, tagStorage);
    this._services.set("tagManager", tagManager);

    this._initialized = true;

    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.group("✅ Services Initialized");
      console.log("🔗 API URL:", baseURL);
      console.log("📦 Available services:", Array.from(this._services.keys()));
      console.log("🏗️ Service dependency map:", {
        authManager: ["authAPI", "tokenStorage"],
        versionManager: ["versionAPI"],
        passwordResetManager: ["passwordResetAPI"],
        tenantManager: ["tenantAPI", "tenantStorage"],
        dashboardManager: ["dashboardAPI", "dashboardStorage"],
        twoFactorAuthManager: ["twoFactorAuthAPI"],
        accountManager: ["accountAPI", "accountStorage"],
        vehicleTypeManager: ["vehicleTypeAPI", "vehicleTypeStorage"],
        tagManager: ["tagAPI", "tagStorage"],
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

  getTenantManager() {
    return this.get("tenantManager");
  }

  getDashboardManager() {
    return this.get("dashboardManager");
  }

  getTwoFactorAuthManager() {
    return this.get("twoFactorAuthManager");
  }

  getAccountManager() {
    return this.get("accountManager");
  }

  getVehicleTypeManager() {
    return this.get("vehicleTypeManager");
  }

  getTagManager() {
    return this.get("tagManager");
  }

  /**
   * Convenience getters for storage services
   */
  getTokenStorage() {
    return this.get("tokenStorage");
  }

  getAccountStorage() {
    return this.get("accountStorage");
  }

  getDashboardStorage() {
    return this.get("dashboardStorage");
  }

  getTenantStorage() {
    return this.get("tenantStorage");
  }

  getVehicleTypeStorage() {
    return this.get("vehicleTypeStorage");
  }

  getTagStorage() {
    return this.get("tagStorage");
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

  getTenantAPI() {
    return this.get("tenantAPI");
  }

  getDashboardAPI() {
    return this.get("dashboardAPI");
  }

  getTwoFactorAuthAPI() {
    return this.get("twoFactorAuthAPI");
  }

  getAccountAPI() {
    return this.get("accountAPI");
  }

  getVehicleTypeAPI() {
    return this.get("vehicleTypeAPI");
  }

  getTagAPI() {
    return this.get("tagAPI");
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

export function useTenantManager() {
  const services = useServices();
  return services.getTenantManager();
}

export function useDashboardManager() {
  const services = useServices();
  return services.getDashboardManager();
}

export function useTwoFactorAuthManager() {
  const services = useServices();
  return services.getTwoFactorAuthManager();
}

export function useAccountManager() {
  const services = useServices();
  return services.getAccountManager();
}

export function useVehicleTypeManager() {
  const services = useServices();
  return services.getVehicleTypeManager();
}

export function useTagManager() {
  const services = useServices();
  return services.getTagManager();
}

/**
 * Hooks to access storage services
 */
export function useTokenStorage() {
  const services = useServices();
  return services.getTokenStorage();
}

export function useAccountStorage() {
  const services = useServices();
  return services.getAccountStorage();
}

export function useDashboardStorage() {
  const services = useServices();
  return services.getDashboardStorage();
}

export function useTenantStorage() {
  const services = useServices();
  return services.getTenantStorage();
}

export function useVehicleTypeStorage() {
  const services = useServices();
  return services.getVehicleTypeStorage();
}

export function useTagStorage() {
  const services = useServices();
  return services.getTagStorage();
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

export function useTenantAPI() {
  const services = useServices();
  return services.getTenantAPI();
}

export function useDashboardAPI() {
  const services = useServices();
  return services.getDashboardAPI();
}

export function useTwoFactorAuthAPI() {
  const services = useServices();
  return services.getTwoFactorAuthAPI();
}

export function useAccountAPI() {
  const services = useServices();
  return services.getAccountAPI();
}

export function useVehicleTypeAPI() {
  const services = useServices();
  return services.getVehicleTypeAPI();
}

export function useTagAPI() {
  const services = useServices();
  return services.getTagAPI();
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
