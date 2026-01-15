// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/FullPage.jsx
// UIX Upgraded - Uses DetailFullView whole page component
// @uix-page: AdminAssociateDetailFullPage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
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
  formatDateForDisplay,
  formatDateTime,
} from "../../../../services/Helpers/DateFormatter";
import { DetailFullView } from "../../../../components/UIX";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
const ASSOCIATE_IS_JOB_SEEKER_NO = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_OTHER = 1;
const ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN = 3;
const ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS = 4;
const ASSOCIATE_MARITAL_STATUS_OTHER = 1;
const ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER = 1;
const ASSOCIATE_STATUS_ARCHIVED = 2;

// Option mappings for display
const ASSOCIATE_TYPE_OPTIONS = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

const ASSOCIATE_ORGANIZATION_TYPE_OPTIONS = {
  1: "Private",
  2: "Non-profit",
  3: "Government",
};

const GENDER_OPTIONS = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const PHONE_TYPE_OPTIONS = {
  1: "Mobile",
  2: "Work",
  3: "Home",
};

const ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS = {
  1: "Other",
  2: "Permanent Resident",
  3: "Naturalized Canadian Citizen",
  4: "Protected Persons",
};

const ASSOCIATE_MARITAL_STATUS_OPTIONS = {
  1: "Other",
  2: "Single",
  3: "Married",
  4: "Divorced",
  5: "Widowed",
};

const ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS = {
  1: "Other",
  2: "No formal education",
  3: "Elementary school",
  4: "High school",
  5: "College",
  6: "University",
  7: "Graduate school",
};

const IDENTIFY_AS_OPTIONS = {
  1: "Aboriginal",
  2: "Visible minority",
  3: "Person with disability",
  4: "Youth",
  5: "Senior",
  6: "Woman",
  7: "Newcomer",
};

// Detail Section Component
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {children}
      </dl>
    </div>
  </div>
);

// Detail Field Component
const DetailField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "lg:col-span-2" : ""}>
    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
      {label}
    </dt>
    <dd className="text-base sm:text-lg font-medium text-gray-900 break-words">
      {value || "-"}
    </dd>
  </div>
);

function AdminAssociateDetailFullPage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate data
  const fetchAssociate = useCallback(async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [aid, associateManager, onUnauthorized]);

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [fetchAssociate]);

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

  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  }, []);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
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
    title: "Full Details",
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
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/associates"),
      },
      {
        variant: "secondary",
        label: "Edit",
        icon: PencilSquareIcon,
        disabled: associate.status === ASSOCIATE_STATUS_ARCHIVED,
        onClick: () => navigate(`/admin/associate/${aid}/edit`),
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
                    {ASSOCIATE_TYPE_OPTIONS[associate.type] || "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">
                    {associate.gender ? (
                      <>
                        {GENDER_OPTIONS[associate.gender] || "Unknown"}
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
              value={ASSOCIATE_ORGANIZATION_TYPE_OPTIONS[associate.organizationType]}
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
              value={PHONE_TYPE_OPTIONS[associate.phoneType]}
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
                  value={PHONE_TYPE_OPTIONS[associate.otherPhoneType]}
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
                  value={ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS[associate.statusInCountry]}
                />
                {associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                  <DetailField
                    label="Status in Country (Other)"
                    value={associate.statusInCountryOther}
                  />
                )}
                {(associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                  associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
                  associate.statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS) && (
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
                  value={ASSOCIATE_MARITAL_STATUS_OPTIONS[associate.maritalStatus]}
                />
                {associate.maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                  <DetailField
                    label="Marital Status (Other)"
                    value={associate.maritalStatusOther}
                  />
                )}
                <DetailField
                  label="Accomplished level of Education"
                  value={ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS[associate.accomplishedEducation]}
                />
                {associate.accomplishedEducation === ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER && (
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
              value={formatMultiSelect(associate.identifyAs, IDENTIFY_AS_OPTIONS)}
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
  }, [associate, formatAddress, formatPhone, formatMultiSelect, formatDriversLicenseClasses, extractIds, onUnauthorized]);

  return (
    <DetailFullView
      entityData={associate}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      contentSections={contentSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
}

export default AdminAssociateDetailFullPage;
