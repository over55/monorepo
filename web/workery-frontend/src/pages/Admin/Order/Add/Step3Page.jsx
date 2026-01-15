// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step3Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep3Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  useUIXTheme,
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

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const existingOrder = orderCreationStorage.getOrderCreation();

  // Form fields
  const [description, setDescription] = useState(existingOrder?.description || "");
  const [skillSets, setSkillSets] = useState(existingOrder?.skillSets || []);
  const [additionalComment, setAdditionalComment] = useState(existingOrder?.additionalComment || "");
  const [tags, setTags] = useState(existingOrder?.tags || []);

  // Check authentication and order state
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
  }, [authManager, navigate, existingOrder]);

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

  // Stable onChange handlers
  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    if (errors.description && value.trim() !== "") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  }, [errors.description]);

  const handleSkillSetsChange = useCallback((value) => {
    setSkillSets(value);
    if (errors.skillSets && value.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.skillSets;
        return newErrors;
      });
    }
  }, [errors.skillSets]);

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
          {/* Job Description Section */}
          <FormCard
            title="Job Description"
            subtitle="Describe the work that needs to be done"
            icon={DocumentTextIcon}
            maxWidth="7xl"
          >
            <Textarea
              label="Describe the Job"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe the work that needs to be done..."
              maxLength={1000}
              rows={4}
              required
              error={errors.description}
              helperText={`${description.length}/1000 characters`}
            />
          </FormCard>

          {/* Skills Section */}
          <FormCard
            title="Required Skills"
            subtitle="Select the skill sets required for this job"
            icon={AcademicCapIcon}
            maxWidth="7xl"
          >
            <SkillSetsMultiSelect
              value={skillSets}
              onChange={handleSkillSetsChange}
              error={errors.skillSets}
              required={true}
              label="Required Job Skills"
              placeholder="Select required skill sets..."
              helperText="Pick at least one skill set that is required for this job"
              onUnauthorized={() => navigate("/login?unauthorized=true")}
            />
          </FormCard>

          {/* Tags Section */}
          <FormCard
            title="Tags"
            subtitle="Categorize this order with tags"
            icon={TagIcon}
            maxWidth="7xl"
          >
            <TagsMultiSelect
              value={tags}
              onChange={handleTagsChange}
              error={errors.tags}
              required={false}
              label="Tags (Optional)"
              placeholder="Select tags..."
              helperText="Pick any tags you would like to associate with this order"
              onUnauthorized={() => navigate("/login?unauthorized=true")}
            />
          </FormCard>

          {/* Additional Comments Section */}
          <FormCard
            title="Additional Comments"
            subtitle="Any extra information or special instructions"
            icon={ChatBubbleLeftRightIcon}
            maxWidth="7xl"
          >
            <Textarea
              label="Additional Comments (Optional)"
              value={additionalComment}
              onChange={handleAdditionalCommentChange}
              placeholder="Any additional comments or special instructions..."
              maxLength={1000}
              rows={4}
              helperText={`${additionalComment.length}/1000 characters`}
            />
          </FormCard>
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Your Order record will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
