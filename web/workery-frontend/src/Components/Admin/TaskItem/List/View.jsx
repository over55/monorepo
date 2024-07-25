import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faFilterCircleXmark,
  faArrowLeft,
  faWrench,
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

import {
  getTaskItemListAPI,
  deleteTaskItemAPI,
} from "../../../../API/TaskItem";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  taskItemFilterStatusState,
  taskItemFilterTypeState,
  taskItemFilterIsClosedState,
  taskItemFilterSortState,
  taskItemListViewTypeState,
  taskItemListSeeAllFiltersState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
import FormRadioField from "../../../Reusable/FormRadioField";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  TASK_ITEM_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  TASK_ITEM_TYPE_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE,
  LIST_VIEW_TYPE_TABULAR,
  LIST_VIEW_TYPE_GRID,
} from "../../../../Constants/App";
import AdminTaskItemListDesktop from "./TabularDesktop";
import AdminTaskItemListMobile from "./TabularMobile";
import AdminTaskItemListGrid from "./Grid";

function AdminTaskItemList() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [type, setType] = useRecoilState(taskItemFilterTypeState); // Filtering
  const [isClosed, setIsClosed] = useRecoilState(taskItemFilterIsClosedState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(taskItemFilterSortState); // Sorting
  const [listViewType, setListViewType] = useRecoilState(
    taskItemListViewTypeState,
  );
  const [hasClickedSeeAllFilters, setHasClickedSeeAllFilters] = useRecoilState(
    taskItemListSeeAllFiltersState,
  );

  ////
  //// Component states.
  ////

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [users, setTaskItems] = useState("");
  const [selectedTaskItemForDeletion, setSelectedTaskItemForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// API.
  ////

  function onTaskItemListSuccess(response) {
    console.log("onTaskItemListSuccess: Starting...");
    if (response.results !== null) {
      setTaskItems(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onTaskItemListError(apiErr) {
    console.log("onTaskItemListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTaskItemListDone() {
    console.log("onTaskItemListDone: Starting...");
    setFetching(false);
  }

  function onTaskItemDeleteSuccess(response) {
    console.log("onTaskItemDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("TaskItem deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchList(currentCursor, pageSize, "", sortByValue, type, isClosed);
  }

  function onTaskItemDeleteError(apiErr) {
    console.log("onTaskItemDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onTaskItemDeleteError: topAlertMessage, topAlertStatus:",
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

  function onTaskItemDeleteDone() {
    console.log("onTaskItemDeleteDone: Starting...");
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
    setIsClosed(2); // 0=all,1=true, 2=false
    setSortByValue(DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE);
    setHasClickedSeeAllFilters(false);
  };

  const fetchList = (cur, limit, keywords, so, t, ic) => {
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
        ", t=" +
        t +
        ", ic=" +
        ic,
    ); // For debugging purposes only.

    let params = new Map();
    params.set("page_size", limit); // Pagination
    params.set("sort_field", "due_date"); // Sorting
    params.set("is_closed", ic);

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
    if (t !== undefined && t !== null && t !== "") {
      params.set("type", t);
    }

    getTaskItemListAPI(
      params,
      onTaskItemListSuccess,
      onTaskItemListError,
      onTaskItemListDone,
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

  const onSelectTaskItemForDeletion = (e, user) => {
    console.log("onSelectTaskItemForDeletion", user);
    setSelectedTaskItemForDeletion(user);
  };

  const onDeselectTaskItemForDeletion = (e) => {
    console.log("onDeselectTaskItemForDeletion");
    setSelectedTaskItemForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteTaskItemAPI(
      selectedTaskItemForDeletion.id,
      onTaskItemDeleteSuccess,
      onTaskItemDeleteError,
      onTaskItemDeleteDone,
      onUnauthorized,
    );
    setSelectedTaskItemForDeletion("");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList(currentCursor, pageSize, "", sortByValue, type, isClosed);

      // If you loaded the page for the very first time.
      if (onPageLoaded === false) {
        window.scrollTo(0, 0); // Start the page at the top of the page.
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [onPageLoaded, currentCursor, pageSize, sortByValue, type, isClosed]);

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
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
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
            <FontAwesomeIcon className="fas" icon={faTasks} />
            &nbsp;Tasks
          </h1>
          <hr />

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedTaskItemForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectTaskItemForDeletion}
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
                  onClick={onDeselectTaskItemForDeletion}
                >
                  Cancel
                </button>
              </footer>
            </div>
          </div>

          {/* Page Table */}
          <nav className="box" style={{ borderRadius: "20px" }}>
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
                    options={TASK_ITEM_SORT_OPTIONS}
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
                        label="Type"
                        name="type"
                        placeholder="Pick order type"
                        selectedValue={type}
                        helpText=""
                        onChange={(e) => setType(parseInt(e.target.value))}
                        options={TASK_ITEM_TYPE_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    <div className="column">
                      <FormRadioField
                        label="Is Task Closed?"
                        name="isClosed"
                        value={isClosed}
                        errorText={errors && errors.isClosed}
                        opt1Value={0}
                        opt1Label="All"
                        opt2Value={1}
                        opt2Label="Yes"
                        opt3Value={2}
                        opt3Label="No"
                        onChange={(e) => setIsClosed(parseInt(e.target.value))}
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
                {users &&
                users.results &&
                (users.results.length > 0 || previousCursors.length > 0) ? (
                  <>
                    {listViewType === LIST_VIEW_TYPE_GRID && (
                      <div className="container">
                        {/*
                            ##################################################################
                            EVERYTHING INSIDE HERE WILL ONLY GRID VIEW FOR MOBILE/DESKTOP
                            ##################################################################
                        */}
                        <AdminTaskItemListGrid
                          listData={users}
                          setPageSize={setPageSize}
                          pageSize={pageSize}
                          previousCursors={previousCursors}
                          onPreviousClicked={onPreviousClicked}
                          onNextClicked={onNextClicked}
                          onSelectTaskItemForDeletion={
                            onSelectTaskItemForDeletion
                          }
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
                          <AdminTaskItemListDesktop
                            listData={users}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectTaskItemForDeletion={
                              onSelectTaskItemForDeletion
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
                          <AdminTaskItemListMobile
                            listData={users}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectTaskItemForDeletion={
                              onSelectTaskItemForDeletion
                            }
                            sortByValue={sortByValue}
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
                        &nbsp;No Tasks
                      </p>
                      <p className="subtitle">
                        No tasks. Come back later when tasks become available.
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

export default AdminTaskItemList;
