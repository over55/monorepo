import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faExchangeAlt,
  faClock,
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

import { getOrderDetailAPI } from "../../../../../API/Order";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import DashboardBubbleLink from "../../../../Reusable/EveryPage/DashboardBubbleLink";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState
} from "../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../Constants/FieldOptions";

function AdminOrderMore() {
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

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});

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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(More)
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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Orders
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
                    <FontAwesomeIcon className="fas" icon={faEllipsis} />
                    &nbsp;More
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
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-6-tablet is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/admin/order/${oid}`}>Summary</Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/full`}>Detail</Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/activity-sheets`}>
                            Activity Sheets
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/tasks`}>Tasks</Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>
                              More&nbsp;&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faEllipsis}
                              />
                            </strong>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="columns is-vcentered is-multiline">
                      {order && order.associatePublicId !== 0 && <div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={`Unassign`}
                          subtitle={`Remove the current associate from this job.`}
                          faIcon={faUserSlash}
                          url={`/admin/order/${oid}/more/unassign`}
                          bgColour={`has-background-danger-dark`}
                        />
                      </div>}
                      <div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={`Close Job`}
                          subtitle={`Close this job for the time being.`}
                          faIcon={faTimes}
                          url={`/admin/order/${oid}/more/close`}
                          bgColour={`has-background-success-dark`}
                        />
                      </div>
                      <div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={`Postpone Job`}
                          subtitle={`Postpone this job for a certain amount of time.`}
                          faIcon={faClock}
                          url={`/admin/order/${oid}/more/postpone`}
                          bgColour={`has-background-info-dark`}
                        />
                      </div>
                      <div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={`Transfer Job`}
                          subtitle={`Transfer this job to client or associate.`}
                          faIcon={faExchangeAlt}
                          url={`/admin/order/${oid}/more/transfer/step-1`}
                          bgColour={`has-background-link-dark`}
                        />
                      </div>
                      {(currentUser && currentUser.role === 1 || currentUser.role === 2) &&<div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={`Delete Job`}
                          subtitle={`Permanently delete this job from the system.`}
                          faIcon={faTrash}
                          url={`/admin/order/${oid}/more/delete`}
                          bgColour={`has-background-dark`}
                        />
                      </div>}
                      <div className="column">
                        <DashboardBubbleLink
                          notificationCount={``}
                          title={<>Incidents <span class="tag is-success">NEW</span></>}
                          subtitle={`View or open any incidents with this order.`}
                          faIcon={faFire}
                          url={`/admin/order/${oid}/more/incidents`}
                          bgColour={`has-background-warning-dark`}
                        />
                      </div>
                    </div>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/orders`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Orders
                        </Link>
                      </div>
                      <div className="column is-half has-text-right"></div>
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

export default AdminOrderMore;
