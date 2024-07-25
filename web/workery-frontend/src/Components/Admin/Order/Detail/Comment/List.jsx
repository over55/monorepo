import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
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
  faArrowRight,
  faFire
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import {
  getOrderDetailAPI,
  postOrderCreateCommentOperationAPI,
} from "../../../../../API/Order";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
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
import {
  topAlertMessageState,
  topAlertStatusState,
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

function AdminOrderCommentList() {
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
  const [content, setContent] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning..."); // Submit to the backend.
    console.log("onSubmitClick, content:", content);
    setErrors(null);
    postOrderCreateCommentOperationAPI(
      parseInt(oid),
      content,
      onUpdateSuccess,
      onUpdateError,
      onUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Details --- //

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

  // --- Update --- //

  function onUpdateSuccess(response) {
    console.log("onSuccess: Starting...");
    setOrder(response);
    setContent("");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Comment created");
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

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onUpdateError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onUpdateDone() {
    console.log("onDone: Starting...");
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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(Comments)
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
                    <FontAwesomeIcon className="fas" icon={faComment} />
                    &nbsp;Comments
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
                          <Link to={`/admin/order/${oid}/activity-sheets`}>
                            Summary
                          </Link>
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
                        <li className="is-active">
                          <Link>
                            <strong>Comments</strong>
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {order.comments && order.comments.length > 0 && (
                      <>
                        {order.comments.map(function (comment, i) {
                          console.log(comment); // For debugging purposes only.
                          return (
                            <div className="pb-3">
                              <span className="is-pulled-right has-text-grey-light">
                                {comment.createdByUserName} at{" "}
                                <b>
                                  <DateTimeTextFormatter
                                    value={comment.createdAt}
                                  />
                                </b>
                              </span>
                              <br />
                              <article className={`message ${comment.orderIncidentId !== undefined && comment.orderIncidentId !== null && comment.orderIncidentId !== "" && comment.orderIncidentId !== "000000000000000000000000" && "is-danger"}`}>
                                <div className="message-body">
                                  {comment.orderIncidentId !== undefined && comment.orderIncidentId !== null && comment.orderIncidentId !== "" && comment.orderIncidentId !== "000000000000000000000000" && <>
                                     <FontAwesomeIcon className="fas" icon={faFire} />&nbsp;
                                  </>}
                                  {comment.content}
                                  {comment.orderIncidentId !== undefined && comment.orderIncidentId !== null && comment.orderIncidentId !== "" && comment.orderIncidentId !== "000000000000000000000000" && <>
                                    <br />
                                    <Link
                                      className="is-pulled-right"
                                      to={`/admin/order/${oid}/more/incident/${comment.orderIncidentId }`}
                                    ><i>View incident&nbsp;<FontAwesomeIcon className="fas" icon={faArrowRight} /></i>
                                    </Link>
                                    <br />
                                  </>}
                                </div>
                              </article>
                            </div>
                          );
                        })}
                      </>
                    )}

                    <div className="has-background-success-light mt-4 block p-3">
                      <FormTextareaField
                        label="Write your comment here:"
                        name="content"
                        placeholder="Text input"
                        value={content}
                        errorText={errors && errors.content}
                        helpText=""
                        onChange={(e) => setContent(e.target.value)}
                        isRequired={true}
                        maxWidth="180px"
                      />
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
                          &nbsp;Save Comment
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

export default AdminOrderCommentList;
