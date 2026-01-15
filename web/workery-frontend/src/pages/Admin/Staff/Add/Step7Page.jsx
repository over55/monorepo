// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step7Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep7Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useStaffManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  InfoCard,
  DataField,
  Alert,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import {
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import {
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";

// Wizard configuration (static, moved outside component)
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
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
  // Theme-aware default classes
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
const Step7Content = memo(function Step7Content() {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();
  const wizardStorage = useStaffAddWizardStorage();
  const staffManager = useStaffManager();

  const wizardState = useMemo(() => {
    const state = wizardStorage.getWizardState();
    return state;
  }, [wizardStorage]);

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

  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If no wizard state exists, redirect back to step 1
    if (!wizardState || Object.keys(wizardState).length === 0) {
      navigate("/admin/staff/add/step-1-search");
    }
  }, [wizardState, navigate]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Map backend field errors to sections for highlighting
  const getSectionWithError = useCallback((fieldName) => {
    const contactFields = ["email", "firstName", "lastName", "phone", "phoneType"];
    const addressFields = ["addressLine1", "city", "region", "postalCode", "country"];
    const accountFields = ["password", "passwordRepeated", "preferredLanguage", "vehicleTypes"];
    const metricsFields = ["tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate"];

    if (contactFields.includes(fieldName)) return "contact";
    if (addressFields.includes(fieldName)) return "address";
    if (accountFields.includes(fieldName)) return "account";
    if (metricsFields.includes(fieldName)) return "metrics";

    return null;
  }, []);

  // Check if a section has errors
  const sectionHasErrors = useCallback(
    (section) => {
      const fieldsInSection = {
        contact: ["email", "firstName", "lastName", "phone", "phoneType"],
        address: ["addressLine1", "city", "region", "postalCode", "country"],
        shipping: ["shippingAddressLine1", "shippingCity", "shippingRegion", "shippingPostalCode"],
        account: ["password", "passwordRepeated", "preferredLanguage", "vehicleTypes"],
        metrics: ["tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate"],
      };

      return fieldsInSection[section]?.some((field) => fieldErrors[field]);
    },
    [fieldErrors]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    setFieldErrors({});

    try {
      const payload = { ...wizardState };
      const response = await staffManager.createStaff(payload, onUnauthorized);

      wizardStorage.clearWizardState();
      navigate(`/admin/staff/${response.id}`, {
        state: { successMessage: "Staff member created successfully!" },
      });
    } catch (error) {
      console.error("Error creating staff:", error);

      let errorDetails = {};
      let generalError = null;

      if (error && typeof error === "object") {
        const knownFields = [
          "email", "firstName", "lastName", "phone", "phoneType",
          "addressLine1", "city", "region", "postalCode", "country",
          "password", "passwordRepeated", "preferredLanguage", "vehicleTypes",
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
              : "An error occurred while creating the staff member. Please review your information and try again.";
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
          account: "Account Information",
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
      setIsSubmitting(false);
    }
  }, [wizardState, staffManager, onUnauthorized, navigate, wizardStorage, getSectionWithError]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-6");
  }, [navigate]);

  // Format helpers
  const formatPhoneType = useCallback((typeValue) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === typeValue
    );
    return option ? option.label : "-";
  }, []);

  const formatGender = useCallback((genderValue) => {
    const option = GENDER_OPTIONS_WITH_EMPTY_OPTION.find(
      (opt) => opt.value === genderValue
    );
    return option ? option.label : "-";
  }, []);

  const formatIdentifyAs = useCallback((values) => {
    if (!values || values.length === 0) return "-";
    return values
      .map((val) => {
        const option = IDENTIFY_AS_OPTIONS.find((opt) => opt.value === val);
        return option ? option.label : val;
      })
      .join(", ");
  }, []);

  const formatStaffType = useCallback((typeValue) => {
    const option = STAFF_TYPE_FILTER_OPTIONS.find(
      (opt) => opt.value === typeValue
    );
    return option ? option.label : "-";
  }, []);

  const parseArrayValue = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
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
        label: isSubmitting ? "Submitting..." : "Submit",
        variant: "success",
        onClick: handleSubmit,
        disabled: isSubmitting,
        loading: isSubmitting,
        icon: CheckCircleIcon,
      },
    ],
    [handleCancel, handleSubmit, isSubmitting]
  );

  if (!wizardState) {
    return null;
  }

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={7}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Review & Submit"
      stepSubtitle="Review and submit new staff member"
      stepIcon={CheckCircleIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isSubmitting}
      actions={actions}
      onCancel={handleCancel}
      onBack={handleBack}
      actionLayout="end"
    >
      <div className="space-y-6">
        {/* Review Instructions */}
        <Alert type="info" icon={CheckCircleIcon}>
          Please carefully review the following staff details. If everything looks correct,
          click the <strong>Submit</strong> button to create the new staff member.
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
          editLink="/admin/staff/add/step-3"
          hasError={sectionHasErrors("contact")}
          themeClasses={themeClasses}
        >
          <DataField label="Type" value={formatStaffType(wizardState.type)} />
          <DataField label="First Name" value={wizardState.firstName} />
          <DataField label="Last Name" value={wizardState.lastName} />
          <DataField label="Email" value={wizardState.email} />
          <DataField
            label="Phone"
            value={`${wizardState.phone} (${formatPhoneType(wizardState.phoneType)})`}
            themeClasses={themeClasses}
          />
          <DataField label="OK to Email" value={wizardState.isOkToEmail ? "Yes" : "No"} />
          <DataField label="OK to Text" value={wizardState.isOkToText ? "Yes" : "No"} />
          {wizardState.otherPhone && (
            <DataField
              label="Other Phone"
              value={`${wizardState.otherPhone} (${formatPhoneType(wizardState.otherPhoneType)})`}
              themeClasses={themeClasses}
            />
          )}
        </ReviewSection>

        {/* Address Information Section */}
        <ReviewSection
          title="Address Information"
          icon={MapPinIcon}
          editLink="/admin/staff/add/step-4"
          hasError={sectionHasErrors("address")}
          themeClasses={themeClasses}
        >
          <DataField label="Address" value={wizardState.addressLine1} />
          {wizardState.addressLine2 && (
            <DataField label="Address Line 2" value={wizardState.addressLine2} />
          )}
          <DataField label="City" value={wizardState.city} />
          <DataField label="Province/Territory" value={wizardState.region} />
          <DataField label="Postal Code" value={wizardState.postalCode} />
          <DataField label="Country" value={wizardState.country} />
        </ReviewSection>

        {/* Shipping Address Section (if applicable) */}
        {wizardState.hasShippingAddress && (
          <ReviewSection
            title="Shipping Address"
            icon={TruckIcon}
            editLink="/admin/staff/add/step-4"
            hasError={sectionHasErrors("shipping")}
            themeClasses={themeClasses}
          >
            <DataField label="Name" value={wizardState.shippingName} />
            <DataField label="Phone" value={wizardState.shippingPhone} />
            <DataField label="Address" value={wizardState.shippingAddressLine1} />
            {wizardState.shippingAddressLine2 && (
              <DataField label="Address Line 2" value={wizardState.shippingAddressLine2} />
            )}
            <DataField label="City" value={wizardState.shippingCity} />
            <DataField label="Province/Territory" value={wizardState.shippingRegion} />
            <DataField label="Postal Code" value={wizardState.shippingPostalCode} />
            <DataField label="Country" value={wizardState.shippingCountry} />
          </ReviewSection>
        )}

        {/* Account Information Section */}
        <ReviewSection
          title="Account Information"
          icon={ClipboardDocumentIcon}
          editLink="/admin/staff/add/step-5"
          hasError={sectionHasErrors("account")}
          themeClasses={themeClasses}
        >
          {wizardState.vehicleTypes && wizardState.vehicleTypes.length > 0 && (
            <div className="lg:col-span-2 mb-2">
              <VehicleTypesDisplay
                values={parseArrayValue(wizardState.vehicleTypes)}
                label="Vehicle Types"
                variant="warning"
                onUnauthorized={onUnauthorized}
              />
            </div>
          )}
          {wizardState.limitSpecial && (
            <DataField
              label="Limitations/Special Considerations"
              value={wizardState.limitSpecial}
              fullWidth
              themeClasses={themeClasses}
            />
          )}
          {wizardState.policeCheck && (
            <DataField label="Police Check Expiry" value={wizardState.policeCheck} />
          )}
          {wizardState.driversLicenseClass && (
            <DataField label="Drivers License Class" value={wizardState.driversLicenseClass} />
          )}
          <DataField label="Preferred Language" value={wizardState.preferredLanguage} />
          {wizardState.emergencyContactName && (
            <>
              <DataField
                label="Emergency Contact"
                value={`${wizardState.emergencyContactName} (${wizardState.emergencyContactRelationship})`}
                fullWidth
                themeClasses={themeClasses}
              />
              <DataField label="Emergency Phone" value={wizardState.emergencyContactTelephone} />
              {wizardState.emergencyContactAlternativeTelephone && (
                <DataField
                  label="Emergency Alt Phone"
                  value={wizardState.emergencyContactAlternativeTelephone}
                  themeClasses={themeClasses}
                />
              )}
            </>
          )}
          {wizardState.description && (
            <DataField label="Description" value={wizardState.description} fullWidth />
          )}
        </ReviewSection>

        {/* Metrics Information Section */}
        <ReviewSection
          title="Metrics Information"
          icon={ChartBarSquareIcon}
          editLink="/admin/staff/add/step-6"
          hasError={sectionHasErrors("metrics")}
          themeClasses={themeClasses}
        >
          {wizardState.identifyAs && wizardState.identifyAs.length > 0 && (
            <DataField
              label="Identifies As"
              value={formatIdentifyAs(wizardState.identifyAs)}
              fullWidth
              themeClasses={themeClasses}
            />
          )}
          <DataField label="Gender" value={formatGender(wizardState.gender)} />
          {wizardState.gender === STAFF_GENDER_OTHER && wizardState.genderOther && (
            <DataField label="Gender (Other)" value={wizardState.genderOther} />
          )}
          {wizardState.birthDate && (
            <DataField label="Birth Date" value={wizardState.birthDate} />
          )}
          {wizardState.joinDate && <DataField label="Join Date" value={wizardState.joinDate} />}
          {wizardState.howDidYouHearAboutUsID && (
            <div className="lg:col-span-2">
              <HowHearAboutUsDisplay
                value={wizardState.howDidYouHearAboutUsID}
                label="How did you hear about us?"
                onUnauthorized={onUnauthorized}
              />
            </div>
          )}
          {wizardState.howDidYouHearAboutUsOther && (
            <DataField
              label="How did you hear about us (Other)"
              value={wizardState.howDidYouHearAboutUsOther}
              fullWidth
              themeClasses={themeClasses}
            />
          )}
          {wizardState.tags && wizardState.tags.length > 0 && (
            <div className="lg:col-span-2">
              <TagsDisplay
                values={parseArrayValue(wizardState.tags)}
                label="Tags"
                variant="success"
                onUnauthorized={onUnauthorized}
              />
            </div>
          )}
          {wizardState.additionalComment && (
            <DataField
              label="Additional Comments"
              value={wizardState.additionalComment}
              fullWidth
              themeClasses={themeClasses}
            />
          )}
        </ReviewSection>
      </div>
    </WizardFormStep>
  );
});

Step7Content.displayName = "Step7Content";

function AdminStaffAddStep7Page() {
  return (
    <UIXThemeProvider>
      <Step7Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep7Page;
