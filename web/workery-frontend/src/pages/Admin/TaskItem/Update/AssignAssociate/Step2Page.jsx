// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step2Page.jsx
// @uix-page: TaskItemAssignAssociateStep2
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
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  TagIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarDaysIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration - same as Step1
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Search", description: "Find Associate" },
  { title: "Assign", description: "Select Associate" },
  { title: "Confirm", description: "Complete Assignment" },
]);

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
const Step2Content = memo(function Step2Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    textMuted: getThemeClasses("text-muted") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
    borderLight: getThemeClasses("border-light") || "border-gray-200",
    bgCard: getThemeClasses("bg-card") || "bg-white",
  }), [getThemeClasses]);

  // Component states
  const [task, setTask] = useState(null);
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [selectedAssociateId, setSelectedAssociateId] = useState(null);

  // Event handling
  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

  const onSelectClick = useCallback((associate) => {
    if (associate.isAway) return;

    sessionStorage.setItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
      JSON.stringify({
        associateID: associate.id,
        associateName: associate.name,
        associatePhone: associate.phone,
        associateEmail: associate.email,
        associateOrganizationName: associate.organizationName,
        associateContactsLast30Days: associate.contactsLast30Days,
        associateWsibNumber: associate.wsibNumber,
        associateHourlySalaryDesired: associate.hourlySalaryDesired,
        associateSkillSets: associate.skillSets,
        associateIsAway: associate.isAway,
      }),
    );
    setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
  }, [tid]);

  // Load previously selected associate
  useEffect(() => {
    const storedData = sessionStorage.getItem(STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.associateID) {
          setSelectedAssociateId(data.associateID);
        }
      } catch (error) {
        console.error("Error parsing stored associate data:", error);
      }
    }
  }, []);

  // Load task and associates
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      setFetching(true);
      setErrors({});

      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (!mounted) return;
        setTask(taskData);

        const associatesData = await taskManager.getAssignableAssociates(tid, onUnauthorized, true);
        if (mounted) {
          setAssociates(associatesData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching data:", error);
          setErrors({ message: error.message || "Failed to load data" });
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

  // Render skill sets with matching indicators
  const renderSkillSets = useCallback((associateSkillSets, taskSkillSets) => {
    if (!associateSkillSets || associateSkillSets.length === 0) {
      return <span className={themeClasses.textMuted}>-</span>;
    }

    const taskSkillIds = new Set();
    if (taskSkillSets?.length > 0) {
      taskSkillSets.forEach((skill) => {
        const skillId = skill.id || skill.value || skill._id;
        if (skillId) taskSkillIds.add(skillId);
      });
    }

    const matchingSkills = [];
    const nonMatchingSkills = [];

    associateSkillSets.forEach((skill) => {
      const skillId = skill.id || skill.value || skill._id;
      const skillName = skill.name || skill.text || skill.label;
      if (taskSkillIds.has(skillId)) {
        matchingSkills.push({ id: skillId, name: skillName });
      } else {
        nonMatchingSkills.push({ id: skillId, name: skillName });
      }
    });

    return (
      <div className="flex flex-wrap gap-2">
        {matchingSkills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-3 py-1.5 text-sm sm:text-base font-medium text-green-800 bg-green-100 rounded-full"
            title="Matches job requirement"
          >
            ✓ {skill.name}
          </span>
        ))}
        {nonMatchingSkills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-3 py-1.5 text-sm sm:text-base font-medium text-gray-600 bg-gray-100 rounded-full"
          >
            {skill.name}
          </span>
        ))}
      </div>
    );
  }, [themeClasses.textMuted]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/assign-associate/step-1`);
  }, [navigate, tid]);

  const handleContinue = useCallback(() => {
    navigate(`/admin/task/${tid}/assign-associate/step-3`);
  }, [navigate, tid]);

  // Calculate counts
  const awayAssociatesCount = associates?.results?.filter((a) => a.isAway).length || 0;
  const availableAssociatesCount = associates?.results?.filter((a) => !a.isAway).length || 0;
  const totalAssociatesCount = associates?.results?.length || 0;

  // Action buttons
  const actions = useMemo(() => {
    if (!selectedAssociateId) return [];
    return [
      {
        label: "Continue to Step 3",
        variant: "primary",
        icon: ChevronRightIcon,
        onClick: handleContinue,
      },
    ];
  }, [selectedAssociateId, handleContinue]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={2}
      wizardTitle="Assign Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Select Associate"
      stepSubtitle="Choose an available associate for this task"
      stepIcon={UserGroupIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Step 1"
      actionLayout="end"
    >
      {/* Status Alert for closed tasks */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info" message="This task is archived / closed" className="mb-6" />
      )}

      {task && (
        <div className="space-y-6">
          {/* Task Details Section */}
          <DetailCard title="Task Details" icon={ClipboardDocumentListIcon} maxWidth="full">
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailField label="Type" value="Assign Associate" themeClasses={themeClasses} />
              <DetailField label="Description" value={task.description} themeClasses={themeClasses} />
              <DetailField
                label="Job #"
                value={
                  <Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>
                    {task.orderWjid} →
                  </Link>
                }
                themeClasses={themeClasses}
              />
              <DetailField
                label="Job Start Date"
                icon={CalendarDaysIcon}
                value={task.orderStartDate ? new Date(task.orderStartDate).toLocaleDateString() : "-"}
                themeClasses={themeClasses}
              />
              <DetailField label="Job Description" value={task.orderDescription} fullWidth themeClasses={themeClasses} />
              <div>
                <dt className={`text-base sm:text-lg font-semibold ${themeClasses.textSecondary} mb-1.5`}>Job Skill Sets</dt>
                <dd>
                  {task.orderSkillSets?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.orderSkillSets.map((skill, index) => (
                        <span key={skill.id || skill.value || index} className="inline-flex items-center px-3 py-1.5 text-base sm:text-lg font-medium text-blue-800 bg-blue-100 rounded-full">
                          {skill.name || skill.text || skill.label}
                        </span>
                      ))}
                    </div>
                  ) : <span className={themeClasses.textMuted}>-</span>}
                </dd>
              </div>
              <DetailField
                label="Client Name"
                icon={UserIcon}
                value={
                  <Link to={`/admin/customer/${task.customerId}`} className={themeClasses.linkPrimary}>
                    {task.customerName} →
                  </Link>
                }
                themeClasses={themeClasses}
              />
              {task.customerPhone && (
                <DetailField
                  label={`Client Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                  icon={PhoneIcon}
                  value={
                    <a href={`tel:${task.customerPhone}`} className={themeClasses.linkPrimary}>
                      {task.customerPhone}
                      {task.customerPhoneExtension && <span className="ml-1">ext. {task.customerPhoneExtension}</span>}
                    </a>
                  }
                  themeClasses={themeClasses}
                />
              )}
              {task.customerFullAddressUrl && (
                <DetailField
                  label="Client Address"
                  icon={MapPinIcon}
                  value={
                    <a href={task.customerFullAddressUrl} target="_blank" rel="noopener noreferrer" className={themeClasses.linkPrimary}>
                      {task.customerFullAddressWithoutPostalCode}
                    </a>
                  }
                  fullWidth
                  themeClasses={themeClasses}
                />
              )}
              <DetailField
                label="Comments"
                icon={ChatBubbleLeftRightIcon}
                value={
                  <Link to={`/admin/order/${task.orderWjid}/comments`} className={themeClasses.linkPrimary}>
                    View comments →
                  </Link>
                }
                themeClasses={themeClasses}
              />
            </dl>
          </DetailCard>

          {/* Available Associates Section */}
          <DetailCard title="Available Associates" icon={UserGroupIcon} maxWidth="full">
            {task.orderSkillSets?.length > 0 && (
              <Alert
                type="info"
                message="Associates are filtered by matching skill sets and sorted by least recent contacts. Green highlighted skills match the job requirements."
                className="mb-4"
              />
            )}

            {awayAssociatesCount > 0 && (
              <Alert
                type="warning"
                message={`${awayAssociatesCount} of ${totalAssociatesCount} associates are currently marked as away and cannot be selected. Only ${availableAssociatesCount} associate${availableAssociatesCount !== 1 ? "s are" : " is"} available.`}
                className="mb-4"
              />
            )}

            {selectedAssociateId && (
              <Alert
                type="success"
                message="You have already selected an associate. You can continue or choose a different one."
                className="mb-4"
              />
            )}

            {associates?.results?.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Contacts (30d)</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">WSIB #</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Skills</th>
                        <th className="px-4 py-4 text-left text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {associates.results.map((associate, index) => {
                        const isSelected = selectedAssociateId === associate.id;
                        const isAway = associate.isAway;

                        return (
                          <tr key={associate.id} className={isSelected ? "bg-green-50" : isAway ? "bg-gray-100 opacity-60" : "hover:bg-gray-50"}>
                            <td className="px-4 py-4 whitespace-nowrap text-lg text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {isAway ? (
                                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm sm:text-base font-medium bg-red-100 text-red-800">
                                  <LockClosedIcon className="w-5 h-5 mr-1.5" />Unavailable
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm sm:text-base font-medium bg-green-100 text-green-800">
                                  <CheckCircleIcon className="w-5 h-5 mr-1.5" />Available
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Link to={`/admin/associate/${associate.id}`} target="_blank" className={`text-lg font-medium ${isAway ? "text-gray-500" : themeClasses.linkPrimary}`}>
                                {associate.name}
                              </Link>
                              {isSelected && <span className="ml-2 inline-flex items-center px-3 py-1.5 rounded text-sm sm:text-base font-medium bg-green-100 text-green-800">Selected</span>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {associate.phone ? (
                                <a href={`tel:${associate.phone}`} className={`text-lg ${isAway ? "text-gray-500 pointer-events-none" : themeClasses.linkPrimary} flex items-center`}>
                                  <PhoneIcon className="w-5 h-5 mr-1.5" />{associate.phone}
                                </a>
                              ) : <span className="text-lg text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {associate.email ? (
                                <a href={`mailto:${associate.email}`} className={`text-lg ${isAway ? "text-gray-500 pointer-events-none" : themeClasses.linkPrimary} flex items-center`}>
                                  <EnvelopeIcon className="w-5 h-5 mr-1.5" />{associate.email}
                                </a>
                              ) : <span className="text-lg text-gray-400">-</span>}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-lg ${isAway ? "text-gray-500" : "text-gray-900"}`}>{associate.contactsLast30Days || 0}</td>
                            <td className={`px-4 py-4 whitespace-nowrap text-lg ${isAway ? "text-gray-500" : "text-gray-900"}`}>{associate.wsibNumber || <span className="text-gray-400">-</span>}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {associate.hourlySalaryDesired ? (
                                <span className={`text-lg font-medium ${isAway ? "text-gray-500" : "text-green-600"}`}>${associate.hourlySalaryDesired}/hr</span>
                              ) : <span className="text-lg text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-4"><div className={isAway ? "opacity-50" : ""}>{renderSkillSets(associate.skillSets, task?.orderSkillSets)}</div></td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {isAway ? (
                                <div className="inline-flex items-center px-4 py-2.5 text-base font-medium text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed">
                                  <LockClosedIcon className="w-5 h-5 mr-1.5" />Restricted
                                </div>
                              ) : (
                                <Button size="lg" variant={isSelected ? "success" : "primary"} onClick={() => onSelectClick(associate)} icon={ArrowRightIcon}>
                                  {isSelected ? "Reselect" : "Assign"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {associates.results.map((associate, index) => {
                    const isSelected = selectedAssociateId === associate.id;
                    const isAway = associate.isAway;

                    return (
                      <div key={associate.id} className={`p-5 rounded-xl border-2 ${isSelected ? "bg-green-50 border-green-200" : isAway ? "bg-gray-100 border-gray-300 opacity-75" : "bg-white border-gray-200"}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link to={`/admin/associate/${associate.id}`} target="_blank" className={`text-xl font-semibold ${isAway ? "text-gray-500" : themeClasses.linkPrimary}`}>
                              {associate.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-2">
                              {isAway ? (
                                <span className="inline-flex items-center px-3 py-2 rounded-full text-base font-medium bg-red-100 text-red-800">
                                  <LockClosedIcon className="w-5 h-5 mr-1.5" />Unavailable
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-2 rounded-full text-base font-medium bg-green-100 text-green-800">
                                  <CheckCircleIcon className="w-5 h-5 mr-1.5" />Available
                                </span>
                              )}
                              {isSelected && <span className="inline-flex items-center px-3 py-1.5 rounded text-base font-medium bg-green-100 text-green-800">Selected</span>}
                            </div>
                          </div>
                          <span className="text-base text-gray-500">#{index + 1}</span>
                        </div>

                        <div className="space-y-3 text-lg">
                          {associate.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="w-6 h-6 mr-2.5 text-gray-400" />
                              <a href={`tel:${associate.phone}`} className={isAway ? "text-gray-500 pointer-events-none" : themeClasses.linkPrimary}>{associate.phone}</a>
                            </div>
                          )}
                          {associate.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="w-6 h-6 mr-2.5 text-gray-400" />
                              <a href={`mailto:${associate.email}`} className={`${isAway ? "text-gray-500 pointer-events-none" : themeClasses.linkPrimary} break-all`}>{associate.email}</a>
                            </div>
                          )}
                          {associate.organizationName && (
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="w-6 h-6 mr-2.5 text-gray-400" />
                              <span className={isAway ? "text-gray-500" : "text-gray-900"}>{associate.organizationName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Contacts (30d):</span>
                            <span className={isAway ? "text-gray-500" : "text-gray-900"}>{associate.contactsLast30Days || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">WSIB #:</span>
                            <span className={isAway ? "text-gray-500" : "text-gray-900"}>{associate.wsibNumber || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rate:</span>
                            <span className={`font-medium ${isAway ? "text-gray-500" : "text-green-600"}`}>
                              {associate.hourlySalaryDesired ? `$${associate.hourlySalaryDesired}/hr` : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Skills:</span>
                            <div className={`mt-1.5 ${isAway ? "opacity-50" : ""}`}>{renderSkillSets(associate.skillSets, task?.orderSkillSets)}</div>
                          </div>
                        </div>

                        {isAway ? (
                          <div className="mt-5 w-full inline-flex items-center justify-center px-4 py-3.5 text-lg font-medium text-gray-500 bg-gray-200 rounded-xl cursor-not-allowed">
                            <LockClosedIcon className="w-6 h-6 mr-2" />Cannot Assign - Associate is Away
                          </div>
                        ) : (
                          <Button className="mt-5 w-full" size="lg" variant={isSelected ? "success" : "primary"} onClick={() => onSelectClick(associate)} icon={ArrowRightIcon}>
                            {isSelected ? "Reselect" : "Assign"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-20 w-20 text-gray-400" />
                <h3 className="mt-3 text-xl font-semibold text-gray-900">No Associates Available</h3>
                <p className="mt-2 text-lg text-gray-500">
                  {task.orderSkillSets?.length > 0 ? (
                    <>No active associates found with the required skill sets. <Link to="/admin/associates/add/step-1-search" className={themeClasses.linkPrimary}>Click here →</Link> to add a new associate.</>
                  ) : (
                    <>No active associates found. <Link to="/admin/associates/add/step-1-search" className={themeClasses.linkPrimary}>Click here →</Link> to add a new associate.</>
                  )}
                </p>
              </div>
            )}
          </DetailCard>
        </div>
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemAssignAssociateStep2Page() {
  return <Step2Content />;
}

export default AdminTaskItemAssignAssociateStep2Page;
