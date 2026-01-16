// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step2Page.jsx
// @uix-page: TaskItemSurveyStep2
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useMemo, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router";
import { useSurveyStorage } from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  ChevronRightIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Survey", description: "Complete Survey" },
  { title: "Complete", description: "Finish Task" },
]);

// No survey reason options
const NO_SURVEY_REASON_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
]);

// Memoized Radio Option Component
const RadioOption = memo(function RadioOption({ name, value, checked, onChange, label, themeClasses }) {
  return (
    <label className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
      />
      <span className={`ml-3 text-sm sm:text-base font-medium ${themeClasses.textPrimary}`}>
        {label}
      </span>
    </label>
  );
});

// Memoized Yes/No Radio Group Component
const YesNoRadioGroup = memo(function YesNoRadioGroup({ name, value, onChange, label, error, themeClasses }) {
  const handleChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const scrollY = window.scrollY;
    onChange(parseInt(e.target.value));
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, [onChange]);

  return (
    <div>
      <label className={`block text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value={1}
            checked={value === 1}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className={`ml-2 text-sm sm:text-base ${themeClasses.textPrimary} select-none`}>Yes</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value={2}
            checked={value === 2}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className={`ml-2 text-sm sm:text-base ${themeClasses.textPrimary} select-none`}>No</span>
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
          <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

// Memoized content component
const Step2Content = memo(function Step2Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const surveyStorage = useSurveyStorage();
  const { getThemeClasses } = useUIXTheme();

  // Get form state from storage
  const formData = surveyStorage.getState();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    borderLight: getThemeClasses("border-light") || "border-gray-200",
  }), [getThemeClasses]);

  // Component states
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [wasSurveyConducted, setWasSurveyConducted] = useState(formData.wasSurveyConducted || 0);
  const [noSurveyConductedReason, setNoSurveyConductedReason] = useState(formData.noSurveyConductedReason || 0);
  const [noSurveyConductedReasonOther, setNoSurveyConductedReasonOther] = useState(formData.noSurveyConductedReasonOther || "");
  const [comment, setComment] = useState(formData.comment || "");
  const [wasJobSatisfactory, setWasJobSatisfactory] = useState(formData.wasJobSatisfactory || 0);
  const [wasJobFinishedOnTimeAndOnBudget, setWasJobFinishedOnTimeAndOnBudget] = useState(formData.wasJobFinishedOnTimeAndOnBudget || 0);
  const [wasAssociatePunctual, setWasAssociatePunctual] = useState(formData.wasAssociatePunctual || 0);
  const [wasAssociateProfessional, setWasAssociateProfessional] = useState(formData.wasAssociateProfessional || 0);
  const [wouldCustomerReferOurOrganization, setWouldCustomerReferOurOrganization] = useState(formData.wouldCustomerReferOurOrganization || 0);

  // Form submission handler
  const handleSubmit = useCallback(() => {
    let newErrors = {};
    let hasErrors = false;

    // Validation
    if (!wasSurveyConducted) {
      newErrors.wasSurveyConducted = "This field is required";
      hasErrors = true;
    }

    if (wasSurveyConducted === 1) {
      if (!wasJobSatisfactory) {
        newErrors.wasJobSatisfactory = "This field is required";
        hasErrors = true;
      }
      if (!wasJobFinishedOnTimeAndOnBudget) {
        newErrors.wasJobFinishedOnTimeAndOnBudget = "This field is required";
        hasErrors = true;
      }
      if (!wasAssociatePunctual) {
        newErrors.wasAssociatePunctual = "This field is required";
        hasErrors = true;
      }
      if (!wasAssociateProfessional) {
        newErrors.wasAssociateProfessional = "This field is required";
        hasErrors = true;
      }
      if (!wouldCustomerReferOurOrganization) {
        newErrors.wouldCustomerReferOurOrganization = "This field is required";
        hasErrors = true;
      }
    }

    if (wasSurveyConducted === 2) {
      if (!noSurveyConductedReason) {
        newErrors.noSurveyConductedReason = "This field is required";
        hasErrors = true;
      } else if (noSurveyConductedReason === 1 && !noSurveyConductedReasonOther) {
        newErrors.noSurveyConductedReasonOther = "This field is required";
        hasErrors = true;
      }
      if (!comment) {
        newErrors.comment = "This field is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    surveyStorage.updateState({
      wasSurveyConducted,
      noSurveyConductedReason,
      noSurveyConductedReasonOther,
      comment,
      wasJobSatisfactory,
      wasJobFinishedOnTimeAndOnBudget,
      wasAssociatePunctual,
      wasAssociateProfessional,
      wouldCustomerReferOurOrganization,
    });

    // Navigate to step 3
    navigate(`/admin/task/${tid}/survey/step-3`);
  }, [
    wasSurveyConducted, noSurveyConductedReason, noSurveyConductedReasonOther, comment,
    wasJobSatisfactory, wasJobFinishedOnTimeAndOnBudget, wasAssociatePunctual,
    wasAssociateProfessional, wouldCustomerReferOurOrganization,
    surveyStorage, navigate, tid
  ]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/survey/step-1`);
  }, [navigate, tid]);

  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    navigate(`/admin/task/${tid}`);
  }, [navigate, tid]);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "secondary",
      icon: XMarkIcon,
      onClick: handleCancel,
    },
    {
      label: "Save & Continue",
      variant: "primary",
      icon: ChevronRightIcon,
      iconPosition: "right",
      onClick: handleSubmit,
    },
  ], [handleCancel, handleSubmit]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={2}
        wizardTitle="Survey Task"
        wizardIcon={ClipboardDocumentCheckIcon}
        stepTitle="Survey Questions"
        stepSubtitle="Complete the survey questions for this task"
        stepIcon={QuestionMarkCircleIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={false}
        actions={actions}
        onBack={handleBack}
        backLabel="Back to Step 1"
        actionLayout="end"
      >
        {/* Survey Status Section */}
        <DetailCard
          title="Survey Status"
          icon={ClipboardDocumentCheckIcon}
          maxWidth="full"
          className="mb-6"
        >
          <div>
            <label className={`block text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-2`}>
              Was there a survey conducted?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} mb-3`}>
              Selecting 'Yes' will close this job as success
            </p>
            <div className="space-y-2">
              <RadioOption
                name="wasSurveyConducted"
                value={1}
                checked={wasSurveyConducted === 1}
                onChange={(e) => setWasSurveyConducted(parseInt(e.target.value))}
                label="Yes"
                themeClasses={themeClasses}
              />
              <RadioOption
                name="wasSurveyConducted"
                value={2}
                checked={wasSurveyConducted === 2}
                onChange={(e) => setWasSurveyConducted(parseInt(e.target.value))}
                label="No"
                themeClasses={themeClasses}
              />
            </div>
            {errors.wasSurveyConducted && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                {errors.wasSurveyConducted}
              </p>
            )}
          </div>
        </DetailCard>

        {/* Survey Questions - Show if Yes */}
        {wasSurveyConducted === 1 && (
          <DetailCard
            title="Survey Questions"
            icon={CheckCircleIcon}
            variant="success"
            maxWidth="full"
            className="mb-6"
          >
            <div className="space-y-4 sm:space-y-6">
              <YesNoRadioGroup
                name="wasJobSatisfactory"
                value={wasJobSatisfactory}
                onChange={setWasJobSatisfactory}
                label="Was the quality of the work satisfactory?"
                error={errors.wasJobSatisfactory}
                themeClasses={themeClasses}
              />
              <YesNoRadioGroup
                name="wasJobFinishedOnTimeAndOnBudget"
                value={wasJobFinishedOnTimeAndOnBudget}
                onChange={setWasJobFinishedOnTimeAndOnBudget}
                label="Was the work completed on time and on budget?"
                error={errors.wasJobFinishedOnTimeAndOnBudget}
                themeClasses={themeClasses}
              />
              <YesNoRadioGroup
                name="wasAssociatePunctual"
                value={wasAssociatePunctual}
                onChange={setWasAssociatePunctual}
                label="Was the Associate Member punctual?"
                error={errors.wasAssociatePunctual}
                themeClasses={themeClasses}
              />
              <YesNoRadioGroup
                name="wasAssociateProfessional"
                value={wasAssociateProfessional}
                onChange={setWasAssociateProfessional}
                label="Was the Associate Member professional?"
                error={errors.wasAssociateProfessional}
                themeClasses={themeClasses}
              />
              <YesNoRadioGroup
                name="wouldCustomerReferOurOrganization"
                value={wouldCustomerReferOurOrganization}
                onChange={setWouldCustomerReferOurOrganization}
                label="Would you refer Over55 to a friend or family member?"
                error={errors.wouldCustomerReferOurOrganization}
                themeClasses={themeClasses}
              />
            </div>
          </DetailCard>
        )}

        {/* No Survey Conducted - Show if No */}
        {wasSurveyConducted === 2 && (
          <DetailCard
            title="No Survey Conducted"
            icon={XCircleIcon}
            variant="warning"
            maxWidth="full"
            className="mb-6"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Reason Select */}
              <div>
                <label className={`block text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                  Please select why the survey was not conducted
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={noSurveyConductedReason}
                  onChange={(e) => setNoSurveyConductedReason(parseInt(e.target.value))}
                  className={`block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%23374151%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] pr-10 ${
                    errors.noSurveyConductedReason
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  {NO_SURVEY_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.noSurveyConductedReason && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                    {errors.noSurveyConductedReason}
                  </p>
                )}
              </div>

              {/* Other Reason Input */}
              {noSurveyConductedReason === 1 && (
                <div>
                  <label
                    htmlFor="noSurveyConductedReasonOther"
                    className={`block text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}
                  >
                    Please specify the reason
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="noSurveyConductedReasonOther"
                    name="noSurveyConductedReasonOther"
                    type="text"
                    autoComplete="off"
                    value={noSurveyConductedReasonOther}
                    onChange={(e) => setNoSurveyConductedReasonOther(e.target.value)}
                    placeholder="Enter the specific reason..."
                    className={`mt-1 block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors ${
                      errors.noSurveyConductedReasonOther
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {errors.noSurveyConductedReasonOther && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                      {errors.noSurveyConductedReasonOther}
                    </p>
                  )}
                </div>
              )}

              {/* Comment Textarea */}
              <div>
                <label className={`block text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                  Comment
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write any additional comments here..."
                  rows={5}
                  className={`mt-1 block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors ${
                    errors.comment
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
                <p className={`mt-1 text-xs ${themeClasses.textSecondary}`}>
                  Include any additional information here.
                </p>
                {errors.comment && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                    {errors.comment}
                  </p>
                )}
              </div>
            </div>
          </DetailCard>
        )}
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        icon={ExclamationCircleIcon}
        iconColor="yellow"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCancelWarning(false)}>
              No, Keep Working
            </Button>
            <Button variant="success" onClick={handleConfirmCancel}>
              Yes, Cancel
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Your survey responses will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </>
  );
});

function AdminTaskItemSurveyStep2Page() {
  return <Step2Content />;
}

export default AdminTaskItemSurveyStep2Page;
