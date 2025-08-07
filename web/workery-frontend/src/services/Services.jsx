// File Path: web/workery-frontend/src/services/Services.jsx
import React, { createContext, useContext, useMemo } from "react";
import { AuthAPI } from "./API/AuthAPI";
import { VersionAPI } from "./API/VersionAPI";
import { PasswordResetAPI } from "./API/PasswordResetAPI";
import { TenantAPI } from "./API/TenantAPI";
import { DashboardAPI } from "./API/DashboardAPI";
import { TwoFactorAuthAPI } from "./API/TwoFactorAuthAPI";
import { AccountAPI } from "./API/AccountAPI";
import { CustomerAPI } from "./API/CustomerAPI";
import { AssociateAPI } from "./API/AssociateAPI";
import { StaffAPI } from "./API/StaffAPI";
import { OrderAPI } from "./API/OrderAPI";
import { TaskAPI } from "./API/TaskAPI";
import { ActivitySheetAPI } from "./API/ActivitySheetAPI";
import { FinancialAPI } from "./API/FinancialAPI";
import { AttachmentAPI } from "./API/AttachmentAPI";
import { VehicleTypeAPI } from "./API/VehicleTypeAPI";
import { TagAPI } from "./API/TagAPI";
import { SkillSetAPI } from "./API/SkillSetAPI";
import { NOCAPI } from "./API/NOCAPI";
import { NAICSAPI } from "./API/NAICSAPI";
import { InsuranceRequirementAPI } from "./API/InsuranceRequirementAPI";
import { ServiceFeeAPI } from "./API/ServiceFeeAPI";
import { CommentAPI } from "./API/CommentAPI";
import { BulletinAPI } from "./API/BulletinAPI";
import { AssociateAwayLogAPI } from "./API/AssociateAwayLogAPI";
import { JobHistoryAPI } from "./API/JobHistoryAPI";
import { TokenStorage } from "./Storage/TokenStorage";
import { AccountStorage } from "./Storage/AccountStorage";
import { DashboardStorage } from "./Storage/DashboardStorage";
import { TenantStorage } from "./Storage/TenantStorage";
import { CustomerStorage } from "./Storage/CustomerStorage";
import { AssociateStorage } from "./Storage/AssociateStorage";
import { StaffStorage } from "./Storage/StaffStorage";
import { OrderStorage } from "./Storage/OrderStorage";
import { TaskStorage } from "./Storage/TaskStorage";
import { ActivitySheetStorage } from "./Storage/ActivitySheetStorage";
import { FinancialStorage } from "./Storage/FinancialStorage";
import { AttachmentStorage } from "./Storage/AttachmentStorage";
import { VehicleTypeStorage } from "./Storage/VehicleTypeStorage";
import { TagStorage } from "./Storage/TagStorage";
import { SkillSetStorage } from "./Storage/SkillSetStorage";
import { NOCStorage } from "./Storage/NOCStorage";
import { NAICSStorage } from "./Storage/NAICSStorage";
import { InsuranceRequirementStorage } from "./Storage/InsuranceRequirementStorage";
import { ServiceFeeStorage } from "./Storage/ServiceFeeStorage";
import { CommentStorage } from "./Storage/CommentStorage";
import { BulletinStorage } from "./Storage/BulletinStorage";
import { AssociateAwayLogStorage } from "./Storage/AssociateAwayLogStorage";
import { JobHistoryStorage } from "./Storage/JobHistoryStorage";
import { AuthManager } from "./Manager/AuthManager";
import { VersionManager } from "./Manager/VersionManager";
import { PasswordResetManager } from "./Manager/PasswordResetManager";
import { TenantManager } from "./Manager/TenantManager";
import { DashboardManager } from "./Manager/DashboardManager";
import { TwoFactorAuthManager } from "./Manager/TwoFactorAuthManager";
import { AccountManager } from "./Manager/AccountManager";
import { CustomerManager } from "./Manager/CustomerManager";
import { AssociateManager } from "./Manager/AssociateManager";
import { StaffManager } from "./Manager/StaffManager";
import { OrderManager } from "./Manager/OrderManager";
import { TaskManager } from "./Manager/TaskManager";
import { ActivitySheetManager } from "./Manager/ActivitySheetManager";
import { FinancialManager } from "./Manager/FinancialManager";
import { AttachmentManager } from "./Manager/AttachmentManager";
import { VehicleTypeManager } from "./Manager/VehicleTypeManager";
import { TagManager } from "./Manager/TagManager";
import { SkillSetManager } from "./Manager/SkillSetManager";
import { NOCManager } from "./Manager/NOCManager";
import { NAICSManager } from "./Manager/NAICSManager";
import { InsuranceRequirementManager } from "./Manager/InsuranceRequirementManager";
import { ServiceFeeManager } from "./Manager/ServiceFeeManager";
import { CommentManager } from "./Manager/CommentManager";
import { BulletinManager } from "./Manager/BulletinManager";
import { AssociateAwayLogManager } from "./Manager/AssociateAwayLogManager";
import { JobHistoryManager } from "./Manager/JobHistoryManager";
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

    const customerStorage = new CustomerStorage();
    this._services.set("customerStorage", customerStorage);

    const associateStorage = new AssociateStorage();
    this._services.set("associateStorage", associateStorage);

    const staffStorage = new StaffStorage();
    this._services.set("staffStorage", staffStorage);

    const orderStorage = new OrderStorage();
    this._services.set("orderStorage", orderStorage);

    const taskStorage = new TaskStorage();
    this._services.set("taskStorage", taskStorage);

    const activitySheetStorage = new ActivitySheetStorage();
    this._services.set("activitySheetStorage", activitySheetStorage);

    const financialStorage = new FinancialStorage();
    this._services.set("financialStorage", financialStorage);

    const attachmentStorage = new AttachmentStorage();
    this._services.set("attachmentStorage", attachmentStorage);

    const vehicleTypeStorage = new VehicleTypeStorage();
    this._services.set("vehicleTypeStorage", vehicleTypeStorage);

    const tagStorage = new TagStorage();
    this._services.set("tagStorage", tagStorage);

    const skillSetStorage = new SkillSetStorage();
    this._services.set("skillSetStorage", skillSetStorage);

    const nocStorage = new NOCStorage();
    this._services.set("nocStorage", nocStorage);

    const naicsStorage = new NAICSStorage();
    this._services.set("naicsStorage", naicsStorage);

    const insuranceRequirementStorage = new InsuranceRequirementStorage();
    this._services.set(
      "insuranceRequirementStorage",
      insuranceRequirementStorage,
    );

    const serviceFeeStorage = new ServiceFeeStorage();
    this._services.set("serviceFeeStorage", serviceFeeStorage);

    const commentStorage = new CommentStorage();
    this._services.set("commentStorage", commentStorage);

    const bulletinStorage = new BulletinStorage();
    this._services.set("bulletinStorage", bulletinStorage);

    const associateAwayLogStorage = new AssociateAwayLogStorage();
    this._services.set("associateAwayLogStorage", associateAwayLogStorage);

    const jobHistoryStorage = new JobHistoryStorage();
    this._services.set("jobHistoryStorage", jobHistoryStorage);

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

    const customerAPI = new CustomerAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("customerAPI", customerAPI);

    const associateAPI = new AssociateAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("associateAPI", associateAPI);

    const staffAPI = new StaffAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("staffAPI", staffAPI);

    const orderAPI = new OrderAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("orderAPI", orderAPI);

    const taskAPI = new TaskAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("taskAPI", taskAPI);

    const activitySheetAPI = new ActivitySheetAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("activitySheetAPI", activitySheetAPI);

    const financialAPI = new FinancialAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("financialAPI", financialAPI);

    const attachmentAPI = new AttachmentAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("attachmentAPI", attachmentAPI);

    const vehicleTypeAPI = new VehicleTypeAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("vehicleTypeAPI", vehicleTypeAPI);

    const tagAPI = new TagAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("tagAPI", tagAPI);

    const skillSetAPI = new SkillSetAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("skillSetAPI", skillSetAPI);

    const nocAPI = new NOCAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("nocAPI", nocAPI);

    const naicsAPI = new NAICSAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("naicsAPI", naicsAPI);

    const insuranceRequirementAPI = new InsuranceRequirementAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("insuranceRequirementAPI", insuranceRequirementAPI);

    const serviceFeeAPI = new ServiceFeeAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("serviceFeeAPI", serviceFeeAPI);

    const commentAPI = new CommentAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("commentAPI", commentAPI);

    const bulletinAPI = new BulletinAPI(baseURL, API_ENDPOINTS, tokenStorage);
    this._services.set("bulletinAPI", bulletinAPI);

    const associateAwayLogAPI = new AssociateAwayLogAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("associateAwayLogAPI", associateAwayLogAPI);

    const jobHistoryAPI = new JobHistoryAPI(
      baseURL,
      API_ENDPOINTS,
      tokenStorage,
    );
    this._services.set("jobHistoryAPI", jobHistoryAPI);

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

    // CustomerManager needs CustomerAPI and CustomerStorage
    const customerManager = new CustomerManager(customerAPI, customerStorage);
    this._services.set("customerManager", customerManager);

    // AssociateManager needs AssociateAPI and AssociateStorage
    const associateManager = new AssociateManager(
      associateAPI,
      associateStorage,
    );
    this._services.set("associateManager", associateManager);

    // StaffManager needs StaffAPI and StaffStorage
    const staffManager = new StaffManager(staffAPI, staffStorage);
    this._services.set("staffManager", staffManager);

    // OrderManager needs OrderAPI and OrderStorage
    const orderManager = new OrderManager(orderAPI, orderStorage);
    this._services.set("orderManager", orderManager);

    // TaskManager needs TaskAPI and TaskStorage
    const taskManager = new TaskManager(taskAPI, taskStorage);
    this._services.set("taskManager", taskManager);

    // ActivitySheetManager needs ActivitySheetAPI and ActivitySheetStorage
    const activitySheetManager = new ActivitySheetManager(
      activitySheetAPI,
      activitySheetStorage,
    );
    this._services.set("activitySheetManager", activitySheetManager);

    // FinancialManager needs FinancialAPI and FinancialStorage
    const financialManager = new FinancialManager(
      financialAPI,
      financialStorage,
    );
    this._services.set("financialManager", financialManager);

    // AttachmentManager needs AttachmentAPI and AttachmentStorage
    const attachmentManager = new AttachmentManager(
      attachmentAPI,
      attachmentStorage,
    );
    this._services.set("attachmentManager", attachmentManager);

    // VehicleTypeManager needs VehicleTypeAPI and VehicleTypeStorage
    const vehicleTypeManager = new VehicleTypeManager(
      vehicleTypeAPI,
      vehicleTypeStorage,
    );
    this._services.set("vehicleTypeManager", vehicleTypeManager);

    // TagManager needs TagAPI and TagStorage
    const tagManager = new TagManager(tagAPI, tagStorage);
    this._services.set("tagManager", tagManager);

    // SkillSetManager needs SkillSetAPI and SkillSetStorage
    const skillSetManager = new SkillSetManager(skillSetAPI, skillSetStorage);
    this._services.set("skillSetManager", skillSetManager);

    // NOCManager needs NOCAPI and NOCStorage
    const nocManager = new NOCManager(nocAPI, nocStorage);
    this._services.set("nocManager", nocManager);

    // NAICSManager needs NAICSAPI and NAICSStorage
    const naicsManager = new NAICSManager(naicsAPI, naicsStorage);
    this._services.set("naicsManager", naicsManager);

    // InsuranceRequirementManager needs InsuranceRequirementAPI and InsuranceRequirementStorage
    const insuranceRequirementManager = new InsuranceRequirementManager(
      insuranceRequirementAPI,
      insuranceRequirementStorage,
    );
    this._services.set(
      "insuranceRequirementManager",
      insuranceRequirementManager,
    );

    // ServiceFeeManager needs ServiceFeeAPI and ServiceFeeStorage
    const serviceFeeManager = new ServiceFeeManager(
      serviceFeeAPI,
      serviceFeeStorage,
    );
    this._services.set("serviceFeeManager", serviceFeeManager);

    // CommentManager needs CommentAPI and CommentStorage
    const commentManager = new CommentManager(commentAPI, commentStorage);
    this._services.set("commentManager", commentManager);

    // BulletinManager needs BulletinAPI and BulletinStorage
    const bulletinManager = new BulletinManager(bulletinAPI, bulletinStorage);
    this._services.set("bulletinManager", bulletinManager);

    // AssociateAwayLogManager needs AssociateAwayLogAPI and AssociateAwayLogStorage
    const associateAwayLogManager = new AssociateAwayLogManager(
      associateAwayLogAPI,
      associateAwayLogStorage,
    );
    this._services.set("associateAwayLogManager", associateAwayLogManager);

    // JobHistoryManager needs JobHistoryAPI and JobHistoryStorage
    const jobHistoryManager = new JobHistoryManager(
      jobHistoryAPI,
      jobHistoryStorage,
    );
    this._services.set("jobHistoryManager", jobHistoryManager);

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
        customerManager: ["customerAPI", "customerStorage"],
        associateManager: ["associateAPI", "associateStorage"],
        staffManager: ["staffAPI", "staffStorage"],
        orderManager: ["orderAPI", "orderStorage"],
        taskManager: ["taskAPI", "taskStorage"],
        activitySheetManager: ["activitySheetAPI", "activitySheetStorage"],
        financialManager: ["financialAPI", "financialStorage"],
        attachmentManager: ["attachmentAPI", "attachmentStorage"],
        vehicleTypeManager: ["vehicleTypeAPI", "vehicleTypeStorage"],
        tagManager: ["tagAPI", "tagStorage"],
        skillSetManager: ["skillSetAPI", "skillSetStorage"],
        nocManager: ["nocAPI", "nocStorage"],
        naicsManager: ["naicsAPI", "naicsStorage"],
        insuranceRequirementManager: [
          "insuranceRequirementAPI",
          "insuranceRequirementStorage",
        ],
        serviceFeeManager: ["serviceFeeAPI", "serviceFeeStorage"],
        commentManager: ["commentAPI", "commentStorage"],
        bulletinManager: ["bulletinAPI", "bulletinStorage"],
        associateAwayLogManager: [
          "associateAwayLogAPI",
          "associateAwayLogStorage",
        ],
        jobHistoryManager: ["jobHistoryAPI", "jobHistoryStorage"],
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

  getCustomerManager() {
    return this.get("customerManager");
  }

  getAssociateManager() {
    return this.get("associateManager");
  }

  getStaffManager() {
    return this.get("staffManager");
  }

  getOrderManager() {
    return this.get("orderManager");
  }

  getTaskManager() {
    return this.get("taskManager");
  }

  getActivitySheetManager() {
    return this.get("activitySheetManager");
  }

  getFinancialManager() {
    return this.get("financialManager");
  }

  getAttachmentManager() {
    return this.get("attachmentManager");
  }

  getVehicleTypeManager() {
    return this.get("vehicleTypeManager");
  }

  getTagManager() {
    return this.get("tagManager");
  }

  getSkillSetManager() {
    return this.get("skillSetManager");
  }

  getNOCManager() {
    return this.get("nocManager");
  }

  getNAICSManager() {
    return this.get("naicsManager");
  }

  getInsuranceRequirementManager() {
    return this.get("insuranceRequirementManager");
  }

  getServiceFeeManager() {
    return this.get("serviceFeeManager");
  }

  getCommentManager() {
    return this.get("commentManager");
  }

  getBulletinManager() {
    return this.get("bulletinManager");
  }

  getAssociateAwayLogManager() {
    return this.get("associateAwayLogManager");
  }

  getJobHistoryManager() {
    return this.get("jobHistoryManager");
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

  getCustomerStorage() {
    return this.get("customerStorage");
  }

  getAssociateStorage() {
    return this.get("associateStorage");
  }

  getStaffStorage() {
    return this.get("staffStorage");
  }

  getOrderStorage() {
    return this.get("orderStorage");
  }

  getTaskStorage() {
    return this.get("taskStorage");
  }

  getActivitySheetStorage() {
    return this.get("activitySheetStorage");
  }

  getFinancialStorage() {
    return this.get("financialStorage");
  }

  getAttachmentStorage() {
    return this.get("attachmentStorage");
  }

  getVehicleTypeStorage() {
    return this.get("vehicleTypeStorage");
  }

  getTagStorage() {
    return this.get("tagStorage");
  }

  getSkillSetStorage() {
    return this.get("skillSetStorage");
  }

  getNOCStorage() {
    return this.get("nocStorage");
  }

  getNAICSStorage() {
    return this.get("naicsStorage");
  }

  getInsuranceRequirementStorage() {
    return this.get("insuranceRequirementStorage");
  }

  getServiceFeeStorage() {
    return this.get("serviceFeeStorage");
  }

  getCommentStorage() {
    return this.get("commentStorage");
  }

  getBulletinStorage() {
    return this.get("bulletinStorage");
  }

  getAssociateAwayLogStorage() {
    return this.get("associateAwayLogStorage");
  }

  getJobHistoryStorage() {
    return this.get("jobHistoryStorage");
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

  getCustomerAPI() {
    return this.get("customerAPI");
  }

  getAssociateAPI() {
    return this.get("associateAPI");
  }

  getStaffAPI() {
    return this.get("staffAPI");
  }

  getOrderAPI() {
    return this.get("orderAPI");
  }

  getTaskAPI() {
    return this.get("taskAPI");
  }

  getActivitySheetAPI() {
    return this.get("activitySheetAPI");
  }

  getFinancialAPI() {
    return this.get("financialAPI");
  }

  getAttachmentAPI() {
    return this.get("attachmentAPI");
  }

  getVehicleTypeAPI() {
    return this.get("vehicleTypeAPI");
  }

  getTagAPI() {
    return this.get("tagAPI");
  }

  getSkillSetAPI() {
    return this.get("skillSetAPI");
  }

  getNOCAPI() {
    return this.get("nocAPI");
  }

  getNAICSAPI() {
    return this.get("naicsAPI");
  }

  getInsuranceRequirementAPI() {
    return this.get("insuranceRequirementAPI");
  }

  getServiceFeeAPI() {
    return this.get("serviceFeeAPI");
  }

  getCommentAPI() {
    return this.get("commentAPI");
  }

  getBulletinAPI() {
    return this.get("bulletinAPI");
  }

  getAssociateAwayLogAPI() {
    return this.get("associateAwayLogAPI");
  }

  getJobHistoryAPI() {
    return this.get("jobHistoryAPI");
  }

  // ... rest of the methods remain the same ...
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

export function useCustomerManager() {
  const services = useServices();
  return services.getCustomerManager();
}

export function useAssociateManager() {
  const services = useServices();
  return services.getAssociateManager();
}

export function useStaffManager() {
  const services = useServices();
  return services.getStaffManager();
}

export function useOrderManager() {
  const services = useServices();
  return services.getOrderManager();
}

export function useTaskManager() {
  const services = useServices();
  return services.getTaskManager();
}

export function useActivitySheetManager() {
  const services = useServices();
  return services.getActivitySheetManager();
}

export function useFinancialManager() {
  const services = useServices();
  return services.getFinancialManager();
}

export function useAttachmentManager() {
  const services = useServices();
  return services.getAttachmentManager();
}

export function useVehicleTypeManager() {
  const services = useServices();
  return services.getVehicleTypeManager();
}

export function useTagManager() {
  const services = useServices();
  return services.getTagManager();
}

export function useSkillSetManager() {
  const services = useServices();
  return services.getSkillSetManager();
}

export function useNOCManager() {
  const services = useServices();
  return services.getNOCManager();
}

export function useNAICSManager() {
  const services = useServices();
  return services.getNAICSManager();
}

export function useInsuranceRequirementManager() {
  const services = useServices();
  return services.getInsuranceRequirementManager();
}

export function useServiceFeeManager() {
  const services = useServices();
  return services.getServiceFeeManager();
}

export function useCommentManager() {
  const services = useServices();
  return services.getCommentManager();
}

export function useBulletinManager() {
  const services = useServices();
  return services.getBulletinManager();
}

export function useAssociateAwayLogManager() {
  const services = useServices();
  return services.getAssociateAwayLogManager();
}

export function useJobHistoryManager() {
  const services = useServices();
  return services.getJobHistoryManager();
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

export function useCustomerStorage() {
  const services = useServices();
  return services.getCustomerStorage();
}

export function useAssociateStorage() {
  const services = useServices();
  return services.getAssociateStorage();
}

export function useStaffStorage() {
  const services = useServices();
  return services.getStaffStorage();
}

export function useOrderStorage() {
  const services = useServices();
  return services.getOrderStorage();
}

export function useTaskStorage() {
  const services = useServices();
  return services.getTaskStorage();
}

export function useActivitySheetStorage() {
  const services = useServices();
  return services.getActivitySheetStorage();
}

export function useFinancialStorage() {
  const services = useServices();
  return services.getFinancialStorage();
}

export function useAttachmentStorage() {
  const services = useServices();
  return services.getAttachmentStorage();
}

export function useVehicleTypeStorage() {
  const services = useServices();
  return services.getVehicleTypeStorage();
}

export function useTagStorage() {
  const services = useServices();
  return services.getTagStorage();
}

export function useSkillSetStorage() {
  const services = useServices();
  return services.getSkillSetStorage();
}

export function useNOCStorage() {
  const services = useServices();
  return services.getNOCStorage();
}

export function useNAICSStorage() {
  const services = useServices();
  return services.getNAICSStorage();
}

export function useInsuranceRequirementStorage() {
  const services = useServices();
  return services.getInsuranceRequirementStorage();
}

export function useServiceFeeStorage() {
  const services = useServices();
  return services.getServiceFeeStorage();
}

export function useCommentStorage() {
  const services = useServices();
  return services.getCommentStorage();
}

export function useBulletinStorage() {
  const services = useServices();
  return services.getBulletinStorage();
}

export function useAssociateAwayLogStorage() {
  const services = useServices();
  return services.getAssociateAwayLogStorage();
}

export function useJobHistoryStorage() {
  const services = useServices();
  return services.getJobHistoryStorage();
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

export function useCustomerAPI() {
  const services = useServices();
  return services.getCustomerAPI();
}

export function useAssociateAPI() {
  const services = useServices();
  return services.getAssociateAPI();
}

export function useStaffAPI() {
  const services = useServices();
  return services.getStaffAPI();
}

export function useOrderAPI() {
  const services = useServices();
  return services.getOrderAPI();
}

export function useTaskAPI() {
  const services = useServices();
  return services.getTaskAPI();
}

export function useActivitySheetAPI() {
  const services = useServices();
  return services.getActivitySheetAPI();
}

export function useFinancialAPI() {
  const services = useServices();
  return services.getFinancialAPI();
}

export function useAttachmentAPI() {
  const services = useServices();
  return services.getAttachmentAPI();
}

export function useVehicleTypeAPI() {
  const services = useServices();
  return services.getVehicleTypeAPI();
}

export function useTagAPI() {
  const services = useServices();
  return services.getTagAPI();
}

export function useSkillSetAPI() {
  const services = useServices();
  return services.getSkillSetAPI();
}

export function useNOCAPI() {
  const services = useServices();
  return services.getNOCAPI();
}

export function useNAICSAPI() {
  const services = useServices();
  return services.getNAICSAPI();
}

export function useInsuranceRequirementAPI() {
  const services = useServices();
  return services.getInsuranceRequirementAPI();
}

export function useServiceFeeAPI() {
  const services = useServices();
  return services.getServiceFeeAPI();
}

export function useCommentAPI() {
  const services = useServices();
  return services.getCommentAPI();
}

export function useBulletinAPI() {
  const services = useServices();
  return services.getBulletinAPI();
}

export function useAssociateAwayLogAPI() {
  const services = useServices();
  return services.getAssociateAwayLogAPI();
}

export function useJobHistoryAPI() {
  const services = useServices();
  return services.getJobHistoryAPI();
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
