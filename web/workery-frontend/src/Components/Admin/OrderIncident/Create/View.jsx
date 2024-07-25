import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faWrench,
  faGauge,
  faCircleInfo,
  faArrowUpRightFromSquare
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getOrderDetailAPI } from "../../../../API/Order";
import { postOrderIncidentCreateAPI } from "../../../../API/OrderIncident";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormInputField from "../../../Reusable/FormInputField";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../Constants/App";
import { addCustomerState } from "../../../../AppState";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../Constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../Constants/App";

function AdminOrderIncidentCreate() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setReasonOther] = useState("");
  const [orderId, setOrderId] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");

    // Make a copy of the read-only data in snake case format.
    const payload = {
      order_id: orderId,
      initiator: initiator,
      title: title,
      closing_reason: closingReason,
      closing_reason_other: closingReasonOther,
      start_date: startDate,
      description: description,
    };

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", payload);

    setFetching(false);
    setErrors({});
    postOrderIncidentCreateAPI(
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
    setTopAlertMessage("Incident created");
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
    setForceURL("/admin/incident/" + response.orderWjid + "/" + response.id);
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

      // setFetching(true);
      // getOrderDetailAPI(orderId, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
}, []);

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
              <li>
                <Link
                  to={`/admin/incidents`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faFire} />
                  &nbsp;Incidents
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
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
                <Link to={`/admin/incidents`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Incidents
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
            <FontAwesomeIcon className="fas" icon={faFire} />
            &nbsp;Incident
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {order && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faPlus} />
                    &nbsp;New Incident
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

                <FormInputField
                  label="Order ID #"
                  name="orderId"
                  type="number"
                  placeholder="Text input"
                  value={orderId}
                  errorText={errors && errors.orderId}
                  helpText={<>
                      <span>Please enter the order ID # of the incident you want to record. If you do not know the number then please look it up by&nbsp;<Link className="" to={`/admin/orders/search`} target="_blank"
                      rel="noreferrer">
                         clicking here&nbsp;<FontAwesomeIcon className="fas" icon={faArrowUpRightFromSquare} />
                       </Link></span>
                  </>}
                  onChange={(e) => setOrderId(e.target.value)}
                  isRequired={true}
                  maxWidth="180px"
                />

                <FormAlternateDateField
                  label="Start Date"
                  name="startDate"
                  placeholder="Text input"
                  value={startDate}
                  errorText={errors && errors.startDate}
                  helpText="Please enter the date this incident began."
                  onChange={(date) => setStartDate(date)}
                  isRequired={false}
                  maxWidth="187px"
                />

                <FormRadioField
                  label="Who initiated this incident?"
                  value={initiator}
                  opt1Value={ORDER_INCIDENT_INIATOR_CLIENT}
                  opt1Label="Client"
                  opt2Value={ORDER_INCIDENT_INIATOR_ASSOCIATE}
                  opt2Label="Associate"
                  opt3Value={ORDER_INCIDENT_INIATOR_STAFF}
                  opt3Label="Staff"
                  errorText={errors.initiator}
                  wasValidated={false}
                  helpText=""
                  onChange={(e) => setInitiator(parseInt(e.target.value))}
                />

                <FormInputField
                  label="Title"
                  name="title"
                  placeholder="Text input"
                  value={title}
                  errorText={errors && errors.title}
                  helpText=""
                  onChange={(e) => setTitle(e.target.value)}
                  isRequired={true}
                  maxWidth="380px"
                />

                <FormTextareaField
                  label="Description"
                  name="description"
                  placeholder="Describe here"
                  value={description}
                  errorText={errors && errors.description}
                  helpText="Describe the Incident"
                  onChange={(e) => setDescription(e.target.value)}
                  isRequired={true}
                  maxWidth="280px"
                  rows={5}
                />

                <FormSelectField
                  label="Closing Reason (Optional)"
                  name="closingReason"
                  placeholder="Pick"
                  selectedValue={closingReason}
                  errorText={errors && errors.closingReason}
                  helpText="If this incident was resolved, please select the closing reason for this incident."
                  onChange={(e) => setClosingReason(parseInt(e.target.value))}
                  options={ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS}
                />

                {closingReason === 1 && (
                  <FormTextareaField
                    label="Reason (Other)"
                    name="closingReasonOther"
                    placeholder="Text input"
                    value={closingReasonOther}
                    errorText={errors && errors.closingReasonOther}
                    helpText=""
                    onChange={(e) => setReasonOther(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                    rows={5}
                  />
                )}

                <div className="container">
                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-fullwidth-mobile"
                        to={`/admin/incidents`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Incidents
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-success is-fullwidth-mobile"
                        onClick={onSubmitClick}
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
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminOrderIncidentCreate;
