// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Badge,
  Tabs,
} from "../../../../components/UI";
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
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../../constants/Roles";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../constants/Staff";
import {
  formatDate,
  formatDateTime,
  formatDateForDisplay,
} from "../../../../services/Helpers/DateFormatter";

/**
 * Account Detail Page for Admin Users
 * Displays profile information for Executive, Management, and Frontline staff
 */
function AdminAccountDetailPage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("detail");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch account details
  useEffect(() => {
    let mounted = true;

    const fetchAccountDetails = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const onUnauthorized = () => {
          authManager.clearAllTokens();
          navigate("/login?unauthorized=true");
        };

        const profileData =
          await accountManager.getAccountDetail(onUnauthorized);

        if (mounted) {
          // Validate that this is a staff user
          if (
            ![
              EXECUTIVE_ROLE_ID,
              MANAGEMENT_ROLE_ID,
              FRONTLINE_ROLE_ID,
            ].includes(profileData.role)
          ) {
            navigate("/501");
            return;
          }

          setCurrentUser(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch account details:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load account details" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAccountDetails();

    return () => {
      mounted = false;
    };
  }, [accountManager, authManager, navigate]);

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

  const getPhoneTypeDisplay = (phoneType) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === phoneType,
    );
    return option ? option.label : "-";
  };

  const getOrganizationTypeDisplay = (orgType) => {
    const option = STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === orgType,
    );
    return option ? option.label : "-";
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

  // Tab items configuration
  const tabItems = [
    { id: "detail", label: "Detail" },
    { id: "2fa", label: "2FA", href: "/account/2fa" },
    { id: "more", label: "More", href: "/account/more" },
  ];

  // Loading state
  if (isLoading) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  // Error state
  if (errors.general) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" className="mb-4">
            {errors.general}
          </Alert>
          <Link to="/admin/dashboard">
            <Button variant="secondary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert type="warning">No account data found</Alert>
          <Link to="/admin/dashboard" className="mt-4">
            <Button variant="secondary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
            { label: "My Profile", icon: UserCircleIcon },
          ]}
        />

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCircleIcon className="w-8 h-8 mr-3 text-gray-700" />
              My Profile
            </h1>
            <p className="mt-2 text-gray-600">
              View and manage your account information
            </p>
          </div>
          <div>
            <Badge variant={getRoleBadgeVariant(currentUser.role)} size="lg">
              {getRoleDisplayName(currentUser.role)}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Main Content */}
        {activeTab === "detail" && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-end">
              <Link to="/admin/account/edit">
                <Button
                  variant="primary"
                  disabled={currentUser.status === 2}
                  className="flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Personal Information Card */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Personal Information
                </h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      First Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentUser.firstName || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentUser.lastName || "-"}
                    </dd>
                  </div>

                  {currentUser.role !== EXECUTIVE_ROLE_ID && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Date of Birth
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(currentUser.birthDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Gender
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {getGenderDisplay(
                            currentUser.gender,
                            currentUser.genderOther,
                          )}
                        </dd>
                      </div>
                      {currentUser.description && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            Description
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.description}
                          </dd>
                        </div>
                      )}
                      {currentUser.tags && currentUser.tags.length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            Tags
                          </dt>
                          <dd className="mt-1 flex flex-wrap gap-2">
                            {currentUser.tags.map((tag) => (
                              <Badge key={tag.id} variant="default" size="sm">
                                {tag.text}
                              </Badge>
                            ))}
                          </dd>
                        </div>
                      )}
                      {currentUser.skillSets &&
                        currentUser.skillSets.length > 0 && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">
                              Skill Sets
                            </dt>
                            <dd className="mt-1 flex flex-wrap gap-2">
                              {currentUser.skillSets.map((skill) => (
                                <Badge key={skill.id} variant="info" size="sm">
                                  <AcademicCapIcon className="h-3 w-3 mr-1" />
                                  {skill.subCategory}
                                </Badge>
                              ))}
                            </dd>
                          </div>
                        )}
                    </>
                  )}
                </dl>
              </div>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Contact Information
                </h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      Email
                    </dt>
                    <dd className="mt-1 text-sm">
                      {currentUser.email ? (
                        <a
                          href={`mailto:${currentUser.email}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {currentUser.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Email Consent
                    </dt>
                    <dd className="mt-1">
                      {currentUser.isOkToEmail ? (
                        <Badge variant="success" size="sm">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Agreed
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Not Agreed
                        </Badge>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Text Consent
                    </dt>
                    <dd className="mt-1">
                      {currentUser.isOkToText ? (
                        <Badge variant="success" size="sm">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Agreed
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Not Agreed
                        </Badge>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm">
                      {currentUser.phone ? (
                        <a
                          href={`tel:${currentUser.phone}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {currentUser.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getPhoneTypeDisplay(currentUser.phoneType)}
                    </dd>
                  </div>

                  {currentUser.otherPhone && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Other Phone
                        </dt>
                        <dd className="mt-1 text-sm">
                          <a
                            href={`tel:${currentUser.otherPhone}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {currentUser.otherPhone}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Other Phone Type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {getPhoneTypeDisplay(currentUser.otherPhoneType)}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </Card>

            {/* Address Card (Not for Executive role) */}
            {currentUser.role !== EXECUTIVE_ROLE_ID &&
              currentUser.fullAddressWithPostalCode && (
                <Card>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Address
                    </h2>
                  </div>
                  <div className="p-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">
                        Location
                      </dt>
                      <dd className="text-sm">
                        {currentUser.fullAddressUrl ? (
                          <a
                            href={currentUser.fullAddressUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                          >
                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                            {currentUser.fullAddressWithPostalCode}
                          </a>
                        ) : (
                          <span className="text-gray-900">
                            {currentUser.fullAddressWithPostalCode}
                          </span>
                        )}
                      </dd>
                    </div>
                  </div>
                </Card>
              )}

            {/* Account Information (Management and Frontline only) */}
            {[MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
              currentUser.role,
            ) && (
              <>
                <Card>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Professional Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {currentUser.insuranceRequirements &&
                        currentUser.insuranceRequirements.length > 0 && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">
                              Insurance Requirements
                            </dt>
                            <dd className="mt-1 flex flex-wrap gap-2">
                              {currentUser.insuranceRequirements.map((req) => (
                                <Badge key={req.id} variant="warning" size="sm">
                                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                  {req.name}
                                </Badge>
                              ))}
                            </dd>
                          </div>
                        )}

                      {currentUser.hourlySalaryDesired && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            Hourly Salary Desired
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            ${currentUser.hourlySalaryDesired}/hr
                          </dd>
                        </div>
                      )}

                      {currentUser.limitSpecial && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Special Limitations
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.limitSpecial}
                          </dd>
                        </div>
                      )}

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Dues Expiry
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(currentUser.duesDate)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Commercial Insurance Expiry
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(
                            currentUser.commercialInsuranceExpiryDate,
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Auto Insurance Expiry
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(
                            currentUser.autoInsuranceExpiryDate,
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          WSIB Insurance Date
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(currentUser.wsibInsuranceDate)}
                        </dd>
                      </div>

                      {currentUser.wsibNumber && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            WSIB Number
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.wsibNumber}
                          </dd>
                        </div>
                      )}

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Police Check Date
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateForDisplay(currentUser.policeCheck)}
                        </dd>
                      </div>

                      {currentUser.taxId && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            HST Number
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.taxId}
                          </dd>
                        </div>
                      )}

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Preferred Language
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {currentUser.preferredLanguage || "English"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Account Status
                        </dt>
                        <dd className="mt-1">
                          {currentUser.status === 1 ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="error">Archived</Badge>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Card>

                {/* Emergency Contact Card */}
                {(currentUser.emergencyContactName ||
                  currentUser.emergencyContactTelephone) && (
                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-gray-600" />
                        Emergency Contact
                      </h2>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.emergencyContactName || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Relationship
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {currentUser.emergencyContactRelationship || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Telephone
                          </dt>
                          <dd className="mt-1 text-sm">
                            {currentUser.emergencyContactTelephone ? (
                              <a
                                href={`tel:${currentUser.emergencyContactTelephone}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {currentUser.emergencyContactTelephone}
                              </a>
                            ) : (
                              "-"
                            )}
                          </dd>
                        </div>

                        {currentUser.emergencyContactAlternativeTelephone && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Alternative Telephone
                            </dt>
                            <dd className="mt-1 text-sm">
                              <a
                                href={`tel:${currentUser.emergencyContactAlternativeTelephone}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {
                                  currentUser.emergencyContactAlternativeTelephone
                                }
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </Card>
                )}

                {/* Internal Metrics Card */}
                <Card>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Internal Metrics
                    </h2>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          How did they discover us
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {currentUser.isHowDidYouHearAboutUsOther
                            ? currentUser.howDidYouHearAboutUsOther
                            : currentUser.howDidYouHearAboutUsText || "-"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Join Date
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDateTime(currentUser.joinDate)}
                        </dd>
                      </div>

                      {currentUser.identifyAs &&
                        currentUser.identifyAs.length > 0 && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">
                              Self-Identification
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {getIdentifyAsLabels(currentUser.identifyAs)}
                            </dd>
                          </div>
                        )}
                    </dl>
                  </div>
                </Card>
              </>
            )}

            {/* System Information Card */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2 text-gray-600" />
                  System Information
                </h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDateTime(currentUser.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Modified At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDateTime(currentUser.modifiedAt)}
                    </dd>
                  </div>

                  {currentUser.id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        User ID
                      </dt>
                      <dd className="mt-1 text-sm font-mono text-gray-900">
                        {currentUser.id}
                      </dd>
                    </div>
                  )}

                  {currentUser.publicId && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Public ID
                      </dt>
                      <dd className="mt-1 text-sm font-mono text-gray-900">
                        {currentUser.publicId}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Link to="/admin/dashboard">
                <Button variant="secondary" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>

              <Link to="/admin/account/edit">
                <Button
                  variant="primary"
                  disabled={currentUser.status === 2}
                  className="flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAccountDetailPage;
