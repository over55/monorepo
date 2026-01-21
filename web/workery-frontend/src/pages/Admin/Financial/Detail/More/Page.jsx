// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/More/Page.jsx
// @uix-page: FinancialMorePage
// UIX Upgraded - Full UIX conversion

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
import {
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
  PageHeader,
  Alert,
  Tabs,
  BackButton,
  ActionCard,
} from "../../../../../components/UIX";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialDetailMorePage() {
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
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Financials", to: "/admin/financials", icon: CurrencyDollarIcon },
    { label: `Order #${oid}`, to: `/admin/financial/${oid}`, icon: DocumentIcon },
    { label: "More", icon: EllipsisHorizontalIcon, isActive: true },
  ], [oid]);

  // Tab items for navigation
  const tabItems = useMemo(() => [
    { id: "detail", label: "Detail", to: `/admin/financial/${oid}` },
    { id: "invoice", label: "Invoice", to: `/admin/financial/${oid}/invoice` },
    { id: "more", label: "More", isActive: true, icon: EllipsisHorizontalIcon },
  ], [oid]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order details
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetails = async () => {
      if (!oid) {
        setErrors({ general: "Order ID is required" });
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        if (mounted) {
          if (typeof error === "object" && error !== null) {
            setErrors(error);
          } else {
            setErrors({
              general: "Failed to load order details. Please try again.",
            });
          }
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchOrderDetails();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <PageHeader
        icon={CurrencyDollarIcon}
        title="Financials"
        subtitle={`Additional actions and settings for order #${oid}`}
      />

      {/* Status Alerts */}
      {isOrderArchived() && (
        <Alert type="info" icon={ArchiveBoxIcon}>
          This order is archived
        </Alert>
      )}

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error" dismissible onDismiss={() => setErrors({})}>
          {errors.general && <p>{errors.general}</p>}
          {Object.keys(errors).map((key) => {
            if (key !== "general") {
              return <p key={key}>{`${key}: ${errors[key]}`}</p>;
            }
            return null;
          })}
        </Alert>
      )}

      {/* Main Content */}
      {order && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <Tabs tabs={tabItems} mode="routing" />

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Clone Order Action */}
            <ActionCard
              title="Clone Order"
              subtitle="Create a duplicate of this order"
              icon={DocumentDuplicateIcon}
              path={`/admin/financial/${oid}/more/clone`}
            />
          </div>

          {/* Information Alert */}
          <Alert type="info" icon={InformationCircleIcon}>
            <strong>Note:</strong> Use these actions to manage and process
            your financial orders. Some actions may require additional
            permissions or may not be available for archived orders.
          </Alert>

          {/* Bottom Navigation */}
          <div className="flex justify-start pt-6">
            <BackButton to="/admin/financials" label="Back to Financials" size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminFinancialDetailMorePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialDetailMorePage />
    </UIXThemeProvider>
  );
}

export default AdminFinancialDetailMorePageWithProvider;
