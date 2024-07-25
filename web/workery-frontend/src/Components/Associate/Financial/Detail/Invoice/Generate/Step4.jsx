import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faCloudDownload,
  faArrowRight,
  faHome,
  faTags,
  faEnvelope,
  faReceipt,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faCreditCard,
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
import { useParams } from "react-router-dom";

import { isISODate } from "../../../../../../Helpers/datetimeUtility";
import {
  getOrderDetailAPI,
  postOrderGenerateInvoiceOperationAPI,
} from "../../../../../../API/Order";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormAlternateDateField from "../../../../../Reusable/FormAlternateDateField";
import FormPhoneField from "../../../../../Reusable/FormPhoneField";
import FormRadioField from "../../../../../Reusable/FormRadioField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormCheckboxField from "../../../../../Reusable/FormCheckboxField";
import URLTextFormatter from "../../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../../Reusable/EveryPage/DateTimeTextFormatter";
import OrderStatusFormatter from "../../../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../../../Reusable/EveryPage/CheckboxTextFormatter";
import AlertBanner from "../../../../../Reusable/EveryPage/AlertBanner";
import TaskItemUpdateURLPathFormatter from "../../../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import DataDisplayRowText from "../../../../../Reusable/DataDisplayRowText";
import DataDisplayRowCheckbox from "../../../../../Reusable/DataDisplayRowCheckbox";
import DataDisplayRowMultiSelect from "../../../../../Reusable/DataDisplayRowMultiSelect";
import {
  topAlertMessageState,
  topAlertStatusState,
  generateOrderInvoiceState,
  GENERATE_INVOICE_STATE_DEFAULT,
} from "../../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../../../Constants/FieldOptions";

function AssociateFinancialGenerateInvoiceStep3() {
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
  const [generateOrderInvoice, setGenerateOrderInvoice] = useRecoilState(
    generateOrderInvoiceState,
  );

  ////
  //// Component states.
  ////

  // Page state.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});

  // Form state.
  //// Step 1
  const [invoiceId] = useState(generateOrderInvoice.invoiceId);
  const [invoiceDate] = useState(generateOrderInvoice.invoiceDate);
  const [associateName] = useState(generateOrderInvoice.associateName);
  const [associatePhone] = useState(generateOrderInvoice.associatePhone);
  const [associateTaxId] = useState(generateOrderInvoice.associateTaxId);
  const [customerName] = useState(generateOrderInvoice.customerName);
  const [customerAddress] = useState(generateOrderInvoice.customerAddress);
  const [customerEmail] = useState(generateOrderInvoice.customerEmail);
  const [customerPhone] = useState(generateOrderInvoice.customerPhone);

  //// Step 2
  const [line01Quantity] = useState(generateOrderInvoice.line01Quantity);
  const [line01Description] = useState(generateOrderInvoice.line01Description);
  const [line01UnitPrice] = useState(generateOrderInvoice.line01UnitPrice);
  const [line01Amount] = useState(generateOrderInvoice.line01Amount);
  const [line02Quantity] = useState(generateOrderInvoice.line02Quantity);
  const [line02Description] = useState(generateOrderInvoice.line02Description);
  const [line02UnitPrice] = useState(generateOrderInvoice.line02UnitPrice);
  const [line02Amount] = useState(generateOrderInvoice.line02Amount);
  const [line03Quantity] = useState(generateOrderInvoice.line03Quantity);
  const [line03Description] = useState(generateOrderInvoice.line03Description);
  const [line03UnitPrice] = useState(generateOrderInvoice.line03UnitPrice);
  const [line03Amount] = useState(generateOrderInvoice.line03Amount);
  const [line04Quantity] = useState(generateOrderInvoice.line04Quantity);
  const [line04Description] = useState(generateOrderInvoice.line04Description);
  const [line04UnitPrice] = useState(generateOrderInvoice.line04UnitPrice);
  const [line04Amount] = useState(generateOrderInvoice.line04Amount);
  const [line05Quantity] = useState(generateOrderInvoice.line05Quantity);
  const [line05Description] = useState(generateOrderInvoice.line05Description);
  const [line05UnitPrice] = useState(generateOrderInvoice.line05UnitPrice);
  const [line05Amount] = useState(generateOrderInvoice.line05Amount);
  const [line06Quantity] = useState(generateOrderInvoice.line06Quantity);
  const [line06Description] = useState(generateOrderInvoice.line06Description);
  const [line06UnitPrice] = useState(generateOrderInvoice.line06UnitPrice);
  const [line06Amount] = useState(generateOrderInvoice.line06Amount);
  const [line07Quantity] = useState(generateOrderInvoice.line07Quantity);
  const [line07Description] = useState(generateOrderInvoice.line07Description);
  const [line07UnitPrice] = useState(generateOrderInvoice.line07UnitPrice);
  const [line07Amount] = useState(generateOrderInvoice.line07Amount);
  const [line08Quantity] = useState(generateOrderInvoice.line08Quantity);
  const [line08Description] = useState(generateOrderInvoice.line08Description);
  const [line08UnitPrice] = useState(generateOrderInvoice.line08UnitPrice);
  const [line08Amount] = useState(generateOrderInvoice.line08Amount);
  const [line09Quantity] = useState(generateOrderInvoice.line09Quantity);
  const [line09Description] = useState(generateOrderInvoice.line09Description);
  const [line09UnitPrice] = useState(generateOrderInvoice.line09UnitPrice);
  const [line09Amount] = useState(generateOrderInvoice.line09Amount);
  const [line10Quantity] = useState(generateOrderInvoice.line10Quantity);
  const [line10Description] = useState(generateOrderInvoice.line10Description);
  const [line10UnitPrice] = useState(generateOrderInvoice.line10UnitPrice);
  const [line10Amount] = useState(generateOrderInvoice.line10Amount);
  const [line11Quantity] = useState(generateOrderInvoice.line11Quantity);
  const [line11Description] = useState(generateOrderInvoice.line11Description);
  const [line11UnitPrice] = useState(generateOrderInvoice.line11UnitPrice);
  const [line11Amount] = useState(generateOrderInvoice.line11Amount);
  const [line12Quantity] = useState(generateOrderInvoice.line12Quantity);
  const [line12Description] = useState(generateOrderInvoice.line12Description);
  const [line12UnitPrice] = useState(generateOrderInvoice.line12UnitPrice);
  const [line12Amount] = useState(generateOrderInvoice.line12Amount);
  const [line13Quantity] = useState(generateOrderInvoice.line13Quantity);
  const [line13Description] = useState(generateOrderInvoice.line13Description);
  const [line13UnitPrice] = useState(generateOrderInvoice.line13UnitPrice);
  const [line13Amount] = useState(generateOrderInvoice.line13Amount);
  const [line14Quantity] = useState(generateOrderInvoice.line14Quantity);
  const [line14Description] = useState(generateOrderInvoice.line14Description);
  const [line14UnitPrice] = useState(generateOrderInvoice.line14UnitPrice);
  const [line14Amount] = useState(generateOrderInvoice.line14Amount);
  const [line15Quantity] = useState(generateOrderInvoice.line15Quantity);
  const [line15Description] = useState(generateOrderInvoice.line15Description);
  const [line15UnitPrice] = useState(generateOrderInvoice.line15UnitPrice);
  const [line15Amount] = useState(generateOrderInvoice.line15Amount);

  //// Step 3
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(
    generateOrderInvoice.invoiceLabourAmount,
  );
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(
    generateOrderInvoice.invoiceMaterialAmount,
  );
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(
    generateOrderInvoice.invoiceOtherCostsAmount,
  );
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(
    generateOrderInvoice.invoiceTaxAmount,
  );
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(
    generateOrderInvoice.invoiceTotalAmount,
  );
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(
    generateOrderInvoice.invoiceDepositAmount,
  );
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(
    generateOrderInvoice.invoiceAmountDue,
  );
  const [invoiceQuoteDays, setInvoiceQuoteDays] = useState(
    generateOrderInvoice.invoiceQuoteDays,
  );
  const [invoiceQuoteDate, setInvoiceQuoteDate] = useState(
    generateOrderInvoice.invoiceQuoteDate,
  );
  const [invoiceCustomersApproval, setInvoiceCustomersApproval] = useState(
    generateOrderInvoice.invoiceCustomersApproval,
  );
  const [line01Notes, setLine01Notes] = useState(
    generateOrderInvoice.line01Notes,
  );
  const [line02Notes, setLine02Notes] = useState(
    generateOrderInvoice.line02Notes,
  );
  const [dateClientPaidInvoice, setDateClientPaidInvoice] = useState(
    generateOrderInvoice.dateClientPaidInvoice,
  );
  const [clientSignature, setClientSignature] = useState(
    generateOrderInvoice.clientSignature,
  );
  const [associateSignDate, setAssociateSignDate] = useState(
    generateOrderInvoice.associateSignDate,
  );
  const [associateSignature, setAssociateSignature] = useState(
    generateOrderInvoice.associateSignature,
  );
  const [paymentMethods, setPaymentMethods] = useState(
    generateOrderInvoice.paymentMethods,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick data:", generateOrderInvoice);

    // Apply the following fixes to our payload.
    const cleanData = {};

    // // Fix 1: invoiceDate
    // console.log("(1) !isISODate(generateOrderInvoice.invoiceDate) ---->", !isISODate(generateOrderInvoice.invoiceDate));
    // console.log("(1) generateOrderInvoice.invoiceDate != \"\" ---->", generateOrderInvoice.invoiceDate != "");
    // console.log("(1) generateOrderInvoice.invoiceDate ---->", generateOrderInvoice.invoiceDate);
    // if (!isISODate(generateOrderInvoice.invoiceDate) && generateOrderInvoice.invoiceDate != "") {
    //     const invoiceDateObject = new Date(generateOrderInvoice.invoiceDate);
    //     const invoiceDateISOString = invoiceDateObject.toISOString();
    //     cleanData.invoiceDate = invoiceDateISOString;
    //     console.log("(1) invoiceDate ---->", cleanData.invoiceDate);
    // }
    //
    // // Fix 2: invoiceQuoteDate
    // console.log("(2) !isISODate(generateOrderInvoice.invoiceQuoteDate) ---->", !isISODate(generateOrderInvoice.invoiceQuoteDate));
    // console.log("(2) generateOrderInvoice.invoiceQuoteDate != \"\" ---->", generateOrderInvoice.invoiceQuoteDate != "");
    // console.log("(2) generateOrderInvoice.invoiceQuoteDate ---->", generateOrderInvoice.invoiceQuoteDate);
    // if (!isISODate(generateOrderInvoice.invoiceQuoteDate) && generateOrderInvoice.invoiceQuoteDate != "") {
    //     const invoiceQuoteDateObject = new Date(generateOrderInvoice.invoiceQuoteDate);
    //     const invoiceQuoteDateISOString = invoiceQuoteDateObject.toISOString();
    //     cleanData.invoiceQuoteDate = invoiceQuoteDateISOString;
    //     console.log("(2) invoiceQuoteDate ---->", cleanData.invoiceQuoteDate);
    // }
    //
    // // Fix 3: dateClientPaidInvoice
    // console.log("(3) !isISODate(generateOrderInvoice.dateClientPaidInvoice) ---->", !isISODate(generateOrderInvoice.dateClientPaidInvoice));
    // console.log("(3) generateOrderInvoice.dateClientPaidInvoice != \"\" ---->", generateOrderInvoice.dateClientPaidInvoice != "");
    // console.log("(3) generateOrderInvoice.dateClientPaidInvoice ---->", generateOrderInvoice.dateClientPaidInvoice);
    // if (!isISODate(generateOrderInvoice.dateClientPaidInvoice) && generateOrderInvoice.dateClientPaidInvoice != "") {
    //     // console.log("generateOrderInvoice.dateClientPaidInvoice ---->", generateOrderInvoice.dateClientPaidInvoice);
    //     const dateClientPaidInvoiceObject = new Date(generateOrderInvoice.dateClientPaidInvoice);
    //     // console.log("dateClientPaidInvoiceObject ---->", dateClientPaidInvoiceObject);
    //     const dateClientPaidInvoiceISOString = dateClientPaidInvoiceObject.toISOString();
    //     // console.log("dateClientPaidInvoiceISOString ---->", dateClientPaidInvoiceISOString);
    //     cleanData.dateClientPaidInvoice = dateClientPaidInvoiceISOString;
    //     console.log("(3) dateClientPaidInvoice ---->", cleanData.dateClientPaidInvoice);
    // }
    //
    // // Fix 4: associateSignDate
    // console.log("(4) !isISODate(generateOrderInvoice.associateSignDate) ---->", !isISODate(generateOrderInvoice.associateSignDate));
    // console.log("(4) generateOrderInvoice.associateSignDate != \"\" ---->", generateOrderInvoice.associateSignDate != "");
    // console.log("(4) generateOrderInvoice.associateSignDate ---->", generateOrderInvoice.associateSignDate);
    // if (!isISODate(generateOrderInvoice.associateSignDate) && generateOrderInvoice.associateSignDate != "") {
    //     const associateSignDateObject = new Date(generateOrderInvoice.associateSignDate);
    //     const associateSignDateISOString = associateSignDateObject.toISOString();
    //     cleanData.associateSignDate = associateSignDateISOString;
    //     console.log("(4) associateSignDate ---->", cleanData.associateSignDate);
    // }

    // Make a copy of the read-only data in snake case format.
    const payload = {
      order_id: order.id,

      // Step 1
      invoice_id: invoiceId,
      invoice_date: invoiceDate, // Use sanitized value.
      associate_name: associateName,
      associate_phone: associatePhone,
      associate_tax_id: associateTaxId,
      client_name: customerName,
      client_address: customerAddress,
      client_email: customerEmail,
      client_phone: customerPhone,

      // Step 2
      line_01_quantity: parseInt(line01Quantity),
      line_01_description: line01Description,
      line_01_unit_price: parseFloat(line01UnitPrice),
      line_01_amount: parseFloat(line01Amount),
      line_02_quantity: parseInt(line02Quantity),
      line_02_description: line02Description,
      line_02_unit_price: parseFloat(line02UnitPrice),
      line_02_amount: parseFloat(line02Amount),
      line_03_quantity: parseInt(line03Quantity),
      line_03_description: line03Description,
      line_03_unit_price: parseFloat(line03UnitPrice),
      line_03_amount: parseFloat(line03Amount),
      line_04_quantity: parseInt(line04Quantity),
      line_04_description: line04Description,
      line_04_unit_price: parseFloat(line04UnitPrice),
      line_04_amount: parseFloat(line04Amount),
      line_05_quantity: parseInt(line05Quantity),
      line_05_description: line05Description,
      line_05_unit_price: parseFloat(line05UnitPrice),
      line_05_amount: parseFloat(line05Amount),
      line_06_quantity: parseInt(line06Quantity),
      line_06_description: line06Description,
      line_06_unit_price: parseFloat(line06UnitPrice),
      line_06_amount: parseFloat(line06Amount),
      line_07_quantity: parseInt(line07Quantity),
      line_07_description: line07Description,
      line_07_unit_price: parseFloat(line07UnitPrice),
      line_07_amount: parseFloat(line07Amount),
      line_08_quantity: parseInt(line08Quantity),
      line_08_description: line08Description,
      line_08_unit_price: parseFloat(line08UnitPrice),
      line_08_amount: parseFloat(line08Amount),
      line_09_quantity: parseInt(),
      line_09_description: line09Description,
      line_09_unit_price: parseFloat(line09UnitPrice),
      line_09_amount: parseFloat(line09Amount),
      line_10_quantity: parseInt(line10Quantity),
      line_10_description: line10Description,
      line_10_unit_price: parseFloat(line10UnitPrice),
      line_10_amount: parseFloat(line10Amount),
      line_11_quantity: parseInt(line11Quantity),
      line_11_description: line11Description,
      line_11_unit_price: parseFloat(line11UnitPrice),
      line_11_amount: parseFloat(line11Amount),
      line_12_quantity: parseInt(line12Quantity),
      line_12_description: line12Description,
      line_12_unit_price: parseFloat(line12UnitPrice),
      line_12_amount: parseFloat(line12Amount),
      line_13_quantity: parseInt(line13Quantity),
      line_13_description: line13Description,
      line_13_unit_price: parseFloat(line13UnitPrice),
      line_13_amount: parseFloat(line13Amount),
      line_14_quantity: parseInt(line14Quantity),
      line_14_description: line14Description,
      line_14_unit_price: parseFloat(line14UnitPrice),
      line_14_amount: parseFloat(line14Amount),
      line_15_quantity: parseInt(line15Quantity),
      line_15_description: line15Description,
      line_15_unit_price: parseFloat(line15UnitPrice),
      line_15_amount: parseFloat(line15Amount),

      // Step 3
      total_labour: parseFloat(invoiceLabourAmount),
      total_materials: parseFloat(invoiceMaterialAmount),
      other_costs: parseFloat(invoiceOtherCostsAmount),
      sub_total: parseFloat(
        invoiceLabourAmount + invoiceMaterialAmount + invoiceOtherCostsAmount,
      ),
      tax: parseFloat(invoiceTaxAmount),
      total: parseFloat(invoiceTotalAmount),
      deposit: parseFloat(invoiceDepositAmount),
      amount_due: parseFloat(invoiceAmountDue),
      invoice_quote_date: invoiceQuoteDate, // Use sanitized value.
      invoice_customers_approval: invoiceCustomersApproval,
      line_01_notes: line01Notes,
      line_02_notes: line02Notes,
      date_client_paid_invoice: dateClientPaidInvoice,
      payment_methods: paymentMethods,
      client_signature: clientSignature,
      associate_sign_date: associateSignDate, // Use sanitized value.
      associate_signature: associateSignature,
      invoice_quote_days: parseInt(invoiceQuoteDays),
      associate_tax_id: associateTaxId,
    };

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", payload);

    setFetching(true);
    setErrors({});
    postOrderGenerateInvoiceOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setOrder(response);
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

  // --- Operation --- //

  function onOperationSuccess(response) {
    console.log("onOperationSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Invoice generated");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onOperationSuccess: Delayed for 2 seconds.");
      console.log(
        "onOperationSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Redirect the user to a new page.
    setForceURL("/a/financial/" + oid + "/invoice");
  }

  function onOperationError(apiErr) {
    console.log("onOperationError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOperationDone() {
    console.log("onOperationDone: Starting...");
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
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getOrderDetailAPI(oid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

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
                <Link to="/a/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/a/financials" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;Financials
                </Link>
              </li>
              <li className="">
                <Link to={`/a/financial/${oid}/invoice`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(Invoice)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;Generate Invoice
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
                <Link to={`/a/financial/${oid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Financial Detail
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

          {/* Progress Wizard */}
          {isFetching === false && (
            <nav className="box has-background-success-light">
              <p className="subtitle is-5">Step 4 of 4</p>
              <progress class="progress is-success" value="100" max="100">
                100%
              </progress>
            </nav>
          )}

          {/* Page */}
          <nav className="box">
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {/* Title + Options */}
                {order && (
                  <div className="columns">
                    <div className="column">
                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faReceipt} />
                        &nbsp;Generate Invoice
                      </p>
                    </div>
                    <div className="column has-text-right"></div>
                  </div>
                )}

                <FormErrorBox errors={errors} />
                <p className="has-text-grey pb-4">
                  Please carefully review the following invoice details and if
                  you are ready click the <b>Submit</b> to complete.
                </p>

                {order && (
                  <div className="container">
                    <p className="title is-4 mt-2">
                      Step 1&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                      <Link to={`/a/financial/${oid}/invoice/generate/step-1`}>
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit
                      </Link>
                    </p>

                    <DataDisplayRowText
                      label="Invoice ID #"
                      value={invoiceId}
                    />
                    <DataDisplayRowText
                      label="Invoice Date"
                      value={invoiceDate}
                      type="date"
                    />
                    <DataDisplayRowText
                      label="Associate Name"
                      value={associateName}
                    />
                    <DataDisplayRowText
                      label="Associate Phone"
                      value={associatePhone}
                      type="phone"
                    />
                    <DataDisplayRowText
                      label="Associate Tax ID"
                      value={associateTaxId}
                    />
                    <DataDisplayRowText
                      label="Client Name"
                      value={customerName}
                    />
                    <DataDisplayRowText
                      label="Client Address"
                      value={customerAddress}
                    />
                    <DataDisplayRowText
                      label="Client Email"
                      value={customerEmail}
                      type="email"
                    />

                    <p className="title is-4 mt-2">
                      Step 2&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                      <Link to={`/a/financial/${oid}/invoice/generate/step-2`}>
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit
                      </Link>
                    </p>
                    <p className="title is-5 mt-2">
                      <u>Line 01</u>
                    </p>
                    <DataDisplayRowText
                      label="Quantity"
                      value={line01Quantity}
                    />
                    <DataDisplayRowText
                      label="Description"
                      value={line01Description}
                    />
                    <DataDisplayRowText
                      label="Unit Price"
                      value={line01UnitPrice}
                    />
                    <DataDisplayRowText label="Amount" value={line01Amount} />

                    <p className="title is-4 mt-2">
                      Step 3&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                      <Link to={`/a/financial/${oid}/invoice/generate/step-3`}>
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit
                      </Link>
                    </p>
                    <DataDisplayRowText
                      label="Labour Amount"
                      value={invoiceLabourAmount}
                    />
                    <DataDisplayRowText
                      label="Material Amount"
                      value={invoiceMaterialAmount}
                    />
                    <DataDisplayRowText
                      label="Other Costs"
                      value={invoiceOtherCostsAmount}
                    />
                    <DataDisplayRowText
                      label="Sub-Total"
                      value={
                        invoiceLabourAmount +
                        invoiceMaterialAmount +
                        invoiceOtherCostsAmount
                      }
                    />
                    <DataDisplayRowText
                      label={
                        <>
                          Tax{" "}
                          {order.invoiceIsCustomTaxAmount && (
                            <>
                              &nbsp;(
                              <FontAwesomeIcon
                                className="fas"
                                icon={faCircleInfo}
                              />
                              &nbsp;Note: Custom value was set)
                            </>
                          )}
                        </>
                      }
                      value={invoiceTaxAmount}
                    />
                    <DataDisplayRowText
                      label="Total"
                      value={invoiceTotalAmount}
                    />
                    <DataDisplayRowText
                      label="Deposit"
                      value={invoiceDepositAmount}
                    />
                    <DataDisplayRowText
                      label="Amount Due"
                      value={invoiceAmountDue}
                    />
                    <DataDisplayRowText
                      label="This quote is valid for the following number of days:"
                      value={invoiceQuoteDays}
                    />
                    <DataDisplayRowText
                      label="Associate Tax ID"
                      value={associateTaxId}
                    />
                    <DataDisplayRowText
                      label="Date of Quote Approval"
                      value={invoiceQuoteDate}
                      type="date"
                    />
                    <DataDisplayRowText
                      label="Customer Approval"
                      value={invoiceCustomersApproval}
                    />
                    <DataDisplayRowText
                      label="Line 01 - Notes or Extras"
                      value={line01Notes}
                    />
                    <DataDisplayRowText
                      label="Line 02 - Notes or Extras"
                      value={line02Notes}
                    />
                    <DataDisplayRowText
                      label="Date client paid invoice"
                      value={dateClientPaidInvoice}
                      type="date"
                    />
                    <DataDisplayRowMultiSelect
                      label="Payment Method(s)"
                      selectedValues={paymentMethods}
                      options={ORDER_INVOICE_PAYMENT_METHODS_OPTIONS}
                    />

                    <DataDisplayRowText
                      label="Client Signature upon completion"
                      value={clientSignature}
                    />
                    <DataDisplayRowText
                      label="Associate Signature Date"
                      value={associateSignDate}
                      type="date"
                    />
                    <DataDisplayRowText
                      label="Associate Signature upon completion"
                      value={associateSignature}
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/a/financial/${oid}/invoice/generate/step-3`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 3
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-success is-fullwidth-mobile"
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;Submit
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

export default AssociateFinancialGenerateInvoiceStep3;
