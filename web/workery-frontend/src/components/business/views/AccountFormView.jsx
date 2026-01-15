import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Button,
  Alert,
  Input,
  Select,
  Checkbox,
  Textarea,
  DateInput,
} from "../../UIX";
import {
  Loading,
  FormGroup,
  FormSection,
  Badge,
  MultiSelect,
} from "../../UIX";
import {
  UserCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../constants/Roles";
import {
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
  COUNTRY_OPTIONS,
  REGION_OPTIONS,
  LANGUAGE_OPTIONS,
  getAccountFieldConfig,
  ACCOUNT_PATHS,
} from "../../../constants/Account";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../constants/Staff";
import { FACILITATOR_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../constants/Facilitator";
import { ensureISODateForAPI } from "../../../services/Helpers/DateFormatter";

function AccountFormView({
  // User type configuration
  userType, // 'admin', 'customer', 'facilitator', 'jobseeker', 'root'
  userRole, // For staff: 1=Executive, 2=Management, 3=Frontline
  isCreateMode = false, // true for create, false for update

  // Services
  accountManager,
  authManager,
  tagManager,
  vehicleTypeManager,
  howHearAboutUsItemManager,

  // Display configuration
  title,
  subtitle,

  // Form configuration
  customFields = {},
  customValidation = {},
  customSubmitData = {},

  // Callbacks
  onSubmitSuccess,
  onSubmitError,
  onDataLoad,
  onError,
}) {
  return (
    <UIXThemeProvider>
      <AccountFormViewContent
        userType={userType}
        userRole={userRole}
        isCreateMode={isCreateMode}
        accountManager={accountManager}
        authManager={authManager}
        tagManager={tagManager}
        vehicleTypeManager={vehicleTypeManager}
        howHearAboutUsItemManager={howHearAboutUsItemManager}
        title={title}
        subtitle={subtitle}
        customFields={customFields}
        customValidation={customValidation}
        customSubmitData={customSubmitData}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitError={onSubmitError}
        onDataLoad={onDataLoad}
        onError={onError}
      />
    </UIXThemeProvider>
  );
}

function AccountFormViewContent({
  userType,
  userRole,
  isCreateMode,
  accountManager,
  authManager,
  tagManager,
  vehicleTypeManager,
  howHearAboutUsItemManager,
  title,
  subtitle,
  // eslint-disable-next-line no-unused-vars
  customFields,
  // eslint-disable-next-line no-unused-vars
  customValidation,
  customSubmitData,
  onSubmitSuccess,
  onSubmitError,
  onDataLoad,
  onError,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();

  // Get paths and field configuration
  const paths = useMemo(() => ACCOUNT_PATHS[userType] || ACCOUNT_PATHS.admin, [userType]);
  const fieldConfig = useMemo(() =>
    getAccountFieldConfig(userRole, userType),
    [userRole, userType]
  );

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields - Common
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [phoneExtension, setPhoneExtension] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToEmail, setIsOkToEmail] = useState(false);
  const [isOkToText, setIsOkToText] = useState(false);
  const [faxNumber, setFaxNumber] = useState("");

  // Address fields
  const [country, setCountry] = useState("CA");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Shipping address fields
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("CA");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Professional fields
  const [limitSpecial, setLimitSpecial] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Emergency contact fields
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState("");
  const [emergencyContactAlternativeTelephone, setEmergencyContactAlternativeTelephone] = useState("");

  // Metrics fields
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsId, setHowDidYouHearAboutUsId] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] = useState(false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState(0);
  const [genderOther, setGenderOther] = useState("");
  const [identifyAs, setIdentifyAs] = useState([]);
  const [agreePromotionsEmail, setAgreePromotionsEmail] = useState(false);

  // Organization fields (for customer)
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizationTypeOther, setOrganizationTypeOther] = useState("");

  // Options for dropdowns
  const [tagOptions, setTagOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [howHearOptions, setHowHearOptions] = useState([]);

  // Handlers
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Check if user is Executive (simplified form)
  const isExecutive = useMemo(() =>
    userRole === EXECUTIVE_ROLE_ID,
    [userRole]
  );

  // Get phone type options based on user type
  const getPhoneTypeOptions = useCallback(() => {
    if (userType === 'facilitator') {
      return FACILITATOR_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS;
    }
    return STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS;
  }, [userType]);

  // Fetch account details and options for update mode
  useEffect(() => {
    if (isCreateMode) return;

    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        // Fetch account details
        const profileData = await accountManager.getAccountDetail(onUnauthorized);

        if (!mounted) return;

        // Validate that this is the correct user type
        if (userType === 'admin' && ![EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(profileData.role)) {
          navigate("/501");
          return;
        }

        setCurrentUser(profileData);

        // Populate form fields
        setFirstName(profileData.firstName || "");
        setLastName(profileData.lastName || "");
        setEmail(profileData.email || "");
        setPhone(profileData.phone || "");
        setPhoneType(profileData.phoneType || 0);
        setPhoneExtension(profileData.phoneExtension || "");
        setOtherPhone(profileData.otherPhone || "");
        setOtherPhoneType(profileData.otherPhoneType || 0);
        setOtherPhoneExtension(profileData.otherPhoneExtension || "");
        setIsOkToEmail(profileData.isOkToEmail || false);
        setIsOkToText(profileData.isOkToText || false);
        setFaxNumber(profileData.faxNumber || "");
        setAgreePromotionsEmail(profileData.agreePromotionsEmail || false);

        // Address
        setCountry(profileData.country || "CA");
        setRegion(profileData.region || "");
        setCity(profileData.city || "");
        setAddressLine1(profileData.addressLine1 || "");
        setAddressLine2(profileData.addressLine2 || "");
        setPostalCode(profileData.postalCode || "");

        // Shipping address
        setHasShippingAddress(profileData.hasShippingAddress || false);
        setShippingName(profileData.shippingName || "");
        setShippingPhone(profileData.shippingPhone || "");
        setShippingCountry(profileData.shippingCountry || "CA");
        setShippingRegion(profileData.shippingRegion || "");
        setShippingCity(profileData.shippingCity || "");
        setShippingAddressLine1(profileData.shippingAddressLine1 || "");
        setShippingAddressLine2(profileData.shippingAddressLine2 || "");
        setShippingPostalCode(profileData.shippingPostalCode || "");

        // Professional fields (non-Executive only)
        if (profileData.role !== EXECUTIVE_ROLE_ID) {
          setLimitSpecial(profileData.limitSpecial || "");
          setPoliceCheck(profileData.policeCheck || "");
          setDriversLicenseClass(profileData.driversLicenseClass || "");
          setDescription(profileData.description || "");
          setPreferredLanguage(profileData.preferredLanguage || "English");

          // Vehicle types
          if (profileData.vehicleTypes && profileData.vehicleTypes.length > 0) {
            const vehicleTypeIds = profileData.vehicleTypes.map((vt) => vt.id);
            setVehicleTypes(vehicleTypeIds);
          }

          // Emergency contact
          setEmergencyContactName(profileData.emergencyContactName || "");
          setEmergencyContactRelationship(profileData.emergencyContactRelationship || "");
          setEmergencyContactTelephone(profileData.emergencyContactTelephone || "");
          setEmergencyContactAlternativeTelephone(profileData.emergencyContactAlternativeTelephone || "");

          // Metrics
          if (profileData.tags && profileData.tags.length > 0) {
            const tagIds = profileData.tags.map((tag) => tag.id);
            setTags(tagIds);
          }

          setHowDidYouHearAboutUsId(profileData.howDidYouHearAboutUsId || "");
          setIsHowDidYouHearAboutUsOther(profileData.howDidYouHearAboutUsText === "Other");
          setHowDidYouHearAboutUsOther(profileData.howDidYouHearAboutUsOther || "");
          setBirthDate(profileData.birthDate || "");
          setGender(profileData.gender || 0);
          setGenderOther(profileData.genderOther || "");

          if (profileData.identifyAs && profileData.identifyAs.length > 0) {
            setIdentifyAs(profileData.identifyAs);
          }
        }

        // Organization fields (for customer)
        if (userType === 'customer') {
          setOrganizationName(profileData.organizationName || "");
          setOrganizationType(profileData.organizationType || "");
          setOrganizationTypeOther(profileData.organizationTypeOther || "");
        }

        // Call onDataLoad callback if provided
        if (onDataLoad) {
          onDataLoad(profileData);
        }

      } catch (error) {
        console.error("Failed to fetch account details:", error);
        if (mounted) {
          const errorMessage = error.message || "Failed to load account details";
          setErrors({ general: errorMessage });

          if (onError) {
            onError(error);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [accountManager, onUnauthorized, userType, userRole, navigate, isCreateMode, onDataLoad, onError]);

  // Fetch dropdown options
  useEffect(() => {
    if (isExecutive || !fieldConfig.showMetrics) return;

    let mounted = true;

    const fetchOptions = async () => {
      try {
        // Fetch tags
        if (tagManager) {
          try {
            const tagsResponse = await tagManager.getSelectOptions(onUnauthorized);
            if (mounted && tagsResponse && tagsResponse.results) {
              const tagOpts = tagsResponse.results.map((tag) => ({
                value: tag.id,
                label: tag.text,
              }));
              setTagOptions(tagOpts);
            }
          } catch {
            // Silent fail for options
          }
        }

        // Fetch vehicle types
        if (vehicleTypeManager) {
          try {
            const vehicleTypesResponse = await vehicleTypeManager.getSelectOptions(onUnauthorized);
            if (mounted && vehicleTypesResponse && vehicleTypesResponse.results) {
              const vehicleOpts = vehicleTypesResponse.results.map((vt) => ({
                value: vt.id,
                label: vt.text,
              }));
              setVehicleTypeOptions(vehicleOpts);
            }
          } catch {
            // Silent fail for options
          }
        }

        // Fetch how hear about us items
        if (howHearAboutUsItemManager) {
          try {
            const howHearResponse = await howHearAboutUsItemManager.getSelectOptions(onUnauthorized);
            if (mounted && howHearResponse && howHearResponse.results) {
              const howHearOpts = howHearResponse.results.map((item) => ({
                value: item.id,
                label: item.text,
              }));
              setHowHearOptions(howHearOpts);
            }
          } catch {
            // Silent fail for options
          }
        }
      } catch {
        // Silent fail for dropdown options
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, [
    tagManager,
    vehicleTypeManager,
    howHearAboutUsItemManager,
    onUnauthorized,
    isExecutive,
    fieldConfig.showMetrics,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setErrors({});
    setSuccessMessage("");

    // Prepare payload outside try block so it's accessible in catch
    let payload = null;
    try {
      // Build payload
      payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        otherPhone: otherPhone.trim(),
        otherPhoneType: parseInt(otherPhoneType) || 0,
        otherPhoneExtension: otherPhoneExtension.trim(),
        isOkToText: isOkToText,
        faxNumber: faxNumber.trim(),
        country: country,
        region: region,
        city: city.trim(),
        hasShippingAddress: hasShippingAddress,
      };

      // Only include these fields for non-Executive users
      if (!isExecutive) {
        payload = {
          ...payload,
          phoneType: parseInt(phoneType) || 0,
          phoneExtension: phoneExtension.trim(),
          isOkToEmail: isOkToEmail,
          agreePromotionsEmail: agreePromotionsEmail,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          postalCode: postalCode.trim(),
        };
      }

      // Add shipping address if enabled
      if (hasShippingAddress) {
        payload = {
          ...payload,
          shippingName: shippingName.trim(),
          shippingPhone: shippingPhone.trim(),
          shippingCountry: shippingCountry,
          shippingRegion: shippingRegion,
          shippingCity: shippingCity.trim(),
          shippingAddressLine1: shippingAddressLine1.trim(),
          shippingAddressLine2: shippingAddressLine2.trim(),
          shippingPostalCode: shippingPostalCode.trim(),
        };
      }

      // Add additional fields for non-Executive staff
      if (!isExecutive) {
        payload = {
          ...payload,
          limitSpecial: limitSpecial.trim(),
          policeCheck: policeCheck ? ensureISODateForAPI(policeCheck) : "",
          driversLicenseClass: driversLicenseClass.trim(),
          vehicleTypes: vehicleTypes,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactRelationship: emergencyContactRelationship.trim(),
          emergencyContactTelephone: emergencyContactTelephone.trim(),
          emergencyContactAlternativeTelephone: emergencyContactAlternativeTelephone.trim(),
          description: description.trim(),
          preferredLanguage: preferredLanguage,
          tags: tags,
          gender: parseInt(gender) || 0,
          genderOther: genderOther.trim(),
          birthDate: birthDate ? ensureISODateForAPI(birthDate) : "",
          howDidYouHearAboutUsId: howDidYouHearAboutUsId,
          isHowDidYouHearAboutUsOther: isHowDidYouHearAboutUsOther,
          howDidYouHearAboutUsOther: howDidYouHearAboutUsOther.trim(),
          identifyAs: identifyAs,
        };
      }

      // Add organization fields for customer
      if (userType === 'customer') {
        payload = {
          ...payload,
          organizationName: organizationName.trim(),
          organizationType: organizationType,
          organizationTypeOther: organizationTypeOther.trim(),
        };
      }

      // Apply custom submit data modifications
      if (customSubmitData) {
        payload = { ...payload, ...customSubmitData(payload) };
      }

      // Submit
      const response = isCreateMode
        ? await accountManager.createAccount(payload, onUnauthorized)
        : await accountManager.updateAccount(payload, onUnauthorized);

      const successMsg = isCreateMode
        ? "Account created successfully!"
        : "Profile updated successfully!";

      setSuccessMessage(successMsg);

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(response, payload);
      } else {
        // Default redirect behavior
        setTimeout(() => {
          navigate(paths.detail, {
            state: { successMessage: successMsg }
          });
        }, 2000);
      }

    } catch (error) {
      console.error("Failed to save account:", error);
      const errorData = error || { general: `Failed to ${isCreateMode ? 'create account' : 'update profile'}` };
      setErrors(errorData);

      // Call error callback
      if (onSubmitError) {
        onSubmitError(error, payload);
      }

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  }, [
    firstName, lastName, email, phone, phoneType, phoneExtension,
    otherPhone, otherPhoneType, otherPhoneExtension, isOkToEmail,
    isOkToText, faxNumber, country, region, city, addressLine1,
    addressLine2, postalCode, hasShippingAddress, shippingName,
    shippingPhone, shippingCountry, shippingRegion, shippingCity,
    shippingAddressLine1, shippingAddressLine2, shippingPostalCode,
    limitSpecial, policeCheck, driversLicenseClass, vehicleTypes,
    emergencyContactName, emergencyContactRelationship,
    emergencyContactTelephone, emergencyContactAlternativeTelephone,
    description, preferredLanguage, tags, gender, genderOther,
    birthDate, howDidYouHearAboutUsId, isHowDidYouHearAboutUsOther,
    howDidYouHearAboutUsOther, identifyAs, agreePromotionsEmail,
    organizationName, organizationType, organizationTypeOther,
    isExecutive, userType, isCreateMode, accountManager,
    onUnauthorized, customSubmitData, onSubmitSuccess,
    onSubmitError, navigate, paths.detail
  ]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Dashboard", to: paths.dashboard, icon: HomeIcon },
    ];

    if (!isCreateMode) {
      items.push({
        label: "My Profile",
        to: paths.detail,
        icon: UserCircleIcon,
      });
    }

    items.push({
      label: isCreateMode ? "Create Account" : "Edit",
      icon: PencilIcon,
    });

    return items;
  }, [paths.dashboard, paths.detail, isCreateMode]);

  // Loading state
  if (isLoading) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  // No data state for update mode
  if (!isCreateMode && !currentUser) {
    return (
      <div className={`min-h-screen p-8 ${getThemeClasses('page-background')}`}>
        <Alert type="warning">No account data found</Alert>
        <Link to={paths.detail} className="mt-4">
          <Button variant="secondary">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="shadow-sm mb-4 sm:mb-6">
        <div className={`rounded-lg ${getThemeClasses('bg-gradient-secondary')}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PencilIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3 text-white/80 flex-shrink-0" />
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-white">
                    {title || (isCreateMode ? "Create Account" : "Edit Profile")}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {subtitle || (isCreateMode ? "Create your account information" : "Update your account information")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link to={isCreateMode ? paths.dashboard : paths.detail}>
                  <Button variant="outline" icon={ArrowLeftIcon}>
                    {isCreateMode ? "Back to Dashboard" : "Back to Profile"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
            {isExecutive && (
              <Alert type="info">
                <InformationCircleIcon className="h-5 w-5" />
                Note: As an Executive user, some fields are restricted and cannot be edited.
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-6">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errors.general && (
        <Alert type="error" className="mb-6">
          <XCircleIcon className="h-5 w-5" />
          {errors.general}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <IdentificationIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
              <span className="truncate">Personal Information</span>
            </h2>
          </div>
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  required
                  error={errors.firstName}
                  placeholder="Enter your first name"
                />
              </FormGroup>

              <FormGroup>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  required
                  error={errors.lastName}
                  placeholder="Enter your last name"
                />
              </FormGroup>

              {!isExecutive && fieldConfig.personalFields?.includes("birthDate") && (
                <FormGroup>
                  <DateInput
                    label="Date of Birth"
                    value={birthDate}
                    onChange={(value) => setBirthDate(value)}
                    error={errors.birthDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </FormGroup>
              )}

              {!isExecutive && fieldConfig.personalFields?.includes("gender") && (
                <FormGroup>
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(value) => setGender(parseInt(value))}
                    options={GENDER_OPTIONS}
                    error={errors.gender}
                  />
                </FormGroup>
              )}

              {!isExecutive && gender === 1 && (
                <FormGroup className="md:col-span-2">
                  <Input
                    label="Gender (Other)"
                    value={genderOther}
                    onChange={setGenderOther}
                    error={errors.genderOther}
                    placeholder="Please specify"
                  />
                </FormGroup>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
              <span className="truncate">Contact Information</span>
            </h2>
          </div>
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup className="md:col-span-2">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  required
                  error={errors.email}
                  placeholder="email@example.com"
                />
              </FormGroup>

              {/* Only show email agreement checkboxes for non-Executives */}
              {!isExecutive && fieldConfig.contactFields?.includes("isOkToEmail") && (
                <FormGroup className="md:col-span-2">
                  <Checkbox
                    label="I agree to receive electronic emails"
                    checked={isOkToEmail}
                    onChange={setIsOkToEmail}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Input
                  type="tel"
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  required
                  error={errors.phone}
                  placeholder="(123) 456-7890"
                />
              </FormGroup>

              {/* Only show phone type for non-Executives */}
              {!isExecutive && fieldConfig.contactFields?.includes("phoneType") && (
                <FormGroup>
                  <Select
                    label="Phone Type"
                    value={phoneType}
                    onChange={(value) => setPhoneType(parseInt(value))}
                    options={getPhoneTypeOptions()}
                    error={errors.phoneType}
                  />
                </FormGroup>
              )}

              {!isExecutive && fieldConfig.contactFields?.includes("phoneExtension") && (
                <FormGroup>
                  <Input
                    label="Phone Extension (Optional)"
                    value={phoneExtension}
                    onChange={setPhoneExtension}
                    error={errors.phoneExtension}
                    placeholder="1234"
                  />
                </FormGroup>
              )}

              <FormGroup className="md:col-span-2">
                <Checkbox
                  label="I agree to receive text messages"
                  checked={isOkToText}
                  onChange={setIsOkToText}
                />
              </FormGroup>

              <FormGroup>
                <Input
                  type="tel"
                  label="Other Phone (Optional)"
                  value={otherPhone}
                  onChange={setOtherPhone}
                  error={errors.otherPhone}
                  placeholder="(123) 456-7890"
                />
              </FormGroup>

              <FormGroup>
                <Select
                  label="Other Phone Type (Optional)"
                  value={otherPhoneType}
                  onChange={(value) => setOtherPhoneType(parseInt(value))}
                  options={getPhoneTypeOptions()}
                  error={errors.otherPhoneType}
                />
              </FormGroup>

              {!isExecutive && fieldConfig.contactFields?.includes("otherPhoneExtension") && (
                <>
                  <FormGroup>
                    <Input
                      label="Other Phone Extension (Optional)"
                      value={otherPhoneExtension}
                      onChange={setOtherPhoneExtension}
                      error={errors.otherPhoneExtension}
                      placeholder="1234"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Input
                      type="tel"
                      label="Fax Number (Optional)"
                      value={faxNumber}
                      onChange={setFaxNumber}
                      error={errors.faxNumber}
                      placeholder="(123) 456-7890"
                    />
                  </FormGroup>
                </>
              )}

              {/* Only show promotional email checkbox for non-Executives */}
              {!isExecutive && fieldConfig.contactFields?.includes("agreePromotionsEmail") && (
                <FormGroup className="md:col-span-2">
                  <Checkbox
                    label="I agree to receive promotional emails"
                    checked={agreePromotionsEmail}
                    onChange={setAgreePromotionsEmail}
                  />
                </FormGroup>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
              <span className="truncate">Address Information</span>
            </h2>
          </div>
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
            {!isExecutive && fieldConfig.addressFields?.includes("hasShippingAddress") && (
              <FormGroup className="mb-6">
                <Checkbox
                  label="Has shipping address different from billing address"
                  checked={hasShippingAddress}
                  onChange={setHasShippingAddress}
                />
              </FormGroup>
            )}

            <div className={hasShippingAddress ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
              <div>
                {hasShippingAddress && (
                  <h3 className={`text-sm sm:text-base font-medium mb-4 ${getThemeClasses("text-secondary")}`}>
                    Billing Address
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup>
                    <Select
                      label="Country"
                      value={country}
                      onChange={setCountry}
                      options={COUNTRY_OPTIONS}
                      required
                      error={errors.country}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Select
                      label="Province/State"
                      value={region}
                      onChange={setRegion}
                      options={REGION_OPTIONS[country] || []}
                      required
                      error={errors.region}
                    />
                  </FormGroup>

                  <FormGroup className="md:col-span-2">
                    <Input
                      label="City"
                      value={city}
                      onChange={setCity}
                      required
                      error={errors.city}
                      placeholder="Enter city"
                    />
                  </FormGroup>

                  {/* Only show address line 1 for non-Executives */}
                  {!isExecutive && fieldConfig.addressFields?.includes("addressLine1") && (
                    <>
                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Address Line 1"
                          value={addressLine1}
                          onChange={setAddressLine1}
                          required
                          error={errors.addressLine1}
                          placeholder="Street address"
                        />
                      </FormGroup>

                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Address Line 2 (Optional)"
                          value={addressLine2}
                          onChange={setAddressLine2}
                          error={errors.addressLine2}
                          placeholder="Apartment, suite, etc."
                        />
                      </FormGroup>

                      <FormGroup>
                        <Input
                          label="Postal Code"
                          value={postalCode}
                          onChange={setPostalCode}
                          required
                          error={errors.postalCode}
                          placeholder="A1B 2C3"
                        />
                      </FormGroup>
                    </>
                  )}
                </div>
              </div>

              {hasShippingAddress && (
                <div>
                  <h3 className={`text-sm sm:text-base font-medium mb-4 ${getThemeClasses("text-secondary")}`}>
                    Shipping Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Contact Name"
                        value={shippingName}
                        onChange={setShippingName}
                        error={errors.shippingName}
                        placeholder="Contact name for shipping"
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Contact Phone"
                        value={shippingPhone}
                        onChange={setShippingPhone}
                        error={errors.shippingPhone}
                        placeholder="(123) 456-7890"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Select
                        label="Country"
                        value={shippingCountry}
                        onChange={setShippingCountry}
                        options={COUNTRY_OPTIONS}
                        error={errors.shippingCountry}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Select
                        label="Province/State"
                        value={shippingRegion}
                        onChange={setShippingRegion}
                        options={REGION_OPTIONS[shippingCountry] || []}
                        error={errors.shippingRegion}
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="City"
                        value={shippingCity}
                        onChange={setShippingCity}
                        error={errors.shippingCity}
                        placeholder="Enter city"
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Address Line 1"
                        value={shippingAddressLine1}
                        onChange={setShippingAddressLine1}
                        error={errors.shippingAddressLine1}
                        placeholder="Street address"
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Address Line 2 (Optional)"
                        value={shippingAddressLine2}
                        onChange={setShippingAddressLine2}
                        error={errors.shippingAddressLine2}
                        placeholder="Apartment, suite, etc."
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        label="Postal Code"
                        value={shippingPostalCode}
                        onChange={setShippingPostalCode}
                        error={errors.shippingPostalCode}
                        placeholder="A1B 2C3"
                      />
                    </FormGroup>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info (Management/Frontline only) */}
        {!isExecutive && fieldConfig.showProfessionalInfo && (
          <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <BriefcaseIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                <span className="truncate">Profile Info</span>
              </h2>
            </div>
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fieldConfig.professionalFields?.includes("limitSpecial") && (
                  <FormGroup className="md:col-span-2">
                    <Textarea
                      label="Profile Notes (Optional)"
                      value={limitSpecial}
                      onChange={(e) => setLimitSpecial(e.target.value)}
                      error={errors.limitSpecial}
                      rows={4}
                      placeholder="Enter optional profile notes here..."
                      helperText="Maximum 638 characters"
                    />
                  </FormGroup>
                )}

                {fieldConfig.professionalFields?.includes("policeCheck") && (
                  <FormGroup>
                    <DateInput
                      label="Police Check Expiry (Optional)"
                      value={policeCheck}
                      onChange={(value) => setPoliceCheck(value)}
                      error={errors.policeCheck}
                    />
                  </FormGroup>
                )}

                {fieldConfig.professionalFields?.includes("driversLicenseClass") && (
                  <FormGroup>
                    <Input
                      label="Driver's License Class (Optional)"
                      value={driversLicenseClass}
                      onChange={setDriversLicenseClass}
                      error={errors.driversLicenseClass}
                      placeholder="e.g., G, G2"
                    />
                  </FormGroup>
                )}

                {fieldConfig.professionalFields?.includes("vehicleTypes") && vehicleTypeOptions.length > 0 && (
                  <FormGroup className="md:col-span-2">
                    <MultiSelect
                      label="Vehicle Types (Optional)"
                      options={vehicleTypeOptions}
                      value={vehicleTypes}
                      onChange={setVehicleTypes}
                      error={errors.vehicleTypes}
                      placeholder="Select vehicle types..."
                    />
                  </FormGroup>
                )}

                {fieldConfig.professionalFields?.includes("description") && (
                  <FormGroup className="md:col-span-2">
                    <Textarea
                      label="Description (Optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      error={errors.description}
                      rows={4}
                      placeholder="Enter a description..."
                      helperText="Maximum 638 characters"
                    />
                  </FormGroup>
                )}

                {fieldConfig.professionalFields?.includes("preferredLanguage") && (
                  <FormGroup>
                    <label className={`block text-sm sm:text-base font-semibold mb-3 ${getThemeClasses("text-primary")}`}>
                      Preferred Language
                    </label>
                    <div className="space-y-3">
                      {LANGUAGE_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="preferredLanguage"
                            value={option.value}
                            checked={preferredLanguage === option.value}
                            onChange={(e) => setPreferredLanguage(e.target.value)}
                            className={`mr-3 h-4 w-4 ${getThemeClasses("radio-primary")} ${getThemeClasses("radio-border")} focus:ring-2 ${getThemeClasses("radio-focus-ring")}`}
                          />
                          <span className={`text-sm sm:text-base ${getThemeClasses("text-primary")}`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormGroup>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {!isExecutive && fieldConfig.showEmergencyContact && (
          <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                <span className="truncate">Emergency Contact</span>
              </h2>
            </div>
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    label="Contact Name"
                    value={emergencyContactName}
                    onChange={setEmergencyContactName}
                    error={errors.emergencyContactName}
                    placeholder="Emergency contact name"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="Relationship"
                    value={emergencyContactRelationship}
                    onChange={setEmergencyContactRelationship}
                    error={errors.emergencyContactRelationship}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="tel"
                    label="Contact Phone"
                    value={emergencyContactTelephone}
                    onChange={setEmergencyContactTelephone}
                    error={errors.emergencyContactTelephone}
                    placeholder="(123) 456-7890"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="tel"
                    label="Alternative Phone (Optional)"
                    value={emergencyContactAlternativeTelephone}
                    onChange={setEmergencyContactAlternativeTelephone}
                    error={errors.emergencyContactAlternativeTelephone}
                    placeholder="(123) 456-7890"
                  />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {!isExecutive && fieldConfig.showMetrics && (
          <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ChartBarIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                <span className="truncate">Additional Information</span>
              </h2>
            </div>
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tagOptions.length > 0 && (
                  <FormGroup className="md:col-span-2">
                    <MultiSelect
                      label="Tags (Optional)"
                      options={tagOptions}
                      value={tags}
                      onChange={setTags}
                      error={errors.tags}
                      placeholder="Select tags..."
                    />
                  </FormGroup>
                )}

                {howHearOptions.length > 0 && (
                  <FormGroup className="md:col-span-2">
                    <Select
                      label="How did you hear about us?"
                      value={howDidYouHearAboutUsId}
                      onChange={(value) => {
                        setHowDidYouHearAboutUsId(value);
                        // Check if "Other" was selected
                        const selectedOption = howHearOptions.find((opt) => opt.value === value);
                        setIsHowDidYouHearAboutUsOther(selectedOption?.label === "Other");
                      }}
                      options={[{ value: "", label: "Please select" }, ...howHearOptions]}
                      error={errors.howDidYouHearAboutUsId}
                    />
                  </FormGroup>
                )}

                {isHowDidYouHearAboutUsOther && (
                  <FormGroup className="md:col-span-2">
                    <Input
                      label="How did you hear about us? (Other)"
                      value={howDidYouHearAboutUsOther}
                      onChange={setHowDidYouHearAboutUsOther}
                      error={errors.howDidYouHearAboutUsOther}
                      placeholder="Please specify..."
                    />
                  </FormGroup>
                )}

                <FormGroup className="md:col-span-2">
                  <MultiSelect
                    label="Do you identify as belonging to any of the following groups? (Optional)"
                    options={IDENTIFY_AS_OPTIONS}
                    value={identifyAs}
                    onChange={setIdentifyAs}
                    error={errors.identifyAs}
                    placeholder="Select all that apply..."
                  />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* Organization Information (for customer) */}
        {userType === 'customer' && fieldConfig.showOrganizationInfo && (
          <div className={`rounded-lg shadow-sm mb-4 sm:mb-6 ${getThemeClasses('bg-gradient-secondary')}`}>
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <BriefcaseIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                <span className="truncate">Organization Information</span>
              </h2>
            </div>
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses('card-border')}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup className="md:col-span-2">
                  <Input
                    label="Organization Name"
                    value={organizationName}
                    onChange={setOrganizationName}
                    error={errors.organizationName}
                    placeholder="Enter organization name"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="Organization Type"
                    value={organizationType}
                    onChange={setOrganizationType}
                    error={errors.organizationType}
                    placeholder="Enter organization type"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="Organization Type (Other)"
                    value={organizationTypeOther}
                    onChange={setOrganizationTypeOther}
                    error={errors.organizationTypeOther}
                    placeholder="Please specify if other"
                  />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="success"
            disabled={isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {isCreateMode ? "Create Account" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountFormView;