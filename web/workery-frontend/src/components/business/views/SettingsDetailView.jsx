import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  BackToListButton,
  EditButton,
  DeleteButton,
  DetailPageIcon,
  DetailCard,
  SystemInfo,
  Alert,
  Loading,
  Button,
  Badge,
  PageHeader,
  InfoField,
  Card,
} from "../../UIX";
import {
  ArrowLeftIcon,
  HomeIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

function SettingsDetailView({
  // Entity configuration (legacy props)
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,

  // Entity configuration (new props - aliases)
  entityName, // alias for entityType
  icon, // alias for entityIcon
  breadcrumbItems: breadcrumbItemsProp, // custom breadcrumbs
  fetchItem: fetchItemProp, // callback for fetching item
  id: idProp, // explicit ID prop

  // Path configuration
  basePath,
  settingsPath = "/admin/settings",
  listPath,
  editPath, // path to edit page
  deletePath, // path to delete page

  // Display configuration
  title,
  subtitle,
  fields,
  displayField = "name", // field to use for display name

  // Custom components
  customHeader,
  customFields,
  customActions,

  // Callbacks
  onDataLoad,
  onError,

  // Item protection
  canModifyItem,
  systemProtectedMessage = "This item is system-protected and cannot be modified.",
}) {
  // Resolve aliases - prefer new props, fall back to legacy
  const resolvedEntityType = entityName || entityType || "item";
  const resolvedEntityIcon = icon || entityIcon;

  return (
    <UIXThemeProvider>
      <SettingsDetailViewContent
        entityType={resolvedEntityType}
        entityTypePlural={entityTypePlural}
        entityIcon={resolvedEntityIcon}
        entityManager={entityManager}
        breadcrumbItemsProp={breadcrumbItemsProp}
        fetchItemProp={fetchItemProp}
        idProp={idProp}
        basePath={basePath}
        settingsPath={settingsPath}
        listPath={listPath}
        editPath={editPath}
        deletePath={deletePath}
        title={title}
        subtitle={subtitle}
        fields={fields}
        displayField={displayField}
        customHeader={customHeader}
        customFields={customFields}
        customActions={customActions}
        onDataLoad={onDataLoad}
        onError={onError}
        canModifyItem={canModifyItem}
        systemProtectedMessage={systemProtectedMessage}
      />
    </UIXThemeProvider>
  );
}

function SettingsDetailViewContent({
  entityType,
  // eslint-disable-next-line no-unused-vars
  entityTypePlural,
  entityIcon,
  entityManager,
  breadcrumbItemsProp,
  fetchItemProp,
  idProp,
  basePath,
  // eslint-disable-next-line no-unused-vars
  settingsPath,
  listPath,
  editPath,
  deletePath,
  title,
  subtitle,
  fields,
  // eslint-disable-next-line no-unused-vars
  displayField,
  customHeader,
  customFields,
  customActions,
  onDataLoad,
  onError,
  // eslint-disable-next-line no-unused-vars
  canModifyItem,
  // eslint-disable-next-line no-unused-vars
  systemProtectedMessage,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();

  // Resolve actual ID - prefer explicit idProp, fall back to route param
  const actualId = idProp || routeId;

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [entityData, setEntityData] = useState(null);

  // Handlers
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Get manager method name - memoized to prevent recreation
  const getManagerMethodName = useCallback(() => {
    if (!entityType) return null;
    const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return `get${capitalizedEntityType}Detail`;
  }, [entityType]);

  // Fetch entity details
  const fetchEntityDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;

      // Use fetchItemProp callback if provided (new interface)
      if (fetchItemProp && typeof fetchItemProp === 'function') {
        data = await fetchItemProp(actualId, onUnauthorized);
      }
      // Fall back to entityManager (legacy interface)
      else if (entityManager) {
        const methodName = getManagerMethodName();
        if (!methodName || typeof entityManager[methodName] !== 'function') {
          throw new Error(`Method ${methodName} not found on entity manager`);
        }
        data = await entityManager[methodName](actualId, onUnauthorized);
      } else {
        throw new Error('No fetch method provided. Please provide either fetchItem callback or entityManager.');
      }

      setEntityData(data);

      // Call onDataLoad callback if provided
      if (onDataLoad) {
        onDataLoad(data);
      }

    } catch (err) {
      console.error(`Failed to fetch ${entityType} detail:`, err);
      const errorMessage = err.message || `Failed to load ${entityType} details`;
      setError(errorMessage);

      // Call onError callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [actualId, entityType, entityManager, fetchItemProp, onUnauthorized, onDataLoad, onError, getManagerMethodName]);

  // Load data on component mount
  useEffect(() => {
    window.scrollTo(0, 0);

    if (actualId && typeof actualId === "string" && actualId.trim() !== "") {
      fetchEntityDetail();
    } else {
      setError(`Invalid ${entityType} ID`);
      setIsLoading(false);
    }
  }, [actualId, entityType, fetchEntityDetail]);

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

  // Build breadcrumb items - use custom if provided, otherwise build default
  const breadcrumbItems = useMemo(() => {
    // Use custom breadcrumbs if provided
    if (breadcrumbItemsProp && Array.isArray(breadcrumbItemsProp)) {
      return breadcrumbItemsProp;
    }

    // Build default breadcrumbs
    return [
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
        label: entityTypePlural || 'Items',
        to: listPath || `${basePath}s`,
        icon: entityIcon
      },
      {
        label: entityData?.name || 'Details',
        icon: ClipboardDocumentIcon,
        isActive: true
      }
    ];
  }, [breadcrumbItemsProp, settingsPath, entityTypePlural, listPath, basePath, entityIcon, entityData?.name]);

  // Default action buttons - memoized to prevent recreation
  const defaultActions = useMemo(() => [
    <BackToListButton
      key="back"
      onClick={() => navigate(listPath || `${basePath}s`)}
    />,
    <EditButton
      key="edit"
      onClick={() => navigate(editPath || `${basePath}/${actualId}/update`)}
      disabled={entityData?.status === 2} // Disable for inactive items
    />,
    <DeleteButton
      key="delete"
      onClick={() => navigate(deletePath || `${basePath}/${actualId}/delete`)}
    />
  ], [navigate, listPath, basePath, actualId, editPath, deletePath, entityData?.status]);

  // Render field value based on field configuration
  const renderFieldValue = (field, data) => {
    let value = data[field.name];

    // Handle empty values
    if (value === null || value === undefined || value === "") {
      return field.emptyText || field.emptyMessage || "Not provided";
    }

    // Apply custom renderer if provided
    if (field.render && typeof field.render === 'function') {
      return field.render(value, data);
    }

    // Handle different field types
    switch (field.type) {
      case "status": {
        const isActive = value === 1;
        return (
          <Badge variant={isActive ? "success" : "secondary"} size="sm">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      }

      case "date":
        return value;

      case "multiline":
        return value;

      case "badge":
        return (
          <Badge variant={field.badgeVariant || "primary"} size="sm">
            {field.badgeText ? field.badgeText(value) : value}
          </Badge>
        );

      case "link":
        return (
          <Link
            to={field.linkTo ? field.linkTo(value, data) : '#'}
            className={`${getThemeClasses('link-primary')} font-medium`}
          >
            {field.linkText ? field.linkText(value) : value}
          </Link>
        );

      default:
        return value;
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

  // Error state (no data)
  if (error && !entityData) {
    return (
      <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-8">
        <Card className="max-w-2xl mx-auto shadow-none border-0 bg-transparent" padding="p-0">
          <Alert type="error" message={error} className="mb-4" />
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

  // Not found state
  if (!entityData) {
    return (
      <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-8">
        <Card className="max-w-2xl mx-auto shadow-none border-0 bg-transparent" padding="p-0">
          <Alert
            type="warning"
            message={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`}
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

  // Build the label with optional required indicator
  const buildFieldLabel = (field) => {
    if (field.required) {
      return (
        <>
          {field.label}
          <span className="text-red-500 ml-1">*</span>
        </>
      );
    }
    return field.label;
  };

  return (
    <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-0">
      <Card className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 shadow-none border-0 bg-transparent" padding="p-0">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            dismissible
            onDismiss={() => setSuccessMessage("")}
            className="mb-6"
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            dismissible
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Header Section */}
        {customHeader || (
          <PageHeader
            icon={entityIcon}
            title={title || entityData.name}
            subtitle={subtitle}
            actions={customActions || defaultActions}
          />
        )}

        {/* Main Content */}
        <DetailCard
          title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Information`}
          icon={ClipboardDocumentIcon}
        >
          {(customFields && typeof customFields === 'function' ? customFields(entityData) : customFields) || (
            <Card padding="p-0" className="space-y-6 shadow-none border-0 bg-transparent">
              {fields && Array.isArray(fields) && fields.map((field, index) => (
                <InfoField
                  key={field.name || index}
                  label={buildFieldLabel(field)}
                  value={renderFieldValue(field, entityData)}
                  size="lg"
                  className={field.className || ''}
                />
              ))}
            </Card>
          )}

          {/* System Information */}
          {entityData && (
            <SystemInfo
              createdAt={entityData.createdAt}
              createdByUserName={entityData.createdByUserName}
              createdFromIpAddress={entityData.createdFromIpAddress}
              modifiedAt={entityData.modifiedAt}
              modifiedByUserName={entityData.modifiedByUserName}
              modifiedFromIpAddress={entityData.modifiedFromIpAddress}
            />
          )}
        </DetailCard>
      </Card>
    </Card>
  );
}

export default SettingsDetailView;