// File Path: monorepo/web/workery-frontend/src/services/Services.jsx
import React, { createContext, useContext, useMemo } from "react";
import { getAPIBaseURL, API_ENDPOINTS, ENV_CONFIG } from "./Config/APIConfig";

// Import all Storage services
import { TokenStorage } from "./Storage/TokenStorage";
import { AccountStorage } from "./Storage/AccountStorage";
import { DashboardStorage } from "./Storage/DashboardStorage";
import { TenantStorage } from "./Storage/TenantStorage";
import { CustomerStorage } from "./Storage/CustomerStorage";
import { AssociateStorage } from "./Storage/AssociateStorage";
import { StaffStorage } from "./Storage/StaffStorage";
import { OrderStorage } from "./Storage/OrderStorage";
import { TransferOperationStorage } from "./Storage/TransferOperationStorage";
import { OrderCreationStorage } from "./Storage/OrderCreationStorage";
import { OrderCompletionStorage } from "./Storage/OrderCompletionStorage";
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
import { OrderIncidentStorage } from "./Storage/OrderIncidentStorage";
import { HowHearAboutUsItemStorage } from "./Storage/HowHearAboutUsItemStorage";
import { SurveyStorage } from "./Storage/SurveyStorage";
import { InvoiceGenerationStorage } from "./Storage/InvoiceGenerationStorage";
import { StaffAddWizardStorage } from "./Storage/StaffAddWizardStorage";
import { ReportStorage } from "./Storage/ReportStorage";

// Import all API services
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
import { OrderIncidentAPI } from "./API/OrderIncidentAPI";
import { HowHearAboutUsItemAPI } from "./API/HowHearAboutUsItemAPI";
import { ReportAPI } from "./API/ReportAPI";

// Import all Manager services
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
import { OrderIncidentManager } from "./Manager/OrderIncidentManager";
import { HowHearAboutUsItemManager } from "./Manager/HowHearAboutUsItemManager";
import { ReportManager } from "./Manager/ReportManager";

/**
 * Service Definition Registry
 * Defines all services, their dependencies, and factory functions
 */
const SERVICE_DEFINITIONS = {
  // Storage Services (no dependencies)
  storage: {
    token: {
      factory: () => new TokenStorage(),
      singleton: true,
    },
    account: {
      factory: () => new AccountStorage(),
      singleton: true,
    },
    dashboard: {
      factory: () => new DashboardStorage(),
      singleton: true,
    },
    tenant: {
      factory: () => new TenantStorage(),
      singleton: true,
    },
    customer: {
      factory: () => new CustomerStorage(),
      singleton: true,
    },
    associate: {
      factory: () => new AssociateStorage(),
      singleton: true,
    },
    staff: {
      factory: () => new StaffStorage(),
      singleton: true,
    },
    order: {
      factory: () => new OrderStorage(),
      singleton: true,
    },
    transferOperation: {
      factory: () => new TransferOperationStorage(),
      singleton: true,
    },
    task: {
      factory: () => new TaskStorage(),
      singleton: true,
    },
    activitySheet: {
      factory: () => new ActivitySheetStorage(),
      singleton: true,
    },
    financial: {
      factory: () => new FinancialStorage(),
      singleton: true,
    },
    attachment: {
      factory: () => new AttachmentStorage(),
      singleton: true,
    },
    vehicleType: {
      factory: () => new VehicleTypeStorage(),
      singleton: true,
    },
    tag: {
      factory: () => new TagStorage(),
      singleton: true,
    },
    skillSet: {
      factory: () => new SkillSetStorage(),
      singleton: true,
    },
    noc: {
      factory: () => new NOCStorage(),
      singleton: true,
    },
    naics: {
      factory: () => new NAICSStorage(),
      singleton: true,
    },
    insuranceRequirement: {
      factory: () => new InsuranceRequirementStorage(),
      singleton: true,
    },
    serviceFee: {
      factory: () => new ServiceFeeStorage(),
      singleton: true,
    },
    comment: {
      factory: () => new CommentStorage(),
      singleton: true,
    },
    bulletin: {
      factory: () => new BulletinStorage(),
      singleton: true,
    },
    associateAwayLog: {
      factory: () => new AssociateAwayLogStorage(),
      singleton: true,
    },
    jobHistory: {
      factory: () => new JobHistoryStorage(),
      singleton: true,
    },
    orderIncident: {
      factory: () => new OrderIncidentStorage(),
      singleton: true,
    },
    howHearAboutUsItem: {
      factory: () => new HowHearAboutUsItemStorage(),
      singleton: true,
    },
    orderCreation: {
      factory: () => new OrderCreationStorage(),
      singleton: true,
    },
    orderCompletion: {
      factory: () => new OrderCompletionStorage(),
      singleton: true,
    },
    survey: {
      factory: () => new SurveyStorage(),
      singleton: true,
    },
    invoiceGeneration: {
      factory: () => new InvoiceGenerationStorage(),
      singleton: true,
    },
    staffAddWizard: {
      factory: () => new StaffAddWizardStorage(),
      singleton: true,
    },
    report: {
      factory: () => new ReportStorage(),
      singleton: true,
    },
  },

  // API Services
  api: {
    auth: {
      factory: (deps) =>
        new AuthAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    version: {
      factory: (deps) => new VersionAPI(deps.baseURL, deps.endpoints),
      dependencies: ["baseURL", "endpoints"],
      singleton: true,
    },
    passwordReset: {
      factory: (deps) => new PasswordResetAPI(deps.baseURL, deps.endpoints),
      dependencies: ["baseURL", "endpoints"],
      singleton: true,
    },
    tenant: {
      factory: (deps) =>
        new TenantAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    dashboard: {
      factory: (deps) =>
        new DashboardAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    twoFactorAuth: {
      factory: (deps) =>
        new TwoFactorAuthAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    account: {
      factory: (deps) =>
        new AccountAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    customer: {
      factory: (deps) =>
        new CustomerAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    associate: {
      factory: (deps) =>
        new AssociateAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    staff: {
      factory: (deps) =>
        new StaffAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    order: {
      factory: (deps) =>
        new OrderAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    task: {
      factory: (deps) =>
        new TaskAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    activitySheet: {
      factory: (deps) =>
        new ActivitySheetAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    financial: {
      factory: (deps) =>
        new FinancialAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    attachment: {
      factory: (deps) =>
        new AttachmentAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    vehicleType: {
      factory: (deps) =>
        new VehicleTypeAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    tag: {
      factory: (deps) =>
        new TagAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    skillSet: {
      factory: (deps) =>
        new SkillSetAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    noc: {
      factory: (deps) =>
        new NOCAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    naics: {
      factory: (deps) =>
        new NAICSAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    insuranceRequirement: {
      factory: (deps) =>
        new InsuranceRequirementAPI(
          deps.baseURL,
          deps.endpoints,
          deps.tokenStorage,
        ),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    serviceFee: {
      factory: (deps) =>
        new ServiceFeeAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    comment: {
      factory: (deps) =>
        new CommentAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    bulletin: {
      factory: (deps) =>
        new BulletinAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    associateAwayLog: {
      factory: (deps) =>
        new AssociateAwayLogAPI(
          deps.baseURL,
          deps.endpoints,
          deps.tokenStorage,
        ),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    jobHistory: {
      factory: (deps) =>
        new JobHistoryAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    orderIncident: {
      factory: (deps) =>
        new OrderIncidentAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    howHearAboutUsItem: {
      factory: (deps) =>
        new HowHearAboutUsItemAPI(
          deps.baseURL,
          deps.endpoints,
          deps.tokenStorage,
        ),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
    report: {
      factory: (deps) =>
        new ReportAPI(deps.baseURL, deps.endpoints, deps.tokenStorage),
      dependencies: ["baseURL", "endpoints", "storage:token"],
      singleton: true,
    },
  },

  // Manager Services
  manager: {
    auth: {
      factory: (deps) => new AuthManager(deps.authAPI, deps.tokenStorage),
      dependencies: ["api:auth", "storage:token"],
      singleton: true,
    },
    version: {
      factory: (deps) => new VersionManager(deps.versionAPI),
      dependencies: ["api:version"],
      singleton: true,
    },
    passwordReset: {
      factory: (deps) => new PasswordResetManager(deps.passwordResetAPI),
      dependencies: ["api:passwordReset"],
      singleton: true,
    },
    tenant: {
      factory: (deps) => new TenantManager(deps.tenantAPI, deps.tenantStorage),
      dependencies: ["api:tenant", "storage:tenant"],
      singleton: true,
    },
    dashboard: {
      factory: (deps) =>
        new DashboardManager(deps.dashboardAPI, deps.dashboardStorage),
      dependencies: ["api:dashboard", "storage:dashboard"],
      singleton: true,
    },
    twoFactorAuth: {
      factory: (deps) => new TwoFactorAuthManager(deps.twoFactorAuthAPI),
      dependencies: ["api:twoFactorAuth"],
      singleton: true,
    },
    account: {
      factory: (deps) =>
        new AccountManager(deps.accountAPI, deps.accountStorage),
      dependencies: ["api:account", "storage:account"],
      singleton: true,
    },
    customer: {
      factory: (deps) =>
        new CustomerManager(deps.customerAPI, deps.customerStorage),
      dependencies: ["api:customer", "storage:customer"],
      singleton: true,
    },
    associate: {
      factory: (deps) =>
        new AssociateManager(deps.associateAPI, deps.associateStorage),
      dependencies: ["api:associate", "storage:associate"],
      singleton: true,
    },
    staff: {
      factory: (deps) => new StaffManager(deps.staffAPI, deps.staffStorage),
      dependencies: ["api:staff", "storage:staff"],
      singleton: true,
    },
    order: {
      factory: (deps) => new OrderManager(deps.orderAPI, deps.orderStorage),
      dependencies: ["api:order", "storage:order"],
      singleton: true,
    },
    task: {
      factory: (deps) => new TaskManager(deps.taskAPI, deps.taskStorage),
      dependencies: ["api:task", "storage:task"],
      singleton: true,
    },
    activitySheet: {
      factory: (deps) =>
        new ActivitySheetManager(
          deps.activitySheetAPI,
          deps.activitySheetStorage,
        ),
      dependencies: ["api:activitySheet", "storage:activitySheet"],
      singleton: true,
    },
    financial: {
      factory: (deps) =>
        new FinancialManager(deps.financialAPI, deps.financialStorage),
      dependencies: ["api:financial", "storage:financial"],
      singleton: true,
    },
    attachment: {
      factory: (deps) =>
        new AttachmentManager(deps.attachmentAPI, deps.attachmentStorage),
      dependencies: ["api:attachment", "storage:attachment"],
      singleton: true,
    },
    vehicleType: {
      factory: (deps) =>
        new VehicleTypeManager(deps.vehicleTypeAPI, deps.vehicleTypeStorage),
      dependencies: ["api:vehicleType", "storage:vehicleType"],
      singleton: true,
    },
    tag: {
      factory: (deps) => new TagManager(deps.tagAPI, deps.tagStorage),
      dependencies: ["api:tag", "storage:tag"],
      singleton: true,
    },
    skillSet: {
      factory: (deps) =>
        new SkillSetManager(deps.skillSetAPI, deps.skillSetStorage),
      dependencies: ["api:skillSet", "storage:skillSet"],
      singleton: true,
    },
    noc: {
      factory: (deps) => new NOCManager(deps.nocAPI, deps.nocStorage),
      dependencies: ["api:noc", "storage:noc"],
      singleton: true,
    },
    naics: {
      factory: (deps) => new NAICSManager(deps.naicsAPI, deps.naicsStorage),
      dependencies: ["api:naics", "storage:naics"],
      singleton: true,
    },
    insuranceRequirement: {
      factory: (deps) =>
        new InsuranceRequirementManager(
          deps.insuranceRequirementAPI,
          deps.insuranceRequirementStorage,
        ),
      dependencies: [
        "api:insuranceRequirement",
        "storage:insuranceRequirement",
      ],
      singleton: true,
    },
    serviceFee: {
      factory: (deps) =>
        new ServiceFeeManager(deps.serviceFeeAPI, deps.serviceFeeStorage),
      dependencies: ["api:serviceFee", "storage:serviceFee"],
      singleton: true,
    },
    comment: {
      factory: (deps) =>
        new CommentManager(deps.commentAPI, deps.commentStorage),
      dependencies: ["api:comment", "storage:comment"],
      singleton: true,
    },
    bulletin: {
      factory: (deps) =>
        new BulletinManager(deps.bulletinAPI, deps.bulletinStorage),
      dependencies: ["api:bulletin", "storage:bulletin"],
      singleton: true,
    },
    associateAwayLog: {
      factory: (deps) =>
        new AssociateAwayLogManager(
          deps.associateAwayLogAPI,
          deps.associateAwayLogStorage,
        ),
      dependencies: ["api:associateAwayLog", "storage:associateAwayLog"],
      singleton: true,
    },
    jobHistory: {
      factory: (deps) =>
        new JobHistoryManager(deps.jobHistoryAPI, deps.jobHistoryStorage),
      dependencies: ["api:jobHistory", "storage:jobHistory"],
      singleton: true,
    },
    orderIncident: {
      factory: (deps) =>
        new OrderIncidentManager(
          deps.orderIncidentAPI,
          deps.orderIncidentStorage,
        ),
      dependencies: ["api:orderIncident", "storage:orderIncident"],
      singleton: true,
    },
    howHearAboutUsItem: {
      factory: (deps) =>
        new HowHearAboutUsItemManager(
          deps.howHearAboutUsItemAPI,
          deps.howHearAboutUsItemStorage,
        ),
      dependencies: ["api:howHearAboutUsItem", "storage:howHearAboutUsItem"],
      singleton: true,
    },
    report: {
      factory: (deps) => new ReportManager(deps.reportAPI, deps.reportStorage),
      dependencies: ["api:report", "storage:report"],
      singleton: true,
    },
  },
};

/**
 * Enhanced Services Container with automatic dependency resolution
 */
class ServicesContainer {
  constructor() {
    this._instances = new Map();
    this._config = null;
    this._initialized = false;
  }

  /**
   * Initialize the container synchronously
   */
  initialize() {
    if (this._initialized) {
      return;
    }

    // Set up configuration
    this._config = {
      baseURL: getAPIBaseURL(),
      endpoints: API_ENDPOINTS,
    };

    this._initialized = true;

    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.group("🚀 Services Container Initialization");
      console.log("📍 API Base URL:", this._config.baseURL);
      console.log("🔧 Environment:", ENV_CONFIG.MODE);
      console.groupEnd();
    }
  }

  /**
   * Resolve dependencies for a service
   */
  _resolveDependencies(dependencies = []) {
    const resolved = { ...this._config };

    for (const dep of dependencies) {
      if (dep.includes(":")) {
        // Service dependency (e.g., 'storage:token')
        const [type, name] = dep.split(":");
        const serviceKey = this._normalizeServiceKey(name, type);
        resolved[serviceKey] = this._getOrCreateService(type, name);
      } else {
        // Config dependency (already in resolved)
      }
    }

    return resolved;
  }

  /**
   * Normalize service key for dependency injection
   */
  _normalizeServiceKey(name, type) {
    // Special handling for API type to match expected naming
    if (type === "api") {
      return `${name}API`;
    }
    if (type === "storage") {
      return `${name}Storage`;
    }
    // For other types, capitalize first letter
    const suffix = type.charAt(0).toUpperCase() + type.slice(1);
    return `${name}${suffix}`;
  }

  /**
   * Get or create a service instance
   */
  _getOrCreateService(type, name) {
    const key = `${type}:${name}`;

    // Check if instance already exists
    if (this._instances.has(key)) {
      return this._instances.get(key);
    }

    // Get service definition
    const definition = SERVICE_DEFINITIONS[type]?.[name];
    if (!definition) {
      throw new Error(`Service definition not found: ${key}`);
    }

    // Resolve dependencies
    const dependencies = this._resolveDependencies(definition.dependencies);

    // Create instance
    const instance = definition.factory(dependencies);

    // Store if singleton
    if (definition.singleton) {
      this._instances.set(key, instance);
    }

    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.log(`✅ Created service: ${key}`);
    }

    return instance;
  }

  /**
   * Get a service by type and name
   */
  get(type, name) {
    // Initialize on first use if not already initialized
    if (!this._initialized) {
      this.initialize();
    }

    const service = this._getOrCreateService(type, name);
    if (!service) {
      throw new Error(`Service not found: ${type}:${name}`);
    }

    return service;
  }

  /**
   * Get all available services for debugging
   */
  getAvailableServices() {
    const services = {};
    for (const [type, definitions] of Object.entries(SERVICE_DEFINITIONS)) {
      services[type] = Object.keys(definitions);
    }
    return services;
  }

  /**
   * Get initialization status
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Clear all cached instances (useful for testing)
   */
  clear() {
    this._instances.clear();
    this._initialized = false;
  }
}

// Create singleton instance
let containerInstance = null;

/**
 * Get or create the container instance
 */
function getContainer() {
  if (!containerInstance) {
    containerInstance = new ServicesContainer();
    containerInstance.initialize();
  }
  return containerInstance;
}

// React Context
const ServicesContext = createContext(null);

/**
 * ServiceProvider component - Required to wrap your app
 */
export function ServiceProvider({ children }) {
  const services = useMemo(() => {
    return getContainer();
  }, []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Base hook to access services container
 * @internal This is primarily for internal use. Components should use specific manager hooks.
 */
function useServices() {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return services;
}

/**
 * Generic hook factory for services
 * @internal
 */
function createServiceHook(type, name) {
  return function useService() {
    const services = useServices();
    return services.get(type, name);
  };
}

/**
 * Manager Hooks (Primary Public Interface)
 * These are the only service hooks that should be used by components.
 * Managers handle all business logic and coordinate between API and Storage layers.
 */
export const useAuthManager = createServiceHook("manager", "auth");
export const useVersionManager = createServiceHook("manager", "version");
export const usePasswordResetManager = createServiceHook(
  "manager",
  "passwordReset",
);
export const useTenantManager = createServiceHook("manager", "tenant");
export const useDashboardManager = createServiceHook("manager", "dashboard");
export const useTwoFactorAuthManager = createServiceHook(
  "manager",
  "twoFactorAuth",
);
export const useAccountManager = createServiceHook("manager", "account");
export const useCustomerManager = createServiceHook("manager", "customer");
export const useAssociateManager = createServiceHook("manager", "associate");
export const useStaffManager = createServiceHook("manager", "staff");
export const useOrderManager = createServiceHook("manager", "order");
export const useTaskManager = createServiceHook("manager", "task");
export const useActivitySheetManager = createServiceHook(
  "manager",
  "activitySheet",
);
export const useFinancialManager = createServiceHook("manager", "financial");
export const useAttachmentManager = createServiceHook("manager", "attachment");
export const useVehicleTypeManager = createServiceHook(
  "manager",
  "vehicleType",
);
export const useTagManager = createServiceHook("manager", "tag");
export const useSkillSetManager = createServiceHook("manager", "skillSet");
export const useNOCManager = createServiceHook("manager", "noc");
export const useNAICSManager = createServiceHook("manager", "naics");
export const useInsuranceRequirementManager = createServiceHook(
  "manager",
  "insuranceRequirement",
);
export const useServiceFeeManager = createServiceHook("manager", "serviceFee");
export const useCommentManager = createServiceHook("manager", "comment");
export const useBulletinManager = createServiceHook("manager", "bulletin");
export const useAssociateAwayLogManager = createServiceHook(
  "manager",
  "associateAwayLog",
);
export const useJobHistoryManager = createServiceHook("manager", "jobHistory");
export const useOrderIncidentManager = createServiceHook(
  "manager",
  "orderIncident",
);
export const useHowHearAboutUsItemManager = createServiceHook(
  "manager",
  "howHearAboutUsItem",
);
export const useTransferOperationStorage = createServiceHook(
  "storage",
  "transferOperation",
);

export const useOrderCreationStorage = createServiceHook(
  "storage",
  "orderCreation",
);
export const useOrderCompletionStorage = createServiceHook(
  "storage",
  "orderCompletion",
);
export const useSurveyStorage = createServiceHook("storage", "survey");
export const useInvoiceGenerationStorage = createServiceHook(
  "storage",
  "invoiceGeneration",
);
export const useStaffAddWizardStorage = createServiceHook(
  "storage",
  "staffAddWizard",
);

/**
 * Internal service hooks - NOT EXPORTED
 * Storage and API services should only be accessed through Managers
 */
// const useTokenStorage = createServiceHook('storage', 'token');
// const useAuthAPI = createServiceHook('api', 'auth');
// ... etc

/**
 * Debug hook for service information
 * @internal For debugging purposes only
 */
export function useServiceInfo() {
  const services = useServices();
  return {
    availableServices: services.getAvailableServices(),
    isInitialized: services.isInitialized(),
  };
}

export const useReportManager = createServiceHook("manager", "report");
