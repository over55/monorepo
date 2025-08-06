import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faSearch,
  faTable,
  faPlus,
  faArrowLeft,
  faUserCircle,
  faGauge,
  faCircleInfo,
  faEllipsis,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAccountDetailAPI } from "../../../API/Account";
import FormErrorBox from "../../Reusable/FormErrorBox";
import AlertBanner from "../../Reusable/EveryPage/AlertBanner";
import BubbleLink from "../../Reusable/EveryPage/BubbleLink";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import { topAlertMessageState, topAlertStatusState } from "../../../AppState";
import { currentUserState } from "../../../AppState";
import {
    EXECUTIVE_ROLE_ID,
    MANAGEMENT_ROLE_ID,
    FRONTLINE_ROLE_ID,
    ASSOCIATE_ROLE_ID,
    CUSTOMER_ROLE_ID,
    ASSOCIATE_JOB_SEEKER_ROLE_ID
} from "../../../Constants/App";

function AccountMoreLaunchpad() {
  ////
  //// Global state.
  ////

  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [client, setClient] = useState({});
  const [tabIndex, setTabIndex] = useState(1);

  ////
  //// Event handling.
  ////

  const generateBreadcrumbItemLink = (currentUser) => {
    let dashboardLink;
    switch (currentUser.role) {
      case EXECUTIVE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case MANAGEMENT_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case FRONTLINE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case ASSOCIATE_ROLE_ID:
        dashboardLink = "/a/dashboard";
        break;
      case ASSOCIATE_JOB_SEEKER_ROLE_ID:
        dashboardLink = "/js/dashboard";
        break;
      case CUSTOMER_ROLE_ID:
        dashboardLink = "/c/dashboard";
        break;
      default:
        dashboardLink = "/501"; // Default or error handling
        break;
    }
    return dashboardLink;
  };

  ////
  //// API.
  ////

  function onAccountDetailSuccess(response) {
    console.log("onAccountDetailSuccess: Starting...");
    setCurrentUser(response);
  }

  function onAccountDetailError(apiErr) {
    console.log("onAccountDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAccountDetailDone() {
    console.log("onAccountDetailDone: Starting...");
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
      setErrors({});
      getAccountDetailAPI(
        onAccountDetailSuccess,
        onAccountDetailError,
        onAccountDetailDone,
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

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
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Profile (More)
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
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {client && client.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Profile
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {client && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
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

                {client && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/account`}>Detail</Link>
                        </li>
                        <li>
                          <Link to={`/account/2fa`}>2FA</Link>
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

                    {/* Page Menu Options (Tablet++) */}
                    <section className="hero is-hidden-mobile">
                      <div className="hero-body has-text-centered">
                        <div className="container">
                          <div className="columns is-vcentered is-multiline">
                            <div className="column">
                              <BubbleLink
                                title={`Change Password`}
                                subtitle={`Change the password credentials you use to log.`}
                                faIcon={faKey}
                                url={`/account/more/change-password`}
                                bgColour={`has-background-info-dark`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Page Menu Options (Mobile Only) */}
                    <div
                      className="has-background-white-ter is-hidden-tablet mb-6 p-5"
                      style={{ borderRadius: "15px" }}
                    >
                      <table className="is-fullwidth has-background-white-ter table">
                        <thead>
                          <tr>
                            <th colSpan="2">Menu</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <FontAwesomeIcon className="fas" icon={faKey} />
                              &nbsp;Change Password
                            </td>
                            <td>
                              <div className="buttons is-right">
                                <Link
                                  to={`/account/more/change-password`}
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
                          {/* End Associates */}
                        </tbody>
                      </table>
                    </div>
                    {/* END Page Menu Options (Mobile Only) */}

                    {/* Bottom Navigation */}
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-medium is-fullwidth-mobile"
                          to={generateBreadcrumbItemLink(currentUser)}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Clients
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

export default AccountMoreLaunchpad;
