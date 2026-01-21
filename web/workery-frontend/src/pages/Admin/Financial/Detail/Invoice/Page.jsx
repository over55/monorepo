// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Page.jsx
// @uix-page: FinancialInvoicePage
// UIX Upgraded - Full UIX conversion

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
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
  Table,
} from "../../../../../components/UIX";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../constants/FieldOptions";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";

function AdminFinancialInvoiceDetailPage() {
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
    { label: `Order #${oid}`, to: `/admin/financial/${oid}`, icon: ClipboardDocumentListIcon },
    { label: "Invoice", icon: DocumentTextIcon, isActive: true },
  ], [oid]);

  // Tab items for navigation
  const tabItems = useMemo(() => [
    { id: "detail", label: "Detail", to: `/admin/financial/${oid}` },
    { id: "invoice", label: "Invoice", isActive: true },
    { id: "more", label: "More", to: `/admin/financial/${oid}/more`, icon: EllipsisHorizontalIcon },
  ], [oid]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Handle generate invoice click
  const onGenerateInvoiceClick = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
  };

  // Handle regenerate invoice click
  const onRegenerateInvoiceClick = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-1?mode=edit`);
  };

  // Handle invoice download
  const onDownloadInvoiceClick = async () => {
    if (!order?.invoice?.fileObjectUrl) {
      console.error("No invoice file URL available");
      setErrors({ general: "Invoice file not available for download" });
      return;
    }

    setIsDownloading(true);
    setErrors({});

    try {
      // Fetch the file from the URL
      const response = await fetch(order.invoice.fileObjectUrl);

      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;

      // Set the filename - use invoice ID or order ID
      const fileName = `invoice_${order.invoiceIds || order.wjid || order.id}.pdf`;
      link.download = fileName;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      console.log(`Invoice downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      setErrors({
        general: "Failed to download invoice. Please try again later.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Get payment methods display
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

  // Render invoice line item
  const renderLineItem = (lineNumber, qty, desc, price, amount) => {
    if (!qty || qty <= 0) return null;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          Line {lineNumber.toString().padStart(2, "0")}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">x{qty}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{desc}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatCurrency(price)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {formatCurrency(amount)}
        </td>
      </tr>
    );
  };

  // Generate action buttons based on invoice state
  const actionButtons = useMemo(() => {
    if (!order) return [];

    const buttons = [];
    if (order.invoice) {
      buttons.push(
        <Button
          key="regenerate"
          variant="secondary"
          icon={PencilSquareIcon}
          onClick={onRegenerateInvoiceClick}
        >
          Edit & Regenerate
        </Button>
      );
      if (order.invoice.fileObjectUrl) {
        buttons.push(
          <Button
            key="download"
            variant="success"
            icon={ArrowDownTrayIcon}
            onClick={onDownloadInvoiceClick}
            loading={isDownloading}
            loadingText="Downloading..."
          >
            Download Invoice
          </Button>
        );
      }
    } else {
      buttons.push(
        <Button
          key="generate"
          variant="success"
          icon={PlusCircleIcon}
          onClick={onGenerateInvoiceClick}
        >
          Generate Invoice
        </Button>
      );
    }
    return buttons;
  }, [order, isDownloading, onRegenerateInvoiceClick, onDownloadInvoiceClick, onGenerateInvoiceClick]);

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading invoice details...</p>
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
        subtitle="Manage invoice and financial details"
        actions={actionButtons}
      />

      {/* Status Alerts */}
      {isOrderArchived() && (
        <Alert type="info" icon={ArchiveBoxIcon}>
          This order is archived
        </Alert>
      )}

      {/* Error Display */}
      {errors.general && (
        <Alert type="error" dismissible onDismiss={() => setErrors({})}>
          {errors.general}
        </Alert>
      )}

      {/* Main Content */}
      {order && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <Tabs tabs={tabItems} mode="routing" />

          {order.invoice ? (
            <div className="space-y-6">
              {/* Invoice Header Section */}
              <DetailCard title="Invoice Header" icon={DocumentTextIcon} maxWidth="full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField label="Order #" value={order.wjid || order.id} />
                  <DataField label="Invoice Date" value={formatDateForDisplay(order.invoice.invoiceDate)} />
                  <DataField label="Associate Name" value={order.invoice.associateName} />
                  <DataField label="Associate Phone" value={formatPhone(order.invoice.associatePhone)} />
                  <DataField label="Associate Tax #" value={order.invoice.associateTaxId} />
                  <DataField label="Client Name" value={order.invoice.clientName} />
                  <DataField label="Client Address" value={order.invoice.clientAddress || order.customerFullAddressWithoutPostalCode} fullWidth />
                  <DataField label="Client Phone" value={formatPhone(order.invoice.clientPhone || order.customerPhone)} />
                  <DataField label="Client Email" value={order.invoice.clientEmail || order.customerEmail} />
                </div>
              </DetailCard>

              {/* Invoice Description Section */}
              <DetailCard title="Invoice Description" icon={ClipboardDocumentListIcon} maxWidth="full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <DataField label="Invoice IDs" value={order.invoiceIds} />
                  <DataField label="Order #" value={order.wjid || order.id} />
                </div>

                {/* Line Items Table */}
                {(order.invoice.line01Qty > 0 ||
                  order.invoice.line02Qty > 0 ||
                  order.invoice.line03Qty > 0 ||
                  order.invoice.line04Qty > 0 ||
                  order.invoice.line05Qty > 0 ||
                  order.invoice.line06Qty > 0 ||
                  order.invoice.line07Qty > 0 ||
                  order.invoice.line08Qty > 0 ||
                  order.invoice.line09Qty > 0 ||
                  order.invoice.line10Qty > 0 ||
                  order.invoice.line11Qty > 0 ||
                  order.invoice.line12Qty > 0 ||
                  order.invoice.line13Qty > 0 ||
                  order.invoice.line14Qty > 0 ||
                  order.invoice.line15Qty > 0) && (
                  <div className="mb-6">
                    <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-3`}>Line Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {renderLineItem(1, order.invoice.line01Qty, order.invoice.line01Desc, order.invoice.line01Price, order.invoice.line01Amount)}
                          {renderLineItem(2, order.invoice.line02Qty, order.invoice.line02Desc, order.invoice.line02Price, order.invoice.line02Amount)}
                          {renderLineItem(3, order.invoice.line03Qty, order.invoice.line03Desc, order.invoice.line03Price, order.invoice.line03Amount)}
                          {renderLineItem(4, order.invoice.line04Qty, order.invoice.line04Desc, order.invoice.line04Price, order.invoice.line04Amount)}
                          {renderLineItem(5, order.invoice.line05Qty, order.invoice.line05Desc, order.invoice.line05Price, order.invoice.line05Amount)}
                          {renderLineItem(6, order.invoice.line06Qty, order.invoice.line06Desc, order.invoice.line06Price, order.invoice.line06Amount)}
                          {renderLineItem(7, order.invoice.line07Qty, order.invoice.line07Desc, order.invoice.line07Price, order.invoice.line07Amount)}
                          {renderLineItem(8, order.invoice.line08Qty, order.invoice.line08Desc, order.invoice.line08Price, order.invoice.line08Amount)}
                          {renderLineItem(9, order.invoice.line09Qty, order.invoice.line09Desc, order.invoice.line09Price, order.invoice.line09Amount)}
                          {renderLineItem(10, order.invoice.line10Qty, order.invoice.line10Desc, order.invoice.line10Price, order.invoice.line10Amount)}
                          {renderLineItem(11, order.invoice.line11Qty, order.invoice.line11Desc, order.invoice.line11Price, order.invoice.line11Amount)}
                          {renderLineItem(12, order.invoice.line12Qty, order.invoice.line12Desc, order.invoice.line12Price, order.invoice.line12Amount)}
                          {renderLineItem(13, order.invoice.line13Qty, order.invoice.line13Desc, order.invoice.line13Price, order.invoice.line13Amount)}
                          {renderLineItem(14, order.invoice.line14Qty, order.invoice.line14Desc, order.invoice.line14Price, order.invoice.line14Amount)}
                          {renderLineItem(15, order.invoice.line15Qty, order.invoice.line15Desc, order.invoice.line15Price, order.invoice.line15Amount)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField label="Deposit" value={formatCurrency(order.invoice.deposit)} />
                  <DataField label="Actual Labour" value={formatCurrency(order.invoice.totalLabour)} />
                  <DataField label="Actual Materials" value={formatCurrency(order.invoice.totalMaterials)} />
                  <DataField label="Other Costs" value={formatCurrency(order.invoice.otherCosts)} />
                  <DataField label="Total Tax" value={formatCurrency(order.invoice.tax)} />
                  <DataField label="Total" value={<span className="font-bold">{formatCurrency(order.invoice.total)}</span>} />
                  <DataField label="Date of Quote Approval" value={formatDateForDisplay(order.invoice.invoiceQuoteDate)} />
                  <DataField label="Customer Approval" value={order.invoice.invoiceCustomersApproval} />
                  <DataField label="Line 01 - Notes or Extras" value={order.invoice.line01Notes} fullWidth />
                  <DataField label="Line 02 - Notes or Extras" value={order.invoice.line02Notes} fullWidth />
                  <DataField label="Date Client Paid Invoice" value={formatDateForDisplay(order.invoice.dateClientPaidInvoice)} />
                  <DataField label="Payment Method(s)" value={getPaymentMethodsDisplay(order.invoice.paymentMethods)} />
                  <DataField label="Client Signature upon completion" value={order.invoice.clientSignature} />
                  <DataField label="Associate Signature Date" value={formatDateForDisplay(order.invoice.associateSignDate)} />
                  <DataField label="Associate Signature" value={order.invoice.associateSignature} />
                </div>
              </DetailCard>

              {/* System Information Section */}
              <DetailCard title="System Information" icon={InformationCircleIcon} maxWidth="full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField label="Order #" value={order.wjid || order.id} />
                  <DataField label="Created At" value={formatDateForDisplay(order.invoice.createdAt)} />
                  <DataField label="Created By" value={order.invoice.createdByUserName} />
                  <DataField label="Modified At" value={formatDateForDisplay(order.invoice.modifiedAt)} />
                  <DataField label="Modified By" value={order.invoice.modifiedByUserName} />
                  <DataField label="Revision Version" value={order.invoice.revisionVersion} />
                </div>
              </DetailCard>
            </div>
          ) : (
            // No invoice message
            <EmptyState
              icon={DocumentTextIcon}
              title="No Invoice"
              description="No invoice has been created for this order yet. You will need to create it before you can download the PDF copy."
              action={
                <Button variant="primary" icon={PlusCircleIcon} onClick={onGenerateInvoiceClick}>
                  Click here to generate invoice
                </Button>
              }
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 gap-3">
            <BackButton to="/admin/financials" label="Back to Financials" size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminFinancialInvoiceDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialInvoiceDetailPage />
    </UIXThemeProvider>
  );
}

export default AdminFinancialInvoiceDetailPageWithProvider;
