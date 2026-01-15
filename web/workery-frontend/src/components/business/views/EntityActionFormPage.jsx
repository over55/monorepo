// File: monorepo/web/frontend/src/components/business/views/EntityActionFormPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Badge,
  Button,
  Alert,
  ContactLink,
  AddressDisplay,
  Input,
} from "../../UIX";
import { SkillSetsDisplay } from "../displays";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

/**
 * Reusable EntityActionFormPage component for form-based actions
 * Used for change password, update profile, etc.
 *
 * @param {React.Component} entityIcon - Icon component for the entity type
 * @param {string} entityType - Type of entity (e.g., "Staff Member", "Customer")
 * @param {string} entityTypePlural - Plural form (e.g., "Staff", "Customers")
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} entityParamName - URL parameter name for entity ID (e.g., "aid", "cid")
 * @param {object} entityManager - Manager service for the entity
 * @param {function} getEntityDetail - Function to get entity details
 * @param {React.Component} actionIcon - Icon for the specific action
 * @param {string} actionName - Name of the action (e.g., "Change Password")
 * @param {string} formDescription - Description of the form action
 * @param {Array} formFields - Array of form field configurations
 * @param {function} onFormSubmit - Function to execute the form submission
 * @param {string} successMessage - Message to show on success
 * @param {string} redirectPath - Path to redirect to after success
 * @param {Array} additionalBreadcrumbs - Additional breadcrumb items
 * @param {React.Node} additionalContent - Additional content to display
 * @param {string} submitButtonText - Text for submit button
 * @param {string} submitButtonVariant - Variant for submit button
 * @param {function} validateForm - Custom form validation function
 * @param {string} warningMessage - Warning message to display
 * @param {boolean} requiresConfirmation - Whether to show confirmation modal
 * @param {string} displayField - Field name to use for entity display name (defaults to name/firstName+lastName)
 */
function EntityActionFormPage({
  entityIcon,
  entityType = "Item",
  entityTypePlural = "Items",
  basePath = "/admin",
  entityParamName = "id",
  // eslint-disable-next-line no-unused-vars
  entityManager,
  getEntityDetail,
  actionIcon,
  actionName = "Form Action",
  formDescription = "Complete the form below",
  formFields = [],
  onFormSubmit,
  successMessage = "Form submitted successfully",
  redirectPath = null,
  additionalBreadcrumbs = [],
  additionalContent = null,
  submitButtonText = "Submit",
  submitButtonVariant = "primary",
  validateForm = null,
  warningMessage = null,
  requiresConfirmation = false,
  displayField = null,
}) {
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [formData, setFormData] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch entity details
  const fetchEntityDetails = useCallback(async () => {
    if (!entityId) return;

    setFetching(true);
    setErrors({});

    try {
      const entityData = await getEntityDetail(entityId, onUnauthorized);
      setEntity(entityData);

      // Initialize form data with default values
      const initialData = {};
      formFields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else {
          initialData[field.name] = "";
        }
      });
      setFormData(initialData);
    } catch (error) {
      console.error(`Failed to fetch ${entityType.toLowerCase()}:`, error);
      setErrors({ general: `Failed to load ${entityType.toLowerCase()} details` });
    } finally {
      setFetching(false);
    }
  }, [entityId, getEntityDetail, onUnauthorized, entityType, formFields]);

  // Initial load
  useEffect(() => {
    fetchEntityDetails();
  }, [fetchEntityDetails]);

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear field-specific errors when user types
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
    }
  };

  // Validate form
  const performFormValidation = () => {
    const newErrors = {};

    // Basic validation for required fields
    formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === "")) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Field-specific validation
      if (field.validation && formData[field.name]) {
        const validationError = field.validation(formData[field.name], formData);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });

    // Custom form validation
    if (validateForm) {
      const customErrors = validateForm(formData);
      Object.assign(newErrors, customErrors);
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationErrors = performFormValidation();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (requiresConfirmation) {
      setShowConfirmModal(true);
      return;
    }

    await executeSubmit();
  };

  // Execute the actual form submission
  const executeSubmit = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsSubmitting(true);

    try {
      await onFormSubmit(entityId, formData, onUnauthorized);
      setSuccessMsg(successMessage);

      // Navigate back after a short delay
      setTimeout(() => {
        const targetPath = redirectPath || `${basePath}/${entityId}/more`;
        navigate(targetPath);
      }, 2000);
    } catch (error) {
      console.error(`Failed to submit form:`, error);
      setErrors(error);
      setIsSubmitting(false);
    }
  };

  // Create status badge component
  const createStatusBadge = (entity) => {
    if (!entity) return null;
    if (entity.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XMarkIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (entity.status === 1) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        <ArrowPathIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
        Archived
      </Badge>
    );
  };

  // Breadcrumb configuration
  const breadcrumbs = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: entityTypePlural,
      to: basePath,
      icon: entityIcon,
    },
    {
      label: "Detail",
      to: `${basePath}/${entityId}`,
      icon: entityIcon,
    },
    {
      label: "More Actions",
      to: `${basePath}/${entityId}/more`,
      icon: EllipsisHorizontalIcon,
    },
    ...additionalBreadcrumbs,
    {
      label: actionName,
      icon: actionIcon,
      isActive: true,
    },
  ];

  // Loading state
  if (isFetching && !entity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeClasses('border-primary')} mx-auto`}></div>
            <p className={`mt-4 text-sm sm:text-base ${getThemeClasses('text-secondary')}`}>
              Loading {entityType.toLowerCase()} details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Success Message */}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          className="mb-4"
        />
      )}

      {/* Error Display */}
      {errors.general && (
        <Alert
          type="error"
          message={errors.general}
          onClose={() => setErrors({})}
          className="mb-4"
        />
      )}

      {/* Main Content with Header like AttachmentListPage */}
      <div className="shadow-sm">
        {entity && (
          <div className={`rounded-lg ${getThemeClasses('bg-gradient-secondary')}`}>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                  {actionIcon && React.createElement(actionIcon, { className: "w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" })}
                  {entityType} - {actionName}
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    icon={ChevronLeftIcon}
                    className="flex-1 sm:flex-initial"
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={fetchEntityDetails}
                    icon={ArrowPathIcon}
                    disabled={isFetching}
                    className="flex-1 sm:flex-initial"
                  >
                    {isFetching ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg ${getThemeClasses('card-border')}`}>
              {/* Entity Summary Layout like DetailLiteView */}
              <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0 order-1 xl:order-1">
                    <Avatar
                      src={entity.avatarObjectUrl}
                      alt={entity.avatarObjectUrl ? "Profile Picture" : "No Profile Picture"}
                      size="lg"
                      borderStyle="default"
                      showFallbackIcon={true}
                    />
                  </div>

                  {/* Main Content Container */}
                  <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                    {/* Primary Info Column */}
                    <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                      {/* Entity Name and Type */}
                      <div className="mb-3 sm:mb-4 lg:mb-5">
                        {entity.type === 3 && entity.organizationName && (
                          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                            <span className="break-words">
                              {entity.organizationName}
                            </span>
                          </h2>
                        )}
                        <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${getThemeClasses('text-primary')} flex items-center justify-center xl:justify-start`}>
                          <span className="break-words">
                            {displayField ? entity[displayField] : (entity.name || `${entity.firstName} ${entity.lastName}`)}
                          </span>
                        </h3>
                        <div className={`mt-2 text-sm lg:text-base ${getThemeClasses('text-secondary')}`}>
                          <Badge variant="primary" size="md">
                            {entityType}
                          </Badge>
                        </div>
                      </div>

                      {/* Event-specific fields vs Person-specific fields */}
                      {entityType === "event" ? (
                        <>
                          {/* Location */}
                          {entity.location && (
                            <div className="mb-3 sm:mb-4 lg:mb-5">
                              <div className="flex items-start space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')} mt-0.5`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div className={`flex-1 text-sm ${getThemeClasses('text-secondary')}`}>
                                  <div className={`font-medium ${getThemeClasses('text-primary')}`}>Location</div>
                                  <div>{entity.location}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          {entity.description && (
                            <div className="mb-3 sm:mb-4 lg:mb-5">
                              <div className="flex items-start space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')} mt-0.5`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className={`flex-1 text-sm ${getThemeClasses('text-secondary')}`}>
                                  <div className={`font-medium ${getThemeClasses('text-primary')}`}>Description</div>
                                  <div className="break-words">{entity.description}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Event Details */}
                          <div className="space-y-2 sm:space-y-3">
                            {/* Attendees */}
                            {entity.attendees && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Attendees:</span> {
                                    typeof entity.attendees === 'object'
                                      ? Array.isArray(entity.attendees)
                                        ? entity.attendees.map(a => typeof a === 'object' ? a.name || a.id : a).join(', ')
                                        : entity.attendees.name || entity.attendees.id || String(entity.attendees)
                                      : entity.attendees
                                  }
                                </div>
                              </div>
                            )}

                            {/* Certifications */}
                            {entity.certifications && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Certifications:</span> {
                                    typeof entity.certifications === 'object'
                                      ? Array.isArray(entity.certifications)
                                        ? entity.certifications.map(c => {
                                            if (typeof c === 'object') {
                                              return c.name || c.certificationName || c.title || c.label || c.text || `Certification ${c.id || c.certificationId || 'Unknown'}`;
                                            }
                                            return c;
                                          }).join(', ')
                                        : entity.certifications.name || entity.certifications.certificationName || entity.certifications.title || entity.certifications.label || entity.certifications.text || `Certification ${entity.certifications.id || entity.certifications.certificationId || 'Unknown'}`
                                      : entity.certifications
                                  }
                                </div>
                              </div>
                            )}

                            {/* Skills */}
                            {entity.skills && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Skills:</span> {
                                    typeof entity.skills === 'object'
                                      ? Array.isArray(entity.skills)
                                        ? entity.skills.map(s => {
                                            if (typeof s === 'object') {
                                              return s.name || s.skillName || s.title || s.label || s.text || `Skill ${s.id || s.skillId || 'Unknown'}`;
                                            }
                                            return s;
                                          }).join(', ')
                                        : entity.skills.name || entity.skills.skillName || entity.skills.title || entity.skills.label || entity.skills.text || `Skill ${entity.skills.id || entity.skills.skillId || 'Unknown'}`
                                      : entity.skills
                                  }
                                </div>
                              </div>
                            )}

                            {/* Specializations */}
                            {entity.specializations && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Specializations:</span> {
                                    typeof entity.specializations === 'object'
                                      ? Array.isArray(entity.specializations)
                                        ? entity.specializations.map(s => {
                                            if (typeof s === 'object') {
                                              return s.name || s.specializationName || s.title || s.label || s.text || `Specialization ${s.id || s.specializationId || 'Unknown'}`;
                                            }
                                            return s;
                                          }).join(', ')
                                        : entity.specializations.name || entity.specializations.specializationName || entity.specializations.title || entity.specializations.label || entity.specializations.text || `Specialization ${entity.specializations.id || entity.specializations.specializationId || 'Unknown'}`
                                      : entity.specializations
                                  }
                                </div>
                              </div>
                            )}

                            {/* Skills Sets */}
                            {entity.skillSets && (
                              <div className="mb-3 sm:mb-4 lg:mb-5">
                                <SkillSetsDisplay
                                  values={Array.isArray(entity.skillSets)
                                    ? entity.skillSets.map(s => typeof s === 'object' ? (s.id || s.skillSetId || s.value) : s)
                                    : typeof entity.skillSets === 'object'
                                      ? [entity.skillSets.id || entity.skillSets.skillSetId || entity.skillSets.value]
                                      : [entity.skillSets]
                                  }
                                  variant="secondary"
                                  className="m-0"
                                />
                              </div>
                            )}

                            {/* Scheduled Date */}
                            {(entity.scheduledDate || entity.startDate || entity.eventDate) && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Scheduled Date:</span> {entity.scheduledDate || entity.startDate || entity.eventDate}
                                </div>
                              </div>
                            )}

                            {/* Start Time */}
                            {entity.startTime && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>Start Time:</span> {entity.startTime}
                                </div>
                              </div>
                            )}

                            {/* End Time */}
                            {entity.endTime && (
                              <div className="flex items-center space-x-2">
                                <div className={`flex-shrink-0 w-5 h-5 ${getThemeClasses('text-muted')}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className={`text-sm ${getThemeClasses('text-secondary')}`}>
                                  <span className={`font-medium ${getThemeClasses('text-primary')}`}>End Time:</span> {entity.endTime}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Address for people entities */}
                          <div className="mb-3 sm:mb-4 lg:mb-5">
                            <AddressDisplay
                              addressData={entity}
                              size="md"
                              showIcon={true}
                              showMapsLink={true}
                            />
                          </div>

                          {/* Contact Information for people entities */}
                          <div className="space-y-2 sm:space-y-3">
                            <ContactLink
                              type="email"
                              value={entity.email}
                              size="md"
                              fallbackText="No email"
                            />
                            <ContactLink
                              type="phone"
                              value={entity.phone}
                              size="md"
                              fallbackText="No phone"
                            />
                            {entity.otherPhone && (
                              <ContactLink
                                type="phone"
                                value={entity.otherPhone}
                                size="md"
                                fallbackText="No phone"
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Secondary Info Column */}
                    <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                      <div className={`space-y-2 text-xs sm:text-sm lg:text-base ${getThemeClasses('text-secondary')}`}>
                        <div className="flex items-center justify-center xl:justify-start">
                          <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
                          <span className="font-medium">Status:</span>
                          <span className="ml-2">
                            {createStatusBadge(entity)}
                          </span>
                        </div>
                        {entity.createdAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">
                              {formatDateForDisplay(entity.createdAt)}
                            </span>
                          </div>
                        )}
                        {entity.modifiedAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
                            <span className="font-medium">Last Modified:</span>
                            <span className="ml-2">
                              {formatDateForDisplay(entity.modifiedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content Section */}
                <div className={`mt-8 border-t ${getThemeClasses('card-border')} pt-8`}>
                  {/* Form Description */}
                  <div className="mb-6">
                    <p className={`text-sm ${getThemeClasses('text-secondary')}`}>
                      {formDescription}
                    </p>
                  </div>

                  {/* Warning Message */}
                  {warningMessage && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Warning:</strong> {warningMessage}
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-6 mb-8">
                    {formFields.map((field, index) => (
                      <div key={field.name || index}>
                        <Input
                          label={field.label}
                          type={field.type || "text"}
                          value={formData[field.name] || ""}
                          onChange={(value) => handleFieldChange(field.name, value)}
                          placeholder={field.placeholder}
                          error={errors[field.name]}
                          required={field.required}
                          disabled={isSubmitting}
                          helpText={field.helpText}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Additional Content */}
                  {additionalContent}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`${basePath}/${entityId}/more`)}
                      icon={ChevronLeftIcon}
                      disabled={isSubmitting}
                      size="lg"
                    >
                      Back to More
                    </Button>

                    <Button
                      variant={submitButtonVariant}
                      onClick={handleSubmit}
                      icon={actionIcon}
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? "Processing..." : submitButtonText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!entity && !isFetching && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${getThemeClasses('bg-disabled')} rounded-full mb-4`}>
              {entityIcon && React.createElement(entityIcon, { className: `w-6 sm:w-8 h-6 sm:h-8 ${getThemeClasses('text-muted')}` })}
            </div>
            <h3 className={`text-base sm:text-lg font-medium ${getThemeClasses('text-primary')} mb-2`}>
              {entityType} Not Found
            </h3>
            <p className={`text-sm sm:text-base ${getThemeClasses('text-secondary')} mb-4 sm:mb-6`}>
              The {entityType.toLowerCase()} you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button
              variant="primary"
              onClick={() => window.history.back()}
              icon={ChevronLeftIcon}
              size="sm"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className={`fixed inset-0 ${getThemeClasses('bg-card')} bg-opacity-75 transition-opacity`}
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className={`relative transform overflow-hidden rounded-lg ${getThemeClasses('bg-card')} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {actionIcon && React.createElement(actionIcon, { className: "h-6 w-6 text-blue-600" })}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className={`text-lg font-semibold leading-6 ${getThemeClasses('text-primary')}`}>
                    Confirm {actionName}
                  </h3>
                  <div className="mt-2">
                    <p className={`text-sm ${getThemeClasses('text-secondary')}`}>
                      Are you sure you want to proceed with this {actionName.toLowerCase()}?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant={submitButtonVariant}
                  onClick={executeSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="mt-3 sm:mt-0 sm:mr-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntityActionFormPage;