import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateBackward,
  faFileSignature,
  faExchangeAlt,
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
  postOrderTransferOperationAPI,
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
import {
  topAlertMessageState,
  topAlertStatusState,
  transferOrderOperationState,
  TRANSFER_ORDER_OPERATION_STATE_DEFAULT,
} from "../../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../../Constants/FieldOptions";

function AdminOrderMoreTransferOperationStep5() {
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
  const [transferOrderOperation, setTransferOrderOperation] = useRecoilState(
    transferOrderOperationState,
  );

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});
  const [tabIndex, setTabIndex] = useState(1);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    // Make a copy of the read-only data in snake case format.
    const payload = {
      // task_item_id: tid,
      order_id: order.id,
      client_id: transferOrderOperation.pickedClientID,
      associate_id: transferOrderOperation.pickedAssociateID,
    };

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", payload);

    setFetching(false);
    setErrors({});
    postOrderTransferOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
    );
  };

  ////
  //// API.
  ////

  // --- Operation --- //

  function onOperationSuccess(response) {
    console.log("onOperationSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Order transfered");
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
                  <FontAwesomeIcon className="fas" icon={faExchangeAlt} />
                  &nbsp;Transfer
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

          {/* Progress Wizard*/}
          <nav
            className={
              transferOrderOperation.pickedClientID === "" &&
              transferOrderOperation.pickedAssociateID === ""
                ? "box has-background-danger-light"
                : "box has-background-success-light"
            }
          >
            <p className="subtitle is-5">Step 5 of 5</p>
            <progress
              class={
                transferOrderOperation.pickedClientID === "" &&
                transferOrderOperation.pickedAssociateID === ""
                  ? "progress is-danger"
                  : "progress is-success"
              }
              value="100"
              max="100"
            >
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {order && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faFileSignature} />
                    &nbsp;Review
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            <p className="has-text-grey pb-4">
              Please review the following order summary table before submitting
              this order into the system.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {transferOrderOperation.pickedClientID === "" &&
                transferOrderOperation.pickedAssociateID === "" ? (
                  <>
                    <section className="hero is-medium has-background-white-ter">
                      <div className="hero-body">
                        <p className="title">
                          <FontAwesomeIcon className="fas" icon={faTable} />
                          &nbsp;No Transfer
                        </p>
                        <p className="subtitle">
                          Nothing to transfer.{" "}
                          <b>
                            <Link
                              to={`/admin/order/${oid}/more/transfer/step-1`}
                            >
                              Go back&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faArrowRotateBackward}
                              />
                            </Link>
                          </b>{" "}
                          to the beginning and please select customer or
                          associate to transfer this job to.
                        </p>
                      </div>
                    </section>
                  </>
                ) : (
                  <table className="is-fullwidth table">
                    <thead>
                      <tr className="has-background-black">
                        <th className="has-text-white" colSpan="2">
                          Job Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Job #
                        </th>
                        <td>{order.wjid}</td>
                      </tr>
                      {transferOrderOperation.pickedClientID !== "" && (
                        <>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Transfer to Client
                            </th>
                            <td>{transferOrderOperation.pickedClientName}</td>
                          </tr>
                        </>
                      )}
                      {transferOrderOperation.pickedAssociateID !== "" && (
                        <>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Transfer to Associate
                            </th>
                            <td>
                              {transferOrderOperation.pickedAssociateName}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                )}

                {order && (
                  <div className="container">
                    <div className="columns pt-5">
                      <div className="column is-half">
                        {transferOrderOperation.pickedClientID === "" &&
                        transferOrderOperation.pickedAssociateID === "" ? (
                          <Link
                            className="button is-medium is-fullwidth-mobile"
                            to={`/admin/order/${oid}/more/transfer/step-1`}
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowLeft}
                            />
                            &nbsp;Back to Step 1
                          </Link>
                        ) : (
                          <Link
                            className="button is-medium is-fullwidth-mobile"
                            to={`/admin/order/${oid}/more/transfer/step-4`}
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowLeft}
                            />
                            &nbsp;Back to Step 4
                          </Link>
                        )}
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

export default AdminOrderMoreTransferOperationStep5;
