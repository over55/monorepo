// File Path: web/frontend/src/components/business/views/EntityAttachmentListView.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
  NoSymbolIcon,
  DocumentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
} from "../../../services/Services";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Badge,
  Button,
  Alert,
  Tabs,
  Avatar,
  ContactLink,
  AddressDisplay,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../constants/Attachment";

function EntityAttachmentListView({
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,
  entityTypeMap,
  entityStatusActive,
  entityStatusInactive,
  entityStatusArchived,
  basePath,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const { getThemeClasses } = useUIXTheme();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState({});
  const [attachments, setAttachments] = useState(null);

  // Pagination state
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Alert state
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch entity data
  const fetchEntityData = useCallback(async () => {
    try {
      const entityData = await entityManager.getEntityDetail(id, onUnauthorized);
      setEntity(entityData);
      return entityData;
    } catch (error) {
      setErrors(error);
      throw error;
    }
  }, [id, entityManager, onUnauthorized]);

  // Fetch attachments data
  const fetchAttachmentsData = useCallback(async () => {
    try {
      const params = {
        ownership_type: ATTACHMENT_OWNERSHIP_TYPE[entityType.toUpperCase()],
        ownership_id: id,
        page_size: pageSize,
        cursor: currentCursor,
      };

      const attachmentsData = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        true,
      );

      setAttachments(attachmentsData);

      if (attachmentsData && attachmentsData.hasNextPage) {
        setNextCursor(attachmentsData.nextCursor);
      } else {
        setNextCursor("");
      }
    } catch (error) {
      setErrors(error);
    }
  }, [id, attachmentManager, onUnauthorized, pageSize, currentCursor, entityType]);

  // Combined fetch function - removed from dependencies to prevent infinite loops
  // eslint-disable-next-line no-unused-vars
  const fetchData = useCallback(async () => {
    await Promise.all([fetchEntityData(), fetchAttachmentsData()]);
  }, [fetchEntityData, fetchAttachmentsData]);

  // Initial load - simplified to prevent infinite loops
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);

      const loadData = async () => {
        try {
          setFetching(true);
          setErrors({});
          await Promise.all([fetchEntityData(), fetchAttachmentsData()]);
        } catch (error) {
          setErrors(error);
        } finally {
          setFetching(false);
        }
      };

      loadData();
      hasInitialLoad.current = true;
    }
  }, [fetchEntityData, fetchAttachmentsData]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setFetching(true);
      setErrors({});
      await Promise.all([fetchEntityData(), fetchAttachmentsData()]);
    } catch (error) {
      setErrors(error);
    } finally {
      setFetching(false);
    }
  }, [fetchEntityData, fetchAttachmentsData]);

  // Pagination handlers - optimized with functional state updates
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      setPreviousCursors(prev => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
    }
  }, [currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    setPreviousCursors(prev => {
      if (prev.length > 0) {
        const newPrev = [...prev];
        const previousCursor = newPrev.pop();
        setCurrentCursor(previousCursor || "");
        return newPrev;
      }
      return prev;
    });
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
  }, []);

  // Row click handler
  const onRowClick = useCallback((attachment) => {
    navigate(`${basePath.replace('/admin', '/admin')}/${entityType}/${id}/attachment/${attachment.id}`);
  }, [navigate, id, basePath, entityType]);

  // Add click handler
  const onAddClick = useCallback(() => {
    navigate(`${basePath.replace('/admin', '/admin')}/${entityType}/${id}/attachments/add`);
  }, [navigate, id, basePath, entityType]);

  // Delete navigation handler
  const onSelectAttachmentForDeletion = useCallback((attachment) => {
    navigate(`${basePath.replace('/admin', '/admin')}/${entityType}/${id}/attachment/${attachment.id}/delete`);
  }, [navigate, id, basePath, entityType]);

  // Alert handlers
  const onAlertClear = useCallback(() => {
    setAlertMessage("");
    setAlertType("");
  }, []);

  // Back navigation handler
  const onBackClick = useCallback(() => {
    navigate(basePath);
  }, [navigate, basePath]);

  // Error clear handler
  const onErrorClear = useCallback(() => {
    setErrors({});
  }, []);

  // Create status badge component (theme-aware)
  const createStatusBadge = (entity) => {
    if (!entity) return null;
    if (entity.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (entity.status === entityStatusActive) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    if (entityStatusInactive && entity.status === entityStatusInactive) {
      return (
        <Badge variant="warning" size="sm">
          <ClockIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
        Archived
      </Badge>
    );
  };

  // Get primary contact from entity
  const getPrimaryContact = (entity) => {
    if (
      !entity ||
      !entity.contacts ||
      entity.contacts.length === 0
    ) {
      return null;
    }
    return (
      entity.contacts.find((c) => c.isPrimary) || entity.contacts[0]
    );
  };

  // Tab configuration for the entity
  const tabItems = entity ? [
    {
      label: "Summary",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}`,
      isActive: false,
    },
    {
      label: "Details",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/full`,
      isActive: false,
    },
    {
      label: "Events",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/events`,
      isActive: false,
    },
    {
      label: "Orders",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/orders`,
      isActive: false,
    },
    {
      label: "Comments",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/comments`,
      isActive: false,
    },
    {
      label: "Attachments",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/attachments`,
      isActive: true,
    },
    {
      label: "More",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/more`,
      isActive: false,
      icon: EllipsisHorizontalIcon,
    },
  ] : [];

  // Build status alerts
  const statusAlerts = [];
  if (entity && entity.status === entityStatusArchived) {
    statusAlerts.push({
      type: "info",
      message: `This ${entityType} is archived`,
      icon: ArchiveBoxIcon
    });
  }
  if (entity && entity.isBanned) {
    statusAlerts.push({
      type: "error",
      message: `This ${entityType} is banned`,
      icon: NoSymbolIcon
    });
  }

  // Breadcrumb configuration
  const breadcrumbItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon
    },
    {
      label: entityTypePlural,
      to: basePath,
      icon: entityIcon
    },
    {
      label: entity[`${entityType}Name`] || entity.name || `${entityType} Detail`,
      isActive: true
    }
  ];

  return (
    <UIXThemeProvider>
      <div className={`min-h-screen ${getThemeClasses('background.primary')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Status Alerts */}
          {statusAlerts.map((alert, index) => (
            <Alert
              key={index}
              type={alert.type}
              message={alert.message}
              icon={alert.icon}
              className="mb-4"
            />
          ))}

          {/* Custom Alert */}
          {alertMessage && (
            <Alert
              type={alertType}
              message={alertMessage}
              className="mb-4"
              onClose={onAlertClear}
            />
          )}

          {/* Error Display */}
          {errors && Object.keys(errors).length > 0 && (
            <Alert
              type="error"
              message="Failed to load data. Please try again."
              className="mb-4"
              onClose={onErrorClear}
            />
          )}

          {/* Header Section */}
          <div className={`${getThemeClasses('background.card')} rounded-lg shadow-sm border ${getThemeClasses('border.primary')} mb-6`}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-6">

                {/* Entity Info Section */}
                <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-6 flex-1">

                  {/* Avatar */}
                  <div className="flex justify-center xl:justify-start">
                    <Avatar
                      src={entity?.logoUrl}
                      alt={entity?.logoUrl ? `${entityType} Logo` : "No Logo"}
                      size="lg"
                      borderStyle="default"
                      showFallbackIcon={true}
                      fallbackIcon={entityIcon}
                    />
                  </div>

                  {/* Primary Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-center xl:text-left mb-4">
                      <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${getThemeClasses('text.primary')} mb-2`}>
                        {entity[`${entityType}Name`] || entity.name || `${entityType} Detail`}
                      </h1>
                      {entity[`${entityType}ShortName`] && (
                        <p className={`text-sm sm:text-base ${getThemeClasses('text.secondary')} mb-2`}>
                          ({entity[`${entityType}ShortName`]})
                        </p>
                      )}
                      <div className={`${getThemeClasses('text.secondary')} text-sm lg:text-base`}>
                        <Badge variant="primary" size="md">
                          {entityTypeMap[entity[`${entityType}Type`]] || "Unknown"}
                        </Badge>
                      </div>
                    </div>

                    {/* Primary Contact */}
                    {getPrimaryContact(entity) && (
                      <div className="mb-4 text-center xl:text-left">
                        <h3 className={`text-base sm:text-lg font-semibold ${getThemeClasses('text.primary')} mb-2`}>
                          Primary Contact
                        </h3>
                        <p className={`text-sm sm:text-base ${getThemeClasses('text.secondary')}`}>
                          {getPrimaryContact(entity).firstName}{" "}
                          {getPrimaryContact(entity).lastName}
                          {getPrimaryContact(entity).title && (
                            <span className={getThemeClasses('text.muted')}>
                              {" "}
                              - {getPrimaryContact(entity).title}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Address */}
                    <AddressDisplay
                      addressData={entity}
                      size="md"
                      showIcon={true}
                      showMapsLink={true}
                      className="mb-4"
                    />

                    {/* Contact Links */}
                    <div className="space-y-2 sm:space-y-3">
                      <ContactLink
                        type="email"
                        value={getPrimaryContact(entity)?.email || entity?.contactEmail}
                        size="md"
                        fallbackText="No email"
                      />
                      <ContactLink
                        type="phone"
                        value={getPrimaryContact(entity)?.phone || entity?.contactPhone}
                        size="md"
                        fallbackText="No phone"
                      />
                      {entity?.website && (
                        <ContactLink
                          type="website"
                          value={entity.website}
                          size="md"
                          fallbackText="No website"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className={`xl:w-80 xl:pl-6 xl:border-l ${getThemeClasses('border.primary')}`}>
                  <div className={`space-y-2 text-xs sm:text-sm lg:text-base ${getThemeClasses('text.secondary')} mb-4`}>
                    {entity?.createdAt && (
                      <div className="flex items-center justify-center xl:justify-start">
                        <ClockIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text.muted')}`} />
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">
                          {formatDateForDisplay(entity.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center xl:justify-start">
                      <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text.muted')}`} />
                      <span className="font-medium">Status:</span>
                      <span className="ml-2">
                        {createStatusBadge(entity)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={onBackClick}
                      icon={ChevronLeftIcon}
                      className="flex-1 sm:flex-initial"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={onAddClick}
                      icon={PlusIcon}
                      className="flex-1 sm:flex-initial"
                    >
                      Add Attachment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs items={tabItems} />
            </div>
          </div>

          {/* Attachments List Section */}
          <div className={`${getThemeClasses('background.card')} rounded-lg shadow-sm border ${getThemeClasses('border.primary')}`}>
            <div className="p-4 sm:p-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold ${getThemeClasses('text.primary')} mb-1`}>
                    Attachments
                  </h2>
                  <p className={`text-sm ${getThemeClasses('text.secondary')}`}>
                    Manage attachments for this {entityType}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    icon={ArrowPathIcon}
                    disabled={isFetching}
                    size="sm"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onAddClick}
                    icon={PlusIcon}
                    size="sm"
                  >
                    Add Attachment
                  </Button>
                </div>
              </div>

              {/* Attachments Table */}
              {isFetching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : attachments && attachments.results && attachments.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`border-b ${getThemeClasses('border.primary')}`}>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Title
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Description
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Created
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachments.results.map((attachment) => (
                        <tr
                          key={attachment.id}
                          className={`border-b ${getThemeClasses('border.primary')} hover:${getThemeClasses('background.hover')} cursor-pointer`}
                          onClick={() => onRowClick(attachment)}
                        >
                          <td className={`py-3 px-4 ${getThemeClasses('text.primary')}`}>
                            <div className="flex items-center">
                              <DocumentIcon className={`w-5 h-5 mr-2 ${getThemeClasses('text.muted')}`} />
                              <div>
                                <div className="font-medium">{attachment.title}</div>
                                {attachment.filename && (
                                  <div className={`text-sm ${getThemeClasses('text.muted')}`}>
                                    {attachment.filename}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${getThemeClasses('text.secondary')}`}>
                            <div className="max-w-xs truncate">
                              {attachment.description || "No description"}
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${getThemeClasses('text.secondary')}`}>
                            {formatDateForDisplay(attachment.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRowClick(attachment);
                                }}
                                size="sm"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectAttachmentForDeletion(attachment);
                                }}
                                icon={TrashIcon}
                                size="sm"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PaperClipIcon className={`mx-auto h-12 w-12 ${getThemeClasses('text.muted')} mb-4`} />
                  <h3 className={`text-lg font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    No attachments found
                  </h3>
                  <p className={`text-sm ${getThemeClasses('text.secondary')} mb-4`}>
                    Get started by adding a new attachment for this {entityType}.
                  </p>
                  <Button
                    variant="primary"
                    onClick={onAddClick}
                    icon={PlusIcon}
                  >
                    Add First Attachment
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {attachments && attachments.results && attachments.results.length > 0 && (
                <div className={`flex justify-between items-center pt-6 border-t ${getThemeClasses('border.primary')}`}>
                  <div className={`text-sm ${getThemeClasses('text.secondary')}`}>
                    Showing {attachments.results.length} attachments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={previousCursors.length === 0}
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={!nextCursor}
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UIXThemeProvider>
  );
}

export default EntityAttachmentListView;