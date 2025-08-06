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
import FormPhoneField from "../../../../../Reusable/FormPhoneField";
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
} from "../../../../../../Constants/FieldOptions";

function AssociateFinancialGenerateInvoiceStep1() {
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
  const [invoiceId, setInvoiceId] = useState(generateOrderInvoice.invoiceId);
  const [invoiceDate, setInvoiceDate] = useState(
    generateOrderInvoice.invoiceDate,
  );
  const [associateName, setAssociateName] = useState(
    generateOrderInvoice.associateName,
  );
  const [associatePhone, setAssociatePhone] = useState(
    generateOrderInvoice.associatePhone,
  );
  const [associateTaxId, setAssociateTaxId] = useState(
    generateOrderInvoice.associateTaxId,
  );
  const [customerName, setCustomerName] = useState(
    generateOrderInvoice.customerName,
  );
  const [customerAddress, setCustomerAddress] = useState(
    generateOrderInvoice.customerAddress,
  );
  const [customerPhone, setCustomerPhone] = useState(
    generateOrderInvoice.customerPhone,
  );
  const [customerEmail, setCustomerEmail] = useState(
    generateOrderInvoice.customerEmail,
  );

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setOrder(response);
    if (response) {
      invoiceId = oid;
      invoiceDate = response.invoiceDate;
      associateName = response.associateName;
      associatePhone = response.associatePhone;
      associateTaxId = response.associateTaxId;
      customerName = response.customerName;
      customerAddress = response.customerFullAddressWithoutPostalCode;
      customerPhone = response.customerPhone;
      customerEmail = response.customerEmail;
    }
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
                <Link to="/c/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/c/financials" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;Financials
                </Link>
              </li>
              <li className="">
                <Link to={`/c/financial/${oid}/invoice`} aria-current="page">
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
                <Link to={`/c/financial/${oid}`} aria-current="page">
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
            <p className="subtitle is-5">Step 1 of 4</p>
            <progress class="progress is-success" value="25" max="100">
              25%
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
                      label="Invoice ID #"
                      name="invoiceId"
                      placeholder="Text input"
                      value={invoiceId}
                      errorText={errors && errors.invoiceId}
                      helpText=""
                      onChange={(e) => setInvoiceId(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="100px"
                      helpText="If you need to this values, please update the financials screen for this job."
                    />
                    <FormAlternateDateField
                      label="Invoice Date"
                      name="invoiceDate"
                      placeholder="Text input"
                      value={invoiceDate}
                      errorText={errors && errors.invoiceDate}
                      helpText=""
                      onChange={(date) => setInvoiceDate(date)}
                      isRequired={true}
                      maxWidth="180px"
                      disabled={true}
                      helpText="If you need to change this value, please update the financials screen for this job."
                    />
                    <FormInputField
                      label="Associate Name"
                      name="associateName"
                      placeholder="Text input"
                      value={associateName}
                      errorText={errors && errors.associateName}
                      helpText=""
                      onChange={(e) => setAssociateName(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="200px"
                      disabled={true}
                    />
                    <FormPhoneField
                      label="Phone"
                      name="associatePhone"
                      placeholder="Text input"
                      selectedCountry={"Canada"}
                      selectePhoneNumber={associatePhone}
                      errorText={errors && errors.associatePhone}
                      helpText=""
                      onChange={(ph) => setAssociatePhone(ph)}
                      isRequired={true}
                      maxWidth="160px"
                      disabled={true}
                    />
                    <FormInputField
                      label="Associate Tax ID"
                      name="associateTaxId"
                      placeholder="Text input"
                      value={associateTaxId}
                      errorText={errors && errors.associateTaxId}
                      helpText=""
                      onChange={(e) => setAssociateTaxId(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="200px"
                      disabled={true}
                    />
                    <FormInputField
                      label="Client Name"
                      name="customerName"
                      placeholder="Text input"
                      value={customerName}
                      errorText={errors && errors.customerName}
                      helpText=""
                      onChange={(e) => setCustomerName(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="200px"
                      disabled={true}
                    />
                    <FormInputField
                      label="Client Address"
                      name="customerAddress"
                      placeholder="Text input"
                      value={customerAddress}
                      errorText={errors && errors.customerAddress}
                      helpText=""
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="480px"
                      disabled={true}
                    />
                    <FormPhoneField
                      label="Client Phone"
                      name="customerPhone"
                      placeholder="Text input"
                      selectedCountry={"Canada"}
                      selectePhoneNumber={customerPhone}
                      errorText={errors && errors.customerPhone}
                      helpText=""
                      onChange={(ph) => setCustomerPhone(ph)}
                      isRequired={true}
                      maxWidth="160px"
                      disabled={true}
                    />
                    <FormInputField
                      label="Client Email"
                      name="customerEmail"
                      placeholder="Text input"
                      value={customerEmail}
                      errorText={errors && errors.customerEmail}
                      helpText=""
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      isRequired={true}
                      disabled={true}
                      maxWidth="200px"
                      disabled={true}
                    />
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile is-danger"
                          to={`/c/financial/${oid}/invoice`}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faTimesCircle}
                          />
                          &nbsp;Cancel
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/c/financial/${oid}/invoice/generate/step-2`}
                          className="button is-primary is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          Next&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowRight}
                          />
                        </Link>
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

export default AssociateFinancialGenerateInvoiceStep1;
