import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faGauge,
  faArrowRight,
  faUsers,
  faBarcode,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { topAlertMessageState, topAlertStatusState } from "../../AppState";

function RootDashboard() {
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

  ////
  //// API.
  ////

  ////
  //// Event handling.
  ////

  ////
  //// Misc.
  ////

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// Component rendering.
  ////

  return (
    <>
      <div className="container">
        <section className="section">
          <nav
            className="breadcrumb has-background-light p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="is-active">
                <Link to="/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Root Dashboard
                </Link>
              </li>
            </ul>
          </nav>
          <nav className="box">
            <div className="columns">
              <div className="column">
                <h1 className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Root Dashboard
                </h1>
              </div>
            </div>

            <section className="hero is-medium is-link">
              <div className="hero-body">
                <p className="title">
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Organizations
                </p>
                <p className="subtitle">
                  Manage all the organizations in your system:
                  <br />
                  <br />
                  <Link to={"/root/tenants"}>
                    View&nbsp;
                    <FontAwesomeIcon className="fas" icon={faArrowRight} />
                  </Link>
                </p>
              </div>
            </section>
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

export default RootDashboard;
