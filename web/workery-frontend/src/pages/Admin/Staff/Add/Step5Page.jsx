// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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

// Language constants
const LANGUAGE_ENGLISH = "English";
const LANGUAGE_FRENCH = "French";

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
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold mb-2">New Staff Member</h1>
      <p className="text-gray-600 mb-4">Step 5 of 7 - Account Details</p>

      <ProgressBar value={71} max={100} color="green" className="mb-6" />

      <Card>
        <div className="flex items-center mb-6">
          <UserIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Account Details</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        <div className="space-y-8">
          {/* Insurance & Financial Section */}
          <div>
            <div className="flex items-center mb-4">
              <ScaleIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Insurance, Financial, etc.
              </h3>
            </div>

            <div className="space-y-4">
              <Textarea
                label="Limitation or special consideration (optional)"
                value={limitSpecial}
                onChange={(e) => setLimitSpecial(e.target.value)}
                helperText="Max 638 characters"
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <VehicleTypesMultiSelect
                value={vehicleTypes}
                onChange={setVehicleTypes}
                onUnauthorized={onUnauthorized}
                label="Vehicle Types (optional)"
                helperText="Select the vehicle types this staff member can operate"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language *
                </label>
                <div className="space-y-2">
                  <Radio
                    name="preferredLanguage"
                    value={LANGUAGE_ENGLISH}
                    checked={preferredLanguage === LANGUAGE_ENGLISH}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    label="English"
                  />
                  <Radio
                    name="preferredLanguage"
                    value={LANGUAGE_FRENCH}
                    checked={preferredLanguage === LANGUAGE_FRENCH}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    label="French"
                  />
                </div>
                {errors.preferredLanguage && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.preferredLanguage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <div className="flex items-center mb-4">
              <UsersIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Emergency Contact
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) =>
                    setEmergencyContactRelationship(e.target.value)
                  }
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
              </div>
            </div>
          </div>

          {/* Login Credentials Section */}
          <div>
            <div className="flex items-center mb-4">
              <KeyIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Login Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* System Section */}
          <div>
            <div className="flex items-center mb-4">
              <ServerIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">System</h3>
            </div>

            <Textarea
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Max 638 characters"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
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
