import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHardHat,
  faUser,
  faQuestionCircle,
  faCogs,
  faUserTie,
  faChartBar,
  faCreditCard,
  faTags,
  faGraduationCap,
  faWrench,
  faBars,
  faBook,
  faRightFromBracket,
  faTachometer,
  faTasks,
  faSignOut,
  faUserCircle,
  faUsers,
  faBuilding,
  faBarcode,
  faFire,
  faBriefcase,
  faSearch,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import {
  onHamburgerClickedState,
  currentUserState,
  taskItemActiveCountState,
} from "../../AppState";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID
} from "../../Constants/App";

export default (props) => {
  ////
  //// Global State
  ////

  const [onHamburgerClicked, setOnHamburgerClicked] = useRecoilState(
    onHamburgerClickedState,
  );
  const [currentUser] = useRecoilState(currentUserState);
  const [taskItemActiveCount] = useRecoilState(taskItemActiveCountState);

  ////
  //// Local State
  ////

  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  ////
  //// Events
  ////

  // onLinkClick function will check to see if we are on a mobile device and if we are then we will close the hanburger menu.
  const onLinkClickCloseHamburgerMenuIfMobile = (e) => {
    // Special thanks to: https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      // document.write("mobile");
      setOnHamburgerClicked(false);
    } else {
      // document.write("not mobile");
    }
  };

  ////
  //// Rendering.
  ////

  //-------------//
  // CASE 1 OF 3 //
  //-------------//

  // Get the current location and if we are at specific URL paths then we
  // will not render this component.
  const ignorePathsArr = [
    "/",
    "/register",
    "/register-successful",
    "/index",
    "/login",
    "/login/2fa",
    "/login/2fa/step-1",
    "/login/2fa/step-2",
    "/login/2fa/step-3",
    "/login/2fa/step-3/backup-code",
    "/login/2fa/backup-code",
    "/login/2fa/backup-code-recovery",
    "/logout",
    "/verify",
    "/forgot-password",
    "/password-reset",
    "/root/dashboard",
    "/root/tenants",
    "/root/tenant",
    "/terms",
    "/privacy",
  ];
  const location = useLocation();
  var arrayLength = ignorePathsArr.length;
  for (var i = 0; i < arrayLength; i++) {
    // console.log(location.pathname, "===", ignorePathsArr[i], " EQUALS ", location.pathname === ignorePathsArr[i]);
    if (location.pathname === ignorePathsArr[i]) {
      return null;
    }
  }

  //-------------//
  // CASE 2 OF 3 //
  //-------------//

  if (currentUser === null) {
    return null;
  }

  //-------------//
  // CASE 3 OF 3 //
  //-------------//

  return (
    <>
      <div className={`modal ${showLogoutWarning ? "is-active" : ""}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Are you sure?</p>
            <button
              className="delete"
              aria-label="close"
              onClick={(e) => setShowLogoutWarning(false)}
            ></button>
          </header>
          <section className="modal-card-body">
            You are about to log out of the system and you'll need to log in
            again next time. Are you sure you want to continue?
          </section>
          <footer className="modal-card-foot">
            <Link className="button is-success" to={`/logout`}>
              Yes
            </Link>
            <button
              className="button"
              onClick={(e) => setShowLogoutWarning(false)}
            >
              No
            </button>
          </footer>
        </div>
      </div>
      {/*
          -----
          STAFF
          -----

          ######################################################################
          ######################################################################
          ######################################################################
      */}
      {(currentUser.role === EXECUTIVE_ROLE_ID ||
        currentUser.role === MANAGEMENT_ROLE_ID ||
        currentUser.role === FRONTLINE_ROLE_ID) && (
        <div
          className={`column is-one-fifth has-background-black ${onHamburgerClicked ? "" : "is-hidden"}`}
        >
          <nav className="level is-hidden-mobile">
            <div className="level-item has-text-centered">
              <figure className="image">
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <img
                    src="/img/compressed-logo.png"
                    style={{ maxWidth: "200px" }}
                  />
                </Link>
              </figure>
            </div>
          </nav>
          <aside className="menu p-4">
            <p className="menu-label has-text-grey-light">Staff</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faTachometer} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/tasks"
                  className={`has-text-grey-light ${location.pathname.includes("task") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
                  {taskItemActiveCount > 0 && (
                    <>&nbsp;({taskItemActiveCount})</>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/clients"
                  className={`has-text-grey-light ${location.pathname.includes("client") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/associates"
                  className={`has-text-grey-light ${location.pathname.includes("associate") && !location.pathname.includes("settings") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/orders"
                  className={`has-text-grey-light ${location.pathname.includes("order") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Work Orders
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/skill-sets"
                  className={`has-text-grey-light ${location.pathname.includes("skill-set") && !location.pathname.includes("setting") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faGraduationCap} />
                  &nbsp;Skill Sets
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/incidents"
                  className={`has-text-grey-light ${location.pathname.includes("incidents") && !location.pathname.includes("order") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faFire} />
                  &nbsp;Incidents
                </Link>
              </li>
              <li>
                {/*
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/incidents"
                  className={`has-text-grey-light ${location.pathname.includes("incident") && !location.pathname.includes("setting") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faFire} />
                  &nbsp;Incidents <span class="tag is-success">NEW</span>

                </Link>
                */}
              </li>
              {/*
                <li>
                    <Link to="/admin/tags" className={`has-text-grey-light ${location.pathname.includes("tag") && !location.pathname.includes("setting") && "is-active"}`}>
                        <FontAwesomeIcon className="fas" icon={faTags} />&nbsp;Tags
                    </Link>
                </li>
                */}
            </ul>

            <p className="menu-label has-text-grey-light">Administration</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/financials"
                  className={`has-text-grey-light ${location.pathname.includes("financial") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;Financials
                </Link>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/reports"
                  className={`has-text-grey-light ${location.pathname.includes("report") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faChartBar} />
                  &nbsp;Reports
                </Link>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/staff"
                  className={`has-text-grey-light ${location.pathname.includes("staff") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUserTie} />
                  &nbsp;Staff
                </Link>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/settings"
                  className={`has-text-grey-light ${location.pathname.includes("setting") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faCogs} />
                  &nbsp;Settings
                </Link>
              </li>
            </ul>

            <p className="menu-label has-text-grey-light">Account</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/admin/help"
                  className={`has-text-grey-light ${location.pathname.includes("help") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                  &nbsp;Help
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/account"
                  className={`has-text-grey-light ${location.pathname.includes("account") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUser} />
                  &nbsp;My Profile
                </Link>
              </li>
              <li>
                <a
                  onClick={(e) => setShowLogoutWarning(true)}
                  className={`has-text-grey-light ${location.pathname.includes("logout") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faSignOut} />
                  &nbsp;Sign Off
                </a>
              </li>
            </ul>
          </aside>
        </div>
      )}

       {/*
          --------------------
          CUSTOMER (Original)
          --------------------

          ######################################################################
          ######################################################################
          ######################################################################
      */}
      {currentUser.role === CUSTOMER_ROLE_ID && (
        <div
          className={`column is-one-fifth has-background-black ${onHamburgerClicked ? "" : "is-hidden"}`}
        >
          <nav className="level is-hidden-mobile">
            <div className="level-item has-text-centered">
              <figure className="image">
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/c/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <img
                    src="/img/compressed-logo.png"
                    style={{ maxWidth: "200px" }}
                  />
                </Link>
              </figure>
            </div>
          </nav>
          <aside className="menu p-4">
            <p className="menu-label has-text-grey-light">Member</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/c/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faTachometer} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/c/orders"
                  className={`has-text-grey-light ${location.pathname.includes("order") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;My Service Requests
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/c/financials"
                  className={`has-text-grey-light ${location.pathname.includes("financial") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;My Financials
                </Link>
              </li>
            </ul>

            <p className="menu-label has-text-grey-light">Account</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/c/help"
                  className={`has-text-grey-light ${location.pathname.includes("help") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                  &nbsp;Help
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/account"
                  className={`has-text-grey-light ${location.pathname.includes("account") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUser} />
                  &nbsp;My Profile
                </Link>
              </li>
              <li>
                <a
                  onClick={(e) => setShowLogoutWarning(true)}
                  className={`has-text-grey-light ${location.pathname.includes("logout") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faSignOut} />
                  &nbsp;Sign Off
                </a>
              </li>
            </ul>
          </aside>
        </div>
      )}

      {/*
          --------------------
          ASSOCIATE (Original)
          --------------------

          ######################################################################
          ######################################################################
          ######################################################################
      */}
      {currentUser.role === ASSOCIATE_ROLE_ID && (
        <div
          className={`column is-one-fifth has-background-black ${onHamburgerClicked ? "" : "is-hidden"}`}
        >
          <nav className="level is-hidden-mobile">
            <div className="level-item has-text-centered">
              <figure className="image">
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <img
                    src="/img/compressed-logo.png"
                    style={{ maxWidth: "200px" }}
                  />
                </Link>
              </figure>
            </div>
          </nav>
          <aside className="menu p-4">
            <p className="menu-label has-text-grey-light">Associate</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/dashboard"
                  className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faTachometer} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/orders"
                  className={`has-text-grey-light ${location.pathname.includes("order") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;My Work Orders
                </Link>
              </li>

              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/financials"
                  className={`has-text-grey-light ${location.pathname.includes("financial") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faCreditCard} />
                  &nbsp;My Financials
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/clients"
                  className={`has-text-grey-light ${location.pathname.includes("client") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;My Clients
                </Link>
              </li>
            </ul>

            <p className="menu-label has-text-grey-light">Account</p>
            <ul className="menu-list">
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/a/help"
                  className={`has-text-grey-light ${location.pathname.includes("help") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                  &nbsp;Help
                </Link>
              </li>
              <li>
                <Link
                  onClick={onLinkClickCloseHamburgerMenuIfMobile}
                  to="/account"
                  className={`has-text-grey-light ${location.pathname.includes("account") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faUser} />
                  &nbsp;My Profile
                </Link>
              </li>
              <li>
                <a
                  onClick={(e) => setShowLogoutWarning(true)}
                  className={`has-text-grey-light ${location.pathname.includes("logout") && "is-active"}`}
                >
                  <FontAwesomeIcon className="fas" icon={faSignOut} />
                  &nbsp;Sign Off
                </a>
              </li>
            </ul>
          </aside>
        </div>
      )}

      {/*
          ----------------------
          ASSOCIATE (Job Seeker)
          ----------------------

          ######################################################################
          ######################################################################
          ######################################################################
      */}
      {currentUser.role === ASSOCIATE_JOB_SEEKER_ROLE_ID && (
        <div
          className={`column is-one-fifth has-background-black ${onHamburgerClicked ? "" : "is-hidden"}`}
        >
        <nav className="level is-hidden-mobile">
          <div className="level-item has-text-centered">
            <figure className="image">
            <Link
              onClick={onLinkClickCloseHamburgerMenuIfMobile}
              to="/js/dashboard"
              className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
            >
              <img
                src="/img/compressed-logo.png"
                style={{ maxWidth: "200px" }}
              />
              </Link>
            </figure>
          </div>
        </nav>
        <aside className="menu p-4">
          <p className="menu-label has-text-grey-light">Job Seeker</p>
          <ul className="menu-list">
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/js/dashboard"
                className={`has-text-grey-light ${location.pathname.includes("dashboard") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faTachometer} />
                &nbsp;Dashboard
              </Link>
            </li>
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/501"
                className={`has-text-grey-light ${location.pathname.includes("order") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faSearch} />
                &nbsp;Find Work
              </Link>
            </li>

            <li><Link
              onClick={onLinkClickCloseHamburgerMenuIfMobile}
              to="/501"
              className={`has-text-grey-light ${location.pathname.includes("financial") && "is-active"}`}
            >
              <FontAwesomeIcon className="fas" icon={faBriefcase} />
              &nbsp;My Documents
            </Link>
            </li>
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/501"
                className={`has-text-grey-light ${location.pathname.includes("client") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faUserTie} />
                &nbsp;My Advisor
              </Link>
            </li>
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/501"
                className={`has-text-grey-light ${location.pathname.includes("client") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faStar} />
                &nbsp;Learning & Goals
              </Link>
            </li>
          </ul>

          <p className="menu-label has-text-grey-light">Account</p>
          <ul className="menu-list">
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/js/help"
                className={`has-text-grey-light ${location.pathname.includes("help") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                &nbsp;Help
              </Link>
            </li>
            <li>
              <Link
                onClick={onLinkClickCloseHamburgerMenuIfMobile}
                to="/account"
                className={`has-text-grey-light ${location.pathname.includes("account") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faUser} />
                &nbsp;My Profile
              </Link>
            </li>
            <li>
              <a
                onClick={(e) => setShowLogoutWarning(true)}
                className={`has-text-grey-light ${location.pathname.includes("logout") && "is-active"}`}
              >
                <FontAwesomeIcon className="fas" icon={faSignOut} />
                &nbsp;Sign Off
              </a>
            </li>
          </ul>
        </aside>
        </div>
      )}
    </>
  );
};
