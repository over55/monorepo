// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/More/Page.jsx
// @uix-page: FinancialMorePage
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme } from "../../../../../components/UIX";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
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

  // Action card component
  const ActionCard = ({
    title,
    subtitle,
    icon: Icon,
    path,
    bgColorClass,
    hoverColorClass,
    disabled = false,
  }) => {
    const content = (
      <div
        className={`
          p-6 rounded-lg text-white text-center transition-all duration-200
          min-h-[180px] flex flex-col justify-center items-center
          ${disabled ? "bg-gray-400 cursor-not-allowed opacity-60" : `${bgColorClass} ${hoverColorClass} hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
        `}
      >
        <Icon
          className={`w-12 h-12 mb-3 mx-auto ${disabled ? "text-gray-200" : "text-white"}`}
        />
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
    );

    if (disabled) {
      return content;
    }

    return (
      <Link to={path} className="block">
        {content}
      </Link>
    );
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-3 text-blue-600" />
              Financials
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Additional actions and settings for order #{oid}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {isOrderArchived() && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5" />
            <div>
              {errors.general && <p>{errors.general}</p>}
              {Object.keys(errors).map((key) => {
                if (key !== "general") {
                  return <p key={key}>{`${key}: ${errors[key]}`}</p>;
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <EllipsisHorizontalIcon className="w-7 h-7 mr-2 text-blue-600" />
            More Actions
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/financial/${oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/financial/${oid}/invoice`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Invoice
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600 inline-flex items-center">
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </div>
          </nav>
        </div>

        {order && (
          <div className="p-6">
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Clone Order Action */}
              <ActionCard
                title="Clone Order"
                subtitle="Create a duplicate of this order"
                icon={DocumentDuplicateIcon}
                path={`/admin/financial/${oid}/more/clone`}
                bgColorClass="bg-cyan-600"
                hoverColorClass="hover:bg-cyan-700"
              />

              {/* Future actions can be added here as ActionCard components */}
              {/* Example:
              <ActionCard
                title="Email Invoice"
                subtitle="Send invoice to customer via email"
                icon={EnvelopeIcon}
                path={`/admin/financial/${oid}/more/email`}
                bgColorClass="bg-cyan-600"
                hoverColorClass="hover:bg-cyan-700"
              />
              <ActionCard
                title="Export PDF"
                subtitle="Download order details as PDF"
                icon={DocumentArrowDownIcon}
                path={`/admin/financial/${oid}/more/export`}
                bgColorClass="bg-cyan-600"
                hoverColorClass="hover:bg-cyan-700"
              />
              */}
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-8">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <strong>Note:</strong> Use these actions to manage and process
                  your financial orders. Some actions may require additional
                  permissions or may not be available for archived orders.
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-start pt-6 border-t border-gray-200">
              <Link to="/admin/financials">
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Financials
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
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
