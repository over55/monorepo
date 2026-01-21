// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step2Page.jsx
// @uix-page: FinancialInvoiceGenerateStep2
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  Spinner,
  Breadcrumb,
  Alert,
  Button,
  Card,
  Modal,
  FormCard,
  StepWizard,
  Input,
  Textarea,
  BackButton,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  ChartBarIcon,
  XMarkIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  DocumentPlusIcon,
  HashtagIcon,
  CalculatorIcon,
  TrashIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialGenerateInvoiceStep2Page() {
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
    alertWarningIcon: getThemeClasses("alert-warning-icon"),
    // Total box (primary emphasis)
    bgPrimary: getThemeClasses("bg-primary"),
    borderPrimary: getThemeClasses("border-primary"),
    textOnPrimary: getThemeClasses("text-primary"),
    textOnPrimaryMuted: getThemeClasses("text-muted"),
    // Warning notice
    bgWarning: getThemeClasses("bg-warning") || "bg-yellow-50",
    borderWarning: getThemeClasses("border-warning") || "border-yellow-200",
    textWarning: getThemeClasses("text-warning") || "text-yellow-800",
  }), [getThemeClasses]);

  // Wizard steps configuration
  const wizardSteps = useMemo(() => [
    { id: 1, title: "Header Info", isCompleted: true },
    { id: 2, title: "Line Items", isCompleted: false },
    { id: 3, title: "Footer Info", isCompleted: false },
    { id: 4, title: "Review", isCompleted: false },
  ], []);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Financials", to: "/admin/financials", icon: CreditCardIcon },
    { label: `Order #${oid}`, to: `/admin/financial/${oid}/invoice`, icon: DocumentTextIcon },
    { label: isEditMode ? "Edit Invoice" : "Generate Invoice", icon: DocumentPlusIcon, isActive: true },
  ], [oid, isEditMode]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

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

          // Initialize line items from existing data or order invoice
          const initialLineItems = [];
          let lastNonEmptyIndex = 0;

          for (let i = 1; i <= 15; i++) {
            const lineNum = String(i).padStart(2, "0");

            // First check existingData (from storage), then fall back to invoice data
            let quantity = existingData[`line${lineNum}Quantity`];
            let description = existingData[`line${lineNum}Description`];
            let unitPrice = existingData[`line${lineNum}UnitPrice`];
            let amount = existingData[`line${lineNum}Amount`];

            // If not in existingData and we have an invoice, get from invoice (with correct field names)
            if (quantity === undefined && orderData.invoice) {
              quantity = orderData.invoice[`line${lineNum}Qty`] || 0;
            }
            if (description === undefined && orderData.invoice) {
              description = orderData.invoice[`line${lineNum}Desc`] || "";
            }
            if (unitPrice === undefined && orderData.invoice) {
              unitPrice = orderData.invoice[`line${lineNum}Price`] || 0;
            }
            if (amount === undefined && orderData.invoice) {
              amount = orderData.invoice[`line${lineNum}Amount`] || 0;
            }

            // Default to 0/"" if still undefined
            const lineItem = {
              quantity: quantity || 0,
              description: description || "",
              unitPrice: unitPrice || 0,
              amount: amount || 0,
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
  }, [oid, isEditMode]);

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];

    // Sanitize numeric inputs - prevent negative values
    let sanitizedValue = value;
    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value) || 0;
      sanitizedValue = numValue < 0 ? 0 : numValue;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: sanitizedValue,
    };

    // Auto-calculate amount if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity"
          ? parseFloat(sanitizedValue) || 0
          : parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice =
        field === "unitPrice"
          ? parseFloat(sanitizedValue) || 0
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
      <div className={`min-h-screen ${themeClasses.bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepWizard
            steps={wizardSteps}
            currentStep={2}
            title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
            subtitle="Step 2 of 4 - Line Items"
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
          currentStep={2}
          title={isEditMode ? "Edit Invoice" : "Generate Invoice"}
          subtitle="Step 2 of 4 - Line Items"
          icon={DocumentPlusIcon}
          breadcrumbItems={breadcrumbItems}
        >
          {/* Error Messages */}
          {errors.general && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {/* Validation Error Summary */}
          {Object.keys(errors).length > 0 && !errors.general && (
            <Alert type="warning" className="mb-4">
              <p className="font-medium">Please complete all required fields</p>
              <p className="text-sm mt-1">
                All line items must have quantity, unit price, and description filled in.
              </p>
            </Alert>
          )}

          {/* Main Content */}
          <FormCard
            title="Invoice Line Items"
            subtitle="Add line items to your invoice. All fields are required for each line item."
            icon={ClipboardDocumentListIcon}
            maxWidth="full"
          >
            {order && (
              <form className="space-y-4 sm:space-y-6">
                {lineItems.map((item, index) => {
                  const lineNum = String(index + 1).padStart(2, "0");
                  const errorPrefix = `line${lineNum}`;

                  return (
                    <FormCard
                      key={index}
                      title={`Line Item ${lineNum}`}
                      subtitle="Required"
                      maxWidth="full"
                      headerAction={
                        index > 0 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveLineItem(index)}
                            title="Remove this line item"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )
                      }
                    >
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                          {/* Quantity */}
                          <Input
                            label="Quantity"
                            type="number"
                            value={item.quantity}
                            onChange={(value) =>
                              handleLineItemChange(index, "quantity", value)
                            }
                            placeholder="0"
                            icon={HashtagIcon}
                            required
                            error={errors[`${errorPrefix}Quantity`]}
                            min="0"
                          />

                          {/* Unit Price */}
                          <Input
                            label="Unit Price"
                            type="number"
                            value={item.unitPrice}
                            onChange={(value) =>
                              handleLineItemChange(index, "unitPrice", value)
                            }
                            placeholder="0.00"
                            prefix="$"
                            required
                            error={errors[`${errorPrefix}UnitPrice`]}
                            step="0.01"
                            min="0"
                          />

                          {/* Total Amount */}
                          <Input
                            label="Total Amount"
                            type="number"
                            value={item.amount.toFixed(2)}
                            onChange={() => {}}
                            prefix="$"
                            disabled
                            helperText="Auto-calculated"
                          />
                        </div>

                        {/* Description - Full Width */}
                        <div className="mt-4">
                          <Textarea
                            label="Description"
                            value={item.description}
                            onChange={(value) =>
                              handleLineItemChange(index, "description", value)
                            }
                            maxLength={638}
                            rows={3}
                            placeholder="Enter a detailed description of the line item..."
                            required
                            error={errors[`${errorPrefix}Description`]}
                            helperText={`${item.description.length}/638 characters`}
                          />
                        </div>
                    </FormCard>
                  );
                })}

                {/* Running Total */}
                {lineItems.length > 0 && (
                  <div className={`${themeClasses.bgPrimary} rounded-lg p-4 sm:p-6 border-2 ${themeClasses.borderPrimary}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CalculatorIcon className={`w-5 h-5 mr-2 ${themeClasses.textOnPrimaryMuted}`} />
                        <span className={`text-lg font-semibold ${themeClasses.textOnPrimary}`}>
                          Invoice Total
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${themeClasses.textOnPrimary}`}>
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
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddLineItem}
                      className="border-dashed"
                    >
                      <PlusCircleIcon className="w-5 h-5 mr-2" />
                      Add Line Item
                      <span className="ml-2 text-xs opacity-70">
                        ({lineItems.length}/15)
                      </span>
                    </Button>
                    <p className={`mt-2 text-xs ${themeClasses.textMuted}`}>
                      Complete all fields in existing line items before adding
                      new ones
                    </p>
                  </div>
                )}

                {/* Maximum Line Items Notice */}
                {lineItems.length >= 15 && (
                  <div className={`text-center py-4 px-6 ${themeClasses.bgWarning} border ${themeClasses.borderWarning} rounded-lg`}>
                    <p className={`text-sm ${themeClasses.textWarning}`}>
                      Maximum of 15 line items reached
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${themeClasses.borderLight}`}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    className="order-2 sm:order-1"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 1
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
          Your invoice {isEditMode ? "editing" : "generation"} will be
          cancelled and your work will be lost. This cannot be undone. Do
          you want to continue?
        </p>
      </Modal>
    </div>
  );
}

function AdminFinancialGenerateInvoiceStep2PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialGenerateInvoiceStep2Page />
    </UIXThemeProvider>
  );
}

export default AdminFinancialGenerateInvoiceStep2PageWithProvider;
