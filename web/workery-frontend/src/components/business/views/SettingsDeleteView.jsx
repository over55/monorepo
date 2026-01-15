import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  DeleteConfirmationCard,
  Alert,
  Loading,
  LoadingOverlay,
  Card,
  Button,
  PageHeader,
} from "../../UIX";
import {
  TrashIcon,
  ArrowLeftIcon,
  HomeIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

function SettingsDeleteView({
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
  deleteItem: deleteItemProp, // callback for deleting item
  id: idProp, // explicit ID prop
  renderItemDetails, // custom render function for item details

  // Path configuration
  basePath,
  settingsPath = "/admin/settings",
  listPath,
  detailPath, // path to detail page
  editPath, // path to edit page

  // Display configuration
  title,
  subtitle,
  displayField = "name", // field to use for display name

  // Delete configuration
  impactWarnings = [],
  alternativeText,
  requiresConfirmation = true,
  requireConfirmation, // alias for requiresConfirmation
  confirmationWord, // word to type for confirmation

  // Custom components
  customHeader,
  customWarnings,

  // Item protection
  canDeleteItem,
  systemProtectedMessage = "This item is system-protected and cannot be deleted.",

  // Callbacks
  onDeleteSuccess,
  onDeleteError,
  onDataLoad,
}) {
  // Resolve aliases - prefer new props, fall back to legacy
  const resolvedEntityType = entityName || entityType || "item";
  const resolvedEntityIcon = icon || entityIcon;
  const resolvedRequiresConfirmation = requireConfirmation !== undefined ? requireConfirmation : requiresConfirmation;

  return (
    <UIXThemeProvider>
      <SettingsDeleteViewContent
        entityType={resolvedEntityType}
        entityTypePlural={entityTypePlural}
        entityIcon={resolvedEntityIcon}
        entityManager={entityManager}
        breadcrumbItemsProp={breadcrumbItemsProp}
        fetchItemProp={fetchItemProp}
        deleteItemProp={deleteItemProp}
        idProp={idProp}
        renderItemDetails={renderItemDetails}
        basePath={basePath}
        settingsPath={settingsPath}
        listPath={listPath}
        detailPath={detailPath}
        editPath={editPath}
        title={title}
        subtitle={subtitle}
        displayField={displayField}
        impactWarnings={impactWarnings}
        alternativeText={alternativeText}
        requiresConfirmation={resolvedRequiresConfirmation}
        confirmationWord={confirmationWord}
        customHeader={customHeader}
        customWarnings={customWarnings}
        canDeleteItem={canDeleteItem}
        systemProtectedMessage={systemProtectedMessage}
        onDeleteSuccess={onDeleteSuccess}
        onDeleteError={onDeleteError}
        onDataLoad={onDataLoad}
      />
    </UIXThemeProvider>
  );
}

function SettingsDeleteViewContent({
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,
  breadcrumbItemsProp,
  fetchItemProp,
  deleteItemProp,
  idProp,
  renderItemDetails,
  basePath,
  settingsPath,
  listPath,
  detailPath,
  editPath,
  title,
  subtitle,
  displayField,
  impactWarnings,
  alternativeText,
  requiresConfirmation,
  confirmationWord,
  customHeader,
  customWarnings,
  canDeleteItem,
  systemProtectedMessage,
  onDeleteSuccess,
  onDeleteError,
  onDataLoad,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  // Resolve actual ID - prefer explicit idProp, fall back to route param
  const actualId = idProp || routeId;

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [entityData, setEntityData] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  // Handlers
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Get manager method names - memoized to prevent recreation
  const getManagerMethodNames = useCallback(() => {
    if (!entityType) return { get: null, delete: null };
    const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return {
      get: `get${capitalizedEntityType}Detail`,
      delete: `delete${capitalizedEntityType}`,
    };
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
        const methodNames = getManagerMethodNames();
        if (!methodNames.get || typeof entityManager[methodNames.get] !== 'function') {
          throw new Error(`Method ${methodNames.get} not found on entity manager`);
        }
        data = await entityManager[methodNames.get](actualId, onUnauthorized);
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
    } finally {
      setIsLoading(false);
    }
  }, [actualId, entityType, entityManager, fetchItemProp, onUnauthorized, onDataLoad, getManagerMethodNames]);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    if (!entityData) return;

    // Check if item can be deleted
    if (canDeleteItem && typeof canDeleteItem === 'function' && !canDeleteItem(entityData)) {
      setError(systemProtectedMessage);
      return;
    }

    // Validate confirmation text if required - use same logic as DeleteConfirmationCard
    const entityName = entityData.name || entityData.text ||
                      (entityData.category && entityData.subCategory ?
                        `${entityData.category} - ${entityData.subCategory}` :
                        entityData.category || 'Unknown');

    // Use confirmationWord if provided, otherwise use entity name
    const expectedConfirmation = confirmationWord || entityName;

    if (requiresConfirmation && confirmText !== expectedConfirmation) {
      setError(`Please type "${expectedConfirmation}" exactly to confirm`);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Use deleteItemProp callback if provided (new interface)
      if (deleteItemProp && typeof deleteItemProp === 'function') {
        await deleteItemProp(actualId, onUnauthorized);
      }
      // Fall back to entityManager (legacy interface)
      else if (entityManager) {
        const methodNames = getManagerMethodNames();
        if (!methodNames.delete || typeof entityManager[methodNames.delete] !== 'function') {
          throw new Error(`Method ${methodNames.delete} not found on entity manager`);
        }
        await entityManager[methodNames.delete](actualId, onUnauthorized);
      } else {
        throw new Error('No delete method provided. Please provide either deleteItem callback or entityManager.');
      }

      const successMsg = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully`;
      setSuccessMessage(successMsg);

      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess(entityData);
      }

      // Navigate back to list with success message
      setTimeout(() => {
        navigate(listPath || `${basePath}s`, {
          state: { successMessage: successMsg },
        });
      }, 2000);

    } catch (err) {
      console.error(`Failed to delete ${entityType}:`, err);
      const errorMessage = err.message || `Failed to delete ${entityType}`;
      setError(errorMessage);

      // Call error callback if provided
      if (onDeleteError) {
        onDeleteError(err);
      }

      setIsDeleting(false);
    }
  }, [entityData, canDeleteItem, systemProtectedMessage, requiresConfirmation, confirmText, confirmationWord, entityType, entityManager, deleteItemProp, actualId, onUnauthorized, onDeleteSuccess, onDeleteError, navigate, listPath, basePath, getManagerMethodNames]);

  // Handle cancel - use detailPath if provided, otherwise construct from basePath
  const handleCancel = useCallback(() => {
    if (detailPath) {
      navigate(detailPath);
    } else if (basePath) {
      navigate(`${basePath}/${actualId}/detail`);
    } else {
      navigate(listPath || '/admin/settings');
    }
  }, [navigate, detailPath, basePath, actualId, listPath]);

  // Load data on component mount
  useEffect(() => {
    if (actualId && typeof actualId === "string" && actualId.trim() !== "") {
      fetchEntityDetail();
    } else {
      setError(`Invalid ${entityType} ID`);
      setIsLoading(false);
    }
  }, [actualId, entityType, fetchEntityDetail]);

  // Auto-clear error messages
  useEffect(() => {
    if (error && entityData) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, entityData]);

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
        label: entityData?.name || entityData?.text || 'Detail',
        to: detailPath || `${basePath}/${actualId}/detail`,
        icon: ClipboardDocumentIcon
      },
      {
        label: 'Delete',
        icon: TrashIcon,
        isActive: true
      }
    ];
  }, [breadcrumbItemsProp, settingsPath, entityTypePlural, listPath, basePath, entityIcon, entityData?.name, entityData?.text, detailPath, actualId]);

  // Default impact warnings if none provided - memoized (MUST be before early returns)
  const defaultImpactWarnings = useMemo(() => {
    return impactWarnings.length > 0 ? impactWarnings : [
      {
        icon: entityIcon,
        text: `Any records currently referencing this ${entityType}`
      }
    ];
  }, [impactWarnings, entityIcon, entityType]);

  // Default alternative text - memoized (MUST be before early returns)
  const defaultAlternativeText = useMemo(() => {
    return alternativeText || `Consider marking the ${entityType} as inactive instead of deleting it to preserve historical data.`;
  }, [alternativeText, entityType]);

  // Page actions for header - memoized (MUST be before early returns)
  const pageActions = useMemo(() => [
    <Button
      key="back"
      variant="secondary"
      size="md"
      onClick={handleCancel}
      icon={ArrowLeftIcon}
    >
      Back to Detail
    </Button>
  ], [handleCancel]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} flex items-center justify-center shadow-none border-0`} padding="p-0">
        <Loading size="lg" text={`Loading ${entityType} details...`} />
      </Card>
    );
  }

  // Error state (no data loaded)
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

  return (
    <Card className={`min-h-screen ${getThemeClasses('bg-gradient-primary')} shadow-none border-0`} padding="p-0">
      <Card className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 shadow-none border-0 bg-transparent" padding="p-0">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Success Message */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
            className="mb-6"
          />
        )}

        {/* Header Section */}
        {customHeader || (
          <PageHeader
            icon={TrashIcon}
            title={title || `Delete ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
            subtitle={subtitle || "Permanent deletion confirmation"}
            actions={pageActions}
          />
        )}

        {/* Delete Confirmation Card */}
        <DeleteConfirmationCard
          item={entityData ? {
            ...entityData,
            // Ensure proper name field for different entity types
            name: entityData.name || entityData.text ||
                  (entityData.category && entityData.subCategory ?
                    `${entityData.category} - ${entityData.subCategory}` :
                    entityData.category || 'Unknown')
          } : null}
          itemType={entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          isDeleting={isDeleting}
          error={error}
          confirmText={confirmText}
          onConfirmTextChange={setConfirmText}
          onDelete={handleDelete}
          onCancel={handleCancel}
          onErrorClear={() => setError(null)}
          detailRoute={detailPath || `${basePath}/${actualId}/detail`}
          editRoute={editPath || `${basePath}/${actualId}/update`}
          impactWarnings={customWarnings || defaultImpactWarnings}
          alternativeText={defaultAlternativeText}
          confirmationWord={confirmationWord}
          renderItemDetails={renderItemDetails}
        />

        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={isDeleting}
          title={`Deleting ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}...`}
          subtitle="Please wait while we remove this item from the system."
        />
      </Card>
    </Card>
  );
}

export default SettingsDeleteView;