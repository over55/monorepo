import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
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
  faTable,
  faTableList,
  faTableCellsLarge,
  faArrowUpRightFromSquare,
  faRefresh,
  faFilter,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getOrderListAPI, deleteOrderAPI } from "../../../../API/Order";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  orderFilterStatusState,
  orderFilterTypeState,
  orderFilterSortState,
  orderListViewTypeState,
  orderListSeeAllFiltersState,
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
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_ORDER_LIST_SORT_BY_VALUE,
  LIST_VIEW_TYPE_TABULAR,
  LIST_VIEW_TYPE_GRID,
} from "../../../../Constants/App";
import CustomerOrderListDesktop from "./TabularDesktop";
import CustomerOrderListMobile from "./TabularMobile";
import CustomerOrderListGrid from "./Grid";

function CustomerOrderList() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [status, setStatus] = useRecoilState(orderFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(orderFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(orderFilterSortState); // Sorting
  const [listViewType, setListViewType] = useRecoilState(
    orderListViewTypeState,
  );
  const [hasClickedSeeAllFilters, setHasClickedSeeAllFilters] = useRecoilState(
    orderListSeeAllFiltersState,
  );

  ////
  //// Component states.
  ////

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [users, setOrders] = useState("");
  const [selectedOrderForDeletion, setSelectedOrderForDeletion] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination

  ////
  //// API.
  ////

  function onOrderListSuccess(response) {
    console.log("onOrderListSuccess: Starting...");
    if (response.results !== null) {
      setOrders(response);
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
    fetchList(currentCursor, pageSize, "", sortByValue, status, type, currentUser.referenceId);
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

  // Function resets the filter state to its default state.
  const onClearFilterClick = (e) => {
    setType(0);
    setStatus(0);
    setSortByValue(DEFAULT_ORDER_LIST_SORT_BY_VALUE);
    setHasClickedSeeAllFilters(false);
  };

  const fetchList = (cur, limit, keywords, so, s, t, aid) => {
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
        ", s=" +
        s +
        ", t=" +
        t,
        ", associate_id=" +
        aid
    ); // For debugging purposes only.

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
    if (t !== undefined && t !== null && t !== "") {
      params.set("type", t);
    }
    if (aid !== undefined && aid !== null && aid !== "") {
      params.set("associate_id", aid);
    }

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

  const onSelectOrderForDeletion = (e, user) => {
    console.log("onSelectOrderForDeletion", user);
    setSelectedOrderForDeletion(user);
  };

  const onDeselectOrderForDeletion = (e) => {
    console.log("onDeselectOrderForDeletion");
    setSelectedOrderForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteOrderAPI(
      selectedOrderForDeletion.id,
      onOrderDeleteSuccess,
      onOrderDeleteError,
      onOrderDeleteDone,
      onUnauthorized,
    );
    setSelectedOrderForDeletion("");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList(
          currentCursor,
          pageSize,
          "",
          sortByValue,
          status,
          type,
          currentUser.referenceId
      );

      // If you loaded the page for the very first time.
      if (onPageLoaded === false) {
        window.scrollTo(0, 0); // Start the page at the top of the page.
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
}, [onPageLoaded, currentCursor, pageSize, sortByValue, status, type, currentUser]);

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
                <Link to="/c/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
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
                <Link to="/c/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Orders
          </h1>
          <hr />

          {/* Page Menu Options (Tablet++) */}
          {/*
          <section className="hero is-hidden-mobile">
            <div className="hero-body has-text-centered">
              <div className="container">
                <div className="columns is-vcentered">
                  <div className="column">
                    <BubbleLink
                      title={`Add`}
                      subtitle={`Add orders`}
                      faIcon={faPlus}
                      url={`/c/orders/add/step-1-search`}
                      bgColour={`has-background-danger-dark`}
                    />
                  </div>
                  <div className="column">
                    <BubbleLink
                      title={`Search`}
                      subtitle={`Search orders`}
                      faIcon={faSearch}
                      url={`/c/orders/search`}
                      bgColour={`has-background-success-dark`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          */}

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedOrderForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectOrderForDeletion}
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
                <button className="button" onClick={onDeselectOrderForDeletion}>
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
                      &nbsp;Add Order
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/c/orders/add/step-1-search`}
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
                      &nbsp;Search Orders
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link to={`/c/orders/search`} className="is-small">
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
                    options={ORDER_SORT_OPTIONS}
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
                        options={ORDER_STATUS_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                    <div className="column">
                      <FormSelectField
                        label="Type"
                        name="type"
                        placeholder="Pick order type"
                        selectedValue={type}
                        helpText=""
                        onChange={(e) => setType(parseInt(e.target.value))}
                        options={ORDER_TYPE_FILTER_OPTIONS}
                        isRequired={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                        <CustomerOrderListGrid
                          listData={users}
                          setPageSize={setPageSize}
                          pageSize={pageSize}
                          previousCursors={previousCursors}
                          onPreviousClicked={onPreviousClicked}
                          onNextClicked={onNextClicked}
                          onSelectOrderForDeletion={onSelectOrderForDeletion}
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
                          <CustomerOrderListDesktop
                            listData={users}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectOrderForDeletion={onSelectOrderForDeletion}
                            sortByValue={sortByValue}
                          />
                        </div>

                        {/*
                            ###########################################################################
                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                            ###########################################################################
                        */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <CustomerOrderListMobile
                            listData={users}
                            setPageSize={setPageSize}
                            pageSize={pageSize}
                            previousCursors={previousCursors}
                            onPreviousClicked={onPreviousClicked}
                            onNextClicked={onNextClicked}
                            onSelectOrderForDeletion={onSelectOrderForDeletion}
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
                        &nbsp;No Orders
                      </p>
                      <p className="subtitle">
                        No orders.{" "}
                        <b>
                          <Link to="/c/orders/add/step-1-search">
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first order.
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
                  to={`/c/dashboard`}
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

export default CustomerOrderList;
