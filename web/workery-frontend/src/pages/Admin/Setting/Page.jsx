// File Path: web/workery-frontend/src/pages/Admin/Setting/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAccountManager,
  useTenantManager,
} from "../../../services/Services";
import {
  HomeIcon,
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
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function SettingDashboardPage() {
  const accountManager = useAccountManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [showTaxSettingModal, setShowTaxSettingModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error("Settings: Failed to fetch current user:", error);
      setErrors({ user: error.message || "Failed to load user details" });
      throw error;
    }
  };

  const fetchTenantDetail = async (tenantId) => {
    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );
      setTenant(tenantData);
      console.log("Settings: Tenant detail fetched successfully:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error("Settings: Failed to fetch tenant:", error);
      setErrors({ tenant: error.message || "Failed to load tenant details" });
    }
  };

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
        console.error("Settings: Failed to initialize data:", error);
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
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading Settings...
          </p>
        </div>
      </div>
    );
  }

  const settingsItems = [
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
      action: () => setShowTaxSettingModal(true),
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full xl:max-w-7xl">
      {/* Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2">
                Settings
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Error Alerts */}
      {errors.user && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-red-800 text-xs sm:text-sm">{errors.user}</span>
        </div>
      )}
      {errors.tenant && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-red-800 text-xs sm:text-sm">
            {errors.tenant}
          </span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mr-2" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Settings
            </h1>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Configure and manage your system settings. Click on any option below
            to modify specific settings.
          </p>

          {/* Settings Grid - Optimized for all screen sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-lg shadow-sm border-2 border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Icon Header - Responsive sizing */}
                  <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-4 sm:p-6 lg:p-8 text-white flex justify-center">
                    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />
                  </div>

                  {/* Content - Flex grow to push button down */}
                  <div className="p-3 sm:p-4 flex-grow flex flex-col">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 min-h-[40px] sm:min-h-[48px] lg:min-h-[56px] line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Button - Always at bottom */}
                  <div className="border-t border-gray-200">
                    {item.path ? (
                      <Link
                        to={item.path}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-blue-700 transition-colors duration-200 font-medium text-xs sm:text-sm"
                      >
                        View
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={item.action}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-blue-700 transition-colors duration-200 font-medium text-xs sm:text-sm"
                      >
                        View
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tax Settings Modal */}
      {tenant && (
        <TaxSettingModal
          currentUser={currentUser}
          tenant={tenant}
          showModal={showTaxSettingModal}
          setShowModal={setShowTaxSettingModal}
          onSuccess={() => {
            console.log("Tax settings updated successfully");
            // Optionally refresh tenant data
            if (currentUser && currentUser.tenantId) {
              fetchTenantDetail(currentUser.tenantId);
            }
          }}
        />
      )}
    </div>
  );
}

// Tax Setting Modal Component
function TaxSettingModal({
  currentUser,
  tenant,
  showModal,
  setShowModal,
  onSuccess,
}) {
  const tenantManager = useTenantManager();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(tenant?.taxRate || 0);

  const onUnauthorized = () => {
    window.location.href = "/login?unauthorized=true";
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const taxRateData = {
        tenantId: currentUser.tenantId,
        taxRate: parseFloat(taxRate),
      };

      await tenantManager.updateTaxRate(taxRateData, onUnauthorized);

      onSuccess();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to update tax rate:", error);
      setErrors({ submit: error.message || "Failed to update tax rate" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setTaxRate(tenant?.taxRate || 0);
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal && tenant) {
      setTaxRate(tenant.taxRate || 0);
    }
  }, [showModal, tenant]);

  if (!showModal) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content - Responsive sizing */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
              <div className="flex items-center">
                <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Tax Settings
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
              >
                <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              {errors.submit && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 text-xs sm:text-sm">
                    {errors.submit}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tax Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="Enter tax rate"
                  disabled={isLoading}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-xs sm:text-sm"
                />
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                  Tax rate applied to every order if the user has a tax account
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingDashboardPage;
