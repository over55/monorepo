import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTags,
  faClipboard,
  faClipboardCheck,
  faHandHoldingUsd,
  faCreditCard,
  faEnvelope,
  faTable,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faWrench,
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
  faMap,
  faGraduationCap,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getServiceFeeDetailAPI } from "../../../../API/ServiceFee";
import { getTenantDetailAPI } from "../../../../API/Tenant";
import deepClone from "../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../Helpers/datetimeUtility";
import { getOrderDetailAPI, putOrderUpdateAPI } from "../../../../API/Order";
import { putFinancialUpdateAPI } from "../../../../API/Financial";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForTags from "../../../Reusable/FormMultiSelectFieldForTags";
import FormInputField from "../../../Reusable/FormInputField";
import FormSelectFieldForServiceFee from "../../../Reusable/FormSelectFieldForServiceFee";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
  ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../Constants/App";

function AdminFinancialUpdate() {
  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  // --- Page related --- //
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});
  const [taxRate, setTaxRate] = useState(0.0);
  const [onPageLoaded, setOnPageLoaded] = useState(false);

  // --- Form related --- //
  const [invoicePaidTo, setInvoicePaidTo] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(0);
  const [completionDate, setCompletionDate] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [invoiceIDs, setInvoiceIDs] = useState(0);
  const [invoiceQuotedLabourAmount, setInvoiceQuotedLabourAmount] = useState(0);
  const [invoiceQuotedMaterialAmount, setInvoiceQuotedMaterialAmount] =
    useState(0);
  const [invoiceQuotedOtherCostsAmount, setInvoiceQuotedOtherCostsAmount] =
    useState(0);
  const [invoiceTotalQuoteAmount, setInvoiceTotalQuoteAmount] = useState(0);
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(0);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(0);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(0);
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceIsCustomTaxAmount, setInvoiceIsCustomTaxAmount] = useState(false);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(0);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(0);
  const [invoiceServiceFeeID, setInvoiceServiceFeeID] = useState(0);
  const [invoiceServiceFee, setInvoiceServiceFee] = useState(0);
  const [invoiceServiceFeePercentage, setInvoiceServiceFeePercentage] =
    useState(0);
  const [isInvoiceServiceFeeOther, setIsInvoiceServiceFeeOther] = useState(0);
  const [invoiceServiceFeeOther, setInvoiceServiceFeeOther] = useState(0);
  const [invoiceServiceFeeAmount, setInvoiceServiceFeeAmount] = useState(0);
  const [invoiceServiceFeePaymentDate, setIinvoiceServiceFeePaymentDate] =
    useState(null);
  const [
    invoiceActualServiceFeeAmountPaid,
    setInvoiceActualServiceFeeAmountPaid,
  ] = useState(0);
  const [invoiceBalanceOwingAmount, setInvoiceBalanceOwingAmount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    setErrors({}); // Reset error.

    // Save to persistent storage.
    let modifiedOrder = {};
    modifiedOrder.wjid = order.wjid;
    modifiedOrder.invoice_paid_to = invoicePaidTo;
    modifiedOrder.payment_status = paymentStatus;
    modifiedOrder.completion_date = completionDate;
    modifiedOrder.invoice_date = invoiceDate;
    try {
      modifiedOrder.invoice_ids = invoiceIDs.toString();
    } catch (e) {
      console.log("warning: e:", e);
      modifiedOrder.invoice_ids = "";
    }
    modifiedOrder.invoice_quoted_labour_amount = parseFloat(
      invoiceQuotedLabourAmount,
    );
    modifiedOrder.invoice_quoted_material_amount = parseFloat(
      invoiceQuotedMaterialAmount,
    );
    modifiedOrder.invoice_quoted_other_costs_amount = parseFloat(
      invoiceQuotedOtherCostsAmount,
    );
    modifiedOrder.invoice_total_quote_amount = parseFloat(
      invoiceTotalQuoteAmount,
    );
    modifiedOrder.invoice_labour_amount = parseFloat(invoiceLabourAmount);
    modifiedOrder.invoice_material_amount = parseFloat(invoiceMaterialAmount);
    modifiedOrder.invoice_other_costs_amount = parseFloat(
      invoiceOtherCostsAmount,
    );
    modifiedOrder.invoice_tax_amount = parseFloat(invoiceTaxAmount);
    modifiedOrder.invoice_is_custom_tax_amount = true ? (invoiceIsCustomTaxAmount === "true" || invoiceIsCustomTaxAmount === true || invoiceIsCustomTaxAmount === 1) : false;
    modifiedOrder.invoice_total_amount = parseFloat(invoiceTotalAmount);
    modifiedOrder.invoice_deposit_amount = parseFloat(invoiceDepositAmount);
    modifiedOrder.invoice_amount_due = invoiceAmountDue;
    modifiedOrder.invoice_service_fee_id = invoiceServiceFeeID;
    modifiedOrder.invoice_service_fee_percentage = invoiceServiceFeePercentage;
    modifiedOrder.invoice_service_fee = invoiceServiceFee;
    modifiedOrder.invoice_service_fee_other = invoiceServiceFeeOther;
    modifiedOrder.is_invoice_service_fee_other = isInvoiceServiceFeeOther;
    modifiedOrder.invoice_service_fee_amount = parseFloat(
      invoiceServiceFeeAmount,
    );
    modifiedOrder.invoice_service_fee_payment_date =
      invoiceServiceFeePaymentDate;
    modifiedOrder.payment_methods = paymentMethods;
    modifiedOrder.invoice_actual_service_fee_amount_paid = parseFloat(
      invoiceActualServiceFeeAmountPaid,
    );
    modifiedOrder.invoice_balance_owing_amount = parseFloat(
      invoiceBalanceOwingAmount,
    );
    setOrder(modifiedOrder);

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", modifiedOrder);

    setFetching(false);
    setErrors({});
    putFinancialUpdateAPI(
      modifiedOrder,
      onUpdateSuccess,
      onUpdateError,
      onUpdateDone,
      onUnauthorized,
    );
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

    // Compute tax
    if (
      associateTaxId !== undefined &&
      associateTaxId !== null &&
      associateTaxId !== "" &&
      associateTaxId !== "NA"
    ) {
        if (invoiceIsCustomTaxAmount === false) {
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
    console.log("   invoiceIsCustomTaxAmount=", invoiceIsCustomTaxAmount);
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

  /**
   *  Source: https://stackoverflow.com/a/18358056
   */
  const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
  };

  // Utility function calculates our read-only form fields.
  const performCalculationWithPercentageOverride = (percentageOverride) => {
    console.log("calculating...");
    console.log("percentageOverride:", percentageOverride);

    // Compute the total quoted amount.
  };

  ////
  //// API.
  ////

  // --- Tenant Detail --- //

  function onTenantDetailSuccess(response) {
    console.log("onTenantDetailSuccess: Starting...");
    console.log("onTenantDetailSuccess: tenant:", response);
    setTaxRate(parseFloat(response.taxRate));
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
      performCalculationWithPercentageOverride(response.percentage);
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

  // --- Retrieve --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setOrder(response);

    // // Set form related fields.
    if (response.invoicePaidTo) {
      setInvoicePaidTo(response.invoicePaidTo);
    } else {
      // Default to `1` if nothing was set.
      setInvoicePaidTo(1); // 1=Associate.
    }
    setPaymentStatus(response.status);
    setCompletionDate(response.completionDate);
    setInvoiceDate(response.invoiceDate);
    setInvoiceIDs(response.invoiceIds);
    setInvoiceQuotedLabourAmount(response.invoiceQuotedLabourAmount);
    setInvoiceQuotedMaterialAmount(response.invoiceQuotedMaterialAmount);
    setInvoiceQuotedOtherCostsAmount(response.invoiceQuotedOtherCostsAmount);
    setInvoiceTotalQuoteAmount(response.invoiceTotalQuoteAmount);
    setInvoiceLabourAmount(response.invoiceLabourAmount);
    setInvoiceMaterialAmount(response.invoiceMaterialAmount);
    setInvoiceOtherCostsAmount(response.invoiceOtherCostsAmount);
    setAssociateTaxId(response.associateTaxId);
    setInvoiceTaxAmount(response.invoiceTaxAmount);
    setInvoiceIsCustomTaxAmount(response.invoiceIsCustomTaxAmount);
    setInvoiceTotalAmount(response.invoiceTotalAmount);
    setInvoiceDepositAmount(response.invoiceDepositAmount);
    setInvoiceAmountDue(response.invoiceAmountDue);
    setInvoiceServiceFeeID(response.invoiceServiceFeeId);
    setInvoiceServiceFee(response.invoiceServiceFee);
    setInvoiceServiceFeePercentage(response.invoiceServiceFeePercentage);
    setIsInvoiceServiceFeeOther(response.isInvoiceServiceFeeOther);
    setInvoiceServiceFeeOther(response.invoiceServiceFeeOther);
    setInvoiceServiceFeeAmount(response.invoiceServiceFeeAmount);
    setIinvoiceServiceFeePaymentDate(response.invoiceServiceFeePaymentDate);
    setPaymentMethods(response.paymentMethods);
    setInvoiceActualServiceFeeAmountPaid(
      response.invoiceActualServiceFeeAmountPaid,
    );
    setInvoiceBalanceOwingAmount(response.invoiceBalanceOwingAmount);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onUpdateSuccess(response) {
    console.log("onUpdateSuccess: Starting...");
    console.log(response);

    if (response === undefined || response === null || response === "") {
      console.log("onUpdateSuccess: exiting early");
      return;
    }

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Order financials updated");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onSuccess: Delayed for 2 seconds.");
      console.log(
        "onSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    setForceURL("/admin/financial/" + oid);
  }

  function onUpdateError(apiErr) {
    console.log("onUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onUpdateDone() {
    console.log("onUpdateDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      console.log("order:", order);
      // Check if obj is an empty object
      if (Object.keys(order).length === 0 && order.constructor === Object) {
        console.log("fetching latest order");
        setFetching(true);
        getOrderDetailAPI(oid, onSuccess, onError, onDone, onUnauthorized);
      } else {
        console.log("order already fetched, skipping fetching of order");
      }

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
    order,
    oid,
    taxRate,
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    invoiceTaxAmount,
    invoiceIsCustomTaxAmount,
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
                <Link to="/admin/financials" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;Financials
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/financial/${oid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPencil} />
                  &nbsp;Update
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
                <Link to={`/admin/financial/${oid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {order && order.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faCreditCard} />
            &nbsp;Financials
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {order && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faPencil} />
                    &nbsp;Update
                  </p>
                </div>
                <div className="column has-text-right">
                  {/*
                  <Link
                    to={`/admin/order/${oid}/edit`}
                    className="button is-small is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={order.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
                  </Link>
                  */}
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {order && (
                  <div className="container">
                    <hr />

                    <p className="title is-4 pb-2">
                      <FontAwesomeIcon className="fas" icon={faBuilding} />
                      &nbsp;General
                    </p>

                    {order && (
                      <div className="container">
                        <>
                          <p className="title is-4 pb-2">
                            <FontAwesomeIcon
                              className="fas"
                              icon={faChartPie}
                            />
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

                          {paymentStatus ===
                            ORDER_STATUS_COMPLETED_AND_PAID && (
                            <>
                              <FormAlternateDateField
                                label="Completion Date"
                                name="completionDate"
                                placeholder="Text input"
                                value={completionDate}
                                errorText={errors && errors.completionDate}
                                helpText=""
                                onChange={(date) => setCompletionDate(date)}
                                isRequired={false}
                                maxWidth="187px"
                                maxDate={new Date()}
                              />
                            </>
                          )}

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
                            errorText={errors && errors.invoiceIds}
                            helpText="Please note, the system automatically generates an ID, however you are able to edit it if you wish"
                            onChange={(e) => setInvoiceIDs(e.target.value)}
                            isRequired={true}
                            maxWidth="380px"
                          />

                          <p className="title is-4 pb-2">
                            <FontAwesomeIcon
                              className="fas"
                              icon={faClipboard}
                            />
                            &nbsp;Quote
                          </p>

                          <FormInputField
                            label="Quoted Labour"
                            name="invoiceQuotedLabourAmount"
                            placeholder="Text input"
                            value={invoiceQuotedLabourAmount}
                            errorText={
                              errors && errors.invoiceQuotedLabourAmount
                            }
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
                            disabled={!invoiceIsCustomTaxAmount}
                            maxWidth="380px"
                          />

                          <FormCheckboxField
                            label="Custom Actual Tax?"
                            name="invoiceIsCustomTaxAmount"
                            checked={invoiceIsCustomTaxAmount}
                            errorText={errors && errors.invoiceIsCustomTaxAmount}
                            onChange={(e, x) => setInvoiceIsCustomTaxAmount(!invoiceIsCustomTaxAmount)}
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
                            errorText={errors && errors.invoiceServiceFeeId}
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
                            label="Invoice service fee payment date"
                            name="invoiceServiceFeePaymentDate"
                            placeholder="Text input"
                            value={invoiceServiceFeePaymentDate}
                            errorText={
                              errors && errors.invoiceServiceFeePaymentDate
                            }
                            helpText=""
                            onChange={(date) =>
                              setIinvoiceServiceFeePaymentDate(date)
                            }
                            isRequired={false}
                            maxWidth="187px"
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
                            errorText={
                              errors && errors.invoiceBalanceOwingAmount
                            }
                            helpText="This is remaining balance to be paid by the associate to your organization."
                            onChange={(e) => {
                              setInvoiceBalanceOwingAmount(e.target.value);
                            }}
                            isRequired={true}
                            maxWidth="380px"
                            disabled={true}
                          />
                        </>
                      </div>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/financial/${oid}`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Detail
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-success is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;Save&nbsp;&&nbsp;Submit
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

const obj = {};

export default AdminFinancialUpdate;
