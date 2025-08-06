import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faArrowRight,
  faTrashCan,
  faArrowUpRightFromSquare,
  faFile,
  faDownload,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import {
  ATTACHMENT_STATES,
  PAGE_SIZE_OPTIONS,
} from "../../../../../Constants/FieldOptions";
import { ATTACHMENT_TYPE_ORDER } from "../../../../../Constants/App";
import { getOrderDetailAPI } from "../../../../../API/Order";
import {
  getAttachmentListAPI,
  deleteAttachmentAPI,
} from "../../../../../API/Attachment";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../Reusable/FormCheckboxField";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";
import AdminOrderDetailAttachmentListDesktop from "./ListDektop";
import AdminOrderDetailAttachmentListMobile from "./ListMobile";

function AdminOrderDetailAttachmentList() {
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
  const [order, setOrder] = useState(null);
  const [tabIndex, setTabIndex] = useState(1);
  const [attachments, setAttachments] = useState("");
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState("");
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// Event handling.
  ////

  const fetchAttachmentList = (cur, id, limit) => {
    setFetching(true);
    setErrors({});

    let params = new Map();
    params.set("ownership_id", id);
    params.set("ownership_role", ATTACHMENT_TYPE_ORDER);
    params.set("page_size", limit);
    if (cur !== "") {
      params.set("cursor", cur);
    }

    getAttachmentListAPI(
      params,
      onAttachmentListSuccess,
      onAttachmentListError,
      onAttachmentListDone,
      onUnauthorized,
    );
  };

  const onNextClicked = (e) => {
    console.log("onNextClicked");
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    console.log("onPreviousClicked");
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onSelectAttachmentForDeletion = (e, attachment) => {
    console.log("onSelectAttachmentForDeletion", attachment);
    setSelectedAttachmentForDeletion(attachment);
  };

  const onDeselectAttachmentForDeletion = (e) => {
    console.log("onDeselectAttachmentForDeletion");
    setSelectedAttachmentForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteAttachmentAPI(
      selectedAttachmentForDeletion.id,
      onAttachmentDeleteSuccess,
      onAttachmentDeleteError,
      onAttachmentDeleteDone,
      onUnauthorized,
    );
    setSelectedAttachmentForDeletion("");
  };

  ////
  //// API.
  ////

  // Order details.

  // --- Detail --- //

  function onOrderDetailSuccess(response) {
    console.log("onOrderDetailSuccess: Starting...");
    setOrder(response);
  }

  function onOrderDetailError(apiErr) {
    console.log("onOrderDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOrderDetailDone() {
    console.log("onOrderDetailDone: Starting...");
    setFetching(false);
  }

  // --- Attachment list --- //

  function onAttachmentListSuccess(response) {
    console.log("onAttachmentListSuccess: Starting...");
    if (response.results !== null) {
      setAttachments(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onAttachmentListError(apiErr) {
    console.log("onAttachmentListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAttachmentListDone() {
    console.log("onAttachmentListDone: Starting...");
    setFetching(false);
  }

  // --- Attachment delete --- //

  function onAttachmentDeleteSuccess(response) {
    console.log("onAttachmentDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Attachment deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchAttachmentList(currentCursor, oid, pageSize);
  }

  function onAttachmentDeleteError(apiErr) {
    console.log("onAttachmentDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onAttachmentDeleteError: topAlertMessage, topAlertStatus:",
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

  function onAttachmentDeleteDone() {
    console.log("onAttachmentDeleteDone: Starting...");
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
      if (!order) {
          getOrderDetailAPI(
            oid,
            onOrderDetailSuccess,
            onOrderDetailError,
            onOrderDetailDone,
            onUnauthorized,
          );
      }
      if (order) {
          fetchAttachmentList(currentCursor, order.id, pageSize);
      }
    }

    return () => {
      mounted = false;
    };
}, [currentCursor, oid, order, pageSize]);

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
                  &nbsp;Order&nbsp;#{oid} (Attachments)
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

          {/* Modal */}
          {/* None */}

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            <div className="columns">
              <div className="column">
                <p className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faFile} />
                  &nbsp;Attachments
                </p>
              </div>
              {order && (
                <div className="column has-text-right">
                  <Link
                    to={`/admin/order/${oid}/attachments/add`}
                    className="button is-success is-fullwidth-mobile"
                    type="button"
                    disabled={order.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPlus} />
                    &nbsp;New
                  </Link>
                </div>
              )}
            </div>

            <FormErrorBox errors={errors} />

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {order && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile is-size-6-tablet">
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
                        <li className="is-active">
                          <Link to={`/admin/order/${oid}/attachments`}>
                            <strong>Attachments</strong>
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

                    {!isFetching &&
                    attachments &&
                    attachments.results &&
                    (attachments.results.length > 0 ||
                      previousCursors.length > 0) ? (
                      <div className="container">
                        {/*
                                                ##################################################################
                                                EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                                                ##################################################################
                                            */}
                        <div className="is-hidden-touch">
                          <AdminOrderDetailAttachmentListDesktop
                            orderID={oid}
                            listData={attachments}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                          />
                        </div>

                        {/*
                                                ###########################################################################
                                                EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                                                ###########################################################################
                                            */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <AdminOrderDetailAttachmentListMobile
                            orderID={oid}
                            listData={attachments}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="container">
                        <article className="message is-dark">
                          <div className="message-body">
                            No attachments.{" "}
                            {order.status !== 2 && (
                              <>
                                <b>
                                  <Link
                                    to={`/admin/order/${oid}/attachments/add`}
                                  >
                                    Click here&nbsp;
                                    <FontAwesomeIcon
                                      className="mdi"
                                      icon={faArrowRight}
                                    />
                                  </Link>
                                </b>{" "}
                                to get started creating a new attachment.
                              </>
                            )}
                          </div>
                        </article>
                      </div>
                    )}

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
                        <Link
                          to={`/admin/order/${oid}/attachments/add`}
                          className="button is-success is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPlus} />
                          &nbsp;New
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

export default AdminOrderDetailAttachmentList;
