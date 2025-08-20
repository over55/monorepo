// File Path: web/workery-frontend/src/pages/Root/Tenant/Update/Page.jsx
// Optimized Responsive Tenant Update Page with Enhanced Mobile Support

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
  Input,
  TextArea,
  Select,
  FormSection,
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
  CheckIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapIcon,
  HomeModernIcon,
  HashtagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function RootTenantUpdatePage() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    alternateName: "",
    description: "",
    schemaName: "",
    addressLocality: "",
    addressRegion: "",
    addressCountry: "",
    email: "",
    telephone: "",
    streetAddress: "",
    streetAddressExtra: "",
    postalCode: "",
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenantDetail = async (tenantId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );

      // Populate form fields
      setFormData({
        name: tenantData.name || "",
        alternateName: tenantData.alternateName || "",
        description: tenantData.description || "",
        schemaName: tenantData.schemaName || "",
        addressCountry: tenantData.addressCountry || "",
        addressRegion: tenantData.addressRegion || "",
        addressLocality: tenantData.addressLocality || "",
        postalCode: tenantData.postalCode || "",
        email: tenantData.email || "",
        telephone: tenantData.telephone || "",
        streetAddress: tenantData.streetAddress || "",
        streetAddressExtra: tenantData.streetAddressExtra || "",
      });

      console.log("RootTenantUpdatePage: Tenant detail loaded for editing:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error(
        "RootTenantUpdatePage: Failed to fetch tenant detail:",
        error,
      );
      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = {
        name: formData.name.trim(),
        alternateName: formData.alternateName.trim(),
        description: formData.description.trim(),
        schemaName: formData.schemaName.trim(),
        addressLocality: formData.addressLocality.trim(),
        addressRegion: formData.addressRegion.trim(),
        addressCountry: formData.addressCountry.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        streetAddress: formData.streetAddress.trim(),
        streetAddressExtra: formData.streetAddressExtra.trim(),
        postalCode: formData.postalCode.trim(),
        state: 1, // Active state
      };

      console.log(
        "RootTenantUpdatePage: Submitting tenant update:",
        tenantData,
      );

      await tenantManager.updateTenant(tid, tenantData, onUnauthorized);

      console.log("RootTenantUpdatePage: Tenant updated successfully");
      navigate(`/root/tenant/${tid}`);
    } catch (error) {
      console.error("RootTenantUpdatePage: Failed to update tenant:", error);
      setErrors({ submit: error.message || "Failed to update tenant" });
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

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Loading size="lg" text="Loading Tenant for Editing..." />
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
      href: `/root/tenant/${tid}`,
      icon: InformationCircleIcon,
    },
    {
      label: "Update",
      icon: PencilSquareIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Optimized for mobile */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-2 sm:gap-4">
            <div className="flex items-center space-x-3">
              <BuildingOffice2Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Update Tenant
                </h1>
                {formData.name && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                    Editing: {formData.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:block mb-4 lg:mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Mobile breadcrumb - Simplified */}
        <div className="sm:hidden mb-4">
          <Link
            to={`/root/tenant/${tid}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Details
          </Link>
        </div>

        <Card className="p-4 sm:p-6 lg:p-8">
          {/* Error Alerts */}
          {errors.fetch && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, fetch: null })}
              className="mb-4"
            >
              {errors.fetch}
            </Alert>
          )}
          {errors.submit && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, submit: null })}
              className="mb-4"
            >
              {errors.submit}
            </Alert>
          )}
          {errors.tenantId && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, tenantId: null })}
              className="mb-4"
            >
              {errors.tenantId}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Identification Section */}
            <div>
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <IdentificationIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Identification
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl">
                <div className="col-span-1 lg:col-span-2">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Enter tenant name"
                    error={errors.name}
                    required
                    disabled={isLoading}
                    icon={BuildingOfficeIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Alternate Name"
                    value={formData.alternateName}
                    onChange={(e) =>
                      handleFieldChange("alternateName", e.target.value)
                    }
                    placeholder="Enter alternate name"
                    error={errors.alternateName}
                    disabled={isLoading}
                    icon={BuildingOfficeIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Schema Name"
                    value={formData.schemaName}
                    onChange={(e) =>
                      handleFieldChange("schemaName", e.target.value)
                    }
                    placeholder="Enter schema name"
                    error={errors.schemaName}
                    disabled={isLoading || formData.schemaName !== ""}
                    icon={HashtagIcon}
                    helperText={
                      formData.schemaName
                        ? "Schema name cannot be changed after creation"
                        : ""
                    }
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 lg:col-span-2">
                  <TextArea
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Enter description (max 500 characters)"
                    rows={4}
                    maxLength={500}
                    error={errors.description}
                    disabled={isLoading}
                    helperText={`${formData.description.length}/500 characters`}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl">
                <div className="col-span-1">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Enter email address"
                    error={errors.email}
                    disabled={isLoading}
                    icon={EnvelopeIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      handleFieldChange("telephone", e.target.value)
                    }
                    placeholder="Enter telephone number"
                    error={errors.telephone}
                    disabled={isLoading}
                    icon={PhoneIcon}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl">
                <div className="col-span-1">
                  <Select
                    label="Country"
                    value={formData.addressCountry}
                    onChange={(e) =>
                      handleFieldChange("addressCountry", e.target.value)
                    }
                    options={[
                      { value: "", label: "Select Country" },
                      { value: "CA", label: "Canada" },
                      { value: "US", label: "United States" },
                      { value: "MX", label: "Mexico" },
                    ]}
                    error={errors.addressCountry}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Province/Territory"
                    value={formData.addressRegion}
                    onChange={(e) =>
                      handleFieldChange("addressRegion", e.target.value)
                    }
                    placeholder="Enter province/state/region"
                    error={errors.addressRegion}
                    disabled={isLoading}
                    icon={MapIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="City"
                    value={formData.addressLocality}
                    onChange={(e) =>
                      handleFieldChange("addressLocality", e.target.value)
                    }
                    placeholder="Enter city"
                    error={errors.addressLocality}
                    disabled={isLoading}
                    icon={BuildingOfficeIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) =>
                      handleFieldChange("postalCode", e.target.value)
                    }
                    placeholder="Enter postal/zip code"
                    error={errors.postalCode}
                    disabled={isLoading}
                    icon={HashtagIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <Input
                    label="Street Address"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      handleFieldChange("streetAddress", e.target.value)
                    }
                    placeholder="Enter street address"
                    error={errors.streetAddress}
                    disabled={isLoading}
                    icon={HomeModernIcon}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <Input
                    label="Address (Extra line)"
                    value={formData.streetAddressExtra}
                    onChange={(e) =>
                      handleFieldChange("streetAddressExtra", e.target.value)
                    }
                    placeholder="Enter additional address info (optional)"
                    error={errors.streetAddressExtra}
                    disabled={isLoading}
                    icon={HomeModernIcon}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - Responsive layout */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              {/* Mobile: Stack buttons, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link to={`/root/tenant/${tid}`} className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    icon={ArrowLeftIcon}
                    type="button"
                    className="w-full sm:w-auto justify-center"
                  >
                    Cancel
                  </Button>
                </Link>

                <Link to={`/root/tenant/${tid}`} className="hidden sm:block">
                  <Button variant="ghost" type="button">
                    View Details
                  </Button>
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
                icon={CheckIcon}
                className="w-full sm:w-auto justify-center"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default RootTenantUpdatePage;
