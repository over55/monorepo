// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/FullPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  HeartIcon,
  UserCircleIcon,
  ClockIcon,
  MapIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
  InsuranceRequirementsDisplay,
  HowHearAboutUsDisplay,
  ServiceFeeDisplay,
  VehicleTypesDisplay,
} from "../../../../components/Display";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_PHONE_TYPE_WORK = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
const ASSOCIATE_IS_JOB_SEEKER_NO = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_OTHER = 1;
const ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN = 3;
const ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS = 4;
const ASSOCIATE_MARITAL_STATUS_OTHER = 1;
const ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER = 1;

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

function AdminAssociateDetailFullPage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate data
  const fetchAssociate = async () => {
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
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [aid]);

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  const formatDriversLicenseClasses = (driversLicenseClass) => {
    if (!driversLicenseClass || driversLicenseClass.length === 0) return "-";
    return driversLicenseClass.map((license) => license.text).join(", ");
  };

  const formatMultiSelect = (selectedValues, options) => {
    if (!selectedValues || selectedValues.length === 0) return "-";
    return selectedValues
      .map((value) => options[value] || `Unknown (${value})`)
      .join(", ");
  };

  const formatAddress = (associate) => {
    if (!associate) return "-";
    const address =
      associate.fullAddressWithPostalCode ||
      `${associate.addressLine1 || ""} ${associate.city || ""} ${associate.region || ""} ${associate.postalCode || ""}`.trim();

    return address || "-";
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  };

  // Section Component
  const DetailSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</dl>
      </div>
    </div>
  );

  // Detail Field Component
  const DetailField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
      <dd className="text-base text-gray-900">{value || "-"}</dd>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View complete associate information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This associate is archived
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {associate && (
          <>
            {/* Header with Actions */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-7 h-7 mr-2 text-blue-600" />
                  Full Details
                </h2>
                <div className="flex gap-3">
                  <Link to="/admin/associates">
                    <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Back
                    </button>
                  </Link>
                  <Link to={`/admin/associate/${aid}/edit`}>
                    <button
                      disabled={associate.status === 2}
                      className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                        associate.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-5 h-5 mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Link
                  to={`/admin/associate/${associate.id}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Detail
                </div>
                <Link
                  to={`/admin/associate/${associate.id}/orders`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Orders
                </Link>
                <Link
                  to={`/admin/associate/${associate.id}/comments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Comments
                </Link>
                <Link
                  to={`/admin/associate/${associate.id}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/associate/${associate.id}/more`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
                >
                  More
                  <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                </Link>
              </nav>
            </div>

            {/* Detail Sections */}
            <div className="p-6">
              {/* Personal Information */}
              <DetailSection title="Personal Information" icon={UserIcon}>
                {/* First Row - Names */}
                <DetailField label="First Name" value={associate.firstName} />
                <DetailField label="Last Name" value={associate.lastName} />

                {/* Second Row - Tags and Skills */}
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

                {/* Third Row - Description */}
                <DetailField
                  label="Description"
                  value={associate.description}
                  fullWidth
                />

                {/* Fourth Row - Type, Gender, Date of Birth */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-600 mb-1">
                        Type
                      </dt>
                      <dd className="text-base text-gray-900">
                        {ASSOCIATE_TYPE_OPTIONS[associate.type] || "Unknown"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 mb-1">
                        Gender
                      </dt>
                      <dd className="text-base text-gray-900">
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
                      <dt className="text-sm font-medium text-gray-600 mb-1">
                        Date of Birth
                      </dt>
                      <dd className="text-base text-gray-900">
                        {formatDate(associate.birthDate)}
                      </dd>
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Company Information (for Commercial associates) */}
              {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                <DetailSection
                  title="Company Information"
                  icon={BuildingOfficeIcon}
                >
                  <DetailField
                    label="Company Name"
                    value={associate.organizationName}
                  />
                  <DetailField
                    label="Company Type"
                    value={
                      ASSOCIATE_ORGANIZATION_TYPE_OPTIONS[
                        associate.organizationType
                      ]
                    }
                  />
                </DetailSection>
              )}

              {/* Contact Point */}
              <DetailSection title="Contact Point" icon={PhoneIcon}>
                <DetailField
                  label="Email"
                  value={
                    associate.email ? (
                      <a
                        href={`mailto:${associate.email}`}
                        className="text-blue-600 hover:text-blue-700"
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
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-4 h-4 mr-1" />
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
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        No
                      </span>
                    )
                  }
                />
              </DetailSection>

              {/* Address */}
              <DetailSection title="Address" icon={MapPinIcon}>
                <DetailField
                  label="Location"
                  value={
                    associate.fullAddressUrl ? (
                      <a
                        href={associate.fullAddressUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700"
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

              {/* Account */}
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
                  value={formatDate(associate.duesDate)}
                />
                <DetailField
                  label="Commercial insurance expiry date"
                  value={formatDate(associate.commercialInsuranceExpiryDate)}
                />
                <DetailField
                  label="Auto Insurance Expiry Date"
                  value={formatDate(associate.autoInsuranceExpiryDate)}
                />
                <DetailField label="WSIB #" value={associate.wsibNumber} />
                <DetailField
                  label="WSIB Insurance Date"
                  value={formatDate(associate.wsibInsuranceDate)}
                />
                <DetailField
                  label="Police check date"
                  value={formatDate(associate.policeCheck)}
                />
                <DetailField label="HST #" value={associate.taxId} />
                <DetailField
                  label="Drivers license class(es)"
                  value={formatDriversLicenseClasses(
                    associate.driversLicenseClass,
                  )}
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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

              {/* Emergency Contact */}
              <DetailSection
                title="Emergency Contact"
                icon={ExclamationTriangleIcon}
              >
                <DetailField
                  label="Name"
                  value={associate.emergencyContactName}
                />
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
                  value={formatPhone(
                    associate.emergencyContactAlternativeTelephone,
                  )}
                />
              </DetailSection>

              {/* Job Seeker */}
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
                      value={
                        ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS[
                          associate.statusInCountry
                        ]
                      }
                    />
                    {associate.statusInCountry ===
                      ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                      <DetailField
                        label="Status in Country (Other)"
                        value={associate.statusInCountryOther}
                      />
                    )}
                    {(associate.statusInCountry ===
                      ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                      associate.statusInCountry ===
                        ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
                      associate.statusInCountry ===
                        ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS) && (
                      <>
                        <DetailField
                          label="Country of Origin"
                          value={associate.countryOfOrigin}
                        />
                        <DetailField
                          label="Date of Entry into Country"
                          value={formatDate(associate.dateOfEntryIntoCountry)}
                        />
                      </>
                    )}
                    <DetailField
                      label="Marital Status"
                      value={
                        ASSOCIATE_MARITAL_STATUS_OPTIONS[
                          associate.maritalStatus
                        ]
                      }
                    />
                    {associate.maritalStatus ===
                      ASSOCIATE_MARITAL_STATUS_OTHER && (
                      <DetailField
                        label="Marital Status (Other)"
                        value={associate.maritalStatusOther}
                      />
                    )}
                    <DetailField
                      label="Accomplished level of Education"
                      value={
                        ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS[
                          associate.accomplishedEducation
                        ]
                      }
                    />
                    {associate.accomplishedEducation ===
                      ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER && (
                      <DetailField
                        label="Accomplished level of Education (Other)"
                        value={associate.accomplishedEducationOther}
                      />
                    )}
                  </>
                )}
              </DetailSection>

              {/* Internal Metrics */}
              <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
                <div>
                  {associate.isHowDidYouHearAboutUsOther ? (
                    <span className="text-base text-gray-900">
                      {associate.howDidYouHearAboutUsOther}
                    </span>
                  ) : (
                    <HowHearAboutUsDisplay
                      value={
                        associate.howDidYouHearAboutUsID ||
                        associate.howDidYouHearAboutUsId
                      }
                      onUnauthorized={onUnauthorized}
                    />
                  )}
                </div>
                <DetailField
                  label="Do you identify as belonging to any of the following groups?"
                  value={formatMultiSelect(
                    associate.identifyAs,
                    IDENTIFY_AS_OPTIONS,
                  )}
                />
              </DetailSection>

              {/* System */}
              <DetailSection title="System" icon={ComputerDesktopIcon}>
                <DetailField
                  label="ID"
                  value={
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
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
                      <span className="font-mono text-sm">
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
                      <span className="font-mono text-sm">
                        {associate.modifiedFromIpAddress}
                      </span>
                    )
                  }
                />
                <DetailField
                  label="Join date"
                  value={formatDateTime(associate.joinDate)}
                />
              </DetailSection>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/associates">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Associates
                  </button>
                </Link>

                <div className="flex gap-3">
                  <Link to={`/admin/associate/${aid}/edit`}>
                    <button
                      disabled={associate.status === 2}
                      className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                        associate.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-5 h-5 mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {!associate && !loading && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Associate Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Associates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateDetailFullPage;
