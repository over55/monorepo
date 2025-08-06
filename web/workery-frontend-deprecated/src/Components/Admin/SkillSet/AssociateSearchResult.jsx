import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faFilterCircleXmark,
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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAssociateListAPI } from "../../../API/Associate";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  // associateFilterJoinDatetState,
  associateFilterStatusState,
  associateFilterTypeState,
  associateFilterSortState,
} from "../../../AppState";
import FormErrorBox from "../../Reusable/FormErrorBox";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../Reusable/FormSelectField";
import FormDateField from "../../Reusable/FormDateField";
import BubbleLink from "../../Reusable/EveryPage/BubbleLink";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  ASSOCIATE_SORT_OPTIONS,
  ASSOCIATE_STATUS_FILTER_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
} from "../../../Constants/FieldOptions";
import {
  DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  DEFAULT_ASSOCIATE_STATUS_FILTER_OPTION,
} from "../../../Constants/App";
import AdminAssociateSkillSetSearchResultDesktop from "./ListDesktop";
import AdminAssociateSkillSetSearchResultMobile from "./ListMobile";

function AdminAssociateSkillSetSearchResult() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const skillSetIDsStr = searchParams.get("ssids");
  const targetSkillSetIDs = skillSetIDsStr.split(",");
  const searchType = searchParams.get("type");

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

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Event handling.
  ////

  const fetchList = (
    cur,
    limit,
    keywords,
    so,
    s,
    t,
    j,
    ssidstring,
    ssidtype,
  ) => {
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

    // DEVELOPERS NOTE:
    // Our api endpoint is looking for concatinated list of skill set ids
    // for example `all_skill_set_ids=xxx,yyy,zzz` therefore we can just
    // use this value as is and it'll work.
    if (ssidtype === "all") {
      params.set("all_skill_set_ids", skillSetIDsStr);
    } else if (ssidtype === "in") {
      params.set("in_skill_set_ids", skillSetIDsStr);
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

  // Function resets the filter state to its default state.
  const onClearFilterClick = (e) => {
    // Prevent the default behavior of the link
    e.preventDefault();

    setJoinDatetGTE(null);
    setType(0);
    setStatus(1);
    setSortByValue(DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE);
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
        skillSetIDsStr,
        searchType,
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
    skillSetIDsStr,
    searchType,
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
                <Link to="/admin/skill-sets" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGraduationCap} />
                  &nbsp;Skill Sets
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Results
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
                <Link to="/admin/skill-sets" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Skill Sets
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faGraduationCap} />
            &nbsp;Skill Sets
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Results
          </h4>
          <hr />

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
            </div>

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
                  <div className="container">
                    {/*
                                            ##################################################################
                                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                                            ##################################################################
                                        */}
                    <div className="is-hidden-touch">
                      <AdminAssociateSkillSetSearchResultDesktop
                        listData={associates}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        sortByValue={sortByValue}
                        targetSkillSetIDs={targetSkillSetIDs}
                      />
                    </div>

                    {/*
                                            ###########################################################################
                                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                                            ###########################################################################
                                        */}
                    <div className="is-fullwidth is-hidden-desktop">
                      <AdminAssociateSkillSetSearchResultMobile
                        listData={associates}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        targetSkillSetIDs={targetSkillSetIDs}
                      />
                    </div>
                  </div>
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
                  className="button is-medium is-fullwidth-mobile"
                  to="/admin/skill-sets"
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Search Again
                </Link>
                &nbsp;
              </div>
              <div className="column is-half has-text-right"></div>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminAssociateSkillSetSearchResult;
