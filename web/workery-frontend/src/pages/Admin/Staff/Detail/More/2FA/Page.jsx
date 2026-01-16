// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/2FA/Page.jsx
// @uix-page: EntityAction2FAPage

import React, { useCallback } from "react";
import { UserIcon, BriefcaseIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityAction2FAPage, useUIXTheme, Card, Badge } from "../../../../../../components/UIX";
import { STAFF_STATUS_ACTIVE, STAFF_STATUS_ARCHIVED } from "../../../../../../constants/Staff";

function AdminStaffDetailMore2FAPage() {
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Wrapped callbacks to preserve 'this' context
  const fetchEntity = useCallback(
    (staffId, onSuccess, onError, onDone, onUnauthorized) => {
      staffManager.getStaffDetailWithCallbacks(staffId, onSuccess, onError, onDone, onUnauthorized);
    },
    [staffManager],
  );

  const execute2FAToggle = useCallback(
    (staffId, onSuccess, onError, onDone, onUnauthorized) => {
      staffManager.changeStaffTwoFactorAuthWithCallbacks(staffId, onSuccess, onError, onDone, onUnauthorized);
    },
    [staffManager],
  );

  const formatPhone = useCallback((phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }, []);

  const getStatusDisplay = useCallback((status) => {
    if (status === STAFF_STATUS_ACTIVE) {
      return <Badge variant="success" size="sm">Active</Badge>;
    } else if (status === STAFF_STATUS_ARCHIVED) {
      return <Badge variant="warning" size="sm">Archived</Badge>;
    }
    return <Badge variant="secondary" size="sm">Unknown</Badge>;
  }, []);

  const renderEntityInfo = useCallback(
    (staff) => (
      <Card className={`${getThemeClasses("bg-muted")} mb-6`} padding="p-6">
        <Badge variant="default" size="lg" className={`text-lg font-semibold ${getThemeClasses("text-primary")} mb-4 flex items-center`}>
          <UserIcon className={`w-5 h-5 mr-2 ${getThemeClasses("text-secondary")}`} />
          Staff Information
        </Badge>
        <Card padding="p-0" className="grid grid-cols-1 md:grid-cols-2 gap-4 border-0 shadow-none">
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Name:</Badge>
            <Badge variant="default" size="sm">{staff.firstName} {staff.lastName}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Status:</Badge>
            {getStatusDisplay(staff.status)}
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <EnvelopeIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Email:</Badge>
            <Badge variant="default" size="sm">{staff.email}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <PhoneIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Phone:</Badge>
            <Badge variant="default" size="sm">{formatPhone(staff.phone)}</Badge>
          </Card>
        </Card>
      </Card>
    ),
    [formatPhone, getStatusDisplay, getThemeClasses],
  );

  return (
    <EntityAction2FAPage
      entityType="Staff"
      entityTypePlural="Staff"
      basePath="/admin/staff"
      listPath="/admin/staff"
      entityParamName="aid"
      entityIcon={BriefcaseIcon}
      fetchEntity={fetchEntity}
      execute2FAToggle={execute2FAToggle}
      renderEntityInfo={renderEntityInfo}
      otpPropertyName="otpEnabled"
      archivedStatus={STAFF_STATUS_ARCHIVED}
    />
  );
}

export default AdminStaffDetailMore2FAPage;
