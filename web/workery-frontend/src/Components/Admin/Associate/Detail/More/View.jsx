import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faBuildingUser,
  faMobile,
  faImage,
  faPaperclip,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faHardHat,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faEllipsis,
  faArchive,
  faBoxOpen,
  faTrashCan,
  faHomeUser,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getAssociateDetailAPI } from "../../../../../API/Associate";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../../Reusable/DataDisplayRowText";
import DataDisplayRowSelect from "../../../../Reusable/DataDisplayRowSelect";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import BubbleLink from "../../../../Reusable/EveryPage/BubbleLink";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";
import { COMMERCIAL_ASSOCIATE_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../Constants/FieldOptions";

function AdminAssociateDetailMore() {
  ////
  //// URL Parameters.
  ////

  const { aid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [associate, setAssociate] = useState({});
  const [tabIndex, setTabIndex] = useState(1);

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setAssociate(response);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
    setFetching(false);
  }

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getAssociateDetailAPI(aid, onSuccess, onError, onDone);
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail
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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Associates
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {associate && associate.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associate
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {associate && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    More&nbsp;
                    <FontAwesomeIcon className="fas" icon={faEllipsis} />
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {associate && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/admin/associate/${associate.id}`}>
                            Summary
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/associate/${associate.id}/detail`}>
                            Detail
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/associate/${associate.id}/orders`}>
                            Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={`/admin/associate/${associate.id}/comments`}
                          >
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={`/admin/associate/${associate.id}/attachments`}
                          >
                            Attachments
                          </Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>
                              More&nbsp;&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faEllipsis}
                              />
                            </strong>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Page Menu Options */}
                    <section className="hero ">
                      <div className="hero-body has-text-centered">
                        <div className="container">
                          <div className="columns is-vcentered is-multiline">
                            {associate.status === 1 && (
                              <div className="column">
                                <BubbleLink
                                  title={`Photo`}
                                  subtitle={`Upload a photo of the associate`}
                                  faIcon={faImage}
                                  url={`/admin/associate/${aid}/avatar`}
                                  bgColour={`has-background-danger-dark`}
                                />
                              </div>
                            )}
                            {associate.status === 2 ? (
                              <div className="column">
                                <BubbleLink
                                  title={`Unarchive`}
                                  subtitle={`Make associate visible in list and search results`}
                                  faIcon={faBoxOpen}
                                  url={`/admin/associate/${aid}/unarchive`}
                                  bgColour={`has-background-success-dark`}
                                />
                              </div>
                            ) : (
                              <div className="column">
                                <BubbleLink
                                  title={`Archive`}
                                  subtitle={`Make associate hidden from list and search results`}
                                  faIcon={faArchive}
                                  url={`/admin/associate/${aid}/archive`}
                                  bgColour={`has-background-success-dark`}
                                />
                              </div>
                            )}
                            {associate.status === 1 && (
                              <>
                                {associate.type ===
                                COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                                  <div className="column">
                                    <BubbleLink
                                      title={`Downgrade`}
                                      subtitle={`Change associate to become residential associate`}
                                      faIcon={faHomeUser}
                                      url={`/admin/associate/${aid}/downgrade`}
                                      bgColour={`has-background-info-dark`}
                                    />
                                  </div>
                                ) : (
                                  <div className="column">
                                    <BubbleLink
                                      title={`Upgrade`}
                                      subtitle={`Change associate to become business associate`}
                                      faIcon={faBuildingUser}
                                      url={`/admin/associate/${aid}/upgrade`}
                                      bgColour={`has-background-info-dark`}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                            {associate.status === 1 && (
                              <>
                                <div className="column">
                                  <BubbleLink
                                    title={`Delete`}
                                    subtitle={`Permanently delete this associate and all associated data`}
                                    faIcon={faTrashCan}
                                    url={`/admin/associate/${aid}/permadelete`}
                                    bgColour={`has-background-danger`}
                                  />
                                </div>
                                <div className="column">
                                  <BubbleLink
                                    title={`Password`}
                                    subtitle={`Change or reset the associate\'s password for their account`}
                                    faIcon={faKey}
                                    url={`/admin/associate/${aid}/change-password`}
                                    bgColour={`has-background-danger-dark`}
                                  />
                                </div>
                                <div className="column">
                                  <BubbleLink
                                    title={`2FA`}
                                    subtitle={`Enable or disable two-factor authentication`}
                                    faIcon={faMobile}
                                    url={`/admin/associate/${aid}/change-2fa`}
                                    bgColour={`has-background-dark`}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Bottom Navigation */}
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/associates`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Associates
                        </Link>
                      </div>
                      <div className="column is-half has-text-right"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminAssociateDetailMore;
