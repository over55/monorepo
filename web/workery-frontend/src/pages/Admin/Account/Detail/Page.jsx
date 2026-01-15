// File Path: web/workery-frontend/src/pages/Admin/Account/Detail/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../../constants/Roles";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../constants/Staff";
import {
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
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

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
  }, [accountManager, navigate, onUnauthorized]);

  // Helper functions
  const getRoleDisplayName = useCallback((role) => {
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
  }, []);

  const getRoleBadgeColor = useCallback((role) => {
    switch (role) {
      case EXECUTIVE_ROLE_ID:
        return "bg-blue-100 text-blue-800";
      case MANAGEMENT_ROLE_ID:
        return "bg-yellow-100 text-yellow-800";
      case FRONTLINE_ROLE_ID:
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getPhoneTypeDisplay = useCallback((phoneType) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === phoneType,
    );
    return option ? option.label : "-";
  }, []);

  const getGenderDisplay = useCallback((gender, genderOther) => {
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
  }, []);

  const getIdentifyAsLabels = useCallback((identifyAsArray) => {
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
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
    { label: "My Profile", icon: UserCircleIcon, isActive: true },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading account details...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Error state
  if (errors.general) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Alert type="error" className="mb-4">
          {errors.general}
        </Alert>
        <Link to="/admin/dashboard">
          <Button variant="secondary" icon={ArrowLeftIcon}>
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  // No data state
  if (!currentUser) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Alert type="warning" className="mb-4">
          No account data found
        </Alert>
        <Link to="/admin/dashboard">
          <Button variant="secondary" icon={ArrowLeftIcon}>
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <UserCircleIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
            My Profile
          </h1>
          <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
            View and manage your account information
          </p>
        </div>
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(currentUser.role)}`}>
            {getRoleDisplayName(currentUser.role)}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white rounded-lg shadow p-1">
          <span className="px-4 py-2 rounded-md bg-blue-500 text-white font-medium">
            Detail
          </span>
          <Link
            to="/admin/account/more"
            className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
          >
            More
            <EllipsisHorizontalIcon className="h-4 w-4 ml-2" />
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-end">
          <Link to="/admin/account/edit">
            <Button
              variant="primary"
              disabled={currentUser.status === 2}
              icon={PencilIcon}
            >
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
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.text}
                          </span>
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
                            <span
                              key={skill.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                            >
                              <AcademicCapIcon className="h-3 w-3 mr-1" />
                              {skill.subCategory}
                            </span>
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
                      className={themeClasses.linkPrimary}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Agreed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Not Agreed
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Text Consent
                </dt>
                <dd className="mt-1">
                  {currentUser.isOkToText ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Agreed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Not Agreed
                    </span>
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
                      className={themeClasses.linkPrimary}
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
                        className={themeClasses.linkPrimary}
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
                        className={`${themeClasses.linkPrimary} flex items-center`}
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
                            <span
                              key={req.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                            >
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              {req.name}
                            </span>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Archived
                        </span>
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
                            className={themeClasses.linkPrimary}
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
                            className={themeClasses.linkPrimary}
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
            <Button variant="secondary" icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
          </Link>

          <Link to="/admin/account/edit">
            <Button
              variant="primary"
              disabled={currentUser.status === 2}
              icon={PencilIcon}
            >
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminAccountDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminAccountDetailPage />
    </UIXThemeProvider>
  );
}

export default AdminAccountDetailPageWithProvider;
