import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
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
  faCogs,
  faUniversity
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getNorthAmericaIndustryClassificationSystemListAPI } from "../../../../API/NAICS";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  orderFilterStatusState,
  orderFilterTypeState,
  orderFilterSortState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  NAICS_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import { DEFAULT_NAICS_LIST_SORT_BY_VALUE } from "../../../../Constants/App";
import AdminSettingNAICSSearchResultDesktop from "./ResultDesktop";
import AdminSettingNAICSSearchResultMobile from "./ResultMobile";
import NationalOccupationalClassificationDetailModal from "./ModalDetail";


function AdminSettingNAICSSearchResult() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const actualSearchText = searchParams.get("q");
  const code = searchParams.get("c");
  const industryTitle = searchParams.get("it");

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] = useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] = useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [status, setStatus] = useRecoilState(orderFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(orderFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(orderFilterSortState); // Sorting

  ////
  //// Component states.
  ////

  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});
  const [users, setNAICSs] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showFilter, setShowFilter] = useState(false); // Filtering + Searching
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering
  const [showDetailModalForID, setShowDetailModalForID] = useState("")

  ////
  //// API.
  ////

  function onNAICSListSuccess(response) {
    console.log("onNAICSListSuccess: Starting...");
    if (response.results !== null) {
      setNAICSs(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onNAICSListError(apiErr) {
    console.log("onNAICSListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onNAICSListDone() {
    console.log("onNAICSListDone: Starting...");
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
    setSortByValue(DEFAULT_NAICS_LIST_SORT_BY_VALUE);
  };

  const fetchList = (
    cur,
    limit,
    keywords,
    so,
    s,
    t,
    c,
    it
  ) => {
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
    if (c !== undefined && c !== null && c !== "") {
      params.set("code", c);
    }
    if (it !== undefined && it !== null && it !== "") {
      params.set("it", it);
    }

    getNorthAmericaIndustryClassificationSystemListAPI(
      params,
      onNAICSListSuccess,
      onNAICSListError,
      onNAICSListDone,
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
      fetchList(
        currentCursor,
        pageSize,
        actualSearchText,
        sortByValue,
        status,
        type,
        code,
        industryTitle
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
  }, [
    onPageLoaded,
    currentCursor,
    pageSize,
    actualSearchText,
    sortByValue,
    status,
    type,
    code,
    industryTitle
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
              <li className="">
                <Link to="/admin/settings" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCogs} />
                  &nbsp;Settings
                </Link>
              </li>
              <li className="">
                <Link to="/admin/settings/naics/search" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUniversity} />
                  &nbsp;North American Industry Classification System
                </Link>
              </li>
              <li className="">
                <Link to="/admin/settings/naics/search" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faTable} />
                  &nbsp;Search Results
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
                <li className="">
                  <Link to="/admin/settings/naics/search" aria-current="page">
                    <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                    &nbsp;Back to Search
                  </Link>
                </li>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUniversity} />
            &nbsp;North American Industry Classification System
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Search
          </h4>
          <hr />

          {/* Page Modal(s) */}
          <NationalOccupationalClassificationDetailModal
            currentUser={currentUser}
            showDetailModalForID={showDetailModalForID}
            setShowDetailModalForID={setShowDetailModalForID}
          />

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
              <div className="columns is-12">
                <div className="column is-half">
                  <h1 className="subtitle is-5 is-underlined">
                    <FontAwesomeIcon className="fas" icon={faFilter} />
                    &nbsp;Filtering & Sorting
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
                {/*
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
                */}
                <div className="column">
                  <FormSelectField
                    label="Sort by"
                    name="sortByValue"
                    placeholder="Pick sorting"
                    selectedValue={sortByValue}
                    helpText=""
                    onChange={(e) => setSortByValue(e.target.value)}
                    options={NAICS_SORT_OPTIONS}
                    isRequired={true}
                  />
                </div>
              </div>
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
                  <div className="container">
                    {/*
                        ##################################################################
                        EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                        ##################################################################
                    */}
                    <div className="is-hidden-touch">
                      <AdminSettingNAICSSearchResultDesktop
                        listData={users}
                        showDetailModalForID={showDetailModalForID}
                        setShowDetailModalForID={setShowDetailModalForID}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                      />
                    </div>

                    {/*
                        ###########################################################################
                        EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                        ###########################################################################
                    */}
                    <div className="is-fullwidth is-hidden-desktop">
                      <AdminSettingNAICSSearchResultMobile
                        listData={users}
                        showDetailModalForID={showDetailModalForID}
                        setShowDetailModalForID={setShowDetailModalForID}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                      />
                    </div>
                  </div>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">
                        <FontAwesomeIcon className="fas" icon={faTable} />
                        &nbsp;No NAICSs.
                      </p>
                      <p className="subtitle">
                        No NAICSs have been returned.{" "}
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
                  to={`/admin/settings/naics/search`}
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Search
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

export default AdminSettingNAICSSearchResult;
