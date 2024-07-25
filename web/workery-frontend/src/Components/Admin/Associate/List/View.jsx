import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faFilterCircleXmark,
  faArrowLeft,
  faHardHat,
  faPlus,
  faGauge,
  faArrowRight,
  faFilter,
  faSearch,
  faTable,
  faTableList,
  faTableCellsLarge,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import {
  getAssociateListAPI,
  deleteAssociateAPI,
} from "../../../../API/Associate";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  // associateFilterJoinDatetState,
  associateFilterStatusState,
  associateFilterTypeState,
  associateFilterSortState,
  associateListViewTypeState,
  associateListSeeAllFiltersState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
import BubbleLink from "../../../Reusable/EveryPage/BubbleLink";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  ASSOCIATE_SORT_OPTIONS,
  ASSOCIATE_STATUS_FILTER_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  DEFAULT_ASSOCIATE_STATUS_FILTER_OPTION,
  LIST_VIEW_TYPE_TABULAR,
  LIST_VIEW_TYPE_GRID,
  ASSOCIATE_IS_JOB_SEEKER_YES
} from "../../../../Constants/App";
import AdminAssociateListDesktop from "./TabularDesktop";
import AdminAssociateListMobile from "./TabularMobile";
import AdminAssociateListGrid from "./Grid";

function AdminAssociateList() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  // const [joinDatetGTE, setJoinDatetGTE] = useRecoilState(associateFilterJoinDatetState);    // Filtering
  const [joinDatetGTE, setJoinDatetGTE] = useState(null);
  const [status, setStatus] = useRecoilState(associateFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(associateFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(
    associateFilterSortState,
  ); // Sorting
  const [listViewType, setListViewType] = useRecoilState(
    associateListViewTypeState,
  );
  const [hasClickedSeeAllFilters, setHasClickedSeeAllFilters] = useRecoilState(
    associateListSeeAllFiltersState,
  );

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState("");
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [isJobSeeker, setIsJobSeeker] = useState(false);
  const [hasTaxID, setHasTaxID] = useState(false);

  ////
  //// API.
  ////

  function onAssociateListSuccess(response) {
    console.log("onAssociateListSuccess: Starting...");
    if (response.results !== null) {
      setAssociates(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onAssociateListError(apiErr) {
    console.log("onAssociateListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateListDone() {
    console.log("onAssociateListDone: Starting...");
    setFetching(false);
  }

  function onAssociateDeleteSuccess(response) {
    console.log("onAssociateDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Associate deleted");
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
      isJobSeeker,
      hasTaxID
    );
  }

  function onAssociateDeleteError(apiErr) {
    console.log("onAssociateDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onAssociateDeleteError: topAlertMessage, topAlertStatus:",
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

  function onAssociateDeleteDone() {
    console.log("onAssociateDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, s, t, j, seeker, htid) => {
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
    if (seeker) {
      params.set("is_job_seeker", ASSOCIATE_IS_JOB_SEEKER_YES);
    }
    if (htid) {
      params.set("has_tax_id", 1);
    }

    getAssociateListAPI(
      params,
      onAssociateListSuccess,
      onAssociateListError,
      onAssociateListDone,
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

  const onSelectAssociateForDeletion = (e, user) => {
    console.log("onSelectAssociateForDeletion", user);
    setSelectedAssociateForDeletion(user);
  };

  const onDeselectAssociateForDeletion = (e) => {
    console.log("onDeselectAssociateForDeletion");
    setSelectedAssociateForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteAssociateAPI(
      selectedAssociateForDeletion.id,
      onAssociateDeleteSuccess,
      onAssociateDeleteError,
      onAssociateDeleteDone,
      onUnauthorized,
    );
    setSelectedAssociateForDeletion("");
  };

  // Function resets the filter state to its default state.
  const onClearFilterClick = (e) => {
    setJoinDatetGTE(null);
    setType(0);
    setStatus(1);
    setSortByValue(DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE);
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
        isJobSeeker,
        hasTaxID
      );
    }

    return () => {
      mounted = false;
    };
  }, [
    currentCursor,
    pageSize,
    sortByValue,
    status,
    type,
    joinDatetGTE,
    isJobSeeker,
    hasTaxID
  ]);

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
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
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
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associates
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
                      subtitle={`Add clients`}
                      faIcon={faPlus}
                      url={`/admin/associates/add/step-1-search`}
                      bgColour={`has-background-danger-dark`}
                    />
                  </div>
                  <div className="column">
                    <BubbleLink
                      title={`Search`}
                      subtitle={`Search clients`}
                      faIcon={faSearch}
                      url={`/admin/associates/search`}
                      bgColour={`has-background-success-dark`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedAssociateForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectAssociateForDeletion}
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
                <button
                  className="button"
                  onClick={onDeselectAssociateForDeletion}
                >
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
                      &nbsp;Add Associate
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/associates/add/step-1-search`}
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
                      &nbsp;Search Associates
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/associates/search`}
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
                  {listViewType === LIST_VIEW_TYPE_TABULAR && (
                    <>
                      <FontAwesomeIcon className="fas" icon={faTableList} />
                      &nbsp;List View
                    </>
                  )}
                  {listViewType === LIST_VIEW_TYPE_GRID && (
                    <>
                      <FontAwesomeIcon
                        className="fas"
                        icon={faTableCellsLarge}
                      />
                      &nbsp;Grid View
                    </>
                  )}
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
                    options={ASSOCIATE_SORT_OPTIONS}
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
                    class={`button is-medium ${listViewType === LIST_VIEW_TYPE_TABULAR && `is-info`} is-fullwidth-mobile`}
                    type="button"
                    onClick={(e) => {
                      setListViewType(LIST_VIEW_TYPE_TABULAR);
                    }}
                  >
                    <FontAwesomeIcon className="mdi" icon={faTableList} />
                  </button>
                  &nbsp;
                  <button
                    class={`button is-medium ${listViewType === LIST_VIEW_TYPE_GRID && `is-info`} is-fullwidth-mobile`}
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
                        options={ASSOCIATE_STATUS_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    <div className="column">
                      <FormSelectField
                        label="Type"
                        name="type"
                        placeholder="Pick associate type"
                        selectedValue={type}
                        helpText=""
                        onChange={(e) => setType(parseInt(e.target.value))}
                        options={ASSOCIATE_TYPE_OF_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    <div className="column">
                      <FormCheckboxField
                        label="Filter by Job Seekers"
                        name="isJobSeeker"
                        checked={isJobSeeker}
                        errorText={errors && errors.isJobSeeker}
                        onChange={(e, x) => setIsJobSeeker(!isJobSeeker)}
                        maxWidth="180px"
                      />
                      <FormCheckboxField
                        label="Filter by Charges Tax"
                        name="hasTaxID"
                        checked={hasTaxID}
                        errorText={errors && errors.hasTaxId}
                        onChange={(e, x) => setHasTaxID(!hasTaxID)}
                        maxWidth="180px"
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
                {associates &&
                associates.results &&
                (associates.results.length > 0 ||
                  previousCursors.length > 0) ? (
                  <>
                    {listViewType === LIST_VIEW_TYPE_GRID && (
                      <div className="container">
                        {/*
                              ##################################################################
                              EVERYTHING INSIDE HERE WILL ONLY GRID VIEW FOR MOBILE/DESKTOP
                              ##################################################################
                          */}
                        <AdminAssociateListGrid
                          listData={associates}
                          setPageSize={setPageSize}
                          pageSize={pageSize}
                          previousCursors={previousCursors}
                          onPreviousClicked={onPreviousClicked}
                          onNextClicked={onNextClicked}
                          onSelectAssociateForDeletion={
                            onSelectAssociateForDeletion
                          }
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
                          <AdminAssociateListDesktop
                            listData={associates}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectAssociateForDeletion={
                              onSelectAssociateForDeletion
                            }
                            sortByValue={sortByValue}
                          />
                        </div>

                        {/*
                          ###########################################################################
                          EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                          ###########################################################################
                      */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <AdminAssociateListMobile
                            listData={associates}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectAssociateForDeletion={
                              onSelectAssociateForDeletion
                            }
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
                        &nbsp;No Associates
                      </p>
                      <p className="subtitle">
                        No associates.{" "}
                        <b>
                          <Link to="/admin/associates/add/step-1">
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first associate.
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

export default AdminAssociateList;
