// File Path: web/workery-frontend/src/pages/Root/Tenant/Detail/Page.jsx
// Modernized Tenant Detail Page with Tailwind and Heroicons

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  // Helper component for detail items
  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {Icon && (
          <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <div className="text-sm text-gray-900 break-words">
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Tenant Details
                </h1>
                {tenant && (
                  <p className="text-sm text-gray-600 mt-1">{tenant.name}</p>
                )}
              </div>
            </div>
            {tenant && (
              <Link to={`/root/tenant/${tid}/edit`}>
                <Button variant="primary" icon={PencilSquareIcon}>
                  Edit Tenant
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Error Alerts */}
        {errors.fetch && (
          <Alert type="error" dismissible onDismiss={() => setErrors({})}>
            {errors.fetch}
          </Alert>
        )}
        {errors.tenantId && (
          <Alert type="error" dismissible onDismiss={() => setErrors({})}>
            {errors.tenantId}
          </Alert>
        )}

        {tenant && (
          <div className="space-y-6">
            {/* Identification Section */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <IdentificationIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Identification
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Description"
                      value={tenant.description}
                      icon={InformationCircleIcon}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Section */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Link to="/root/tenants">
                <Button variant="secondary" icon={ArrowLeftIcon}>
                  Back to List
                </Button>
              </Link>

              <div className="flex gap-3">
                <Link to={`/root/tenant/${tid}/start`}>
                  <Button variant="success">Start Tenant</Button>
                </Link>
                <Link to={`/root/tenant/${tid}/edit`}>
                  <Button variant="primary" icon={PencilSquareIcon}>
                    Edit Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {!tenant && !isLoading && (
          <Card>
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                Tenant Not Found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                The requested tenant could not be found.
              </p>
              <Link to="/root/tenants" className="inline-block mt-6">
                <Button variant="primary" icon={ArrowLeftIcon}>
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
