// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step1Page.jsx
// @uix-page: FinancialInvoiceGenerateStep1
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  Modal,
  FormCard,
  StepWizard,
  Input,
  DatePicker,
  BackButton,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  IdentificationIcon,
  DocumentPlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialGenerateInvoiceStep1Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();
  const { getThemeClasses } = useUIXTheme();

  // Check if we're in edit mode
  const isEditMode = searchParams.get("mode") === "edit";

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    bgPage: getThemeClasses("bg-page"),
    borderLight: getThemeClasses("border-light"),
    alertWarningIcon: getThemeClasses("alert-warning-icon"),
  }), [getThemeClasses]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

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
            if (process.env.NODE_ENV === "development") {
              console.log("Edit mode: Populating storage from existing invoice");
            }

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
  }, [oid, isEditMode, orderManager, onUnauthorized]);

  const handleNext = useCallback(() => {
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
  }, [invoiceId, invoiceDate, associateName, associatePhone, associateTaxId, customerName, customerAddress, customerPhone, customerEmail, isEditMode, oid, navigate]);

  const handleCancel = useCallback(() => {
    const hasData = true; // Since we're working with existing order data
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/financial/${oid}/invoice`);
    }
  }, [oid, navigate]);

  const handleConfirmCancel = useCallback(() => {
    invoiceStorage.clearInvoiceGenerationData();
    setShowCancelWarning(false);
    navigate(`/admin/financial/${oid}/invoice`);
  }, [oid, navigate]);

  // Wizard steps configuration
  const wizardSteps = useMemo(() => [
    { id: 1, title: "Header Info", isCompleted: false },
    { id: 2, title: "Line Items", isCompleted: false },
    { id: 3, title: "Footer Info", isCompleted: false },
    { id: 4, title: "Review", isCompleted: false },
  ], []);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { to: "/admin/dashboard", label: "Dashboard", icon: ChartBarIcon },
    { to: "/admin/financials", label: "Financials", icon: CreditCardIcon },
    { to: `/admin/financial/${oid}/invoice`, label: `Order #${oid}`, icon: DocumentTextIcon },
    { label: isEditMode ? "Edit Invoice" : "Generate Invoice", icon: DocumentPlusIcon, isActive: true },
  ], [oid, isEditMode]);

  if (isFetching) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepWizard
            steps={wizardSteps}
            currentStep={1}
            title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
            subtitle="Step 1 of 4 - Header Information"
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
          currentStep={1}
          title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
          subtitle="Step 1 of 4 - Header Information"
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
            title="Invoice Header Information"
            icon={DocumentTextIcon}
            maxWidth="full"
          >
            {order && (
              <form>
                {/* Invoice Details Section */}
                <FormCard title="Invoice Details" icon={IdentificationIcon} className="mb-6" maxWidth="full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Invoice ID #"
                      value={invoiceId}
                      onChange={() => {}}
                      icon={IdentificationIcon}
                      disabled
                      required
                      helperText="To change this value, update the financials screen for this job."
                    />

                    <DatePicker
                      label="Invoice Date"
                      value={invoiceDate}
                      onChange={() => {}}
                      disabled
                      required
                      helperText="To change this value, update the financials screen for this job."
                    />
                  </div>
                </FormCard>

                {/* Associate Information Section */}
                <FormCard title="Associate Information" icon={UserIcon} className="mb-6" maxWidth="full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Associate Name"
                      value={associateName}
                      onChange={() => {}}
                      icon={UserIcon}
                      disabled
                      required
                      className="md:col-span-2"
                    />

                    <Input
                      label="Associate Phone"
                      type="tel"
                      value={associatePhone}
                      onChange={() => {}}
                      icon={PhoneIcon}
                      disabled
                      required
                    />

                    <Input
                      label="Associate Tax ID"
                      value={associateTaxId}
                      onChange={() => {}}
                      icon={IdentificationIcon}
                      disabled
                    />
                  </div>
                </FormCard>

                {/* Client Information Section */}
                <FormCard title="Client Information" icon={UserGroupIcon} className="mb-6" maxWidth="full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Client Name"
                      value={customerName}
                      onChange={() => {}}
                      icon={UserIcon}
                      disabled
                      required
                      className="md:col-span-2"
                    />

                    <Input
                      label="Client Address"
                      value={customerAddress}
                      onChange={() => {}}
                      icon={HomeIcon}
                      disabled
                      required
                      className="md:col-span-2"
                    />

                    <Input
                      label="Client Phone"
                      type="tel"
                      value={customerPhone}
                      onChange={() => {}}
                      icon={PhoneIcon}
                      disabled
                      required
                    />

                    <Input
                      label="Client Email"
                      type="email"
                      value={customerEmail}
                      onChange={() => {}}
                      icon={EnvelopeIcon}
                      disabled
                    />
                  </div>
                </FormCard>

                {/* Info Note */}
                <Alert type="info" className="mb-6">
                  {isEditMode
                    ? "You are editing an existing invoice. The header information is populated from the current invoice."
                    : "The invoice header information is pulled from the order details. If you need to modify any of these values, please update them in the financials screen for this job before generating the invoice."}
                </Alert>

                {/* Form Actions */}
                <div className={`flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${themeClasses.borderLight} gap-3`}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="order-2 sm:order-1"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="order-1 sm:order-2"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}
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
          Your invoice {isEditMode ? "editing" : "generation"} progress
          will be cancelled and any unsaved changes will be lost. This
          cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminFinancialGenerateInvoiceStep1PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialGenerateInvoiceStep1Page />
    </UIXThemeProvider>
  );
}

export default AdminFinancialGenerateInvoiceStep1PageWithProvider;
