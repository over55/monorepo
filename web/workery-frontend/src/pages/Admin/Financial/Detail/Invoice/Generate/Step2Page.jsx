// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  ChartBarIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PlusIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  CalculatorIcon,
  TrashIcon,
  PlusCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialGenerateInvoiceStep2Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form state - Line items
  const [lineItems, setLineItems] = useState([
    {
      quantity: 0,
      description: "",
      unitPrice: 0,
      amount: 0,
    },
  ]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing line items
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
            // No data from step 1, redirect back
            navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
            return;
          }

          // Initialize line items from existing data or order
          const initialLineItems = [];
          let lastNonEmptyIndex = 0;

          for (let i = 1; i <= 15; i++) {
            const lineNum = String(i).padStart(2, "0");
            const lineItem = {
              quantity:
                existingData[`line${lineNum}Quantity`] ||
                orderData[`line${lineNum}Quantity`] ||
                0,
              description:
                existingData[`line${lineNum}Description`] ||
                orderData[`line${lineNum}Description`] ||
                "",
              unitPrice:
                existingData[`line${lineNum}UnitPrice`] ||
                orderData[`line${lineNum}UnitPrice`] ||
                0,
              amount:
                existingData[`line${lineNum}Amount`] ||
                orderData[`line${lineNum}Amount`] ||
                0,
            };

            initialLineItems.push(lineItem);

            // Track the last non-empty line
            if (
              lineItem.quantity > 0 ||
              lineItem.description ||
              lineItem.unitPrice > 0
            ) {
              lastNonEmptyIndex = i;
            }
          }

          // Set only the active line items (at least 1)
          const activeCount = Math.max(1, lastNonEmptyIndex);
          setLineItems(initialLineItems.slice(0, activeCount));
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

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-calculate amount if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice =
        field === "unitPrice"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].amount = quantity * unitPrice;
    }

    setLineItems(updatedItems);

    // Clear field-specific error when user starts typing
    const lineNum = String(index + 1).padStart(2, "0");
    const fieldMap = {
      quantity: `line${lineNum}Quantity`,
      description: `line${lineNum}Description`,
      unitPrice: `line${lineNum}UnitPrice`,
    };

    if (errors[fieldMap[field]]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[fieldMap[field]];
      setErrors(updatedErrors);
    }
  };

  const handleAddLineItem = () => {
    // Validate existing line items before adding new one
    const newErrors = {};
    let hasErrors = false;

    lineItems.forEach((item, index) => {
      const lineNum = String(index + 1).padStart(2, "0");

      if (!item.quantity || item.quantity === 0) {
        newErrors[`line${lineNum}Quantity`] =
          `Line ${lineNum} quantity is required`;
        hasErrors = true;
      }
      if (!item.description || item.description.trim() === "") {
        newErrors[`line${lineNum}Description`] =
          `Line ${lineNum} description is required`;
        hasErrors = true;
      }
      if (!item.unitPrice || item.unitPrice === 0) {
        newErrors[`line${lineNum}UnitPrice`] =
          `Line ${lineNum} unit price is required`;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Add new line item if validation passes
    if (lineItems.length < 15) {
      setLineItems([
        ...lineItems,
        {
          quantity: 0,
          description: "",
          unitPrice: 0,
          amount: 0,
        },
      ]);
      setErrors({}); // Clear errors when successfully adding
    }
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index);
      setLineItems(updatedItems);

      // Clear any errors for the removed line
      const lineNum = String(index + 1).padStart(2, "0");
      const updatedErrors = { ...errors };
      delete updatedErrors[`line${lineNum}Quantity`];
      delete updatedErrors[`line${lineNum}Description`];
      delete updatedErrors[`line${lineNum}UnitPrice`];
      setErrors(updatedErrors);
    }
  };

  const handleNext = () => {
    // Validate all line items
    const newErrors = {};
    let hasErrors = false;
    let firstErrorIndex = -1;

    lineItems.forEach((item, index) => {
      const lineNum = String(index + 1).padStart(2, "0");

      // All added line items must have complete data
      if (!item.quantity || item.quantity === 0) {
        newErrors[`line${lineNum}Quantity`] =
          `Line ${lineNum} quantity is required`;
        hasErrors = true;
        if (firstErrorIndex === -1) firstErrorIndex = index;
      }
      if (!item.description || item.description.trim() === "") {
        newErrors[`line${lineNum}Description`] =
          `Line ${lineNum} description is required`;
        hasErrors = true;
        if (firstErrorIndex === -1) firstErrorIndex = index;
      }
      if (!item.unitPrice || item.unitPrice === 0) {
        newErrors[`line${lineNum}UnitPrice`] =
          `Line ${lineNum} unit price is required`;
        hasErrors = true;
        if (firstErrorIndex === -1) firstErrorIndex = index;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      // Scroll to the validation error summary at the top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Get existing data and update with line items
    const existingData = invoiceStorage.getInvoiceGenerationData() || {};

    // Save all 15 line items (fill empty spots with zeros)
    for (let i = 0; i < 15; i++) {
      const lineNum = String(i + 1).padStart(2, "0");
      const item = lineItems[i] || {
        quantity: 0,
        description: "",
        unitPrice: 0,
        amount: 0,
      };

      existingData[`line${lineNum}Quantity`] = item.quantity;
      existingData[`line${lineNum}Description`] = item.description;
      existingData[`line${lineNum}UnitPrice`] = item.unitPrice;
      existingData[`line${lineNum}Amount`] = item.amount;
    }

    invoiceStorage.saveInvoiceGenerationData(existingData);

    // Navigate to step 3, preserving edit mode
    const nextUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-3?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-3`;
    navigate(nextUrl);
  };

  const handleBack = () => {
    const backUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-1?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-1`;
    navigate(backUrl);
  };

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    // Clear storage and navigate back
    invoiceStorage.clearInvoiceGenerationData();
    navigate(`/admin/financial/${oid}/invoice`);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to="/admin/financials"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <CreditCardIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Financials
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <DocumentTextIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <DocumentPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Generate Invoice
                </span>
              </div>
            </li>
          </ol>
        </nav>

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
                Step 2 of 4 - Line Items
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
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 2: Line Items
                    </p>
                    <p className="text-xs text-gray-500">Add service items</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">2 of 4</div>
              </div>
            </div>
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Header Info
                  </p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Line Items
                  </p>
                  <p className="text-xs text-gray-500">Add Items</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Footer Info
                  </p>
                  <p className="text-xs text-gray-400">Totals</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Confirm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages - Responsive */}
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Validation Error Summary */}
        {Object.keys(errors).length > 0 && !errors.general && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  Please complete all required fields
                </p>
                <p className="text-xs mt-1">
                  All line items must have quantity, unit price, and description
                  filled in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Dark Background */}
          <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-4 sm:py-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
              <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 flex-shrink-0" />
              Invoice Line Items
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Add line items to your invoice. All fields are required for each
              line item.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {order && (
              <form className="space-y-4 sm:space-y-6">
                {lineItems.map((item, index) => {
                  const lineNum = String(index + 1).padStart(2, "0");
                  const errorPrefix = `line${lineNum}`;

                  return (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg shadow-sm"
                    >
                      <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold mr-2">
                            {lineNum}
                          </span>
                          Line Item {lineNum}
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        </h3>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(index)}
                            className="inline-flex items-center p-2 text-red-300 hover:text-red-100 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Remove this line item"
                          >
                            <TrashIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                          </button>
                        )}
                      </div>

                      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <HashtagIcon className="inline w-4 h-4 mr-1" />
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className={`block w-full rounded-md shadow-sm border px-4 py-2 sm:py-3 text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors ${
                                errors[`${errorPrefix}Quantity`]
                                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                              }`}
                            />
                            {errors[`${errorPrefix}Quantity`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`${errorPrefix}Quantity`]}
                              </p>
                            )}
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <CurrencyDollarIcon className="inline w-4 h-4 mr-1" />
                              Unit Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative rounded-md">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm sm:text-base">
                                  $
                                </span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "unitPrice",
                                    e.target.value,
                                  )
                                }
                                placeholder="0.00"
                                className={`block w-full pl-8 pr-4 rounded-md shadow-sm border py-2 sm:py-3 text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors ${
                                  errors[`${errorPrefix}UnitPrice`]
                                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                }`}
                              />
                            </div>
                            {errors[`${errorPrefix}UnitPrice`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`${errorPrefix}UnitPrice`]}
                              </p>
                            )}
                          </div>

                          {/* Total Amount */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <CalculatorIcon className="inline w-4 h-4 mr-1" />
                              Total Amount
                            </label>
                            <div className="relative rounded-md">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm sm:text-base">
                                  $
                                </span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount.toFixed(2)}
                                disabled
                                className="block w-full pl-8 pr-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 sm:py-3 text-sm sm:text-base cursor-not-allowed"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Auto-calculated
                            </p>
                          </div>
                        </div>

                        {/* Description - Full Width */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DocumentTextIcon className="inline w-4 h-4 mr-1" />
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            maxLength="638"
                            rows="3"
                            placeholder="Enter a detailed description of the line item..."
                            className={`block w-full rounded-md shadow-sm border px-4 py-2 sm:py-3 text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors resize-none ${
                              errors[`${errorPrefix}Description`]
                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            }`}
                          />
                          <div className="mt-1 flex justify-between">
                            <div>
                              {errors[`${errorPrefix}Description`] && (
                                <p className="text-xs text-red-600">
                                  {errors[`${errorPrefix}Description`]}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {item.description.length}/638 characters
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Running Total */}
                {lineItems.length > 0 && (
                  <div className="bg-blue-600 rounded-lg p-4 sm:p-6 border-2 border-blue-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CalculatorIcon className="w-5 h-5 mr-2 text-blue-100" />
                        <span className="text-lg font-semibold text-white">
                          Invoice Total
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-white">
                        $
                        {lineItems
                          .reduce((sum, item) => sum + (item.amount || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add Line Item Button */}
                {lineItems.length < 15 && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-700 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 group"
                    >
                      <PlusCircleIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Add Line Item
                      <span className="ml-2 text-xs text-gray-500">
                        ({lineItems.length}/15)
                      </span>
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Complete all fields in existing line items before adding
                      new ones
                    </p>
                  </div>
                )}

                {/* Maximum Line Items Notice */}
                {lineItems.length >= 15 && (
                  <div className="text-center py-4 px-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Maximum of 15 line items reached
                    </p>
                  </div>
                )}

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="order-2 sm:order-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 1
                  </button>

                  <div className="flex gap-3 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Save & Next
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </form>
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

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your invoice {isEditMode ? "editing" : "generation"} will be
                cancelled and your work will be lost. This cannot be undone. Do
                you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="order-2 sm:order-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="order-1 sm:order-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFinancialGenerateInvoiceStep2Page;
