import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilterCircleXmark,
  faArrowLeft,
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
  faProjectDiagram,
  faUserGear,
  faHome,
  faHomeUser,
  faArrowCircleRight,
  faBuilding,
  faBuildingUser,
  faTimesCircle,
  faWrench,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import { getJobHistoryListAPI } from "../../../API/JobHistory";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  commentFilterStatusState,
  commentFilterTypeState,
  commentFilterSortState,
} from "../../../AppState";
import FormErrorBox from "../../Reusable/FormErrorBox";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../Reusable/FormSelectField";
import FormDateField from "../../Reusable/FormDateField";
import BubbleLink from "../../Reusable/EveryPage/BubbleLink";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  COMMENT_SORT_OPTIONS,
  COMMENT_STATUS_FILTER_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
} from "../../../Constants/FieldOptions";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
} from "../../../Constants/App";


function AdminMyJobHistoryListView() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [status, setStatus] = useRecoilState(commentFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(commentFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(commentFilterSortState); // Sorting

  ////
  //// Component states.
  ////

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [users, setComments] = useState("");
  const [selectedCommentForDeletion, setSelectedCommentForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// API.
  ////

  function onCommentListSuccess(response) {
    console.log("onCommentListSuccess: Starting...");
    if (response.results !== null) {
      setComments(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onCommentListError(apiErr) {
    console.log("onCommentListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onCommentListDone() {
    console.log("onCommentListDone: Starting...");
    setFetching(false);
  }

  function onCommentDeleteSuccess(response) {
    console.log("onCommentDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Comment deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchList(currentCursor, pageSize, "", sortByValue, status, type);
  }

  function onCommentDeleteError(apiErr) {
    console.log("onCommentDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onCommentDeleteError: topAlertMessage, topAlertStatus:",
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

  function onCommentDeleteDone() {
    console.log("onCommentDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  // Function resets the filter state to its default state.
  const onClearFilterClick = (e) => {
    setType(0);
    setStatus(1);
    setSortByValue("created_at,DESC");
  };

  const fetchList = (cur, limit, keywords, so, s, t) => {
    setFetching(true);
    setErrors({});

    let params = new Map();
    params.set("page_size", limit); // Pagination
    params.set("sort_field", "lexical_name"); // Sorting

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
    if (t !== undefined && t !== null && t !== "") {
      params.set("type", t);
    }

    getJobHistoryListAPI(
      params,
      onCommentListSuccess,
      onCommentListError,
      onCommentListDone,
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

  const onSelectCommentForDeletion = (e, user) => {
    console.log("onSelectCommentForDeletion", user);
    setSelectedCommentForDeletion(user);
  };

  const onDeselectCommentForDeletion = (e) => {
    console.log("onDeselectCommentForDeletion");
    setSelectedCommentForDeletion("");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList(currentCursor, pageSize, "", sortByValue, status, type);

      // If you loaded the page for the very first time.
      if (onPageLoaded === false) {
        window.scrollTo(0, 0); // Start the page at the top of the page.
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [onPageLoaded, currentCursor, pageSize, sortByValue, status, type]);

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  const results = [];

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
                <Link to="/admin/job-history" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faProjectDiagram} />
                  &nbsp;Job History (Launchpad)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faProjectDiagram} />
                  &nbsp;My Job History
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
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faProjectDiagram} />
            &nbsp;My Job History
          </h1>
          <hr />

          {/* Page Modal(s) */}


          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faTable} />
              &nbsp;List
            </p>

            <h5 className="title is-6 has-text-grey">
              Maximum of 5 orders are listed here:
            </h5>
            <table className="is-fullwidth is-striped table">
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Client Name</th>
                  <th>Associate Name</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.userJobHistory &&
                  results.userJobHistory.map(function (datum, i) {
                    return (
                      <tr>
                        <td>
                          <Link
                            to={`/admin/order/${datum.wjid}`}
                            className=""
                          >
                            {datum.wjid}
                          </Link>
                        </td>
                        <td>{datum.customerName}</td>
                        <td>{datum.associateName}</td>
                        <td>
                          <DateTimeTextFormatter
                            value={datum.modifiedAt}
                          />
                        </td>
                        <td>
                          <Link
                            to={`/admin/order/${datum.wjid}`}
                            className=""
                          >
                            View&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faChevronRight}
                            />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <>
              <FormErrorBox errors={errors} />
              <div className="container">
                <div className="columns">
                </div>

                <div className="columns pt-5">
                  <div className="column is-half">
                    <button
                      className="button is-medium is-fullwidth-mobile"
                      onClick={(e) => setForceURL("/admin/job-history") }
                    >
                      <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                      &nbsp;Back to Job History (Launchpad)
                    </button>
                  </div>
                  <div className="column is-half has-text-right"></div>
                </div>
              </div>
            </>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminMyJobHistoryListView;
