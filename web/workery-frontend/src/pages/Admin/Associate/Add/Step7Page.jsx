// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step7Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep7Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  CheckCircleIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  HomeIcon,
  TruckIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
  ServiceFeeDisplay,
  InsuranceRequirementsDisplay,
} from "../../../../components/business/displays";
import {
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_GENDER_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_EDUCATION_OTHER,
} from "../../../../constants/Associate";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

// Helper component for data fields
const DataField = memo(({ label, value, error }) => (
  <div>
    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
      {label}
    </span>
    <p className="text-sm sm:text-base text-gray-900">{value || "—"}</p>
    {error && (
      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
        {error}
      </p>
    )}
  </div>
));

DataField.displayName = 'DataField';

// Review section header with edit button
const ReviewSectionHeader = memo(({ title, icon: Icon, onEdit, hasError = false }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className={`text-base sm:text-lg font-semibold flex items-center ${hasError ? 'text-red-700' : 'text-gray-900'}`}>
      <Icon className={`w-5 h-5 mr-2 ${hasError ? 'text-red-500' : 'text-blue-600'}`} />
      {title}
      {hasError && <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-red-500" />}
    </h3>
    {onEdit && (
      <button
        onClick={onEdit}
        className={`inline-flex items-center text-xs sm:text-sm transition-colors ${hasError ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
      >
        <PencilSquareIcon className="w-4 h-4 mr-1" />
        {hasError ? "Fix" : "Edit"}
      </button>
    )}
  </div>
));

ReviewSectionHeader.displayName = 'ReviewSectionHeader';

// Memoized content component
const Step7Content = memo(function Step7Content() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [associateData, setAssociateData] = useState(null);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    if (saved) {
      setAssociateData(JSON.parse(saved));
    } else {
      navigate("/admin/associates/add/step-1-search");
    }
    window.scrollTo(0, 0);
  }, [authManager, navigate]);

  // Map backend field errors to sections
  const sectionHasErrors = useCallback((section) => {
    const sectionFields = {
      contact: ["email", "firstName", "lastName", "phone", "phoneType", "organizationName", "organizationType"],
      address: ["addressLine1", "city", "region", "postalCode", "country"],
      shipping: ["shippingAddressLine1", "shippingCity", "shippingRegion", "shippingPostalCode", "shippingCountry", "shippingName", "shippingPhone"],
      account: ["skillSets", "insuranceRequirements", "vehicleTypes", "serviceFeeId", "hourlySalaryDesired", "duesDate", "policeCheck", "commercialInsuranceExpiryDate", "preferredLanguage"],
      metrics: ["tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate", "isJobSeeker", "statusInCountry", "maritalStatus", "accomplishedEducation"],
    };
    return sectionFields[section]?.some((field) => fieldErrors[field]);
  }, [fieldErrors]);

  // Process data for API submission
  const processAssociateData = useCallback((data) => {
    const processed = { ...data };

    // Handle date conversions
    const dateFields = ["duesDate", "policeCheck", "birthDate", "joinDate", "commercialInsuranceExpiryDate", "autoInsuranceExpiryDate", "wsibInsuranceDate", "dateOfEntryIntoCountry"];
    dateFields.forEach((field) => {
      if (processed[field] && !processed[field].includes("T")) {
        processed[field] = new Date(processed[field]).toISOString();
      }
    });

    // Convert string arrays to proper arrays
    ["skillSets", "insuranceRequirements", "vehicleTypes", "tags"].forEach((field) => {
      if (typeof processed[field] === "string") {
        processed[field] = processed[field].split(",").map((id) => id.trim()).filter(Boolean);
      }
    });

    // Handle identifyAs array
    if (typeof processed.identifyAs === "string") {
      processed.identifyAs = processed.identifyAs.split(",").map((id) => parseInt(id.trim())).filter(Boolean);
    } else if (Array.isArray(processed.identifyAs)) {
      processed.identifyAs = processed.identifyAs.map((id) => typeof id === "string" ? parseInt(id) : id);
    }

    // Convert numeric fields
    const numericFields = ["hourlySalaryDesired", "statusInCountry", "maritalStatus", "accomplishedEducation", "gender", "type", "organizationType", "phoneType", "otherPhoneType", "isJobSeeker"];
    numericFields.forEach((field) => {
      if (processed[field] !== undefined && processed[field] !== "" && processed[field] !== 0) {
        processed[field] = parseInt(processed[field]);
      }
    });

    // Handle conditional "other" fields
    if (processed.gender !== ASSOCIATE_GENDER_OTHER) delete processed.genderOther;
    if (processed.statusInCountry !== ASSOCIATE_STATUS_IN_COUNTRY_OTHER) delete processed.statusInCountryOther;
    if (processed.maritalStatus !== ASSOCIATE_MARITAL_STATUS_OTHER) delete processed.maritalStatusOther;
    if (processed.accomplishedEducation !== ASSOCIATE_EDUCATION_OTHER) delete processed.accomplishedEducationOther;
    if (!processed.isHowDidYouHearAboutUsOther) {
      delete processed.howDidYouHearAboutUsOther;
      delete processed.isHowDidYouHearAboutUsOther;
    }

    // Remove empty/zero values for optional fields
    ["statusInCountry", "maritalStatus", "accomplishedEducation", "otherPhoneType", "organizationType"].forEach((field) => {
      if (processed[field] === 0) delete processed[field];
    });

    // Remove empty string fields
    Object.keys(processed).forEach((key) => {
      if (processed[key] === "" || processed[key] === null || processed[key] === undefined) {
        delete processed[key];
      }
    });

    return processed;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setErrors({});
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (!associateData) {
        throw new Error("No associate data found");
      }

      const processedData = processAssociateData(associateData);
      const response = await associateManager.createAssociate(
        processedData,
        () => navigate("/login?unauthorized=true")
      );

      sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
      navigate(`/admin/associate/${response.id}`, {
        state: { successMessage: "Associate created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create associate:", error);

      let errorDetails = {};
      let generalError = null;

      if (error && typeof error === "object") {
        const knownFields = [
          "email", "firstName", "lastName", "phone", "phoneType", "addressLine1", "city", "region", "postalCode", "country",
          "shippingAddressLine1", "shippingCity", "shippingRegion", "shippingPostalCode", "shippingCountry", "shippingName", "shippingPhone",
          "skillSets", "insuranceRequirements", "vehicleTypes", "serviceFeeId", "hourlySalaryDesired", "duesDate", "policeCheck",
          "commercialInsuranceExpiryDate", "preferredLanguage", "tags", "howDidYouHearAboutUsID", "gender", "birthDate", "joinDate",
          "isJobSeeker", "organizationName", "organizationType",
        ];

        Object.keys(error).forEach((field) => {
          if (knownFields.includes(field)) {
            errorDetails[field] = Array.isArray(error[field]) ? error[field].join(", ") : error[field];
          }
        });

        generalError = error.message || error.detail || error.error;
        if (!generalError && Object.keys(errorDetails).length === 0) {
          generalError = typeof error === "string" ? error : "An error occurred while creating the associate. Please review your information and try again.";
        }
      } else {
        generalError = typeof error === "string" ? error : "An unexpected error occurred. Please try again.";
      }

      setFieldErrors(errorDetails);

      if (generalError && Object.keys(errorDetails).length === 0) {
        setErrors({ general: generalError });
      } else if (Object.keys(errorDetails).length > 0) {
        setErrors({ general: "Please fix the validation errors highlighted below" });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  }, [associateData, associateManager, navigate, processAssociateData]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-6");
  }, [navigate]);

  // Helper functions
  const getTypeLabel = useCallback((type) => {
    switch (type) {
      case 2: return "Residential";
      case 3: return "Commercial";
      default: return "Unknown";
    }
  }, []);

  const getPhoneTypeLabel = useCallback((phoneType) => {
    switch (phoneType) {
      case 1: return "Mobile";
      case 2: return "Work";
      case 3: return "Home";
      default: return "Unknown";
    }
  }, []);

  const getGenderLabel = useCallback((gender) => {
    switch (gender) {
      case 1: return "Other";
      case 2: return "Male";
      case 3: return "Female";
      default: return "Unknown";
    }
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
  const actions = useMemo(() => [
    {
      label: isLoading ? "Submitting..." : "Submit Associate",
      variant: "success",
      onClick: handleSubmit,
      disabled: isLoading,
      loading: isLoading,
      icon: CheckCircleIcon,
    },
  ], [handleSubmit, isLoading]);

  if (!associateData) {
    return (
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={7}
        wizardTitle="Add New Associate"
        wizardIcon={UserPlusIcon}
        stepTitle="Review & Submit"
        stepSubtitle="Loading..."
        stepIcon={CheckCircleIcon}
        isLoading={true}
      />
    );
  }

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={7}
      wizardTitle="Add New Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Review & Submit"
      stepSubtitle="Review and submit the new associate information"
      stepIcon={CheckCircleIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      fieldErrors={fieldErrors}
      isLoading={isLoading}
      actions={actions}
      onBack={handleBack}
      actionLayout="end"
    >
      <div className="space-y-6">
        {/* Review Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-2">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
            Review and Submit
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Please carefully review the following associate details. If everything looks correct, click the <strong>Submit</strong> button to create the new associate.
          </p>
        </div>

        {/* Contact Information */}
        <FormCard
          title="Contact Information"
          subtitle="Basic contact details and preferences"
          icon={UserIcon}
          maxWidth="7xl"
          headerAction={
            <button
              onClick={() => navigate("/admin/associates/add/step-3")}
              className={`inline-flex items-center text-xs sm:text-sm transition-colors ${sectionHasErrors("contact") ? 'text-red-300 hover:text-red-200' : 'text-blue-300 hover:text-blue-200'}`}
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              {sectionHasErrors("contact") ? "Fix" : "Edit"}
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <DataField label="Type" value={getTypeLabel(associateData.type)} />

            {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
              <>
                <DataField label="Organization Name" value={associateData.organizationName} error={fieldErrors.organizationName} />
                <DataField label="Organization Type" value={associateData.organizationType} error={fieldErrors.organizationType} />
              </>
            )}

            <DataField label="First Name" value={associateData.firstName} error={fieldErrors.firstName} />
            <DataField label="Last Name" value={associateData.lastName} error={fieldErrors.lastName} />
            <DataField label="Email" value={associateData.email} error={fieldErrors.email} />
            <DataField
              label="Phone"
              value={`${associateData.phone} (${getPhoneTypeLabel(associateData.phoneType)})`}
              error={fieldErrors.phone || fieldErrors.phoneType}
            />

            {associateData.phoneType === ASSOCIATE_PHONE_TYPE_WORK && associateData.phoneExtension && (
              <DataField label="Phone Extension" value={associateData.phoneExtension} />
            )}

            <DataField label="OK to Email" value={associateData.isOkToEmail ? "Yes" : "No"} />
            <DataField label="OK to Text" value={associateData.isOkToText ? "Yes" : "No"} />

            {associateData.otherPhone && (
              <DataField
                label="Other Phone"
                value={`${associateData.otherPhone} (${getPhoneTypeLabel(associateData.otherPhoneType)})`}
              />
            )}
          </div>
        </FormCard>

        {/* Address Information */}
        <FormCard
          title={associateData.hasShippingAddress ? "Billing Address" : "Address Information"}
          subtitle={associateData.hasShippingAddress ? "Primary billing address" : "Primary address for the associate"}
          icon={associateData.hasShippingAddress ? HomeIcon : MapPinIcon}
          maxWidth="7xl"
          headerAction={
            <button
              onClick={() => navigate("/admin/associates/add/step-4")}
              className={`inline-flex items-center text-xs sm:text-sm transition-colors ${sectionHasErrors("address") ? 'text-red-300 hover:text-red-200' : 'text-blue-300 hover:text-blue-200'}`}
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              {sectionHasErrors("address") ? "Fix" : "Edit"}
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <DataField label="Address" value={associateData.addressLine1} error={fieldErrors.addressLine1} />
            {associateData.addressLine2 && <DataField label="Address Line 2" value={associateData.addressLine2} />}
            <DataField label="City" value={associateData.city} error={fieldErrors.city} />
            <DataField label="Province/Territory" value={associateData.region} error={fieldErrors.region} />
            <DataField label="Postal Code" value={associateData.postalCode} error={fieldErrors.postalCode} />
            <DataField label="Country" value={associateData.country} error={fieldErrors.country} />
          </div>
        </FormCard>

        {/* Shipping Address (if applicable) */}
        {associateData.hasShippingAddress && (
          <FormCard
            title="Shipping Address"
            subtitle="Where materials and packages should be delivered"
            icon={TruckIcon}
            maxWidth="7xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DataField label="Contact Name" value={associateData.shippingName} error={fieldErrors.shippingName} />
              <DataField label="Phone" value={associateData.shippingPhone} error={fieldErrors.shippingPhone} />
              <DataField label="Address" value={associateData.shippingAddressLine1} error={fieldErrors.shippingAddressLine1} />
              {associateData.shippingAddressLine2 && <DataField label="Address Line 2" value={associateData.shippingAddressLine2} />}
              <DataField label="City" value={associateData.shippingCity} error={fieldErrors.shippingCity} />
              <DataField label="Province/Territory" value={associateData.shippingRegion} error={fieldErrors.shippingRegion} />
              <DataField label="Postal Code" value={associateData.shippingPostalCode} error={fieldErrors.shippingPostalCode} />
              <DataField label="Country" value={associateData.shippingCountry} error={fieldErrors.shippingCountry} />
            </div>
          </FormCard>
        )}

        {/* Account Information */}
        <FormCard
          title="Account Information"
          subtitle="Skills, insurance, and service details"
          icon={ClipboardDocumentIcon}
          maxWidth="7xl"
          headerAction={
            <button
              onClick={() => navigate("/admin/associates/add/step-5")}
              className={`inline-flex items-center text-xs sm:text-sm transition-colors ${sectionHasErrors("account") ? 'text-red-300 hover:text-red-200' : 'text-blue-300 hover:text-blue-200'}`}
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              {sectionHasErrors("account") ? "Fix" : "Edit"}
            </button>
          }
        >
          <div className="space-y-4">
            {associateData.skillSets && (
              <div>
                <SkillSetsDisplay values={parseArrayValue(associateData.skillSets)} label="Skill Sets" variant="primary" />
                {fieldErrors.skillSets && <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.skillSets}</p>}
              </div>
            )}

            {associateData.insuranceRequirements && (
              <div>
                <InsuranceRequirementsDisplay values={parseArrayValue(associateData.insuranceRequirements)} label="Insurance Requirements" variant="info" />
                {fieldErrors.insuranceRequirements && <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.insuranceRequirements}</p>}
              </div>
            )}

            {associateData.vehicleTypes && associateData.vehicleTypes.length > 0 && (
              <div>
                <VehicleTypesDisplay values={parseArrayValue(associateData.vehicleTypes)} label="Vehicle Types" variant="warning" />
                {fieldErrors.vehicleTypes && <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.vehicleTypes}</p>}
              </div>
            )}

            {associateData.serviceFeeId && (
              <div>
                <ServiceFeeDisplay value={associateData.serviceFeeId} label="Service Fee" showAmount={true} />
                {fieldErrors.serviceFeeId && <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.serviceFeeId}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {associateData.hourlySalaryDesired && (
                <DataField label="Hourly Rate" value={`$${associateData.hourlySalaryDesired}/hr`} error={fieldErrors.hourlySalaryDesired} />
              )}
              <DataField label="Member Dues Date" value={associateData.duesDate} error={fieldErrors.duesDate} />
              <DataField label="Police Check Expiry" value={associateData.policeCheck} error={fieldErrors.policeCheck} />
              <DataField label="Commercial Insurance Expiry" value={associateData.commercialInsuranceExpiryDate} error={fieldErrors.commercialInsuranceExpiryDate} />
              <DataField label="Preferred Language" value={associateData.preferredLanguage} error={fieldErrors.preferredLanguage} />
            </div>

            {associateData.emergencyContactName && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm sm:text-base font-semibold text-gray-700 mb-3">Emergency Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <DataField label="Name" value={associateData.emergencyContactName} />
                  <DataField label="Relationship" value={associateData.emergencyContactRelationship} />
                  <DataField label="Phone" value={associateData.emergencyContactTelephone} />
                  {associateData.emergencyContactAlternativeTelephone && (
                    <DataField label="Alternative Phone" value={associateData.emergencyContactAlternativeTelephone} />
                  )}
                </div>
              </div>
            )}
          </div>
        </FormCard>

        {/* Metrics Information */}
        <FormCard
          title="Metrics Information"
          subtitle="Demographics and performance metrics"
          icon={ChartBarSquareIcon}
          maxWidth="7xl"
          headerAction={
            <button
              onClick={() => navigate("/admin/associates/add/step-6")}
              className={`inline-flex items-center text-xs sm:text-sm transition-colors ${sectionHasErrors("metrics") ? 'text-red-300 hover:text-red-200' : 'text-blue-300 hover:text-blue-200'}`}
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              {sectionHasErrors("metrics") ? "Fix" : "Edit"}
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DataField
                label="Is Job Seeker"
                value={associateData.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES ? "Yes" : "No"}
                error={fieldErrors.isJobSeeker}
              />

              {associateData.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                <>
                  {associateData.statusInCountry && (
                    <DataField label="Status in Country" value={associateData.statusInCountry} error={fieldErrors.statusInCountry} />
                  )}
                  {associateData.maritalStatus && (
                    <DataField label="Marital Status" value={associateData.maritalStatus} error={fieldErrors.maritalStatus} />
                  )}
                  {associateData.accomplishedEducation && (
                    <DataField label="Education Level" value={associateData.accomplishedEducation} error={fieldErrors.accomplishedEducation} />
                  )}
                </>
              )}

              <DataField label="Gender" value={getGenderLabel(associateData.gender)} error={fieldErrors.gender} />
              {associateData.gender === 1 && <DataField label="Gender (Other)" value={associateData.genderOther} />}
              <DataField label="Birth Date" value={associateData.birthDate} error={fieldErrors.birthDate} />
              <DataField label="Join Date" value={associateData.joinDate} error={fieldErrors.joinDate} />
            </div>

            {associateData.howDidYouHearAboutUsID && (
              <div className="mt-4">
                <HowHearAboutUsDisplay value={associateData.howDidYouHearAboutUsID} label="How did you hear about us?" />
                {fieldErrors.howDidYouHearAboutUsID && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.howDidYouHearAboutUsID}</p>
                )}
              </div>
            )}

            {associateData.tags && associateData.tags.length > 0 && (
              <div className="mt-4">
                <TagsDisplay values={parseArrayValue(associateData.tags)} label="Tags" variant="success" />
                {fieldErrors.tags && <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">{fieldErrors.tags}</p>}
              </div>
            )}

            {associateData.additionalComment && (
              <div className="mt-4">
                <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Additional Comments</span>
                <p className="text-sm sm:text-base text-gray-900">{associateData.additionalComment}</p>
              </div>
            )}
          </div>
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step7Content.displayName = 'Step7Content';

function AdminAssociateAddStep7Page() {
  return (
    <UIXThemeProvider>
      <Step7Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep7Page;
