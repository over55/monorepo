import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faBuilding,
  faEnvelope,
  faSquarePhone,
  faTable,
  faHome,
  faImage,
  faEllipsis,
  faRepeat,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAccountDetailAPI } from "../../../API/Account";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../Reusable/EveryPage/CheckboxTextFormatter";
import SelectTextFormatter from "../../Reusable/EveryPage/SelectTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import TagsTextFormatter from "../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../Constants/App";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../Constants/FieldOptions";
import AccountExecutiveStaffDetail from "./ExecutiveStaff";
import AccountManagementOrFrontlineStaffDetail from "./ManagementOrFrontlineStaff";

function AccountDetail() {
  ////
  ////
  ////

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  //

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
  //// BREADCRUMB
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
      case CUSTOMER_ROLE_ID:
        dashboardLink = "/dashboard";
        break;
      default:
        dashboardLink = "/501"; // Default or error handling
        break;
    }
    return dashboardLink;
  };

  const breadcrumbItems = {
    items: [
      {
        text: "Dashboard",
        link: generateBreadcrumbItemLink(currentUser),
        isActive: false,
        icon: faGauge,
      },
      { text: "Account", link: "/account", icon: faUserCircle, isActive: true },
    ],
    mobileBackLinkItems: {
      link: generateBreadcrumbItemLink(currentUser),
      text: "Back to Dashboard",
      icon: faArrowLeft,
    },
  };

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
                  &nbsp;Profile
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
            {currentUser && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
                  </p>
                </div>
                <div className="column has-text-right">
                  <Link
                    to={`/account/edit`}
                    className="button is-small is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={currentUser.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                  </Link>
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {currentUser && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li className="is-active">
                          <Link>Detail</Link>
                        </li>
                        <li>
                          <Link to={`/account/2fa`}>2FA</Link>
                        </li>
                        <li>
                          <Link to={`/account/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {(() => {
                      switch (currentUser.role) {
                        case EXECUTIVE_ROLE_ID:
                          return (
                            <AccountExecutiveStaffDetail
                              currentUser={currentUser}
                            />
                          );
                        case FRONTLINE_ROLE_ID:
                          return (
                            <AccountManagementOrFrontlineStaffDetail
                              currentUser={currentUser}
                            />
                          );
                        case MANAGEMENT_ROLE_ID:
                          return (
                            <AccountManagementOrFrontlineStaffDetail
                              currentUser={currentUser}
                            />
                          );
                        default:
                          return <p>Unsupported view</p>;
                      }
                    })()}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-medium is-fullwidth-mobile"
                          to={generateBreadcrumbItemLink(currentUser)}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Dashboard
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/account/edit`}
                          className="button is-medium is-warning is-fullwidth-mobile"
                          disabled={currentUser.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </div>
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

export default AccountDetail;
