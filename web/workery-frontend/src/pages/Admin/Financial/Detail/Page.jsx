// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Page.jsx
// @uix-page: FinancialDetailPage
// UIX Upgraded - Full UIX conversion

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
  PageHeader,
  DetailCard,
  DataField,
  Alert,
  Tabs,
  Button,
  BackButton,
  EmptyState,
} from "../../../../components/UIX";
import {
  ChartBarIcon,
  CreditCardIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useOrderManager } from "../../../../services/Services";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../constants/FieldOptions";
import { ORDER_STATUS_ARCHIVED } from "../../../../constants/Order";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

function AdminFinancialDetailPage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // UIX Theme
  const { getThemeClasses } = useUIXTheme();
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
    textSuccess: getThemeClasses("text-success") || "text-green-600 dark:text-green-400",
    textDanger: getThemeClasses("text-danger") || "text-red-600 dark:text-red-400",
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Financials", to: "/admin/financials", icon: CreditCardIcon },
    { label: "Detail", icon: InformationCircleIcon, isActive: true },
  ], []);

  // Tab items for navigation
  const tabItems = useMemo(() => [
    { id: "detail", label: "Detail", isActive: true },
    { id: "invoice", label: "Invoice", to: `/admin/financial/${oid}/invoice` },
    { id: "more", label: "More", to: `/admin/financial/${oid}/more`, icon: EllipsisHorizontalIcon },
  ], [oid]);

  // Component states
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Initial data load
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetails = async () => {
      if (!oid) {
        if (mounted) {
          setError("Order ID is required");
        }
        return;
      }

      if (mounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
        if (mounted) {
          setOrder(orderData);
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        if (mounted) {
          setError("Failed to load financial details. Please try again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchOrderDetails();

    return () => {
      mounted = false;
    };
  }, [oid, orderManager, onUnauthorized]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodsDisplay = (paymentMethods) => {
    if (!paymentMethods || !Array.isArray(paymentMethods)) return "-";

    const methods = paymentMethods.map((methodId) => {
      const option = ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.find(
        (opt) => opt.value === methodId,
      );
      return option ? option.label : `Unknown (${methodId})`;
    });

    return methods.join(", ");
  };

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Check if customer ID is valid
  const hasValidCustomer = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.customerId && order.customerId !== EMPTY_OBJECT_ID;
  };

  // Check if associate ID is valid
  const hasValidAssociate = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.associateId && order.associateId !== EMPTY_OBJECT_ID;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 text-sm sm:text-base ${themeClasses.textSecondary}`}>
              Loading financial details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

      {/* Page Header */}
      <PageHeader
        icon={CreditCardIcon}
        title="Financials"
        subtitle={`View complete financial information for order #${order?.wjid || order?.id || oid}`}
        actions={[
          <BackButton key="back" to="/admin/financials" label="Back" size="md" />,
          <Button
            key="edit"
            variant="primary"
            icon={PencilSquareIcon}
            onClick={() => navigate(`/admin/financial/${oid}/edit`)}
            disabled={isOrderArchived()}
          >
            Edit
          </Button>
        ]}
      />

      {/* Status Alerts */}
      {order && isOrderArchived() && (
        <Alert type="info" icon={ArchiveBoxIcon}>
          This order is archived
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {order && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <Tabs tabs={tabItems} mode="routing" />

          {/* Order Information */}
          <DetailCard title="Order Information" icon={ClipboardDocumentListIcon} maxWidth="full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField
                label="Order #"
                value={
                  <Link to={`/admin/order/${order.wjid || order.id}`} className={themeClasses.linkPrimary}>
                    {order.wjid || order.id}
                  </Link>
                }
              />
              <DataField label="# of Visits" value={order.visits} />
              {hasValidCustomer() && (
                <DataField
                  label="Customer"
                  value={
                    <Link to={`/admin/customer/${order.customerId}`} className={themeClasses.linkPrimary}>
                      {order.customerName || "View Customer"}
                    </Link>
                  }
                />
              )}
              {hasValidAssociate() && (
                <DataField
                  label="Associate"
                  value={
                    <Link to={`/admin/associate/${order.associateId}`} className={themeClasses.linkPrimary}>
                      {order.associateName || "View Associate"}
                    </Link>
                  }
                />
              )}
            </div>
          </DetailCard>

          {/* Important Dates */}
          <DetailCard title="Important Dates" icon={CalendarIcon} maxWidth="full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Order Assignment Date" value={formatDateForDisplay(order.assignmentDate)} />
              <DataField label="Order Start Date" value={formatDateForDisplay(order.startDate)} />
              <DataField label="Order Completion Date" value={formatDateForDisplay(order.completionDate)} />
              <DataField label="Invoice Date" value={formatDateForDisplay(order.invoiceDate)} />
              <DataField label="Invoice Service Fee Payment Date" value={formatDateForDisplay(order.invoiceServiceFeePaymentDate)} />
            </div>
          </DetailCard>

          {/* Invoice Details */}
          <DetailCard title="Invoice Details" icon={DocumentTextIcon} maxWidth="full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Invoice ID(s) #" value={order.invoiceIds} />
              <DataField label="Invoice Quote" value={formatCurrency(order.invoiceQuoteAmount)} />
              <DataField label="Invoice Labour" value={formatCurrency(order.invoiceLabourAmount)} />
              <DataField label="Invoice Material" value={formatCurrency(order.invoiceMaterialAmount)} />
              <DataField
                label="Invoice Tax"
                value={
                  <>
                    {formatCurrency(order.invoiceTaxAmount)}
                    {order.invoiceIsCustomTaxAmount && (
                      <span className={`ml-2 text-xs sm:text-sm ${themeClasses.textSecondary}`}>
                        (Custom value was set)
                      </span>
                    )}
                  </>
                }
              />
              {order.associateTaxId && (
                <DataField label="Invoice HST #" value={order.associateTaxId} />
              )}
              <DataField
                label="Invoice Total"
                value={<span className="font-bold">{formatCurrency(order.invoiceTotalAmount)}</span>}
              />
            </div>
          </DetailCard>

          {/* Payment Information */}
          <DetailCard title="Payment Information" icon={CreditCardIcon} maxWidth="full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Invoice Service Fee" value={formatCurrency(order.invoiceServiceFeeAmount)} />
              <DataField label="Payment Method(s)" value={getPaymentMethodsDisplay(order.paymentMethods)} />
              <DataField label="Actual Service Fee Amount Paid" value={formatCurrency(order.invoiceActualServiceFeeAmountPaid)} />
              <DataField
                label="Account Balance"
                value={
                  <span className={`font-semibold ${order.invoiceBalanceOwingAmount > 0 ? themeClasses.textDanger : themeClasses.textSuccess}`}>
                    {formatCurrency(order.invoiceBalanceOwingAmount)}
                  </span>
                }
              />
            </div>
          </DetailCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center pt-4 sm:pt-6 gap-3">
            <BackButton to="/admin/financials" label="Back to Financials" size="lg" />
            <Button
              variant="primary"
              icon={PencilSquareIcon}
              onClick={() => navigate(`/admin/financial/${oid}/edit`)}
              disabled={isOrderArchived()}
            >
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!order && !loading && (
        <EmptyState
          icon={CreditCardIcon}
          title="Financial Record Not Found"
          description="The financial record you're looking for doesn't exist or you don't have permission to view it."
          action={
            <BackButton to="/admin/financials" label="Back to Financials" />
          }
        />
      )}
    </div>
  );
}

function AdminFinancialDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialDetailPage />
    </UIXThemeProvider>
  );
}

export default AdminFinancialDetailPageWithProvider;
