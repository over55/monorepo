// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step3Page.jsx
// @uix-page: FinancialInvoiceGenerateStep3
// UIX Fully Upgraded - All components use UIX primitives with theme classes

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  XMarkIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
  ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS,
} from "../../../../../../constants/FieldOptions";
import {
  Card,
  Alert,
  Spinner,
  Modal,
  Button,
  FormCard,
  StepWizard,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  DatePicker,
  BackButton,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminFinancialGenerateInvoiceStep3Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const { getThemeClasses } = useUIXTheme();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    bgPage: getThemeClasses("bg-page"),
    borderLight: getThemeClasses("border-light"),
    alertWarningIcon: getThemeClasses("alert-warning-icon"),
    // Info box styling
    bgInfo: getThemeClasses("bg-info") || "bg-blue-50",
    borderInfo: getThemeClasses("border-info") || "border-blue-200",
    textInfo: getThemeClasses("text-info") || "text-blue-800",
    // Primary emphasis (for Amount Due)
    bgPrimaryLight: getThemeClasses("bg-primary-light") || "bg-blue-50",
    borderPrimaryLight: getThemeClasses("border-primary-light") || "border-blue-200",
    textPrimaryStrong: getThemeClasses("text-primary-strong") || "text-blue-900",
  }), [getThemeClasses]);

  // Wizard steps configuration
  const wizardSteps = useMemo(() => [
    { id: 1, title: "Header Info", isCompleted: true },
    { id: 2, title: "Line Items", isCompleted: true },
    { id: 3, title: "Footer Info", isCompleted: false },
    { id: 4, title: "Review", isCompleted: false },
  ], []);

  // Form state
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(0);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(0);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(0);
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(0);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(0);
  const [invoiceQuoteDays, setInvoiceQuoteDays] = useState(30);
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [invoiceQuoteDate, setInvoiceQuoteDate] = useState("");
  const [invoiceCustomersApproval, setInvoiceCustomersApproval] =
    useState("Signature");
  const [line01Notes, setLine01Notes] = useState("");
  const [line02Notes, setLine02Notes] = useState("");
  const [dateClientPaidInvoice, setDateClientPaidInvoice] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientSignature, setClientSignature] = useState("");
  const [associateSignDate, setAssociateSignDate] = useState("");
  const [associateSignature, setAssociateSignature] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing data
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

          // Initialize form with existing data or order data
          setInvoiceLabourAmount(
            existingData.invoiceLabourAmount ||
              orderData.invoiceLabourAmount ||
              0,
          );
          setInvoiceMaterialAmount(
            existingData.invoiceMaterialAmount ||
              orderData.invoiceMaterialAmount ||
              0,
          );
          setInvoiceOtherCostsAmount(
            existingData.invoiceOtherCostsAmount ||
              orderData.invoiceOtherCostsAmount ||
              0,
          );
          setInvoiceTaxAmount(
            existingData.invoiceTaxAmount || orderData.invoiceTaxAmount || 0,
          );
          setInvoiceTotalAmount(
            existingData.invoiceTotalAmount ||
              orderData.invoiceTotalAmount ||
              0,
          );
          setInvoiceDepositAmount(
            existingData.invoiceDepositAmount ||
              orderData.invoiceDepositAmount ||
              0,
          );
          setInvoiceAmountDue(
            existingData.invoiceAmountDue || orderData.invoiceAmountDue || 0,
          );
          setInvoiceQuoteDays(existingData.invoiceQuoteDays || 30);
          setAssociateTaxId(
            existingData.associateTaxId || orderData.associateTaxId || "",
          );
          setInvoiceQuoteDate(
            existingData.invoiceQuoteDate || orderData.completionDate || "",
          );
          setInvoiceCustomersApproval(
            existingData.invoiceCustomersApproval || "Signature",
          );
          setLine01Notes(
            existingData.line01Notes || orderData.line01Notes || "",
          );
          setLine02Notes(
            existingData.line02Notes || orderData.line02Notes || "",
          );
          setDateClientPaidInvoice(
            existingData.dateClientPaidInvoice ||
              orderData.completionDate ||
              "",
          );
          setPaymentMethods(
            existingData.paymentMethods || orderData.paymentMethods || [],
          );
          setClientSignature(
            existingData.clientSignature || orderData.customerName || "",
          );
          setAssociateSignDate(
            existingData.associateSignDate || orderData.completionDate || "",
          );
          setAssociateSignature(
            existingData.associateSignature || orderData.associateName || "",
          );
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

  const handlePaymentMethodToggle = (methodValue) => {
    setPaymentMethods((prev) => {
      if (prev.includes(methodValue)) {
        return prev.filter((m) => m !== methodValue);
      }
      return [...prev, methodValue];
    });
  };

  const handleNext = () => {
    // Validate required fields
    const newErrors = {};

    if (!invoiceQuoteDays) {
      newErrors.invoiceQuoteDays = "Quote validity days is required";
    }
    if (!invoiceQuoteDate) {
      newErrors.invoiceQuoteDate = "Quote approval date is required";
    }
    if (!invoiceCustomersApproval) {
      newErrors.invoiceCustomersApproval = "Customer approval type is required";
    }
    if (!dateClientPaidInvoice) {
      newErrors.dateClientPaidInvoice = "Client payment date is required";
    }
    if (!clientSignature) {
      newErrors.clientSignature = "Client signature is required";
    }
    if (!associateSignDate) {
      newErrors.associateSignDate = "Associate signature date is required";
    }
    if (!associateSignature) {
      newErrors.associateSignature = "Associate signature is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Get existing data and update with step 3 data
    const existingData = invoiceStorage.getInvoiceGenerationData() || {};

    // Add step 3 data
    const updatedData = {
      ...existingData,
      invoiceLabourAmount,
      invoiceMaterialAmount,
      invoiceOtherCostsAmount,
      invoiceTaxAmount,
      invoiceTotalAmount,
      invoiceDepositAmount,
      invoiceAmountDue,
      invoiceQuoteDays,
      associateTaxId,
      invoiceQuoteDate,
      invoiceCustomersApproval,
      line01Notes,
      line02Notes,
      dateClientPaidInvoice,
      paymentMethods,
      clientSignature,
      associateSignDate,
      associateSignature,
    };

    invoiceStorage.saveInvoiceGenerationData(updatedData);

    // Navigate to step 4
    const nextUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-4?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-4`;
    navigate(nextUrl);
  };

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    invoiceStorage.clearInvoiceGenerationData();
    setShowCancelWarning(false);
    navigate(`/admin/financial/${oid}/invoice`);
  };

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Financials",
      to: "/admin/financials",
      icon: CreditCardIcon,
    },
    {
      label: `Order #${oid}`,
      to: `/admin/financial/${oid}/invoice`,
      icon: DocumentTextIcon,
    },
    {
      label: "Generate Invoice",
      icon: DocumentPlusIcon,
      isActive: true,
    },
  ], [oid]);

  if (isFetching || !order) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepWizard
            steps={wizardSteps}
            currentStep={3}
            title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
            subtitle="Step 3 of 4 - Financial Details & Signatures"
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

  return (
    <div className={`min-h-screen ${themeClasses.bgPage}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <StepWizard
          steps={wizardSteps}
          currentStep={3}
          title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
          subtitle="Step 3 of 4 - Financial Details & Signatures"
          icon={DocumentPlusIcon}
          breadcrumbItems={breadcrumbItems}
        >
          {/* Error Message */}
          {errors.general && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {/* Main Content */}
          <FormCard
            title="Financial Details & Signatures"
            icon={CurrencyDollarIcon}
            maxWidth="full"
          >
            {/* Financial Summary Section */}
            <FormCard title="Financial Summary" icon={BanknotesIcon} className="mb-6" maxWidth="full">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Labour Amount"
                    type="number"
                    value={invoiceLabourAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />

                  <Input
                    label="Material Amount"
                    type="number"
                    value={invoiceMaterialAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />

                  <Input
                    label="Other Costs"
                    type="number"
                    value={invoiceOtherCostsAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />

                  <Input
                    label={order.invoiceIsCustomTaxAmount ? "Tax (Custom value)" : "Tax"}
                    type="number"
                    value={invoiceTaxAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />
                </div>

                <div className={`border-t ${themeClasses.borderLight} pt-4 grid grid-cols-1 md:grid-cols-3 gap-4`}>
                  <Input
                    label="Total"
                    type="number"
                    value={invoiceTotalAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />

                  <Input
                    label="Deposit"
                    type="number"
                    value={invoiceDepositAmount}
                    onChange={() => {}}
                    prefix="$"
                    disabled
                    step="0.01"
                  />

                  <div className={`${themeClasses.bgPrimaryLight} p-3 rounded-xl border ${themeClasses.borderPrimaryLight}`}>
                    <Input
                      label="Amount Due"
                      type="number"
                      value={invoiceAmountDue}
                      onChange={() => {}}
                      prefix="$"
                      disabled
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </FormCard>

            {/* Quote & Payment Details Section */}
            <FormCard
              title="Quote & Payment Details"
              icon={DocumentTextIcon}
              className="mb-6"
              maxWidth="full"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Quote Valid For"
                    value={invoiceQuoteDays}
                    onChange={(value) => setInvoiceQuoteDays(value)}
                    options={ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS}
                    error={errors.invoiceQuoteDays}
                    required
                  />

                  <Input
                    label="Associate Tax ID"
                    value={associateTaxId}
                    onChange={() => {}}
                    icon={DocumentTextIcon}
                    disabled
                  />

                  <DatePicker
                    label="Date of Quote Approval"
                    value={invoiceQuoteDate}
                    onChange={(value) => {
                      setInvoiceQuoteDate(value);
                      if (errors.invoiceQuoteDate) {
                        setErrors((prev) => ({
                          ...prev,
                          invoiceQuoteDate: undefined,
                        }));
                      }
                    }}
                    error={errors.invoiceQuoteDate}
                    required
                  />

                  <DatePicker
                    label="Date Client Paid Invoice"
                    value={dateClientPaidInvoice}
                    onChange={(value) => {
                      setDateClientPaidInvoice(value);
                      if (errors.dateClientPaidInvoice) {
                        setErrors((prev) => ({
                          ...prev,
                          dateClientPaidInvoice: undefined,
                        }));
                      }
                    }}
                    error={errors.dateClientPaidInvoice}
                    required
                  />
                </div>

                {/* Customer Approval */}
                <RadioGroup
                  label="Customer Approval"
                  value={invoiceCustomersApproval}
                  onChange={(value) => setInvoiceCustomersApproval(value)}
                  options={[
                    { value: "Signature", label: "Signature" },
                    { value: "Verbal", label: "Verbal" },
                    { value: "Written", label: "Written" },
                  ]}
                  error={errors.invoiceCustomersApproval}
                  required
                />

                {/* Payment Methods */}
                <div>
                  <label className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3`}>
                    Payment Method(s)
                  </label>
                  <div className="space-y-2">
                    {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((method) => (
                      <Checkbox
                        key={method.value}
                        label={method.label}
                        checked={paymentMethods.includes(method.value)}
                        onChange={() => handlePaymentMethodToggle(method.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <Textarea
                  label="Line 01 - Notes or Extras (Optional)"
                  value={line01Notes}
                  onChange={(value) => setLine01Notes(value)}
                  maxLength={638}
                  rows={3}
                  placeholder="Enter additional notes or extras..."
                  helperText={`${line01Notes.length}/638 characters`}
                />

                <Textarea
                  label="Line 02 - Notes or Extras (Optional)"
                  value={line02Notes}
                  onChange={(value) => setLine02Notes(value)}
                  maxLength={638}
                  rows={3}
                  placeholder="Enter additional notes or extras..."
                  helperText={`${line02Notes.length}/638 characters`}
                />
              </div>
            </FormCard>

            {/* Signatures Section */}
            <FormCard title="Signatures" icon={PencilSquareIcon} className="mb-6" maxWidth="full">
              <div className={`${themeClasses.bgInfo} border ${themeClasses.borderInfo} rounded-lg p-3 sm:p-4 mb-4`}>
                <p className={`text-xs sm:text-sm ${themeClasses.textInfo} flex items-center`}>
                  <ClipboardDocumentCheckIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                  <span>
                    Both client and associate signatures are required to
                    complete the invoice
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Client Signature Upon Completion"
                  value={clientSignature}
                  onChange={(value) => setClientSignature(value)}
                  placeholder="Enter client's full name"
                  icon={UserIcon}
                  error={errors.clientSignature}
                  required
                  helperText="If the client's partner or legal representative is signing, please write their full name"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    label="Associate Signature Date"
                    value={associateSignDate}
                    onChange={(value) => {
                      setAssociateSignDate(value);
                      if (errors.associateSignDate) {
                        setErrors((prev) => ({
                          ...prev,
                          associateSignDate: undefined,
                        }));
                      }
                    }}
                    error={errors.associateSignDate}
                    required
                  />

                  <Input
                    label="Associate Signature"
                    value={associateSignature}
                    onChange={(value) => setAssociateSignature(value)}
                    placeholder="Enter associate's full name"
                    icon={UserIcon}
                    error={errors.associateSignature}
                    required
                    helperText="If represented by a business partner, write their full name"
                  />
                </div>
              </div>
            </FormCard>

            {/* Form Actions */}
            <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${themeClasses.borderLight} gap-3`}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(isEditMode
                  ? `/admin/financial/${oid}/invoice/generate/step-2?mode=edit`
                  : `/admin/financial/${oid}/invoice/generate/step-2`
                )}
                className="order-2 sm:order-1"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-3 order-1 sm:order-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                >
                  Save & Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </FormCard>

          {/* Back Link */}
          <div className="mt-6">
            <BackButton
              to={`/admin/financial/${oid}/invoice`}
              label="Back to Invoice"
              size="sm"
            />
          </div>
        </StepWizard>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        icon={ExclamationCircleIcon}
        iconColor={themeClasses.alertWarningIcon}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowCancelWarning(false)}
              className="order-2 sm:order-1"
            >
              No, Keep Working
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              className="order-1 sm:order-2"
            >
              Yes, Cancel
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textMuted}`}>
          Your invoice generation will be cancelled and your work will be
          lost. This cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminFinancialGenerateInvoiceStep3PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialGenerateInvoiceStep3Page />
    </UIXThemeProvider>
  );
}

export default AdminFinancialGenerateInvoiceStep3PageWithProvider;
