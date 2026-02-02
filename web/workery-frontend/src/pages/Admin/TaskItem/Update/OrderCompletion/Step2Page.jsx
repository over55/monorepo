// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step2Page.jsx
// @uix-page: TaskItemOrderCompletionStep2
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Navigate, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Modal,
  useUIXTheme,
} from "../../../../../components/UIX";
import { TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../constants/FieldOptions";
import {
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  HashtagIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Status", description: "Completion Status" },
  { title: "Financials", description: "Invoice Details" },
  { title: "Comments", description: "Add Notes" },
  { title: "Submit", description: "Review & Complete" },
]);

// Memoized Radio Option component
const RadioOption = memo(function RadioOption({
  isSelected,
  onClick,
  icon: Icon,
  label,
  description,
  colorScheme = "green",
  name,
  value,
  onChange
}) {
  const colorClasses = {
    green: {
      selected: "border-green-500 bg-green-50",
      icon: isSelected ? "text-green-600" : "text-gray-400",
      radio: "text-green-600 focus:ring-green-500"
    },
    red: {
      selected: "border-red-500 bg-red-50",
      icon: isSelected ? "text-red-600" : "text-gray-400",
      radio: "text-red-600 focus:ring-red-500"
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <div
      className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
        isSelected ? colors.selected : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className={`w-6 h-6 mr-3 ${colors.icon}`} />
        <div className="flex-1">
          <label className="font-medium text-gray-900 cursor-pointer">{label}</label>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={onChange}
          className={`h-4 w-4 ${colors.radio}`}
        />
      </div>
    </div>
  );
});

// Memoized content component
const Step2Content = memo(function Step2Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    inputBorder: getThemeClasses("input-border") || "border-gray-300",
    inputFocus: getThemeClasses("input-focus") || "focus:ring-blue-500 focus:border-blue-500",
  }), [getThemeClasses]);

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form state from storage
  const savedState = orderCompletionStorage.getState();

  // Initialize completionDate as string - handle legacy Date objects
  const initializeCompletionDate = () => {
    if (!savedState.completionDate) return "";
    const date = savedState.completionDate;
    // Handle legacy Date objects
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    // Handle ISO datetime strings
    if (typeof date === "string" && date.includes("T")) {
      return date.slice(0, 10);
    }
    // Return YYYY-MM-DD strings as-is
    return date;
  };

  const [wasCompleted, setWasCompleted] = useState(savedState.wasCompleted);
  const [reason, setReason] = useState(savedState.reason);
  const [reasonOther, setReasonOther] = useState(savedState.reasonOther);
  const [completionDate, setCompletionDate] = useState(initializeCompletionDate());
  const [closingReasonComment, setClosingReasonComment] = useState(savedState.closingReasonComment);
  const [reasonComment, setReasonComment] = useState(savedState.reasonComment);
  const [visits, setVisits] = useState(savedState.visits);

  // Event handling
  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

  // Load task details
  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (mounted) setTask(taskData);
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors({ message: error.message || "Failed to load task details" });
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchTask();
    return () => { mounted = false; };
  }, [tid, taskManager, onUnauthorized]);

  // Handlers
  const handleWasCompletedChange = useCallback((value) => {
    setWasCompleted(parseInt(value));
    setCompletionDate("");
    setReasonComment("");
    setReason(0);
    setReasonOther("");
    setClosingReasonComment("");
  }, []);

  const handleCompletionDateChange = useCallback((e) => {
    const value = e.target.value;
    if (!value) {
      // If date is cleared, set to empty string
      setCompletionDate("");
      setReasonComment("");
      return;
    }
    // Store date as string (YYYY-MM-DD format)
    setCompletionDate(value);
    setReasonComment(`Job completed by Associate on ${value}.`);
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors = {};

    if (!wasCompleted) {
      newErrors.wasCompleted = "Please select whether the job was completed";
    }

    if (wasCompleted === 1) {
      if (!completionDate) {
        newErrors.completionDate = "Completion date is required";
      }
      if (!reasonComment) newErrors.reasonComment = "Reason comment is required";
      if (!visits || visits <= 0) newErrors.visits = "Number of visits is required";
    }

    if (wasCompleted === 2) {
      if (!reason) newErrors.reason = "Cancellation reason is required";
      if (reason === 1 && !reasonOther) newErrors.reasonOther = "Please specify the other reason";
      if (!closingReasonComment) newErrors.closingReasonComment = "Closing reason comment is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    orderCompletionStorage.updateState({
      wasCompleted,
      reason,
      reasonOther,
      completionDate,
      reasonComment,
      closingReasonComment,
      visits: parseInt(visits),
    });

    navigate(`/admin/task/${tid}/order-completion/step-3`);
  }, [wasCompleted, completionDate, reasonComment, visits, reason, reasonOther, closingReasonComment, orderCompletionStorage, navigate, tid]);

  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/order-completion/step-1`);
  }, [navigate, tid]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    navigate(`/admin/task/${tid}`);
  }, [navigate, tid]);

  // Action buttons
  const actions = useMemo(() => [{
    label: "Save & Continue",
    variant: "primary",
    icon: ArrowRightIcon,
    iconPosition: "right",
    onClick: handleSubmit,
  }], [handleSubmit]);

  // Redirect if needed (after all hooks)
  if (forceURL !== "") return <Navigate to={forceURL} />;

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={2}
        wizardTitle="Order Completion"
        wizardIcon={ClipboardDocumentCheckIcon}
        stepTitle="Completion Status"
        stepSubtitle="Provide completion status and details"
        stepIcon={DocumentTextIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={isFetching}
        actions={actions}
        onBack={handleBack}
        backLabel="Back to Step 1"
        actionLayout="end"
      >
        {/* Status Alert */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <Alert type="info" message="This task is archived / closed" className="mb-6" />
        )}

        <div className="space-y-6">
          {/* Completion Status Selection */}
          <DetailCard title="Completion Status" icon={ClipboardDocumentCheckIcon} maxWidth="full">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-3`}>
                Did the Associate successfully complete the job?
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <RadioOption
                  isSelected={wasCompleted === 1}
                  onClick={() => handleWasCompletedChange("1")}
                  icon={CheckCircleIcon}
                  label="Yes, Completed"
                  description="Job was successfully finished"
                  colorScheme="green"
                  name="wasCompleted"
                  value="1"
                  onChange={(e) => handleWasCompletedChange(e.target.value)}
                />
                <RadioOption
                  isSelected={wasCompleted === 2}
                  onClick={() => handleWasCompletedChange("2")}
                  icon={XCircleIcon}
                  label="No, Not Completed"
                  description="Job was cancelled or incomplete"
                  colorScheme="red"
                  name="wasCompleted"
                  value="2"
                  onChange={(e) => handleWasCompletedChange(e.target.value)}
                />
              </div>

              {errors.wasCompleted && (
                <p className="mt-2 text-sm text-red-600">{errors.wasCompleted}</p>
              )}
            </div>
          </DetailCard>

          {/* Completion Details - If job was completed */}
          {wasCompleted === 1 && (
            <DetailCard
              title="Completion Details"
              icon={CheckCircleIcon}
              maxWidth="full"
              variant="success"
            >
              <div className="space-y-4 sm:space-y-6">
                {/* Completion Date */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                    Completion Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={completionDate}
                      onChange={handleCompletionDateChange}
                      max={new Date().toISOString().slice(0, 10)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                        errors.completionDate ? "border-red-300" : themeClasses.inputBorder
                      }`}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.completionDate && (
                    <p className="mt-2 text-sm text-red-600">{errors.completionDate}</p>
                  )}
                </div>

                {/* Reason Comment */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                    Completion Comment <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={reasonComment}
                      onChange={(e) => setReasonComment(e.target.value)}
                      rows={4}
                      disabled={!completionDate}
                      placeholder="Write details for the completion..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                        errors.reasonComment ? "border-red-300" : themeClasses.inputBorder
                      } ${!completionDate ? "bg-gray-50" : ""}`}
                    />
                    <ChatBubbleBottomCenterTextIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.reasonComment && (
                    <p className="mt-2 text-sm text-red-600">{errors.reasonComment}</p>
                  )}
                </div>

                {/* Number of Visits */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                    Number of Visits <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={visits}
                      onChange={(e) => setVisits(e.target.value)}
                      min="1"
                      placeholder="Enter number of visits"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                        errors.visits ? "border-red-300" : themeClasses.inputBorder
                      }`}
                    />
                    <HashtagIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.visits && (
                    <p className="mt-2 text-sm text-red-600">{errors.visits}</p>
                  )}
                </div>
              </div>
            </DetailCard>
          )}

          {/* Cancellation Details - If job was not completed */}
          {wasCompleted === 2 && (
            <DetailCard
              title="Cancellation Details"
              icon={XCircleIcon}
              maxWidth="full"
              variant="danger"
            >
              <div className="space-y-4 sm:space-y-6">
                {/* Cancellation Reason */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(parseInt(e.target.value))}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                      errors.reason ? "border-red-300" : themeClasses.inputBorder
                    }`}
                  >
                    {TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Other Reason */}
                {reason === 1 && (
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                      Specify Other Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reasonOther}
                      onChange={(e) => setReasonOther(e.target.value)}
                      placeholder="Please specify..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                        errors.reasonOther ? "border-red-300" : themeClasses.inputBorder
                      }`}
                    />
                    {errors.reasonOther && (
                      <p className="mt-2 text-sm text-red-600">{errors.reasonOther}</p>
                    )}
                  </div>
                )}

                {/* Closing Reason Comment */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                    Closing Comment <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={closingReasonComment}
                      onChange={(e) => setClosingReasonComment(e.target.value)}
                      rows={4}
                      placeholder="Write any additional comments here..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm ${themeClasses.inputFocus} sm:text-sm ${
                        errors.closingReasonComment ? "border-red-300" : themeClasses.inputBorder
                      }`}
                    />
                    <ChatBubbleBottomCenterTextIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.closingReasonComment && (
                    <p className="mt-2 text-sm text-red-600">{errors.closingReasonComment}</p>
                  )}
                </div>
              </div>
            </DetailCard>
          )}
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        icon={ExclamationTriangleIcon}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowCancelWarning(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              No, Keep Working
            </button>
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto"
            >
              Yes, Cancel
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Your order completion progress will be lost and you will be returned to the task detail page.
          This cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </>
  );
});

function AdminTaskItemOrderCompletionStep2Page() {
  return <Step2Content />;
}

export default AdminTaskItemOrderCompletionStep2Page;
