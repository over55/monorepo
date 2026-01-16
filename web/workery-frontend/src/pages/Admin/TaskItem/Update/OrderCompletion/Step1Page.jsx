// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step1Page.jsx
// @uix-page: TaskItemOrderCompletionStep1
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Button,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../constants/FieldOptions";
import {
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details" },
  { title: "Status", description: "Completion Status" },
  { title: "Financials", description: "Invoice Details" },
  { title: "Comments", description: "Add Notes" },
  { title: "Submit", description: "Review & Complete" },
]);

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, icon: Icon, fullWidth = false, themeClasses }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1 flex items-center`}>
        {Icon && <Icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 text-gray-400" />}
        {label}
      </dt>
      <dd className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary} break-words`}>
        {value || "-"}
      </dd>
    </div>
  );
});

// Memoized Tag Display
const TagDisplay = memo(function TagDisplay({ tags, label, variant = "gray" }) {
  if (!tags || tags.length === 0) {
    return <span className="text-sm text-gray-500">-</span>;
  }

  const variantClasses = {
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
        >
          {variant === "gray" && <TagIcon className="w-3 h-3 mr-1" />}
          {tag.subCategory || tag.text}
        </span>
      ))}
    </div>
  );
});

// Memoized content component
const Step1Content = memo(function Step1Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
  }), [getThemeClasses]);

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

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

        if (mounted) {
          setTask(taskData);

          // Initialize order completion storage with task data if needed
          const currentState = orderCompletionStorage.getState();
          if (!currentState.invoiceIDs) {
            orderCompletionStorage.updateState({
              invoiceIDs: taskData.orderWjid,
              invoiceServiceFeeID: taskData.associateServiceFeeID || "",
              invoiceServiceFeePercentage: taskData.associateServiceFeePercentage || 0,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors({ message: error.message || "Failed to load task details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchTask();
    return () => { mounted = false; };
  }, [tid, taskManager, onUnauthorized, orderCompletionStorage]);

  // Navigation handlers
  const handleBegin = useCallback(() => {
    navigate(`/admin/task/${tid}/order-completion/step-2`);
  }, [navigate, tid]);

  const handleBack = useCallback(() => {
    navigate("/admin/tasks");
  }, [navigate]);

  // Redirect if needed
  if (forceURL !== "") return <Navigate to={forceURL} />;

  // Action buttons
  const actions = useMemo(() => {
    if (task?.isClosed) return [];

    return [
      {
        label: "Close Task",
        variant: "danger",
        icon: XMarkIcon,
        onClick: () => navigate(`/admin/task/${tid}/close`),
      },
      {
        label: "Postpone",
        variant: "warning",
        icon: ClockIcon,
        onClick: () => navigate(`/admin/task/${tid}/postpone`),
      },
      {
        label: "Begin",
        variant: "primary",
        icon: ArrowRightIcon,
        iconPosition: "right",
        onClick: handleBegin,
      },
    ];
  }, [task?.isClosed, navigate, tid, handleBegin]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Order Completion"
      wizardIcon={ClipboardDocumentCheckIcon}
      stepTitle="Review Task Details"
      stepSubtitle="Review the task information before proceeding"
      stepIcon={DocumentTextIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching || !task}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Tasks"
      actionLayout="end"
    >
      {/* Status Alert */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info" message="This task is archived / closed" className="mb-6" />
      )}

      {task && (
        <div className="space-y-6">
          {/* Task Information */}
          <DetailCard
            title="Task Information"
            icon={ClipboardDocumentCheckIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DetailField label="Type" value={task.title} themeClasses={themeClasses} />
              <DetailField
                label="Job #"
                value={
                  <Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>
                    {task.orderWjid}
                  </Link>
                }
                themeClasses={themeClasses}
              />
              <DetailField label="Description" value={task.description} fullWidth themeClasses={themeClasses} />
              <DetailField label="Job Description" value={task.orderDescription} fullWidth themeClasses={themeClasses} />
            </dl>
          </DetailCard>

          {/* Job Details */}
          <DetailCard title="Job Details" icon={BriefcaseIcon} maxWidth="full">
            <div className="space-y-4">
              <div>
                <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                  Skill Sets
                </dt>
                <dd>
                  <TagDisplay tags={task.orderSkillSets} variant="blue" />
                </dd>
              </div>
              <div>
                <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                  Tags
                </dt>
                <dd>
                  <TagDisplay tags={task.orderTags} variant="gray" />
                </dd>
              </div>
            </div>
          </DetailCard>

          {/* Client Information */}
          <DetailCard title="Client Information" icon={UserIcon} maxWidth="full">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Name"
                value={
                  <Link to={`/admin/customer/${task.customerId}`} className={themeClasses.linkPrimary}>
                    {task.customerName}
                  </Link>
                }
                themeClasses={themeClasses}
              />
              {task.customerPhone && (
                <DetailField
                  label={`Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                  icon={PhoneIcon}
                  value={
                    <>
                      {task.customerPhone}
                      {task.customerPhoneExtension && ` x${task.customerPhoneExtension}`}
                    </>
                  }
                  themeClasses={themeClasses}
                />
              )}
              {task.customerFullAddressWithoutPostalCode && (
                <DetailField
                  label="Address"
                  icon={MapPinIcon}
                  value={task.customerFullAddressWithoutPostalCode}
                  fullWidth
                  themeClasses={themeClasses}
                />
              )}
              {task.customerTags?.length > 0 && (
                <div className="md:col-span-2">
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                    Tags
                  </dt>
                  <dd>
                    <TagDisplay tags={task.customerTags} variant="gray" />
                  </dd>
                </div>
              )}
            </dl>
          </DetailCard>

          {/* Associate Information */}
          <DetailCard title="Associate Information" icon={WrenchScrewdriverIcon} maxWidth="full">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Name"
                value={
                  <Link to={`/admin/associate/${task.associateId}`} className={themeClasses.linkPrimary}>
                    {task.associateName}
                  </Link>
                }
                themeClasses={themeClasses}
              />
              {task.associatePhone && (
                <DetailField
                  label={`Phone (${ASSOCIATE_PHONE_TYPE_OF_MAP[task.associatePhoneType]})`}
                  icon={PhoneIcon}
                  value={
                    <>
                      {task.associatePhone}
                      {task.associatePhoneExtension && ` x${task.associatePhoneExtension}`}
                    </>
                  }
                  themeClasses={themeClasses}
                />
              )}
              {task.associateFullAddressWithoutPostalCode && (
                <DetailField
                  label="Address"
                  icon={MapPinIcon}
                  value={task.associateFullAddressWithoutPostalCode}
                  fullWidth
                  themeClasses={themeClasses}
                />
              )}
              {task.associateTags?.length > 0 && (
                <div className="md:col-span-2">
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                    Tags
                  </dt>
                  <dd>
                    <TagDisplay tags={task.associateTags} variant="gray" />
                  </dd>
                </div>
              )}
            </dl>
          </DetailCard>

          {/* Additional Information */}
          <DetailCard title="Additional Information" icon={InformationCircleIcon} maxWidth="full">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Comments"
                value={
                  <Link
                    to={`/admin/order/${task.orderWjid}/comments`}
                    className={`${themeClasses.linkPrimary} flex items-center`}
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                    View comments
                  </Link>
                }
                themeClasses={themeClasses}
              />
              <DetailField
                label="Task Created At"
                icon={CalendarIcon}
                value={task.createdAt ? new Date(task.createdAt).toLocaleString() : "-"}
                themeClasses={themeClasses}
              />
            </dl>
          </DetailCard>
        </div>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemOrderCompletionStep1Page() {
  return <Step1Content />;
}

export default AdminTaskItemOrderCompletionStep1Page;
