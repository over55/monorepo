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

import { getOrderDetailAPI } from "../../../../../../API/Order";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormAlternateDateField from "../../../../../Reusable/FormAlternateDateField";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormPhoneField from "../../../../../Reusable/FormPhoneField";
import FormRadioField from "../../../../../Reusable/FormRadioField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormCheckboxField from "../../../../../Reusable/FormCheckboxField";
import FormMultiSelectField from "../../../../../Reusable/FormMultiSelectField";
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
  const [associateTaxId, setAssociateTaxId] = useState(
    generateOrderInvoice.associateTaxId,
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

  const onSaveAndNextClick = (e) => {
    console.log("Former generateOrderInvoice data:", generateOrderInvoice);
    let newErrors = {};
    let hasErrors = false;

    // if (invoiceLabourAmount === "" || invoiceLabourAmount === 0) {
    //     newErrors["invoiceLabourAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceMaterialAmount === "" || invoiceMaterialAmount === 0) {
    //     newErrors["invoiceMaterialAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceOtherCostsAmount === "" || invoiceOtherCostsAmount === 0) {
    //     newErrors["invoiceOtherCostsAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceTaxAmount === "" || invoiceTaxAmount === 0) {
    //     newErrors["invoiceTaxAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceTotalAmount === "" || invoiceTotalAmount === 0) {
    //     newErrors["invoiceTotalAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceDepositAmount === "" || invoiceDepositAmount === 0) {
    //     newErrors["invoiceDepositAmount"] = "missing value";
    //     hasErrors = true;
    // }
    // if (invoiceAmountDue === "" || invoiceAmountDue === 0) {
    //     newErrors["invoiceAmountDue"] = "missing value";
    //     hasErrors = true;
    // }
    if (
      invoiceQuoteDays === undefined ||
      invoiceQuoteDays === null ||
      invoiceQuoteDays === "" ||
      invoiceQuoteDays === 0
    ) {
      newErrors["invoiceQuoteDays"] = "missing value";
      hasErrors = true;
    }
    // if (associateTaxId === "" || associateTaxId === 0) {
    //     newErrors["associateTaxId"] = "missing value";
    //     hasErrors = true;
    // }
    if (
      invoiceQuoteDate === undefined ||
      invoiceQuoteDate === null ||
      invoiceQuoteDate === "" ||
      invoiceQuoteDate === 0
    ) {
      newErrors["invoiceQuoteDate"] = "missing value";
      hasErrors = true;
    }
    if (
      invoiceCustomersApproval === undefined ||
      invoiceCustomersApproval === null ||
      invoiceCustomersApproval === "" ||
      invoiceCustomersApproval === 0
    ) {
      newErrors["invoiceCustomersApproval"] = "missing value";
      hasErrors = true;
    }
    // if (
    //   line01Notes === undefined ||
    //   line01Notes === null ||
    //   line01Notes === "" ||
    //   line01Notes === 0
    // ) {
    //   newErrors["line01Notes"] = "missing value";
    //   hasErrors = true;
    // }
    // if (
    //   line02Notes === undefined ||
    //   line02Notes === null ||
    //   line02Notes === "" ||
    //   line02Notes === 0
    // ) {
    //   newErrors["line02Notes"] = "missing value";
    //   hasErrors = true;
    // }
    if (
      dateClientPaidInvoice === undefined ||
      dateClientPaidInvoice === null ||
      dateClientPaidInvoice === "" ||
      dateClientPaidInvoice === 0
    ) {
      newErrors["dateClientPaidInvoice"] = "missing value";
      hasErrors = true;
    }
    if (
      clientSignature === undefined ||
      clientSignature === null ||
      clientSignature === "" ||
      clientSignature === 0
    ) {
      newErrors["clientSignature"] = "missing value";
      hasErrors = true;
    }
    if (
      associateSignDate === undefined ||
      associateSignDate === null ||
      associateSignDate === "" ||
      associateSignDate === 0
    ) {
      newErrors["associateSignDate"] = "missing value";
      hasErrors = true;
    }
    if (
      associateSignature === undefined ||
      associateSignature === null ||
      associateSignature === "" ||
      associateSignature === 0
    ) {
      newErrors["associateSignature"] = "missing value";
      hasErrors = true;
    }

    if (hasErrors) {
      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      return;
    }

    let inv = { ...generateOrderInvoice };

    inv.invoiceLabourAmount = invoiceLabourAmount;
    inv.invoiceMaterialAmount = invoiceMaterialAmount;
    inv.invoiceOtherCostsAmount = invoiceOtherCostsAmount;
    inv.invoiceTaxAmount = invoiceTaxAmount;
    inv.invoiceTotalAmount = invoiceTotalAmount;
    inv.invoiceDepositAmount = invoiceDepositAmount;
    inv.invoiceAmountDue = invoiceAmountDue;
    inv.invoiceQuoteDays = invoiceQuoteDays;
    inv.associateTaxId = associateTaxId;
    inv.invoiceQuoteDate = new Date(invoiceQuoteDate).toISOString();
    inv.invoiceCustomersApproval = invoiceCustomersApproval;
    inv.line01Notes = line01Notes;
    inv.line02Notes = line02Notes;
    inv.dateClientPaidInvoice = new Date(dateClientPaidInvoice).toISOString();
    inv.paymentMethods = paymentMethods;
    inv.clientSignature = clientSignature;
    inv.associateSignDate = new Date(associateSignDate).toISOString();
    inv.associateSignature = associateSignature;

    console.log("Update generateOrderInvoice data:", inv);
    setGenerateOrderInvoice(inv);
    setForceURL("/a/financial/" + oid + "/invoice/generate/step-4");
  };

  ////
  //// API.
  ////

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
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 3 of 4</p>
            <progress class="progress is-success" value="75" max="100">
              75%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
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

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {order && (
                  <div className="container">
                    <FormInputField
                      label="Labour Amount"
                      name="invoiceLabourAmount"
                      placeholder=""
                      value={invoiceLabourAmount}
                      errorText={errors && errors.invoiceLabourAmount}
                      helpText=""
                      onChange={(e) => setInvoiceLabourAmount(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
                      label="Material Amount"
                      name="invoiceMaterialAmount"
                      placeholder=""
                      value={invoiceMaterialAmount}
                      errorText={errors && errors.invoiceMaterialAmount}
                      helpText=""
                      onChange={(e) => setInvoiceMaterialAmount(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
                      label="Other Costs"
                      name="invoiceOtherCostsAmount"
                      placeholder=""
                      value={invoiceOtherCostsAmount}
                      errorText={errors && errors.invoiceOtherCostsAmount}
                      helpText=""
                      onChange={(e) =>
                        setInvoiceOtherCostsAmount(e.target.value)
                      }
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
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
                      name="invoiceTaxAmount"
                      placeholder=""
                      value={invoiceTaxAmount}
                      errorText={errors && errors.invoiceTaxAmount}
                      helpText=""
                      onChange={(e) => setInvoiceTaxAmount(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
                      label="Total"
                      name="invoiceTotalAmount"
                      placeholder=""
                      value={invoiceTotalAmount}
                      errorText={errors && errors.invoiceTotalAmount}
                      helpText=""
                      onChange={(e) => setInvoiceTotalAmount(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
                      label="Deposit"
                      name="invoiceDepositAmount"
                      placeholder=""
                      value={invoiceDepositAmount}
                      errorText={errors && errors.invoiceDepositAmount}
                      helpText=""
                      onChange={(e) => setInvoiceDepositAmount(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormInputField
                      label="Amount Due"
                      name="invoiceAmountDue"
                      placeholder=""
                      value={invoiceAmountDue}
                      errorText={errors && errors.invoiceAmountDue}
                      helpText=""
                      onChange={(e) => setInvoiceAmountDue(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      disabled={true}
                    />

                    <FormSelectField
                      label="This quote is valid for the following number of days:"
                      name="invoiceQuoteDays"
                      placeholder=""
                      options={ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS}
                      selectedValue={invoiceQuoteDays}
                      onChange={(e) => setInvoiceQuoteDays(e.target.value)}
                      helpText={``}
                      maxWidth="120px"
                    />

                    <FormInputField
                      label="Associate Tax ID"
                      name="associateTaxId"
                      placeholder=""
                      value={associateTaxId}
                      errorText={errors && errors.associateTaxId}
                      helpText=""
                      onChange={(e) => setAssociateTaxId(e.target.value)}
                      isRequired={true}
                      maxWidth="120px"
                      helpText=""
                      type="text"
                      disabled={true}
                    />

                    <FormAlternateDateField
                      label="Date of Quote Approval"
                      name="invoiceQuoteDate"
                      placeholder="Text input"
                      value={invoiceQuoteDate}
                      errorText={errors && errors.invoiceQuoteDate}
                      helpText=""
                      onChange={(date) => setInvoiceQuoteDate(date)}
                      isRequired={true}
                      maxWidth="180px"
                      helpText=""
                    />

                    <FormRadioField
                      label="Customer Approval"
                      name="invoiceCustomersApproval"
                      value={invoiceCustomersApproval}
                      errorText={errors && errors.invoiceCustomersApproval}
                      opt1Value="Signature"
                      opt1Label="Signature"
                      opt2Value="Verbal"
                      opt2Label="Verbal"
                      opt3Value="Written"
                      opt3Label="Written"
                      onChange={(e) =>
                        setInvoiceCustomersApproval(e.target.value)
                      }
                    />

                    <FormTextareaField
                      label="Line 01 - Notes or Extras (Optional)"
                      name="line01Notes"
                      placeholder="Text input"
                      value={line01Notes}
                      errorText={errors && errors.line01Notes}
                      helpText=""
                      onChange={(e) => setLine01Notes(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Max 638 characters"}
                      rows={4}
                    />

                    <FormTextareaField
                      label="Line 02 - Notes or Extras (Optional)"
                      name="line02Notes"
                      placeholder="Text input"
                      value={line02Notes}
                      errorText={errors && errors.line02Notes}
                      helpText=""
                      onChange={(e) => setLine02Notes(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Max 638 characters"}
                      rows={4}
                    />

                    <FormAlternateDateField
                      label="Date client paid invoice"
                      name="dateClientPaidInvoice"
                      value={dateClientPaidInvoice}
                      errorText={errors && errors.dateClientPaidInvoice}
                      helpText=""
                      onChange={(date) => setDateClientPaidInvoice(date)}
                      isRequired={true}
                      maxWidth="180px"
                      helpText=""
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
                      label="Client Signature upon completion"
                      name="clientSignature"
                      placeholder=""
                      value={clientSignature}
                      errorText={errors && errors.clientSignature}
                      helpText=""
                      onChange={(e) => setClientSignature(e.target.value)}
                      isRequired={true}
                      maxWidth="250px"
                      helpText="If the client's partner or legal representitive is signing on behalf of the client, please write their full name here, else leave the text as is."
                      type="text"
                    />

                    <FormAlternateDateField
                      label="Associate Signature Date"
                      name="associateSignDate"
                      value={associateSignDate}
                      errorText={errors && errors.associateSignDate}
                      helpText=""
                      onChange={(date) => setAssociateSignDate(date)}
                      isRequired={true}
                      maxWidth="180px"
                      helpText=""
                    />

                    <FormInputField
                      label="Associate Signature upon completion"
                      name="associateSignature"
                      placeholder=""
                      value={associateSignature}
                      errorText={errors && errors.associateSignature}
                      helpText=""
                      onChange={(e) => setAssociateSignature(e.target.value)}
                      isRequired={true}
                      maxWidth="250px"
                      helpText="If the associate is being represented by their business partner or other legal representitive then please write their full name here, else leave the text as is."
                      type="text"
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/a/financial/${oid}/invoice/generate/step-2`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 2
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSaveAndNextClick}
                          className="button is-primary is-fullwidth-mobile"
                        >
                          Save & Next&nbsp;
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

export default AssociateFinancialGenerateInvoiceStep3;
