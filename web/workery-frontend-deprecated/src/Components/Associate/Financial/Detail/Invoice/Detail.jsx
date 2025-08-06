import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudDownload,
  faArrowRight,
  faHome,
  faTags,
  faEnvelope,
  faTable,
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
import { NumericFormat } from "react-number-format";

import deepClone from "../../../../../Helpers/deepCloneUtility";
import { getOrderDetailAPI } from "../../../../../API/Order";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
import OrderStatusFormatter from "../../../../Reusable/SpecificPage/Order/StatusFormatter";
import MultiSelectTextFormatter from "../../../../Reusable/EveryPage/MultiSelectTextFormatter";
import OrderTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import TaskItemUpdateURLPathFormatter from "../../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  orderDetailState,
  GENERATE_INVOICE_STATE_DEFAULT,
  generateOrderInvoiceState,
  regenerateOrderInvoiceState,
} from "../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../../Constants/FieldOptions";
import { getAPIBaseURL } from "../../../../../Helpers/urlUtility";
import {
  getAccessTokenFromLocalStorage,
  attachAxiosRefreshTokenHandler,
} from "../../../../../Helpers/jwtUtility";
import { WORKERY_ORDER_INVOICE_DOWNLOAD_PDF_API_URL } from "../../../../../Constants/API";

function AssociateFinancialInvoiceDetail() {
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
  const [regenerateOrderInvoice, setRegenerateOrderInvoice] = useRecoilState(
    regenerateOrderInvoiceState,
  );
  const [order, setOrder] = useRecoilState(orderDetailState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  const onGenerateInvoiceClick = (e) => {
    console.log("Former generateOrderInvoice data:", generateOrderInvoice);
    let inv = { ...GENERATE_INVOICE_STATE_DEFAULT };

    // Step 1.
    inv.invoiceId = oid;
    inv.invoiceDate = order.invoiceDate;
    inv.associateName = order.associateName;
    inv.associatePhone = order.associatePhone;
    inv.associateTaxId = order.associateTaxId;
    inv.customerName = order.customerName;
    inv.customerAddress = order.customerFullAddressWithoutPostalCode;
    inv.customerPhone = order.customerPhone;
    inv.customerEmail = order.customerEmail;

    // Step 2.
    inv.line01Quantity = order.line01Quantity;
    inv.line01Description = order.line01Description;
    inv.line01UnitPrice = order.line01UnitPrice;
    inv.line01Amount = order.line01Amount;
    inv.line02Quantity = order.line02Quantity;
    inv.line02Description = order.line02Description;
    inv.line02UnitPrice = order.line02UnitPrice;
    inv.line02Amount = order.line02Amount;
    inv.line03Quantity = order.line03Quantity;
    inv.line03Description = order.line03Description;
    inv.line03UnitPrice = order.line03UnitPrice;
    inv.line03Amount = order.line03Amount;
    inv.line04Quantity = order.line04Quantity;
    inv.line04Description = order.line04Description;
    inv.line04UnitPrice = order.line04UnitPrice;
    inv.line04Amount = order.line04Amount;
    inv.line05Quantity = order.line05Quantity;
    inv.line05Description = order.line05Description;
    inv.line05UnitPrice = order.line05UnitPrice;
    inv.line05Amount = order.line05Amount;
    inv.line06Quantity = order.line06Quantity;
    inv.line06Description = order.line06Description;
    inv.line06UnitPrice = order.line06UnitPrice;
    inv.line06Amount = order.line06Amount;
    inv.line07Quantity = order.line07Quantity;
    inv.line07Description = order.line07Description;
    inv.line07UnitPrice = order.line07UnitPrice;
    inv.line07Amount = order.line07Amount;
    inv.line08Quantity = order.line08Quantity;
    inv.line08Description = order.line08Description;
    inv.line08UnitPrice = order.line08UnitPrice;
    inv.line08Amount = order.line08Amount;
    inv.line09Quantity = order.line09Quantity;
    inv.line09Description = order.line09Description;
    inv.line09UnitPrice = order.line09UnitPrice;
    inv.line09Amount = order.line09Amount;
    inv.line10Quantity = order.line10Quantity;
    inv.line10Description = order.line10Description;
    inv.line10UnitPrice = order.line10UnitPrice;
    inv.line10Amount = order.line10Amount;
    inv.line11Quantity = order.line11Quantity;
    inv.line11Description = order.line11Description;
    inv.line11UnitPrice = order.line11UnitPrice;
    inv.line11Amount = order.line11Amount;
    inv.line12Quantity = order.line12Quantity;
    inv.line12Description = order.line12Description;
    inv.line12UnitPrice = order.line12UnitPrice;
    inv.line12Amount = order.line12Amount;
    inv.line13Quantity = order.line13Quantity;
    inv.line13Description = order.line13Description;
    inv.line13UnitPrice = order.line13UnitPrice;
    inv.line13Amount = order.line13Amount;
    inv.line14Quantity = order.line14Quantity;
    inv.line14Description = order.line14Description;
    inv.line14UnitPrice = order.line14UnitPrice;
    inv.line14Amount = order.line14Amount;
    inv.line15Quantity = order.line15Quantity;
    inv.line15Description = order.line15Description;
    inv.line15UnitPrice = order.line15UnitPrice;
    inv.line15Amount = order.line15Amount;

    // Step 3
    inv.invoiceLabourAmount = order.invoiceLabourAmount;
    inv.invoiceMaterialAmount = order.invoiceMaterialAmount;
    inv.invoiceOtherCostsAmount = order.invoiceOtherCostsAmount;
    inv.invoiceTaxAmount = order.invoiceTaxAmount;
    inv.invoiceTotalAmount = order.invoiceTotalAmount;
    inv.invoiceDepositAmount = order.invoiceDepositAmount;
    inv.invoiceAmountDue = order.invoiceAmountDue;
    inv.invoiceQuoteDays = 30; // (Default value = 30days)
    inv.associateTaxId = order.associateTaxId;
    inv.invoiceQuoteDate = order.completionDate;
    inv.invoiceCustomersApproval = "Signature"; // Hard-coded value.
    inv.line01Notes = order.line01Notes;
    inv.line02Notes = order.line02Notes;
    inv.dateClientPaidInvoice = order.completionDate;
    inv.cash = order.cash;
    inv.cheque = order.cheque;
    inv.debit = order.debit;
    inv.credit = order.credit;
    inv.other = order.other;
    inv.paymentMethods = order.paymentMethods;
    inv.clientSignature = order.customerName;
    inv.associateSignDate = order.completionDate;
    inv.associateSignature = order.associateName;

    console.log("New generateOrderInvoice data:", inv);
    setGenerateOrderInvoice(inv);
    setForceURL("/a/financial/" + oid + "/invoice/generate/step-1");
  };

  const onRegenerateInvoiceClick = (e) => {
    console.log("onRegenerateInvoiceClick | order.invoice:", order.invoice);
    const payload = deepClone(order.invoice); // Make a copy of the read-only data.

    // Step 1 bugfix.
    payload.invoiceId = oid;
    payload.invoiceDate = payload.invoiceDate;
    payload.associateName = payload.associateName;
    payload.associatePhone = payload.associatePhone;
    payload.associateTaxId = payload.associateTaxId;
    payload.customerName = payload.clientName;
    payload.customerAddress = payload.clientAddress;
    payload.customerPhone = payload.clientPhone;
    payload.customerEmail = payload.clientEmail;

    // Step 2 bugfix.
    payload.line01Quantity = payload.line01Qty;
    payload.line01Description = payload.line01Desc;
    payload.line01UnitPrice = payload.line01Price;
    payload.line01Amount = payload.line01Amount;
    payload.line02Quantity = payload.line02Qty;
    payload.line02Description = payload.line02Desc;
    payload.line02UnitPrice = payload.line02Price;
    payload.line02Amount = payload.line02Amount;
    payload.line03Quantity = payload.line03Qty;
    payload.line03Description = payload.line03Desc;
    payload.line03UnitPrice = payload.line03Price;
    payload.line03Amount = payload.line03Amount;
    payload.line04Quantity = payload.line04Qty;
    payload.line04Description = payload.line04Desc;
    payload.line04UnitPrice = payload.line04Price;
    payload.line04Amount = payload.line04Amount;
    payload.line05Quantity = payload.line05Qty;
    payload.line05Description = payload.line05Desc;
    payload.line05UnitPrice = payload.line05Price;
    payload.line05Amount = payload.line05Amount;
    payload.line06Quantity = payload.line06Qty;
    payload.line06Description = payload.line06Desc;
    payload.line06UnitPrice = payload.line06Price;
    payload.line06Amount = payload.line06Amount;
    payload.line07Quantity = payload.line07Qty;
    payload.line07Description = payload.line07Desc;
    payload.line07UnitPrice = payload.line07Price;
    payload.line07Amount = payload.line07Amount;
    payload.line08Quantity = payload.line08Qty;
    payload.line08Description = payload.line08Desc;
    payload.line08UnitPrice = payload.line08Price;
    payload.line08Amount = payload.line08Amount;
    payload.line09Quantity = payload.line09Qty;
    payload.line09Description = payload.line09Desc;
    payload.line09UnitPrice = payload.line09Price;
    payload.line09Amount = payload.line09Amount;
    payload.line10Quantity = payload.line10Qty;
    payload.line10Description = payload.line10Desc;
    payload.line10UnitPrice = payload.line10Price;
    payload.line10Amount = payload.line10Amount;
    payload.line11Quantity = payload.line11Qty;
    payload.line11Description = payload.line11Desc;
    payload.line11UnitPrice = payload.line11Price;
    payload.line11Amount = payload.line11Amount;
    payload.line12Quantity = payload.line12Qty;
    payload.line12Description = payload.line12Desc;
    payload.line12UnitPrice = payload.line12Price;
    payload.line12Amount = payload.line12Amount;
    payload.line13Quantity = payload.line13Qty;
    payload.line13Description = payload.line13Desc;
    payload.line13UnitPrice = payload.line13Price;
    payload.line13Amount = payload.line13Amount;
    payload.line14Quantity = payload.line14Qty;
    payload.line14Description = payload.line14Desc;
    payload.line14UnitPrice = payload.line14Price;
    payload.line14Amount = payload.line14Amount;
    payload.line15Quantity = payload.line15Qty;
    payload.line15Description = payload.line15Desc;
    payload.line15UnitPrice = payload.line15Price;
    payload.line15Amount = payload.line15Amount;

    // Step 3 bugfix.
    payload.invoiceLabourAmount = payload.totalLabour;
    payload.invoiceMaterialAmount = payload.totalMaterials;
    payload.invoiceOtherCostsAmount = payload.otherCosts;
    payload.invoiceTaxAmount = payload.tax;
    payload.invoiceTotalAmount = payload.total;
    payload.invoiceDepositAmount = payload.deposit;
    payload.invoiceAmountDue = payload.amountDue;
    // payload.invoiceQuoteDays = 30; // (Default value = 30days)
    // payload.associateTaxId = payload.associateTaxId;
    // payload.invoiceQuoteDate = payload.completionDate;
    // payload.invoiceCustomersApproval = "Signature"; // Hard-coded value.
    // payload.line01Notes = payload.line01Notes;
    // payload.line02Notes = payload.line02Notes;
    // payload.dateClientPaidInvoice = payload.completionDate;
    // payload.cash = payload.cash;
    // payload.cheque = payload.cheque;
    // payload.debit = payload.debit;
    // payload.credit = payload.credit;
    // payload.other = payload.other;
    // payload.paymentMethods = payload.paymentMethods;
    // payload.clientSignature = payload.customerName;
    // payload.associateSignDate = payload.completionDate;
    // payload.associateSignature = payload.associateName;

    setRegenerateOrderInvoice(payload);
    setGenerateOrderInvoice(payload);
    console.log(
      "onRegenerateInvoiceClick | regenerateOrderInvoice:",
      regenerateOrderInvoice,
    );

    console.log("onRegenerateInvoiceClick | Redirecting...");
    setForceURL("/a/financial/" + oid + "/invoice/generate/step-1");
  };

  /**
   *  The following function will request from the server our PDF invoice
   *  file and receive the data from the API web service.
   */
  const performDownloadPDF = (e) => {
    // IMPORTANT: THIS IS THE ONLY WAY WE CAN GET THE ACCESS TOKEN.
    const accessToken = getAccessTokenFromLocalStorage();

    // Generate our app's Axios instance.
    // Create a new Axios instance which will be sending and receiving in
    // blob (binary data) format. Special thanks to the following URL:
    // https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
    const customAxios = axios.create({
      baseURL: getAPIBaseURL(),
      headers: {
        Authorization: "JWT " + accessToken,
        "Content-Type": "application/octet-stream;",
        Accept: "application/octet-stream",
      },
      responseType: "blob", // important
    });

    // Attach our Axios "refesh token" interceptor.
    attachAxiosRefreshTokenHandler(customAxios);

    const aURL = WORKERY_ORDER_INVOICE_DOWNLOAD_PDF_API_URL.replace("XXX", oid);

    customAxios
      .get(aURL)
      .then((successResponse) => {
        // SUCCESS
        this.onSuccessPDFDownloadCallback(successResponse);
      })
      .catch((exception) => {
        // ERROR
        if (exception.response) {
          const responseData = exception.response.data; // <=--- NOTE: https://github.com/axios/axios/issues/960
          console.log("pullOrderInvoice | error:", responseData); // For debuggin purposes only.
        }
      })
      .then(() => {
        // FINALLY
        // Do nothing.
      });
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
            className="breadcrumb has-background-light p-4 is-hidden-touch"
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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(Invoice)
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light p-4 is-hidden-desktop"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to={`/a/financials`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Financials
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
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
                  </p>
                </div>
                <div className="column has-text-right">
                  {order.invoice !== undefined &&
                  order.invoice !== null &&
                  order.invoice !== "" ? (
                    <>
                      <Link
                        onClick={onRegenerateInvoiceClick}
                        className="button is-small is-warning is-fullwidth-mobile"
                      >
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit & Regenerate Invoice
                      </Link>
                      &nbsp;
                      <Link
                        className="button is-small is-success is-fullwidth-mobile"
                        to={order.invoice.fileObjectUrl}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faCloudDownload}
                        />
                        &nbsp;Download Invoice
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        onClick={onGenerateInvoiceClick}
                        className="button is-small is-primary is-small is-fullwidth-mobile"
                      >
                        <FontAwesomeIcon className="fas" icon={faPlus} />
                        &nbsp;Generate Invoice
                      </Link>
                    </>
                  )}
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
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile is-size-6-tablet">
                      <ul>
                        <li>
                          <Link to={`/a/financial/${oid}`}>Detail</Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>Invoice</strong>
                          </Link>
                        </li>
                        {/*
                                            <li>
                                                <Link to={`/a/financial/${oid}/more`}>More&nbsp;&nbsp;<FontAwesomeIcon className="mdi" icon={faEllipsis} /></Link>
                                            </li>
                                            */}
                      </ul>
                    </div>

                    {order.invoice !== undefined &&
                    order.invoice !== null &&
                    order.invoice !== "" ? (
                      <>
                        <table
                          className="table is-fullwidth"
                          key={`id-${oid}-invoice-table-header`}
                        >
                          <thead>
                            <tr className="has-background-black">
                              <th className="has-text-white" colSpan="2">
                                Invoice Header
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Order #
                              </th>
                              <td>{order.wjid}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Invoice Date
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={order.invoice.invoiceDate}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Associate Name
                              </th>
                              <td>{order.invoice.associateName}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Associate Phone
                              </th>
                              <td>
                                <PhoneTextFormatter
                                  value={order.invoice.associatePhone}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Associate Tax #
                              </th>
                              <td>
                                {order.invoice.associateTaxId
                                  ? order.invoice.associateTaxId
                                  : "-"}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Client Name
                              </th>
                              <td>{order.invoice.clientName}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Client Address
                              </th>
                              <td>
                                <URLTextFormatter
                                  urlKey={
                                    order.customerFullAddressWithoutPostalCode
                                  }
                                  urlValue={order.customerFullAddressUrl}
                                  type={`external`}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Client Phone Number (
                                {
                                  CLIENT_PHONE_TYPE_OF_MAP[
                                    order.customerPhoneType
                                  ]
                                }
                                ):
                              </th>
                              <td>
                                <PhoneTextFormatter
                                  value={order.customerPhone}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Client Email:
                              </th>
                              <td>
                                <EmailTextFormatter
                                  value={order.customerEmail}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table
                          className="table is-fullwidth"
                          key={`id-${oid}-invoice-table-description`}
                        >
                          <thead>
                            <tr className="has-background-black">
                              <th className="has-text-white" colSpan="2">
                                Invoice Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Invoice IDs
                              </th>
                              <td>{order.invoiceIds}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Order #
                              </th>
                              <td>{order.wjid}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Line 01
                              </th>
                              <td>
                                {order.invoice.line01Qty > 0 && (
                                  <>
                                    <b>Quantity:</b> x{order.invoice.line01Qty}
                                    <br />
                                    <b>Description:</b>{" "}
                                    {order.invoice.line01Desc}
                                    <br />
                                    <b>Price:</b>{" "}
                                    <NumericFormat
                                      value={order.invoice.line01Price}
                                      displayType={"text"}
                                      thousandSeparator={true}
                                      prefix={"$"}
                                    />
                                    <br />
                                    <b>Amount:</b>{" "}
                                    <NumericFormat
                                      value={order.invoice.line01Amount}
                                      displayType={"text"}
                                      thousandSeparator={true}
                                      prefix={"$"}
                                    />
                                  </>
                                )}
                              </td>
                            </tr>
                            {order.invoice.line02Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 02
                                </th>
                                <td>
                                  {order.invoice.line02Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line02Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line02Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line02Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line02Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line03Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 03
                                </th>
                                <td>
                                  {order.invoice.line03Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line03Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line03Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line03Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line03Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line04Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 04
                                </th>
                                <td>
                                  {order.invoice.line04Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line04Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line04Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line04Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line04Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line05Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 05
                                </th>
                                <td>
                                  {order.invoice.line05Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line05Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line05Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line05Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line05Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line06Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 06
                                </th>
                                <td>
                                  {order.invoice.line06Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line06Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line06Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line06Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line06Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line07Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 07
                                </th>
                                <td>
                                  {order.invoice.line07Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line07Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line07Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line07Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line07Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line08Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 08
                                </th>
                                <td>
                                  {order.invoice.line08Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line08Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line08Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line08Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line08Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line09Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 09
                                </th>
                                <td>
                                  {order.invoice.line09Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line09Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line09Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line09Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line09Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line10Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 10
                                </th>
                                <td>
                                  {order.invoice.line10Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line10Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line10Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line10Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line10Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line11Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 11
                                </th>
                                <td>
                                  {order.invoice.line11Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line11Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line11Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line11Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line11Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line12Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 12
                                </th>
                                <td>
                                  {order.invoice.line12Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line12Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line12Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line12Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line12Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line13Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 13
                                </th>
                                <td>
                                  {order.invoice.line13Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line13Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line13Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line13Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line13Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line14Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 14
                                </th>
                                <td>
                                  {order.invoice.line14Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line14Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line14Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line14Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line14Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            {order.invoice.line15Qty > 0 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Line 15
                                </th>
                                <td>
                                  {order.invoice.line15Qty > 0 && (
                                    <>
                                      <b>Quantity:</b> x
                                      {order.invoice.line15Qty}
                                      <br />
                                      <b>Description:</b>{" "}
                                      {order.invoice.line15Desc}
                                      <br />
                                      <b>Price:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line15Price}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                      <br />
                                      <b>Amount:</b>{" "}
                                      <NumericFormat
                                        value={order.invoice.line15Amount}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                      />
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Deposit
                              </th>
                              {order.invoice.deposit ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.deposit}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Labour
                              </th>
                              {order.invoice.totalLabour ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.totalLabour}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Materials
                              </th>
                              {order.invoice.totalMaterials ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.totalMaterials}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Other Costs
                              </th>
                              {order.invoice.otherCosts ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.otherCosts}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Total Tax
                              </th>
                              {order.invoice.tax ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.tax}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Total
                              </th>
                              {order.invoice.total ? (
                                <td>
                                  <NumericFormat
                                    value={order.invoice.total}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Date of Quote Approval
                              </th>
                              {order.invoice.invoiceQuoteDate ? (
                                <td>
                                  <DateTextFormatter
                                    value={order.invoice.invoiceQuoteDate}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Customer Approval
                              </th>
                              {order.invoice.invoiceCustomersApproval ? (
                                <td>
                                  {order.invoice.invoiceCustomersApproval}
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Line 01 - Notes or Extras
                              </th>
                              {order.invoice.line01Notes ? (
                                <td>{order.invoice.line01Notes}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Line 02 - Notes or Extras
                              </th>
                              {order.invoice.line02Notes ? (
                                <td>{order.invoice.line02Notes}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Date client paid invoice
                              </th>
                              {order.invoice.invoiceQuoteDate ? (
                                <td>
                                  <DateTextFormatter
                                    value={order.invoice.invoiceQuoteDate}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Payment Method(s)
                              </th>
                              <td>
                                <MultiSelectTextFormatter
                                  selectedValues={order.invoice.paymentMethods}
                                  options={
                                    ORDER_INVOICE_PAYMENT_METHODS_OPTIONS
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Client Signature upon completion
                              </th>
                              {order.invoice.clientSignature ? (
                                <td>{order.invoice.clientSignature}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Associate Signature Date
                              </th>
                              {order.invoice.associateSignDate ? (
                                <td>
                                  <DateTextFormatter
                                    value={order.invoice.associateSignDate}
                                  />
                                </td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Associate Signature
                              </th>
                              {order.invoice.associateSignature ? (
                                <td>{order.invoice.associateSignature}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                          </tbody>
                        </table>

                        <table
                          className="table is-fullwidth"
                          key={`id-${oid}-invoice-table-created`}
                        >
                          <thead>
                            <tr className="has-background-black">
                              <th className="has-text-white" colSpan="2">
                                System
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Order #
                              </th>
                              <td>{order.wjid}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Created At
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={order.invoice.createdAt}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Created By
                              </th>
                              {order.invoice.createdByUserName ? (
                                <td>{order.invoice.createdByUserName}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Modified At
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={order.invoice.modifiedAt}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Modified By
                              </th>
                              {order.invoice.modifiedByUserName ? (
                                <td>{order.invoice.modifiedByUserName}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Revision Version
                              </th>
                              {order.invoice.revisionVersion ? (
                                <td>{order.invoice.revisionVersion}</td>
                              ) : (
                                <td>-</td>
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <>
                        <section className="hero is-medium has-background-white-ter">
                          <div className="hero-body">
                            <p className="title">
                              <FontAwesomeIcon className="fas" icon={faTable} />
                              &nbsp;No Invoice
                            </p>
                            <p className="subtitle">
                              No invoice has been created, as a result you will
                              need to create it before you are able to download
                              the PDF copy of it..{" "}
                              <b>
                                <Link onClick={onGenerateInvoiceClick}>
                                  Click here&nbsp;
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faArrowRight}
                                  />
                                </Link>
                              </b>{" "}
                              to get started creating the invoice for this
                              order.
                            </p>
                          </div>
                        </section>
                      </>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/a/financials`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Financials
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        {order.invoice !== undefined &&
                        order.invoice !== null &&
                        order.invoice !== "" ? (
                          <>
                            {/*
                            <button
                              onClick={performDownloadPDF}
                              className="button is-success is-fullwidth-mobile"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FontAwesomeIcon
                                className="fas"
                                icon={faCloudDownload}
                              />
                              &nbsp;Download Invoice
                            </button>
                            */}
                            <Link
                              className="button is-warning is-fullwidth-mobile"
                              onClick={onRegenerateInvoiceClick}
                            >
                              <FontAwesomeIcon
                                className="fas"
                                icon={faPencil}
                              />
                              &nbsp;Edit & Regenerate Invoice
                            </Link>
                            &nbsp;
                            <Link
                              className="button is-success is-fullwidth-mobile"
                              to={order.invoice.fileObjectUrl}
                            >
                              <FontAwesomeIcon
                                className="fas"
                                icon={faCloudDownload}
                              />
                              &nbsp;Download Invoice
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              onClick={onGenerateInvoiceClick}
                              className="button is-primary is-fullwidth-mobile"
                            >
                              <FontAwesomeIcon className="fas" icon={faPlus} />
                              &nbsp;Generate Invoice
                            </Link>
                          </>
                        )}
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

export default AssociateFinancialInvoiceDetail;
