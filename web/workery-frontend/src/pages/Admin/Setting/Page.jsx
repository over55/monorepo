// File Path: web/workery-frontend/src/pages/Admin/Setting/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Modal, Breadcrumb)

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAccountManager,
  useTenantManager,
} from "../../../services/Services";
import {
  Breadcrumb,
  PageHeader,
  Alert,
  UIXThemeProvider,
  ThemeSelector,
  useUIXTheme,
  Card,
  Loading,
} from "../../../components/UIX";
import {
  Cog6ToothIcon,
  NewspaperIcon,
  AcademicCapIcon,
  TagIcon,
  MegaphoneIcon,
  ScaleIcon,
  CreditCardIcon,
  UserMinusIcon,
  TruckIcon,
  PhoneIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  ChevronRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Theme-aware gradient configurations for settings cards
// These map the current theme to specific visual styles
const THEME_GRADIENTS = {
  blue: "linear-gradient(135deg, #172554 0%, #1e3a8a 100%)",
  red: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  purple: "linear-gradient(135deg, #581c87 0%, #7c3aed 100%)",
  green: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
  charcoal: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
  dark: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
};

const THEME_HOVER_COLORS = {
  blue: "group-hover:text-blue-600",
  red: "group-hover:text-red-600",
  purple: "group-hover:text-purple-600",
  green: "group-hover:text-green-600",
  charcoal: "group-hover:text-slate-600",
  dark: "group-hover:text-blue-400",
};

const THEME_BUTTON_GRADIENTS = {
  blue: "bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100",
  red: "bg-gradient-to-r from-gray-50 to-red-50 hover:from-red-50 hover:to-red-100",
  purple:
    "bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-50 hover:to-purple-100",
  green:
    "bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-green-100",
  charcoal:
    "bg-gradient-to-r from-gray-50 to-slate-50 hover:from-slate-50 hover:to-slate-100",
  dark:
    "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500",
};

const THEME_BUTTON_TEXT_COLORS = {
  blue: "text-gray-700 hover:text-blue-950",
  red: "text-gray-700 hover:text-red-950",
  purple: "text-gray-700 hover:text-purple-950",
  green: "text-gray-700 hover:text-green-950",
  charcoal: "text-gray-700 hover:text-slate-950",
  dark: "text-gray-100 hover:text-white",
};

// Move static settings items outside component
const SETTINGS_ITEMS = [
  {
    title: "Office News",
    description: "Modify office news items.",
    icon: NewspaperIcon,
    path: "/admin/settings/bulletins",
  },
  {
    title: "Skill Sets",
    description: "Modify the skill sets.",
    icon: AcademicCapIcon,
    path: "/admin/settings/skill-sets",
  },
  {
    title: "Tags",
    description: "Manage system tags and labels.",
    icon: TagIcon,
    path: "/admin/settings/tags",
  },
  {
    title: "Associate News",
    description: "Modify associate news items.",
    icon: MegaphoneIcon,
    path: "/admin/settings/associate-away-logs",
  },
  {
    title: "Insurance Requirements",
    description: "Modify insurance settings.",
    icon: ScaleIcon,
    path: "/admin/settings/insurance-requirements",
  },
  {
    title: "Service Fees",
    description: "Modify service fee settings.",
    icon: CreditCardIcon,
    path: "/admin/settings/service-fees",
  },
  {
    title: "Deactivated Clients",
    description: "Modify inactive customers.",
    icon: UserMinusIcon,
    path: "/admin/settings/inactive-clients",
  },
  {
    title: "Vehicle Types",
    description: "Modify vehicle types for associates.",
    icon: TruckIcon,
    path: "/admin/settings/vehicle-types",
  },
  {
    title: "How did you hear?",
    description: "List how users discovered us and referral sources.",
    icon: PhoneIcon,
    path: "/admin/settings/how-hear-about-us-items",
  },
  {
    title: "Tax Settings",
    description: "Change how tax gets applied system wide.",
    icon: BanknotesIcon,
    path: "/admin/settings/tax",
  },
  {
    title: "National Occupational Classification",
    description: "Search NOC's in the system.",
    icon: BuildingOfficeIcon,
    path: "/admin/settings/noc/search",
  },
  {
    title: "North America Industry Classification System",
    description: "Search NAICS's in the system.",
    icon: BuildingOffice2Icon,
    path: "/admin/settings/naics/search",
  },
];

const BREADCRUMB_ITEMS = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: ChartBarIcon,
  },
  {
    label: "Settings",
    icon: Cog6ToothIcon,
    isActive: true,
  },
];

function SettingDashboardPage() {
  return (
    <UIXThemeProvider>
      <SettingDashboardPageContent />
    </UIXThemeProvider>
  );
}

const SettingDashboardPageContent = memo(
  function SettingDashboardPageContent() {
    const accountManager = useAccountManager();
    const tenantManager = useTenantManager();
    const navigate = useNavigate();
    const { getThemeClasses, currentTheme } = useUIXTheme();

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [tenant, setTenant] = useState(null);

    // Memoize theme classes to prevent multiple calls on each render
    const themeClasses = useMemo(
      () => ({
        bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
        bgPrimary: getThemeClasses("bg-primary"),
        bgSecondary: getThemeClasses("bg-secondary"),
        textPrimary: getThemeClasses("text-primary"),
        textSecondary: getThemeClasses("text-secondary"),
        border: getThemeClasses("border"),
      }),
      [getThemeClasses],
    );

    // Memoize handlers
    const onUnauthorized = useCallback(() => {
      navigate("/login?unauthorized=true");
    }, [navigate]);

    const fetchCurrentUser = useCallback(async () => {
      try {
        const userData = await accountManager.getAccountDetail(onUnauthorized);
        if (import.meta.env.DEV) {
          console.log("Settings: Current user data:", userData);
        }
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Settings: Failed to fetch current user:", error);
        }
        setErrors({ user: error.message || "Failed to load user details" });
        throw error;
      }
    }, [accountManager, onUnauthorized]);

    const fetchTenantDetail = useCallback(
      async (tenantId) => {
        try {
          const tenantData = await tenantManager.getTenantDetail(
            tenantId,
            onUnauthorized,
          );
          setTenant(tenantData);
          if (import.meta.env.DEV) {
            console.log("Settings: Tenant detail fetched successfully:", {
              id: tenantData.id,
              name: tenantData.name,
            });
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Settings: Failed to fetch tenant:", error);
          }
          setErrors({
            tenant: error.message || "Failed to load tenant details",
          });
        }
      },
      [tenantManager, onUnauthorized],
    );

    // Memoize error handlers
    const handleCloseUserError = useCallback(() => {
      setErrors((prev) => ({ ...prev, user: null }));
    }, []);

    const handleCloseTenantError = useCallback(() => {
      setErrors((prev) => ({ ...prev, tenant: null }));
    }, []);

    const handleCloseThemeError = useCallback(() => {
      setErrors((prev) => ({ ...prev, theme: null }));
    }, []);

    const handleThemeChange = useCallback(async (newTheme) => {
      try {
        if (import.meta.env.DEV) {
          console.log("Settings: Saving theme preference to backend:", newTheme);
        }
        // Try to save to backend if the method exists
        if (accountManager.updateThemePreference) {
          await accountManager.updateThemePreference(newTheme, onUnauthorized);
          if (import.meta.env.DEV) {
            console.log("Settings: Theme preference saved successfully");
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Settings: Failed to save theme preference:", error);
        }
        // Show error to user but don't block theme change in UI
        setErrors((prev) => ({
          ...prev,
          theme: "Theme changed locally but failed to save to your profile. Please try again later.",
        }));
      }
    }, [accountManager, onUnauthorized]);

    useEffect(() => {
      let mounted = true;

      const initializeData = async () => {
        if (!mounted) return;

        setIsLoading(true);
        setErrors({});

        try {
          // First get current user
          const userData = await fetchCurrentUser();

          if (!mounted) return;

          // Then get tenant details using user's tenant ID
          if (userData && userData.tenantId) {
            await fetchTenantDetail(userData.tenantId);
          } else {
            setErrors({ tenant: "User does not have a valid tenant ID" });
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Settings: Failed to initialize data:", error);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      window.scrollTo(0, 0);
      initializeData();

      return () => {
        mounted = false;
      };
    }, [fetchCurrentUser, fetchTenantDetail]);

    // Memoize settings cards rendering
    const settingsCards = useMemo(() => {
      return SETTINGS_ITEMS.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card
            key={index}
            padding="p-0"
            className={`group ${themeClasses.bgPrimary} rounded-2xl shadow-lg ${themeClasses.border} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}
          >
            {/* Icon Header with theme-aware gradient */}
            <div
              className="p-6 text-white flex justify-center relative overflow-hidden"
              style={{ background: THEME_GRADIENTS[currentTheme] || THEME_GRADIENTS.blue }}
            >
              <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6 translate-y-12" />
              <IconComponent className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col">
              <h3
                className={`text-lg font-extrabold ${themeClasses.textPrimary} mb-2 transition-colors duration-200 ${THEME_HOVER_COLORS[currentTheme] || THEME_HOVER_COLORS.blue}`}
              >
                {item.title}
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary} line-clamp-3 mb-4 flex-grow`}>
                {item.description}
              </p>
            </div>

            {/* Footer Button */}
            <div className={`border-t ${themeClasses.border}`}>
              {item.path && (
                <Link
                  to={item.path}
                  className={`w-full p-4 ${THEME_BUTTON_GRADIENTS[currentTheme] || THEME_BUTTON_GRADIENTS.blue} flex items-center justify-between ${THEME_BUTTON_TEXT_COLORS[currentTheme] || THEME_BUTTON_TEXT_COLORS.blue} transition-all duration-200 font-extrabold`}
                >
                  <span>Manage Settings</span>
                  <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              )}
            </div>
          </Card>
        );
      });
    }, [currentTheme, themeClasses]);

    if (isLoading) {
      return (
        <Card
          padding="p-4"
          className={`min-h-screen ${themeClasses.bgGradientPrimary} flex items-center justify-center shadow-none border-0`}
        >
          <Loading size="lg" text="Loading Settings..." />
        </Card>
      );
    }

    return (
      <Card
        padding="p-0"
        className={`min-h-screen ${themeClasses.bgGradientPrimary} shadow-none border-0`}
      >
        {/* Decorative background elements - using theme-aware opacity */}
        <Card padding="p-0" className="fixed inset-0 overflow-hidden pointer-events-none shadow-none border-0 bg-transparent">
          <Card padding="p-0" className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob shadow-none border-0`} />
          <Card padding="p-0" className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 shadow-none border-0`} />
          <Card padding="p-0" className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 shadow-none border-0`} />
        </Card>

        <Card padding="p-0" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 shadow-none border-0 bg-transparent">
          {/* Breadcrumb */}
          <Breadcrumb items={BREADCRUMB_ITEMS} />

          <PageHeader
            icon={Cog6ToothIcon}
            title="System Settings"
          />

          {/* Theme Selector */}
          <Card className={`mb-8 ${themeClasses.bgPrimary} shadow-lg rounded-xl ${themeClasses.border}`}>
            <ThemeSelector onThemeChange={handleThemeChange} />
          </Card>

          {/* Error Alerts */}
          {errors.user && (
            <Alert
              type="error"
              message={errors.user}
              onClose={handleCloseUserError}
              className="mb-6"
            />
          )}
          {errors.tenant && (
            <Alert
              type="error"
              message={errors.tenant}
              onClose={handleCloseTenantError}
              className="mb-6"
            />
          )}
          {errors.theme && (
            <Alert
              type="warning"
              message={errors.theme}
              onClose={handleCloseThemeError}
              className="mb-6"
            />
          )}

          {/* Settings Grid Container */}
          <Card className={`${themeClasses.bgPrimary} shadow-xl rounded-2xl overflow-hidden ${themeClasses.border} hover:shadow-2xl transition-shadow duration-300`}>
            <Card padding="p-6 sm:p-8" className="shadow-none border-0 bg-transparent">
              {/* Settings Grid - Optimized for all screen sizes */}
              <Card padding="p-0" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 shadow-none border-0 bg-transparent">
                {settingsCards}
              </Card>
            </Card>
          </Card>
        </Card>

      </Card>
    );
  },
);

// Set display name for React DevTools
SettingDashboardPageContent.displayName = "SettingDashboardPageContent";

export default SettingDashboardPage;
