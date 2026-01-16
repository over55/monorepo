// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Delete/Page.jsx
// @uix-page: EntityActionDeletePage

import React, { useCallback } from "react";
import { UserIcon, UsersIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionDeletePage, useUIXTheme, Card, Badge } from "../../../../../../components/UIX";
import { CUSTOMER_STATUS_ACTIVE, CUSTOMER_STATUS_ARCHIVED } from "../../../../../../constants/Customer";

function AdminCustomerDetailMoreDeletePage() {
  const customerManager = useCustomerManager();
  const { getThemeClasses } = useUIXTheme();

  const fetchEntity = useCallback(
    (customerId, onSuccess, onError, onDone, onUnauthorized) => {
      customerManager.getCustomerDetailWithCallbacks(customerId, onSuccess, onError, onDone, onUnauthorized);
    },
    [customerManager],
  );

  const executeDelete = useCallback(
    (customerId, onSuccess, onError, onDone, onUnauthorized) => {
      customerManager.deleteCustomerWithCallbacks(customerId, onSuccess, onError, onDone, onUnauthorized);
    },
    [customerManager],
  );

  const formatPhone = useCallback((phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }, []);

  const getStatusDisplay = useCallback((status) => {
    if (status === CUSTOMER_STATUS_ACTIVE) {
      return <Badge variant="success" size="sm">Active</Badge>;
    } else if (status === CUSTOMER_STATUS_ARCHIVED) {
      return <Badge variant="warning" size="sm">Archived</Badge>;
    }
    return <Badge variant="secondary" size="sm">Unknown</Badge>;
  }, []);

  const renderEntityInfo = useCallback(
    (customer) => (
      <Card className={`${getThemeClasses("bg-muted")} mb-6`} padding="p-6">
        <Badge variant="default" size="lg" className={`text-lg font-semibold ${getThemeClasses("text-primary")} mb-4 flex items-center`}>
          <UserIcon className={`w-5 h-5 mr-2 ${getThemeClasses("text-secondary")}`} />
          Customer Information
        </Badge>
        <Card padding="p-0" className="grid grid-cols-1 md:grid-cols-2 gap-4 border-0 shadow-none">
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Name:</Badge>
            <Badge variant="default" size="sm">{customer.firstName} {customer.lastName}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Status:</Badge>
            {getStatusDisplay(customer.status)}
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <EnvelopeIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Email:</Badge>
            <Badge variant="default" size="sm">{customer.email}</Badge>
          </Card>
          <Card padding="p-0" className="flex items-center border-0 shadow-none">
            <PhoneIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
            <Badge variant="secondary" size="sm" className="font-medium mr-2">Phone:</Badge>
            <Badge variant="default" size="sm">{formatPhone(customer.phone)}</Badge>
          </Card>
        </Card>
      </Card>
    ),
    [formatPhone, getStatusDisplay, getThemeClasses],
  );

  return (
    <EntityActionDeletePage
      entityType="Customer"
      entityTypePlural="Customers"
      basePath="/admin/customers"
      listPath="/admin/customers"
      entityParamName="cid"
      entityIcon={UsersIcon}
      fetchEntity={fetchEntity}
      executeDelete={executeDelete}
      renderEntityInfo={renderEntityInfo}
      successRedirectPath="/admin/customers"
    />
  );
}

export default AdminCustomerDetailMoreDeletePage;
