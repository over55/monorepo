// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/FullPage.jsx
// @uix-page: DetailFullView

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
  ServiceFeeDisplay,
  InsuranceRequirementsDisplay,
} from "../../../../components/business/displays";
import {
  DetailSection,
  DetailField,
} from "../../../../components/business/views";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../services/Helpers/DateFormatter";
import {
  UIXThemeProvider,
  DetailFullView,
  EditButton,
} from "../../../../components/UIX";
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  ASSOCIATE_PHONE_TYPE_WORK,
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_IS_JOB_SEEKER_NO,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_EDUCATION_OTHER,
  ASSOCIATE_STATUS_ARCHIVED,
  ASSOCIATE_TYPE_MAP,
  ASSOCIATE_ORGANIZATION_TYPE_MAP,
  ASSOCIATE_GENDER_MAP,
  ASSOCIATE_PHONE_TYPE_MAP,
  ASSOCIATE_STATUS_IN_COUNTRY_MAP,
  ASSOCIATE_MARITAL_STATUS_MAP,
  ASSOCIATE_EDUCATION_MAP,
  ASSOCIATE_IDENTIFY_AS_MAP,
} from "../../../../constants/Associate";

// Extract IDs helper - moved outside component for performance
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.id || item.value).filter(Boolean);
};

const AdminAssociateDetailFullPageContent = memo(function AdminAssociateDetailFullPageContent() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup - prevents state updates on unmounted component
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate data with proper cleanup
  const fetchAssociate = useCallback(() => {
    if (!aid) {
      if (import.meta.env.DEV) {
        console.log("No aid provided, returning");
      }
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    if (import.meta.env.DEV) {
      console.log("Starting fetch for aid:", aid);
    }
    setLoading(true);
    setError(null);

    associateManager.getAssociateDetailWithCallbacks(
      aid,
      (response) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting associate data:", response);
        }
        setAssociate(response);
        setLoading(false);
      },
      (errorResponse) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.error("Setting error:", errorResponse);
        }
        setError(
          errorResponse?.message ||
            "Failed to load associate details. Please try again.",
        );
        setLoading(false);
      },
      () => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting loading to false");
        }
        setLoading(false);
      },
      onUnauthorized,
    );
  }, [aid, associateManager, onUnauthorized]);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (import.meta.env.DEV) {
      console.log("Effect running for aid:", aid);
    }
    window.scrollTo(0, 0);
    fetchAssociate();

    // Cleanup function - only cancel requests, don't set state
    return () => {
      isMounted.current = false;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Note: Don't set state here - component is unmounting
      // The isMounted check in callbacks prevents state updates
    };
  }, [aid, fetchAssociate]);

  // Helper functions
  const formatPhone = useCallback((phone, extension = null) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      const formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      return extension ? `${formatted} ext. ${extension}` : formatted;
    }
    return phone;
  }, []);

  const formatDriversLicenseClasses = useCallback((driversLicenseClass) => {
    if (!driversLicenseClass) return "-";
    if (typeof driversLicenseClass === "string") {
      return driversLicenseClass || "-";
    }
    if (Array.isArray(driversLicenseClass)) {
      if (driversLicenseClass.length === 0) return "-";
      return (
        driversLicenseClass
          .map((license) => {
            if (typeof license === "string") return license;
            if (license && typeof license === "object") {
              return license.text || license.label || license.name || license.value || "";
            }
            return "";
          })
          .filter(Boolean)
          .join(", ") || "-"
      );
    }
    if (typeof driversLicenseClass === "object") {
      return driversLicenseClass.text || driversLicenseClass.label || driversLicenseClass.name || driversLicenseClass.value || "-";
    }
    return String(driversLicenseClass) || "-";
  }, []);

  const formatMultiSelect = useCallback((selectedValues, options) => {
    if (!selectedValues || selectedValues.length === 0) return "-";
    return selectedValues
      .map((value) => options[value] || `Unknown (${value})`)
      .join(", ");
  }, []);

  const formatAddress = useCallback((associateData) => {
    if (!associateData) return "-";
    const address =
      associateData.fullAddressWithPostalCode ||
      `${associateData.addressLine1 || ""} ${associateData.city || ""} ${associateData.region || ""} ${associateData.postalCode || ""}`.trim();
    return address || "-";
  }, []);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: HomeIcon,
      hideOnMobile: false,
      mobileLabel: "Dash",
    },
    {
      label: "Associates",
      to: "/admin/associates",
      icon: UserGroupIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  // Memoize header config
  const headerConfig = useMemo(() => ({
    title: "Associate - Full Details",
    icon: ClipboardDocumentListIcon,
    loadingText: "Loading associate details...",
    notFoundTitle: "Associate Not Found",
    notFoundMessage: "The associate you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Associates",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/associates"),
    },
  }), [navigate]);

  // Memoize tabs
  const tabs = useMemo(() => {
    if (!associate) return [];
    return [
      { label: "Summary", to: `/admin/associate/${associate.id}` },
      { label: "Detail", to: `/admin/associate/${associate.id}/detail`, isActive: true },
      { label: "Orders", to: `/admin/associate/${associate.id}/orders` },
      { label: "Comments", to: `/admin/associate/${associate.id}/comments` },
      { label: "Attachments", to: `/admin/associate/${associate.id}/attachments` },
      { label: "More", to: `/admin/associate/${associate.id}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [associate]);

  // Memoize action buttons
  const actionButtons = useMemo(() => {
    if (!associate) return [];
    return [
      {
        variant: "outline",
        onClick: () => navigate("/admin/associates"),
        icon: ChevronLeftIcon,
        label: "Back",
      },
      {
        component: (
          <EditButton
            onClick={() => navigate(`/admin/associate/${aid}/edit`)}
            disabled={associate?.status === ASSOCIATE_STATUS_ARCHIVED}
            variant="primary"
            className="flex-1 sm:flex-initial"
          />
        ),
      },
    ];
  }, [associate, navigate, aid]);

  // Memoize alerts configuration
  const alerts = useMemo(() => ({
    archived: {
      message: "This associate is archived",
      icon: ArchiveBoxIcon,
    },
    banned: {
      message: "This associate is banned",
      icon: NoSymbolIcon,
    },
  }), []);

  // Memoize content sections
  const contentSections = useMemo(() => {
    if (!associate) return [];

    return [
      // Personal Information Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Personal Information" icon={UserIcon}>
            <DetailField label="First Name" value={associate.firstName} />
            <DetailField label="Last Name" value={associate.lastName} />
            <div>
              <TagsDisplay
                values={extractIds(associate.tags)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            <div>
              <SkillSetsDisplay
                values={extractIds(associate.skillSets)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            <DetailField
              label="Description"
              value={associate.description}
              fullWidth
            />
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Type
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">
                    {ASSOCIATE_TYPE_MAP[associate.type] || "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">
                    {associate.gender ? (
                      <>
                        {ASSOCIATE_GENDER_MAP[associate.gender] || "Unknown"}
                        {associate.gender === 1 &&
                          associate.genderOther &&
                          ` - ${associate.genderOther}`}
                      </>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">
                    {formatDateForDisplay(associate.birthDate)}
                  </dd>
                </div>
              </div>
            </div>
          </DetailSection>
        ),
      },
      // Company Information (Conditional - for Commercial associates)
      {
        type: "conditional",
        condition: associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
        component: (
          <DetailSection title="Company Information" icon={BuildingOfficeIcon}>
            <DetailField
              label="Company Name"
              value={associate.organizationName}
            />
            <DetailField
              label="Company Type"
              value={ASSOCIATE_ORGANIZATION_TYPE_MAP[associate.organizationType]}
            />
          </DetailSection>
        ),
      },
      // Contact Point Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Contact Point" icon={PhoneIcon}>
            <DetailField
              label="Email"
              value={
                associate.email ? (
                  <a
                    href={`mailto:${associate.email}`}
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    {associate.email}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="I agree to receive electronic email"
              value={
                associate.isOkToEmail ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
            <DetailField
              label="Phone"
              value={formatPhone(
                associate.phone,
                associate.phoneType === ASSOCIATE_PHONE_TYPE_WORK
                  ? associate.phoneExtension
                  : null,
              )}
            />
            <DetailField
              label="Phone Type"
              value={ASSOCIATE_PHONE_TYPE_MAP[associate.phoneType]}
            />
            {associate.otherPhone && (
              <>
                <DetailField
                  label="Other Phone (Optional)"
                  value={formatPhone(
                    associate.otherPhone,
                    associate.otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK
                      ? associate.otherPhoneExtension
                      : null,
                  )}
                />
                <DetailField
                  label="Other Phone Type (Optional)"
                  value={ASSOCIATE_PHONE_TYPE_MAP[associate.otherPhoneType]}
                />
              </>
            )}
            <DetailField
              label="I agree to receive texts to my phone"
              value={
                associate.isOkToText ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
          </DetailSection>
        ),
      },
      // Address Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Address" icon={MapPinIcon}>
            <DetailField
              label="Location"
              value={
                associate.fullAddressUrl ? (
                  <a
                    href={associate.fullAddressUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-words"
                  >
                    {formatAddress(associate)}
                  </a>
                ) : (
                  formatAddress(associate)
                )
              }
              fullWidth
            />
          </DetailSection>
        ),
      },
      // Account Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Account" icon={CreditCardIcon}>
            <div>
              <InsuranceRequirementsDisplay
                values={extractIds(associate.insuranceRequirements)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            {associate.serviceFeeId && (
              <div>
                <ServiceFeeDisplay
                  value={associate.serviceFeeId}
                  onUnauthorized={onUnauthorized}
                  showAmount={true}
                />
              </div>
            )}
            <DetailField
              label="Hourly salary desired (Optional)"
              value={
                associate.hourlySalaryDesired
                  ? `$${associate.hourlySalaryDesired} / hr`
                  : "-"
              }
            />
            <DetailField
              label="Limit special"
              value={associate.limitSpecial}
            />
            <DetailField
              label="Dues Expiry"
              value={formatDateForDisplay(associate.duesDate)}
            />
            <DetailField
              label="Commercial insurance expiry date"
              value={formatDateForDisplay(associate.commercialInsuranceExpiryDate)}
            />
            <DetailField
              label="Auto Insurance Expiry Date"
              value={formatDateForDisplay(associate.autoInsuranceExpiryDate)}
            />
            <DetailField label="WSIB #" value={associate.wsibNumber} />
            <DetailField
              label="WSIB Insurance Date"
              value={formatDateForDisplay(associate.wsibInsuranceDate)}
            />
            <DetailField
              label="Police check date"
              value={formatDateForDisplay(associate.policeCheck)}
            />
            <DetailField label="HST #" value={associate.taxId} />
            <DetailField
              label="Drivers license class(es)"
              value={formatDriversLicenseClasses(associate.driversLicenseClass)}
            />
            <div>
              <VehicleTypesDisplay
                values={extractIds(associate.vehicleTypes)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            <DetailField
              label="Account Balance"
              value={
                associate.balanceOwingAmount
                  ? `$${associate.balanceOwingAmount}`
                  : "$0.00"
              }
            />
            <DetailField
              label="Is active"
              value={
                <span
                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    associate.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {associate.status === 1 ? "Active" : "Archive"}
                </span>
              }
            />
            <DetailField
              label="Preferred Language"
              value={associate.preferredLanguage || "English"}
            />
          </DetailSection>
        ),
      },
      // Emergency Contact Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Emergency Contact" icon={ExclamationTriangleIcon}>
            <DetailField label="Name" value={associate.emergencyContactName} />
            <DetailField
              label="Relationship"
              value={associate.emergencyContactRelationship}
            />
            <DetailField
              label="Telephone"
              value={formatPhone(associate.emergencyContactTelephone)}
            />
            <DetailField
              label="Alternate Telephone"
              value={formatPhone(associate.emergencyContactAlternativeTelephone)}
            />
          </DetailSection>
        ),
      },
      // Job Seeker Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Job Seeker" icon={BriefcaseIcon}>
            <DetailField
              label="Is Job Seeker?"
              value={
                associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES
                  ? "Yes"
                  : associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_NO
                    ? "No"
                    : "-"
              }
            />
            {associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
              <>
                <DetailField
                  label="Job Seeker ID"
                  value={associate.jobSeekerId}
                />
                <DetailField
                  label="Status in Country"
                  value={ASSOCIATE_STATUS_IN_COUNTRY_MAP[associate.statusInCountry]}
                />
                {associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                  <DetailField
                    label="Status in Country (Other)"
                    value={associate.statusInCountryOther}
                  />
                )}
                {(associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                  associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
                  associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON) && (
                  <>
                    <DetailField
                      label="Country of Origin"
                      value={associate.countryOfOrigin}
                    />
                    <DetailField
                      label="Date of Entry into Country"
                      value={formatDateForDisplay(associate.dateOfEntryIntoCountry)}
                    />
                  </>
                )}
                <DetailField
                  label="Marital Status"
                  value={ASSOCIATE_MARITAL_STATUS_MAP[associate.maritalStatus]}
                />
                {associate.maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                  <DetailField
                    label="Marital Status (Other)"
                    value={associate.maritalStatusOther}
                  />
                )}
                <DetailField
                  label="Accomplished level of Education"
                  value={ASSOCIATE_EDUCATION_MAP[associate.accomplishedEducation]}
                />
                {associate.accomplishedEducation === ASSOCIATE_EDUCATION_OTHER && (
                  <DetailField
                    label="Accomplished level of Education (Other)"
                    value={associate.accomplishedEducationOther}
                  />
                )}
              </>
            )}
          </DetailSection>
        ),
      },
      // Internal Metrics Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
            <div>
              <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                How did they discover us?
              </dt>
              <dd className="text-base sm:text-lg font-medium text-gray-900">
                {associate.isHowDidYouHearAboutUsOther ? (
                  <div>
                    <HowHearAboutUsDisplay
                      value={
                        associate.howDidYouHearAboutUsID ||
                        associate.howDidYouHearAboutUsId
                      }
                      onUnauthorized={onUnauthorized}
                    />
                    {associate.howDidYouHearAboutUsOther && (
                      <div className="mt-1 text-base sm:text-lg italic text-gray-600">
                        Other: {associate.howDidYouHearAboutUsOther}
                      </div>
                    )}
                  </div>
                ) : (
                  <HowHearAboutUsDisplay
                    value={
                      associate.howDidYouHearAboutUsID ||
                      associate.howDidYouHearAboutUsId
                    }
                    onUnauthorized={onUnauthorized}
                  />
                )}
              </dd>
            </div>
            <DetailField
              label="Do you identify as belonging to any of the following groups?"
              value={formatMultiSelect(associate.identifyAs, ASSOCIATE_IDENTIFY_AS_MAP)}
            />
            <DetailField
              label="Join date"
              value={formatDateTime(associate.joinDate)}
            />
          </DetailSection>
        ),
      },
      // System Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="System" icon={ComputerDesktopIcon}>
            <DetailField
              label="ID"
              value={
                <span className="font-mono text-xs sm:text-sm bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded break-all">
                  {associate.publicId || associate.id || "-"}
                </span>
              }
            />
            <DetailField
              label="Created at"
              value={formatDateTime(associate.createdAt)}
            />
            <DetailField
              label="Created by"
              value={associate.createdByUserName}
            />
            <DetailField
              label="Created from"
              value={
                associate.createdFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {associate.createdFromIpAddress}
                  </span>
                )
              }
            />
            <DetailField
              label="Modified at"
              value={formatDateTime(associate.modifiedAt)}
            />
            <DetailField
              label="Modified by"
              value={associate.modifiedByUserName}
            />
            <DetailField
              label="Modified from"
              value={
                associate.modifiedFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {associate.modifiedFromIpAddress}
                  </span>
                )
              }
            />
          </DetailSection>
        ),
      },
    ];
  }, [associate, formatAddress, formatPhone, formatMultiSelect, formatDriversLicenseClasses, onUnauthorized]);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailFullView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading associate details...",
        }}
      />
    );
  }

  return (
    <DetailFullView
      entityData={associate}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      contentSections={contentSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      onUnauthorized={onUnauthorized}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
});

function AdminAssociateDetailFullPage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailFullPageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailFullPage;
