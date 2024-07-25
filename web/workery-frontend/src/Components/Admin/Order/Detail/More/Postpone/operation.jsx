import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faTimes,
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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import {
  getOrderDetailAPI,
  postOrderPostponeOperationAPI,
} from "../../../../../../API/Order";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormAlternateDateField from "../../../../../Reusable/FormAlternateDateField";
import AlertBanner from "../../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import DashboardBubbleLink from "../../../../../Reusable/EveryPage/DashboardBubbleLink";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  TASK_ITEM_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../../../../Constants/FieldOptions";

function AdminOrderMorePostponeOperation() {
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

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [describeTheComment, setDescribeTheComment] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (
      reason === undefined ||
      reason === null ||
      reason === "" ||
      reason === 0
    ) {
      newErrors["reason"] = "missing value";
      hasErrors = true;
    } else {
      if (reason === 1) {
        if (
          reasonOther === undefined ||
          reasonOther === null ||
          reasonOther === ""
        ) {
          newErrors["reasonOther"] = "missing value";
          hasErrors = true;
        }
      }
    }
    if (startDate === undefined || startDate === null || startDate === "") {
      newErrors["startDate"] = "missing value";
      hasErrors = true;
    }
    if (
      describeTheComment === undefined ||
      describeTheComment === null ||
      describeTheComment === ""
    ) {
      newErrors["describeTheComment"] = "missing value";
      hasErrors = true;
    }

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

    // Make a copy of the read-only data in snake case format.
    const payload = {
      order_id: order.id,
      reason: reason,
      reason_other: reasonOther,
      start_date: startDate,
      describe_the_comment: describeTheComment,
    };

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", payload);

    setFetching(false);
    setErrors({});
    postOrderPostponeOperationAPI(
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
    setTopAlertMessage("Order postponed");
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
    setForceURL("/admin/order/" + oid + "/more");
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
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faClock} />
                  &nbsp;Postpone
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
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to More
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
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Order
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
                    <FontAwesomeIcon className="fas" icon={faClock} />
                    &nbsp;Postpone
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

                {order && (
                  <div className="container">
                    <FormSelectField
                      label="Reason"
                      name="reason"
                      placeholder="Pick"
                      selectedValue={reason}
                      errorText={errors && errors.reason}
                      helpText=""
                      onChange={(e) => setReason(parseInt(e.target.value))}
                      options={
                        TASK_ITEM_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION
                      }
                    />

                    {reason === 1 && (
                      <FormTextareaField
                        label="Reason (Other)"
                        name="reasonOther"
                        placeholder="Text input"
                        value={reasonOther}
                        errorText={errors && errors.reasonOther}
                        helpText=""
                        onChange={(e) => setReasonOther(e.target.value)}
                        isRequired={true}
                        maxWidth="380px"
                        helpText={"Include any additional information here."}
                        rows={3}
                      />
                    )}

                    <FormAlternateDateField
                      label="Start Date"
                      name="startDate"
                      placeholder="Text input"
                      value={startDate}
                      errorText={errors && errors.startDate}
                      helpText=""
                      onChange={(date) => setStartDate(date)}
                      isRequired={false}
                      maxWidth="187px"
                    />

                    <FormTextareaField
                      label="Describe the comment"
                      name="describeTheComment"
                      placeholder="Describe here"
                      value={describeTheComment}
                      errorText={errors && errors.describeTheComment}
                      helpText=""
                      onChange={(e) => setDescribeTheComment(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Include any additional information here."}
                      rows={5}
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/order/${oid}/more`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to More
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
                )}
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminOrderMorePostponeOperation;
