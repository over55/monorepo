// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step1Page.jsx
// @uix-page: TaskItemSurveyStep1
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Button,
  Modal,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
  InsuranceRequirementsDisplay,
} from "../../../../../components/business/displays";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../constants/FieldOptions";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details" },
  { title: "Survey", description: "Complete Survey" },
  { title: "Complete", description: "Finish Task" },
]);

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, fullWidth = false, icon: Icon = null, themeClasses }) {
  return (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1 flex items-center`}>
        {Icon && <Icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />}
        {label}
      </dt>
      <dd className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary} break-words`}>
        {value || "-"}
      </dd>
    </div>
  );
});

// Memoized content component
const Step1Content = memo(function Step1Content() {
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPostponeConfirm, setShowPostponeConfirm] = useState(false);

  // Event handling
  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

  // Helper function to extract IDs from array of objects
  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => {
      if (typeof item === "number" || typeof item === "string") return item;
      return item.id || item.value || item.skillSetId || item.tagId || item.vehicleTypeId || item.insuranceRequirementId;
    }).filter(Boolean);
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
        if (mounted) {
          console.error("Error fetching task:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchTask();
    return () => { mounted = false; };
  }, [tid, taskManager, onUnauthorized]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate("/admin/tasks");
  }, [navigate]);

  const handleNext = useCallback(() => {
    navigate(`/admin/task/${tid}/survey/step-2`);
  }, [navigate, tid]);

  // Redirect if needed
  if (forceURL !== "") return <Navigate to={forceURL} />;

  // Determine if task is open
  const isTaskOpen = task && task.isClosed === false && task.status !== 2;

  // Action buttons
  const actions = useMemo(() => {
    if (!isTaskOpen) return [];

    return [
      {
        label: "Close Task",
        variant: "danger",
        icon: XMarkIcon,
        onClick: () => setShowCloseConfirm(true),
      },
      {
        label: "Postpone",
        variant: "warning",
        icon: CalendarIcon,
        onClick: () => setShowPostponeConfirm(true),
      },
      {
        label: "Begin Survey",
        variant: "primary",
        icon: ChevronRightIcon,
        iconPosition: "right",
        onClick: handleNext,
      },
    ];
  }, [isTaskOpen, handleNext]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={1}
        wizardTitle="Survey Task"
        wizardIcon={ClipboardDocumentListIcon}
        stepTitle="Review Task Details"
        stepSubtitle="Review task information before proceeding"
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
              icon={ClipboardDocumentListIcon}
              maxWidth="full"
            >
              <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <DetailField label="Type" value={task.title || "Survey"} themeClasses={themeClasses} />
                <DetailField
                  label="Created At"
                  value={task.createdAt ? new Date(task.createdAt).toLocaleString() : "-"}
                  themeClasses={themeClasses}
                />
                <DetailField label="Description" value={task.description} fullWidth themeClasses={themeClasses} />
              </dl>
            </DetailCard>

            {/* Job Information */}
            <DetailCard title="Job Information" icon={WrenchScrewdriverIcon} maxWidth="full">
              <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <DetailField
                  label="Job #"
                  value={<Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>{task.orderWjid}</Link>}
                  themeClasses={themeClasses}
                />
                <DetailField
                  label="Start Date"
                  icon={CalendarIcon}
                  value={task.orderStartDate ? new Date(task.orderStartDate).toLocaleDateString() : "-"}
                  themeClasses={themeClasses}
                />
                <DetailField label="Description" value={task.orderDescription} fullWidth themeClasses={themeClasses} />
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Skill Sets</dt>
                  <dd className="mt-1">
                    <SkillSetsDisplay values={extractIds(task.orderSkillSets)} onUnauthorized={onUnauthorized} variant="primary" />
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Tags</dt>
                  <dd className="mt-1">
                    <TagsDisplay values={extractIds(task.orderTags)} onUnauthorized={onUnauthorized} variant="success" />
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Comments</dt>
                  <dd>
                    <Link to={`/admin/order/${task.orderWjid}/comments`} className={`${themeClasses.linkPrimary} text-base sm:text-lg font-medium`}>
                      View comments →
                    </Link>
                  </dd>
                </div>
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
                    value={<>{task.customerPhone}{task.customerPhoneExtension && ` ext. ${task.customerPhoneExtension}`}</>}
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
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Tags</dt>
                  <dd className="mt-1">
                    <TagsDisplay values={extractIds(task.customerTags)} onUnauthorized={onUnauthorized} variant="info" />
                  </dd>
                </div>
              </dl>
            </DetailCard>

            {/* Associate Information */}
            <DetailCard title="Associate Information" icon={WrenchScrewdriverIcon} maxWidth="full">
              <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <DetailField
                  label="Name"
                  value={<Link to={`/admin/associate/${task.associateId}`} className={themeClasses.linkPrimary}>{task.associateName}</Link>}
                  themeClasses={themeClasses}
                />
                {task.associatePhone && (
                  <DetailField
                    label={`Phone (${ASSOCIATE_PHONE_TYPE_OF_MAP[task.associatePhoneType]})`}
                    icon={PhoneIcon}
                    value={<>{task.associatePhone}{task.associatePhoneExtension && ` ext. ${task.associatePhoneExtension}`}</>}
                    themeClasses={themeClasses}
                  />
                )}
                {task.associateFullAddressUrl && (
                  <DetailField
                    label="Address"
                    icon={MapPinIcon}
                    value={<a href={task.associateFullAddressUrl} target="_blank" rel="noreferrer" className={themeClasses.linkPrimary}>{task.associateFullAddressWithoutPostalCode}</a>}
                    fullWidth
                    themeClasses={themeClasses}
                  />
                )}
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Tags</dt>
                  <dd className="mt-1">
                    <TagsDisplay values={extractIds(task.associateTags)} onUnauthorized={onUnauthorized} variant="warning" />
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Skill Sets</dt>
                  <dd className="mt-1">
                    <SkillSetsDisplay values={extractIds(task.associateSkillSets)} onUnauthorized={onUnauthorized} variant="primary" />
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Vehicle Types</dt>
                  <dd className="mt-1">
                    <VehicleTypesDisplay values={extractIds(task.associateVehicleTypes)} onUnauthorized={onUnauthorized} variant="warning" />
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>Insurance Requirements</dt>
                  <dd className="mt-1">
                    <InsuranceRequirementsDisplay values={extractIds(task.associateInsuranceRequirements)} onUnauthorized={onUnauthorized} variant="info" />
                  </dd>
                </div>
              </dl>
            </DetailCard>
          </div>
        )}
      </WizardFormStep>

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        title="Close Task"
        icon={ExclamationCircleIcon}
        iconColor="red"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCloseConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => navigate(`/admin/task/${tid}/close`)}>
              Yes, Close Task
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Are you sure you want to close this task? This action cannot be undone.
        </p>
      </Modal>

      {/* Postpone Confirmation Modal */}
      <Modal
        isOpen={showPostponeConfirm}
        onClose={() => setShowPostponeConfirm(false)}
        title="Postpone Task"
        icon={CalendarIcon}
        iconColor="yellow"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPostponeConfirm(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={() => navigate(`/admin/task/${tid}/postpone`)}>
              Yes, Postpone Task
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Are you sure you want to postpone this task? You can resume it later from the tasks list.
        </p>
      </Modal>
    </>
  );
});

function AdminTaskItemSurveyStep1Page() {
  return <Step1Content />;
}

export default AdminTaskItemSurveyStep1Page;
