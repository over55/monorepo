// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step3Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep3Page

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Textarea,
  UIXThemeProvider,
} from "../../../../components/UIX";
import {
  SkillSetsMultiSelect,
  TagsMultiSelect,
} from "../../../../components/business/selects";
import {
  PlusCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Details" },
  { title: "Skills" },
  { title: "Review" },
];

// Isolated memoized form sections to prevent re-renders when other fields change
const DescriptionSection = memo(function DescriptionSection({ value, onChange, error }) {
  return (
    <FormCard
      title="Job Description"
      subtitle="Describe the work that needs to be done"
      icon={DocumentTextIcon}
      maxWidth="7xl"
    >
      <Textarea
        label="Describe the Job"
        value={value}
        onChange={onChange}
        placeholder="Describe the work that needs to be done..."
        maxLength={1000}
        rows={4}
        required
        error={error}
        showCharacterCount
      />
    </FormCard>
  );
});
DescriptionSection.displayName = 'DescriptionSection';

const SkillsSection = memo(function SkillsSection({ value, onChange, error, onUnauthorized }) {
  return (
    <FormCard
      title="Required Skills"
      subtitle="Select the skill sets required for this job"
      icon={AcademicCapIcon}
      maxWidth="7xl"
    >
      <SkillSetsMultiSelect
        value={value}
        onChange={onChange}
        error={error}
        required={true}
        label="Required Job Skills"
        placeholder="Select required skill sets..."
        helperText="Pick at least one skill set that is required for this job"
        onUnauthorized={onUnauthorized}
      />
    </FormCard>
  );
});
SkillsSection.displayName = 'SkillsSection';

const TagsSection = memo(function TagsSection({ value, onChange, error, onUnauthorized }) {
  return (
    <FormCard
      title="Tags"
      subtitle="Categorize this order with tags"
      icon={TagIcon}
      maxWidth="7xl"
    >
      <TagsMultiSelect
        value={value}
        onChange={onChange}
        error={error}
        required={false}
        label="Tags (Optional)"
        placeholder="Select tags..."
        helperText="Pick any tags you would like to associate with this order"
        onUnauthorized={onUnauthorized}
      />
    </FormCard>
  );
});
TagsSection.displayName = 'TagsSection';

const AdditionalCommentsSection = memo(function AdditionalCommentsSection({ value, onChange }) {
  return (
    <FormCard
      title="Additional Comments"
      subtitle="Any extra information or special instructions"
      icon={ChatBubbleLeftRightIcon}
      maxWidth="7xl"
    >
      <Textarea
        label="Additional Comments (Optional)"
        value={value}
        onChange={onChange}
        placeholder="Any additional comments or special instructions..."
        maxLength={1000}
        rows={4}
        showCharacterCount
      />
    </FormCard>
  );
});
AdditionalCommentsSection.displayName = 'AdditionalCommentsSection';

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state - use ref to avoid re-fetching on every render
  const existingOrderRef = useRef(orderCreationStorage.getOrderCreation());
  const existingOrder = existingOrderRef.current;

  // Form fields
  const [description, setDescription] = useState(existingOrder?.description || "");
  const [skillSets, setSkillSets] = useState(existingOrder?.skillSets || []);
  const [additionalComment, setAdditionalComment] = useState(existingOrder?.additionalComment || "");
  const [tags, setTags] = useState(existingOrder?.tags || []);

  // Check authentication and order state - only on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    if (!existingOrder || !existingOrder.customerId) {
      navigate("/admin/orders/add/step-1-search");
      return;
    }

    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle form submission
  const handleNext = useCallback(() => {
    let newErrors = {};
    let hasErrors = false;

    if (!description || description.trim() === "") {
      newErrors.description = "Description is required";
      hasErrors = true;
    }

    if (!skillSets || skillSets.length === 0) {
      newErrors.skillSets = "Please select at least one skill set";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Update order state
    const updatedOrder = {
      ...existingOrder,
      description: description,
      skillSets: skillSets,
      additionalComment: additionalComment,
      tags: tags,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-4");
  }, [description, skillSets, additionalComment, tags, existingOrder, orderCreationStorage, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders");
  }, [orderCreationStorage, navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/orders/add/step-2");
  }, [navigate]);

  // Stable unauthorized handler
  const handleUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Stable onChange handlers - use functional updates to avoid dependency on errors
  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    if (value.trim() !== "") {
      setErrors((prev) => {
        if (prev.description) {
          const newErrors = { ...prev };
          delete newErrors.description;
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const handleSkillSetsChange = useCallback((value) => {
    setSkillSets(value);
    if (value.length > 0) {
      setErrors((prev) => {
        if (prev.skillSets) {
          const newErrors = { ...prev };
          delete newErrors.skillSets;
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const handleTagsChange = useCallback((value) => {
    setTags(value);
  }, []);

  const handleAdditionalCommentChange = useCallback((value) => {
    setAdditionalComment(value);
  }, []);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: isLoading ? "Saving..." : "Continue",
      variant: "primary",
      onClick: handleNext,
      disabled: isLoading,
      loading: isLoading,
    },
  ], [handleCancel, handleNext, isLoading]);

  if (!existingOrder) {
    return (
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={3}
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Skills & Description"
        stepSubtitle="Loading..."
        stepIcon={DocumentTextIcon}
        isLoading={true}
      />
    );
  }

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={3}
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Skills & Description"
        stepSubtitle="Provide details about the work requirements"
        stepIcon={DocumentTextIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={isLoading}
        actions={actions}
        onCancel={handleCancel}
        onBack={handleBack}
        actionLayout="end"
      >
        <div className="space-y-8">
          {/* Each section is memoized to prevent re-renders when other fields change */}
          <DescriptionSection
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
          />
          <SkillsSection
            value={skillSets}
            onChange={handleSkillSetsChange}
            error={errors.skillSets}
            onUnauthorized={handleUnauthorized}
          />
          <TagsSection
            value={tags}
            onChange={handleTagsChange}
            error={errors.tags}
            onUnauthorized={handleUnauthorized}
          />
          <AdditionalCommentsSection
            value={additionalComment}
            onChange={handleAdditionalCommentChange}
          />
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-200">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-6 sm:px-8 py-5">
              <p className="text-base sm:text-lg text-gray-600">
                Your Order record will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-4 rounded-b-xl">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Step3Content.displayName = 'Step3Content';

function AdminOrderAddStep3Page() {
  return (
    <UIXThemeProvider>
      <Step3Content />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep3Page;
