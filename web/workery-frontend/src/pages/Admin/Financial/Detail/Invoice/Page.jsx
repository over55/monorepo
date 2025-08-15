// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../../../../components/UI";
import { DateTime } from "luxon";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../../constants/FieldOptions";

function AdminFinancialInvoiceDetailPage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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
    // Navigate to invoice generation step 1
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
  };

  // Handle regenerate invoice click
  const onRegenerateInvoiceClick = () => {
    // Navigate to invoice generation step 1 for editing
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
    } catch (error) {
      return dateString;
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "-";
    // Simple formatting: (XXX) XXX-XXXX
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

  // Render error messages
  const renderErrors = () => {
    if (!errors || Object.keys(errors).length === 0) return null;

    return (
      <Alert type="error">
        <h4>Error</h4>
        {errors.general && <p>{errors.general}</p>}
        {Object.keys(errors).map((key) => {
          if (key !== "general") {
            return <p key={key}>{`${key}: ${errors[key]}`}</p>;
          }
          return null;
        })}
      </Alert>
    );
  };

  // Render invoice line item
  const renderLineItem = (lineNumber, qty, desc, price, amount) => {
    if (!qty || qty <= 0) return null;

    return (
      <tr>
        <th
          style={{
            width: "30%",
            backgroundColor: "#f8f9fa",
            padding: "10px",
            textAlign: "left",
          }}
        >
          Line {lineNumber.toString().padStart(2, "0")}
        </th>
        <td style={{ padding: "10px" }}>
          <strong>Quantity:</strong> x{qty}
          <br />
          <strong>Description:</strong> {desc}
          <br />
          <strong>Price:</strong> {formatCurrency(price)}
          <br />
          <strong>Amount:</strong> {formatCurrency(amount)}
        </td>
      </tr>
    );
  };

  // Loading state
  if (isFetching) {
    return (
      <div>
        <Breadcrumb
          items={[
            { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
            { path: "/admin/financials", label: "Financials", icon: "💳" },
            {
              path: `/admin/financial/${oid}`,
              label: `Order #${oid}`,
              icon: "📄",
            },
            { label: "Invoice", icon: "📋" },
          ]}
        />
        <Loading message="Loading invoice details..." />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/financials", label: "Financials", icon: "💳" },
          {
            path: `/admin/financial/${oid}`,
            label: `Order #${oid}`,
            icon: "📄",
          },
          { label: "Invoice", icon: "📋" },
        ]}
      />

      {/* Page banner for archived orders */}
      {isOrderArchived() && <Alert type="info">This order is archived.</Alert>}

      {/* Page Title */}
      <h1>💳 Financials</h1>
      <h4>📄 Detail</h4>
      <hr />

      {/* Error display */}
      {renderErrors()}

      {/* Main Content */}
      {order && (
        <Card
          title="📋 Invoice Detail"
          actions={
            order.invoice ? (
              <>
                <Button variant="warning" onClick={onRegenerateInvoiceClick}>
                  ✏️ Edit & Regenerate Invoice
                </Button>
                {order.invoice.fileObjectUrl && (
                  <>
                    &nbsp;
                    <a
                      href={order.invoice.fileObjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="success">⬇️ Download Invoice</Button>
                    </a>
                  </>
                )}
              </>
            ) : (
              <Button variant="primary" onClick={onGenerateInvoiceClick}>
                ➕ Generate Invoice
              </Button>
            )
          }
        >
          {/* Tab Navigation */}
          <div style={{ marginBottom: "20px" }}>
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                padding: 0,
                borderBottom: "1px solid #ddd",
              }}
            >
              <li style={{ marginRight: "20px", paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}`}>Detail</Link>
              </li>
              <li
                style={{
                  marginRight: "20px",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #007bff",
                }}
              >
                <strong>Invoice</strong>
              </li>
              <li style={{ paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}/more`}>More ⋯</Link>
              </li>
            </ul>
          </div>

          {order.invoice ? (
            <>
              {/* Invoice Header */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                    <th
                      colSpan="2"
                      style={{ padding: "10px", textAlign: "left" }}
                    >
                      Invoice Header
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      style={{
                        width: "30%",
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Order #
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.wjid || order.id}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Invoice Date
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.invoiceDate)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Associate Name
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.associateName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Associate Phone
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatPhone(order.invoice.associatePhone)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Associate Tax #
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.associateTaxId || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Client Name
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.clientName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Client Address
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.clientAddress ||
                        order.customerFullAddressWithoutPostalCode ||
                        "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Client Phone
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatPhone(
                        order.invoice.clientPhone || order.customerPhone,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Client Email
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.clientEmail || order.customerEmail || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Description */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                    <th
                      colSpan="2"
                      style={{ padding: "10px", textAlign: "left" }}
                    >
                      Invoice Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      style={{
                        width: "30%",
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Invoice IDs
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoiceIds || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Order #
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.wjid || order.id}
                    </td>
                  </tr>

                  {/* Line Items */}
                  {renderLineItem(
                    1,
                    order.invoice.line01Qty,
                    order.invoice.line01Desc,
                    order.invoice.line01Price,
                    order.invoice.line01Amount,
                  )}
                  {renderLineItem(
                    2,
                    order.invoice.line02Qty,
                    order.invoice.line02Desc,
                    order.invoice.line02Price,
                    order.invoice.line02Amount,
                  )}
                  {renderLineItem(
                    3,
                    order.invoice.line03Qty,
                    order.invoice.line03Desc,
                    order.invoice.line03Price,
                    order.invoice.line03Amount,
                  )}
                  {renderLineItem(
                    4,
                    order.invoice.line04Qty,
                    order.invoice.line04Desc,
                    order.invoice.line04Price,
                    order.invoice.line04Amount,
                  )}
                  {renderLineItem(
                    5,
                    order.invoice.line05Qty,
                    order.invoice.line05Desc,
                    order.invoice.line05Price,
                    order.invoice.line05Amount,
                  )}
                  {renderLineItem(
                    6,
                    order.invoice.line06Qty,
                    order.invoice.line06Desc,
                    order.invoice.line06Price,
                    order.invoice.line06Amount,
                  )}
                  {renderLineItem(
                    7,
                    order.invoice.line07Qty,
                    order.invoice.line07Desc,
                    order.invoice.line07Price,
                    order.invoice.line07Amount,
                  )}
                  {renderLineItem(
                    8,
                    order.invoice.line08Qty,
                    order.invoice.line08Desc,
                    order.invoice.line08Price,
                    order.invoice.line08Amount,
                  )}
                  {renderLineItem(
                    9,
                    order.invoice.line09Qty,
                    order.invoice.line09Desc,
                    order.invoice.line09Price,
                    order.invoice.line09Amount,
                  )}
                  {renderLineItem(
                    10,
                    order.invoice.line10Qty,
                    order.invoice.line10Desc,
                    order.invoice.line10Price,
                    order.invoice.line10Amount,
                  )}
                  {renderLineItem(
                    11,
                    order.invoice.line11Qty,
                    order.invoice.line11Desc,
                    order.invoice.line11Price,
                    order.invoice.line11Amount,
                  )}
                  {renderLineItem(
                    12,
                    order.invoice.line12Qty,
                    order.invoice.line12Desc,
                    order.invoice.line12Price,
                    order.invoice.line12Amount,
                  )}
                  {renderLineItem(
                    13,
                    order.invoice.line13Qty,
                    order.invoice.line13Desc,
                    order.invoice.line13Price,
                    order.invoice.line13Amount,
                  )}
                  {renderLineItem(
                    14,
                    order.invoice.line14Qty,
                    order.invoice.line14Desc,
                    order.invoice.line14Price,
                    order.invoice.line14Amount,
                  )}
                  {renderLineItem(
                    15,
                    order.invoice.line15Qty,
                    order.invoice.line15Desc,
                    order.invoice.line15Price,
                    order.invoice.line15Amount,
                  )}

                  {/* Totals */}
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Deposit
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatCurrency(order.invoice.deposit)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Actual Labour
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatCurrency(order.invoice.totalLabour)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Actual Materials
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatCurrency(order.invoice.totalMaterials)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Other Costs
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatCurrency(order.invoice.otherCosts)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Total Tax
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatCurrency(order.invoice.tax)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Total
                    </th>
                    <td style={{ padding: "10px" }}>
                      <strong>{formatCurrency(order.invoice.total)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Date of Quote Approval
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.invoiceQuoteDate)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Customer Approval
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.invoiceCustomersApproval || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Line 01 - Notes or Extras
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.line01Notes || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Line 02 - Notes or Extras
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.line02Notes || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Date Client Paid Invoice
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.dateClientPaidInvoice)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Payment Method(s)
                    </th>
                    <td style={{ padding: "10px" }}>
                      {getPaymentMethodsDisplay(order.invoice.paymentMethods)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Client Signature upon completion
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.clientSignature || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Associate Signature Date
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.associateSignDate)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Associate Signature
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.associateSignature || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* System Information */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                    <th
                      colSpan="2"
                      style={{ padding: "10px", textAlign: "left" }}
                    >
                      System Information
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      style={{
                        width: "30%",
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Order #
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.wjid || order.id}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Created At
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.createdAt)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Created By
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.createdByUserName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Modified At
                    </th>
                    <td style={{ padding: "10px" }}>
                      {formatDate(order.invoice.modifiedAt)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Modified By
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.modifiedByUserName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Revision Version
                    </th>
                    <td style={{ padding: "10px" }}>
                      {order.invoice.revisionVersion || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <h2>📋 No Invoice</h2>
              <p style={{ marginTop: "20px", marginBottom: "30px" }}>
                No invoice has been created for this order yet. You will need to
                create it before you can download the PDF copy.
              </p>
              <Button variant="primary" onClick={onGenerateInvoiceClick}>
                ➕ Click here to generate invoice →
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link to="/admin/financials">
              <Button variant="secondary">← Back to Financials</Button>
            </Link>
            <div>
              {order.invoice ? (
                <>
                  <Button variant="warning" onClick={onRegenerateInvoiceClick}>
                    ✏️ Edit & Regenerate Invoice
                  </Button>
                  {order.invoice.fileObjectUrl && (
                    <>
                      &nbsp;
                      <a
                        href={order.invoice.fileObjectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="success">⬇️ Download Invoice</Button>
                      </a>
                    </>
                  )}
                </>
              ) : (
                <Button variant="primary" onClick={onGenerateInvoiceClick}>
                  ➕ Generate Invoice
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminFinancialInvoiceDetailPage;
