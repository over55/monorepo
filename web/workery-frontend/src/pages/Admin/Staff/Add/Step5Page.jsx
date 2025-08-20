// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Input,
  Textarea,
  Radio,
  Breadcrumb,
  ProgressBar,
} from "../../../../components/UI";
import { VehicleTypesMultiSelect } from "../../../../components/Form";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  HomeIcon,
  ScaleIcon,
  UsersIcon,
  KeyIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";

function AdminStaffAddStep5Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [limitSpecial, setLimitSpecial] = useState(
    wizardState.limitSpecial || "",
  );
  const [policeCheck, setPoliceCheck] = useState(wizardState.policeCheck || "");
  const [driversLicenseClass, setDriversLicenseClass] = useState(
    wizardState.driversLicenseClass || "",
  );
  const [vehicleTypes, setVehicleTypes] = useState(
    wizardState.vehicleTypes || [],
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    wizardState.emergencyContactName || "",
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState(wizardState.emergencyContactRelationship || "");
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState(
    wizardState.emergencyContactTelephone || "",
  );
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState(wizardState.emergencyContactAlternativeTelephone || "");
  const [description, setDescription] = useState(wizardState.description || "");
  const [preferredLanguage, setPreferredLanguage] = useState(
    wizardState.preferredLanguage || "",
  );
  const [password, setPassword] = useState(wizardState.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(
    wizardState.passwordRepeated || "",
  );

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!emergencyContactName) {
      newErrors.emergencyContactName = "Emergency contact name is required";
      hasErrors = true;
    }
    if (!emergencyContactRelationship) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
      hasErrors = true;
    }
    if (!emergencyContactTelephone) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
      hasErrors = true;
    }
    if (!preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
      hasErrors = true;
    }
    if (password && password !== passwordRepeated) {
      newErrors.password = "Passwords do not match";
      newErrors.passwordRepeated = "Passwords do not match";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    wizardStorage.updateWizardState({
      limitSpecial,
      policeCheck,
      driversLicenseClass,
      vehicleTypes,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactTelephone,
      emergencyContactAlternativeTelephone,
      description,
      preferredLanguage,
      password,
      passwordRepeated,
    });

    navigate("/admin/staff/add/step-6");
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Staff", href: "/admin/staff", icon: UserIcon },
    { label: "New", icon: PlusIcon },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>New Staff Member</h1>
      <p>Step 5 of 7 - Account Details</p>

      {/* Progress Bar */}
      <ProgressBar value={71} max={100} color="green" />

      {/* Main Content */}
      <Card>
        <h2>
          <UserIcon /> Account Details
        </h2>
        <p>
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        {/* Insurance & Financial Section */}
        <h3>
          <ScaleIcon /> Insurance, Financial, etc.
        </h3>

        <Textarea
          label="Limitation or special consideration (optional)"
          value={limitSpecial}
          onChange={(e) => setLimitSpecial(e.target.value)}
          helperText="Max 638 characters"
          rows={4}
        />

        <Input
          label="Police Check Expiry (optional)"
          type="date"
          value={policeCheck}
          onChange={(e) => setPoliceCheck(e.target.value)}
        />

        <Input
          label="Drivers License Class (optional)"
          value={driversLicenseClass}
          onChange={(e) => setDriversLicenseClass(e.target.value)}
        />

        <VehicleTypesMultiSelect
          value={vehicleTypes}
          onChange={setVehicleTypes}
          onUnauthorized={onUnauthorized}
          label="Vehicle Types (optional)"
          helperText="Select the vehicle types this staff member can operate"
        />

        <div>
          <label>Preferred Language *</label>
          <Radio
            name="preferredLanguage"
            value="English"
            checked={preferredLanguage === "English"}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            label="English"
          />
          <Radio
            name="preferredLanguage"
            value="French"
            checked={preferredLanguage === "French"}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            label="French"
          />
          {errors.preferredLanguage && <p>{errors.preferredLanguage}</p>}
        </div>

        {/* Emergency Contact Section */}
        <h3>
          <UsersIcon /> Emergency Contact
        </h3>

        <Input
          label="Contact Name"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          error={errors.emergencyContactName}
          required
        />

        <Input
          label="Contact Relationship"
          value={emergencyContactRelationship}
          onChange={(e) => setEmergencyContactRelationship(e.target.value)}
          error={errors.emergencyContactRelationship}
          required
        />

        <Input
          label="Contact Telephone"
          value={emergencyContactTelephone}
          onChange={(e) => setEmergencyContactTelephone(e.target.value)}
          error={errors.emergencyContactTelephone}
          required
        />

        <Input
          label="Contact Alternative Telephone (Optional)"
          value={emergencyContactAlternativeTelephone}
          onChange={(e) =>
            setEmergencyContactAlternativeTelephone(e.target.value)
          }
        />

        {/* Login Credentials Section */}
        <h3>
          <KeyIcon /> Login Credentials
        </h3>

        <Input
          label="Password (Optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <Input
          label="Password Repeated (Optional)"
          type="password"
          value={passwordRepeated}
          onChange={(e) => setPasswordRepeated(e.target.value)}
          error={errors.passwordRepeated}
        />

        {/* System Section */}
        <h3>
          <ServerIcon /> System
        </h3>

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helperText="Max 638 characters"
          rows={4}
        />

        <div>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/staff/add/step-4")}
            icon={ArrowLeftIcon}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={onSubmitClick}
            icon={ArrowRightIcon}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffAddStep5Page;
