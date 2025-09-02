// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step1Page.jsx

import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PlusIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  CalendarIcon,
  IdentificationIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";
import {
  default as DateInput,
  Date,
} from "../../../../../../components/UI/Date/Date";

function AdminFinancialGenerateInvoiceStep1Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Check if we're in edit mode
  const isEditMode = searchParams.get("mode") === "edit";

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form state
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [associateName, setAssociateName] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing invoice data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        // Get order details
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Check for existing invoice generation data
          let existingData = invoiceStorage.getInvoiceGenerationData();

          // If we're in edit mode and have an existing invoice, ALWAYS populate from it
          if (isEditMode && orderData.invoice) {
            console.log("Edit mode: Populating storage from existing invoice");

            const invoice = orderData.invoice;

            // Create complete data object from existing invoice
            existingData = {
              invoiceId: invoice.invoiceId || oid,
              invoiceDate: invoice.invoiceDate || orderData.invoiceDate || "",
              associateName:
                invoice.associateName || orderData.associateName || "",
              associatePhone:
                invoice.associatePhone || orderData.associatePhone || "",
              associateTaxId:
                invoice.invoiceAssociateTax || orderData.associateTaxId || "",
              customerName: invoice.clientName || orderData.customerName || "",
              customerAddress:
                invoice.clientAddress ||
                orderData.customerFullAddressWithoutPostalCode ||
                "",
              customerPhone:
                invoice.clientPhone || orderData.customerPhone || "",
              customerEmail:
                invoice.clientEmail || orderData.customerEmail || "",

              // Line items for Step 2
              line01Quantity: invoice.line01Qty || 0,
              line01Description: invoice.line01Desc || "",
              line01UnitPrice: invoice.line01Price || 0,
              line01Amount: invoice.line01Amount || 0,
              line02Quantity: invoice.line02Qty || 0,
              line02Description: invoice.line02Desc || "",
              line02UnitPrice: invoice.line02Price || 0,
              line02Amount: invoice.line02Amount || 0,
              line03Quantity: invoice.line03Qty || 0,
              line03Description: invoice.line03Desc || "",
              line03UnitPrice: invoice.line03Price || 0,
              line03Amount: invoice.line03Amount || 0,
              line04Quantity: invoice.line04Qty || 0,
              line04Description: invoice.line04Desc || "",
              line04UnitPrice: invoice.line04Price || 0,
              line04Amount: invoice.line04Amount || 0,
              line05Quantity: invoice.line05Qty || 0,
              line05Description: invoice.line05Desc || "",
              line05UnitPrice: invoice.line05Price || 0,
              line05Amount: invoice.line05Amount || 0,
              line06Quantity: invoice.line06Qty || 0,
              line06Description: invoice.line06Desc || "",
              line06UnitPrice: invoice.line06Price || 0,
              line06Amount: invoice.line06Amount || 0,
              line07Quantity: invoice.line07Qty || 0,
              line07Description: invoice.line07Desc || "",
              line07UnitPrice: invoice.line07Price || 0,
              line07Amount: invoice.line07Amount || 0,
              line08Quantity: invoice.line08Qty || 0,
              line08Description: invoice.line08Desc || "",
              line08UnitPrice: invoice.line08Price || 0,
              line08Amount: invoice.line08Amount || 0,
              line09Quantity: invoice.line09Qty || 0,
              line09Description: invoice.line09Desc || "",
              line09UnitPrice: invoice.line09Price || 0,
              line09Amount: invoice.line09Amount || 0,
              line10Quantity: invoice.line10Qty || 0,
              line10Description: invoice.line10Desc || "",
              line10UnitPrice: invoice.line10Price || 0,
              line10Amount: invoice.line10Amount || 0,
              line11Quantity: invoice.line11Qty || 0,
              line11Description: invoice.line11Desc || "",
              line11UnitPrice: invoice.line11Price || 0,
              line11Amount: invoice.line11Amount || 0,
              line12Quantity: invoice.line12Qty || 0,
              line12Description: invoice.line12Desc || "",
              line12UnitPrice: invoice.line12Price || 0,
              line12Amount: invoice.line12Amount || 0,
              line13Quantity: invoice.line13Qty || 0,
              line13Description: invoice.line13Desc || "",
              line13UnitPrice: invoice.line13Price || 0,
              line13Amount: invoice.line13Amount || 0,
              line14Quantity: invoice.line14Qty || 0,
              line14Description: invoice.line14Desc || "",
              line14UnitPrice: invoice.line14Price || 0,
              line14Amount: invoice.line14Amount || 0,
              line15Quantity: invoice.line15Qty || 0,
              line15Description: invoice.line15Desc || "",
              line15UnitPrice: invoice.line15Price || 0,
              line15Amount: invoice.line15Amount || 0,

              // Financial data for Step 3
              invoiceLabourAmount:
                invoice.totalLabour || orderData.invoiceLabourAmount || 0,
              invoiceMaterialAmount:
                invoice.totalMaterials || orderData.invoiceMaterialAmount || 0,
              invoiceOtherCostsAmount:
                invoice.otherCosts || orderData.invoiceOtherCostsAmount || 0,
              invoiceTaxAmount: invoice.tax || orderData.invoiceTaxAmount || 0,
              invoiceTotalAmount:
                invoice.total || orderData.invoiceTotalAmount || 0,
              invoiceDepositAmount:
                invoice.deposit || orderData.invoiceDepositAmount || 0,
              invoiceAmountDue:
                invoice.amountDue || orderData.invoiceAmountDue || 0,
              invoiceQuoteDays: invoice.invoiceQuoteDays || 30,
              invoiceQuoteDate:
                invoice.invoiceQuoteDate || orderData.completionDate || "",
              invoiceCustomersApproval:
                invoice.invoiceCustomersApproval || "Signature",
              line01Notes: invoice.line01Notes || "",
              line02Notes: invoice.line02Notes || "",
              dateClientPaidInvoice:
                invoice.dateClientPaidInvoice || orderData.completionDate || "",
              paymentMethods:
                invoice.paymentMethods || orderData.paymentMethods || [],
              clientSignature:
                invoice.clientSignature || orderData.customerName || "",
              associateSignDate:
                invoice.associateSignDate || orderData.completionDate || "",
              associateSignature:
                invoice.associateSignature || orderData.associateName || "",
            };

            // Save to storage - OVERRIDE whatever was there before
            invoiceStorage.saveInvoiceGenerationData(existingData);
          } else if (
            !isEditMode &&
            (!existingData || existingData.invoiceId !== oid)
          ) {
            // Not in edit mode and no existing data for this order
            // This is a new invoice creation - clear any old data
            invoiceStorage.clearInvoiceGenerationData();
            existingData = null;
          }

          // Initialize form with data
          if (existingData && existingData.invoiceId === oid) {
            // Use existing wizard data (either from edit mode or continuing wizard)
            setInvoiceId(existingData.invoiceId || oid);
            setInvoiceDate(
              existingData.invoiceDate || orderData.invoiceDate || "",
            );
            setAssociateName(
              existingData.associateName || orderData.associateName || "",
            );
            setAssociatePhone(
              existingData.associatePhone || orderData.associatePhone || "",
            );
            setAssociateTaxId(
              existingData.associateTaxId || orderData.associateTaxId || "",
            );
            setCustomerName(
              existingData.customerName || orderData.customerName || "",
            );
            setCustomerAddress(
              existingData.customerAddress ||
                orderData.customerFullAddressWithoutPostalCode ||
                "",
            );
            setCustomerPhone(
              existingData.customerPhone || orderData.customerPhone || "",
            );
            setCustomerEmail(
              existingData.customerEmail || orderData.customerEmail || "",
            );
          } else {
            // Initialize with order data (new invoice)
            setInvoiceId(oid);
            setInvoiceDate(orderData.invoiceDate || "");
            setAssociateName(orderData.associateName || "");
            setAssociatePhone(orderData.associatePhone || "");
            setAssociateTaxId(orderData.associateTaxId || "");
            setCustomerName(orderData.customerName || "");
            setCustomerAddress(
              orderData.customerFullAddressWithoutPostalCode || "",
            );
            setCustomerPhone(orderData.customerPhone || "");
            setCustomerEmail(orderData.customerEmail || "");
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors({
            general: error.message || "Failed to fetch order details",
          });
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
  }, [oid, isEditMode]);

  const handleNext = () => {
    // Save data to storage
    const invoiceData = {
      invoiceId,
      invoiceDate,
      associateName,
      associatePhone,
      associateTaxId,
      customerName,
      customerAddress,
      customerPhone,
      customerEmail,
    };

    invoiceStorage.saveInvoiceGenerationData(invoiceData);

    // Navigate to step 2, preserving edit mode if applicable
    const nextUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-2?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-2`;
    navigate(nextUrl);
  };

  const handleCancel = () => {
    const hasData = true; // Since we're working with existing order data
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/financial/${oid}/invoice`);
    }
  };

  const handleConfirmCancel = () => {
    invoiceStorage.clearInvoiceGenerationData();
    setShowCancelWarning(false);
    navigate(`/admin/financial/${oid}/invoice`);
  };

  // Section Component with Dark Header
  const DetailSection = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm sm:text-base text-gray-600">
              Loading order details...
            </span>
          </div>
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
                  {isEditMode ? "Edit Invoice" : "Generate Invoice"}
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
                Step 1 of 4 - Header Information
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
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 1: Header Info
                    </p>
                    <p className="text-xs text-gray-500">
                      Invoice basic details
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">1 of 4</div>
              </div>
            </div>
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Header Info
                  </p>
                  <p className="text-xs text-gray-500">Basic Details</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Line Items
                  </p>
                  <p className="text-xs text-gray-400">Services</p>
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

        {/* Error Message - Responsive */}
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

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Dark Background */}
          <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-4 sm:py-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
              <DocumentTextIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 flex-shrink-0" />
              Invoice Header Information
            </h2>
          </div>

          {order && (
            <form className="p-4 sm:p-6">
              {/* Invoice Details Section */}
              <DetailSection title="Invoice Details" icon={IdentificationIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="invoiceId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Invoice ID # <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="invoiceId"
                        name="invoiceId"
                        value={invoiceId}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      To change this value, update the financials screen for
                      this job.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="invoiceDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <Date
                        type="date"
                        id="invoiceDate"
                        name="invoiceDate"
                        value={invoiceDate}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      To change this value, update the financials screen for
                      this job.
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Associate Information Section */}
              <DetailSection title="Associate Information" icon={UserIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="associateName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Associate Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="associateName"
                        name="associateName"
                        value={associateName}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="associatePhone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Associate Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="associatePhone"
                        name="associatePhone"
                        value={associatePhone}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="associateTaxId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Associate Tax ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="associateTaxId"
                        name="associateTaxId"
                        value={associateTaxId}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Client Information Section */}
              <DetailSection title="Client Information" icon={UserGroupIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="customerName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={customerName}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="customerAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Client Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HomeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="customerAddress"
                        name="customerAddress"
                        value={customerAddress}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Client Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={customerPhone}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Client Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={customerEmail}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Info Note */}
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                  <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    {isEditMode
                      ? "You are editing an existing invoice. The header information is populated from the current invoice."
                      : "The invoice header information is pulled from the order details. If you need to modify any of these values, please update them in the financials screen for this job before generating the invoice."}
                  </span>
                </p>
              </div>

              {/* Form Actions - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors inline-flex items-center justify-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          )}
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
                Your invoice {isEditMode ? "editing" : "generation"} progress
                will be cancelled and any unsaved changes will be lost. This
                cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 order-1 sm:order-2 transition-colors"
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

export default AdminFinancialGenerateInvoiceStep1Page;
