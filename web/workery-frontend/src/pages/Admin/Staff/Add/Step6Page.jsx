// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Input,
  Select,
  Textarea,
  MultiSelect,
  Breadcrumb,
  ProgressBar,
} from "../../../../components/UI";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/Form";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartPieIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";

// Import gender constant for "Other" option
import { STAFF_GENDER_OTHER } from "../../../../constants/Staff";

function AdminStaffAddStep6Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [tags, setTags] = useState(wizardState.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    wizardState.howDidYouHearAboutUsID || "",
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(wizardState.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(
    wizardState.howDidYouHearAboutUsOther || "",
  );
  const [birthDate, setBirthDate] = useState(wizardState.birthDate || "");
  const [joinDate, setJoinDate] = useState(wizardState.joinDate || "");
  const [gender, setGender] = useState(wizardState.gender || 0);
  const [genderOther, setGenderOther] = useState(wizardState.genderOther || "");
  const [additionalComment, setAdditionalComment] = useState(
    wizardState.additionalComment || "",
  );
  const [identifyAs, setIdentifyAs] = useState(wizardState.identifyAs || []);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID = "This field is required";
      hasErrors = true;
    } else if (isHowDidYouHearAboutUsOther && !howDidYouHearAboutUsOther) {
      newErrors.howDidYouHearAboutUsOther =
        "Please specify how you heard about us";
      hasErrors = true;
    }

    if (!gender || gender === 0) {
      newErrors.gender = "Gender is required";
      hasErrors = true;
    }

    // Use constant instead of magic number
    if (gender === STAFF_GENDER_OTHER && !genderOther) {
      newErrors.genderOther = "Please specify gender";
      hasErrors = true;
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    wizardStorage.updateWizardState({
      tags,
      howDidYouHearAboutUsID,
      howDidYouHearAboutUsOther,
      gender,
      genderOther,
      birthDate,
      joinDate,
      additionalComment,
      identifyAs,
    });

    navigate("/admin/staff/add/step-7");
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
      <p className="text-gray-600 mb-4">Step 6 of 7 - Metrics</p>

      <ProgressBar value={86} max={100} color="green" className="mb-6" />

      <Card>
        <div className="flex items-center mb-6">
          <ChartPieIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Metrics</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        <div className="space-y-6">
          <TagsMultiSelect
            value={tags}
            onChange={setTags}
            onUnauthorized={onUnauthorized}
            label="Tags (Optional)"
            helperText="Select tags to categorize this staff member"
          />

          <MultiSelect
            label="Do you identify as belonging to any of the following groups? (Optional)"
            value={identifyAs}
            onChange={setIdentifyAs}
            options={IDENTIFY_AS_OPTIONS}
            helperText="Select all that apply"
          />

          <HowHearAboutUsSelect
            value={howDidYouHearAboutUsID}
            onChange={setHowDidYouHearAboutUsID}
            onOtherDetected={setIsHowDidYouHearAboutUsOther}
            error={errors.howDidYouHearAboutUsID}
            required
            onUnauthorized={onUnauthorized}
          />

          {isHowDidYouHearAboutUsOther && (
            <Input
              label="How did you hear about us? (Other)"
              value={howDidYouHearAboutUsOther}
              onChange={(e) => setHowDidYouHearAboutUsOther(e.target.value)}
              error={errors.howDidYouHearAboutUsOther}
              required
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(parseInt(e.target.value))}
              options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
              error={errors.gender}
              required
            />

            {gender === STAFF_GENDER_OTHER && (
              <Input
                label="Gender (Other)"
                value={genderOther}
                onChange={(e) => setGenderOther(e.target.value)}
                error={errors.genderOther}
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Birth Date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              error={errors.birthDate}
              required
            />

            <Input
              label="Join Date (Optional)"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              helperText="Date when the staff member joined the organization"
            />
          </div>

          <Textarea
            label="Additional Comment (Optional)"
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            helperText="Max 638 characters"
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/staff/add/step-5")}
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

export default AdminStaffAddStep6Page;
