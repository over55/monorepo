// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Input,
  Select,
  Checkbox,
  Breadcrumb,
  ProgressBar,
} from "../../../../components/UI";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/Staff";

function AdminStaffAddStep3Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState(wizardState.email || "");
  const [phone, setPhone] = useState(wizardState.phone || "");
  const [phoneType, setPhoneType] = useState(wizardState.phoneType || 0);
  const [firstName, setFirstName] = useState(wizardState.firstName || "");
  const [lastName, setLastName] = useState(wizardState.lastName || "");
  const [otherPhone, setOtherPhone] = useState(wizardState.otherPhone || "");
  const [otherPhoneType, setOtherPhoneType] = useState(
    wizardState.otherPhoneType || 0,
  );
  const [isOkToText, setIsOkToText] = useState(wizardState.isOkToText || false);
  const [isOkToEmail, setIsOkToEmail] = useState(
    wizardState.isOkToEmail || false,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!firstName) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }
    if (!lastName) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }
    if (!email) {
      newErrors.email = "Email is required";
      hasErrors = true;
    }
    if (!phone) {
      newErrors.phone = "Phone is required";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors.phoneType = "Phone type is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    wizardStorage.updateWizardState({
      firstName,
      lastName,
      email,
      phone,
      phoneType,
      otherPhone,
      otherPhoneType,
      isOkToText,
      isOkToEmail,
    });

    navigate("/admin/staff/add/step-4");
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
      <p className="text-gray-600 mb-4">Step 3 of 7 - Contact Information</p>

      <ProgressBar value={43} max={100} color="green" className="mb-6" />

      <Card>
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <p className="text-gray-600 mb-6">
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              required
            />

            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Checkbox
            label="I agree to receive electronic email"
            checked={isOkToEmail}
            onChange={() => setIsOkToEmail(!isOkToEmail)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              required
            />

            <Select
              label="Phone Type"
              value={phoneType}
              onChange={(e) => setPhoneType(parseInt(e.target.value))}
              options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
              error={errors.phoneType}
              required
            />
          </div>

          <Checkbox
            label="I agree to receive texts to my phone"
            checked={isOkToText}
            onChange={() => setIsOkToText(!isOkToText)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Other Phone (Optional)"
              value={otherPhone}
              onChange={(e) => setOtherPhone(e.target.value)}
            />

            {otherPhone && (
              <Select
                label="Other Phone Type (Optional)"
                value={otherPhoneType}
                onChange={(e) => setOtherPhoneType(parseInt(e.target.value))}
                options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/staff/add/step-2")}
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
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffAddStep3Page;
