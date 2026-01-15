// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step4Page.jsx
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../../constants/FieldOptions";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme } from "../../../../../../components/UIX";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  PencilIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
  InformationCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  HomeIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { ensureISODateForAPI } from "../../../../../../services/Helpers/DateFormatter";

function AdminFinancialGenerateInvoiceStep4Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

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
    { label: "Financials", to: "/admin/financials", icon: CreditCardIcon },
    { label: `Order #${oid}`, to: `/admin/financial/${oid}/invoice`, icon: DocumentTextIcon },
    { label: "Generate Invoice", icon: DocumentPlusIcon, isActive: true },
  ], [oid]);

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Section Component with Dark Header
  const ReviewSection = ({ title, icon: Icon, editLink, children }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
        {editLink && (
          <Link
            to={editLink}
            className="inline-flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-100 transition-colors"
          >
            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Edit
          </Link>
        )}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  // Load order details and invoice data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Load existing wizard data
          const existingData = invoiceStorage.getInvoiceGenerationData();

          if (!existingData || existingData.invoiceId !== oid) {
            // No data from previous steps, redirect back
            navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
            return;
          }

          setInvoiceData(existingData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors({ general: "Failed to load order details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [oid]);

  const handleSubmit = async () => {
    if (!invoiceData) {
      setErrors({ general: "Invoice data is missing" });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare payload in snake_case format expected by API
      const payload = {
        order_id: order.id,

        // Step 1 - Header
        invoice_id: invoiceData.invoiceId,
        invoice_date: ensureISODateForAPI(invoiceData.invoiceDate),
        associate_name: invoiceData.associateName,
        associate_phone: invoiceData.associatePhone,
        associate_tax_id: invoiceData.associateTaxId,
        client_name: invoiceData.customerName,
        client_address: invoiceData.customerAddress,
        client_email: invoiceData.customerEmail,
        client_phone: invoiceData.customerPhone,

        // Step 2 - Line Items
        line_01_quantity: parseInt(invoiceData.line01Quantity) || 0,
        line_01_description: invoiceData.line01Description || "",
        line_01_unit_price: parseFloat(invoiceData.line01UnitPrice) || 0,
        line_01_amount: parseFloat(invoiceData.line01Amount) || 0,
        line_02_quantity: parseInt(invoiceData.line02Quantity) || 0,
        line_02_description: invoiceData.line02Description || "",
        line_02_unit_price: parseFloat(invoiceData.line02UnitPrice) || 0,
        line_02_amount: parseFloat(invoiceData.line02Amount) || 0,
        line_03_quantity: parseInt(invoiceData.line03Quantity) || 0,
        line_03_description: invoiceData.line03Description || "",
        line_03_unit_price: parseFloat(invoiceData.line03UnitPrice) || 0,
        line_03_amount: parseFloat(invoiceData.line03Amount) || 0,
        line_04_quantity: parseInt(invoiceData.line04Quantity) || 0,
        line_04_description: invoiceData.line04Description || "",
        line_04_unit_price: parseFloat(invoiceData.line04UnitPrice) || 0,
        line_04_amount: parseFloat(invoiceData.line04Amount) || 0,
        line_05_quantity: parseInt(invoiceData.line05Quantity) || 0,
        line_05_description: invoiceData.line05Description || "",
        line_05_unit_price: parseFloat(invoiceData.line05UnitPrice) || 0,
        line_05_amount: parseFloat(invoiceData.line05Amount) || 0,
        line_06_quantity: parseInt(invoiceData.line06Quantity) || 0,
        line_06_description: invoiceData.line06Description || "",
        line_06_unit_price: parseFloat(invoiceData.line06UnitPrice) || 0,
        line_06_amount: parseFloat(invoiceData.line06Amount) || 0,
        line_07_quantity: parseInt(invoiceData.line07Quantity) || 0,
        line_07_description: invoiceData.line07Description || "",
        line_07_unit_price: parseFloat(invoiceData.line07UnitPrice) || 0,
        line_07_amount: parseFloat(invoiceData.line07Amount) || 0,
        line_08_quantity: parseInt(invoiceData.line08Quantity) || 0,
        line_08_description: invoiceData.line08Description || "",
        line_08_unit_price: parseFloat(invoiceData.line08UnitPrice) || 0,
        line_08_amount: parseFloat(invoiceData.line08Amount) || 0,
        line_09_quantity: parseInt(invoiceData.line09Quantity) || 0,
        line_09_description: invoiceData.line09Description || "",
        line_09_unit_price: parseFloat(invoiceData.line09UnitPrice) || 0,
        line_09_amount: parseFloat(invoiceData.line09Amount) || 0,
        line_10_quantity: parseInt(invoiceData.line10Quantity) || 0,
        line_10_description: invoiceData.line10Description || "",
        line_10_unit_price: parseFloat(invoiceData.line10UnitPrice) || 0,
        line_10_amount: parseFloat(invoiceData.line10Amount) || 0,
        line_11_quantity: parseInt(invoiceData.line11Quantity) || 0,
        line_11_description: invoiceData.line11Description || "",
        line_11_unit_price: parseFloat(invoiceData.line11UnitPrice) || 0,
        line_11_amount: parseFloat(invoiceData.line11Amount) || 0,
        line_12_quantity: parseInt(invoiceData.line12Quantity) || 0,
        line_12_description: invoiceData.line12Description || "",
        line_12_unit_price: parseFloat(invoiceData.line12UnitPrice) || 0,
        line_12_amount: parseFloat(invoiceData.line12Amount) || 0,
        line_13_quantity: parseInt(invoiceData.line13Quantity) || 0,
        line_13_description: invoiceData.line13Description || "",
        line_13_unit_price: parseFloat(invoiceData.line13UnitPrice) || 0,
        line_13_amount: parseFloat(invoiceData.line13Amount) || 0,
        line_14_quantity: parseInt(invoiceData.line14Quantity) || 0,
        line_14_description: invoiceData.line14Description || "",
        line_14_unit_price: parseFloat(invoiceData.line14UnitPrice) || 0,
        line_14_amount: parseFloat(invoiceData.line14Amount) || 0,
        line_15_quantity: parseInt(invoiceData.line15Quantity) || 0,
        line_15_description: invoiceData.line15Description || "",
        line_15_unit_price: parseFloat(invoiceData.line15UnitPrice) || 0,
        line_15_amount: parseFloat(invoiceData.line15Amount) || 0,

        // Step 3 - Financial Details
        total_labour: parseFloat(invoiceData.invoiceLabourAmount) || 0,
        total_materials: parseFloat(invoiceData.invoiceMaterialAmount) || 0,
        other_costs: parseFloat(invoiceData.invoiceOtherCostsAmount) || 0,
        sub_total:
          parseFloat(invoiceData.invoiceLabourAmount || 0) +
          parseFloat(invoiceData.invoiceMaterialAmount || 0) +
          parseFloat(invoiceData.invoiceOtherCostsAmount || 0),
        tax: parseFloat(invoiceData.invoiceTaxAmount) || 0,
        total: parseFloat(invoiceData.invoiceTotalAmount) || 0,
        deposit: parseFloat(invoiceData.invoiceDepositAmount) || 0,
        amount_due: parseFloat(invoiceData.invoiceAmountDue) || 0,
        invoice_quote_date: ensureISODateForAPI(invoiceData.invoiceQuoteDate),
        invoice_customers_approval: invoiceData.invoiceCustomersApproval,
        line_01_notes: invoiceData.line01Notes || "",
        line_02_notes: invoiceData.line02Notes || "",
        date_client_paid_invoice: ensureISODateForAPI(
          invoiceData.dateClientPaidInvoice,
        ),
        payment_methods: invoiceData.paymentMethods || [],
        client_signature: invoiceData.clientSignature,
        associate_sign_date: ensureISODateForAPI(invoiceData.associateSignDate),
        associate_signature: invoiceData.associateSignature,
        invoice_quote_days: parseInt(invoiceData.invoiceQuoteDays) || 30,
      };

      console.log("Submitting invoice generation payload:", payload);

      // Call the invoice operation
      await orderManager.invoiceOrder(oid, payload, onUnauthorized);

      // Clear the wizard data
      invoiceStorage.clearInvoiceGenerationData();

      // Navigate back to invoice detail page
      navigate(`/admin/financial/${oid}/invoice`);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    const backUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-3?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-3`;
    navigate(backUrl);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  const getPaymentMethodLabels = (methodValues) => {
    if (!methodValues || methodValues.length === 0) return "None";

    return methodValues
      .map((value) => {
        const method = ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.find(
          (m) => m.value === value,
        );
        return method ? method.label : "";
      })
      .filter((label) => label)
      .join(", ");
  };

  // Get all non-empty line items for display
  const getActiveLineItems = () => {
    const lineItems = [];
    for (let i = 1; i <= 15; i++) {
      const lineNum = i.toString().padStart(2, "0");
      const quantity = invoiceData[`line${lineNum}Quantity`];
      if (quantity && parseInt(quantity) > 0) {
        lineItems.push({
          number: lineNum,
          quantity: invoiceData[`line${lineNum}Quantity`],
          description: invoiceData[`line${lineNum}Description`],
          unitPrice: invoiceData[`line${lineNum}UnitPrice`],
          amount: invoiceData[`line${lineNum}Amount`],
        });
      }
    }
    return lineItems;
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const activeLineItems = getActiveLineItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <DocumentPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                {isEditMode ? "Edit Invoice" : "Generate Invoice"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Step 4 of 4 - Review & Submit
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Steps - Improved Responsive Design */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">4</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 4: Review
                    </p>
                    <p className="text-xs text-gray-500">Confirm & Submit</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">4 of 4</div>
              </div>
            </div>
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Header Info"}
                        {step === 2 && "Line Items"}
                        {step === 3 && "Footer Info"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-2 w-16 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Dark Background */}
          <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-4 sm:py-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
              <CheckCircleIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 flex-shrink-0" />
              Review Invoice Details
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Please carefully review all invoice details before submitting
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {errors.general && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                <span className="break-words">{errors.general}</span>
              </div>
            )}

            {Object.keys(errors).length > 0 &&
              Object.keys(errors).some((key) => key !== "general") && (
                <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-2 text-sm sm:text-base">
                        Please correct the following errors:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(
                          ([key, value]) =>
                            key !== "general" && (
                              <li key={key} className="text-xs sm:text-sm">
                                {value}
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-sm sm:text-base text-gray-600">
                    Generating invoice...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Header Information Section */}
                <ReviewSection
                  title="Step 1 - Header Information"
                  icon={UserIcon}
                  editLink={`/admin/financial/${oid}/invoice/generate/step-1`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Invoice ID #:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.invoiceId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Invoice Date:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.invoiceDate}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Associate Name:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.associateName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Associate Phone:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.associatePhone}
                      </dd>
                    </div>
                    {invoiceData.associateTaxId && (
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">
                          Associate Tax ID:
                        </dt>
                        <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                          {invoiceData.associateTaxId}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Client Name:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.customerName}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Client Address:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.customerAddress}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">
                        Client Phone:
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900">
                        {invoiceData.customerPhone}
                      </dd>
                    </div>
                    {invoiceData.customerEmail && (
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">
                          Client Email:
                        </dt>
                        <dd className="mt-1 text-sm sm:text-base font-medium text-gray-900 break-all">
                          {invoiceData.customerEmail}
                        </dd>
                      </div>
                    )}
                  </div>
                </ReviewSection>

                {/* Line Items Section */}
                <ReviewSection
                  title="Step 2 - Line Items"
                  icon={ClipboardDocumentListIcon}
                  editLink={`/admin/financial/${oid}/invoice/generate/step-2`}
                >
                  {activeLineItems.length > 0 ? (
                    <div className="space-y-4">
                      {activeLineItems.map((item, index) => (
                        <div
                          key={item.number}
                          className={`${
                            index > 0 ? "pt-4 border-t border-gray-200" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Line {item.number}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                            <div>
                              <dt className="text-xs sm:text-sm font-medium text-gray-500">
                                Quantity:
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base text-gray-900">
                                {item.quantity}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs sm:text-sm font-medium text-gray-500">
                                Unit Price:
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base text-gray-900">
                                {formatCurrency(item.unitPrice)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs sm:text-sm font-medium text-gray-500">
                                Amount:
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base text-gray-900 font-semibold">
                                {formatCurrency(item.amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs sm:text-sm font-medium text-gray-500">
                                Description:
                              </dt>
                              <dd className="mt-1 text-sm sm:text-base text-gray-900">
                                {item.description}
                              </dd>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      No line items added
                    </p>
                  )}
                </ReviewSection>

                {/* Financial Details & Signatures Section */}
                <ReviewSection
                  title="Step 3 - Financial Details & Signatures"
                  icon={BanknotesIcon}
                  editLink={`/admin/financial/${oid}/invoice/generate/step-3`}
                >
                  <div className="space-y-6">
                    {/* Financial Summary */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Financial Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Labour Amount:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {formatCurrency(invoiceData.invoiceLabourAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Material Amount:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {formatCurrency(invoiceData.invoiceMaterialAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Other Costs:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {formatCurrency(
                              invoiceData.invoiceOtherCostsAmount,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Sub-Total:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900 font-semibold">
                            {formatCurrency(
                              (parseFloat(invoiceData.invoiceLabourAmount) ||
                                0) +
                                (parseFloat(
                                  invoiceData.invoiceMaterialAmount,
                                ) || 0) +
                                (parseFloat(
                                  invoiceData.invoiceOtherCostsAmount,
                                ) || 0),
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Tax:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {formatCurrency(invoiceData.invoiceTaxAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Total:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900 font-bold text-green-600">
                            {formatCurrency(invoiceData.invoiceTotalAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Deposit:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {formatCurrency(invoiceData.invoiceDepositAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Amount Due:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900 font-bold text-red-600">
                            {formatCurrency(invoiceData.invoiceAmountDue)}
                          </dd>
                        </div>
                      </div>
                    </div>

                    {/* Quote & Payment Details */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Quote & Payment Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Quote Valid For:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.invoiceQuoteDays} days
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Date of Quote Approval:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.invoiceQuoteDate}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Customer Approval:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.invoiceCustomersApproval}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Date Client Paid:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.dateClientPaidInvoice}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Payment Methods:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {getPaymentMethodLabels(invoiceData.paymentMethods)}
                          </dd>
                        </div>
                        {invoiceData.line01Notes && (
                          <div className="sm:col-span-2">
                            <dt className="text-xs sm:text-sm font-medium text-gray-500">
                              Line 01 Notes:
                            </dt>
                            <dd className="mt-1 text-sm sm:text-base text-gray-900">
                              {invoiceData.line01Notes}
                            </dd>
                          </div>
                        )}
                        {invoiceData.line02Notes && (
                          <div className="sm:col-span-2">
                            <dt className="text-xs sm:text-sm font-medium text-gray-500">
                              Line 02 Notes:
                            </dt>
                            <dd className="mt-1 text-sm sm:text-base text-gray-900">
                              {invoiceData.line02Notes}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Signatures
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Client Signature:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.clientSignature}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Signature:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.associateSignature}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Sign Date:
                          </dt>
                          <dd className="mt-1 text-sm sm:text-base text-gray-900">
                            {invoiceData.associateSignDate}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </ReviewSection>

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="order-2 sm:order-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 3
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    {isEditMode ? "Update Invoice" : "Submit Invoice"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/financial/${oid}/invoice`}
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
          >
            <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminFinancialGenerateInvoiceStep4PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialGenerateInvoiceStep4Page />
    </UIXThemeProvider>
  );
}

export default AdminFinancialGenerateInvoiceStep4PageWithProvider;
