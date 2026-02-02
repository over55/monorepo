// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step3Page.jsx
// @uix-page: TaskItemAssignAssociateStep3
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useAuthManager,
  useAssociateAwayLogManager,
} from "../../../../../services/Services";
import { formatPhoneNumber } from "../../../../../utils/phoneFormat";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  Button,
  Textarea,
  useUIXTheme,
} from "../../../../../components/UIX";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import {
  TASK_ASSIGN_ASSOCIATE_STATUS,
  TASK_HOW_JOB_ACCEPTED,
  TASK_WHY_JOB_DECLINED,
} from "../../../../../constants/Task";
import {
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
  UserIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  UsersIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Search", description: "Find Associate", isCompleted: true },
  { title: "Assign", description: "Select Associate" },
  { title: "Confirm", description: "Complete Assignment" },
]);

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const authManager = useAuthManager();
  const associateAwayLogManager = useAssociateAwayLogManager();
  const { tid } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
    borderLight: getThemeClasses("border-light") || "border-gray-200",
  }), [getThemeClasses]);

  // Component states
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [associateData, setAssociateData] = useState(null);
  const [status, setStatus] = useState(0);
  const [predefinedComment, setPredefinedComment] = useState("");
  const [comment, setComment] = useState("");
  const [howWasJobAccepted, setHowWasJobAccepted] = useState(0);
  const [whyJobDeclined, setWhyJobDeclined] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAwayStatus, setIsCheckingAwayStatus] = useState(false);
  const [isAssociateAway, setIsAssociateAway] = useState(false);
  const [awayLogData, setAwayLogData] = useState(null);

  // Check authentication and load associate data
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      setForceURL("/login");
      return;
    }

    const storedData = sessionStorage.getItem(STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA);
    if (!storedData) {
      setForceURL(`/admin/task/${tid}/assign-associate/step-2`);
      return;
    }

    const data = JSON.parse(storedData);
    setAssociateData(data);

    // Load previously entered form data
    if (data.status !== undefined && data.status !== null) {
      setStatus(data.status);
      setComment(data.comment || "");
      setPredefinedComment(data.predefinedComment || "");

      if (data.status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED) {
        setHowWasJobAccepted(data.howWasJobAccepted || 0);
      } else if (data.status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED) {
        setWhyJobDeclined(data.whyJobDeclined || 0);
      }
    }

    setIsDataLoaded(true);
  }, [authManager, tid]);

  // Check associate away status
  useEffect(() => {
    let mounted = true;

    const checkAwayStatus = async () => {
      if (!associateData?.associateID) return;

      setIsCheckingAwayStatus(true);

      try {
        const params = {
          associateId: associateData.associateID,
          associate_id: associateData.associateID,
          limit: 10,
        };

        const onUnauthorized = () => setForceURL("/login?unauthorized=true");
        const awayLogsData = await associateAwayLogManager.getAssociateAwayLogs(params, onUnauthorized, true);

        if (!mounted) return;

        if (awayLogsData?.results?.length > 0) {
          const now = new Date();
          const activeAwayLog = awayLogsData.results.find((log) => {
            const startDate = new Date(log.startDate);
            if (log.untilFurtherNotice === 1) return startDate <= now;
            if (log.untilDate) {
              const untilDate = new Date(log.untilDate);
              return startDate <= now && now <= untilDate;
            }
            return false;
          });

          if (activeAwayLog) {
            setIsAssociateAway(true);
            setAwayLogData(activeAwayLog);
          }
        }
      } catch (error) {
        console.error("Error checking associate away status:", error);
      } finally {
        if (mounted) setIsCheckingAwayStatus(false);
      }
    };

    if (isDataLoaded && associateData) checkAwayStatus();
    return () => { mounted = false; };
  }, [associateData, isDataLoaded, associateAwayLogManager]);

  // Handle navigation when forceURL is set
  useEffect(() => {
    if (forceURL !== "") {
      navigate(forceURL);
    }
  }, [forceURL, navigate]);

  // Event handlers
  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    if (value !== status) {
      setPredefinedComment("");
      setHowWasJobAccepted(0);
      setWhyJobDeclined(0);
    }
  }, [status]);

  const handleHowAcceptedChange = useCallback((value) => {
    setHowWasJobAccepted(value);
    const todayDate = new Date().toISOString().slice(0, 10);
    const methods = {
      [TASK_HOW_JOB_ACCEPTED.PHONE]: "phone",
      [TASK_HOW_JOB_ACCEPTED.TEXT]: "text",
      [TASK_HOW_JOB_ACCEPTED.EMAIL]: "email",
      [TASK_HOW_JOB_ACCEPTED.IN_PERSON]: "in-person confirmation",
    };
    const method = methods[value];
    if (method && associateData) {
      setPredefinedComment(`Job accepted by ${associateData.associateName} on ${todayDate} via ${method}.`);
    }
  }, [associateData]);

  const handleWhyDeclinedChange = useCallback((value) => {
    setWhyJobDeclined(value);
    const todayDate = new Date().toISOString().slice(0, 10);
    const reasons = {
      [TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY]: "associate was busy",
      [TASK_WHY_JOB_DECLINED.NO_SKILLS]: "associate does not have the skills",
      [TASK_WHY_JOB_DECLINED.NO_TRAVEL]: "associate does not wish to travel to the customer's location",
      [TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT]: "associate does not wish to work with this client",
    };
    const reason = reasons[value];
    if (reason && associateData) {
      setPredefinedComment(`Job declined by ${associateData.associateName} on ${todayDate} because ${reason}.`);
    }
  }, [associateData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (isAssociateAway) {
      setErrors({ message: "Cannot assign this task to an associate who is currently away. Please go back and select a different associate." });
      window.scrollTo(0, 0);
      return;
    }

    let newErrors = {};
    if (!status || status === 0) {
      newErrors.status = "Please select whether the job was accepted";
    } else if (status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED && (!howWasJobAccepted || howWasJobAccepted === 0)) {
      newErrors.howWasJobAccepted = "Please select how the job was accepted";
    } else if (status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED && (!whyJobDeclined || whyJobDeclined === 0)) {
      newErrors.whyJobDeclined = "Please select why the job was declined";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    const updatedData = {
      ...associateData,
      status,
      comment,
      howWasJobAccepted,
      whyJobDeclined,
      predefinedComment,
    };
    sessionStorage.setItem(STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA, JSON.stringify(updatedData));
    setForceURL(`/admin/task/${tid}/assign-associate/step-4`);
  }, [isAssociateAway, status, howWasJobAccepted, whyJobDeclined, associateData, comment, predefinedComment, tid]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/assign-associate/step-2`);
  }, [navigate, tid]);

  // Helper functions
  const getAwayReasonText = (awayLog) => {
    if (!awayLog) return "";
    const reasons = { 1: "Other", 2: "Vacation", 3: "Sick Leave", 4: "Personal Leave", 5: "Maternity/Paternity Leave", 6: "Emergency", 7: "Training", 8: "Suspended" };
    return awayLog.reason === 1 && awayLog.reasonOther ? awayLog.reasonOther : reasons[awayLog.reason] || "Unknown";
  };

  const getAwayPeriodText = (awayLog) => {
    if (!awayLog) return "";
    if (awayLog.untilFurtherNotice === 1) return "Until further notice";
    if (awayLog.untilDate) return `Until ${new Date(awayLog.untilDate).toLocaleDateString()}`;
    return "Ongoing";
  };

  // Action buttons
  const actions = useMemo(() => {
    if (isAssociateAway) return [];
    return [{
      label: isCheckingAwayStatus ? "Checking..." : "Confirm & Continue",
      variant: "primary",
      icon: ChevronRightIcon,
      onClick: handleSubmit,
      disabled: isCheckingAwayStatus,
      loading: isCheckingAwayStatus,
    }];
  }, [isAssociateAway, isCheckingAwayStatus, handleSubmit]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={3}
      wizardTitle="Assign Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Assignment Confirmation"
      stepSubtitle="Confirm the assignment details"
      stepIcon={ClipboardDocumentCheckIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={!isDataLoaded || isLoading}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Step 2"
      actionLayout="end"
    >
      {/* Checking Away Status */}
      {isCheckingAwayStatus && (
        <Alert type="warning" message="Checking associate availability status..." className="mb-6" />
      )}

      {/* Previous Data Loaded */}
      {status !== 0 && !isAssociateAway && (
        <Alert type="info" message="Your previous responses have been loaded. You can review and modify them if needed." className="mb-6" />
      )}

      {/* Associate Away Warning */}
      {isAssociateAway && awayLogData && (
        <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-5 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-3">Associate Currently Away</h3>
          <p className={`text-base sm:text-lg text-red-700 mb-4`}>
            <strong>{associateData?.associateName}</strong> is currently marked as away and cannot be assigned to this task.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
              <div><dt className="font-semibold text-gray-700">Reason:</dt><dd className="text-gray-900">{getAwayReasonText(awayLogData)}</dd></div>
              <div><dt className="font-semibold text-gray-700">Period:</dt><dd className="text-gray-900">{getAwayPeriodText(awayLogData)}</dd></div>
              {awayLogData.startDate && <div><dt className="font-semibold text-gray-700">Start Date:</dt><dd className="text-gray-900">{new Date(awayLogData.startDate).toLocaleDateString()}</dd></div>}
            </dl>
          </div>
          <p className="text-base sm:text-lg text-red-700 font-medium">Please go back and select a different associate.</p>
          <Button className="mt-5" size="lg" variant="danger" onClick={handleBack}>Go Back & Select Different Associate</Button>
        </div>
      )}

      {associateData && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Selected Associate */}
            <DetailCard title="Selected Associate" icon={UserIcon} maxWidth="full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-1.5`}>Associate Name</dt>
                  <dd className={`text-lg sm:text-xl font-medium ${themeClasses.textPrimary}`}>
                    <Link to={`/admin/associate/${associateData.associateID}`} className={themeClasses.linkPrimary}>{associateData.associateName}</Link>
                    {isAssociateAway && <span className="ml-2 inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-red-800 bg-red-100 rounded-full"><CalendarDaysIcon className="w-4 h-4 mr-1.5" />Away</span>}
                  </dd>
                </div>
                {associateData.associatePhone && (
                  <div>
                    <dt className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-1.5`}>Phone</dt>
                    <dd className={`text-lg sm:text-xl font-medium ${themeClasses.textPrimary}`}>
                      <a href={`tel:${associateData.associatePhone}`} className={`${themeClasses.linkPrimary} flex items-center`}><PhoneIcon className="w-5 h-5 mr-1.5" />{formatPhoneNumber(associateData.associatePhone)}</a>
                    </dd>
                  </div>
                )}
                {associateData.associateEmail && (
                  <div className="lg:col-span-2">
                    <dt className={`text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-1.5`}>Email</dt>
                    <dd className={`text-lg sm:text-xl font-medium ${themeClasses.textPrimary}`}>
                      <a href={`mailto:${associateData.associateEmail}`} className={`${themeClasses.linkPrimary} flex items-center break-all`}><EnvelopeIcon className="w-5 h-5 mr-1.5 flex-shrink-0" />{associateData.associateEmail}</a>
                    </dd>
                  </div>
                )}
              </div>
            </DetailCard>

            {/* Job Acceptance Status - Only show if not away */}
            {!isAssociateAway && (
              <>
                <DetailCard title="Job Acceptance Status" icon={ClipboardDocumentCheckIcon} maxWidth="full">
                  <div className="space-y-5">
                    <div>
                      <label className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Has the associate accepted this job? <span className="text-red-500">*</span></label>
                      <div className="space-y-3">
                        <label className={`flex items-center p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <input type="radio" name="status" checked={status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED} onChange={() => handleStatusChange(TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED)} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                          <span className="ml-4 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2.5 text-green-600" /><span className="text-lg font-medium">Yes - Job Accepted</span></span>
                        </label>
                        <label className={`flex items-center p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                          <input type="radio" name="status" checked={status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED} onChange={() => handleStatusChange(TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED)} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                          <span className="ml-4 flex items-center"><XCircleIcon className="w-6 h-6 mr-2.5 text-red-600" /><span className="text-lg font-medium">No - Job Declined</span></span>
                        </label>
                      </div>
                      {errors.status && <p className="mt-2 text-base text-red-600">{errors.status}</p>}
                    </div>

                    {/* How was job accepted */}
                    {status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED && (
                      <div className={`pt-5 border-t ${themeClasses.borderLight}`}>
                        <label className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>How was this job accepted? <span className="text-red-500">*</span></label>
                        <div className="space-y-3">
                          {[
                            { value: TASK_HOW_JOB_ACCEPTED.PHONE, icon: PhoneIcon, label: "Phone Call" },
                            { value: TASK_HOW_JOB_ACCEPTED.TEXT, icon: ChatBubbleLeftRightIcon, label: "Text Message" },
                            { value: TASK_HOW_JOB_ACCEPTED.EMAIL, icon: EnvelopeIcon, label: "Email" },
                            { value: TASK_HOW_JOB_ACCEPTED.IN_PERSON, icon: UserGroupIcon, label: "In-person confirmation" },
                          ].map((option) => (
                            <label key={option.value} className={`flex items-center p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${howWasJobAccepted === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                              <input type="radio" name="howWasJobAccepted" checked={howWasJobAccepted === option.value} onChange={() => handleHowAcceptedChange(option.value)} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                              <span className="ml-4 flex items-center"><option.icon className="w-6 h-6 mr-2.5 text-gray-600" /><span className="text-lg">{option.label}</span></span>
                            </label>
                          ))}
                        </div>
                        {errors.howWasJobAccepted && <p className="mt-2 text-base text-red-600">{errors.howWasJobAccepted}</p>}
                      </div>
                    )}

                    {/* Why was job declined */}
                    {status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED && (
                      <div className={`pt-5 border-t ${themeClasses.borderLight}`}>
                        <label className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Why was this job declined? <span className="text-red-500">*</span></label>
                        <div className="space-y-3">
                          {[
                            { value: TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY, icon: ClockIcon, label: "Associate was busy" },
                            { value: TASK_WHY_JOB_DECLINED.NO_SKILLS, icon: WrenchScrewdriverIcon, label: "Associate does not have the required skills" },
                            { value: TASK_WHY_JOB_DECLINED.NO_TRAVEL, icon: MapPinIcon, label: "Associate does not wish to travel to the customer's location" },
                            { value: TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT, icon: UsersIcon, label: "Associate does not wish to work with this client" },
                          ].map((option) => (
                            <label key={option.value} className={`flex items-center p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${whyJobDeclined === option.value ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                              <input type="radio" name="whyJobDeclined" checked={whyJobDeclined === option.value} onChange={() => handleWhyDeclinedChange(option.value)} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                              <span className="ml-4 flex items-center"><option.icon className="w-6 h-6 mr-2.5 text-gray-600" /><span className="text-lg">{option.label}</span></span>
                            </label>
                          ))}
                        </div>
                        {errors.whyJobDeclined && <p className="mt-2 text-base text-red-600">{errors.whyJobDeclined}</p>}
                      </div>
                    )}
                  </div>
                </DetailCard>

                {/* Comments Section */}
                <DetailCard title="Comments" icon={ChatBubbleLeftRightIcon} maxWidth="full">
                  {status !== 0 && predefinedComment && (
                    <div className="mb-5">
                      <label className={`block text-sm sm:text-base font-semibold ${themeClasses.textSecondary} mb-2.5`}>System Generated Comment</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
                        <p className={`text-base sm:text-lg ${themeClasses.textPrimary}`}>{predefinedComment}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <Textarea
                      label="Additional Comments (Optional)"
                      value={comment}
                      onChange={setComment}
                      placeholder="Add any additional notes or comments about this assignment..."
                      rows={5}
                      helperText="This comment will be added to the task history."
                    />
                  </div>
                </DetailCard>
              </>
            )}
          </div>
        </form>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemAssignAssociateStep3Page() {
  return <Step3Content />;
}

export default AdminTaskItemAssignAssociateStep3Page;
