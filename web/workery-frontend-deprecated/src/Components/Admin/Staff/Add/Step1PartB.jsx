import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faHome,
  faChevronRight,
  faArrowLeft,
  faUserTie,
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
  faClose,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { DateTime } from "luxon";

import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import { getStaffListAPI, deleteStaffAPI } from "../../../../API/Staff";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
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
  RESIDENTIAL_STAFF_TYPE_OF_ID,
  COMMERCIAL_STAFF_TYPE_OF_ID,
} from "../../../../Constants/App";
import { addStaffState, ADD_STAFF_STATE_DEFAULT } from "../../../../AppState";

function AdminStaffAddStep1PartB() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");
  const email = searchParams.get("e");
  const phone = searchParams.get("p");

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [addStaff, setAddStaff] = useRecoilState(addStaffState);

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [users, setStaffs] = useState("");
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_STAFF_LIST_SORT_BY_VALUE,
  ); // Sorting
  const [temporarySearchText, setTemporarySearchText] = useState(""); // Searching - The search field value as your writes their query.
  const [actualSearchText, setActualSearchText] = useState(""); // Searching - The actual search query value to submit to the API.
  const [status, setStatus] = useState(""); // Filtering
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering
  const [typeOf, setTypeOf] = useState(0); // Filtering

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
      actualSearchText,
      status,
      typeOf,
      createdAtGTE,
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

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, s, t, j, fn, ln, e, p) => {
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
    if (t !== undefined && t !== null && t !== "") {
      params.set("type", t);
    }
    if (j !== undefined && j !== null && j !== "") {
      const jStr = j.getTime();
      params.set("created_at_gte", jStr);
    }
    if (fn !== undefined && fn !== null && fn !== "") {
      params.set("first_name", fn);
    }
    if (ln !== undefined && ln !== null && ln !== "") {
      params.set("last_name", ln);
    }
    if (e !== undefined && e !== null && e !== "") {
      params.set("email", e);
    }
    if (p !== undefined && p !== null && p !== "") {
      params.set("phone", p);
    }

    getStaffListAPI(
      params,
      onStaffListSuccess,
      onStaffListError,
      onStaffListDone,
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

  const onSearchButtonClick = (e) => {
    // Searching
    console.log("Search button clicked...");
    setActualSearchText(temporarySearchText);
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
    );
    setSelectedStaffForDeletion("");
  };

  const onAddStaffClick = (e) => {
    console.log("deleting previous addStaff:", addStaff);
    setAddStaff(ADD_STAFF_STATE_DEFAULT);
    setForceURL("/admin/staff/add/step-2");
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
        actualSearchText,
        sortByValue,
        status,
        typeOf,
        createdAtGTE,
        firstName,
        lastName,
        email,
        phone,
      );
    }

    return () => {
      mounted = false;
    };
  }, [
    currentCursor,
    pageSize,
    actualSearchText,
    sortByValue,
    status,
    typeOf,
    createdAtGTE,
    firstName,
    lastName,
    email,
    phone,
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
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
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

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Staff
          </h4>
          <hr />

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

          {/* Progress Wizard */}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 1 of 7</p>
            <progress class="progress is-success" value="14" max="100">
              14%
            </progress>
          </nav>

          {/* Page Table */}
          <nav className="box" style={{ borderRadius: "20px" }}>
            <p className="title is-4 pb-2">
              <FontAwesomeIcon className="fas" icon={faTable} />
              &nbsp;Search results:
            </p>

            {/* Filter Panel */}
            <div
              className="columns has-background-light is-multiline p-2"
              style={{ borderRadius: "20px" }}
            >
              <div className="column is-12">
                <h1 className="subtitle is-5 is-underlined">
                  <FontAwesomeIcon className="fas" icon={faFilter} />
                  &nbsp;Filtering & Sorting
                </h1>
              </div>

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
                  name="typeOf"
                  placeholder="Pick staff type"
                  selectedValue={typeOf}
                  helpText=""
                  onChange={(e) => setTypeOf(parseInt(e.target.value))}
                  options={STAFF_TYPE_OF_FILTER_OPTIONS}
                  isRequired={true}
                />
              </div>
              <div className="column">
                <FormDateField
                  label="Created"
                  name="createdAtGTE"
                  placeholder="Text input"
                  value={createdAtGTE}
                  helpText=""
                  onChange={(date) => setCreatedAtGTE(date)}
                  isRequired={true}
                  maxWidth="120px"
                />
              </div>
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
            </div>

            {/* Table Contents */}
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container mb-6">
                  {users &&
                  users.results &&
                  (users.results.length > 0 || previousCursors.length > 0) ? (
                    <>
                      <div className="columns is-multiline">
                        {users &&
                          users.results &&
                          users.results.map(function (datum, i) {
                            return (
                              <div className="column is-3">
                                <div
                                  className="card has-background-info-light m-4"
                                  key={`id_${datum.id}`}
                                >
                                  {/* HEADER */}
                                  <header className="card-header">
                                    <p className="card-header-title">
                                      <Link to={`/admin/staff/${datum.id}`}>
                                        {datum.type ===
                                          COMMERCIAL_STAFF_TYPE_OF_ID && (
                                          <strong>
                                            <FontAwesomeIcon
                                              className="fas"
                                              icon={faBuilding}
                                            />
                                            &nbsp;{datum.organizationName}
                                          </strong>
                                        )}
                                        {datum.type ===
                                          RESIDENTIAL_STAFF_TYPE_OF_ID && (
                                          <strong>
                                            <FontAwesomeIcon
                                              className="fas"
                                              icon={faHome}
                                            />
                                            &nbsp;{datum.firstName}&nbsp;
                                            {datum.lastName}
                                          </strong>
                                        )}
                                      </Link>
                                    </p>
                                    <button
                                      className="card-header-icon"
                                      aria-label="more options"
                                    >
                                      <span className="icon">
                                        <i
                                          className="fas fa-angle-down"
                                          aria-hidden="true"
                                        ></i>
                                      </span>
                                    </button>
                                  </header>
                                  {/* BODY */}
                                  <div className="card-content">
                                    <div className="content">
                                      {datum.addressLine1}
                                      <br />
                                      {datum.city}, {datum.region}
                                      <br />
                                      {datum.phone ? (
                                        <Link to={`tel:${datum.phone}`}>
                                          {datum && datum.phone && (
                                            <PhoneTextFormatter
                                              value={datum.phone}
                                            />
                                          )}
                                        </Link>
                                      ) : (
                                        <>-</>
                                      )}
                                      <br />
                                      {datum.email ? (
                                        <Link to={`mailto:${datum.email}`}>
                                          {datum.email}
                                        </Link>
                                      ) : (
                                        <>-</>
                                      )}
                                    </div>
                                  </div>
                                  {/* BOTTOM */}
                                  <footer className="card-footer">
                                    <Link
                                      to={`/admin/staff/${datum.id}`}
                                      className="card-footer-item"
                                    >
                                      Select&nbsp;
                                      <FontAwesomeIcon
                                        className="fas"
                                        icon={faChevronRight}
                                      />
                                    </Link>
                                  </footer>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <div className="columns pt-4">
                        <div className="column is-half">
                          <span className="select">
                            <select
                              className={`input has-text-grey-light`}
                              name="pageSize"
                              onChange={(e) =>
                                setPageSize(parseInt(e.target.value))
                              }
                            >
                              {PAGE_SIZE_OPTIONS.map(function (option, i) {
                                return (
                                  <option
                                    selected={pageSize === option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                );
                              })}
                            </select>
                          </span>
                        </div>
                        <div className="column is-half has-text-right">
                          {previousCursors.length > 0 && (
                            <button
                              className="button"
                              onClick={onPreviousClicked}
                            >
                              Previous
                            </button>
                          )}
                          {users.hasNextPage && (
                            <>
                              <button
                                className="button"
                                onClick={onNextClicked}
                              >
                                Next
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <section className="hero is-medium has-background-white-ter">
                      <div className="hero-body">
                        <p className="title">
                          <FontAwesomeIcon className="fas" icon={faTable} />
                          &nbsp;No Staff
                        </p>
                        <p className="subtitle">
                          No staff found.{" "}
                          <b>
                            <Link to="/admin/staff/add/step-1-search">
                              Click here&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faArrowRight}
                              />
                            </Link>
                          </b>{" "}
                          to search again.
                        </p>
                      </div>
                    </section>
                  )}
                </div>
                <p className="title is-4 has-text-centered">- OR -</p>

                <div className="columns pt-5">
                  <div className="column has-text-centered">
                    <Link
                      className="button is-medium is-fullwidth-mobile"
                      to="/admin/staff/add/step-1-search"
                    >
                      <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                      &nbsp;Search Again
                    </Link>
                    &nbsp;
                    <Link
                      className="button is-medium is-success is-fullwidth-mobile"
                      onClick={onAddStaffClick}
                    >
                      <FontAwesomeIcon className="fas" icon={faPlus} />
                      &nbsp;Add staff
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminStaffAddStep1PartB;
