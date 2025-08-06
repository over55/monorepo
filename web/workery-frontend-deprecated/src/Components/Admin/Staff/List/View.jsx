import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faFilterCircleXmark,
  faArrowLeft,
  faUserTie,
  faTachometer,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faMinus,
  faGauge,
  faArrowRight,
  faArrowUpRightFromSquare,
  faRefresh,
  faFilter,
  faSearch,
  faTable,
  faTableList,
  faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getStaffListAPI, deleteStaffAPI } from "../../../../API/Staff";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  // staffFilterJoinDatetState,
  staffFilterStatusState,
  staffFilterTypeState,
  staffFilterSortState,
  staffListViewTypeState,
  staffListSeeAllFiltersState,
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
  STAFF_SORT_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_TYPE_OF_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_STAFF_LIST_SORT_BY_VALUE,
  DEFAULT_STAFF_STATUS_FILTER_OPTION,
  LIST_VIEW_TYPE_TABULAR,
  LIST_VIEW_TYPE_GRID,
} from "../../../../Constants/App";
import AdminStaffListDesktop from "./TabularDesktop";
import AdminStaffListMobile from "./TabularMobile";
import AdminStaffListGrid from "./Grid";

function AdminStaffList() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  // const [joinDatetGTE, setJoinDatetGTE] = useRecoilState(staffFilterJoinDatetState);    // Filtering
  const [joinDatetGTE, setJoinDatetGTE] = useState(null);
  const [status, setStatus] = useRecoilState(staffFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(staffFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(staffFilterSortState); // Sorting
  const [listViewType, setListViewType] = useRecoilState(
    staffListViewTypeState,
  );
  const [hasClickedSeeAllFilters, setHasClickedSeeAllFilters] = useRecoilState(
    staffListSeeAllFiltersState,
  );

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [staff, setStaffs] = useState("");
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// API.
  ////

  function onStaffListSuccess(response) {
    console.log("onStaffListSuccess: Starting...");
    if (response.results !== null) {
      setStaffs(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onStaffListError(apiErr) {
    console.log("onStaffListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onStaffListDone() {
    console.log("onStaffListDone: Starting...");
    setFetching(false);
  }

  function onStaffDeleteSuccess(response) {
    console.log("onStaffDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Staff deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchList(
      currentCursor,
      pageSize,
      "",
      sortByValue,
      status,
      type,
      joinDatetGTE,
    );
  }

  function onStaffDeleteError(apiErr) {
    console.log("onStaffDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onStaffDeleteError: topAlertMessage, topAlertStatus:",
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

  function onStaffDeleteDone() {
    console.log("onStaffDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, s, t, j) => {
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
    if (j !== undefined && j !== null && j !== "") {
      const jStr = j.getTime();
      params.set("created_at_gte", jStr);
    }

    getStaffListAPI(
      params,
      onStaffListSuccess,
      onStaffListError,
      onStaffListDone,
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

  const onSelectStaffForDeletion = (e, user) => {
    console.log("onSelectStaffForDeletion", user);
    setSelectedStaffForDeletion(user);
  };

  const onDeselectStaffForDeletion = (e) => {
    console.log("onDeselectStaffForDeletion");
    setSelectedStaffForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteStaffAPI(
      selectedStaffForDeletion.id,
      onStaffDeleteSuccess,
      onStaffDeleteError,
      onStaffDeleteDone,
      onUnauthorized,
    );
    setSelectedStaffForDeletion("");
  };

  // Function resets the filter state to its default state.
  const onClearFilterClick = (e) => {
    setJoinDatetGTE(null);
    setType(0);
    setStatus(1);
    setSortByValue(DEFAULT_STAFF_LIST_SORT_BY_VALUE);
    setHasClickedSeeAllFilters(false);
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // window.scrollTo(0, 0);  // Start the page at the top of the page.
      fetchList(
        currentCursor,
        pageSize,
        "",
        sortByValue,
        status,
        type,
        joinDatetGTE,
      );
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, sortByValue, status, type, joinDatetGTE]);

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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserTie} />
                  &nbsp;Staff
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
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
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
                      subtitle={`Add staff`}
                      faIcon={faPlus}
                      url={`/admin/staff/add/step-1-search`}
                      bgColour={`has-background-danger-dark`}
                    />
                  </div>
                  <div className="column">
                    <BubbleLink
                      title={`Search`}
                      subtitle={`Search staff`}
                      faIcon={faSearch}
                      url={`/admin/staff/search`}
                      bgColour={`has-background-success-dark`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedStaffForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectStaffForDeletion}
                ></button>
              </header>
              <section className="modal-card-body">
                You are about to <b>archive</b> this user; it will no longer
                appear on your dashboard This action can be undone but you'll
                need to contact the system administrator. Are you sure you would
                like to continue?
              </section>
              <footer className="modal-card-foot">
                <button
                  className="button is-success"
                  onClick={onDeleteConfirmButtonClick}
                >
                  Confirm
                </button>
                <button className="button" onClick={onDeselectStaffForDeletion}>
                  Cancel
                </button>
              </footer>
            </div>
          </div>

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
                      &nbsp;Add Staff
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/staff/add/step-1-search`}
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
                  {/* End Clients */}
                  <tr>
                    <td>
                      <FontAwesomeIcon className="fas" icon={faSearch} />
                      &nbsp;Search Staff
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link to={`/admin/staff/search`} className="is-small">
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
                    options={STAFF_SORT_OPTIONS}
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
                        options={STAFF_STATUS_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    <div className="column">
                      <FormSelectField
                        label="Type"
                        name="type"
                        placeholder="Pick staff type"
                        selectedValue={type}
                        helpText=""
                        onChange={(e) => setType(parseInt(e.target.value))}
                        options={STAFF_TYPE_OF_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    {/*
                        <div className="column">
                            <FormDateField
                                label="Join Date"
                                name="joinDatetGTE"
                                placeholder="Text input"
                                value={joinDatetGTE}
                                helpText=""
                                onChange={(date)=>setJoinDatetGTE(date)}
                                isRequired={true}
                                maxWidth="185px"
                            />
                        </div>
                    */}
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
                {staff &&
                staff.results &&
                (staff.results.length > 0 || previousCursors.length > 0) ? (
                  <>
                    {listViewType === LIST_VIEW_TYPE_GRID && (
                      <div className="container">
                        {/*
                              ##################################################################
                              EVERYTHING INSIDE HERE WILL ONLY GRID VIEW FOR MOBILE/DESKTOP
                              ##################################################################
                          */}
                        <AdminStaffListGrid
                          listData={staff}
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
                          <AdminStaffListDesktop
                            listData={staff}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            currentUser={currentUser}
                          />
                        </div>

                        {/*
                            ###########################################################################
                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                            ###########################################################################
                        */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <AdminStaffListMobile
                            listData={staff}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectStaffForDeletion={onSelectStaffForDeletion}
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
                        &nbsp;No Staff
                      </p>
                      <p className="subtitle">
                        No staff.{" "}
                        <b>
                          <Link to="/admin/staff/add/step-1">
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first staff.
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

export default AdminStaffList;
