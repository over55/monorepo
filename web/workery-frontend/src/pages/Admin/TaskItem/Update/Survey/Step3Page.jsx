// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step3Page.jsx
// @uix-page: TaskItemSurveyStep3
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTaskManager, useSurveyStorage } from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Badge,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  CheckIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Survey", description: "Complete Survey", isCompleted: true },
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

// Response badge component
const ResponseBadge = memo(function ResponseBadge({ value }) {
  if (value === 1) {
    return (
      <Badge variant="success" size="sm">
        <CheckIcon className="w-3 h-3 mr-1" />
        Yes
      </Badge>
    );
  } else if (value === 2) {
    return (
      <Badge variant="danger" size="sm">
        <XMarkIcon className="w-3 h-3 mr-1" />
        No
      </Badge>
    );
  }
  return <span className="text-gray-500">-</span>;
});

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, fullWidth = false, themeClasses }) {
  return (
    <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
      <span className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary}`}>
        {label}:
      </span>
      <p className={`text-sm sm:text-base ${themeClasses.textPrimary} mt-1`}>
        {value || "-"}
      </p>
    </div>
  );
});

// Survey response row component
const SurveyResponseRow = memo(function SurveyResponseRow({ question, value, themeClasses }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
      <span className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
        {question}
      </span>
      <div className="sm:ml-4">
        <ResponseBadge value={value} />
      </div>
    </div>
  );
});

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const surveyStorage = useSurveyStorage();
  const { getThemeClasses } = useUIXTheme();

  // Get form state from storage
  const formData = surveyStorage.getState();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get reason label helper
  const getReasonLabel = useCallback((value) => {
    const option = NO_SURVEY_REASON_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : "";
  }, []);

  // Load task details
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      try {
        const taskData = await taskManager.getTaskDetail(tid, () => {
          navigate("/login?unauthorized=true");
        });
        if (mounted) setTask(taskData);
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch task details:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [tid, taskManager, navigate]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const payload = {
      task_id: tid,
      task_item_id: tid,
      was_survey_conducted: formData.wasSurveyConducted,
      no_survey_conducted_reason: formData.noSurveyConductedReason,
      no_survey_conducted_reason_other: formData.noSurveyConductedReasonOther,
      comment: formData.comment,
      was_job_satisfactory: formData.wasJobSatisfactory,
      was_job_finished_on_time_and_on_budget: formData.wasJobFinishedOnTimeAndOnBudget,
      was_associate_punctual: formData.wasAssociatePunctual,
      was_associate_professional: formData.wasAssociateProfessional,
      would_customer_refer_our_organization: formData.wouldCustomerReferOurOrganization,
    };

    // If no survey was conducted, remove survey-specific fields
    if (formData.wasSurveyConducted === 2) {
      delete payload.was_job_satisfactory;
      delete payload.was_job_finished_on_time_and_on_budget;
      delete payload.was_associate_punctual;
      delete payload.was_associate_professional;
      delete payload.would_customer_refer_our_organization;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await taskManager.submitSurvey(payload, () => {
        navigate("/login?unauthorized=true");
      });

      // Clear the wizard state
      surveyStorage.clearState();

      // Navigate to order detail page
      if (task && task.orderWjid) {
        navigate(`/admin/order/${task.orderWjid}`);
      } else {
        navigate("/admin/tasks");
      }
    } catch (error) {
      console.error("Failed to submit survey:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tid, task, taskManager, surveyStorage, navigate]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/survey/step-2`);
  }, [navigate, tid]);

  // Action buttons
  const actions = useMemo(() => [{
    label: "Submit Survey",
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
      currentStep={3}
      wizardTitle="Survey Task"
      wizardIcon={ClipboardDocumentListIcon}
      stepTitle="Review and Submit"
      stepSubtitle="Review and submit your survey"
      stepIcon={DocumentCheckIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching || !task}
      actions={actions}
      onBack={handleBack}
      backLabel="Back"
      actionLayout="end"
    >
      {/* Review Warning */}
      <Alert
        type="info"
        message="Please carefully review the following survey details. If everything looks correct, click the Submit button to save the survey."
        className="mb-6"
      />

      {task && (
        <div className="space-y-6">
          {/* Task Information */}
          <DetailCard
            title="Task Information"
            icon={DocumentTextIcon}
            maxWidth="full"
          >
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DetailField label="Type" value="Order Completion" themeClasses={themeClasses} />
              <DetailField
                label="Job #"
                value={<Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>{task.orderWjid}</Link>}
                themeClasses={themeClasses}
              />
              <DetailField label="Description" value={task.description} fullWidth themeClasses={themeClasses} />
              <DetailField
                label="Job Start Date"
                value={task.orderStartDate ? new Date(task.orderStartDate).toLocaleDateString() : "-"}
                themeClasses={themeClasses}
              />
              <DetailField
                label="Client Name"
                value={<Link to={`/admin/customer/${task.customerId}`} className={themeClasses.linkPrimary}>{task.customerName}</Link>}
                themeClasses={themeClasses}
              />
              <DetailField
                label="Associate"
                value={<Link to={`/admin/associate/${task.associateId}`} className={themeClasses.linkPrimary}>{task.associateName}</Link>}
                themeClasses={themeClasses}
              />
              {task.orderDescription && (
                <DetailField label="Job Description" value={task.orderDescription} fullWidth themeClasses={themeClasses} />
              )}
            </dl>
          </DetailCard>

          {/* Survey Submission */}
          <DetailCard
            title="Survey Submission"
            icon={ChatBubbleBottomCenterTextIcon}
            maxWidth="full"
            headerAction={
              <Link to={`/admin/task/${tid}/survey/step-2`} className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                Edit
              </Link>
            }
          >
            <div>
              <div className="mb-4">
                <span className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary}`}>
                  Was there a survey conducted?
                </span>
                <div className="mt-2">
                  <ResponseBadge value={formData.wasSurveyConducted} />
                </div>
              </div>

              {formData.wasSurveyConducted === 1 && (
                <div className={`mt-4 pt-4 border-t ${themeClasses.borderLight}`}>
                  <p className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-4`}>
                    Survey Responses
                  </p>
                  <div className="space-y-3">
                    <SurveyResponseRow
                      question="Was the quality of the work satisfactory?"
                      value={formData.wasJobSatisfactory}
                      themeClasses={themeClasses}
                    />
                    <SurveyResponseRow
                      question="Was the work completed on time and on budget?"
                      value={formData.wasJobFinishedOnTimeAndOnBudget}
                      themeClasses={themeClasses}
                    />
                    <SurveyResponseRow
                      question="Was the Associate Member punctual?"
                      value={formData.wasAssociatePunctual}
                      themeClasses={themeClasses}
                    />
                    <SurveyResponseRow
                      question="Was the Associate Member professional?"
                      value={formData.wasAssociateProfessional}
                      themeClasses={themeClasses}
                    />
                    <SurveyResponseRow
                      question="Would you refer Over55 to a friend or family member?"
                      value={formData.wouldCustomerReferOurOrganization}
                      themeClasses={themeClasses}
                    />
                  </div>
                </div>
              )}

              {formData.wasSurveyConducted === 2 && (
                <div className={`mt-4 pt-4 border-t ${themeClasses.borderLight}`}>
                  <div className="space-y-4">
                    <div>
                      <span className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary}`}>
                        Why was the survey not conducted?
                      </span>
                      <div className="mt-2">
                        <Badge variant="warning" size="sm">
                          {getReasonLabel(formData.noSurveyConductedReason)}
                        </Badge>
                      </div>
                    </div>

                    {formData.noSurveyConductedReason === 1 && (
                      <div>
                        <span className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary}`}>
                          Other Reason:
                        </span>
                        <p className={`text-xs sm:text-sm ${themeClasses.textPrimary} mt-1`}>
                          {formData.noSurveyConductedReasonOther}
                        </p>
                      </div>
                    )}

                    {formData.comment && (
                      <div>
                        <span className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary}`}>
                          Comment:
                        </span>
                        <div className={`mt-2 bg-gray-50 p-3 rounded-lg border ${themeClasses.borderLight}`}>
                          <p className={`text-xs sm:text-sm ${themeClasses.textPrimary} whitespace-pre-wrap`}>
                            {formData.comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DetailCard>
        </div>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemSurveyStep3Page() {
  return <Step3Content />;
}

export default AdminTaskItemSurveyStep3Page;
