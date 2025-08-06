import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingUsd,
  faClipboardCheck,
  faClipboard,
  faArrowRight,
  faHome,
  faTags,
  faEnvelope,
  faTable,
  faAddressCard,
  faSquarePhone,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faTasks,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getTenantDetailAPI } from "../../../../../API/Tenant";
import { getServiceFeeDetailAPI } from "../../../../../API/ServiceFee";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import FormAlternateDateField from "../../../../Reusable/FormAlternateDateField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import FormInputField from "../../../../Reusable/FormInputField";
import FormSelectFieldForServiceFee from "../../../../Reusable/FormSelectFieldForServiceFee";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  taskItemDetailState,
  addTaskItemOrderCompletionState,
  currentUserState,
} from "../../../../../AppState";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../Constants/App";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../Constants/FieldOptions";
import FormMultiSelectField from "../../../../Reusable/FormMultiSelectField";
import FormCheckboxField from "../../../../Reusable/FormCheckboxField";

function AdminTaskItemOrderCompletionStep3() {
  ////
  //// URL Arguments.
  ////

  const { tid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [task] = useRecoilState(taskItemDetailState);
  const [addTaskItemOrderCompletion, setAddTaskItemOrderCompletion] =
    useRecoilState(addTaskItemOrderCompletionState);
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [isCustomTaxAmount, setIsCustomTaxAmount] = useState(
      addTaskItemOrderCompletion.invoiceIsCustomTaxAmount
  );
  const [taxRate, setTaxRate] = useState(0.0);
  const [hasInputtedFinancials, setHasInputtedFinancials] = useState(
    addTaskItemOrderCompletion.hasInputtedFinancials,
  );
  const [invoicePaidTo, setInvoicePaidTo] = useState(
    addTaskItemOrderCompletion.invoicePaidTo,
  );
  const [paymentStatus, setPaymentStatus] = useState(
    addTaskItemOrderCompletion.paymentStatus,
  );
  const [completionDate, setCompletionDate] = useState(
    addTaskItemOrderCompletion.completionDate,
  );
  const [invoiceDate, setInvoiceDate] = useState(
    addTaskItemOrderCompletion.invoiceDate,
  );
  const [invoiceIDs, setInvoiceIDs] = useState(
    addTaskItemOrderCompletion.invoiceIDs,
  );
  const [invoiceQuotedLabourAmount, setInvoiceQuotedLabourAmount] = useState(
    addTaskItemOrderCompletion.invoiceQuotedLabourAmount,
  );
  const [invoiceQuotedMaterialAmount, setInvoiceQuotedMaterialAmount] =
    useState(addTaskItemOrderCompletion.invoiceQuotedMaterialAmount);
  const [invoiceQuotedOtherCostsAmount, setInvoiceQuotedOtherCostsAmount] =
    useState(addTaskItemOrderCompletion.invoiceQuotedOtherCostsAmount);
  const [invoiceTotalQuoteAmount, setInvoiceTotalQuoteAmount] = useState(
    addTaskItemOrderCompletion.invoiceTotalQuoteAmount,
  );
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(
    addTaskItemOrderCompletion.invoiceLabourAmount,
  );
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(
    addTaskItemOrderCompletion.invoiceMaterialAmount,
  );
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(
    addTaskItemOrderCompletion.invoiceOtherCostsAmount,
  );
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(
    addTaskItemOrderCompletion.invoiceTaxAmount,
  );
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(
    addTaskItemOrderCompletion.invoiceTotalAmount,
  );
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(
    addTaskItemOrderCompletion.invoiceDepositAmount,
  );
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(
    addTaskItemOrderCompletion.invoiceAmountDue,
  );
  const [invoiceServiceFeeID, setInvoiceServiceFeeID] = useState(
    addTaskItemOrderCompletion.invoiceServiceFeeID !== undefined &&
      addTaskItemOrderCompletion.invoiceServiceFeeID !== null &&
      addTaskItemOrderCompletion.invoiceServiceFeeID !== ""
      ? addTaskItemOrderCompletion.invoiceServiceFeeID
      : task.associateServiceFeeID,
  );
  const [invoiceServiceFee, setInvoiceServiceFee] = useState(
    addTaskItemOrderCompletion.invoiceServiceFee,
  );
  const [invoiceServiceFeePercentage, setInvoiceServiceFeePercentage] = useState(
    addTaskItemOrderCompletion.invoiceServiceFeePercentage !== undefined &&
      addTaskItemOrderCompletion.invoiceServiceFeePercentage !== null &&
      addTaskItemOrderCompletion.invoiceServiceFeePercentage !== "" &&
      addTaskItemOrderCompletion.invoiceServiceFeePercentage !== 0
      ? addTaskItemOrderCompletion.invoiceServiceFeePercentage
      : task.associateServiceFeePercentage,
  );
  const [isInvoiceServiceFeeOther, setIsInvoiceServiceFeeOther] = useState(
    addTaskItemOrderCompletion.isInvoiceServiceFeeOther,
  );
  const [invoiceServiceFeeOther, setInvoiceServiceFeeOther] = useState(
    addTaskItemOrderCompletion.invoiceServiceFeeOther,
  );
  const [invoiceServiceFeeAmount, setInvoiceServiceFeeAmount] = useState(
    addTaskItemOrderCompletion.invoiceServiceFeeAmount,
  );
  const [invoiceServiceFeePaymentDate, setInvoiceServiceFeePaymentDate] =
    useState(addTaskItemOrderCompletion.invoiceServiceFeePaymentDate);
  const [
    invoiceActualServiceFeeAmountPaid,
    setInvoiceActualServiceFeeAmountPaid,
  ] = useState(addTaskItemOrderCompletion.invoiceActualServiceFeeAmountPaid);
  const [invoiceBalanceOwingAmount, setInvoiceBalanceOwingAmount] = useState(
    addTaskItemOrderCompletion.invoiceBalanceOwingAmount,
  );
  const [paymentMethods, setPaymentMethods] = useState(
    addTaskItemOrderCompletion.paymentMethods,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    //Note: 0=unselected, 1=Yes, 2=No
    if (
      hasInputtedFinancials === undefined ||
      hasInputtedFinancials === null ||
      hasInputtedFinancials === "" ||
      hasInputtedFinancials === 0
    ) {
      newErrors["hasInputtedFinancials"] = "missing value";
      hasErrors = true;
    }
    if (hasInputtedFinancials === 1) {
      if (
        invoicePaidTo === undefined ||
        invoicePaidTo === null ||
        invoicePaidTo === "" ||
        invoicePaidTo === 0
      ) {
        newErrors["invoicePaidTo"] = "missing value";
        hasErrors = true;
      }
      if (
        paymentStatus === undefined ||
        paymentStatus === null ||
        paymentStatus === "" ||
        paymentStatus === 0
      ) {
        newErrors["paymentStatus"] = "missing value";
        hasErrors = true;
      }
      if (paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID) {
        if (
          completionDate === undefined ||
          completionDate === null ||
          completionDate === ""
        ) {
          newErrors["completionDate"] = "missing value";
          hasErrors = true;
        }
      }
      if (
        invoiceDate === undefined ||
        invoiceDate === null ||
        invoiceDate === ""
      ) {
        newErrors["invoiceDate"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceIDs === undefined ||
        invoiceIDs === null ||
        invoiceIDs === ""
      ) {
        newErrors["invoiceIDs"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceQuotedLabourAmount === undefined ||
        invoiceQuotedLabourAmount === null ||
        invoiceQuotedLabourAmount === ""
      ) {
        newErrors["invoiceQuotedLabourAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceQuotedMaterialAmount === undefined ||
        invoiceQuotedMaterialAmount === null ||
        invoiceQuotedMaterialAmount === ""
      ) {
        newErrors["invoiceQuotedMaterialAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceQuotedOtherCostsAmount === undefined ||
        invoiceQuotedOtherCostsAmount === null ||
        invoiceQuotedOtherCostsAmount === ""
      ) {
        newErrors["invoiceQuotedOtherCostsAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceTotalQuoteAmount === undefined ||
        invoiceTotalQuoteAmount === null ||
        invoiceTotalQuoteAmount === ""
      ) {
        newErrors["invoiceTotalQuoteAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceLabourAmount === undefined ||
        invoiceLabourAmount === null ||
        invoiceLabourAmount === ""
      ) {
        newErrors["invoiceLabourAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceMaterialAmount === undefined ||
        invoiceMaterialAmount === null ||
        invoiceMaterialAmount === ""
      ) {
        newErrors["invoiceMaterialAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceOtherCostsAmount === undefined ||
        invoiceOtherCostsAmount === null ||
        invoiceOtherCostsAmount === ""
      ) {
        newErrors["invoiceOtherCostsAmount"] = "missing value";
        hasErrors = true;
      }
      // if (
      //   invoiceTaxAmount === undefined ||
      //   invoiceTaxAmount === null ||
      //   invoiceTaxAmount === ""
      // ) {
      //   newErrors["invoiceTaxAmount"] = "missing value";
      //   hasErrors = true;
      // }
      if (
        invoiceTotalAmount === undefined ||
        invoiceTotalAmount === null ||
        invoiceTotalAmount === ""
      ) {
        newErrors["invoiceTotalAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceDepositAmount === undefined ||
        invoiceDepositAmount === null ||
        invoiceDepositAmount === ""
      ) {
        newErrors["invoiceDepositAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceAmountDue === undefined ||
        invoiceAmountDue === null ||
        invoiceAmountDue === ""
      ) {
        newErrors["invoiceAmountDue"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceServiceFeeID === undefined ||
        invoiceServiceFeeID === null ||
        invoiceServiceFeeID === ""
      ) {
        newErrors["invoiceServiceFeeID"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceServiceFeeAmount === undefined ||
        invoiceServiceFeeAmount === null ||
        invoiceServiceFeeAmount === ""
      ) {
        newErrors["invoiceServiceFeeAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceServiceFeePaymentDate === undefined ||
        invoiceServiceFeePaymentDate === null ||
        invoiceServiceFeePaymentDate === ""
      ) {
        if (paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID) {
          newErrors["invoiceServiceFeePaymentDate"] = "missing value";
          hasErrors = true;
        }
      }
      if (
        invoiceActualServiceFeeAmountPaid === undefined ||
        invoiceActualServiceFeeAmountPaid === null ||
        invoiceActualServiceFeeAmountPaid === ""
      ) {
        newErrors["invoiceActualServiceFeeAmountPaid"] = "missing value";
        hasErrors = true;
      }
      if (
        invoiceBalanceOwingAmount === undefined ||
        invoiceBalanceOwingAmount === null ||
        invoiceBalanceOwingAmount === ""
      ) {
        newErrors["invoiceBalanceOwingAmount"] = "missing value";
        hasErrors = true;
      }
      if (
        paymentMethods === undefined ||
        paymentMethods === null ||
        paymentMethods === "" ||
        paymentMethods.length === 0
      ) {
        newErrors["paymentMethods"] = "missing value";
        hasErrors = true;
      }
    } // end Has Financials

    if (hasErrors) {
      console.log("onSubmitClick: Aboring because of error(s)");

      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      return;
    }

    setErrors({}); // Reset error.

    // Generate the data we will be saving.
    let modifiedAddTaskItemOrderCompletion = { ...addTaskItemOrderCompletion };
    modifiedAddTaskItemOrderCompletion.hasInputtedFinancials =
      hasInputtedFinancials;
    modifiedAddTaskItemOrderCompletion.invoicePaidTo = invoicePaidTo;
    modifiedAddTaskItemOrderCompletion.paymentStatus = paymentStatus;
    modifiedAddTaskItemOrderCompletion.completionDate = completionDate;
    modifiedAddTaskItemOrderCompletion.invoiceDate = invoiceDate;
    try {
      modifiedAddTaskItemOrderCompletion.invoiceIDs = invoiceIDs.toString();
    } catch (e) {
      console.log("warning: e:", e);
      modifiedAddTaskItemOrderCompletion.invoiceIDs = "";
    }
    modifiedAddTaskItemOrderCompletion.invoiceQuotedLabourAmount = parseFloat(
      invoiceQuotedLabourAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceQuotedMaterialAmount = parseFloat(
      invoiceQuotedMaterialAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceQuotedOtherCostsAmount =
      parseFloat(invoiceQuotedOtherCostsAmount);
    modifiedAddTaskItemOrderCompletion.invoiceTotalQuoteAmount = parseFloat(
      invoiceTotalQuoteAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceLabourAmount =
      parseFloat(invoiceLabourAmount);
    modifiedAddTaskItemOrderCompletion.invoiceMaterialAmount = parseFloat(
      invoiceMaterialAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceOtherCostsAmount = parseFloat(
      invoiceOtherCostsAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceTaxAmount =
      parseFloat(invoiceTaxAmount);
    modifiedAddTaskItemOrderCompletion.invoiceIsCustomTaxAmount = isCustomTaxAmount;
    modifiedAddTaskItemOrderCompletion.invoiceTotalAmount =
      parseFloat(invoiceTotalAmount);
    modifiedAddTaskItemOrderCompletion.invoiceDepositAmount =
      parseFloat(invoiceDepositAmount);
    modifiedAddTaskItemOrderCompletion.invoiceAmountDue = invoiceAmountDue;
    modifiedAddTaskItemOrderCompletion.invoiceServiceFeeID =
      invoiceServiceFeeID;
    modifiedAddTaskItemOrderCompletion.invoiceServiceFeePercentage =
      invoiceServiceFeePercentage;
    modifiedAddTaskItemOrderCompletion.invoiceServiceFee = invoiceServiceFee;
    modifiedAddTaskItemOrderCompletion.invoiceServiceFeeOther =
      invoiceServiceFeeOther;
    modifiedAddTaskItemOrderCompletion.isInvoiceServiceFeeOther =
      isInvoiceServiceFeeOther;
    modifiedAddTaskItemOrderCompletion.invoiceServiceFeeAmount = parseFloat(
      invoiceServiceFeeAmount,
    );
    modifiedAddTaskItemOrderCompletion.invoiceServiceFeePaymentDate =
      invoiceServiceFeePaymentDate;
    modifiedAddTaskItemOrderCompletion.invoiceActualServiceFeeAmountPaid =
      parseFloat(invoiceActualServiceFeeAmountPaid);
    modifiedAddTaskItemOrderCompletion.invoiceBalanceOwingAmount = parseFloat(
      invoiceBalanceOwingAmount,
    );
    modifiedAddTaskItemOrderCompletion.paymentMethods = paymentMethods;

    // Autopopulate a comment which is really helpful.
    if (modifiedAddTaskItemOrderCompletion.hasInputtedFinancials) {
      if (
        modifiedAddTaskItemOrderCompletion.comment === undefined ||
        modifiedAddTaskItemOrderCompletion.comment === null ||
        modifiedAddTaskItemOrderCompletion.comment === ""
      ) {
        try {
          // Create a formatter using the "sv-SE" locale
          const dateFormatter = Intl.DateTimeFormat("sv-SE"); // Note: The new `Intl` Object is now supported on all browsers.

          // Use the formatter to format the date
          const dateFormatted = dateFormatter.format(
            modifiedAddTaskItemOrderCompletion.invoiceServiceFeePaymentDate,
          ); // "2024-01-01"

          if (
            modifiedAddTaskItemOrderCompletion.paymentStatus ===
            ORDER_STATUS_COMPLETED_AND_PAID
          ) {
            modifiedAddTaskItemOrderCompletion.comment =
              "Service fees for Workery Order ID " +
              task.orderWjid +
              " paid on " +
              dateFormatted +
              ".";
          }
          if (
            modifiedAddTaskItemOrderCompletion.paymentStatus ===
            ORDER_STATUS_COMPLETED_BUT_UNPAID
          ) {
            modifiedAddTaskItemOrderCompletion.comment =
              "Service fees due for Workery Order ID " +
              task.orderWjid +
              " completed on " +
              dateFormatted +
              ".";
          }
        } catch (e) {
          if (
            modifiedAddTaskItemOrderCompletion.paymentStatus ===
            ORDER_STATUS_COMPLETED_AND_PAID
          ) {
            modifiedAddTaskItemOrderCompletion.comment =
              "Service fees for Workery Order ID " +
              task.orderWjid +
              " paid on " +
              modifiedAddTaskItemOrderCompletion.invoiceServiceFeePaymentDate +
              ".";
          }
          if (
            modifiedAddTaskItemOrderCompletion.paymentStatus ===
            ORDER_STATUS_COMPLETED_BUT_UNPAID
          ) {
            modifiedAddTaskItemOrderCompletion.comment =
              "Service fees due for Workery Order ID " +
              task.orderWjid +
              " completed on " +
              modifiedAddTaskItemOrderCompletion.invoiceServiceFeePaymentDate +
              ".";
          }
        } finally {
          // Do nothing...
        }
      }
    }

    // Save to persistent storage.
    setAddTaskItemOrderCompletion(modifiedAddTaskItemOrderCompletion);

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", modifiedAddTaskItemOrderCompletion);

    // Redirect to the next page.
    if (hasInputtedFinancials === 1) {
      setForceURL("/admin/task/" + tid + "/order-completion/step-4");
    } else {
      setForceURL("/admin/task/" + tid + "/order-completion/step-5");
    }
  };

  /**
   *  Source: https://stackoverflow.com/a/18358056
   */
  const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
  };

  // Utility function calculates our read-only form fields.
  const performCalculationWithPercentageCustom = (percentageCustom) => {
    console.log("calculating...");
    console.log("percentageCustom:", percentageCustom);

    // Compute the total quoted amount.
  };

  // Utility function calculates our read-only form fields.
  const performCalculation = () => {
    console.log("performCalculation: calculating...");

    //
    // Quoted
    //

    let modifiedInvoiceQuotedLabourAmount = parseFloat(
      invoiceQuotedLabourAmount,
    );
    if (
      isNaN(modifiedInvoiceQuotedLabourAmount) ||
      invoiceQuotedLabourAmount === ""
    ) {
      modifiedInvoiceQuotedLabourAmount = parseFloat(0);
    }
    let modifiedInvoiceQuotedMaterialAmount = parseFloat(
      invoiceQuotedMaterialAmount,
    );
    if (
      isNaN(modifiedInvoiceQuotedMaterialAmount) ||
      invoiceQuotedMaterialAmount === ""
    ) {
      modifiedInvoiceQuotedMaterialAmount = parseFloat(0);
    }
    let modifiedInvoiceQuotedOtherCostsAmount = parseFloat(
      invoiceQuotedOtherCostsAmount,
    );
    if (
      isNaN(modifiedInvoiceQuotedOtherCostsAmount) ||
      invoiceQuotedOtherCostsAmount === ""
    ) {
      modifiedInvoiceQuotedOtherCostsAmount = parseFloat(0);
    }

    // Compute the total quoted amount.
    const invoiceTotalQuoteAmount = parseFloat(
      modifiedInvoiceQuotedLabourAmount +
        modifiedInvoiceQuotedMaterialAmount +
        modifiedInvoiceQuotedOtherCostsAmount,
    );
    console.log("");
    console.log(
      "   invoiceQuotedLabourAmount=",
      modifiedInvoiceQuotedLabourAmount,
    );
    console.log(
      "   invoiceQuotedMaterialAmount=",
      modifiedInvoiceQuotedMaterialAmount,
    );
    console.log(
      "   invoiceQuotedOtherCostsAmount=",
      modifiedInvoiceQuotedOtherCostsAmount,
    );
    console.log("   ----------------------------------");
    console.log("   invoiceTotalQuoteAmount=", invoiceTotalQuoteAmount);
    console.log("");

    //
    // Actual
    //

    let modifiedInvoiceLabourAmount = parseFloat(invoiceLabourAmount);
    if (isNaN(modifiedInvoiceLabourAmount) || invoiceLabourAmount === "") {
      modifiedInvoiceLabourAmount = parseFloat(0);
    }
    let modifiedInvoiceMaterialAmount = parseFloat(invoiceMaterialAmount);
    if (isNaN(modifiedInvoiceMaterialAmount) || invoiceMaterialAmount === "") {
      modifiedInvoiceMaterialAmount = parseFloat(0);
    }
    let modifiedInvoiceTaxAmount = parseFloat(invoiceTaxAmount);
    if (isNaN(modifiedInvoiceTaxAmount) || invoiceTaxAmount === "") {
      modifiedInvoiceTaxAmount = parseFloat(0);
    }
    let modifiedInvoiceOtherCostsAmount = parseFloat(invoiceOtherCostsAmount);
    if (
      isNaN(modifiedInvoiceOtherCostsAmount) ||
      invoiceOtherCostsAmount === ""
    ) {
      modifiedInvoiceOtherCostsAmount = parseFloat(0);
    }

    // Compute tax (if no custom tax override occured)
    if (
      task.associateTaxId !== undefined &&
      task.associateTaxId !== null &&
      task.associateTaxId !== "" &&
      task.associateTaxId !== "NA"
    ) {
        if (isCustomTaxAmount === false) {
            modifiedInvoiceTaxAmount = parseFloat(
              (taxRate / 100.0) *
                (modifiedInvoiceLabourAmount +
                  modifiedInvoiceMaterialAmount +
                  modifiedInvoiceOtherCostsAmount),
            );
        }
    }

    // Compute the total amount.
    const invoiceTotalAmount = parseFloat(
      modifiedInvoiceLabourAmount +
        modifiedInvoiceMaterialAmount +
        modifiedInvoiceTaxAmount +
        modifiedInvoiceOtherCostsAmount,
    );
    console.log("   invoiceLabourAmount=", modifiedInvoiceLabourAmount);
    console.log("   invoiceMaterialAmount=", modifiedInvoiceMaterialAmount);
    console.log("   invoiceTaxAmount=", modifiedInvoiceTaxAmount);
    console.log("   invoiceIsCustomTaxAmount=", isCustomTaxAmount);
    console.log("   invoiceOtherCostsAmount=", modifiedInvoiceOtherCostsAmount);
    console.log("   ----------------------------------");
    console.log("   invoiceTotalAmount=", invoiceTotalAmount);
    console.log("");

    //
    // invoiceServiceFeeAmount
    //

    // Compute the service fee based on the labour.
    const serviceFeePercent = roundToTwo(
      parseFloat(invoiceServiceFeePercentage),
    );
    let modifiedInvoiceServiceFeeAmount = parseFloat(
      modifiedInvoiceLabourAmount * (serviceFeePercent / parseFloat(100)),
    );
    if (isNaN(modifiedInvoiceServiceFeeAmount)) {
      modifiedInvoiceServiceFeeAmount = parseFloat(0);
    }
    modifiedInvoiceServiceFeeAmount = roundToTwo(
      modifiedInvoiceServiceFeeAmount,
    );

    console.log("   serviceFeePercent:", serviceFeePercent);
    console.log("   invoiceLabourAmount:", modifiedInvoiceLabourAmount);
    console.log("   serviceFeePercent/100:", serviceFeePercent / 100);
    console.log("   ----------------------------------");
    console.log("   invoiceServiceFeeAmount:", modifiedInvoiceServiceFeeAmount);
    console.log("");

    //
    // invoiceBalanceOwingAmount
    //

    // Compute balance owing.
    let modifiedInvoiceActualServiceFeeAmountPaid = parseFloat(
      invoiceActualServiceFeeAmountPaid,
    );
    if (
      isNaN(modifiedInvoiceActualServiceFeeAmountPaid) ||
      invoiceActualServiceFeeAmountPaid === ""
    ) {
      modifiedInvoiceActualServiceFeeAmountPaid = parseFloat(0);
    }
    let invoiceBalanceOwingAmount = parseFloat(
      modifiedInvoiceServiceFeeAmount -
        modifiedInvoiceActualServiceFeeAmountPaid,
    );
    invoiceBalanceOwingAmount = roundToTwo(
      parseFloat(invoiceBalanceOwingAmount),
      2,
    );
    if (isNaN(invoiceBalanceOwingAmount)) {
      invoiceBalanceOwingAmount = parseFloat(0);
    }
    console.log("   invoiceServiceFeeAmount:", modifiedInvoiceServiceFeeAmount);
    console.log(
      "   actualServiceFeeAmountPaid:",
      modifiedInvoiceActualServiceFeeAmountPaid,
    );
    console.log("   ----------------------------------");
    console.log("   invoiceBalanceOwingAmount:", invoiceBalanceOwingAmount);
    console.log("");

    //
    // invoiceAmountDue
    //

    let modifiedInvoiceTotalAmount = parseFloat(invoiceTotalAmount);
    let modifiedInvoiceDepositAmount = parseFloat(invoiceDepositAmount);
    if (isNaN(modifiedInvoiceTotalAmount) || invoiceTotalAmount === 0) {
      modifiedInvoiceTotalAmount = parseFloat(0);
    }
    if (isNaN(modifiedInvoiceDepositAmount) || invoiceDepositAmount === 0) {
      modifiedInvoiceDepositAmount = parseFloat(0);
    }
    const invoiceAmountDue = parseFloat(
      modifiedInvoiceTotalAmount - modifiedInvoiceDepositAmount,
    );
    console.log("   invoiceTotalAmount:", modifiedInvoiceTotalAmount);
    console.log("   invoiceDepositAmount:", modifiedInvoiceDepositAmount);
    console.log("   ----------------------------------");
    console.log("   invoiceAmountDue:", invoiceAmountDue);
    console.log("");

    //
    // Update our state.
    //

    setInvoiceTotalQuoteAmount(roundToTwo(invoiceTotalQuoteAmount, 2));
    setInvoiceTaxAmount(roundToTwo(modifiedInvoiceTaxAmount, 2));
    setInvoiceTotalAmount(roundToTwo(invoiceTotalAmount, 2));
    setInvoiceBalanceOwingAmount(roundToTwo(invoiceBalanceOwingAmount, 2));
    setInvoiceServiceFeeAmount(roundToTwo(modifiedInvoiceServiceFeeAmount, 2));
    setInvoiceAmountDue(roundToTwo(invoiceAmountDue, 2));
  };

  ////
  //// API.
  ////

  // --- Tenant Detail --- //

  function onTenantDetailSuccess(response) {
    console.log("onTenantDetailSuccess: Starting...");
    console.log("onTenantDetailSuccess: tenant:", response);
    setTaxRate(parseFloat(response.taxRate));
    performCalculation();
  }

  function onTenantDetailError(apiErr) {
    console.log("onTenantDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTenantDetailDone() {
    console.log("onTenantDetailDone: Starting...");
    setFetching(false);
  }

  // --- Service Fee Detail --- //

  function onServiceFeeDetailSuccess(response) {
    console.log("onServiceFeeDetailSuccess: Starting...");
    setInvoiceServiceFee(response);
    if (response) {
      setInvoiceServiceFeePercentage(response.percentage);
      performCalculationWithPercentageCustom(response.percentage);
    }
  }

  function onServiceFeeDetailError(apiErr) {
    console.log("onServiceFeeDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onServiceFeeDetailDone() {
    console.log("onServiceFeeDetailDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      performCalculation();

      // If you loaded the page for the very first time.
      if (onPageLoaded === false) {
        window.scrollTo(0, 0); // Start the page at the top of the page.
        setOnPageLoaded(true);

        setFetching(true);
        getTenantDetailAPI(
          currentUser.tenantId,
          onTenantDetailSuccess,
          onTenantDetailError,
          onTenantDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [
    currentUser,
    onPageLoaded,
    tid,
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    isCustomTaxAmount,
    invoiceTaxAmount,
    invoiceDepositAmount,
    invoiceServiceFeePercentage,
    invoiceActualServiceFeeAmountPaid,
  ]);

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
    <>
      <div className="container">
        <section className="section">
          {/* Desktop Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-touch p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Task&nbsp;Detail
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-desktop p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Tasks
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {task && task.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faTasks} />
            &nbsp;Task
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 3 of 5</p>
            <progress class="progress is-success" value="60" max="100">
              60%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {task && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Task Detail - Order Completion
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {task && (
                  <div className="container">
                    <FormRadioField
                      label="Was there financials inputted?"
                      value={hasInputtedFinancials}
                      opt1Value={1}
                      opt1Label="Yes"
                      opt2Value={2}
                      opt2Label="No"
                      errorText={errors.hasInputtedFinancials}
                      wasValidated={false}
                      helpText="Selecting `yes` will require you to ask the financials and input it here"
                      onChange={(e) =>
                        setHasInputtedFinancials(parseInt(e.target.value))
                      }
                    />

                    {/* Was Completed */}
                    {hasInputtedFinancials === 1 && (
                      <>
                        <p className="title is-4 pb-2">
                          <FontAwesomeIcon className="fas" icon={faChartPie} />
                          &nbsp;Financials
                        </p>
                        <FormRadioField
                          label="Who was paid for this job?"
                          value={invoicePaidTo}
                          opt1Value={1}
                          opt1Label="Associate"
                          opt2Value={2}
                          opt2Label="Organization"
                          errorText={errors.invoicePaidTo}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setInvoicePaidTo(parseInt(e.target.value))
                          }
                        />

                        <FormRadioField
                          label="What is the service fee payment status of this job?"
                          value={paymentStatus}
                          opt1Value={ORDER_STATUS_COMPLETED_AND_PAID}
                          opt1Label="Paid"
                          opt2Value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                          opt2Label="Unpaid"
                          errorText={errors.paymentStatus}
                          wasValidated={false}
                          helpText="Selecting `yes` will result in job being paid"
                          onChange={(e) =>
                            setPaymentStatus(parseInt(e.target.value))
                          }
                        />

                        <FormAlternateDateField
                          label="Completion Date"
                          name="completionDate"
                          placeholder="Text input"
                          value={completionDate}
                          errorText={errors && errors.completionDate}
                          helpText="Note: Future dates are not allowed."
                          onChange={(date) => setCompletionDate(date)}
                          isRequired={false}
                          maxWidth="187px"
                          maxDate={new Date()}
                        />

                        <FormAlternateDateField
                          label="Invoice date"
                          name="invoiceDate"
                          placeholder="Text input"
                          value={invoiceDate}
                          errorText={errors && errors.invoiceDate}
                          helpText=""
                          onChange={(date) => setInvoiceDate(date)}
                          isRequired={false}
                          maxWidth="187px"
                        />
                        <FormInputField
                          label="Invoice IDs"
                          name="invoiceIDs"
                          placeholder="Text input"
                          value={invoiceIDs}
                          errorText={errors && errors.invoiceIDs}
                          helpText="Please note, the system automatically generates an ID, however you are able to edit it if you wish"
                          onChange={(e) => setInvoiceIDs(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <p className="title is-4 pb-2">
                          <FontAwesomeIcon className="fas" icon={faClipboard} />
                          &nbsp;Quote
                        </p>

                        <FormInputField
                          label="Quoted Labour"
                          name="invoiceQuotedLabourAmount"
                          placeholder="Text input"
                          value={invoiceQuotedLabourAmount}
                          errorText={errors && errors.invoiceQuotedLabourAmount}
                          helpText="If no quoted labour costs will occur then please enter zero."
                          onChange={(e) => {
                            setInvoiceQuotedLabourAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Quoted Materials"
                          name="invoiceQuotedMaterialAmount"
                          placeholder="Text input"
                          value={invoiceQuotedMaterialAmount}
                          errorText={
                            errors && errors.invoiceQuotedMaterialAmount
                          }
                          helpText="If no quoted material costs will occur then please enter zero."
                          onChange={(e) => {
                            setInvoiceQuotedMaterialAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Quoted Other Costs"
                          name="invoiceQuotedOtherCostsAmount"
                          placeholder="Text input"
                          value={invoiceQuotedOtherCostsAmount}
                          errorText={
                            errors && errors.invoiceQuotedOtherCostsAmount
                          }
                          helpText="If no quoted other costs will occur then please enter zero."
                          onChange={(e) => {
                            setInvoiceQuotedOtherCostsAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Total Quoted"
                          name="invoiceTotalQuoteAmount"
                          placeholder="Text input"
                          value={invoiceTotalQuoteAmount}
                          errorText={errors && errors.invoiceTotalQuoteAmount}
                          helpText="If no total quoted costs will occur then please enter zero."
                          onChange={(e) =>
                            setInvoiceTotalQuoteAmount(e.target.value)
                          }
                          isRequired={true}
                          maxWidth="380px"
                          disabled={true}
                        />

                        <p className="title is-4 pb-2">
                          <FontAwesomeIcon
                            className="fas"
                            icon={faClipboardCheck}
                          />
                          &nbsp;Actual
                        </p>

                        <FormInputField
                          label="Actual Labour"
                          name="invoiceLabourAmount"
                          placeholder="Text input"
                          value={invoiceLabourAmount}
                          errorText={errors && errors.invoiceLabourAmount}
                          helpText="If no actual labour costs will occur then please enter zero."
                          onChange={(e) => {
                            setInvoiceLabourAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Actual Material"
                          name="invoiceMaterialAmount"
                          placeholder="Text input"
                          value={invoiceMaterialAmount}
                          errorText={errors && errors.invoiceMaterialAmount}
                          helpText="If no material costs were incurred then please enter zero."
                          onChange={(e) => {
                            setInvoiceMaterialAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Actual Other Costs"
                          name="invoiceOtherCostsAmount"
                          placeholder="Text input"
                          value={invoiceOtherCostsAmount}
                          errorText={errors && errors.invoiceOtherCostsAmount}
                          helpText="If no other costs were incurred then please enter zero."
                          onChange={(e) => {
                            setInvoiceOtherCostsAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Actual Tax"
                          name="invoiceTaxAmount"
                          placeholder="Text input"
                          value={invoiceTaxAmount}
                          errorText={errors && errors.invoiceTaxAmount}
                          helpText={`Tax rate is the value of ${taxRate}% and is automatically calculated if associate has an tax account.`}
                          onChange={(e) => {
                            setInvoiceTaxAmount(e.target.value);
                          }}
                          isRequired={true}
                          disabled={!isCustomTaxAmount}
                          maxWidth="380px"
                        />

                        <FormCheckboxField
                          label="Custom Actual Tax?"
                          name="isCustomTaxAmount"
                          checked={isCustomTaxAmount}
                          errorText={errors && errors.isCustomTaxAmount}
                          onChange={(e, x) => setIsCustomTaxAmount(!isCustomTaxAmount)}
                          maxWidth="180px"
                          helpText={`Would you like to override the automatic actual tax value with a custom value?`}
                        />

                        <FormInputField
                          label="Actual Total Amount"
                          name="invoiceTotalAmount"
                          placeholder="Text input"
                          value={invoiceTotalAmount}
                          errorText={errors && errors.invoiceTotalAmount}
                          helpText="This is the total amount subtracted by the deposit amount."
                          onChange={(e) => {
                            setInvoiceTotalAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                          disabled={true}
                        />

                        <FormInputField
                          label="Actual Deposit Amount"
                          name="invoiceDepositAmount"
                          placeholder="Text input"
                          value={invoiceDepositAmount}
                          errorText={errors && errors.invoiceDepositAmount}
                          helpText="If no actual deposits will occur then please enter zero."
                          onChange={(e) => {
                            setInvoiceDepositAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Actual Amount Due"
                          name="invoiceAmountDue"
                          placeholder="Text input"
                          value={invoiceAmountDue}
                          errorText={errors && errors.invoiceAmountDue}
                          helpText="This is the total amount subtracted by the deposit amount."
                          onChange={(e) => {
                            setInvoiceAmountDue(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                          disabled={true}
                        />

                        <p className="title is-4 pb-2">
                          <FontAwesomeIcon
                            className="fas"
                            icon={faHandHoldingUsd}
                          />
                          &nbsp;Service Fee
                        </p>

                        <FormSelectFieldForServiceFee
                          label="Service Fee"
                          name="invoiceServiceFeeID"
                          placeholder="Text input"
                          serviceFeeID={invoiceServiceFeeID}
                          setServiceFeeID={(sfid) => {
                            setInvoiceServiceFeeID(sfid);
                            getServiceFeeDetailAPI(
                              sfid,
                              onServiceFeeDetailSuccess,
                              onServiceFeeDetailError,
                              onServiceFeeDetailDone,
                              onUnauthorized,
                            );
                          }}
                          errorText={errors && errors.invoiceServiceFeeID}
                          helpText="Please select the service fee."
                          serviceFeeOther={invoiceServiceFeeOther}
                          isServiceFeeOther={isInvoiceServiceFeeOther}
                          setIsServiceFeeOther={setIsInvoiceServiceFeeOther}
                          setServiceFeeOther={setInvoiceServiceFeeOther}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Required Service Fee Amount"
                          name="invoiceServiceFeeAmount"
                          placeholder="Text input"
                          value={
                            isNaN(invoiceServiceFeeAmount)
                              ? 0
                              : invoiceServiceFeeAmount
                          }
                          errorText={errors && errors.invoiceServiceFeeAmount}
                          helpText="The service fee amount owed by the associate."
                          onChange={(e) => {
                            setInvoiceServiceFeeAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                          disabled={true}
                        />
                        <FormAlternateDateField
                          label={
                            paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID
                              ? `Invoice service fee payment date`
                              : `Invoice service fee payment date (Optional)`
                          }
                          name="invoiceServiceFeePaymentDate"
                          placeholder="Text input"
                          value={invoiceServiceFeePaymentDate}
                          errorText={
                            errors && errors.invoiceServiceFeePaymentDate
                          }
                          helpText=""
                          onChange={(date) =>
                            setInvoiceServiceFeePaymentDate(date)
                          }
                          isRequired={false}
                          maxWidth="187px"
                        />

                        <FormMultiSelectField
                          label="Payment Method(s)"
                          name="paymentMethods"
                          placeholder="Text input"
                          options={ORDER_INVOICE_PAYMENT_METHODS_OPTIONS}
                          selectedValues={paymentMethods}
                          onChange={(e) => {
                            let values = [];
                            for (let option of e) {
                              values.push(option.value);
                            }
                            setPaymentMethods(values);
                          }}
                          errorText={errors && errors.paymentMethods}
                          helpText="Sets the payment methods that Associates can accept from their clients"
                          isRequired={true}
                          maxWidth="320px"
                        />

                        <FormInputField
                          label="Actual Service Fee Paid"
                          name="invoiceActualServiceFeeAmountPaid"
                          placeholder="Text input"
                          value={invoiceActualServiceFeeAmountPaid}
                          errorText={
                            errors && errors.invoiceActualServiceFeeAmountPaid
                          }
                          helpText="Please fill in the actual service fee amount paid by the associate and received by your organization."
                          onChange={(e) => {
                            setInvoiceActualServiceFeeAmountPaid(
                              e.target.value,
                            );
                          }}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Balance Owing Amount"
                          name="invoiceBalanceOwingAmount"
                          placeholder="Text input"
                          value={invoiceBalanceOwingAmount}
                          errorText={errors && errors.invoiceBalanceOwingAmount}
                          helpText="This is remaining balance to be paid by the associate to your organization."
                          onChange={(e) => {
                            setInvoiceBalanceOwingAmount(e.target.value);
                          }}
                          isRequired={true}
                          maxWidth="380px"
                          disabled={true}
                        />
                      </>
                    )}

                    {/* Was Not Completed */}
                    {hasInputtedFinancials === 2 && <></>}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/task/${tid}/order-completion/step-2`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 2
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-primary is-fullwidth-mobile"
                          type="button"
                        >
                          Save&nbsp;&&nbsp;Continue&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowRight}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminTaskItemOrderCompletionStep3;
