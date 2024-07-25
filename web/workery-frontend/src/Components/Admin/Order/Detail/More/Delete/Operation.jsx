import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserSlash,
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
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import {
  getOrderDetailAPI,
  deleteOrderAPI,
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
import AlertBanner from "../../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import DashboardBubbleLink from "../../../../../Reusable/EveryPage/DashboardBubbleLink";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
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
  ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../../../Constants/FieldOptions";

function AdminOrderMoreDeleteOperation() {
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

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");

    setFetching(false);
    setErrors({});
    deleteOrderAPI(
      oid,
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
    setTopAlertMessage("Order unassigned");
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
    setForceURL("/admin/orders");
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
                  <FontAwesomeIcon className="fas" icon={faTrash} />
                  &nbsp;Delete
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
                    <FontAwesomeIcon className="fas" icon={faTrash} />
                    &nbsp;Delete Job - Are you sure?
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
                  You are about to permanently delete this job from workery system; it will no longer exist in our database and will impact reports / future auditing. This action can be undone. Are you sure you would like to continue?
                </p>

                <FormErrorBox errors={errors} />

                {order && (
                  <div className="container">

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
                          className="button is-danger is-fullwidth-mobile"
                          onClick={onSubmitClick}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;Confirm and Delete
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

export default AdminOrderMoreDeleteOperation;
