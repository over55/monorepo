import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faEllipsis,
  faFilterCircleXmark,
  faArrowLeft,
  faWrench,
  faTachometer,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faGauge,
  faArrowRight,
  faTable,
  faArrowUpRightFromSquare,
  faRefresh,
  faFilter,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getTaskItemListAPI } from "../../../../../API/TaskItem";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  orderFilterStatusState,
  orderFilterTypeState,
  orderFilterSortState,
} from "../../../../../AppState";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../../Reusable/FormSelectField";
import FormDateField from "../../../../Reusable/FormDateField";
import BubbleLink from "../../../../Reusable/EveryPage/BubbleLink";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
  TASK_ITEM_CLOSE_REASON_MAP,
} from "../../../../../Constants/FieldOptions";
import {
  DEFAULT_ACTIVITY_SHEET_LIST_SORT_BY_VALUE,
  TASK_ITEM_CLOSE_REASON_OTHER,
} from "../../../../../Constants/App";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import TaskItemUpdateURLPathFormatter from "../../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";

function AdminOrderTaskItemList() {
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

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [listData, setListData] = useState("");
  const [selectedOrderForDeletion, setSelectedOrderForDeletion] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_ACTIVITY_SHEET_LIST_SORT_BY_VALUE,
  ); // Sorting

  ////
  //// API.
  ////

  function onOrderListSuccess(response) {
    console.log("onOrderListSuccess: Starting...");
    if (response.results !== null) {
      setListData(response);
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

  function onOrderDeleteSuccess(response) {
    console.log("onOrderDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Order deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchList(currentCursor, pageSize, "", sortByValue, oid);
  }

  function onOrderDeleteError(apiErr) {
    console.log("onOrderDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onOrderDeleteError: topAlertMessage, topAlertStatus:",
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

  function onOrderDeleteDone() {
    console.log("onOrderDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, id) => {
    setFetching(true);
    setErrors({});
    console.log(
      "fetchList | cur=" +
        cur +
        ", limit=" +
        limit +
        ", keywords=" +
        keywords +
        ", so=" +
        so +
        ", oid=" +
        id,
    ); // For debugging purposes only.

    let params = new Map();
    params.set("page_size", limit); // Pagination
    params.set("sort_field", "created_at"); // Sorting

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

    params.set("order_wjid", id);

    getTaskItemListAPI(
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
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList(currentCursor, pageSize, "", sortByValue, oid);

      // If you loaded the page for the very first time.
      if (onPageLoaded === false) {
        window.scrollTo(0, 0); // Start the page at the top of the page.
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [onPageLoaded, currentCursor, pageSize, sortByValue, oid]);

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
            <ul className="">
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
                  &nbsp;Order&nbsp;#{oid}&nbsp;(Tasks)
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

          {/* Page Modal(s) */}
          {/* Nothing ... */}

          {/* Page Table */}
          <nav className="box" style={{ borderRadius: "20px" }}>
            {/* Title + Options */}
            <div className="columns">
              <div className="column">
                <p className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs is-medium is-size-7-mobile is-size-6-tablet">
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
                <li className="is-active">
                  <Link>
                    <strong>Tasks</strong>
                  </Link>
                </li>
                <li>
                  <Link to={`/admin/order/${oid}/comments`}>Comments</Link>
                </li>
                <li>
                  <Link to={`/admin/order/${oid}/attachments`}>
                    Attachments
                  </Link>
                </li>
                <li>
                  <Link to={`/admin/order/${oid}/more`}>
                    More&nbsp;&nbsp;
                    <FontAwesomeIcon className="mdi" icon={faEllipsis} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Table Contents */}
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {listData &&
                listData.results &&
                (listData.results.length > 0 || previousCursors.length > 0) ? (
                  <div className="container">
                    {listData &&
                      listData.results &&
                      listData.results.map(function (datum, i) {
                        return (
                          <>
                            <table className="is-fullwidth table">
                              <thead>
                                <tr className="has-background-black">
                                  <th className="has-text-white" colSpan="2">
                                    <div className="columns is-flex is-vcentered is-mobile">
                                      <div className="column is-right">
                                        <span className="is-size-5-desktop is-size-7-touch">
                                          Task&nbsp;at&nbsp;
                                          <DateTimeTextFormatter
                                            value={datum.createdAt}
                                          />
                                        </span>
                                      </div>
                                      <div className="column is-4 has-text-right">
                                        <Link
                                          target="_blank"
                                          rel="noreferrer"
                                          to={TaskItemUpdateURLPathFormatter(
                                            datum.id,
                                            datum.type,
                                          )}
                                          className="button is-small"
                                        >
                                          View&nbsp;
                                          <FontAwesomeIcon
                                            className="fas"
                                            icon={faArrowUpRightFromSquare}
                                          />
                                        </Link>
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <th
                                    className="has-background-light"
                                    style={{ width: "30%" }}
                                  >
                                    Staff
                                  </th>
                                  <td>
                                    {datum.modifiedByUserName ? (
                                      datum.modifiedByUserName
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
                                    Title
                                  </th>
                                  <td>{datum.title ? datum.title : <>-</>}</td>
                                </tr>
                                <tr>
                                  <th
                                    className="has-background-light"
                                    style={{ width: "30%" }}
                                  >
                                    Description
                                  </th>
                                  <td>
                                    {datum.description ? (
                                      datum.description
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
                                    Due date
                                  </th>
                                  <td>
                                    {datum.dueDate ? (
                                      <DateTextFormatter
                                        value={datum.dueDate}
                                      />
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
                                    Is closed?
                                  </th>
                                  <td>
                                    {datum.dueDate ? (
                                      <CheckboxTextFormatter
                                        checked={datum.isClosed}
                                      />
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
                                    Was postponed?
                                  </th>
                                  <td>
                                    {datum.dueDate ? (
                                      <CheckboxTextFormatter
                                        checked={datum.wasPostponed}
                                      />
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
                                    Closed reason
                                  </th>
                                  {datum.closingReason ===
                                  TASK_ITEM_CLOSE_REASON_OTHER ? (
                                    <td>
                                      {datum.dueDate ? (
                                        datum.closingReasonOther
                                      ) : (
                                        <>-</>
                                      )}
                                    </td>
                                  ) : (
                                    <td>
                                      {datum.dueDate ? (
                                        TASK_ITEM_CLOSE_REASON_MAP[
                                          datum.closingReason
                                        ]
                                      ) : (
                                        <>-</>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              </tbody>
                            </table>
                          </>
                        );
                      })}
                  </div>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">
                        <FontAwesomeIcon className="fas" icon={faTable} />
                        &nbsp;No Tasks
                      </p>
                      <p className="subtitle">No tasks yet.</p>
                    </div>
                  </section>
                )}
              </>
            )}
            <div className="columns pt-5">
              <div className="column is-half">
                <Link
                  className="button is-fullwidth-mobile"
                  to={`/admin/listData`}
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Orders
                </Link>
              </div>
              <div className="column is-half has-text-right"></div>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminOrderTaskItemList;
