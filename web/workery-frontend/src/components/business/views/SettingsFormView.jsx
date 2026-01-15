import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  PageHeader,
  Alert,
  FormCard,
  Input,
  Select,
  Button,
  BackToDetailsButton,
  Loading,
  LoadingOverlay,
  Card,
  Badge,
} from "../../UIX";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  HomeIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

function SettingsFormView({
  // Entity configuration (legacy props)
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,

  // Entity configuration (new props - aliases)
  entityName, // alias for entityType
  icon, // alias for entityIcon
  breadcrumbItems: breadcrumbItemsProp, // custom breadcrumbs
  fetchItem: fetchItemProp, // callback for fetching item (update mode)
  submitForm: submitFormProp, // callback for form submission
  transformFetchedData, // function to transform fetched data for form
  customValidation, // custom validation function

  // Path configuration
  basePath,
  settingsPath = "/admin/settings",
  listPath,
  detailPath, // for "Back to Details" button
  detailPathTemplate, // template with {id} placeholder

  // Mode configuration (create or update)
  mode = "create", // "create" or "update"
  id: idProp, // explicit ID for update mode

  // Form configuration
  formFields,
  fields, // alias for formFields
  validationRules,
  defaultValues, // default form values for create mode
  guidelines, // guidelines array for sidebar

  // Display configuration
  title,
  subtitle,

  // Status options (if applicable)
  statusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Inactive" }
  ],

  // Callbacks
  onFormChange,
  onSubmitSuccess,
  onSubmitError,

  // Custom components
  customPreview,
  customInfoNote,
  customFormFields,

  // Hidden fields (submitted but not rendered)
  hiddenFields = [],

  // Layout options
  actionsInline = false,

  // Item protection
  canModifyItem,
  systemProtectedMessage = "This item is system-protected and cannot be modified.",
}) {
  // Resolve aliases - prefer new props, fall back to legacy
  const resolvedEntityType = entityName || entityType || "item";
  const resolvedEntityIcon = icon || entityIcon;
  const resolvedFormFields = fields || formFields || [];

  return (
    <UIXThemeProvider>
      <SettingsFormViewContent
        entityType={resolvedEntityType}
        entityTypePlural={entityTypePlural}
        entityIcon={resolvedEntityIcon}
        entityManager={entityManager}
        breadcrumbItemsProp={breadcrumbItemsProp}
        fetchItemProp={fetchItemProp}
        submitFormProp={submitFormProp}
        transformFetchedData={transformFetchedData}
        customValidation={customValidation}
        basePath={basePath}
        settingsPath={settingsPath}
        listPath={listPath}
        detailPath={detailPath}
        detailPathTemplate={detailPathTemplate}
        mode={mode}
        idProp={idProp}
        formFields={resolvedFormFields}
        validationRules={validationRules}
        defaultValues={defaultValues}
        guidelines={guidelines}
        title={title}
        subtitle={subtitle}
        statusOptions={statusOptions}
        onFormChange={onFormChange}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitError={onSubmitError}
        customPreview={customPreview}
        customInfoNote={customInfoNote}
        customFormFields={customFormFields}
        hiddenFields={hiddenFields}
        actionsInline={actionsInline}
        canModifyItem={canModifyItem}
        systemProtectedMessage={systemProtectedMessage}
      />
    </UIXThemeProvider>
  );
}

function SettingsFormViewContent({
  entityType,
  // eslint-disable-next-line no-unused-vars
  entityTypePlural,
  entityIcon,
  entityManager,
  // eslint-disable-next-line no-unused-vars
  breadcrumbItemsProp,
  fetchItemProp,
  submitFormProp,
  transformFetchedData,
  customValidation,
  basePath,
  // eslint-disable-next-line no-unused-vars
  settingsPath,
  listPath,
  detailPath,
  detailPathTemplate,
  mode,
  idProp,
  formFields,
  validationRules,
  defaultValues,
  // eslint-disable-next-line no-unused-vars
  guidelines,
  title,
  subtitle,
  statusOptions,
  onFormChange,
  onSubmitSuccess,
  onSubmitError,
  customPreview,
  customInfoNote,
  customFormFields,
  hiddenFields,
  actionsInline,
  // eslint-disable-next-line no-unused-vars
  canModifyItem,
  // eslint-disable-next-line no-unused-vars
  systemProtectedMessage,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isUpdate = mode === "update" || !!id;

  // Loading and data state
  const [isLoading, setIsLoading] = useState(isUpdate);
  const [entityData, setEntityData] = useState(null);

  // Resolve the actual ID to use (from params or explicit prop)
  const actualId = idProp || id;

  // Form state - memoized to prevent expensive recalculations
  const initialFormData = useMemo(() => {
    // If defaultValues provided, use those as base
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      return { ...defaultValues };
    }

    // Otherwise, build from formFields
    const initialData = {};
    if (formFields && formFields.length > 0) {
      formFields.forEach(field => {
        // Use appropriate default value based on field type
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.type === "custom" && field.multiple !== false) {
          // Custom multi-select fields default to empty array
          initialData[field.name] = [];
        } else {
          initialData[field.name] = "";
        }
      });
    }
    return initialData;
  }, [formFields, defaultValues]);

  const [formData, setFormData] = useState(initialFormData);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(!isUpdate);
  const [successMessage, setSuccessMessage] = useState("");

  // Handlers
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Get manager method names based on entity type and operation - memoized to prevent recreation
  const getManagerMethodNames = useCallback(() => {
    const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return {
      get: `get${capitalizedEntityType}Detail`,
      create: `create${capitalizedEntityType}`,
      update: `update${capitalizedEntityType}`,
    };
  }, [entityType]);

  // Fetch entity details for update mode
  const fetchEntityDetail = useCallback(async () => {
    if (!isUpdate || !actualId) return;

    try {
      setIsLoading(true);
      setError(null);

      let data;

      // Use fetchItemProp callback if provided, otherwise use entityManager
      if (fetchItemProp && typeof fetchItemProp === "function") {
        data = await fetchItemProp(actualId, onUnauthorized);
      } else if (entityManager) {
        const methodNames = getManagerMethodNames();
        if (typeof entityManager[methodNames.get] !== "function") {
          throw new Error(`Method ${methodNames.get} not found on entity manager`);
        }
        data = await entityManager[methodNames.get](actualId, onUnauthorized);
      } else {
        throw new Error("Either fetchItem callback or entityManager must be provided for update mode");
      }

      setEntityData(data);

      // Transform fetched data if transformer provided
      let populatedData;
      if (transformFetchedData && typeof transformFetchedData === "function") {
        populatedData = transformFetchedData(data);
      } else {
        // Populate form with existing data from formFields
        populatedData = {};
        if (formFields && formFields.length > 0) {
          formFields.forEach(field => {
            populatedData[field.name] = data[field.name] !== undefined ? data[field.name] : (field.defaultValue || "");
          });
        }
      }
      setFormData(populatedData);

    } catch (err) {
      console.error(`Failed to fetch ${entityType} detail:`, err);
      setError(err.message || `Failed to load ${entityType} details`);
    } finally {
      setIsLoading(false);
    }
  }, [isUpdate, actualId, entityType, entityManager, onUnauthorized, formFields, getManagerMethodNames, fetchItemProp, transformFetchedData]);

  // Handle form field changes
  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Check if form has changes for update mode
      if (isUpdate && entityData) {
        const hasFormChanges = formFields.some(field => {
          const originalValue = entityData[field.name] || field.defaultValue || "";
          return newData[field.name] !== originalValue;
        });
        setHasChanges(hasFormChanges);
      }

      // Call custom onChange if provided
      if (onFormChange) {
        onFormChange(newData, name, value);
      }

      return newData;
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [isUpdate, entityData, formFields, onFormChange, validationErrors]);

  // Validate form data
  const validateForm = useCallback(() => {
    const errors = {};

    // Field-level validation
    if (formFields && formFields.length > 0) {
      formFields.forEach(field => {
        if (field.required && (!formData[field.name] || !formData[field.name].toString().trim())) {
          errors[field.name] = `${field.label} is required`;
          return;
        }

        // Custom validation rules
        if (validationRules && validationRules[field.name]) {
          const rule = validationRules[field.name];
          const value = formData[field.name];

          if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field.name] = `${field.label} must be less than ${rule.maxLength} characters`;
          }

          if (rule.minLength && value && value.length < rule.minLength) {
            errors[field.name] = `${field.label} must be at least ${rule.minLength} characters`;
          }

          if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field.name] = rule.message || `${field.label} format is invalid`;
          }

          if (rule.custom && typeof rule.custom === "function") {
            const customError = rule.custom(value, formData);
            if (customError) {
              errors[field.name] = customError;
            }
          }
        }
      });
    }

    // Run custom validation function if provided
    if (customValidation && typeof customValidation === "function") {
      const customErrors = customValidation(formData);
      if (customErrors && typeof customErrors === "object") {
        Object.assign(errors, customErrors);
      }
    }

    return errors;
  }, [formData, formFields, validationRules, customValidation]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setError(null);
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please correct the errors below");
      window.scrollTo(0, 0);
      return;
    }

    if (isUpdate && !hasChanges) {
      setError("No changes detected");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API - either use raw formData if using submitFormProp, or transform it
      let submitData;

      if (submitFormProp && typeof submitFormProp === "function") {
        // Use the callback approach - pass formData directly, let callback handle transformation
        let result;
        if (isUpdate) {
          result = await submitFormProp(formData, onUnauthorized, actualId);
        } else {
          result = await submitFormProp(formData, onUnauthorized);
        }

        const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
        const successMsg = `${capitalizedEntityType} ${isUpdate ? "updated" : "created"} successfully!`;
        setSuccessMessage(successMsg);

        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(result, formData);
        }

        // Navigate to appropriate page after delay
        setTimeout(() => {
          const targetId = isUpdate ? actualId : result?.id;
          let targetPath;

          if (detailPathTemplate && targetId) {
            targetPath = detailPathTemplate.replace("{id}", targetId);
          } else if (detailPath) {
            targetPath = detailPath;
          } else if (listPath) {
            targetPath = listPath;
          } else {
            targetPath = `${basePath}/${targetId}/detail`;
          }

          navigate(targetPath, {
            state: {
              successMessage: successMsg,
            },
          });
        }, 1500);

        return; // Exit early since we handled the submission
      }

      // Legacy approach using entityManager
      submitData = {};
      if (formFields && formFields.length > 0) {
        formFields.forEach(field => {
          let value = formData[field.name];

          // Handle type conversions
          if (field.type === "number") {
            value = value ? parseFloat(value) : 0;
          } else if (field.type === "select" && field.name === "status") {
            value = parseInt(value);
          } else if (typeof value === "string") {
            value = value.trim();
          }

          submitData[field.name] = value;
        });
      }

      // Add hidden fields - use existing entity value for updates, otherwise use defaultValue
      if (hiddenFields && hiddenFields.length > 0) {
        hiddenFields.forEach(field => {
          if (isUpdate && entityData && entityData[field.name] !== undefined) {
            submitData[field.name] = entityData[field.name];
          } else {
            submitData[field.name] = field.defaultValue;
          }
        });
      }

      if (!entityManager) {
        throw new Error("Either submitForm callback or entityManager must be provided");
      }

      const methodNames = getManagerMethodNames();
      let result;

      if (isUpdate) {
        if (typeof entityManager[methodNames.update] !== "function") {
          throw new Error(`Method ${methodNames.update} not found on entity manager`);
        }
        result = await entityManager[methodNames.update](actualId, submitData, onUnauthorized);
      } else {
        if (typeof entityManager[methodNames.create] !== "function") {
          throw new Error(`Method ${methodNames.create} not found on entity manager`);
        }
        result = await entityManager[methodNames.create](submitData, onUnauthorized);
      }

      const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
      const successMsg = `${capitalizedEntityType} ${isUpdate ? "updated" : "created"} successfully!`;
      setSuccessMessage(successMsg);

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(result, submitData);
      }

      // Navigate to appropriate page after delay
      setTimeout(() => {
        const targetId = isUpdate ? actualId : result.id;
        let targetPath;

        if (detailPathTemplate && targetId) {
          targetPath = detailPathTemplate.replace("{id}", targetId);
        } else if (detailPath) {
          targetPath = detailPath;
        } else {
          targetPath = `${basePath}/${targetId}/detail`;
        }

        navigate(targetPath, {
          state: {
            successMessage: successMsg,
          },
        });
      }, 1500);

    } catch (err) {
      console.error(`Failed to ${isUpdate ? 'update' : 'create'} ${entityType}:`, err);

      // Handle validation errors from API
      if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || `Failed to ${isUpdate ? 'update' : 'create'} ${entityType}`);
      }

      // Call error callback if provided
      if (onSubmitError) {
        onSubmitError(err);
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isUpdate, hasChanges, formData, formFields, entityType, entityManager, actualId, onUnauthorized, onSubmitSuccess, onSubmitError, navigate, basePath, listPath, detailPath, detailPathTemplate, getManagerMethodNames, submitFormProp, hiddenFields, entityData]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (window.confirm("Are you sure you want to cancel? Your changes will be lost.")) {
        const targetPath = isUpdate ? `${basePath}/${id}/detail` : (listPath || `${basePath}s`);
        navigate(targetPath);
      }
    } else {
      const targetPath = isUpdate ? `${basePath}/${id}/detail` : (listPath || `${basePath}s`);
      navigate(targetPath);
    }
  }, [hasChanges, isUpdate, basePath, id, listPath, navigate]);

  // Handle reset form (for update mode)
  const handleReset = useCallback(() => {
    if (isUpdate && entityData) {
      const resetData = {};
      formFields.forEach(field => {
        resetData[field.name] = entityData[field.name] || field.defaultValue || "";
      });
      setFormData(resetData);
      setValidationErrors({});
      setError(null);
      setHasChanges(false);
    }
  }, [isUpdate, entityData, formFields]);

  // Load data on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isUpdate && id && typeof id === "string" && id.trim() !== "") {
      fetchEntityDetail();
    } else if (isUpdate) {
      setError(`Invalid ${entityType} ID`);
      setIsLoading(false);
    }
  }, [isUpdate, id, entityType, fetchEntityDetail]);

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Build breadcrumb items - memoized to prevent recreation
  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: 'Dashboard',
        to: '/admin/dashboard',
        icon: HomeIcon
      },
      {
        label: 'Settings',
        to: settingsPath,
        icon: Cog6ToothIcon
      },
      {
        label: entityTypePlural,
        to: listPath || `${basePath}s`,
        icon: entityIcon
      }
    ];

    if (isUpdate) {
      items.push(
        {
          label: entityData?.name || 'Detail',
          to: `${basePath}/${id}/detail`,
          icon: ClipboardDocumentIcon
        },
        {
          label: 'Edit',
          icon: PencilSquareIcon,
          isActive: true
        }
      );
    } else {
      items.push({
        label: 'Create',
        icon: PlusIcon,
        isActive: true
      });
    }

    return items;
  }, [settingsPath, entityTypePlural, listPath, basePath, entityIcon, isUpdate, entityData?.name, id]);

  // Build page actions - memoized to prevent recreation
  const pageActions = useMemo(() => {
    return isUpdate ? [
      <BackToDetailsButton
        key="back-to-details"
        onClick={() => navigate(`${basePath}/${id}/detail`)}
      />
    ] : [
      <Button
        key="back"
        variant="secondary"
        size="md"
        onClick={() => navigate(listPath || `${basePath}s`)}
        icon={ArrowLeftIcon}
      >
        Back to List
      </Button>
    ];
  }, [isUpdate, navigate, basePath, id, listPath]);

  // Render form field
  const renderFormField = (field) => {
    const commonProps = {
      label: field.label,
      name: field.name,
      id: field.name,
      value: formData[field.name],
      onChange: (value) => handleInputChange(field.name, value),
      disabled: isSubmitting,
      required: field.required,
      error: validationErrors[field.name],
      size: field.size || "lg",
      autoComplete: field.autoComplete || "new-password",
      ...field.props,
    };

    switch (field.type) {
      case "custom": {
        // Handle custom components (e.g., multi-select dropdowns)
        const CustomComponent = field.component;
        if (!CustomComponent) {
          console.warn(`Custom field "${field.name}" has no component defined`);
          return null;
        }
        return (
          <CustomComponent
            key={field.name}
            label={field.label}
            value={formData[field.name] || (field.multiple ? [] : "")}
            onChange={(value) => handleInputChange(field.name, value)}
            disabled={isSubmitting}
            required={field.required}
            error={validationErrors[field.name]}
            onUnauthorized={onUnauthorized}
            {...field.componentProps}
          />
        );
      }
      case "select":
        return (
          <Select
            key={field.name}
            {...commonProps}
            options={field.name === "status" ? statusOptions : field.options}
          />
        );
      case "textarea":
        return (
          <Input
            key={field.name}
            {...commonProps}
            type="textarea"
            rows={field.rows || 4}
            maxLength={field.maxLength}
            showCharacterCount={!!field.maxLength}
            characterCountWarning={field.maxLength ? Math.floor(field.maxLength * 0.8) : undefined}
          />
        );
      default:
        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type || "text"}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            showCharacterCount={!!field.maxLength}
            characterCountWarning={field.maxLength ? Math.floor(field.maxLength * 0.8) : undefined}
            description={field.description}
          />
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} flex items-center justify-center shadow-none border-0`} padding="p-0">
        <Loading size="lg" text={`Loading ${entityType} details...`} />
      </Card>
    );
  }

  // Error state (no data loaded for update mode)
  if (error && isUpdate && !entityData) {
    return (
      <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-8">
        <Card className="max-w-2xl mx-auto shadow-none border-0 bg-transparent" padding="p-0">
          <Alert
            type="error"
            message={error}
            className="mb-4"
          />
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(listPath || `${basePath}s`)}
            icon={ArrowLeftIcon}
          >
            Back to {entityTypePlural}
          </Button>
        </Card>
      </Card>
    );
  }

  // Build actions for FormCard header
  const formCardActions = actionsInline ? null : (
    <Card padding="p-0" className="flex items-center gap-4 shadow-none border-0 bg-transparent">
      {isUpdate && hasChanges ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleReset}
          disabled={isSubmitting}
          icon={ArrowPathIcon}
        >
          Reset Changes
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="md"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      )}
      <Button
        variant="success"
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting || (isUpdate && !hasChanges)}
        loading={isSubmitting}
        loadingText={isUpdate ? "Updating..." : "Creating..."}
        icon={CheckCircleIcon}
      >
        {isUpdate ? `Update ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` : `Create ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
      </Button>
    </Card>
  );

  // Build inline actions
  const inlineActions = actionsInline ? (
    <Card padding="p-0" className="flex items-center justify-between pt-4 shadow-none border-0 bg-transparent">
      {isUpdate && hasChanges ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleReset}
          disabled={isSubmitting}
          icon={ArrowPathIcon}
        >
          Reset Changes
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="md"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      )}
      <Button
        variant="success"
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting || (isUpdate && !hasChanges)}
        loading={isSubmitting}
        loadingText={isUpdate ? "Updating..." : "Creating..."}
        icon={CheckCircleIcon}
      >
        {isUpdate ? `Update ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` : `Create ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
      </Button>
    </Card>
  ) : null;

  return (
    <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-0">
      <Card className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 shadow-none border-0 bg-transparent" padding="p-0">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          icon={isUpdate ? PencilSquareIcon : PlusIcon}
          title={title || `${isUpdate ? 'Edit' : 'Create'} ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
          subtitle={subtitle !== undefined ? subtitle : `${isUpdate ? 'Update' : 'Add a new'} ${entityType} ${isUpdate ? 'details and configuration' : 'to the system'}`}
          actions={pageActions}
        />

        {/* Unsaved Changes Indicator */}
        {hasChanges && isUpdate && (
          <Alert
            type="warning"
            icon={ExclamationTriangleIcon}
            message="Unsaved changes"
            className="mb-6"
          />
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
            className="mb-6"
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Main Form */}
        <FormCard
          title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Information`}
          actions={formCardActions}
        >
          <Card padding="p-0" className="space-y-6 shadow-none border-0 bg-transparent">
            {/* Render form fields */}
            {customFormFields || formFields.map(renderFormField)}

            {/* Change Summary for updates */}
            {hasChanges && isUpdate && entityData && (
              <Alert type="info" icon={DocumentTextIcon}>
                <Badge variant="primary" size="md" className="mb-3">Change Summary</Badge>
                {formFields.map(field => {
                  const originalValue = entityData[field.name] || field.defaultValue || "";
                  const currentValue = formData[field.name] || "";

                  // Skip comparison for complex types that haven't truly changed
                  if (originalValue === currentValue) return null;

                  // For arrays, check if they're equal by comparing stringified versions
                  if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
                    const origIds = originalValue.map(v => typeof v === 'object' ? (v?.id || v?.value) : v).sort().join(',');
                    const currIds = currentValue.map(v => typeof v === 'object' ? (v?.id || v?.value) : v).sort().join(',');
                    if (origIds === currIds) return null;
                  }

                  const getDisplayValue = (value, fieldConfig) => {
                    // Handle status select field
                    if (fieldConfig.type === "select" && fieldConfig.name === "status") {
                      return value === 1 ? "Active" : "Inactive";
                    }
                    // Handle arrays (multi-select fields)
                    if (Array.isArray(value)) {
                      if (value.length === 0) return "None selected";
                      // Extract IDs/names from objects if needed
                      const items = value.map(v => {
                        if (typeof v === 'object' && v !== null) {
                          return v.name || v.label || v.id || 'Item';
                        }
                        return v;
                      });
                      return `${items.length} item${items.length !== 1 ? 's' : ''} selected`;
                    }
                    // Handle objects (shouldn't happen but safety check)
                    if (typeof value === 'object' && value !== null) {
                      return value.name || value.label || value.id || 'Object';
                    }
                    return value || "Empty";
                  };

                  return (
                    <div key={field.name} className="mb-3 last:mb-0">
                      <Badge variant="secondary" size="sm" className="mb-1">
                        {field.label}:
                      </Badge>
                      <div className="grid grid-cols-2 gap-2">
                        <Alert type="error" className="py-2 px-3 text-sm">
                          <Badge variant="secondary" size="sm">Original:</Badge>
                          {getDisplayValue(originalValue, field)}
                        </Alert>
                        <Alert type="success" className="py-2 px-3 text-sm">
                          <Badge variant="secondary" size="sm">New:</Badge>
                          {getDisplayValue(currentValue, field)}
                        </Alert>
                      </div>
                    </div>
                  );
                })}
              </Alert>
            )}

            {/* Custom Preview */}
            {customPreview && typeof customPreview === 'function' ? customPreview(formData) : customPreview}

            {/* Default Info Note or Custom */}
            {customInfoNote || (
              <Alert type="info" icon={InformationCircleIcon}>
                <Badge variant="warning" size="sm">Note:</Badge> Changes will be visible immediately after {isUpdate ? 'updating' : 'creating'}.
              </Alert>
            )}

            {/* Inline Actions */}
            {inlineActions}
          </Card>
        </FormCard>

        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={isSubmitting}
          title={`${isUpdate ? 'Updating' : 'Creating'} ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}...`}
          subtitle="Please wait while we save your changes."
        />
      </Card>
    </Card>
  );
}

export default SettingsFormView;