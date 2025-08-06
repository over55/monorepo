import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faForward,
  faWrench,
  faBuilding,
  faHome,
  faChevronRight,
  faArrowLeft,
  faHardHat,
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

import { getAssociateListAPI } from "../../../../../../API/Associate";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../../../AppState";
import { transferOrderOperationState } from "../../../../../../AppState";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  ASSOCIATE_SORT_OPTIONS,
  ASSOCIATE_STATUS_FILTER_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
} from "../../../../../../Constants/FieldOptions";
import {
  DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  DEFAULT_ASSOCIATE_STATUS_FILTER_OPTION,
  RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
} from "../../../../../../Constants/App";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormDateField from "../../../../../Reusable/FormDateField";

function AdminOrderMoreTransferOperationStep4() {
  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();

  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");
  const email = searchParams.get("e");
  const phone = searchParams.get("p");
  const actualSearchText = searchParams.get("q");

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [transferOrderOperation, setTransferOrderOperation] = useRecoilState(
    transferOrderOperationState,
  );

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [users, setAssociates] = useState("");
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  ); // Sorting
  const [temporarySearchText, setTemporarySearchText] = useState(""); // Searching - The search field value as your writes their query.
  const [status, setStatus] = useState(""); // Filtering
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering
  const [typeOf, setTypeOf] = useState(0); // Filtering

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
      actualSearchText,
      status,
      typeOf,
      createdAtGTE,
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

    getAssociateListAPI(
      params,
      onAssociateListSuccess,
      onAssociateListError,
      onAssociateListDone,
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

  const onSelectClick = (associateID, associateName) => {
    console.log("Selcted associateID:", associateID);

    // Save state to persistent storage (in associate's web-browser).
    let newTransferOp = { ...transferOrderOperation };
    newTransferOp.pickedAssociateID = associateID;
    newTransferOp.pickedAssociateName = associateName;
    // newTransferOp.associateEmail = associateEmail;
    // newTransferOp.associatePhone = associatePhone;
    // newTransferOp.associateFirstName = associateFirstName;
    // newTransferOp.associateLastName = associateLastName;
    // newTransferOp.associateSearch = associateSearch;
    setTransferOrderOperation(newTransferOp);

    setForceURL("/admin/order/" + oid + "/more/transfer/step-5");
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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faExchangeAlt} />
                  &nbsp;Transfer
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
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Order&nbsp;#{oid}&nbsp;(More)
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

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 4 of 5</p>
            <progress class="progress is-success" value="80" max="100">
              80%
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
                  options={ASSOCIATE_STATUS_FILTER_OPTIONS}
                  isRequired={true}
                />
              </div>
              <div className="column">
                <FormSelectField
                  label="Type"
                  name="typeOf"
                  placeholder="Pick associate type"
                  selectedValue={typeOf}
                  helpText=""
                  onChange={(e) => setTypeOf(parseInt(e.target.value))}
                  options={ASSOCIATE_TYPE_OF_FILTER_OPTIONS}
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
                  options={ASSOCIATE_SORT_OPTIONS}
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
                                      <Link to={`/admin/associate/${datum.id}`}>
                                        {datum.type ===
                                          COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                                          <strong>
                                            <FontAwesomeIcon
                                              className="fas"
                                              icon={faBuilding}
                                            />
                                            &nbsp;{datum.firstName}&nbsp;
                                            {datum.organizationName}
                                          </strong>
                                        )}
                                        {datum.type ===
                                          RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
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
                                          {datum.phone}
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
                                      onClick={(e) =>
                                        onSelectClick(datum.id, datum.name)
                                      }
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
                          &nbsp;No Associates
                        </p>
                        <p className="subtitle">
                          No associates found.{" "}
                          <b>
                            <Link
                              to={`/admin/order/${oid}/more/transfer/step-3`}
                            >
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
                      to={`/admin/order/${oid}/more/transfer/step-3`}
                    >
                      <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                      &nbsp;Back to Step 3
                    </Link>
                  </div>
                  <div className="column is-half has-text-right">
                    <Link
                      className="button is-medium is-warning is-fullwidth-mobile"
                      to={`/admin/order/${oid}/more/transfer/step-5`}
                    >
                      Skip&nbsp;
                      <FontAwesomeIcon className="fas" icon={faForward} />
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

export default AdminOrderMoreTransferOperationStep4;
