// File Path: web/workery-frontend/src/pages/Root/Tenant/Update/Page.jsx
// Modernized Tenant Update Page with Tailwind and Heroicons

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Update Tenant
                </h1>
                {formData.name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Editing: {formData.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Card>
          {/* Error Alerts */}
          {errors.fetch && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, fetch: null })}
            >
              {errors.fetch}
            </Alert>
          )}
          {errors.submit && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, submit: null })}
            >
              {errors.submit}
            </Alert>
          )}
          {errors.tenantId && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, tenantId: null })}
            >
              {errors.tenantId}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identification Section */}
            <div>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <IdentificationIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Identification
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="md:col-span-2">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Enter tenant name"
                    error={errors.name}
                    required
                    disabled={isLoading}
                    icon={BuildingOfficeIcon}
                  />
                </div>

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
                />

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
                />

                <div className="md:col-span-2">
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
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                  disabled={isLoading}
                  icon={EnvelopeIcon}
                />

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
                />
              </div>
            </div>

            {/* Address Section */}
            <div>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
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
                />

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
                />

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
                />

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
                />

                <div className="md:col-span-2">
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
                  />
                </div>

                <div className="md:col-span-2">
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
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link to={`/root/tenant/${tid}`}>
                <Button variant="secondary" icon={ArrowLeftIcon} type="button">
                  Cancel
                </Button>
              </Link>

              <div className="flex gap-3">
                <Link to={`/root/tenant/${tid}`}>
                  <Button variant="ghost" type="button">
                    View Details
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={CheckIcon}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default RootTenantUpdatePage;
