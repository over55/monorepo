// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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
  IdentificationIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  STAFF_PHONE_TYPE_LANDLINE,
  STAFF_PHONE_TYPE_MOBILE,
  STAFF_PHONE_TYPE_WORK,
} from "../../../../constants/Staff";

function AdminStaffAddStep3Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState(wizardState.email);
  const [phone, setPhone] = useState(wizardState.phone);
  const [phoneType, setPhoneType] = useState(wizardState.phoneType);
  const [firstName, setFirstName] = useState(wizardState.firstName);
  const [lastName, setLastName] = useState(wizardState.lastName);
  const [otherPhone, setOtherPhone] = useState(wizardState.otherPhone);
  const [otherPhoneType, setOtherPhoneType] = useState(
    wizardState.otherPhoneType,
  );
  const [isOkToText, setIsOkToText] = useState(wizardState.isOkToText);
  const [isOkToEmail, setIsOkToEmail] = useState(wizardState.isOkToEmail);

  const phoneTypeOptions = [
    { value: 0, label: "Please select" },
    { value: STAFF_PHONE_TYPE_LANDLINE, label: "Landline" },
    { value: STAFF_PHONE_TYPE_MOBILE, label: "Mobile" },
    { value: STAFF_PHONE_TYPE_WORK, label: "Work" },
  ];

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

    // Save to storage
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
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>New Staff Member</h1>
      <p>Step 3 of 7 - Contact Information</p>

      {/* Progress Bar */}
      <ProgressBar value={43} max={100} color="green" />

      {/* Main Content */}
      <Card>
        <h2>
          <IdentificationIcon /> Contact Information
        </h2>
        <p>
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

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
          options={phoneTypeOptions}
          error={errors.phoneType}
          required
        />

        <Checkbox
          label="I agree to receive texts to my phone"
          checked={isOkToText}
          onChange={() => setIsOkToText(!isOkToText)}
        />

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
            options={phoneTypeOptions}
          />
        )}

        <div>
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
      </Card>
    </div>
  );
}

export default AdminStaffAddStep3Page;
