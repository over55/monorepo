import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faFilterCircleXmark,
  faArrowLeft,
  faNewspaper,
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

import {
  getBulletinListAPI,
  deleteBulletinAPI,
} from "../../../../API/Bulletin";
import {
  topAlertMessageState,
  topAlertStatusState,
  bulletinFilterStatusState,
  bulletinFilterTypeState,
  bulletinFilterSortState,
  bulletinDetailState,
  currentUserState,
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
  BULLETIN_SORT_OPTIONS,
  BULLETIN_STATUS_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import { DEFAULT_BULLETIN_LIST_SORT_BY_VALUE } from "../../../../Constants/App";
import AdminSettingBulletinListDesktop from "./ListDesktop";
import AdminSettingBulletinListMobile from "./ListMobile";
import BulletinDetailModal from "./ModalDetail";
import BulletinCreateModal from "./ModalCreate";

function AdminSettingBulletinList() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [status, setStatus] = useRecoilState(bulletinFilterStatusState); // Filtering
  const [type, setType] = useRecoilState(bulletinFilterTypeState); // Filtering
  const [sortByValue, setSortByValue] = useRecoilState(bulletinFilterSortState); // Sorting
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////
  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [users, setBulletins] = useState("");
  const [selectedBulletinForDeletion, setSelectedBulletinForDeletion] =
    useState("");
  const [temporarySearchText, setTemporarySearchText] = useState(""); // Searching - The search field value as your writes their query.
  const [actualSearchText, setActualSearchText] = useState(""); // Searching - The actual search query value to submit to the API.
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [showDetailModalForBulletinID, setShowDetailModalBulletinID] =
    useState("");
  const [showUpdateModalForBulletinID, setShowUpdateModalForBulletinID] =
    useState("");
  const [showDeleteModalForBulletinID, setShowDeleteModalForBulletinID] =
    useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  ////
  //// API.
  ////

  function onBulletinListSuccess(response) {
    console.log("onBulletinListSuccess: Starting...");
    if (response.results !== null) {
      setBulletins(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor); // For pagination purposes.
      }
    }
  }

  function onBulletinListError(apiErr) {
    console.log("onBulletinListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onBulletinListDone() {
    console.log("onBulletinListDone: Starting...");
    setFetching(false);
  }

  function onBulletinDeleteSuccess(response) {
    console.log("onBulletinDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Bulletin deleted");
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
      sortByValue,
      status,
      type,
    );
  }

  function onBulletinDeleteError(apiErr) {
    console.log("onBulletinDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onBulletinDeleteError: topAlertMessage, topAlertStatus:",
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

  function onBulletinDeleteDone() {
    console.log("onBulletinDeleteDone: Starting...");
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
    setStatus(1);
    setSortByValue(DEFAULT_BULLETIN_LIST_SORT_BY_VALUE);
    setActualSearchText("");
    setTemporarySearchText("");
  };

  const fetchList = (cur, limit, keywords, so, s, t) => {
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

    getBulletinListAPI(
      params,
      onBulletinListSuccess,
      onBulletinListError,
      onBulletinListDone,
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

  const onSelectBulletinForDeletion = (e, user) => {
    console.log("onSelectBulletinForDeletion", user);
    setSelectedBulletinForDeletion(user);
  };

  const onDeselectBulletinForDeletion = (e) => {
    console.log("onDeselectBulletinForDeletion");
    setSelectedBulletinForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteBulletinAPI(
      selectedBulletinForDeletion.id,
      onBulletinDeleteSuccess,
      onBulletinDeleteError,
      onBulletinDeleteDone,
      onUnauthorized,
    );
    setSelectedBulletinForDeletion("");
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
    sortByValue,
    status,
    type,
    actualSearchText,
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
          {/* Modals */}
          <BulletinDetailModal
            currentUser={currentUser}
            showDetailModalForBulletinID={showDetailModalForBulletinID}
            setShowDetailModalBulletinID={setShowDetailModalBulletinID}
            showUpdateModalForBulletinID={showUpdateModalForBulletinID}
            setShowUpdateModalForBulletinID={setShowUpdateModalForBulletinID}
            showDeleteModalForBulletinID={showDeleteModalForBulletinID}
            setShowDeleteModalForBulletinID={setShowDeleteModalForBulletinID}
            onUpdated={(e) => {
              console.log("Refreshing list b/c of modification");
              fetchList(
                currentCursor,
                pageSize,
                actualSearchText,
                sortByValue,
                status,
                type,
              );
              window.scrollTo(0, 0); // Start the page at the top of the page.
            }}
            onDeleted={(e) => {
              console.log("Refreshing list b/c of deletion");
              setShowUpdateModalForBulletinID(""); // Close this modal.
              setShowDetailModalBulletinID(""); // Close this modal.
              setShowDeleteModalForBulletinID(""); // Close this modal.

              fetchList(
                currentCursor,
                pageSize,
                actualSearchText,
                sortByValue,
                status,
                type,
              );

              window.scrollTo(0, 0); // Start the page at the top of the page.
            }}
          />
          <BulletinCreateModal
            currentUser={currentUser}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            onCreated={(e) => {
              console.log("Refreshing list b/c of creation");
              fetchList(
                currentCursor,
                pageSize,
                actualSearchText,
                sortByValue,
                status,
                type,
              );
              window.scrollTo(0, 0); // Start the page at the top of the page.
            }}
          />

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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faNewspaper} />
                  &nbsp;Bulletins
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
            <FontAwesomeIcon className="fas" icon={faNewspaper} />
            &nbsp;Bulletins
          </h1>
          <hr />

          {/* Page Modal(s) */}
          <div
            className={`modal ${selectedBulletinForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectBulletinForDeletion}
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
                  onClick={onDeselectBulletinForDeletion}
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
              <div className="column has-text-right">
                <button
                  className="button is-primary is-fullwidth-mobile"
                  type="button"
                  onClick={(e) => {
                    setShowCreateModal(!showCreateModal);
                  }}
                >
                  <FontAwesomeIcon className="mdi" icon={faPlus} />
                  &nbsp;New
                </button>
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
                    onButtonClick={(e) => {
                      setActualSearchText(temporarySearchText);
                    }}
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
                    options={BULLETIN_STATUS_FILTER_OPTIONS}
                    isRequired={true}
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
                    options={BULLETIN_SORT_OPTIONS}
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
                      <AdminSettingBulletinListDesktop
                        listData={users}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        onSelectBulletinForDeletion={
                          onSelectBulletinForDeletion
                        }
                        sortByValue={sortByValue}
                        showDetailModalForBulletinID={
                          showDetailModalForBulletinID
                        }
                        setShowDetailModalBulletinID={
                          setShowDetailModalBulletinID
                        }
                      />
                    </div>

                    {/*
                                            ###########################################################################
                                            EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                                            ###########################################################################
                                        */}
                    <div className="is-fullwidth is-hidden-desktop">
                      <AdminSettingBulletinListMobile
                        listData={users}
                        setPageSize={setPageSize}
                        pageSize={pageSize}
                        previousCursors={previousCursors}
                        onPreviousClicked={onPreviousClicked}
                        onNextClicked={onNextClicked}
                        onSelectBulletinForDeletion={
                          onSelectBulletinForDeletion
                        }
                        showDetailModalForBulletinID={
                          showDetailModalForBulletinID
                        }
                        setShowDetailModalBulletinID={
                          setShowDetailModalBulletinID
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">
                        <FontAwesomeIcon className="fas" icon={faTable} />
                        &nbsp;No Bulletins
                      </p>
                      <p className="subtitle">
                        No bulletins.{" "}
                        <b>
                          <Link
                            onClick={(e) => {
                              setShowCreateModal(!showCreateModal);
                            }}
                          >
                            Click here&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faArrowRight}
                            />
                          </Link>
                        </b>{" "}
                        to get started creating your first bulletin.
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
                  to={`/admin/settings`}
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Settings
                </Link>
              </div>
              <div className="column is-half has-text-right">
                <button
                  className="button is-fullwidth-mobile is-primary"
                  onClick={(e) => {
                    setShowCreateModal(!showCreateModal);
                  }}
                >
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
                </button>
              </div>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminSettingBulletinList;
