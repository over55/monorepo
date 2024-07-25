import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faFilterCircleXmark,
  faArrowLeft,
  faCircleInfo,
  faPlus,
  faMinus,
  faGauge,
  faArrowRight,
  faFilter,
  faSearch,
  faTable,
  faTableList,
  faTableCellsLarge,
  faWrench,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getOrderIncidentListAPI } from "../../../../API/OrderIncident";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  incidentFilterStatusState,
  incidentFilterTypeState,
  incidentFilterSortState,
  incidentListViewTypeState,
  incidentListSeeAllFiltersState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
import BubbleLink from "../../../Reusable/EveryPage/BubbleLink";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  ORDER_INCIDENT_SORT_OPTIONS,
  CLIENT_STATUS_FILTER_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
  LIST_VIEW_TYPE_TABULAR,
  LIST_VIEW_TYPE_GRID,
} from "../../../../Constants/App";
import AdminOrderIncidentListDesktop from "./TabularDesktop";
import AdminOrderIncidentListMobile from "./TabularMobile";
import AdminOrderIncidentListGrid from "./Grid";

function AdminOrderIncidentList() {

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [status, setStatus] = useRecoilState(incidentFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(incidentFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(incidentFilterSortState); // Sorting
  const [listViewType, setListViewType] = useRecoilState(
    incidentListViewTypeState,
  );
  const [hasClickedSeeAllFilters, setHasClickedSeeAllFilters] = useRecoilState(
    incidentListSeeAllFiltersState,
  );

  ////
  //// Component states.
  ////

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [listData, setListData] = useState("");
  const [selectedIncidentForDeletion, setSelectedIncidentForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// API.
  ////

  // --- List --- //

  function onIncidentListSuccess(response) {
    console.log("onIncidentListSuccess: Starting...");
    if (response.results !== null) {
      setListData(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onIncidentListError(apiErr) {
    console.log("onIncidentListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onIncidentListDone() {
    console.log("onIncidentListDone: Starting...");
    setFetching(false);
  }

  // --- Delete --- //

  function onIncidentDeleteSuccess(response) {
    console.log("onIncidentDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Incident deleted");
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

  function onIncidentDeleteError(apiErr) {
    console.log("onIncidentDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onIncidentDeleteError: topAlertMessage, topAlertStatus:",
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

  function onIncidentDeleteDone() {
    console.log("onIncidentDeleteDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

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
    setSortByValue(DEFAULT_CLIENT_LIST_SORT_BY_VALUE);
    setHasClickedSeeAllFilters(false);
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
      params.set("order_type", t);
    }

    getOrderIncidentListAPI(
      params,
      onIncidentListSuccess,
      onIncidentListError,
      onIncidentListDone,
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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faFire} />
                  &nbsp;Incidents
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
                <Link to={`/admin/dashboard`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faFire} />
            &nbsp;Incidents
          </h1>
          <hr />

          {/* Page Menu Options (Tablet++) */}
          <section className="hero is-hidden-mobile">
            <div className="hero-body has-text-centered">
              <div className="container">
                <div className="columns is-vcentered">
                  <div className="column">
                    <BubbleLink
                      title={`Add`}
                      subtitle={`Add incidents`}
                      faIcon={faPlus}
                      url={`/admin/incidents/create`}
                      bgColour={`has-background-danger-dark`}
                    />
                  </div>
                  {/*
                  <div className="column">
                    <BubbleLink
                      title={`Search`}
                      subtitle={`Search incidents`}
                      faIcon={faSearch}
                      url={`/501`}
                      bgColour={`has-background-success-dark`}
                    />
                  </div>
                  */}
                </div>
              </div>
            </div>
          </section>

          {/* Page Modal(s) */}
          {/* None... */}

          {/* Page Table */}
          <nav className="box" style={{ borderRadius: "20px" }}>
            {/* Page Menu Options (Mobile Only) */}
            <div
              className="has-background-info-light is-hidden-tablet mb-6 p-5"
              style={{ borderRadius: "15px" }}
            >
              <table className="is-fullwidth has-background-info-light table">
                <thead>
                  <tr>
                    <th colSpan="2">Menu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <FontAwesomeIcon className="fas" icon={faPlus} />
                      &nbsp;Add Incident
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/incidents/create`}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faChevronRight}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {/* End Incidents */}
                  <tr>
                    <td>
                      <FontAwesomeIcon className="fas" icon={faSearch} />
                      &nbsp;Search Incidents
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/501`}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faChevronRight}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {/* End Associates */}
                </tbody>
              </table>
            </div>
            {/* END Page Menu Options (Mobile Only) */}

            {/* Title + Options */}
            <div className="columns">
              <div className="column">
                <h1 className="title is-3">
                  <FontAwesomeIcon className="fas" icon={faTable} />
                  &nbsp;List
                </h1>
              </div>
            </div>

            {/* Filter Panel */}
            <div
              className="has-background-white-bis"
              style={{ borderRadius: "15px", padding: "20px" }}
            >
              <div className="columns is-vcentered">
                <div className="column">
                  <FormSelectField
                    label="Sort by"
                    name="sortByValue"
                    placeholder="Pick sorting"
                    selectedValue={sortByValue}
                    helpText=""
                    onChange={(e) => setSortByValue(e.target.value)}
                    options={ORDER_INCIDENT_SORT_OPTIONS}
                    isRequired={true}
                  />
                </div>
                <div class="column has-text-centered">
                  <button
                    class={`button is-medium is-fullwidth-mobile ${hasClickedSeeAllFilters && `is-info`}`}
                    type="button"
                    onClick={(e) => {
                      setHasClickedSeeAllFilters(!hasClickedSeeAllFilters);
                    }}
                  >
                    {hasClickedSeeAllFilters ? (
                      <FontAwesomeIcon className="mdi" icon={faMinus} />
                    ) : (
                      <FontAwesomeIcon className="mdi" icon={faPlus} />
                    )}
                    &nbsp;See All Filters
                  </button>
                  &nbsp;
                </div>
                <div class="column has-text-right">
                  <button
                    class={`button is-large ${listViewType === LIST_VIEW_TYPE_TABULAR && `is-info`} is-fullwidth-mobile`}
                    type="button"
                    onClick={(e) => {
                      setListViewType(LIST_VIEW_TYPE_TABULAR);
                    }}
                  >
                    <FontAwesomeIcon className="mdi" icon={faTableList} />
                  </button>
                  &nbsp;
                  <button
                    class={`button is-large ${listViewType === LIST_VIEW_TYPE_GRID && `is-info`} is-fullwidth-mobile`}
                    type="button"
                    onClick={(e) => {
                      setListViewType(LIST_VIEW_TYPE_GRID);
                    }}
                  >
                    <FontAwesomeIcon className="mdi" icon={faTableCellsLarge} />
                  </button>
                </div>
              </div>
              {hasClickedSeeAllFilters && (
                <div
                  className="has-background-grey-lighter"
                  style={{ borderRadius: "15px", padding: "20px" }}
                >
                  <div className="columns is-12">
                    <div className="column is-half">
                      <h1 className="subtitle is-5 is-underlined">
                        <FontAwesomeIcon className="fas" icon={faFilter} />
                        &nbsp;Filtering
                      </h1>
                    </div>
                    <div className="column is-half has-text-right">
                      <Link onClick={onClearFilterClick}>
                        <FontAwesomeIcon
                          className="mdi"
                          icon={faFilterCircleXmark}
                        />
                        &nbsp;Clear Filter
                      </Link>
                    </div>
                  </div>

                  <div className="columns">
                    <div className="column">
                      <FormSelectField
                        label="Status"
                        name="status"
                        placeholder="Pick status"
                        selectedValue={status}
                        helpText=""
                        onChange={(e) => setStatus(parseInt(e.target.value))}
                        options={CLIENT_STATUS_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>

                    <div className="column">
                      <FormSelectField
                        label="Type"
                        name="type"
                        placeholder="Pick incident type"
                        selectedValue={type}
                        helpText=""
                        onChange={(e) => setType(parseInt(e.target.value))}
                        options={CLIENT_TYPE_OF_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* end Filter Panel */}

            {/* Table Contents */}
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {listData &&
                listData.results &&
                (listData.results.length > 0 || previousCursors.length > 0) ? (
                  <>
                    {listViewType === LIST_VIEW_TYPE_GRID && (
                      <div className="container">
                        {/*
                              ##################################################################
                              EVERYTHING INSIDE HERE WILL ONLY GRID VIEW FOR MOBILE/DESKTOP
                              ##################################################################
                        */}
                        <AdminOrderIncidentListGrid
                          listData={listData}
                          setPageSize={setPageSize}
                          pageSize={pageSize}
                          previousCursors={previousCursors}
                          onPreviousClicked={onPreviousClicked}
                          onNextClicked={onNextClicked}
                          sortByValue={sortByValue}
                          currentUser={currentUser}
                        />
                      </div>
                    )}

                    {listViewType === LIST_VIEW_TYPE_TABULAR && (
                      <div className="container">
                        {/*
                            ##################################################################
                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                            ##################################################################
                        */}
                        <div className="is-hidden-touch">
                          <AdminOrderIncidentListDesktop
                            listData={listData}
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
                          <AdminOrderIncidentListMobile
                            listData={listData}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">
                        <FontAwesomeIcon className="fas" icon={faTable} />
                        &nbsp;No Incidents
                      </p>
                      <p className="subtitle">
                        No incidents.{" "}
                        <b>
                          <Link to={`/admin/incidents/create`}>
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first incident.
                      </p>
                    </div>
                  </section>
                )}
              </>
            )}
            <div className="columns pt-5">
              <div className="column is-half">
                <Link
                  className="button is-fullwidth-mobile"
                  to={`/admin/dashboard`}
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
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

export default AdminOrderIncidentList;
