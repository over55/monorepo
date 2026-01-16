// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Unarchive/Page.jsx
// @uix-page: EntityActionUnarchivePage

import React, { useCallback } from "react";
import { UserIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionUnarchivePage, useUIXTheme, Card, Badge } from "../../../../../../components/UIX";
import { ASSOCIATE_STATUS_ACTIVE, ASSOCIATE_STATUS_ARCHIVED } from "../../../../../../constants/Associate";

function AdminAssociateDetailMoreUnarchivePage() {
  const associateManager = useAssociateManager();
  const { getThemeClasses } = useUIXTheme();

  const fetchEntity = useCallback(
    (associateId, onSuccess, onError, onDone, onUnauthorized) => {
      associateManager.getAssociateDetailWithCallbacks(associateId, onSuccess, onError, onDone, onUnauthorized);
    },
    [associateManager],
  );

  const executeUnarchive = useCallback(
    (associateId, onSuccess, onError, onDone, onUnauthorized) => {
      associateManager.unarchiveAssociateWithCallbacks(associateId, onSuccess, onError, onDone, onUnauthorized);
    },
    [associateManager],
  );

  const formatPhone = useCallback((phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }, []);

  const getStatusDisplay = useCallback((status) => {
    if (status === ASSOCIATE_STATUS_ACTIVE) {
      return <Badge variant="success" size="sm">Active</Badge>;
    } else if (status === ASSOCIATE_STATUS_ARCHIVED) {
      return <Badge variant="warning" size="sm">Archived</Badge>;
    }
    return <Badge variant="secondary" size="sm">Unknown</Badge>;
  }, []);

  const renderEntityInfo = useCallback(
    (associate) => (
      <Card className={`${getThemeClasses("bg-muted")} mb-6`} padding="p-6">
        <Badge variant="default" size="lg" className={`text-lg font-semibold ${getThemeClasses("text-primary")} mb-4 flex items-center`}>
          <UserIcon className={`w-5 h-5 mr-2 ${getThemeClasses("text-secondary")}`} />
          Associate Information
        </Badge>
        <Card padding="p-0" className="grid grid-cols-1 md:grid-cols-2 gap-4 border-0 shadow-none">
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Name:</Badge>
            <Badge variant="default" size="sm">{associate.firstName} {associate.lastName}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Status:</Badge>
            {getStatusDisplay(associate.status)}
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <EnvelopeIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Email:</Badge>
            <Badge variant="default" size="sm">{associate.email}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <PhoneIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Phone:</Badge>
            <Badge variant="default" size="sm">{formatPhone(associate.phone)}</Badge>
          </Card>
        </Card>
      </Card>
    ),
    [formatPhone, getStatusDisplay, getThemeClasses],
  );

  return (
    <EntityActionUnarchivePage
      entityType="Associate"
      entityTypePlural="Associates"
      basePath="/admin/associates"
      listPath="/admin/associates"
      entityParamName="aid"
      entityIcon={UserGroupIcon}
      fetchEntity={fetchEntity}
      executeUnarchive={executeUnarchive}
      renderEntityInfo={renderEntityInfo}
      activeStatus={ASSOCIATE_STATUS_ACTIVE}
      successRedirectPath="/admin/associates"
    />
  );
}

export default AdminAssociateDetailMoreUnarchivePage;
