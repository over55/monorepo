import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faArrowRight,
  faTable,
  faWrench,
  faPaperclip,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faHardHat,
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

import { getAssociateDetailAPI } from "../../../../../API/Associate";
import { getOrderListAPI } from "../../../../../API/Order";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../../Reusable/DataDisplayRowText";
import DataDisplayRowSelect from "../../../../Reusable/DataDisplayRowSelect";
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
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../Constants/FieldOptions";
import AssociateAssociateOrderListDesktop from "./ListDesktop";
import AssociateAssociateOrderListMobile from "./ListMobile";

function AssociateAssociateDetailOrderList() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();

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
  const [associate, setAssociate] = useState({});
  const [tabIndex, setTabIndex] = useState(1);
  const [orderList, setOrderList] = useState([]);

  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [sortByValue, setSortByValue] = useState("created_at,DESC"); // Sorting
  const [status, setStatus] = useState(0); // Filtering
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, s, j, custid) => {
    setFetching(true);
    setErrors({});

    let params = new Map();
    params.set("page_size", limit); // Pagination
    params.set("sort_field", "last_name"); // Sorting

    if (cur !== "") {
      // Pagination
      params.set("cursor", cur);
    }

    // DEVELOPERS NOTE: Our `sortByValue` is string with the sort field
    // and sort order combined with a comma seperation. Therefore we
    // need to split as follows.
    const sortArray = so.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    // Filtering
    if (keywords !== undefined && keywords !== null && keywords !== "") {
      // Searhcing
      params.set("search", keywords);
    }
    if (s !== undefined && s !== null && s !== "") {
      params.set("status", s);
    }
    if (j !== undefined && j !== null && j !== "") {
      const jStr = j.getTime();
      params.set("created_at_gte", jStr);
    }

    // Customer id.
    params.set("customer_id", cid);

    getOrderListAPI(
      params,
      onOrderListSuccess,
      onOrderListError,
      onOrderListDone,
      onUnauthorized,
    );
  };

  const onNextClicked = (e) => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  ////
  //// API.
  ////

  // --- Associate Detail --- //

  function onAssociateSuccess(response) {
    console.log("onAssociateSuccess: Starting...");
    console.log("onAssociateSuccess: response:", response);
    setAssociate(response);
  }

  function onAssociateError(apiErr) {
    console.log("onAssociateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateDone() {
    console.log("onAssociateDone: Starting...");
    setFetching(false);
  }

  // --- Order List --- //

  function onOrderListSuccess(response) {
    console.log("onOrderListSuccess: Starting...");
    console.log("onOrderListSuccess: response:", response);
    if (response.results !== null) {
      setOrderList(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onOrderListError(apiErr) {
    console.log("onOrderListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOrderListDone() {
    console.log("onOrderListDone: Starting...");
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
      getAssociateDetailAPI(
        cid,
        onAssociateSuccess,
        onAssociateError,
        onAssociateDone,
        onUnauthorized,
      );

      fetchList(
        currentCursor,
        pageSize,
        "",
        sortByValue,
        status,
        createdAtGTE,
        cid,
      );
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, sortByValue, status, createdAtGTE, cid]);

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
                <Link to="/c/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/c/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
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
                <Link to="/c/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Associates
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {associate && associate.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associate
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {associate && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faWrench} />
                    &nbsp;Orders
                  </p>
                </div>
                <div className="column has-text-right">
                  {/*
                  <Link
                    to={`/c/orders/add/step-2-from-launchpad?id=${associate && cid}&fn=${associate && associate.firstName}&ln=${associate && associate.lastName}`}
                    className="button is-success is-fullwidth-mobile"
                    type="button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon className="mdi" icon={faPlus} />
                    &nbsp;New&nbsp;
                    <FontAwesomeIcon
                      className="mdi"
                      icon={faArrowUpRightFromSquare}
                    />
                  </Link>
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

                {associate && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/c/associate/${cid}`}>Detail</Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>Orders</strong>
                          </Link>
                        </li>
                        {/*
                        <li>
                          <Link to={`/c/associate/${cid}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/c/associate/${cid}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/c/associate/${cid}/more`}>
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

                    {orderList &&
                    orderList.results &&
                    (orderList.results.length > 0 ||
                      previousCursors.length > 0) ? (
                      <div className="container">
                        {/*
                            ##################################################################
                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                            ##################################################################
                        */}
                        <div className="is-hidden-touch">
                          <AssociateAssociateOrderListDesktop
                            listData={orderList}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            sortByValue={sortByValue}
                          />
                        </div>

                        {/*
                            ###########################################################################
                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                            ###########################################################################
                        */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <AssociateAssociateOrderListMobile
                            listData={orderList}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                          />
                        </div>
                      </div>
                    ) : (
                      <section className="hero is-medium has-background-white-ter">
                        <div className="hero-body">
                          <p className="title">
                            <FontAwesomeIcon className="fas" icon={faTable} />
                            &nbsp;No Orders
                          </p>
                          <p className="subtitle">
                            No orders.{" "}
                            <b>
                              <Link
                                to={`/c/orders/add/step-2-from-launchpad?id=${associate && cid}&fn=${associate && associate.firstName}&ln=${associate && associate.lastName}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Click here&nbsp;
                                <FontAwesomeIcon
                                  className="mdi"
                                  icon={faArrowUpRightFromSquare}
                                />
                              </Link>
                            </b>{" "}
                            to get started creating your first job work order.
                          </p>
                        </div>
                      </section>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/c/associates`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Associates
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        {/*
                        <Link
                          className="button is-success is-fullwidth-mobile"
                          to={`/c/orders/add/step-2-from-launchpad?id=${associate && cid}&fn=${associate && associate.firstName}&ln=${associate && associate.lastName}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FontAwesomeIcon className="fas" icon={faPlus} />
                          &nbsp;New&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faArrowUpRightFromSquare}
                          />
                        </Link>
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

export default AssociateAssociateDetailOrderList;
