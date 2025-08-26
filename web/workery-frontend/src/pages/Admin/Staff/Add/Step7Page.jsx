// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step7Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useStaffManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  UsersIcon,
  InformationCircleIcon,
  PhoneIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
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

// DetailField Component for Review Section
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

// DetailSection Component with Dark Header
const DetailSection = ({ title, icon: Icon, children, editLink }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
        {editLink && (
          <Link
            to={editLink}
            className="inline-flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-200"
          >
            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Edit
          </Link>
        )}
      </div>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {children}
      </dl>
    </div>
  </div>
);

function AdminStaffAddStep7Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const staffManager = useStaffManager();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare the payload
      const payload = { ...wizardState };

      // Call the API to create staff
      const response = await staffManager.createStaff(payload, onUnauthorized);

      // Clear wizard state
      wizardStorage.clearWizardState();

      // Navigate to the new staff detail page with success message
      navigate(`/admin/staff/${response.id}`, {
        state: { successMessage: "Staff member created successfully!" },
      });
    } catch (error) {
      console.error("Error creating staff:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneType = (typeValue) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === typeValue,
    );
    return option ? option.label : "-";
  };

  const formatGender = (genderValue) => {
    const option = GENDER_OPTIONS_WITH_EMPTY_OPTION.find(
      (opt) => opt.value === genderValue,
    );
    return option ? option.label : "-";
  };

  const formatIdentifyAs = (values) => {
    if (!values || values.length === 0) return "-";
    return values
      .map((val) => {
        const option = IDENTIFY_AS_OPTIONS.find((opt) => opt.value === val);
        return option ? option.label : val;
      })
      .join(", ");
  };

  const formatStaffType = (typeValue) => {
    const option = STAFF_TYPE_FILTER_OPTIONS.find(
      (opt) => opt.value === typeValue,
    );
    return option ? option.label : "-";
  };

  // Helper function to parse array values
  const parseArrayValue = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return [];
  };

  if (!wizardState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to="/admin/staff"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Staff
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Staff Member
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review and submit new staff member
          </p>
        </div>

        {/* Wizard Steps - Mobile Simplified */}
        <div className="mb-4 sm:mb-6">
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 7: Review
                  </p>
                  <p className="text-xs text-gray-500">Submit New Staff</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">7 of 7</div>
            </div>
          </div>

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-6 Complete */}
              {[1, 2, 3, 4, 5, 6].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                        {step === 4 && "Address"}
                        {step === 5 && "Account"}
                        {step === 6 && "Metrics"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 7 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Instructions */}
        <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-800 flex items-start">
            <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Please carefully review the following staff details. If everything
              looks correct, click the <strong>Submit</strong> button to create
              the new staff member.
            </span>
          </p>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center break-words">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                {errors.message}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isSubmitting ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Creating staff member...
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Contact Information Section */}
            <DetailSection
              title="Contact Information"
              icon={UserIcon}
              editLink="/admin/staff/add/step-3"
            >
              <DetailField
                label="Type"
                value={formatStaffType(wizardState.type)}
              />
              <DetailField label="First Name" value={wizardState.firstName} />
              <DetailField label="Last Name" value={wizardState.lastName} />
              <DetailField label="Email" value={wizardState.email} />
              <DetailField
                label="Phone"
                value={`${wizardState.phone} (${formatPhoneType(wizardState.phoneType)})`}
              />
              <DetailField
                label="OK to Email"
                value={wizardState.isOkToEmail ? "Yes" : "No"}
              />
              <DetailField
                label="OK to Text"
                value={wizardState.isOkToText ? "Yes" : "No"}
              />

              {wizardState.otherPhone && (
                <DetailField
                  label="Other Phone"
                  value={`${wizardState.otherPhone} (${formatPhoneType(wizardState.otherPhoneType)})`}
                />
              )}
            </DetailSection>

            {/* Address Information Section */}
            <DetailSection
              title="Address Information"
              icon={MapPinIcon}
              editLink="/admin/staff/add/step-4"
            >
              <DetailField label="Address" value={wizardState.addressLine1} />
              {wizardState.addressLine2 && (
                <DetailField
                  label="Address Line 2"
                  value={wizardState.addressLine2}
                />
              )}
              <DetailField label="City" value={wizardState.city} />
              <DetailField
                label="Province/Territory"
                value={wizardState.region}
              />
              <DetailField label="Postal Code" value={wizardState.postalCode} />
              <DetailField label="Country" value={wizardState.country} />
            </DetailSection>

            {/* Shipping Address Section (if applicable) */}
            {wizardState.hasShippingAddress && (
              <DetailSection
                title="Shipping Address"
                icon={TruckIcon}
                editLink="/admin/staff/add/step-4"
              >
                <DetailField label="Name" value={wizardState.shippingName} />
                <DetailField label="Phone" value={wizardState.shippingPhone} />
                <DetailField
                  label="Address"
                  value={wizardState.shippingAddressLine1}
                />
                {wizardState.shippingAddressLine2 && (
                  <DetailField
                    label="Address Line 2"
                    value={wizardState.shippingAddressLine2}
                  />
                )}
                <DetailField label="City" value={wizardState.shippingCity} />
                <DetailField
                  label="Province/Territory"
                  value={wizardState.shippingRegion}
                />
                <DetailField
                  label="Postal Code"
                  value={wizardState.shippingPostalCode}
                />
                <DetailField
                  label="Country"
                  value={wizardState.shippingCountry}
                />
              </DetailSection>
            )}

            {/* Account Information Section */}
            <DetailSection
              title="Account Information"
              icon={ClipboardDocumentIcon}
              editLink="/admin/staff/add/step-5"
            >
              {wizardState.vehicleTypes &&
                wizardState.vehicleTypes.length > 0 && (
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
                <DetailField
                  label="Limitations/Special Considerations"
                  value={wizardState.limitSpecial}
                  fullWidth
                />
              )}
              {wizardState.policeCheck && (
                <DetailField
                  label="Police Check Expiry"
                  value={wizardState.policeCheck}
                />
              )}
              {wizardState.driversLicenseClass && (
                <DetailField
                  label="Drivers License Class"
                  value={wizardState.driversLicenseClass}
                />
              )}
              <DetailField
                label="Preferred Language"
                value={wizardState.preferredLanguage}
              />

              {/* Emergency Contact */}
              {wizardState.emergencyContactName && (
                <>
                  <DetailField
                    label="Emergency Contact"
                    value={`${wizardState.emergencyContactName} (${wizardState.emergencyContactRelationship})`}
                    fullWidth
                  />
                  <DetailField
                    label="Emergency Phone"
                    value={wizardState.emergencyContactTelephone}
                  />
                  {wizardState.emergencyContactAlternativeTelephone && (
                    <DetailField
                      label="Emergency Alt Phone"
                      value={wizardState.emergencyContactAlternativeTelephone}
                    />
                  )}
                </>
              )}

              {wizardState.description && (
                <DetailField
                  label="Description"
                  value={wizardState.description}
                  fullWidth
                />
              )}
            </DetailSection>

            {/* Metrics Information Section */}
            <DetailSection
              title="Metrics Information"
              icon={ChartBarSquareIcon}
              editLink="/admin/staff/add/step-6"
            >
              {wizardState.identifyAs && wizardState.identifyAs.length > 0 && (
                <DetailField
                  label="Identifies As"
                  value={formatIdentifyAs(wizardState.identifyAs)}
                  fullWidth
                />
              )}

              <DetailField
                label="Gender"
                value={formatGender(wizardState.gender)}
              />
              {wizardState.gender === STAFF_GENDER_OTHER &&
                wizardState.genderOther && (
                  <DetailField
                    label="Gender (Other)"
                    value={wizardState.genderOther}
                  />
                )}

              {wizardState.birthDate && (
                <DetailField label="Birth Date" value={wizardState.birthDate} />
              )}

              {wizardState.joinDate && (
                <DetailField label="Join Date" value={wizardState.joinDate} />
              )}

              {/* How Heard About Us Display */}
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
                <DetailField
                  label="How did you hear about us (Other)"
                  value={wizardState.howDidYouHearAboutUsOther}
                  fullWidth
                />
              )}

              {/* Tags Display */}
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
                <DetailField
                  label="Additional Comments"
                  value={wizardState.additionalComment}
                  fullWidth
                />
              )}
            </DetailSection>

            {/* Form Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/staff/add/step-6"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>
              <button
                onClick={onSubmitClick}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 order-1 sm:order-2"
              >
                <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaffAddStep7Page;
