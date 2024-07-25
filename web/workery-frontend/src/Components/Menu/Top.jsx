import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRightFromBracket,
  faTachometer,
  faTasks,
  faSignOut,
  faUserCircle,
  faUsers,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../Constants/App";
import { onHamburgerClickedState, currentUserState } from "../../AppState";

function Topbar() {
  ////
  //// Global State
  ////

  const [onHamburgerClicked, setOnHamburgerClicked] = useRecoilState(
    onHamburgerClickedState,
  );
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Local State
  ////

  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  ////
  //// Events
  ////

  // Do nothing.

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

  // Render the following component GUI
  return (
    <div className="">
      <nav
        className="navbar has-background-black"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          {(currentUser.roleId === EXECUTIVE_ROLE_ID ||
            currentUser.roleId === MANAGEMENT_ROLE_ID ||
            currentUser.roleId === FRONTLINE_ROLE_ID) && (
            <>
              {onHamburgerClicked === false && (
                <Link
                  className="navbar-item"
                  href="/admin/dashboard"
                  style={{ color: "white" }}
                >
                  <img
                    src="/img/compressed-logo.png"
                    width={112}
                    height={28}
                    alt="Logo Image"
                  />
                </Link>
              )}
            </>
          )}
          <a
            role="button"
            className="navbar-burger has-text-white"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            onClick={(e) => setOnHamburgerClicked(!onHamburgerClicked)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div id="navbarBasicExample" className="navbar-menu has-text-white">
          <div className="navbar-left">
            <div className="navbar-item">
              <div
                className="buttons p-3"
                onClick={(e) => setOnHamburgerClicked(!onHamburgerClicked)}
              >
                <FontAwesomeIcon className="fas has-text-white" icon={faBars} />
              </div>
            </div>
          </div>
        </div>
      </nav>
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
    </div>
  );
}

export default Topbar;
