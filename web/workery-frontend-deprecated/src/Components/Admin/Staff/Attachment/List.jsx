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
  faUserTie,
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

import { useParams } from "react-router-dom";
import {
  ATTACHMENT_STATES,
  PAGE_SIZE_OPTIONS,
} from "../../../../Constants/FieldOptions";

import { ATTACHMENT_TYPE_STAFF } from "../../../../Constants/App";
import { getStaffDetailAPI } from "../../../../API/Staff";
import { getAttachmentListAPI } from "../../../../API/Attachment";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import AdminStaffDetailAttachmentListDesktop from "./ListDektop";
import AdminStaffDetailAttachmentListMobile from "./ListMobile";

function AdminStaffDetailAttachmentList() {
  ////
  //// URL Parameters.
  ////

  const { aid } = useParams();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [staff, setStaff] = useState({});
  const [tabIndex, setTabIndex] = useState(1);
  const [attachments, setAttachments] = useState("");
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// Event handling.
  ////

  const fetchAttachmentList = (cur, staffID, limit) => {
    setFetching(true);
    setErrors({});

    let params = new Map();
    params.set("ownership_id", aid);
    params.set("ownership_role", ATTACHMENT_TYPE_STAFF);
    params.set("page_size", limit);
    if (cur !== "") {
      params.set("cursor", cur);
    }

    getAttachmentListAPI(
      params,
      onAttachmentListSuccess,
      onAttachmentListError,
      onAttachmentListDone,
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

  ////
  //// API.
  ////

  // Staff details.

  // --- Detail --- //

  function onStaffDetailSuccess(response) {
    console.log("onStaffDetailSuccess: Starting...");
    setStaff(response);
  }

  function onStaffDetailError(apiErr) {
    console.log("onStaffDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onStaffDetailDone() {
    console.log("onStaffDetailDone: Starting...");
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

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getStaffDetailAPI(
        aid,
        onStaffDetailSuccess,
        onStaffDetailError,
        onStaffDetailDone,
      );
      fetchAttachmentList(currentCursor, aid, pageSize);
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, aid, pageSize]);

  ////
  //// Component rendering.
  ////

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
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserTie} />
                  &nbsp;Staff
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
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Staff
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {staff && staff.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

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
              {staff && (
                <div className="column has-text-right">
                  <Link
                    to={`/admin/staff/${aid}/attachments/add`}
                    className="button is-success is-fullwidth-mobile"
                    type="button"
                    disabled={staff.status === 2}
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
                {staff && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/admin/staff/${aid}`}>Summary</Link>
                        </li>
                        <li>
                          <Link to={`/admin/staff/${aid}/detail`}>Detail</Link>
                        </li>
                        {/*
                                            <li>
                                                <Link to={`/admin/staff/${aid}/orders`}>Orders</Link>
                                            </li>
                                            */}
                        <li>
                          <Link to={`/admin/staff/${aid}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li className="is-active">
                          <Link to={`/admin/staff/${aid}/attachments`}>
                            <strong>Attachments</strong>
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/staff/${staff.id}/more`}>
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
                          <AdminStaffDetailAttachmentListDesktop
                            staffID={aid}
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
                          <AdminStaffDetailAttachmentListMobile
                            staffID={aid}
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
                            {staff.status !== 2 && (
                              <>
                                <b>
                                  <Link
                                    to={`/admin/staff/${aid}/attachments/add`}
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
                          to={`/admin/staff`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Staff
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/admin/staff/${aid}/attachments/add`}
                          className="button is-success is-fullwidth-mobile"
                          disabled={staff.status === 2}
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

export default AdminStaffDetailAttachmentList;
