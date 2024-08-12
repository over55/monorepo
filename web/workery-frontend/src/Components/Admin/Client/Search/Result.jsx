import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faHome,
  faChevronRight,
  faArrowLeft,
  faUserCircle,
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
  faBan
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { DateTime } from "luxon";

import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import { getClientListAPI, deleteClientAPI } from "../../../../API/Client";
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
  CLIENT_SORT_OPTIONS,
  CLIENT_STATUS_FILTER_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_STATUS_ACTIVE,
} from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";

function AdminClientSearchResult() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");
  const email = searchParams.get("e");
  const phone = searchParams.get("p");
  const organizationName = searchParams.get("on");
  const isActive = searchParams.get("active");

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [addCustomer, setAddCustomer] = useRecoilState(addCustomerState);

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [users, setClients] = useState("");
  const [selectedClientForDeletion, setSelectedClientForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  ); // Sorting
  const [temporarySearchText, setTemporarySearchText] = useState(""); // Searching - The search field value as your writes their query.
  const [actualSearchText, setActualSearchText] = useState(""); // Searching - The actual search query value to submit to the API.
  const [status, setStatus] = useState(isActive ? CLIENT_STATUS_ACTIVE : ""); // Filtering - Either by active or all records.
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering
  const [typeOf, setTypeOf] = useState(0); // Filtering

  ////
  //// API.
  ////

  function onClientListSuccess(response) {
    console.log("onClientListSuccess: Starting...");
    if (response.results !== null) {
      setClients(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onClientListError(apiErr) {
    console.log("onClientListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onClientListDone() {
    console.log("onClientListDone: Starting...");
    setFetching(false);
  }

  function onClientDeleteSuccess(response) {
    console.log("onClientDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Client deleted");
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

  function onClientDeleteError(apiErr) {
    console.log("onClientDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onClientDeleteError: topAlertMessage, topAlertStatus:",
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

  function onClientDeleteDone() {
    console.log("onClientDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, so, s, t, j, fn, ln, e, p, on) => {
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
    if (on !== undefined && on !== null && on !== "") {
      params.set("organization_name", on);
    }

    getClientListAPI(
      params,
      onClientListSuccess,
      onClientListError,
      onClientListDone,
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

  const onSearchButtonClick = (e) => {
    // Searching
    console.log("Search button clicked...");
    setActualSearchText(temporarySearchText);
  };

  const onSelectClientForDeletion = (e, user) => {
    console.log("onSelectClientForDeletion", user);
    setSelectedClientForDeletion(user);
  };

  const onDeselectClientForDeletion = (e) => {
    console.log("onDeselectClientForDeletion");
    setSelectedClientForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteClientAPI(
      selectedClientForDeletion.id,
      onClientDeleteSuccess,
      onClientDeleteError,
      onClientDeleteDone,
      onUnauthorized,
    );
    setSelectedClientForDeletion("");
  };

  const onAddClientClick = (e) => {
    console.log("deleting previous addCustomer:", addCustomer);
    setAddCustomer(ADD_CUSTOMER_STATE_DEFAULT);
    setForceURL("/admin/clients/add/step-3");
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
        organizationName,
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
    organizationName,
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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search
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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Clients
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Clients
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Search
          </h4>
          <hr />

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedClientForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectClientForDeletion}
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
                  onClick={onDeselectClientForDeletion}
                >
                  Cancel
                </button>
              </footer>
            </div>
          </div>

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
                  options={CLIENT_STATUS_FILTER_OPTIONS}
                  isRequired={true}
                />
              </div>
              <div className="column">
                <FormSelectField
                  label="Type"
                  name="typeOf"
                  placeholder="Pick client type"
                  selectedValue={typeOf}
                  helpText=""
                  onChange={(e) => setTypeOf(parseInt(e.target.value))}
                  options={CLIENT_TYPE_OF_FILTER_OPTIONS}
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
                  options={CLIENT_SORT_OPTIONS}
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
                              <div className="column is-4">
                                <div
                                  className={`card ${datum.isBanned ? "has-background-danger-light": "has-background-info-light"} m-4`}
                                  key={`id_${datum.id}`}
                                >
                                  {/* HEADER */}
                                  <header className="card-header">
                                    <p className="card-header-title">
                                      <Link to={`/admin/client/${datum.id}`}>
                                        {datum.type ===
                                          COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                                          <strong>
                                            <FontAwesomeIcon
                                              className="fas"
                                              icon={faBuilding}
                                            />
                                            &nbsp;{datum.organizationName}
                                          </strong>
                                        )}
                                        {datum.type ===
                                          RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                                          <strong>
                                            <FontAwesomeIcon
                                              className="fas"
                                              icon={faHome}
                                            />
                                            &nbsp;{datum.firstName}&nbsp;
                                            {datum.lastName}
                                          </strong>
                                        )}
                                        {datum.isBanned && (
                                            <><br/>
                                            <i style={{fontSize: "16px"}}>(<FontAwesomeIcon
                                              className="fas"
                                              icon={faBan}
                                            />Banned)</i></>
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
                                      {datum.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && <>
                                          <u>{datum.firstName}&nbsp;{datum.lastName}</u>
                                           <br />
                                      </>}
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
                                        <EmailTextFormatter value={datum.email} />
                                      ) : (
                                        <>-</>
                                      )}
                                    </div>
                                  </div>
                                  {/* BOTTOM */}
                                  <footer className="card-footer">
                                    <Link
                                      to={`/admin/client/${datum.id}`}
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
                          &nbsp;No Clients
                        </p>
                        <p className="subtitle">
                          No clients found.{" "}
                          <b>
                            <Link to="/admin/clients/search">
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

                <div className="columns pt-5">
                  <div className="column is-half">
                    <Link
                      className="button is-medium is-fullwidth-mobile"
                      to="/admin/clients/search"
                    >
                      <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                      &nbsp;Search Again
                    </Link>
                    &nbsp;
                  </div>
                  <div className="column is-half has-text-right"></div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminClientSearchResult;
