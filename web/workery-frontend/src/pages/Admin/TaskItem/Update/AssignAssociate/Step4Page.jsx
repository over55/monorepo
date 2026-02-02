// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step4Page.jsx
// @uix-page: TaskItemAssignAssociateStep4
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Button,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../../components/business/displays";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import { formatPhoneNumber } from "../../../../../utils/phoneFormat";
import {
  DocumentCheckIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Search", description: "Find Associate", isCompleted: true },
  { title: "Assign", description: "Select Associate", isCompleted: true },
  { title: "Confirm", description: "Complete Assignment" },
]);

// Status map
const ASSIGN_STATUS_MAP = Object.freeze({
  3: "Yes - Accepted",
  4: "No - Declined",
});

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, fullWidth = false, icon: Icon = null, themeClasses }) {
  return (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-1.5 flex items-center`}>
        {Icon && <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-1.5" />}
        {label}
      </dt>
      <dd className={`text-lg sm:text-xl font-medium ${themeClasses.textPrimary} break-words`}>
        {value || "-"}
      </dd>
    </div>
  );
});

// Memoized content component
const Step4Content = memo(function Step4Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
    borderLight: getThemeClasses("border-light") || "border-gray-200",
  }), [getThemeClasses]);

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [assignmentData, setAssignmentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event handling
  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

  // Helper function to extract IDs
  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => {
      if (typeof item === "number" || typeof item === "string") return item;
      return item.id || item.value || item.skillSetId || item.tagId;
    }).filter(Boolean);
  }, []);

  // Load task details and assignment data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      const storedData = sessionStorage.getItem(STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA);
      if (!storedData) {
        setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
        return;
      }

      setAssignmentData(JSON.parse(storedData));
      setFetching(true);
      setErrors({});

      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (mounted) setTask(taskData);
      } catch (error) {
        if (mounted) {
          console.error("Error fetching task:", error);
          setErrors({ message: error.message || "Failed to load task details" });
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [tid, taskManager, onUnauthorized]);

  // Handle navigation when forceURL is set
  useEffect(() => {
    if (forceURL !== "") {
      navigate(forceURL);
    }
  }, [forceURL, navigate]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!assignmentData) {
      setErrors({ message: "Assignment data not found" });
      return;
    }

    const payload = {
      task_id: tid,
      task_item_id: tid,
      associate_id: assignmentData.associateID,
      status: assignmentData.status,
      how_was_job_accepted: assignmentData.howWasJobAccepted,
      why_job_declined: assignmentData.whyJobDeclined,
      predefined_comment: assignmentData.predefinedComment,
      comment: assignmentData.comment,
    };

    setErrors({});
    setIsSubmitting(true);

    try {
      await taskManager.assignAssociate(payload, onUnauthorized);
      sessionStorage.removeItem(STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA);
      setForceURL("/admin/orders");
    } catch (error) {
      console.error("Error assigning associate:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  }, [assignmentData, tid, taskManager, onUnauthorized]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/assign-associate/step-3`);
  }, [navigate, tid]);

  // Action buttons
  const actions = useMemo(() => [{
    label: "Submit Assignment",
    variant: "success",
    icon: CheckCircleIcon,
    onClick: handleSubmit,
    disabled: isSubmitting,
    loading: isSubmitting,
    loadingText: "Submitting...",
  }], [handleSubmit, isSubmitting]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={4}
      wizardTitle="Assign Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Review & Submit"
      stepSubtitle="Review all details before finalizing the assignment"
      stepIcon={DocumentCheckIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching || !task || !assignmentData}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Step 3"
      actionLayout="end"
    >
      {/* Status Alert */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info" message="This task is archived / closed" className="mb-6" />
      )}

      {/* Review Warning */}
      <Alert type="warning" message="Please review all information carefully before submitting." className="mb-6" />

      {task && assignmentData && (
        <div className="space-y-6">
          {/* Task Information */}
          <DetailCard
            title="Task Information"
            icon={ClipboardDocumentListIcon}
            maxWidth="full"
            headerAction={
              <Link to={`/admin/task/${tid}/assign-associate/step-1`} className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-800">
                <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1.5" />Edit
              </Link>
            }
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField label="Type" value="Assign Associate" themeClasses={themeClasses} />
              <DetailField label="Description" value={task.description} themeClasses={themeClasses} />
            </dl>
          </DetailCard>

          {/* Job Information */}
          <DetailCard title="Job Information" icon={BriefcaseIcon} maxWidth="full">
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Job #"
                value={<Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>{task.orderWjid}</Link>}
                themeClasses={themeClasses}
              />
              <DetailField
                label="Start Date"
                icon={CalendarDaysIcon}
                value={task.orderStartDate ? new Date(task.orderStartDate).toLocaleDateString() : "-"}
                themeClasses={themeClasses}
              />
              <DetailField label="Job Description" value={task.orderDescription} fullWidth themeClasses={themeClasses} />
              {task.orderSkillSets?.length > 0 && (
                <div className="lg:col-span-2">
                  <SkillSetsDisplay values={extractIds(task.orderSkillSets)} onUnauthorized={onUnauthorized} label="Required Skill Sets" variant="primary" size="lg" />
                </div>
              )}
              {task.orderTags?.length > 0 && (
                <div className="lg:col-span-2">
                  <TagsDisplay values={extractIds(task.orderTags)} onUnauthorized={onUnauthorized} label="Job Tags" variant="success" size="lg" />
                </div>
              )}
            </dl>
          </DetailCard>

          {/* Client Information */}
          <DetailCard title="Client Information" icon={UserIcon} maxWidth="full">
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Name"
                value={<Link to={`/admin/customer/${task.customerId}`} className={themeClasses.linkPrimary}>{task.customerName}</Link>}
                themeClasses={themeClasses}
              />
              {task.customerPhone && (
                <DetailField
                  label={`Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                  icon={PhoneIcon}
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
                  label="Address"
                  icon={MapPinIcon}
                  value={<a href={task.customerFullAddressUrl} target="_blank" rel="noreferrer" className={themeClasses.linkPrimary}>{task.customerFullAddressWithoutPostalCode}</a>}
                  fullWidth
                  themeClasses={themeClasses}
                />
              )}
              {task.customerTags?.length > 0 && (
                <div className="lg:col-span-2">
                  <TagsDisplay values={extractIds(task.customerTags)} onUnauthorized={onUnauthorized} label="Client Tags" variant="info" size="lg" />
                </div>
              )}
            </dl>
          </DetailCard>

          {/* Associate Assignment */}
          <DetailCard
            title="Associate Assignment"
            icon={WrenchScrewdriverIcon}
            maxWidth="full"
            headerAction={
              <Link to={`/admin/task/${tid}/assign-associate/step-3`} className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-800">
                <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1.5" />Edit
              </Link>
            }
          >
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField
                label="Associate"
                icon={UserIcon}
                value={<Link to={`/admin/associate/${assignmentData.associateID}`} className={themeClasses.linkPrimary}>{assignmentData.associateName}</Link>}
                themeClasses={themeClasses}
              />
              {assignmentData.associatePhone && (
                <DetailField
                  label="Phone"
                  icon={PhoneIcon}
                  value={
                    <a href={`tel:${assignmentData.associatePhone}`} className={themeClasses.linkPrimary}>
                      {formatPhoneNumber(assignmentData.associatePhone)}
                    </a>
                  }
                  themeClasses={themeClasses}
                />
              )}
              {assignmentData.associateEmail && (
                <DetailField label="Email" icon={EnvelopeIcon} value={assignmentData.associateEmail} fullWidth themeClasses={themeClasses} />
              )}
              <DetailField
                label="Job Acceptance Status"
                value={
                  <span className={`inline-flex items-center px-3.5 py-1.5 text-base font-medium rounded-full ${assignmentData.status === 3 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {assignmentData.status === 3 ? <CheckCircleIcon className="w-5 h-5 mr-1.5" /> : <XCircleIcon className="w-5 h-5 mr-1.5" />}
                    {ASSIGN_STATUS_MAP[assignmentData.status]}
                  </span>
                }
                themeClasses={themeClasses}
              />
            </dl>

            {/* Comments */}
            {(assignmentData.predefinedComment || assignmentData.comment) && (
              <div className={`mt-6 pt-6 border-t ${themeClasses.borderLight}`}>
                <h4 className={`text-base sm:text-lg font-semibold ${themeClasses.textSecondary} mb-4 flex items-center`}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2.5" />Comments
                </h4>

                {assignmentData.predefinedComment && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 mr-2.5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-1.5">System Generated Comment</p>
                        <p className={`text-base sm:text-lg ${themeClasses.textPrimary}`}>{assignmentData.predefinedComment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {assignmentData.comment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mt-0.5 mr-2.5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1.5">Additional Comment</p>
                        <p className={`text-base sm:text-lg ${themeClasses.textPrimary}`}>{assignmentData.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DetailCard>
        </div>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemAssignAssociateStep4Page() {
  return <Step4Content />;
}

export default AdminTaskItemAssignAssociateStep4Page;
