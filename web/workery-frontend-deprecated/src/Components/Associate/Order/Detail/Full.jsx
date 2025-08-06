import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faChevronRight,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getOrderDetailAPI } from "../../../../API/Order";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import OrderStatusFormatter from "../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../Reusable/EveryPage/CheckboxTextFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import TaskItemUpdateURLPathFormatter from "../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../AppState";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
  ASSOCIATE_PHONE_TYPE_WORK,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_EXECUTIVE,
} from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../Constants/FieldOptions";

function AssociateOrderDetailFull() {
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
                <Link to="/a/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/a/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}
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
                <Link to="/a/orders" aria-current="page">
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
                  <p className="title is-one-quarter is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
                  </p>
                </div>
                <div className="column is-three-quarters has-text-right">
                  {/*
                {order && order.associatePublicId !== 0 &&
                    <>
                        <Link
                          to={`/a/order/${oid}/more/unassign`}
                          className="button is-dark is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faUserSlash} />
                          &nbsp;Unassign
                        </Link>
                        &nbsp;
                    </>
                }
                <Link
                  to={`/a/order/${oid}/more/close`}
                  className="button is-danger is-fullwidth-mobile"
                  disabled={order.status === 2}
                >
                  <FontAwesomeIcon className="fas" icon={faTimes} />
                  &nbsp;Close
                </Link>
                &nbsp;
                  <Link
                    to={`/a/order/${oid}/edit`}
                    className="button is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={order.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
                  </Link>
                  {(order.latestPendingTaskId && order.latestPendingTaskId !== "000000000000000000000000") && <>
                      &nbsp;
                      <Link
                        to={TaskItemUpdateURLPathFormatter(
                          order.latestPendingTaskId,
                          order.latestPendingTaskType,
                        )}
                        className="button  is-primary is-fullwidth-mobile"
                        disabled={order.status === 2}
                      >
                       Go to Task&nbsp;<FontAwesomeIcon className="fas" icon={faChevronRight} />
                      </Link>
                  </>}
                  {((order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID || order.status === ORDER_STATUS_COMPLETED_AND_PAID) && (currentUser.role === STAFF_TYPE_MANAGEMENT || currentUser.role === STAFF_TYPE_EXECUTIVE) ) && <>
                      &nbsp;
                      <Link
                        to={`/a/financial/${oid}`}
                        className="button is-link is-fullwidth-mobile"
                        disabled={order.status === 2}
                      >
                        Go to Financials&nbsp;<FontAwesomeIcon className="fas" icon={faChevronRight} />
                      </Link>
                  </>}
                  */}
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
                        <li className="is-active">
                          <Link to={`/a/order/${oid}`}>Summary</Link>
                        </li>
                        <li>
                          <Link>
                            <strong>Detail</strong>
                          </Link>
                        </li>
                        {/*
                        <li>
                          <Link to={`/a/order/${oid}/activity-sheets`}>
                            Activity Sheets
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/order/${oid}/tasks`}>Tasks</Link>
                        </li>
                        <li>
                          <Link to={`/a/order/${oid}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/order/${oid}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/order/${oid}/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                        */}
                      </ul>
                    </div>

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
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Client
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={order.customerName}
                              urlValue={`/a/client/${order.customerId}`}
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
                            {CLIENT_PHONE_TYPE_OF_MAP[order.customerPhoneType]}
                            ):
                          </th>
                          <td>
                            <PhoneTextFormatter value={order.customerPhone} />
                            {order.customerPhoneType ===
                              CLIENT_PHONE_TYPE_WORK && (
                              <>&nbsp;{order.customerPhoneExtension}</>
                            )}
                          </td>
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
                            Description
                          </th>
                          <td>{order.description}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Skill Sets
                          </th>
                          <td>
                            <SkillSetsTextFormatter
                              skillSets={order.skillSets}
                            />
                          </td>
                        </tr>
                        {order.associateId !== undefined &&
                          order.associateId !== null &&
                          order.associateId !== "" &&
                          order.associateId !== "000000000000000000000000" && (
                            <>
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Assigned Associate
                                </th>
                                <td>
                                  <URLTextFormatter
                                    urlKey={order.associateName}
                                    urlValue={`/a/associate/${order.associateId}`}
                                    type={`external`}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Associate Phone Number (
                                  {
                                    ASSOCIATE_PHONE_TYPE_OF_MAP[
                                      order.associatePhoneType
                                    ]
                                  }
                                  ):
                                </th>
                                <td>
                                  <PhoneTextFormatter
                                    value={order.associatePhone}
                                  />
                                  {order.associatePhoneType ===
                                    ASSOCIATE_PHONE_TYPE_WORK && (
                                    <>&nbsp;{order.associatePhoneExtension}</>
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Assignment Date
                                </th>
                                <td>
                                  <DateTextFormatter
                                    value={order.assignmentDate}
                                  />
                                </td>
                              </tr>
                            </>
                          )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Is Home Support Service
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={order.isHomeSupportService === 1}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Is ongoing?
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={order.isOngoing === 1}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Status
                          </th>
                          <td>
                            <OrderStatusFormatter value={order.status} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Start date
                          </th>
                          <td>
                            {order.startDate ? (
                              <DateTextFormatter value={order.startDate} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Completion date
                          </th>
                          <td>
                            {order.completionDate ? (
                              <DateTextFormatter value={order.completionDate} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Hours
                          </th>
                          <td>{order.hours}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Visits
                          </th>
                          <td>{order.visits}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Tag(s):
                          </th>
                          <td>
                            <TagsTextFormatter tags={order.tags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Required Task
                          </th>
                          {order.latestPendingTaskId &&
                          order.latestPendingTaskId !==
                            "000000000000000000000000" ? (
                            <td>
                              {order.latestPendingTaskDescription} Click the
                              following to being:{" "}
                              <URLTextFormatter
                                urlKey={order.latestPendingTaskTitle}
                                urlValue={TaskItemUpdateURLPathFormatter(
                                  order.latestPendingTaskId,
                                  order.latestPendingTaskType,
                                )}
                                type={`external`}
                              />
                            </td>
                          ) : (
                            <td>-</td>
                          )}
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                    <table className="table is-fullwidth">
                                        <thead>
                                            <tr className="has-background-black">
                                                <th className="has-text-white" colSpan="2">
                                                    Financial Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Date</th>
                                    			<td>
                                                    <DateTextFormatter value={order.invoiceDate} />
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice ID(s) #</th>
                                    			<td>
                                                    TODO
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Quote</th>
                                    			<td>
                                                    ${order.invoiceQuoteAmount}
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Labour</th>
                                    			<td>
                                                    ${order.invoiceLabourAmount}
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Material</th>
                                    			<td>
                                                    ${order.invoiceMaterialAmount}
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Total</th>
                                    			<td>
                                                    ${order.invoiceTotalAmount}
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Service Fee</th>
                                    			<td>
                                                    ${order.invoiceServiceFeeAmount}
                                                </td>
                                    		</tr>
                                            <tr>
                                    			<th className="has-background-light" style={{width: "30%"}}>Invoice Service Fee Payment Date</th>
                                    			<td>
                                                    <DateTextFormatter value={order.invoiceServiceFeePaymentDate} />
                                                </td>
                                    		</tr>
                                        </tbody>
                                    </table>
                                    */}

                    <table className="is-fullwidth table">
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
                            Created at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={order.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created by:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={order.createdByUserName}
                              urlValue={`/a/client/${order.createdByUserId}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created from:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={order.createdFromIpAddress}
                              urlValue={`https://whatismyipaddress.com/ip/${order.createdFromIpAddress}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={order.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified by:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={order.modifiedByUserName}
                              urlValue={`/a/client/${order.modifiedByUserId}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified from:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={order.modifiedFromIpAddress}
                              urlValue={`https://whatismyipaddress.com/ip/${order.modifiedFromIpAddress}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="columns pt-5">
                      <div className="column is-one-quarter">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/a/orders`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Orders
                        </Link>
                      </div>
                      <div className="column is-three-quarters has-text-right">
                        {/*
                        {order && order.associatePublicId !== 0 && (
                          <>
                            <Link
                              to={`/a/order/${oid}/more/unassign`}
                              className="button is-dark is-fullwidth-mobile"
                              disabled={order.status === 2}
                            >
                              <FontAwesomeIcon
                                className="fas"
                                icon={faUserSlash}
                              />
                              &nbsp;Unassign
                            </Link>
                            &nbsp;
                          </>
                        )}
                        <Link
                          to={`/a/order/${oid}/more/close`}
                          className="button is-danger is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faTimes} />
                          &nbsp;Close
                        </Link>
                        &nbsp;
                        <Link
                          to={`/a/order/${oid}/edit`}
                          className="button is-warning is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                        {order.latestPendingTaskId &&
                          order.latestPendingTaskId !==
                            "000000000000000000000000" && (
                            <>
                              &nbsp;
                              <Link
                                to={TaskItemUpdateURLPathFormatter(
                                  order.latestPendingTaskId,
                                  order.latestPendingTaskType,
                                )}
                                className="button is-primary is-fullwidth-mobile"
                                disabled={order.status === 2}
                              >
                                Go to Task&nbsp;
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faChevronRight}
                                />
                              </Link>
                            </>
                          )}
                        {(order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID ||
                          order.status === ORDER_STATUS_COMPLETED_AND_PAID) &&
                          (currentUser.role === STAFF_TYPE_MANAGEMENT ||
                            currentUser.role === STAFF_TYPE_EXECUTIVE) && (
                            <>
                              &nbsp;
                              <Link
                                to={`/a/financial/${oid}`}
                                className="button is-link is-fullwidth-mobile"
                                disabled={order.status === 2}
                              >
                                Go to Financials&nbsp;
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faChevronRight}
                                />
                              </Link>
                            </>
                          )}
                          */}
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

export default AssociateOrderDetailFull;
