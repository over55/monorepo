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
  faTable,
  faDownload,
  faPencil,
  faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getOrderDetailAPI } from "../../../../API/Order";
import { getOrderIncidentDetailAPI } from "../../../../API/OrderIncident";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormSelectField from "../../../Reusable/FormSelectField";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormInputField from "../../../Reusable/FormInputField";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState
} from "../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../Constants/App";
import { addCustomerState } from "../../../../AppState";
import { TASK_ITEM_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../Constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../Constants/App";
import AttachmentCreateModal from "./ModalNewAttachment";
import CommentCreateModal from "./ModalNewComment";
import OrderIncidentUpdateModal from "./ModalEditIncident";
import OrderIncidentCloseModal from "./ModalCloseIncident";


function AdminOrderIncidentDetail() {
  ////
  //// URL Parameters.
  ////

  const { oid, oiid } = useParams();

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
  const [incident, setIncident] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setReasonOther] = useState("");
  const [showCommentCreateModal, setShowCommentCreateModal] = useState(false);
  const [showAttachmentCreateModal, setShowAttachmentCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  ////
  //// Event handling.
  ////



  ////
  //// API.
  ////

  // --- Order --- //

  function onOrderSuccess(response) {
    console.log("onOrderSuccess: Starting...");
    setOrder(response);

    getOrderIncidentDetailAPI(oiid, onIncidentSuccess, onIncidentSuccess, onIncidentDone, onUnauthorized);
  }

  function onOrderError(apiErr) {
    console.log("onOrderError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOrderDone() {
    console.log("onOrderDone: Starting...");
    setFetching(false);
  }

  // --- Incident --- //

  function onIncidentSuccess(response) {
    console.log("onIncidentSuccess: Starting...");
    setIncident(response);
  }

  function onIncidentError(apiErr) {
    console.log("onIncidentError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onIncidentDone() {
    console.log("onIncidentDone: Starting...");
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
      getOrderDetailAPI(oid, onOrderSuccess, onOrderError, onOrderDone, onUnauthorized);
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
      {/* Page */}
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
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail
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
                    <>
                        <button
                          onClick={(e)=>{setShowCloseModal(true)}}
                          className="button is-danger is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faCircleExclamation} />
                          &nbsp;Close
                        </button>
                        &nbsp;
                    </>
                    <>
                        <button
                          onClick={(e)=>{setShowEditModal(true)}}
                          className="button is-warning is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </button>
                        &nbsp;
                    </>
                    <>
                        <button
                          onClick={(e)=>{setShowCommentCreateModal(true)}}
                          className="button is-dark is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPlus} />
                          &nbsp;New Comment
                        </button>
                        &nbsp;
                    </>
                    <>
                        <button
                          onClick={(e)=>{setShowAttachmentCreateModal(true)}}
                          className="button is-dark is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPlus} />
                          &nbsp;New Attachment
                        </button>
                        &nbsp;
                    </>
                </div>
              </div>
            )}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {/*
                <p className="pb-4">
                  Please fill out all the required fields before submitting this
                  form.
                </p>
                */}
                <FormErrorBox errors={errors} />
                {order && incident && (
                  <div className="container">

                    {/* Tab Navigation */}
                    {/*
                    <div className="tabs is-medium is-size-6-tablet is-size-7-mobile">
                      <ul>
                        <li className="is-active">
                          <Link>
                            <strong>Detail</strong>
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/order/${oid}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                      </ul>
                    </div>
                    */}

                    <table className="is-fullwidth table">
                        <thead>
                          <tr className="has-background-black">
                            <th className="has-text-white" colSpan="2">
                              Summary
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Client:
                            </th>
                            <td>
                              <URLTextFormatter
                                urlKey={order.customerName}
                                urlValue={`/admin/client/${order.customerId}`}
                                type={`external`}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate:
                            </th>
                            <td>
                              <URLTextFormatter
                                urlKey={order.associateName}
                                urlValue={`/admin/client/${order.associateId}`}
                                type={`external`}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Title:
                            </th>
                            <td>{incident.title}</td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Description:
                            </th>
                            <td>{incident.description}</td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              ID:
                            </th>
                            <td>
                              {incident.publicId}
                            </td>
                          </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={incident.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created by:
                          </th>
                          <td>{incident.createdByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created from:
                          </th>
                          <td>{incident.createdFromIpAddress}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={incident.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified by:
                          </th>
                          <td>{incident.modifiedByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified from:
                          </th>
                          <td>{incident.modifiedFromIpAddress}</td>
                        </tr>
                        </tbody>
                    </table>

                    <hr />

                    {/* FEED */}
                    <table className="is-fullwidth table">
                        <thead>
                          <tr className="has-background-black">
                            <th className="has-text-white" colSpan="2">
                               Feed
                            </th>
                          </tr>
                        </thead>
                    </table>

                    {incident.feed && incident.feed.length > 0 && (
                      <>
                        {incident.feed.map(function (datum, i) {

                          // console.log(datum); // For debugging purposes only.

                          if (datum.filetype !== undefined && datum.filetype !== null && datum.filetype !== "") {
                               return (
                                   <div className="pb-3">
                                     <span className="is-pulled-right has-text-grey-light">
                                       {datum.createdByUserName} at{" "}
                                       <b>
                                         <DateTimeTextFormatter
                                           value={datum.createdAt}
                                         />
                                       </b>
                                     </span>
                                     <br />
                                     <article className="message is-link">
                                       <div className="message-body">

                                         <a
                                           href={datum.objectUrl}
                                           target="_blank"
                                           rel="noreferrer"
                                           className=""
                                         >
                                           <FontAwesomeIcon className="mdi" icon={faDownload} />
                                           &nbsp;
                                           {datum.filename ? (
                                             <>{datum.filename}</>
                                           ) : (
                                             <>Download File</>
                                           )}
                                         </a>
                                       </div>
                                     </article>
                                   </div>
                               );
                          } else {
                              return (
                                <div className="pb-3">
                                  <span className="is-pulled-right has-text-grey-light">
                                    {datum.createdByUserName} at{" "}
                                    <b>
                                      <DateTimeTextFormatter
                                        value={datum.createdAt}
                                      />
                                    </b>
                                  </span>
                                  <br />
                                  <article className="message">
                                    <div className="message-body">
                                      {datum.content}
                                    </div>
                                  </article>
                                </div>
                              );
                          } // end Comment.

                        })}
                      </>
                    )}

                    {/* BOTTOM PAGE BUTTON NAVIGATION */}
                    <div className="columns pt-5">
                      <div className="column is-one-quarter">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/incidents`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Incidents
                        </Link>
                      </div>
                      <div className="column is-three-quarters has-text-right">
                          <>
                              <button
                                onClick={(e)=>{setShowCloseModal(true)}}
                                className="button is-danger is-fullwidth-mobile"
                                disabled={order.status === 2}
                              >
                                <FontAwesomeIcon className="fas" icon={faCircleExclamation} />
                                &nbsp;Close
                              </button>
                              &nbsp;
                          </>
                        <>
                            <button
                              onClick={(e)=>{setShowEditModal(true)}}
                              className="button is-warning is-fullwidth-mobile"
                              disabled={order.status === 2}
                            >
                              <FontAwesomeIcon className="fas" icon={faPencil} />
                              &nbsp;Edit
                            </button>
                            &nbsp;
                        </>
                        <>
                            <button
                              onClick={(e)=>{setShowCommentCreateModal(true)}}
                              className="button is-dark is-fullwidth-mobile"
                              disabled={order.status === 2}
                            >
                              <FontAwesomeIcon className="fas" icon={faPlus} />
                              &nbsp;New Comment
                            </button>
                            &nbsp;
                        </>
                        <>
                            <button
                              onClick={(e)=>{setShowAttachmentCreateModal(true)}}
                              className="button is-dark is-fullwidth-mobile"
                              disabled={order.status === 2}
                            >
                              <FontAwesomeIcon className="fas" icon={faPlus} />
                              &nbsp;New Attachment
                            </button>
                            &nbsp;
                        </>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </section>
      </div>

      {/* Modals */}
      <CommentCreateModal
        currentUser={currentUser}
        orderIncidentID={oiid}
        showModal={showCommentCreateModal}
        setShowModal={setShowCommentCreateModal}
        onCreated={(e) => {
          console.log("Refreshing page b/c of creation of comment");
          setFetching(true);
          getOrderIncidentDetailAPI(oiid, onIncidentSuccess, onIncidentSuccess, onIncidentDone, onUnauthorized);
          window.scrollTo(0, 0); // Start the page at the top of the page.
        }}
      />
      <AttachmentCreateModal
        currentUser={currentUser}
        orderID={oid}
        orderIncidentID={oiid}
        showModal={showAttachmentCreateModal}
        setShowModal={setShowAttachmentCreateModal}
        onCreated={(e) => {
          console.log("Refreshing page b/c of creation of attachment");
          setFetching(true);
          getOrderIncidentDetailAPI(oiid, onIncidentSuccess, onIncidentSuccess, onIncidentDone, onUnauthorized);
          window.scrollTo(0, 0); // Start the page at the top of the page.
        }}
      />
      {incident && <>
          <OrderIncidentUpdateModal
              currentUser={currentUser}
              orderID={oid}
              orderIncidentID={oiid}
              orderIncident={incident}
              showModal={showEditModal}
              setShowModal={setShowEditModal}
              onUpdated={(e) => {
                console.log("Refreshing page b/c of update of order incident");
                setFetching(true);
                getOrderIncidentDetailAPI(oiid, onIncidentSuccess, onIncidentSuccess, onIncidentDone, onUnauthorized);
                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
          />
          <OrderIncidentCloseModal
              currentUser={currentUser}
              orderID={oid}
              orderIncidentID={oiid}
              orderIncident={incident}
              showModal={showCloseModal}
              setShowModal={setShowCloseModal}
              onUpdated={(e) => {
                console.log("Refreshing page b/c of update of order incident");
                setFetching(true);
                getOrderIncidentDetailAPI(oiid, onIncidentSuccess, onIncidentSuccess, onIncidentDone, onUnauthorized);
                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
          />
      </>}
    </>
  );
}

export default AdminOrderIncidentDetail;
