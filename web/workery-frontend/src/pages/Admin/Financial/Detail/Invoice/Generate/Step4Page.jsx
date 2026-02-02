// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step4Page.jsx
// @uix-page: FinancialInvoiceGenerateStep4
// UIX Fully Upgraded - All components use UIX primitives with theme classes

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../../constants/FieldOptions";
import { formatPhoneNumber } from "../../../../../../utils/phoneFormat";
import {
  Spinner,
  Alert,
  Button,
  Card,
  FormCard,
  StepWizard,
  BackButton,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
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
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    bgPage: getThemeClasses("bg-page"),
    borderLight: getThemeClasses("border-light"),
    // Semantic colors for financial display
    textSuccess: getThemeClasses("text-success") || "text-green-600",
    textDanger: getThemeClasses("text-danger") || "text-red-600",
  }), [getThemeClasses]);

  // Wizard steps configuration
  const wizardSteps = useMemo(() => [
    { id: 1, title: "Header Info", isCompleted: true },
    { id: 2, title: "Line Items", isCompleted: true },
    { id: 3, title: "Footer Info", isCompleted: true },
    { id: 4, title: "Review", isCompleted: false },
  ], []);

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

      // Debug logging only in development (payload contains PII)
      if (process.env.NODE_ENV === "development") {
        console.log("Submitting invoice generation payload:", payload);
      }

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

  if (isFetching || !invoiceData) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepWizard
            steps={wizardSteps}
            currentStep={4}
            title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
            subtitle="Step 4 of 4 - Review & Submit"
            icon={DocumentPlusIcon}
            breadcrumbItems={breadcrumbItems}
          >
            <Card className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Spinner size="lg" />
                <p className={`mt-4 ${themeClasses.textMuted}`}>Loading order details...</p>
              </div>
            </Card>
          </StepWizard>
        </div>
      </div>
    );
  }

  const activeLineItems = getActiveLineItems();

  return (
    <div className={`min-h-screen ${themeClasses.bgPage}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <StepWizard
          steps={wizardSteps}
          currentStep={4}
          title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
          subtitle="Step 4 of 4 - Review & Submit"
          icon={DocumentPlusIcon}
          breadcrumbItems={breadcrumbItems}
        >
          {/* Error Messages */}
          {errors.general && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {Object.keys(errors).length > 0 &&
            Object.keys(errors).some((key) => key !== "general") && (
              <Alert type="error" className="mb-4">
                <p className="font-medium mb-2">Please correct the following errors:</p>
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
              </Alert>
            )}

          {/* Main Content */}
          <FormCard
            title="Review Invoice Details"
            subtitle="Please carefully review all invoice details before submitting"
            icon={CheckCircleIcon}
            maxWidth="full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className={`mt-4 ${themeClasses.textMuted}`}>Generating invoice...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Header Information Section */}
                <FormCard
                  title="Step 1 - Header Information"
                  icon={UserIcon}
                  maxWidth="full"
                  headerAction={
                    <Link
                      to={`/admin/financial/${oid}/invoice/generate/step-1`}
                      className={`inline-flex items-center text-sm sm:text-base ${themeClasses.linkPrimary} transition-colors`}
                    >
                      <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      Edit
                    </Link>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Invoice ID #:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {invoiceData.invoiceId}
                      </dd>
                    </div>
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Invoice Date:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {invoiceData.invoiceDate}
                      </dd>
                    </div>
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Associate Name:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {invoiceData.associateName}
                      </dd>
                    </div>
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Associate Phone:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {formatPhoneNumber(invoiceData.associatePhone)}
                      </dd>
                    </div>
                    {invoiceData.associateTaxId && (
                      <div>
                        <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                          Associate Tax ID:
                        </dt>
                        <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                          {invoiceData.associateTaxId}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Client Name:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {invoiceData.customerName}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Client Address:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {invoiceData.customerAddress}
                      </dd>
                    </div>
                    <div>
                      <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                        Client Phone:
                      </dt>
                      <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                        {formatPhoneNumber(invoiceData.customerPhone)}
                      </dd>
                    </div>
                    {invoiceData.customerEmail && (
                      <div>
                        <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                          Client Email:
                        </dt>
                        <dd className={`mt-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary} break-all`}>
                          {invoiceData.customerEmail}
                        </dd>
                      </div>
                    )}
                  </div>
                </FormCard>

                {/* Line Items Section */}
                <FormCard
                  title="Step 2 - Line Items"
                  icon={ClipboardDocumentListIcon}
                  maxWidth="full"
                  headerAction={
                    <Link
                      to={`/admin/financial/${oid}/invoice/generate/step-2`}
                      className={`inline-flex items-center text-sm sm:text-base ${themeClasses.linkPrimary} transition-colors`}
                    >
                      <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      Edit
                    </Link>
                  }
                >
                  {activeLineItems.length > 0 ? (
                    <div className="space-y-4">
                      {activeLineItems.map((item, index) => (
                        <div
                          key={item.number}
                          className={`${
                            index > 0 ? `pt-4 border-t ${themeClasses.borderLight}` : ""
                          }`}
                        >
                          <p className={`text-base font-semibold ${themeClasses.textSecondary} mb-2`}>
                            Line {item.number}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                                Quantity:
                              </dt>
                              <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                                {item.quantity}
                              </dd>
                            </div>
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                                Unit Price:
                              </dt>
                              <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                                {formatCurrency(item.unitPrice)}
                              </dd>
                            </div>
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                                Amount:
                              </dt>
                              <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary} font-semibold`}>
                                {formatCurrency(item.amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                                Description:
                              </dt>
                              <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                                {item.description}
                              </dd>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm sm:text-base ${themeClasses.textMuted}`}>
                      No line items added
                    </p>
                  )}
                </FormCard>

                {/* Financial Details & Signatures Section */}
                <FormCard
                  title="Step 3 - Financial Details & Signatures"
                  icon={BanknotesIcon}
                  maxWidth="full"
                  headerAction={
                    <Link
                      to={`/admin/financial/${oid}/invoice/generate/step-3`}
                      className={`inline-flex items-center text-sm sm:text-base ${themeClasses.linkPrimary} transition-colors`}
                    >
                      <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      Edit
                    </Link>
                  }
                >
                  <div className="space-y-6">
                    {/* Financial Summary */}
                    <div>
                      <h4 className={`text-base font-semibold ${themeClasses.textPrimary} mb-3`}>
                        Financial Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Labour Amount:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {formatCurrency(invoiceData.invoiceLabourAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Material Amount:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {formatCurrency(invoiceData.invoiceMaterialAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Other Costs:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {formatCurrency(
                              invoiceData.invoiceOtherCostsAmount,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Sub-Total:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary} font-semibold`}>
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
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Tax:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {formatCurrency(invoiceData.invoiceTaxAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Total:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg font-bold ${themeClasses.textSuccess}`}>
                            {formatCurrency(invoiceData.invoiceTotalAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Deposit:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {formatCurrency(invoiceData.invoiceDepositAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Amount Due:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg font-bold ${themeClasses.textDanger}`}>
                            {formatCurrency(invoiceData.invoiceAmountDue)}
                          </dd>
                        </div>
                      </div>
                    </div>

                    {/* Quote & Payment Details */}
                    <div className={`border-t ${themeClasses.borderLight} pt-4`}>
                      <h4 className={`text-base font-semibold ${themeClasses.textPrimary} mb-3`}>
                        Quote & Payment Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Quote Valid For:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.invoiceQuoteDays} days
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Date of Quote Approval:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.invoiceQuoteDate}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Customer Approval:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.invoiceCustomersApproval}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Date Client Paid:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.dateClientPaidInvoice}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Payment Methods:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {getPaymentMethodLabels(invoiceData.paymentMethods)}
                          </dd>
                        </div>
                        {invoiceData.line01Notes && (
                          <div className="sm:col-span-2">
                            <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                              Line 01 Notes:
                            </dt>
                            <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                              {invoiceData.line01Notes}
                            </dd>
                          </div>
                        )}
                        {invoiceData.line02Notes && (
                          <div className="sm:col-span-2">
                            <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                              Line 02 Notes:
                            </dt>
                            <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                              {invoiceData.line02Notes}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className={`border-t ${themeClasses.borderLight} pt-4`}>
                      <h4 className={`text-base font-semibold ${themeClasses.textPrimary} mb-3`}>
                        Signatures
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Client Signature:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.clientSignature}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Associate Signature:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.associateSignature}
                          </dd>
                        </div>
                        <div>
                          <dt className={`text-sm sm:text-base font-medium ${themeClasses.textMuted}`}>
                            Associate Sign Date:
                          </dt>
                          <dd className={`mt-1 text-base sm:text-lg ${themeClasses.textPrimary}`}>
                            {invoiceData.associateSignDate}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </FormCard>

                {/* Form Actions */}
                <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${themeClasses.borderLight} gap-3`}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="order-2 sm:order-1"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 3
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="order-1 sm:order-2"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    {isEditMode ? "Update Invoice" : "Submit Invoice"}
                  </Button>
                </div>
              </div>
            )}
          </FormCard>

          {/* Back Link */}
          <div className="mt-6">
            <BackButton
              to={`/admin/financial/${oid}/invoice`}
              size="sm"
            >
              Back to Invoice
            </BackButton>
          </div>
        </StepWizard>
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
