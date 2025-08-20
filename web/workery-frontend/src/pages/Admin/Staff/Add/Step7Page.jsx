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
} from "../../../../constants/Staff";

// Import gender constant for "Other" option
const GENDER_OTHER = 1;

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
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>New Staff Member</h1>
      <p>Step 7 of 7 - Review and Submit</p>

      {/* Progress Bar */}
      <ProgressBar value={100} max={100} color="green" />

      {/* Main Content */}
      <Card>
        <h2>
          <QuestionMarkCircleIcon /> Are you ready to submit?
        </h2>
        <p>
          Please carefully review the following staff details and if you are
          ready click Submit to complete.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        {/* Contact Section */}
        <div>
          <h3>
            <IdentificationIcon /> Contact
            <Link to="/admin/staff/add/step-3">
              <PencilIcon /> Edit
            </Link>
          </h3>

          <p>
            <strong>Type:</strong> {formatStaffType(wizardState.type)}
          </p>
          <p>
            <strong>First Name:</strong> {wizardState.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {wizardState.lastName}
          </p>
          <p>
            <strong>Email:</strong> {wizardState.email}
          </p>
          <p>
            <strong>OK to Email:</strong>{" "}
            {wizardState.isOkToEmail ? "Yes" : "No"}
          </p>
          <p>
            <strong>Phone:</strong> {wizardState.phone}
          </p>
          <p>
            <strong>Phone Type:</strong>{" "}
            {formatPhoneType(wizardState.phoneType)}
          </p>
          <p>
            <strong>OK to Text:</strong> {wizardState.isOkToText ? "Yes" : "No"}
          </p>
          {wizardState.otherPhone && (
            <>
              <p>
                <strong>Other Phone:</strong> {wizardState.otherPhone}
              </p>
              <p>
                <strong>Other Phone Type:</strong>{" "}
                {formatPhoneType(wizardState.otherPhoneType)}
              </p>
            </>
          )}
        </div>

        {/* Address Section */}
        <div>
          <h3>
            <MapPinIcon /> Address
            <Link to="/admin/staff/add/step-4">
              <PencilIcon /> Edit
            </Link>
          </h3>

          <p>
            <strong>Has Different Shipping Address:</strong>{" "}
            {wizardState.hasShippingAddress ? "Yes" : "No"}
          </p>

          <div>
            {wizardState.hasShippingAddress && <h4>Billing Address</h4>}
            <p>
              <strong>Country:</strong> {wizardState.country}
            </p>
            <p>
              <strong>Province/Territory:</strong> {wizardState.region}
            </p>
            <p>
              <strong>City:</strong> {wizardState.city}
            </p>
            <p>
              <strong>Address Line 1:</strong> {wizardState.addressLine1}
            </p>
            {wizardState.addressLine2 && (
              <p>
                <strong>Address Line 2:</strong> {wizardState.addressLine2}
              </p>
            )}
            <p>
              <strong>Postal Code:</strong> {wizardState.postalCode}
            </p>
          </div>

          {wizardState.hasShippingAddress && (
            <div>
              <h4>Shipping Address</h4>
              <p>
                <strong>Name:</strong> {wizardState.shippingName}
              </p>
              <p>
                <strong>Phone:</strong> {wizardState.shippingPhone}
              </p>
              <p>
                <strong>Country:</strong> {wizardState.shippingCountry}
              </p>
              <p>
                <strong>Province/Territory:</strong>{" "}
                {wizardState.shippingRegion}
              </p>
              <p>
                <strong>City:</strong> {wizardState.shippingCity}
              </p>
              <p>
                <strong>Address Line 1:</strong>{" "}
                {wizardState.shippingAddressLine1}
              </p>
              {wizardState.shippingAddressLine2 && (
                <p>
                  <strong>Address Line 2:</strong>{" "}
                  {wizardState.shippingAddressLine2}
                </p>
              )}
              <p>
                <strong>Postal Code:</strong> {wizardState.shippingPostalCode}
              </p>
            </div>
          )}
        </div>

        {/* Account Details Section */}
        <div>
          <h3>
            <ScaleIcon /> Insurance, Financial, etc.
            <Link to="/admin/staff/add/step-5">
              <PencilIcon /> Edit
            </Link>
          </h3>

          {wizardState.limitSpecial && (
            <p>
              <strong>Limitations/Special Considerations:</strong>{" "}
              {wizardState.limitSpecial}
            </p>
          )}
          {wizardState.policeCheck && (
            <p>
              <strong>Police Check Expiry:</strong> {wizardState.policeCheck}
            </p>
          )}
          {wizardState.driversLicenseClass && (
            <p>
              <strong>Drivers License Class:</strong>{" "}
              {wizardState.driversLicenseClass}
            </p>
          )}
          {wizardState.vehicleTypes && wizardState.vehicleTypes.length > 0 && (
            <VehicleTypesDisplay values={wizardState.vehicleTypes} />
          )}
          <p>
            <strong>Preferred Language:</strong> {wizardState.preferredLanguage}
          </p>
        </div>

        {/* Emergency Contact Section */}
        <div>
          <h3>
            <UsersIcon /> Emergency Contact
            <Link to="/admin/staff/add/step-5">
              <PencilIcon /> Edit
            </Link>
          </h3>

          <p>
            <strong>Contact Name:</strong> {wizardState.emergencyContactName}
          </p>
          <p>
            <strong>Contact Relationship:</strong>{" "}
            {wizardState.emergencyContactRelationship}
          </p>
          <p>
            <strong>Contact Telephone:</strong>{" "}
            {wizardState.emergencyContactTelephone}
          </p>
          {wizardState.emergencyContactAlternativeTelephone && (
            <p>
              <strong>Alternative Telephone:</strong>{" "}
              {wizardState.emergencyContactAlternativeTelephone}
            </p>
          )}
        </div>

        {/* System Section */}
        <div>
          <h3>
            <ServerIcon /> System
            <Link to="/admin/staff/add/step-5">
              <PencilIcon /> Edit
            </Link>
          </h3>

          {wizardState.description && (
            <p>
              <strong>Description:</strong> {wizardState.description}
            </p>
          )}
        </div>

        {/* Metrics Section */}
        <div>
          <h3>
            <ChartPieIcon /> Metrics
            <Link to="/admin/staff/add/step-6">
              <PencilIcon /> Edit
            </Link>
          </h3>

          {wizardState.identifyAs && wizardState.identifyAs.length > 0 && (
            <p>
              <strong>Identifies As:</strong>{" "}
              {formatIdentifyAs(wizardState.identifyAs)}
            </p>
          )}

          {wizardState.tags && wizardState.tags.length > 0 && (
            <TagsDisplay values={wizardState.tags} />
          )}

          <HowHearAboutUsDisplay value={wizardState.howDidYouHearAboutUsID} />

          {wizardState.howDidYouHearAboutUsOther && (
            <p>
              <strong>How did you hear about us (Other):</strong>{" "}
              {wizardState.howDidYouHearAboutUsOther}
            </p>
          )}

          <p>
            <strong>Gender:</strong> {formatGender(wizardState.gender)}
          </p>
          {wizardState.gender === GENDER_OTHER && wizardState.genderOther && (
            <p>
              <strong>Gender (Other):</strong> {wizardState.genderOther}
            </p>
          )}

          {wizardState.birthDate && (
            <p>
              <strong>Birth Date:</strong> {wizardState.birthDate}
            </p>
          )}

          {wizardState.additionalComment && (
            <p>
              <strong>Additional Comment:</strong>{" "}
              {wizardState.additionalComment}
            </p>
          )}
        </div>

        <div>
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
