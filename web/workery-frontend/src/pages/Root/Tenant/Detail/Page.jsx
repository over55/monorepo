// File Path: web/workery-frontend/src/pages/Root/Tenant/Detail/Page.jsx
// Optimized Responsive Tenant Detail Page with Enhanced Mobile/Tablet Support

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Badge,
} from "../../../../components/UI";
import {
  BuildingOfficeIcon,
  HomeIcon,
  InformationCircleIcon,
  IdentificationIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapIcon,
  HomeModernIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

function RootTenantDetailPage() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenantDetail = async (tenantId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );

      setTenant(tenantData);

      console.log("RootTenantDetailPage: Tenant detail fetched successfully:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error(
        "RootTenantDetailPage: Failed to fetch tenant detail:",
        error,
      );
      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        return;
      }

      fetchTenantDetail(tid);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Loading size="lg" text="Loading Tenant Details..." />
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: "Root Dashboard",
      href: "/root/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Tenants",
      href: "/root/tenants",
      icon: BuildingOffice2Icon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
    },
  ];

  // Helper component for detail items with enhanced responsive design
  const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-3 sm:p-4 ${
        fullWidth ? "col-span-full" : "col-span-1"
      }`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        {Icon && (
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <div className="text-xs sm:text-sm text-gray-900 break-words">
            {value || (
              <span className="text-gray-400 italic">Not provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <BuildingOffice2Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Tenant Details
                </h1>
                {tenant && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                    {tenant.name}
                  </p>
                )}
              </div>
            </div>
            {tenant && (
              <div className="flex justify-end">
                <Link to={`/root/tenant/${tid}/edit`}>
                  <Button
                    variant="primary"
                    icon={PencilSquareIcon}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    <span className="hidden xs:inline">Edit Tenant</span>
                    <span className="xs:hidden">Edit</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Responsive Padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Responsive Breadcrumb */}
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Error Alerts */}
        {errors.fetch && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setErrors({})}
            className="mb-4"
          >
            {errors.fetch}
          </Alert>
        )}
        {errors.tenantId && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setErrors({})}
            className="mb-4"
          >
            {errors.tenantId}
          </Alert>
        )}

        {tenant && (
          <div className="space-y-4 sm:space-y-6">
            {/* Identification Section */}
            <Card className="overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <IdentificationIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Identification
                  </h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                  <DetailItem
                    label="Schema Name"
                    value={tenant.schemaName}
                    icon={HashtagIcon}
                  />
                  <DetailItem
                    label="Name"
                    value={tenant.name}
                    icon={BuildingOfficeIcon}
                  />
                  <DetailItem
                    label="Alternate Name"
                    value={tenant.alternateName}
                    icon={BuildingOfficeIcon}
                  />
                  <DetailItem
                    label="Description"
                    value={tenant.description}
                    icon={InformationCircleIcon}
                    fullWidth={true}
                  />
                </div>
              </div>
            </Card>

            {/* Contact Section */}
            <Card className="overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                  <DetailItem
                    label="Email"
                    value={tenant.email}
                    icon={EnvelopeIcon}
                  />
                  <DetailItem
                    label="Telephone"
                    value={tenant.telephone}
                    icon={PhoneIcon}
                  />
                </div>
              </div>
            </Card>

            {/* Address Section */}
            <Card className="overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <DetailItem
                    label="Country"
                    value={tenant.addressCountry}
                    icon={GlobeAltIcon}
                  />
                  <DetailItem
                    label="State/Province"
                    value={tenant.addressRegion}
                    icon={MapIcon}
                  />
                  <DetailItem
                    label="City"
                    value={tenant.addressLocality}
                    icon={BuildingOfficeIcon}
                  />
                  <DetailItem
                    label="Postal Code"
                    value={tenant.postalCode}
                    icon={HashtagIcon}
                  />
                  <DetailItem
                    label="Street Address"
                    value={tenant.streetAddress}
                    icon={HomeModernIcon}
                  />
                  <DetailItem
                    label="Address (Extra line)"
                    value={tenant.streetAddressExtra}
                    icon={HomeModernIcon}
                  />
                </div>
              </div>
            </Card>

            {/* Responsive Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4 pt-2 sm:pt-4 lg:pt-6">
              <Link to="/root/tenants" className="order-2 sm:order-1">
                <Button
                  variant="secondary"
                  icon={ArrowLeftIcon}
                  className="w-full sm:w-auto justify-center text-sm sm:text-base"
                >
                  Back to List
                </Button>
              </Link>

              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                <Link
                  to={`/root/tenant/${tid}/start`}
                  className="flex-1 xs:flex-none"
                >
                  <Button
                    variant="success"
                    className="w-full xs:w-auto justify-center text-sm sm:text-base"
                  >
                    Start Tenant
                  </Button>
                </Link>
                <Link
                  to={`/root/tenant/${tid}/edit`}
                  className="flex-1 xs:flex-none"
                >
                  <Button
                    variant="primary"
                    icon={PencilSquareIcon}
                    className="w-full xs:w-auto justify-center text-sm sm:text-base"
                  >
                    <span className="hidden xs:inline">Edit Details</span>
                    <span className="xs:hidden">Edit</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Found State - Responsive */}
        {!tenant && !isLoading && (
          <Card className="overflow-hidden">
            <div className="text-center py-8 sm:py-12 px-4">
              <BuildingOfficeIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h2 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">
                Tenant Not Found
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                The requested tenant could not be found.
              </p>
              <Link to="/root/tenants" className="inline-block mt-4 sm:mt-6">
                <Button
                  variant="primary"
                  icon={ArrowLeftIcon}
                  className="text-sm sm:text-base"
                >
                  Back to Tenants List
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

export default RootTenantDetailPage;
