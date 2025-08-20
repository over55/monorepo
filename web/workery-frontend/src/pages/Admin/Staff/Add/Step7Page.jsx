// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step7Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useStaffManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  ProgressBar,
  Badge,
} from "../../../../components/UI";
import {
  TagsDisplay,
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
} from "../../../../components/Display";
import {
  PlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  HomeIcon,
  PencilIcon,
  IdentificationIcon,
  MapPinIcon,
  ScaleIcon,
  UsersIcon,
  ServerIcon,
  ChartPieIcon,
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

  const onSubmitClick = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare the payload
      const payload = { ...wizardState };

      // Call the API to create staff
      const response = await staffManager.createStaff(payload, onUnauthorized);

      // Clear wizard state
      wizardStorage.clearWizardState();

      // Navigate to the new staff detail page
      navigate(`/admin/staff/${response.id}`);
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

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Staff", href: "/admin/staff", icon: UserIcon },
    { label: "New", icon: PlusIcon },
  ];

  if (isSubmitting) {
    return <Loading text="Creating staff member..." fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold mb-2">New Staff Member</h1>
      <p className="text-gray-600 mb-4">Step 7 of 7 - Review and Submit</p>

      <ProgressBar value={100} max={100} color="green" className="mb-6" />

      <Card>
        <div className="flex items-center mb-6">
          <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Are you ready to submit?</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Please carefully review the following staff details and if you are
          ready click Submit to complete.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">
            {errors.message || "Please correct the errors below."}
          </Alert>
        )}

        <div className="space-y-8">
          {/* Contact Section */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <IdentificationIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Contact</h3>
              </div>
              <Link
                to="/admin/staff/add/step-3"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>{" "}
                {formatStaffType(wizardState.type)}
              </div>
              <div>
                <span className="font-medium text-gray-600">First Name:</span>{" "}
                {wizardState.firstName}
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Name:</span>{" "}
                {wizardState.lastName}
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>{" "}
                {wizardState.email}
              </div>
              <div>
                <span className="font-medium text-gray-600">OK to Email:</span>{" "}
                <Badge
                  variant={wizardState.isOkToEmail ? "success" : "default"}
                >
                  {wizardState.isOkToEmail ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>{" "}
                {wizardState.phone}
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone Type:</span>{" "}
                {formatPhoneType(wizardState.phoneType)}
              </div>
              <div>
                <span className="font-medium text-gray-600">OK to Text:</span>{" "}
                <Badge variant={wizardState.isOkToText ? "success" : "default"}>
                  {wizardState.isOkToText ? "Yes" : "No"}
                </Badge>
              </div>
              {wizardState.otherPhone && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">
                      Other Phone:
                    </span>{" "}
                    {wizardState.otherPhone}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Other Phone Type:
                    </span>{" "}
                    {formatPhoneType(wizardState.otherPhoneType)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Address</h3>
              </div>
              <Link
                to="/admin/staff/add/step-4"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>

            <div className="text-sm">
              <p className="mb-2">
                <span className="font-medium text-gray-600">
                  Has Different Shipping Address:
                </span>{" "}
                <Badge
                  variant={wizardState.hasShippingAddress ? "info" : "default"}
                >
                  {wizardState.hasShippingAddress ? "Yes" : "No"}
                </Badge>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {wizardState.hasShippingAddress && (
                    <h4 className="font-semibold mb-2">Billing Address</h4>
                  )}
                  <p>{wizardState.addressLine1}</p>
                  {wizardState.addressLine2 && (
                    <p>{wizardState.addressLine2}</p>
                  )}
                  <p>
                    {wizardState.city}, {wizardState.region}
                  </p>
                  <p>{wizardState.postalCode}</p>
                  <p>{wizardState.country}</p>
                </div>

                {wizardState.hasShippingAddress && (
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <p className="font-medium">{wizardState.shippingName}</p>
                    <p>{wizardState.shippingPhone}</p>
                    <p>{wizardState.shippingAddressLine1}</p>
                    {wizardState.shippingAddressLine2 && (
                      <p>{wizardState.shippingAddressLine2}</p>
                    )}
                    <p>
                      {wizardState.shippingCity}, {wizardState.shippingRegion}
                    </p>
                    <p>{wizardState.shippingPostalCode}</p>
                    <p>{wizardState.shippingCountry}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <ScaleIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Account Details</h3>
              </div>
              <Link
                to="/admin/staff/add/step-5"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              {wizardState.limitSpecial && (
                <div>
                  <span className="font-medium text-gray-600">
                    Limitations/Special Considerations:
                  </span>
                  <p className="mt-1">{wizardState.limitSpecial}</p>
                </div>
              )}
              {wizardState.policeCheck && (
                <div>
                  <span className="font-medium text-gray-600">
                    Police Check Expiry:
                  </span>{" "}
                  {wizardState.policeCheck}
                </div>
              )}
              {wizardState.driversLicenseClass && (
                <div>
                  <span className="font-medium text-gray-600">
                    Drivers License Class:
                  </span>{" "}
                  {wizardState.driversLicenseClass}
                </div>
              )}
              {wizardState.vehicleTypes &&
                wizardState.vehicleTypes.length > 0 && (
                  <VehicleTypesDisplay
                    values={wizardState.vehicleTypes}
                    onUnauthorized={onUnauthorized}
                  />
                )}
              <div>
                <span className="font-medium text-gray-600">
                  Preferred Language:
                </span>{" "}
                {wizardState.preferredLanguage}
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
              </div>
              <Link
                to="/admin/staff/add/step-5"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Contact Name:</span>{" "}
                {wizardState.emergencyContactName}
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Contact Relationship:
                </span>{" "}
                {wizardState.emergencyContactRelationship}
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Contact Telephone:
                </span>{" "}
                {wizardState.emergencyContactTelephone}
              </div>
              {wizardState.emergencyContactAlternativeTelephone && (
                <div>
                  <span className="font-medium text-gray-600">
                    Alternative Telephone:
                  </span>{" "}
                  {wizardState.emergencyContactAlternativeTelephone}
                </div>
              )}
            </div>
          </div>

          {/* System Section */}
          {wizardState.description && (
            <div className="border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold">System</h3>
                </div>
                <Link
                  to="/admin/staff/add/step-5"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </div>

              <div className="text-sm">
                <span className="font-medium text-gray-600">Description:</span>
                <p className="mt-1">{wizardState.description}</p>
              </div>
            </div>
          )}

          {/* Metrics Section */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <ChartPieIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Metrics</h3>
              </div>
              <Link
                to="/admin/staff/add/step-6"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              {wizardState.identifyAs && wizardState.identifyAs.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    Identifies As:
                  </span>{" "}
                  {formatIdentifyAs(wizardState.identifyAs)}
                </div>
              )}

              {wizardState.tags && wizardState.tags.length > 0 && (
                <TagsDisplay
                  values={wizardState.tags}
                  onUnauthorized={onUnauthorized}
                />
              )}

              <HowHearAboutUsDisplay
                value={wizardState.howDidYouHearAboutUsID}
                onUnauthorized={onUnauthorized}
              />

              {wizardState.howDidYouHearAboutUsOther && (
                <div>
                  <span className="font-medium text-gray-600">
                    How did you hear about us (Other):
                  </span>{" "}
                  {wizardState.howDidYouHearAboutUsOther}
                </div>
              )}

              <div>
                <span className="font-medium text-gray-600">Gender:</span>{" "}
                {formatGender(wizardState.gender)}
              </div>

              {wizardState.gender === STAFF_GENDER_OTHER &&
                wizardState.genderOther && (
                  <div>
                    <span className="font-medium text-gray-600">
                      Gender (Other):
                    </span>{" "}
                    {wizardState.genderOther}
                  </div>
                )}

              {wizardState.birthDate && (
                <div>
                  <span className="font-medium text-gray-600">Birth Date:</span>{" "}
                  {wizardState.birthDate}
                </div>
              )}

              {wizardState.joinDate && (
                <div>
                  <span className="font-medium text-gray-600">Join Date:</span>{" "}
                  {wizardState.joinDate}
                </div>
              )}

              {wizardState.additionalComment && (
                <div>
                  <span className="font-medium text-gray-600">
                    Additional Comment:
                  </span>
                  <p className="mt-1">{wizardState.additionalComment}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/staff/add/step-6")}
            icon={ArrowLeftIcon}
          >
            Back
          </Button>

          <Button
            variant="success"
            onClick={onSubmitClick}
            icon={CheckCircleIcon}
            disabled={isSubmitting}
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffAddStep7Page;
