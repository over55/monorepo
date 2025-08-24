// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../../constants/FieldOptions";
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
} from "@heroicons/react/24/outline";

function AdminFinancialGenerateInvoiceStep4Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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
        invoice_date: invoiceData.invoiceDate,
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
        invoice_quote_date: invoiceData.invoiceQuoteDate,
        invoice_customers_approval: invoiceData.invoiceCustomersApproval,
        line_01_notes: invoiceData.line01Notes || "",
        line_02_notes: invoiceData.line02Notes || "",
        date_client_paid_invoice: invoiceData.dateClientPaidInvoice,
        payment_methods: invoiceData.paymentMethods || [],
        client_signature: invoiceData.clientSignature,
        associate_sign_date: invoiceData.associateSignDate,
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
    navigate(`/admin/financial/${oid}/invoice/generate/step-3`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  const activeLineItems = getActiveLineItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/financials"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Financials</span>
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      Order #{oid} (Invoice)
                    </span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Generate Invoice
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Financials
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Generate Invoice - Step 4 of 4
          </p>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Header"}
                        {step === 2 && "Line Items"}
                        {step === 3 && "Financial"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    4
                  </span>
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Review
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Submit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View (below 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 4 of 4
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Review Invoice Details
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following invoice details and if you
              are ready click the <strong>Submit</strong> button to complete.
            </p>

            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.general}</span>
              </div>
            )}

            {Object.keys(errors).length > 0 &&
              Object.keys(errors).some((key) => key !== "general") && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-2">
                        Please correct the following errors:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(
                          ([key, value]) =>
                            key !== "general" && (
                              <li key={key} className="text-sm">
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Generating invoice...
                </span>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6 sm:space-y-8">
                  {/* Header Information Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                        Step 1 - Header Information
                      </h3>
                      <Link
                        to={`/admin/financial/${oid}/invoice/generate/step-1`}
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Invoice ID #:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.invoiceId}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Invoice Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.invoiceDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.associateName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Phone:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.associatePhone}
                          </p>
                        </div>
                        {invoiceData.associateTaxId && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Associate Tax ID:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {invoiceData.associateTaxId}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Client Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.customerName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Client Address:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.customerAddress}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Client Phone:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.customerPhone}
                          </p>
                        </div>
                        {invoiceData.customerEmail && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Client Email:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900 break-all">
                              {invoiceData.customerEmail}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Line Items Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                        Step 2 - Line Items
                      </h3>
                      <Link
                        to={`/admin/financial/${oid}/invoice/generate/step-2`}
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      {activeLineItems.length > 0 ? (
                        <div className="space-y-4">
                          {activeLineItems.map((item, index) => (
                            <div
                              key={item.number}
                              className={`${
                                index > 0 ? "pt-4 border-t border-gray-200" : ""
                              }`}
                            >
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                Line {item.number}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Quantity:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {item.quantity}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Unit Price:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {formatCurrency(item.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Description:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {item.description}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Amount:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {formatCurrency(item.amount)}
                                  </p>
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
                    </div>
                  </div>

                  {/* Financial Details & Signatures Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <BanknotesIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-purple-600" />
                        Step 3 - Financial Details & Signatures
                      </h3>
                      <Link
                        to={`/admin/financial/${oid}/invoice/generate/step-3`}
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Labour Amount:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatCurrency(invoiceData.invoiceLabourAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Material Amount:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatCurrency(invoiceData.invoiceMaterialAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Other Costs:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatCurrency(
                              invoiceData.invoiceOtherCostsAmount,
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Sub-Total:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 font-semibold">
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
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Tax:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatCurrency(invoiceData.invoiceTaxAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Total:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 font-bold text-green-600">
                            {formatCurrency(invoiceData.invoiceTotalAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Deposit:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatCurrency(invoiceData.invoiceDepositAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Amount Due:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 font-bold text-red-600">
                            {formatCurrency(invoiceData.invoiceAmountDue)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Quote Valid For:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.invoiceQuoteDays} days
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Date of Quote Approval:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.invoiceQuoteDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Customer Approval:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.invoiceCustomersApproval}
                          </p>
                        </div>
                        {invoiceData.line01Notes && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Line 01 Notes:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {invoiceData.line01Notes}
                            </p>
                          </div>
                        )}
                        {invoiceData.line02Notes && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Line 02 Notes:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {invoiceData.line02Notes}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Date Client Paid:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.dateClientPaidInvoice}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Payment Methods:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {getPaymentMethodLabels(invoiceData.paymentMethods)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Client Signature:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.clientSignature}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Sign Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.associateSignDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate Signature:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {invoiceData.associateSignature}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 3
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFinancialGenerateInvoiceStep4Page;
