import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faTachometer,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faGauge,
  faArrowRight,
  faTable,
  faBuilding,
  faRefresh,
  faFilter,
  faSearch,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getTenantListAPI, deleteTenantAPI } from "../../../API/Tenant";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import FormErrorBox from "../../Reusable/FormErrorBox";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../Reusable/FormSelectField";
import FormDateField from "../../Reusable/FormDateField";
import { ORGANIZATION_STATUS_LIST_OPTIONS } from "../../../Constants/FieldOptions";
import RootTenantListDesktop from "./ListDesktop";
import RootTenantListMobile from "./ListMobile";

function RootTenantList() {
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

  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [tenants, setTenants] = useState("");
  const [selectedTenantForDeletion, setSelectedTenantForDeletion] =
    useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [sortField, setSortField] = useState("created"); // Sorting
  const [temporarySearchText, setTemporarySearchText] = useState(""); // Searching - The search field value as your writes their query.
  const [actualSearchText, setActualSearchText] = useState(""); // Searching - The actual search query value to submit to the API.
  const [status, setStatus] = useState(""); // Filtering
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering

  ////
  //// API.
  ////

  function onTenantListSuccess(response) {
    console.log("onTenantListSuccess: Starting...");
    console.log("onComicSubmissionListSuccess: response:", response);
    if (response.results !== null) {
      setTenants(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onTenantListError(apiErr) {
    console.log("onTenantListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTenantListDone() {
    console.log("onTenantListDone: Starting...");
    setFetching(false);
  }

  function onTenantDeleteSuccess(response) {
    console.log("onTenantDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Tenant deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    fetchList(currentCursor, pageSize, actualSearchText, status, createdAtGTE);
  }

  function onTenantDeleteError(apiErr) {
    console.log("onTenantDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onTenantDeleteError: topAlertMessage, topAlertStatus:",
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

  function onTenantDeleteDone() {
    console.log("onTenantDeleteDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (cur, limit, keywords, s, cagte) => {
    setFetching(true);
    setErrors({});

    let params = new Map();
    params.set("page_size", limit); // Pagination
    params.set("sort_field", "created"); // Sorting

    if (cur !== "") {
      // Pagination
      params.set("cursor", cur);
    }

    // Filtering
    if (keywords !== undefined && keywords !== null && keywords !== "") {
      // Searhcing
      params.set("search", keywords);
    }
    if (s !== undefined && s !== null && s !== "") {
      params.set("status", s);
    }
    if (cagte !== undefined && cagte !== null && cagte !== "") {
      const cagteStr = cagte.getTime();
      params.set("created_at_gte", cagteStr);
    }

    getTenantListAPI(
      params,
      onTenantListSuccess,
      onTenantListError,
      onTenantListDone,
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

  const onSelectTenantForDeletion = (e, tenant) => {
    console.log("onSelectTenantForDeletion", tenant);
    setSelectedTenantForDeletion(tenant);
  };

  const onDeselectTenantForDeletion = (e) => {
    console.log("onDeselectTenantForDeletion");
    setSelectedTenantForDeletion("");
  };

  const onSearchButtonClick = (e) => {
    // Searching
    console.log("Search button clicked...");
    setActualSearchText(temporarySearchText);
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteTenantAPI(
      selectedTenantForDeletion.id,
      onTenantDeleteSuccess,
      onTenantDeleteError,
      onTenantDeleteDone,
      onUnauthorized,
    );
    setSelectedTenantForDeletion("");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
      fetchList(
        currentCursor,
        pageSize,
        actualSearchText,
        status,
        createdAtGTE,
      );
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, actualSearchText, status, createdAtGTE]);

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
                <Link to="/root/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Root Dashboard
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faBuilding} />
                  &nbsp;Tenants
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
                <Link to="/root/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Page Title + Options */}
            <div className="columns">
              <div className="column">
                <h1 className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faBuilding} />
                  &nbsp;Tenants List
                </h1>
              </div>
              <div className="column has-text-right">
                <button
                  onClick={() =>
                    fetchList(
                      currentCursor,
                      pageSize,
                      actualSearchText,
                      status,
                      createdAtGTE,
                    )
                  }
                  className="button is-small is-info is-fullwidth-mobile"
                  type="button"
                >
                  <FontAwesomeIcon className="mdi" icon={faRefresh} />
                  &nbsp;
                  <span className="is-hidden-desktop is-hidden-tablet">
                    Refresh
                  </span>
                </button>
                &nbsp;
                <Link
                  className="button is-small is-success is-fullwidth-mobile"
                  type="button"
                  disabled={true}
                >
                  <FontAwesomeIcon className="mdi" icon={faPlus} />
                  &nbsp;New Tenant
                </Link>
              </div>
            </div>

            {showFilter && (
              <div
                className="columns has-background-white-bis"
                style={{ borderRadius: "15px", padding: "20px" }}
              >
                <div className="column">
                  <FormInputFieldWithButton
                    label={"Search"}
                    name="temporarySearchText"
                    type="text"
                    placeholder="Search by name"
                    value={temporarySearchText}
                    helpText=""
                    onChange={(e) => setTemporarySearchText(e.target.value)}
                    isRequired={true}
                    maxWidth="100%"
                    buttonLabel={
                      <>
                        <FontAwesomeIcon className="fas" icon={faSearch} />
                      </>
                    }
                    onButtonClick={onSearchButtonClick}
                  />
                </div>
                <div className="column">
                  <FormSelectField
                    label="Status"
                    name="status"
                    placeholder="Pick status"
                    selectedValue={status}
                    helpText=""
                    onChange={(e) => setStatus(parseInt(e.target.value))}
                    options={ORGANIZATION_STATUS_LIST_OPTIONS}
                    isRequired={true}
                  />
                </div>
                <div className="column">
                  <FormDateField
                    label="Created After"
                    name="createdAtGTE"
                    placeholder="Text input"
                    value={createdAtGTE}
                    helpText=""
                    onChange={(date) => setCreatedAtGTE(date)}
                    isRequired={true}
                    maxWidth="120px"
                  />
                </div>
              </div>
            )}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {tenants &&
                tenants.results &&
                (tenants.results.length > 0 || previousCursors.length > 0) ? (
                  <div className="container">
                    {/*
                        ##################################################################
                        EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                        ##################################################################
                    */}
                    <div className="is-hidden-touch">
                      <RootTenantListDesktop
                        listData={tenants}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        onSelectTenantForDeletion={onSelectTenantForDeletion}
                      />
                    </div>

                    {/*
                        ###########################################################################
                        EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                        ###########################################################################
                    */}
                    <div className="is-fullwidth is-hidden-desktop">
                      <RootTenantListMobile
                        listData={tenants}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        onSelectTenantForDeletion={onSelectTenantForDeletion}
                      />
                    </div>
                  </div>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">
                        <FontAwesomeIcon className="fas" icon={faTable} />
                        &nbsp;No Tenants
                      </p>
                      <p className="subtitle">
                        No tenants.{" "}
                        <b>
                          <Link to="/root/tenants/add">
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first tenant.
                      </p>
                    </div>
                  </section>
                )}
              </>
            )}
          </nav>

          {/* Bottom Page Logout Link  */}
          <div className="has-text-right has-text-grey">
            <Link to="/logout" className="has-text-grey">
              Logout&nbsp;
              <FontAwesomeIcon className="mdi" icon={faArrowRight} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default RootTenantList;
