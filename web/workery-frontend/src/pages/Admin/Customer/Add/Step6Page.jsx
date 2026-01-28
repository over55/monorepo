// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step6Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminCustomerAddStep6Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  UserIcon,
  MapPinIcon,
  ChartPieIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  DataField,
  Alert,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { convertLocalDateToISO } from "../../../../constants/Date";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
} from "../../../../constants/Customer";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Metrics" },
  { title: "Review" },
];

// Options for display
const CLIENT_TYPE_OPTIONS = [
  { value: 1, label: "Unassigned" },
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
];

const GENDER_OPTIONS = [
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
];

// Review Section Component with Edit Link
const ReviewSection = memo(function ReviewSection({
  title,
  icon: Icon,
  children,
  editLink,
  hasError = false,
  themeClasses = {},
}) {
  const sectionHeaderBg = themeClasses.sectionHeaderBg || "bg-gray-700 dark:bg-gray-800";
  const sectionHeaderText = themeClasses.sectionHeaderText || "text-white";
  const linkPrimary = themeClasses.linkPrimary || "text-blue-300 hover:text-blue-200";
  const bgCard = themeClasses.bgCard || "bg-white dark:bg-gray-900";
  const errorRing = themeClasses.errorRing || "ring-red-500 dark:ring-red-400";
  const errorText = themeClasses.errorText || "text-red-300 dark:text-red-400";
  const errorTextHover = themeClasses.errorTextHover || "text-red-300 hover:text-red-200 dark:text-red-400 dark:hover:text-red-300";

  return (
    <div
      className={`${sectionHeaderBg} rounded-lg shadow-sm mb-6 ${hasError ? `ring-2 ${errorRing}` : ""}`}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-base sm:text-lg font-semibold ${sectionHeaderText} flex items-center`}>
            <Icon
              className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${hasError ? errorText : linkPrimary} flex-shrink-0`}
            />
            <span className="truncate">{title}</span>
            {hasError && (
              <ExclamationTriangleIcon className={`w-4 sm:w-5 h-4 sm:h-5 ml-2 ${errorText}`} />
            )}
          </h3>
          {editLink && (
            <Link
              to={editLink}
              className={`inline-flex items-center text-xs sm:text-sm ${hasError ? errorTextHover : linkPrimary}`}
            >
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              {hasError ? "Fix" : "Edit"}
            </Link>
          )}
        </div>
      </div>
      <div className={`${bgCard} border-2 border-t-0 ${sectionHeaderBg} rounded-b-lg p-4 sm:p-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
});

// Memoized content component
const Step6Content = memo(function Step6Content() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoized theme classes for ReviewSection
  const themeClasses = useMemo(() => ({
    bgCard: getThemeClasses('bg-card') || 'bg-white dark:bg-gray-900',
    linkPrimary: getThemeClasses('link-primary') || 'text-blue-300 hover:text-blue-200',
    sectionHeaderBg: getThemeClasses('form-card-header-bg') || 'bg-gray-700 dark:bg-gray-800',
    sectionHeaderText: getThemeClasses('form-card-header-text') || 'text-white',
    errorRing: getThemeClasses('error-ring') || 'ring-red-500 dark:ring-red-400',
    errorText: getThemeClasses('error-text') || 'text-red-300 dark:text-red-400',
    errorTextHover: getThemeClasses('error-text-hover') || 'text-red-300 hover:text-red-200 dark:text-red-400 dark:hover:text-red-300',
  }), [getThemeClasses]);

  // Component states
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadCustomerState();
    window.scrollTo(0, 0);
  }, [authManager, navigate]);

  const loadCustomerState = useCallback(() => {
    try {
      const existing = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
      if (existing) {
        const customerState = JSON.parse(existing);
        setCustomerData(customerState);
      } else {
        navigate("/admin/customers/add/step-1");
      }
    } catch (error) {
      console.error("Error loading customer state:", error);
      navigate("/admin/customers/add/step-1");
    }
  }, [navigate]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Map backend field errors to sections for highlighting
  const getSectionWithError = useCallback((fieldName) => {
    const contactFields = ["email", "firstName", "lastName", "phone", "phoneType", "organizationName", "organizationType"];
    const addressFields = ["addressLine1", "city", "region", "postalCode", "country"];
    const metricsFields = ["tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate"];

    if (contactFields.includes(fieldName)) return "contact";
    if (addressFields.includes(fieldName)) return "address";
    if (metricsFields.includes(fieldName)) return "metrics";

    return null;
  }, []);

  // Check if a section has errors
  const sectionHasErrors = useCallback(
    (section) => {
      const fieldsInSection = {
        contact: ["email", "firstName", "lastName", "phone", "phoneType", "organizationName", "organizationType"],
        address: ["addressLine1", "city", "region", "postalCode", "country"],
        shipping: ["shippingAddressLine1", "shippingCity", "shippingRegion", "shippingPostalCode"],
        metrics: ["tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate"],
      };

      return fieldsInSection[section]?.some((field) => fieldErrors[field]);
    },
    [fieldErrors]
  );

  const processCustomerData = useCallback((data) => {
    const payload = { ...data };

    // Clean up tags
    if (payload.tags && Array.isArray(payload.tags)) {
      payload.tags = payload.tags.filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          tag !== "" &&
          tag !== "0" &&
          tag !== 0 &&
          typeof tag === "string" &&
          tag.length === 24,
      );
      if (payload.tags.length === 0) {
        payload.tags = [];
      }
    } else {
      payload.tags = [];
    }

    // Format join date for API using convertLocalDateToISO to avoid timezone shifts
    if (payload.joinDate) {
      payload.joinDate = convertLocalDateToISO(payload.joinDate);
    }

    // Format birth date if present
    if (payload.birthDate) {
      payload.birthDate = convertLocalDateToISO(payload.birthDate);
    }

    // Convert numeric fields
    if (payload.type !== undefined) {
      payload.type = parseInt(payload.type);
    }
    if (payload.organizationType !== undefined && payload.organizationType !== 0) {
      payload.organizationType = parseInt(payload.organizationType);
    }
    if (payload.phoneType !== undefined) {
      payload.phoneType = parseInt(payload.phoneType);
    }
    if (payload.otherPhoneType !== undefined && payload.otherPhoneType !== 0) {
      payload.otherPhoneType = parseInt(payload.otherPhoneType);
    }
    if (payload.gender !== undefined && payload.gender !== 0) {
      payload.gender = parseInt(payload.gender);
    }
    if (payload.genderOther === undefined) {
      payload.genderOther = "";
    }

    // Keep howDidYouHearAboutUsID as string
    if (payload.howDidYouHearAboutUsID) {
      payload.howDidYouHearAboutUsID = String(payload.howDidYouHearAboutUsID);
    }

    // Remove flags
    if (payload.isHowDidYouHearAboutUsOther === false) {
      delete payload.isHowDidYouHearAboutUsOther;
    }

    // Remove empty/zero values
    if (payload.organizationType === 0) delete payload.organizationType;
    if (payload.otherPhoneType === 0) delete payload.otherPhoneType;

    return payload;
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setErrors({});
    setFieldErrors({});

    try {
      if (!customerData) {
        throw new Error("No customer data found");
      }

      const processedData = processCustomerData(customerData);

      if (import.meta.env.DEV) {
        console.log("Submitting customer data:", processedData);
      }

      const response = await customerManager.createCustomer(processedData, onUnauthorized);

      if (import.meta.env.DEV) {
        console.log("Customer created successfully:", response);
      }

      sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
      navigate(`/admin/customer/${response.id}`, {
        state: { successMessage: "Customer created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create customer:", error);

      let errorDetails = {};
      let generalError = null;

      if (error && typeof error === "object") {
        const knownFields = [
          "email", "firstName", "lastName", "phone", "phoneType",
          "addressLine1", "city", "region", "postalCode", "country",
          "organizationName", "organizationType",
          "tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate",
        ];

        Object.keys(error).forEach((field) => {
          if (knownFields.includes(field)) {
            errorDetails[field] = Array.isArray(error[field])
              ? error[field].join(", ")
              : error[field];
          }
        });

        if (error.message) {
          generalError = error.message;
        } else if (error.detail) {
          generalError = error.detail;
        } else if (error.error) {
          generalError = error.error;
        } else if (Object.keys(errorDetails).length === 0) {
          generalError =
            typeof error === "string"
              ? error
              : "An error occurred while creating the customer. Please review your information and try again.";
        }
      } else if (typeof error === "string") {
        generalError = error;
      } else {
        generalError = "An unexpected error occurred. Please try again.";
      }

      setFieldErrors(errorDetails);

      if (generalError && Object.keys(errorDetails).length === 0) {
        setErrors({ message: generalError });
      } else if (Object.keys(errorDetails).length > 0) {
        const errorSections = new Set();
        Object.keys(errorDetails).forEach((field) => {
          const section = getSectionWithError(field);
          if (section) errorSections.add(section);
        });

        const sectionNames = {
          contact: "Contact Information",
          address: "Address Information",
          metrics: "Metrics Information",
        };

        const sectionsWithErrors = Array.from(errorSections)
          .map((s) => sectionNames[s])
          .filter(Boolean);

        const errorMessage =
          sectionsWithErrors.length > 0
            ? `Please fix the errors in the following sections: ${sectionsWithErrors.join(", ")}`
            : "Please fix the validation errors below";

        setErrors({ message: errorMessage });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  }, [customerData, processCustomerData, customerManager, onUnauthorized, navigate, getSectionWithError]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/customers");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/customers/add/step-5");
  }, [navigate]);

  // Format helpers
  const getTypeLabel = useCallback((type) => {
    const option = CLIENT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.label : "-";
  }, []);

  const getOrganizationTypeLabel = useCallback((type) => {
    const option = CLIENT_ORGANIZATION_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.label : "-";
  }, []);

  const getPhoneTypeLabel = useCallback((phoneType) => {
    const option = CLIENT_PHONE_TYPE_OPTIONS.find((opt) => opt.value === phoneType);
    return option ? option.label : "-";
  }, []);

  const getGenderLabel = useCallback((gender) => {
    const option = GENDER_OPTIONS.find((opt) => opt.value === gender);
    return option ? option.label : "-";
  }, []);

  const parseArrayValue = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value.split(",").map((id) => id.trim()).filter(Boolean);
    }
    return [];
  }, []);

  // Action buttons
  const actions = useMemo(
    () => [
      {
        label: "Cancel",
        variant: "outline",
        onClick: handleCancel,
      },
      {
        label: isLoading ? "Submitting..." : "Submit",
        variant: "success",
        onClick: handleSubmit,
        disabled: isLoading,
        loading: isLoading,
        icon: CheckCircleIcon,
      },
    ],
    [handleCancel, handleSubmit, isLoading]
  );

  if (!customerData) {
    return null;
  }

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={6}
      wizardTitle="Add New Customer"
      wizardIcon={UserPlusIcon}
      stepTitle="Review & Submit"
      stepSubtitle="Review and submit new customer"
      stepIcon={CheckCircleIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isLoading}
      actions={actions}
      onCancel={handleCancel}
      onBack={handleBack}
      actionLayout="end"
    >
      <div className="space-y-6">
        {/* Review Instructions */}
        <Alert type="info" icon={CheckCircleIcon}>
          Please carefully review the following customer details. If everything looks correct,
          click the <strong>Submit</strong> button to create the new customer.
        </Alert>

        {/* Field errors display */}
        {Object.keys(fieldErrors).length > 0 && (
          <Alert type="error">
            <ul className="list-disc list-inside">
              {Object.entries(fieldErrors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Contact Information Section */}
        <ReviewSection
          title="Contact Information"
          icon={UserIcon}
          editLink="/admin/customers/add/step-3"
          hasError={sectionHasErrors("contact")}
          themeClasses={themeClasses}
        >
          <DataField label="Type" value={getTypeLabel(customerData.type)} />

          {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
            <>
              <DataField label="Organization Name" value={customerData.organizationName} />
              <DataField label="Organization Type" value={getOrganizationTypeLabel(customerData.organizationType)} />
            </>
          )}

          <DataField label="First Name" value={customerData.firstName} />
          <DataField label="Last Name" value={customerData.lastName} />
          <DataField label="Email" value={customerData.email || "Not provided"} />
          <DataField
            label="Phone"
            value={`${customerData.phone} (${getPhoneTypeLabel(customerData.phoneType)})`}
          />

          {customerData.phoneType === CLIENT_PHONE_TYPE_WORK && customerData.phoneExtension && (
            <DataField label="Phone Extension" value={customerData.phoneExtension} />
          )}

          <DataField label="OK to Email" value={customerData.isOkToEmail ? "Yes" : "No"} />
          <DataField label="OK to Text" value={customerData.isOkToText ? "Yes" : "No"} />

          {customerData.otherPhone && (
            <>
              <DataField
                label="Other Phone"
                value={`${customerData.otherPhone} (${getPhoneTypeLabel(customerData.otherPhoneType)})`}
              />
              {customerData.otherPhoneType === CLIENT_PHONE_TYPE_WORK && customerData.otherPhoneExtension && (
                <DataField label="Other Phone Extension" value={customerData.otherPhoneExtension} />
              )}
            </>
          )}
        </ReviewSection>

        {/* Address Information Section */}
        <ReviewSection
          title="Address Information"
          icon={MapPinIcon}
          editLink="/admin/customers/add/step-4"
          hasError={sectionHasErrors("address")}
          themeClasses={themeClasses}
        >
          <DataField label="Address" value={customerData.addressLine1} />
          {customerData.addressLine2 && (
            <DataField label="Address Line 2" value={customerData.addressLine2} />
          )}
          <DataField label="City" value={customerData.city} />
          <DataField label="Province/Territory" value={customerData.region} />
          <DataField label="Postal Code" value={customerData.postalCode} />
          <DataField label="Country" value={customerData.country} />
        </ReviewSection>

        {/* Shipping Address Section (if applicable) */}
        {customerData.hasShippingAddress && (
          <ReviewSection
            title="Shipping Address"
            icon={TruckIcon}
            editLink="/admin/customers/add/step-4"
            hasError={sectionHasErrors("shipping")}
            themeClasses={themeClasses}
          >
            <DataField label="Name" value={customerData.shippingName} />
            <DataField label="Phone" value={customerData.shippingPhone} />
            <DataField label="Address" value={customerData.shippingAddressLine1} />
            {customerData.shippingAddressLine2 && (
              <DataField label="Address Line 2" value={customerData.shippingAddressLine2} />
            )}
            <DataField label="City" value={customerData.shippingCity} />
            <DataField label="Province/Territory" value={customerData.shippingRegion} />
            <DataField label="Postal Code" value={customerData.shippingPostalCode} />
            <DataField label="Country" value={customerData.shippingCountry} />
          </ReviewSection>
        )}

        {/* Metrics Information Section */}
        <ReviewSection
          title="Metrics Information"
          icon={ChartPieIcon}
          editLink="/admin/customers/add/step-5"
          hasError={sectionHasErrors("metrics")}
          themeClasses={themeClasses}
        >
          {customerData.tags && customerData.tags.length > 0 && (
            <div className="lg:col-span-2 mb-2">
              <TagsDisplay
                values={parseArrayValue(customerData.tags)}
                label="Tags"
                variant="success"
                onUnauthorized={onUnauthorized}
              />
            </div>
          )}

          {customerData.howDidYouHearAboutUsID && (
            <div className="lg:col-span-2">
              <HowHearAboutUsDisplay
                value={customerData.howDidYouHearAboutUsID}
                label="How did you hear about us?"
                onUnauthorized={onUnauthorized}
              />
            </div>
          )}

          {customerData.howDidYouHearAboutUsOther && (
            <DataField
              label="How did you hear about us? (Other)"
              value={customerData.howDidYouHearAboutUsOther}
              fullWidth
            />
          )}

          <DataField label="Gender" value={getGenderLabel(customerData.gender)} />

          {customerData.gender === 1 && customerData.genderOther && (
            <DataField label="Gender (Other)" value={customerData.genderOther} />
          )}

          {customerData.birthDate && (
            <DataField label="Birth Date" value={customerData.birthDate} />
          )}

          <DataField label="Join Date" value={customerData.joinDate} />
          <DataField label="Preferred Language" value={customerData.preferredLanguage} />

          {customerData.additionalComment && (
            <DataField
              label="Additional Comments"
              value={customerData.additionalComment}
              fullWidth
            />
          )}
        </ReviewSection>
      </div>
    </WizardFormStep>
  );
});

Step6Content.displayName = "Step6Content";

function AdminCustomerAddStep6Page() {
  return (
    <UIXThemeProvider>
      <Step6Content />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep6Page;
