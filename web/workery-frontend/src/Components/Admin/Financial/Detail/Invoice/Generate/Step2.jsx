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
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
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

function AdminFinancialGenerateInvoiceStep2() {
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

  const [line01Quantity, setLine01Quantity] = useState(
    generateOrderInvoice.line01Quantity,
  );
  const [line01Description, setLine01Description] = useState(
    generateOrderInvoice.line01Description,
  );
  const [line01UnitPrice, setLine01UnitPrice] = useState(
    generateOrderInvoice.line01UnitPrice,
  );
  const [line01Amount, setLine01Amount] = useState(
    generateOrderInvoice.line01Amount,
  );
  const [line02Quantity, setLine02Quantity] = useState(
    generateOrderInvoice.line02Quantity,
  );
  const [line02Description, setLine02Description] = useState(
    generateOrderInvoice.line02Description,
  );
  const [line02UnitPrice, setLine02UnitPrice] = useState(
    generateOrderInvoice.line02UnitPrice,
  );
  const [line02Amount, setLine02Amount] = useState(
    generateOrderInvoice.line02Amount,
  );
  const [line03Quantity, setLine03Quantity] = useState(
    generateOrderInvoice.line03Quantity,
  );
  const [line03Description, setLine03Description] = useState(
    generateOrderInvoice.line03Description,
  );
  const [line03UnitPrice, setLine03UnitPrice] = useState(
    generateOrderInvoice.line03UnitPrice,
  );
  const [line03Amount, setLine03Amount] = useState(
    generateOrderInvoice.line03Amount,
  );
  const [line04Quantity, setLine04Quantity] = useState(
    generateOrderInvoice.line04Quantity,
  );
  const [line04Description, setLine04Description] = useState(
    generateOrderInvoice.line04Description,
  );
  const [line04UnitPrice, setLine04UnitPrice] = useState(
    generateOrderInvoice.line04UnitPrice,
  );
  const [line04Amount, setLine04Amount] = useState(
    generateOrderInvoice.line04Amount,
  );
  const [line05Quantity, setLine05Quantity] = useState(
    generateOrderInvoice.line05Quantity,
  );
  const [line05Description, setLine05Description] = useState(
    generateOrderInvoice.line05Description,
  );
  const [line05UnitPrice, setLine05UnitPrice] = useState(
    generateOrderInvoice.line05UnitPrice,
  );
  const [line05Amount, setLine05Amount] = useState(
    generateOrderInvoice.line05Amount,
  );
  const [line06Quantity, setLine06Quantity] = useState(
    generateOrderInvoice.line06Quantity,
  );
  const [line06Description, setLine06Description] = useState(
    generateOrderInvoice.line06Description,
  );
  const [line06UnitPrice, setLine06UnitPrice] = useState(
    generateOrderInvoice.line06UnitPrice,
  );
  const [line06Amount, setLine06Amount] = useState(
    generateOrderInvoice.line06Amount,
  );
  const [line07Quantity, setLine07Quantity] = useState(
    generateOrderInvoice.line07Quantity,
  );
  const [line07Description, setLine07Description] = useState(
    generateOrderInvoice.line07Description,
  );
  const [line07UnitPrice, setLine07UnitPrice] = useState(
    generateOrderInvoice.line07UnitPrice,
  );
  const [line07Amount, setLine07Amount] = useState(
    generateOrderInvoice.line07Amount,
  );
  const [line08Quantity, setLine08Quantity] = useState(
    generateOrderInvoice.line08Quantity,
  );
  const [line08Description, setLine08Description] = useState(
    generateOrderInvoice.line08Description,
  );
  const [line08UnitPrice, setLine08UnitPrice] = useState(
    generateOrderInvoice.line08UnitPrice,
  );
  const [line08Amount, setLine08Amount] = useState(
    generateOrderInvoice.line08Amount,
  );
  const [line09Quantity, setLine09Quantity] = useState(
    generateOrderInvoice.line09Quantity,
  );
  const [line09Description, setLine09Description] = useState(
    generateOrderInvoice.line09Description,
  );
  const [line09UnitPrice, setLine09UnitPrice] = useState(
    generateOrderInvoice.line09UnitPrice,
  );
  const [line09Amount, setLine09Amount] = useState(
    generateOrderInvoice.line09Amount,
  );
  const [line10Quantity, setLine10Quantity] = useState(
    generateOrderInvoice.line10Quantity,
  );
  const [line10Description, setLine10Description] = useState(
    generateOrderInvoice.line10Description,
  );
  const [line10UnitPrice, setLine10UnitPrice] = useState(
    generateOrderInvoice.line10UnitPrice,
  );
  const [line10Amount, setLine10Amount] = useState(
    generateOrderInvoice.line10Amount,
  );
  const [line11Quantity, setLine11Quantity] = useState(
    generateOrderInvoice.line11Quantity,
  );
  const [line11Description, setLine11Description] = useState(
    generateOrderInvoice.line11Description,
  );
  const [line11UnitPrice, setLine11UnitPrice] = useState(
    generateOrderInvoice.line11UnitPrice,
  );
  const [line11Amount, setLine11Amount] = useState(
    generateOrderInvoice.line11Amount,
  );
  const [line12Quantity, setLine12Quantity] = useState(
    generateOrderInvoice.line12Quantity,
  );
  const [line12Description, setLine12Description] = useState(
    generateOrderInvoice.line12Description,
  );
  const [line12UnitPrice, setLine12UnitPrice] = useState(
    generateOrderInvoice.line12UnitPrice,
  );
  const [line12Amount, setLine12Amount] = useState(
    generateOrderInvoice.line12Amount,
  );
  const [line13Quantity, setLine13Quantity] = useState(
    generateOrderInvoice.line13Quantity,
  );
  const [line13Description, setLine13Description] = useState(
    generateOrderInvoice.line13Description,
  );
  const [line13UnitPrice, setLine13UnitPrice] = useState(
    generateOrderInvoice.line13UnitPrice,
  );
  const [line13Amount, setLine13Amount] = useState(
    generateOrderInvoice.line13Amount,
  );
  const [line14Quantity, setLine14Quantity] = useState(
    generateOrderInvoice.line14Quantity,
  );
  const [line14Description, setLine14Description] = useState(
    generateOrderInvoice.line14Description,
  );
  const [line14UnitPrice, setLine14UnitPrice] = useState(
    generateOrderInvoice.line14UnitPrice,
  );
  const [line14Amount, setLine14Amount] = useState(
    generateOrderInvoice.line14Amount,
  );
  const [line15Quantity, setLine15Quantity] = useState(
    generateOrderInvoice.line15Quantity,
  );
  const [line15Description, setLine15Description] = useState(
    generateOrderInvoice.line15Description,
  );
  const [line15UnitPrice, setLine15UnitPrice] = useState(
    generateOrderInvoice.line15UnitPrice,
  );
  const [line15Amount, setLine15Amount] = useState(
    generateOrderInvoice.line15Amount,
  );

  ////
  //// Event handling.
  ////

  const onSaveAndNextClick = (e) => {
    console.log("Former generateOrderInvoice data:", generateOrderInvoice);
    let newErrors = {};
    let hasErrors = false;

    if (line01Quantity === undefined || line01Quantity === null || line01Quantity === "" || line01Quantity === 0) {
      newErrors["line01Quantity"] = "missing value";
      hasErrors = true;
    }
    if (line01Description === undefined || line01Description === "" || line01Description === null) {
      newErrors["line01Description"] = "missing value";
      hasErrors = true;
    }
    if (line01UnitPrice === undefined || line01UnitPrice === null || line01UnitPrice === "" || line01UnitPrice === 0) {
      newErrors["line01UnitPrice"] = "missing value";
      hasErrors = true;
    }
    if (line01Amount === undefined || line01Amount === null || line01Amount === "" || line01Amount === 0) {
      newErrors["line01Amount"] = "missing value";
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

    inv.line01Quantity = line01Quantity;
    inv.line01Description = line01Description;
    inv.line01UnitPrice = line01UnitPrice;
    inv.line01Amount = line01Amount;

    inv.line02Quantity = line02Quantity;
    inv.line02Description = line02Description;
    inv.line02UnitPrice = line02UnitPrice;
    inv.line02Amount = line02Amount;

    inv.line03Quantity = line03Quantity;
    inv.line03Description = line03Description;
    inv.line03UnitPrice = line03UnitPrice;
    inv.line03Amount = line03Amount;

    inv.line04Quantity = line04Quantity;
    inv.line04Description = line04Description;
    inv.line04UnitPrice = line04UnitPrice;
    inv.line04Amount = line04Amount;

    inv.line05Quantity = line05Quantity;
    inv.line05Description = line05Description;
    inv.line05UnitPrice = line05UnitPrice;
    inv.line05Amount = line05Amount;

    inv.line06Quantity = line06Quantity;
    inv.line06Description = line06Description;
    inv.line06UnitPrice = line06UnitPrice;
    inv.line06Amount = line06Amount;

    inv.line07Quantity = line07Quantity;
    inv.line07Description = line07Description;
    inv.line07UnitPrice = line07UnitPrice;
    inv.line07Amount = line07Amount;

    inv.line08Quantity = line08Quantity;
    inv.line08Description = line08Description;
    inv.line08UnitPrice = line08UnitPrice;
    inv.line08Amount = line08Amount;

    inv.line09Quantity = line09Quantity;
    inv.line09Description = line09Description;
    inv.line09UnitPrice = line09UnitPrice;
    inv.line09Amount = line09Amount;

    inv.line10Quantity = line10Quantity;
    inv.line10Description = line10Description;
    inv.line10UnitPrice = line10UnitPrice;
    inv.line10Amount = line10Amount;

    inv.line11Quantity = line11Quantity;
    inv.line11Description = line11Description;
    inv.line11UnitPrice = line11UnitPrice;
    inv.line11Amount = line11Amount;

    inv.line12Quantity = line12Quantity;
    inv.line12Description = line12Description;
    inv.line12UnitPrice = line12UnitPrice;
    inv.line12Amount = line12Amount;

    inv.line13Quantity = line13Quantity;
    inv.line13Description = line13Description;
    inv.line13UnitPrice = line13UnitPrice;
    inv.line13Amount = line13Amount;

    inv.line14Quantity = line14Quantity;
    inv.line14Description = line14Description;
    inv.line14UnitPrice = line14UnitPrice;
    inv.line14Amount = line14Amount;

    inv.line15Quantity = line15Quantity;
    inv.line15Description = line15Description;
    inv.line15UnitPrice = line15UnitPrice;
    inv.line15Amount = line15Amount;

    console.log("Update generateOrderInvoice data:", inv);
    setGenerateOrderInvoice(inv);
    setForceURL("/admin/financial/" + oid + "/invoice/generate/step-3");
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
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  aria-current="page"
                >
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
                <Link to={`/admin/financial/${oid}`} aria-current="page">
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
            <p className="subtitle is-5">Step 2 of 4</p>
            <progress class="progress is-success" value="50" max="100">
              50%
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
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <p className="pb-4">
                  Please fill out all the required fields before submitting this
                  form.
                </p>

                <FormErrorBox errors={errors} />

                <p className="title is-5 mt-2">
                  <u>Line 01</u>
                </p>

                {order && (
                  <div className="container">
                    <FormInputField
                      label="Line 01 Quantity"
                      name="line01Quantity"
                      value={line01Quantity}
                      errorText={errors && errors.line01Quantity}
                      helpText=""
                      onChange={(e) => {
                          setLine01Quantity(e.target.value);
                          try {
                              const totalAmount = parseFloat(e.target.value) * line01UnitPrice;
                              if (!isNaN(totalAmount)) {
                                  setLine01Amount(totalAmount);
                              }
                          } catch (e) {
                              setLine01Amount(0);
                          }
                      }}
                      isRequired={true}
                      maxWidth="150px"
                      helpText=""
                    />
                    <FormTextareaField
                      label="Line 01 Description"
                      name="line01Description"
                      placeholder="Text input"
                      value={line01Description}
                      errorText={errors && errors.line01Description}
                      helpText=""
                      onChange={(e) => setLine01Description(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Max 638 characters"}
                      rows={4}
                    />
                    <FormInputField
                      label="Line 01 Unit Price"
                      name="line01UnitPrice"
                      value={line01UnitPrice}
                      errorText={errors && errors.line01UnitPrice}
                      helpText=""
                      onChange={(e) => {
                          setLine01UnitPrice(e.target.value);
                          try {
                              const totalAmount = parseFloat(e.target.value) * line01Quantity;
                              if (!isNaN(totalAmount)) {
                                  setLine01Amount(totalAmount);
                              }
                          } catch (e) {
                              setLine01Amount(0);
                          }
                      }}
                      isRequired={true}
                      maxWidth="150px"
                      helpText=""
                    />
                    <FormInputField
                      label="Line 01 Total Amount"
                      name="line01Amount"
                      value={line01Amount}
                      errorText={errors && errors.line01Amount}
                      onChange={(e) => setLine01Amount(e.target.value)}
                      isRequired={true}
                      maxWidth="150px"
                      helpText={<>This field is autopopulated when you answer the <strong>Line 01 Quantity</strong> and <strong>Line 01 Unit Price</strong> fields above.</>}
                      disabled={true}
                    />
                    {line01Quantity !== undefined &&
                      line01Quantity !== null &&
                      line01Quantity !== "" &&
                      line01Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 02</u>
                          </p>
                          <FormInputField
                            label="Line 02 Quantity"
                            name="line02Quantity"
                            value={line02Quantity}
                            errorText={errors && errors.line02Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine02Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line02UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine02Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine02Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 02 Description"
                            name="line02Description"
                            placeholder="Text input"
                            value={line02Description}
                            errorText={
                              errors && errors.limitSpecialline02Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine02Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 02 Unit Price"
                            name="line02UnitPrice"
                            value={line02UnitPrice}
                            errorText={errors && errors.line02UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine02UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line02Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine02Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine02Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 02 Total Amount"
                            name="line02Amount"
                            value={line02Amount}
                            errorText={errors && errors.line02Amount}
                            helpText=""
                            onChange={(e) => setLine02Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line02Quantity !== undefined &&
                      line02Quantity !== null &&
                      line02Quantity !== "" &&
                      line02Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 03</u>
                          </p>
                          <FormInputField
                            label="Line 03 Quantity"
                            name="line03Quantity"
                            value={line03Quantity}
                            errorText={errors && errors.line03Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine03Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line03UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine03Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine03Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 03 Description"
                            name="line03Description"
                            placeholder="Text input"
                            value={line03Description}
                            errorText={
                              errors && errors.limitSpecialline03Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine03Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 03 Unit Price"
                            name="line03UnitPrice"
                            value={line03UnitPrice}
                            errorText={errors && errors.line03UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine03UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line03Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine03Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine03Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 03 Total Amount"
                            name="line03Amount"
                            value={line03Amount}
                            errorText={errors && errors.line03Amount}
                            helpText=""
                            onChange={(e) => setLine03Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line03Quantity !== undefined &&
                      line03Quantity !== null &&
                      line03Quantity !== "" &&
                      line03Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 04</u>
                          </p>
                          <FormInputField
                            label="Line 04 Quantity"
                            name="line04Quantity"
                            value={line04Quantity}
                            errorText={errors && errors.line04Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine04Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line04UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine03Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine04Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 04 Description"
                            name="line04Description"
                            placeholder="Text input"
                            value={line04Description}
                            errorText={
                              errors && errors.limitSpecialline04Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine04Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 04 Unit Price"
                            name="line04UnitPrice"
                            value={line04UnitPrice}
                            errorText={errors && errors.line04UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine04UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line04Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine04Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine04Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 04 Total Amount"
                            name="line04Amount"
                            value={line04Amount}
                            errorText={errors && errors.line04Amount}
                            helpText=""
                            onChange={(e) => setLine04Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line04Quantity !== undefined &&
                      line04Quantity !== null &&
                      line04Quantity !== "" &&
                      line04Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 05</u>
                          </p>
                          <FormInputField
                            label="Line 05 Quantity"
                            name="line05Quantity"
                            value={line05Quantity}
                            errorText={errors && errors.line05Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine05Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line05UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine05Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine05Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 05 Description"
                            name="line05Description"
                            placeholder="Text input"
                            value={line05Description}
                            errorText={
                              errors && errors.limitSpecialline05Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine05Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 05 Unit Price"
                            name="line05UnitPrice"
                            value={line05UnitPrice}
                            errorText={errors && errors.line05UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine05UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line05Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine05Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine05Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 05 Total Amount"
                            name="line05Amount"
                            value={line05Amount}
                            errorText={errors && errors.line05Amount}
                            helpText=""
                            onChange={(e) => setLine05Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line05Quantity !== undefined &&
                      line05Quantity !== null &&
                      line05Quantity !== "" &&
                      line05Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 06</u>
                          </p>
                          <FormInputField
                            label="Line 06 Quantity"
                            name="line06Quantity"
                            value={line06Quantity}
                            errorText={errors && errors.line06Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine06Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line06UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine06Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine06Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 06 Description"
                            name="line06Description"
                            placeholder="Text input"
                            value={line06Description}
                            errorText={
                              errors && errors.limitSpecialline06Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine06Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 06 Unit Price"
                            name="line06UnitPrice"
                            value={line06UnitPrice}
                            errorText={errors && errors.line06UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine06UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line06Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine06Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine06Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 06 Total Amount"
                            name="line06Amount"
                            value={line06Amount}
                            errorText={errors && errors.line06Amount}
                            helpText=""
                            onChange={(e) => setLine06Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line06Quantity !== undefined &&
                      line06Quantity !== null &&
                      line06Quantity !== "" &&
                      line06Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 07</u>
                          </p>
                          <FormInputField
                            label="Line 07 Quantity"
                            name="line07Quantity"
                            value={line07Quantity}
                            errorText={errors && errors.line07Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine07Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line07UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine07Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine07Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 07 Description"
                            name="line07Description"
                            placeholder="Text input"
                            value={line07Description}
                            errorText={
                              errors && errors.limitSpecialline07Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine07Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 07 Unit Price"
                            name="line07UnitPrice"
                            value={line07UnitPrice}
                            errorText={errors && errors.line07UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine07UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line07Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine07Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine07Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 07 Total Amount"
                            name="line07Amount"
                            value={line07Amount}
                            errorText={errors && errors.line07Amount}
                            helpText=""
                            onChange={(e) => setLine07Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line07Quantity !== undefined &&
                      line07Quantity !== null &&
                      line07Quantity !== "" &&
                      line07Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 08</u>
                          </p>
                          <FormInputField
                            label="Line 08 Quantity"
                            name="line08Quantity"
                            value={line08Quantity}
                            errorText={errors && errors.line08Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine08Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line08UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine08Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine08Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 08 Description"
                            name="line08Description"
                            placeholder="Text input"
                            value={line08Description}
                            errorText={
                              errors && errors.limitSpecialline08Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine08Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 08 Unit Price"
                            name="line08UnitPrice"
                            value={line08UnitPrice}
                            errorText={errors && errors.line08UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine08UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line08Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine08Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine08Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 08 Total Amount"
                            name="line08Amount"
                            value={line08Amount}
                            errorText={errors && errors.line08Amount}
                            helpText=""
                            onChange={(e) => setLine08Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line08Quantity !== undefined &&
                      line08Quantity !== null &&
                      line08Quantity !== "" &&
                      line08Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 09</u>
                          </p>
                          <FormInputField
                            label="Line 09 Quantity"
                            name="line09Quantity"
                            value={line09Quantity}
                            errorText={errors && errors.line09Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine09Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line09UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine09Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine09Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 09 Description"
                            name="line09Description"
                            placeholder="Text input"
                            value={line09Description}
                            errorText={
                              errors && errors.limitSpecialline09Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine09Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 09 Unit Price"
                            name="line09UnitPrice"
                            value={line09UnitPrice}
                            errorText={errors && errors.line09UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine09UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line09Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine09Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine09Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 09 Total Amount"
                            name="line09Amount"
                            value={line09Amount}
                            errorText={errors && errors.line09Amount}
                            helpText=""
                            onChange={(e) => setLine09Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line09Quantity !== undefined &&
                      line09Quantity !== null &&
                      line09Quantity !== "" &&
                      line09Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 10</u>
                          </p>
                          <FormInputField
                            label="Line 10 Quantity"
                            name="line10Quantity"
                            value={line10Quantity}
                            errorText={errors && errors.line10Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine10Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line10UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine10Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine10Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 10 Description"
                            name="line10Description"
                            placeholder="Text input"
                            value={line10Description}
                            errorText={
                              errors && errors.limitSpecialline10Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine10Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 10 Unit Price"
                            name="line10UnitPrice"
                            value={line10UnitPrice}
                            errorText={errors && errors.line10UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine10UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line10Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine10Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine10Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 10 Total Amount"
                            name="line10Amount"
                            value={line10Amount}
                            errorText={errors && errors.line10Amount}
                            helpText=""
                            onChange={(e) => setLine10Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line10Quantity !== undefined &&
                      line10Quantity !== null &&
                      line10Quantity !== "" &&
                      line10Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 11</u>
                          </p>
                          <FormInputField
                            label="Line 11 Quantity"
                            name="line11Quantity"
                            value={line11Quantity}
                            errorText={errors && errors.line11Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine11Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line11UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine11Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine11Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 11 Description"
                            name="line11Description"
                            placeholder="Text input"
                            value={line11Description}
                            errorText={
                              errors && errors.limitSpecialline11Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine11Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 11 Unit Price"
                            name="line11UnitPrice"
                            value={line11UnitPrice}
                            errorText={errors && errors.line11UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine11UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line11Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine11Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine11Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 11 Total Amount"
                            name="line11Amount"
                            value={line11Amount}
                            errorText={errors && errors.line11Amount}
                            helpText=""
                            onChange={(e) => setLine11Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line11Quantity !== undefined &&
                      line11Quantity !== null &&
                      line11Quantity !== "" &&
                      line11Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 12</u>
                          </p>
                          <FormInputField
                            label="Line 12 Quantity"
                            name="line12Quantity"
                            value={line12Quantity}
                            errorText={errors && errors.line12Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine12Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line12UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine12Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine12Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 12 Description"
                            name="line12Description"
                            placeholder="Text input"
                            value={line12Description}
                            errorText={
                              errors && errors.limitSpecialline12Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine12Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 12 Unit Price"
                            name="line12UnitPrice"
                            value={line12UnitPrice}
                            errorText={errors && errors.line12UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine12UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line12Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine12Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine12Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 12 Total Amount"
                            name="line12Amount"
                            value={line12Amount}
                            errorText={errors && errors.line12Amount}
                            helpText=""
                            onChange={(e) => setLine12Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line12Quantity !== undefined &&
                      line12Quantity !== null &&
                      line12Quantity !== "" &&
                      line12Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 13</u>
                          </p>
                          <FormInputField
                            label="Line 13 Quantity"
                            name="line13Quantity"
                            value={line13Quantity}
                            errorText={errors && errors.line13Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine13Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line13UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine13Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine13Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 13 Description"
                            name="line13Description"
                            placeholder="Text input"
                            value={line13Description}
                            errorText={
                              errors && errors.limitSpecialline13Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine13Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 13 Unit Price"
                            name="line13UnitPrice"
                            value={line13UnitPrice}
                            errorText={errors && errors.line13UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine13UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line13Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine13Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine13Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 13 Total Amount"
                            name="line13Amount"
                            value={line13Amount}
                            errorText={errors && errors.line13Amount}
                            helpText=""
                            onChange={(e) => setLine13Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line13Quantity !== undefined &&
                      line13Quantity !== null &&
                      line13Quantity !== "" &&
                      line13Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 14</u>
                          </p>
                          <FormInputField
                            label="Line 14 Quantity"
                            name="line14Quantity"
                            value={line14Quantity}
                            errorText={errors && errors.line14Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine14Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line14UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine14Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine14Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 14 Description"
                            name="line14Description"
                            placeholder="Text input"
                            value={line14Description}
                            errorText={
                              errors && errors.limitSpecialline14Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine14Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 14 Unit Price"
                            name="line14UnitPrice"
                            value={line14UnitPrice}
                            errorText={errors && errors.line14UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine14UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line14Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine14Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine14Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 14 Total Amount"
                            name="line14Amount"
                            value={line14Amount}
                            errorText={errors && errors.line14Amount}
                            helpText=""
                            onChange={(e) => setLine14Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}
                    {line14Quantity !== undefined &&
                      line14Quantity !== null &&
                      line14Quantity !== "" &&
                      line14Quantity !== 0 && (
                        <>
                          <hr />
                          <p className="title is-5 mt-2">
                            <u>Line 15</u>
                          </p>
                          <FormInputField
                            label="Line 15 Quantity"
                            name="line15Quantity"
                            value={line15Quantity}
                            errorText={errors && errors.line15Quantity}
                            helpText=""
                            onChange={(e) => {
                                setLine15Quantity(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line15UnitPrice;
                                    if (!isNaN(totalAmount)) {
                                        setLine15Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine15Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormTextareaField
                            label="Line 15 Description"
                            name="line15Description"
                            placeholder="Text input"
                            value={line15Description}
                            errorText={
                              errors && errors.limitSpecialline15Description
                            }
                            helpText=""
                            onChange={(e) =>
                              setLine15Description(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="280px"
                            helpText={"Max 638 characters"}
                            rows={4}
                          />
                          <FormInputField
                            label="Line 15 Unit Price"
                            name="line15UnitPrice"
                            value={line15UnitPrice}
                            errorText={errors && errors.line15UnitPrice}
                            helpText=""
                            onChange={(e) => {
                                setLine15UnitPrice(e.target.value);
                                try {
                                    const totalAmount = parseFloat(e.target.value) * line15Quantity;
                                    if (!isNaN(totalAmount)) {
                                        setLine15Amount(totalAmount);
                                    }
                                } catch (e) {
                                    setLine15Amount(0);
                                }
                            }}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                          />
                          <FormInputField
                            label="Line 15 Total Amount"
                            name="line15Amount"
                            value={line15Amount}
                            errorText={errors && errors.line15Amount}
                            helpText=""
                            onChange={(e) => setLine15Amount(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                            helpText=""
                            disabled={true}
                          />
                        </>
                      )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/financial/${oid}/invoice/generate/step-1`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 1
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSaveAndNextClick}
                          className="button is-primary is-fullwidth-mobile"
                          type="button"
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

export default AdminFinancialGenerateInvoiceStep2;
