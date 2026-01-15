import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Button,
  Alert,
} from "../../UIX";
import {
  Badge,
  Loading,
  Tabs,
} from "../../UIX";
import {
  UserCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  InformationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../constants/Roles";
import {
  ACCOUNT_STATUS_LABELS,
  getAccountFieldConfig,
  ACCOUNT_PATHS,
} from "../../../constants/Account";
import {
  formatDateTime,
  formatDateForDisplay,
} from "../../../services/Helpers/DateFormatter";

function AccountDetailView({
  // User type configuration
  userType, // 'admin', 'customer', 'facilitator', 'jobseeker', 'root'
  userRole, // For staff: 1=Executive, 2=Management, 3=Frontline

  // Services
  accountManager,
  authManager,

  // Display configuration
  title,
  subtitle,
  showTabs = true,

  // Custom field renderers
  customFieldRenderers = {},

  // Custom sections
  customSections = {},

  // Callbacks
  onDataLoad,
  onError,
}) {
  return (
    <UIXThemeProvider>
      <AccountDetailViewContent
        userType={userType}
        userRole={userRole}
        accountManager={accountManager}
        authManager={authManager}
        title={title}
        subtitle={subtitle}
        showTabs={showTabs}
        customFieldRenderers={customFieldRenderers}
        customSections={customSections}
        onDataLoad={onDataLoad}
        onError={onError}
      />
    </UIXThemeProvider>
  );
}

function AccountDetailViewContent({
  userType,
  userRole,
  accountManager,
  authManager,
  title,
  // eslint-disable-next-line no-unused-vars
  subtitle,
  showTabs,
  customFieldRenderers,
  customSections,
  onDataLoad,
  onError,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("detail");

  // Get paths and field configuration
  const paths = useMemo(() => ACCOUNT_PATHS[userType] || ACCOUNT_PATHS.admin, [userType]);
  const fieldConfig = useMemo(() =>
    getAccountFieldConfig(userRole, userType),
    [userRole, userType]
  );

  // Handlers
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Fetch account details
  const fetchAccountDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const profileData = await accountManager.getAccountDetail(onUnauthorized);

      // Validate user role for staff users
      if (userType === 'admin' && ![EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(profileData.role)) {
        navigate("/501");
        return;
      }

      setCurrentUser(profileData);

      // Call onDataLoad callback if provided
      if (onDataLoad) {
        onDataLoad(profileData);
      }

    } catch (error) {
      console.error("Failed to fetch account details:", error);
      const errorMessage = error.message || "Failed to load account details";
      setErrors({ general: errorMessage });

      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accountManager, onUnauthorized, userType, navigate, onDataLoad, onError]);

  // Load data on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAccountDetail();
  }, [fetchAccountDetail]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Handle URL success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("success");
    if (message) {
      setSuccessMessage(message);
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, []);

  // Helper functions
  const getRoleDisplayName = (role) => {
    switch (role) {
      case EXECUTIVE_ROLE_ID:
        return "Executive Staff";
      case MANAGEMENT_ROLE_ID:
        return "Management Staff";
      case FRONTLINE_ROLE_ID:
        return "Frontline Staff";
      default:
        return "Staff";
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case EXECUTIVE_ROLE_ID:
        return "primary";
      case MANAGEMENT_ROLE_ID:
        return "warning";
      case FRONTLINE_ROLE_ID:
        return "info";
      default:
        return "default";
    }
  };

  const getGenderDisplay = (gender, genderOther) => {
    switch (gender) {
      case 1: // Other
        return genderOther || "Other";
      case 2:
        return "Male";
      case 3:
        return "Female";
      case 4:
        return "Prefer not to say";
      default:
        return "-";
    }
  };

  const getIdentifyAsLabels = (identifyAsArray) => {
    if (!identifyAsArray || identifyAsArray.length === 0) return "-";

    const labels = {
      1: "Other",
      2: "Prefer not to say",
      3: "Women",
      4: "Newcomer",
      5: "Racialized Person",
      6: "Veteran",
      7: "Francophone",
      8: "Person with Disability",
      9: "Inuit",
      10: "First Nations",
      11: "Métis",
    };

    return (
      identifyAsArray
        .map((id) => labels[id] || "")
        .filter(Boolean)
        .join(", ") || "-"
    );
  };

  // Render field value with custom renderers
  const renderFieldValue = (fieldName, value, userData) => {
    // Check for custom renderer first
    if (customFieldRenderers[fieldName]) {
      return customFieldRenderers[fieldName](value, userData);
    }

    // Default field renderers
    switch (fieldName) {
      case "status":
        return (
          <Badge variant={value === 1 ? "success" : "error"}>
            {ACCOUNT_STATUS_LABELS[value] || "Unknown"}
          </Badge>
        );
      case "gender":
        return getGenderDisplay(value, userData.genderOther);
      case "identifyAs":
        return getIdentifyAsLabels(value);
      case "isOkToEmail":
      case "isOkToText":
      case "agreePromotionsEmail":
        return (
          <Badge variant={value ? "success" : "error"} size="sm">
            {value ? (
              <>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Agreed
              </>
            ) : (
              <>
                <XCircleIcon className="h-3 w-3 mr-1" />
                Not Agreed
              </>
            )}
          </Badge>
        );
      case "tags":
        return value && value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <Badge key={tag.id} variant="default" size="sm">
                {tag.text}
              </Badge>
            ))}
          </div>
        ) : "-";
      case "skillSets":
        return value && value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <Badge key={skill.id} variant="info" size="sm">
                <AcademicCapIcon className="h-3 w-3 mr-1" />
                {skill.subCategory}
              </Badge>
            ))}
          </div>
        ) : "-";
      case "insuranceRequirements":
        return value && value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map((req) => (
              <Badge key={req.id} variant="warning" size="sm">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                {req.name}
              </Badge>
            ))}
          </div>
        ) : "-";
      case "hourlySalaryDesired":
        return value ? `$${value}/hr` : "-";
      case "email":
        return value ? (
          <a
            href={`mailto:${value}`}
            className={`transition-colors ${getThemeClasses('link')}`}
          >
            {value}
          </a>
        ) : "-";
      case "phone":
      case "otherPhone":
      case "emergencyContactTelephone":
      case "emergencyContactAlternativeTelephone":
        return value ? (
          <a
            href={`tel:${value}`}
            className={`transition-colors ${getThemeClasses('link')}`}
          >
            {value}
          </a>
        ) : "-";
      case "fullAddressWithPostalCode":
        return userData.fullAddressUrl ? (
          <a
            href={userData.fullAddressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors flex items-center ${getThemeClasses('link')}`}
          >
            <GlobeAltIcon className="h-4 w-4 mr-1" />
            {value}
          </a>
        ) : (
          value || "-"
        );
      case "createdAt":
      case "modifiedAt":
      case "joinDate":
        return formatDateTime(value);
      case "birthDate":
      case "duesDate":
      case "commercialInsuranceExpiryDate":
      case "autoInsuranceExpiryDate":
      case "wsibInsuranceDate":
      case "policeCheck":
        return formatDateForDisplay(value);
      default:
        return value || "-";
    }
  };

  // Tab items configuration
  const tabItems = useMemo(() => [
    { id: "detail", label: "Detail" },
    { id: "more", label: "More", href: paths.more },
  ], [paths.more]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: paths.dashboard,
      icon: HomeIcon
    },
    {
      label: "My Profile",
      icon: UserCircleIcon
    },
  ], [paths.dashboard]);

  // Loading state
  if (isLoading) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  // Error state
  if (errors.general) {
    return (
      <div className={`min-h-screen p-8 ${getThemeClasses('page-bg')}`}>
        <div className="max-w-4xl mx-auto">
          <Alert type="error" className="mb-4">
            {errors.general}
          </Alert>
          <Link to={paths.dashboard}>
            <Button variant="secondary" icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentUser) {
    return (
      <div className={`min-h-screen p-8 ${getThemeClasses('page-bg')}`}>
        <div className="max-w-4xl mx-auto">
          <Alert type="warning">No account data found</Alert>
          <Link to={paths.dashboard} className="mt-4">
            <Button variant="secondary" icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <div className="shadow-sm">
        <div className={`rounded-lg ${getThemeClasses('bg-gradient-secondary')}`}>
          {/* Header with Actions */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                <UserCircleIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" />
                {title || "My Profile"}
              </h2>
              <div className="flex gap-2 sm:gap-3">
                <Link to={paths.dashboard}>
                  <Button variant="outline" icon={ArrowLeftIcon}>
                    Back to Dashboard
                  </Button>
                </Link>
                <Link to={paths.update}>
                  <Button
                    variant="outline"
                    disabled={currentUser.status === 2}
                    icon={PencilIcon}
                  >
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg ${getThemeClasses('card-border')}`}>
            <div className="px-4 sm:px-6 py-6">

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {successMessage}
                  </span>
                  <button
                    onClick={() => setSuccessMessage("")}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Tabs */}
              {showTabs && (
                <div className="mb-6">
                  <Tabs
                    tabs={tabItems}
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                      const tab = tabItems.find((t) => t.id === tabId);
                      if (tab?.href) {
                        navigate(tab.href);
                      } else {
                        setActiveTab(tabId);
                      }
                    }}
                  />
                </div>
              )}

              {/* Main Content */}
              {activeTab === "detail" && (
                <div className="space-y-6">

                  {/* Personal Information Card */}
                  {fieldConfig.personalFields && fieldConfig.personalFields.length > 0 && (
                    <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
                      <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                          <UserCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                          <span className="truncate">Personal Information</span>
                        </h3>
                      </div>
                      <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          {fieldConfig.personalFields.includes("firstName") && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                First Name
                              </dt>
                              <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                                {renderFieldValue("firstName", currentUser.firstName, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.personalFields.includes("lastName") && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Last Name
                              </dt>
                              <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                                {renderFieldValue("lastName", currentUser.lastName, currentUser)}
                              </dd>
                            </div>
                          )}



                          {fieldConfig.personalFields.includes("description") && currentUser.description && (
                            <div className="sm:col-span-2">
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Description
                              </dt>
                              <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                                {renderFieldValue("description", currentUser.description, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.personalFields.includes("tags") && currentUser.tags && currentUser.tags.length > 0 && (
                            <div className="sm:col-span-2">
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Tags
                              </dt>
                              <dd className="mt-1">
                                {renderFieldValue("tags", currentUser.tags, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.personalFields.includes("skillSets") && currentUser.skillSets && currentUser.skillSets.length > 0 && (
                            <div className="sm:col-span-2">
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Skill Sets
                              </dt>
                              <dd className="mt-1">
                                {renderFieldValue("skillSets", currentUser.skillSets, currentUser)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* Custom sections can be inserted here */}
                  {customSections.beforeContact && customSections.beforeContact(currentUser)}

                  {/* Contact Information Card */}
                  {fieldConfig.contactFields && fieldConfig.contactFields.length > 0 && (
                    <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
                      <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                          <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                          <span className="truncate">Contact Information</span>
                        </h3>
                      </div>
                      <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          {fieldConfig.contactFields.includes("email") && (
                            <div className="sm:col-span-2">
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")} flex items-center`}>
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                Email
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base">
                                {renderFieldValue("email", currentUser.email, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.contactFields.includes("isOkToEmail") && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Email Consent
                              </dt>
                              <dd className="mt-1">
                                {renderFieldValue("isOkToEmail", currentUser.isOkToEmail, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.contactFields.includes("isOkToText") && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Text Consent
                              </dt>
                              <dd className="mt-1">
                                {renderFieldValue("isOkToText", currentUser.isOkToText, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.contactFields.includes("phone") && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")} flex items-center`}>
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                Phone
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base">
                                {renderFieldValue("phone", currentUser.phone, currentUser)}
                              </dd>
                            </div>
                          )}

                          {fieldConfig.contactFields.includes("otherPhone") && currentUser.otherPhone && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Other Phone
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base">
                                {renderFieldValue("otherPhone", currentUser.otherPhone, currentUser)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* Address Card */}
                  {fieldConfig.addressFields && fieldConfig.addressFields.length > 0 && currentUser.fullAddressWithPostalCode && (
                    <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
                      <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                          <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                          <span className="truncate">Address</span>
                        </h3>
                      </div>
                      <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")} mb-2`}>
                            Location
                          </dt>
                          <dd className="text-sm sm:text-base">
                            {renderFieldValue("fullAddressWithPostalCode", currentUser.fullAddressWithPostalCode, currentUser)}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Emergency Contact Card (for applicable roles) */}
                  {fieldConfig.showEmergencyContact && (currentUser.emergencyContactName || currentUser.emergencyContactTelephone) && (
                    <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
                      <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                          <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                          <span className="truncate">Emergency Contact</span>
                        </h3>
                      </div>
                      <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                              Name
                            </dt>
                            <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                              {renderFieldValue("emergencyContactName", currentUser.emergencyContactName, currentUser)}
                            </dd>
                          </div>

                          <div>
                            <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                              Relationship
                            </dt>
                            <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                              {renderFieldValue("emergencyContactRelationship", currentUser.emergencyContactRelationship, currentUser)}
                            </dd>
                          </div>

                          <div>
                            <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                              Telephone
                            </dt>
                            <dd className="mt-1 text-sm sm:text-base">
                              {renderFieldValue("emergencyContactTelephone", currentUser.emergencyContactTelephone, currentUser)}
                            </dd>
                          </div>

                          {currentUser.emergencyContactAlternativeTelephone && (
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                                Alternative Telephone
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base">
                                {renderFieldValue("emergencyContactAlternativeTelephone", currentUser.emergencyContactAlternativeTelephone, currentUser)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}


                  {/* System Information Card */}
                  <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                        <CogIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                        <span className="truncate">System Information</span>
                      </h3>
                    </div>
                    <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")} flex items-center`}>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Created At
                          </dt>
                          <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                            {renderFieldValue("createdAt", currentUser.createdAt, currentUser)}
                          </dd>
                        </div>

                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")} flex items-center`}>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Modified At
                          </dt>
                          <dd className={`mt-1 text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                            {renderFieldValue("modifiedAt", currentUser.modifiedAt, currentUser)}
                          </dd>
                        </div>

                        {userType === 'admin' && (
                          <div>
                            <dt className={`text-sm sm:text-base font-medium ${getThemeClasses("text-muted")}`}>
                              Account Type
                            </dt>
                            <dd className="mt-1">
                              <Badge variant={getRoleBadgeVariant(currentUser.role)} size="lg">
                                {getRoleDisplayName(currentUser.role)}
                              </Badge>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Custom sections can be inserted here */}
                  {customSections.afterSystemInfo && customSections.afterSystemInfo(currentUser)}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailView;