// File Path: monorepo/web/workery-frontend/src/services/Services.jsx
import React, { createContext, useContext, useMemo } from "react";
import { AuthAPI } from "./API/AuthAPI";
import { GatewayAPI } from "./API/GatewayAPI";
import { TokenStorage } from "./Storage/TokenStorage";
import { AuthManager } from "./Manager/AuthManager";
import { GatewayManager } from "./Manager/GatewayManager";
import { getAPIBaseURL, API_ENDPOINTS, ENV_CONFIG } from "./Config/APIConfig";

/**
 * Services container for dependency injection
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

    // Initialize API services
    const authAPI = new AuthAPI(baseURL, API_ENDPOINTS);
    this._services.set("authAPI", authAPI);

    const gatewayAPI = new GatewayAPI(baseURL, API_ENDPOINTS);
    this._services.set("gatewayAPI", gatewayAPI);

    // Initialize manager services (combine API and storage)
    const authManager = new AuthManager(authAPI, tokenStorage);
    this._services.set("authManager", authManager);

    const gatewayManager = new GatewayManager(gatewayAPI, tokenStorage);
    this._services.set("gatewayManager", gatewayManager);

    this._initialized = true;

    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.log("✅ Services initialized");
      console.log("🔗 API URL:", baseURL);
      console.log("📦 Available services:", Array.from(this._services.keys()));
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
      throw new Error(`Service '${serviceName}' not found`);
    }

    return service;
  }

  /**
   * Convenience getters for managers
   */
  getAuthManager() {
    return this.get("authManager");
  }

  getGatewayManager() {
    return this.get("gatewayManager");
  }

  /**
   * Convenience getters for storage
   */
  getTokenStorage() {
    return this.get("tokenStorage");
  }

  /**
   * Convenience getters for APIs
   */
  getAuthAPI() {
    return this.get("authAPI");
  }

  getGatewayAPI() {
    return this.get("gatewayAPI");
  }

  /**
   * Register a new service
   */
  register(serviceName, serviceInstance) {
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
 * Hooks to access services in components
 */
export function useServices() {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return services;
}

export function useAuthManager() {
  const services = useServices();
  return services.getAuthManager();
}

export function useGatewayManager() {
  const services = useServices();
  return services.getGatewayManager();
}

export function useTokenStorage() {
  const services = useServices();
  return services.getTokenStorage();
}

export function useAuthAPI() {
  const services = useServices();
  return services.getAuthAPI();
}

export function useGatewayAPI() {
  const services = useServices();
  return services.getGatewayAPI();
}

// Legacy singleton for gradual migration
const legacyServices = new ServicesContainer();

export const getAuthManager = () => legacyServices.getAuthManager();
export const getGatewayManager = () => legacyServices.getGatewayManager();
export const getTokenStorage = () => legacyServices.getTokenStorage();
export const getAuthAPI = () => legacyServices.getAuthAPI();
export const getGatewayAPI = () => legacyServices.getGatewayAPI();

export default legacyServices;
