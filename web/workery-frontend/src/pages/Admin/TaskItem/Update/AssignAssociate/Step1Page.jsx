// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step1Page.jsx
// @uix-page: TaskItemAssignAssociateStep1
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../../components/business/displays";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import { formatPhoneNumber } from "../../../../../utils/phoneFormat";
import {
  ChevronRightIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  DetailCard,
  Button,
  Alert,
  useUIXTheme,
} from "../../../../../components/UIX";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details" },
  { title: "Search", description: "Find Associate" },
  { title: "Assign", description: "Select Associate" },
  { title: "Confirm", description: "Complete Assignment" },
]);

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, fullWidth = false, themeClasses }) {
  return (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-1.5`}>
        {label}
      </dt>
      <dd className={`text-lg sm:text-xl font-medium ${themeClasses.textPrimary} break-words`}>
        {value || "-"}
      </dd>
    </div>
  );
});

// Memoized content component
const Step1Content = memo(function Step1Content() {
  // URL Parameters
  const { tid } = useParams();
  const navigate = useNavigate();

  // Services
  const taskManager = useTaskManager();

  // UIX Theme
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    textMuted: getThemeClasses("text-muted") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
    borderLight: getThemeClasses("border-light") || "border-gray-200",
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

  // Helper function to extract IDs from array of objects
  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "number" || typeof item === "string") {
          return item;
        }
        return item.id || item.value || item.skillSetId || item.tagId;
      })
      .filter(Boolean);
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
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching task:", error);
          setErrors({ message: error.message || "Failed to load task details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid, taskManager, onUnauthorized]);

  // Handle navigation when forceURL is set
  useEffect(() => {
    if (forceURL !== "") {
      navigate(forceURL);
    }
  }, [forceURL, navigate]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate("/admin/tasks");
  }, [navigate]);

  const handleCloseTask = useCallback(() => {
    navigate(`/admin/task/${tid}/close`);
  }, [navigate, tid]);

  const handleBeginAssignment = useCallback(() => {
    navigate(`/admin/task/${tid}/assign-associate/step-2`);
  }, [navigate, tid]);

  // Action buttons
  const actions = useMemo(() => {
    if (!task || task.isClosed) return [];

    return [
      {
        label: "Close Task",
        variant: "danger",
        icon: XMarkIcon,
        onClick: handleCloseTask,
        disabled: task.status === 2,
      },
      {
        label: "Begin Assignment",
        variant: "primary",
        icon: ChevronRightIcon,
        onClick: handleBeginAssignment,
        disabled: task.status === 2,
      },
    ];
  }, [task, handleCloseTask, handleBeginAssignment]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Assign Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Review Task Details"
      stepSubtitle="Review the task information before selecting an associate"
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Tasks"
      actionLayout="end"
    >
      {/* Status Alert for closed tasks */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert
          type="info"
          message="This task is archived / closed"
          className="mb-6"
        />
      )}

      {task && (
        <div className="space-y-6">
          {/* Task Information Section */}
          <DetailCard
            title="Task Information"
            icon={ClipboardDocumentListIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Task Type"
                value={task.title}
                themeClasses={themeClasses}
              />
              <DetailField
                label="Description"
                value={task.description}
                themeClasses={themeClasses}
              />
            </dl>
          </DetailCard>

          {/* Job Information Section */}
          <DetailCard
            title="Job Information"
            icon={BriefcaseIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Job #"
                value={
                  <Link
                    to={`/admin/order/${task.orderWjid}`}
                    className={themeClasses.linkPrimary}
                  >
                    {task.orderWjid}
                  </Link>
                }
                themeClasses={themeClasses}
              />
              <DetailField
                label="Start Date"
                value={
                  task.orderStartDate
                    ? new Date(task.orderStartDate).toLocaleDateString()
                    : "-"
                }
                themeClasses={themeClasses}
              />
              <DetailField
                label="Job Description"
                value={task.orderDescription}
                fullWidth
                themeClasses={themeClasses}
              />
            </dl>
          </DetailCard>

          {/* Skills and Tags Section */}
          <DetailCard
            title="Requirements"
            icon={WrenchScrewdriverIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <SkillSetsDisplay
                  values={extractIds(task.orderSkillSets)}
                  onUnauthorized={onUnauthorized}
                  variant="primary"
                  label="Required Skill Sets"
                  size="lg"
                />
              </div>
              <div>
                <TagsDisplay
                  values={extractIds(task.orderTags)}
                  onUnauthorized={onUnauthorized}
                  variant="success"
                  label="Job Tags"
                  size="lg"
                />
              </div>
            </dl>
          </DetailCard>

          {/* Client Information Section */}
          <DetailCard
            title="Client Information"
            icon={UserIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Client Name"
                value={
                  <Link
                    to={`/admin/customer/${task.customerId}`}
                    className={themeClasses.linkPrimary}
                  >
                    {task.customerName}
                  </Link>
                }
                themeClasses={themeClasses}
              />
              {task.customerPhone && (
                <DetailField
                  label={`Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                  value={
                    <a href={`tel:${task.customerPhone}`} className={themeClasses.linkPrimary}>
                      {formatPhoneNumber(task.customerPhone, task.customerPhoneExtension)}
                    </a>
                  }
                  themeClasses={themeClasses}
                />
              )}
              {task.customerFullAddressUrl && (
                <DetailField
                  label="Client Address"
                  value={
                    <a
                      href={task.customerFullAddressUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={themeClasses.linkPrimary}
                    >
                      {task.customerFullAddressWithoutPostalCode}
                    </a>
                  }
                  fullWidth
                  themeClasses={themeClasses}
                />
              )}
              <div className="lg:col-span-2">
                <TagsDisplay
                  values={extractIds(task.customerTags)}
                  onUnauthorized={onUnauthorized}
                  variant="info"
                  label="Client Tags"
                  size="lg"
                />
              </div>
            </dl>
          </DetailCard>

          {/* Comments Link */}
          <div className={`pt-5 border-t ${themeClasses.borderLight}`}>
            <div className="flex items-center justify-between">
              <label className={`text-base sm:text-lg font-medium ${themeClasses.textSecondary} flex items-center`}>
                <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2.5" />
                Comments
              </label>
              <Link
                to={`/admin/order/${task.orderWjid}/comments`}
                className={`text-base sm:text-lg ${themeClasses.linkPrimary}`}
              >
                View all comments →
              </Link>
            </div>
          </div>
        </div>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemAssignAssociateStep1Page() {
  return <Step1Content />;
}

export default AdminTaskItemAssignAssociateStep1Page;
