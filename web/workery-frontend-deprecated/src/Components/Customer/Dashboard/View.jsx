import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faGauge,
  faArrowRight,
  faUsers,
  faBarcode,
  faWrench,
  faCreditCard,
  faBullhorn,
  faArrowCircleRight,
  faQuestionCircle,
  faHardHat
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { topAlertMessageState, topAlertStatusState } from "../../../AppState";

function CustomerDashboard() {
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
      <div class="container">
        <section class="section">
          <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li class="is-active">
                <Link to="/c/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
            </ul>
          </nav>
          <nav class="box">
            <div className="container">
              <div className="columns is-multiline is-mobile">
                {/* My Work Orders */}
                <div className="column is-6-tablet is-3-fullhd">
                  <div className="card">
                    <div className="card-image has-background-info">
                      <div
                        className="has-text-centered"
                        style={{ padding: "30px" }}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faWrench}
                          style={{ color: "white", fontSize: "9rem" }}
                        />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-content">
                          <p className="title is-4">
                            {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                            My Service Requests
                          </p>
                        </div>
                      </div>

                      <div className="content">
                        Click here to view existing requests or create new ones.
                        <br />
                      </div>
                    </div>
                    <footer className="card-footer">
                      <Link
                        to={`/c/orders`}
                        className="card-footer-item button is-primary is-large"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="fas"
                          icon={faArrowCircleRight}
                        />
                      </Link>
                    </footer>
                  </div>
                </div>
                {/* end My Work Orders */}

                {/* My Financials */}
                <div className="column is-6-tablet is-3-fullhd">
                  <div className="card">
                    <div className="card-image has-background-info">
                      <div
                        className="has-text-centered"
                        style={{ padding: "30px" }}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faCreditCard}
                          style={{ color: "white", fontSize: "9rem" }}
                        />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-content">
                          <p className="title is-4">
                            {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                            My Financials
                          </p>
                        </div>
                      </div>

                      <div className="content">
                        Click here to view existing requests or create new ones.
                        <br />
                      </div>
                    </div>
                    <footer className="card-footer">
                      <Link
                        to={`/c/financials`}
                        className="card-footer-item button is-primary is-large"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="fas"
                          icon={faArrowCircleRight}
                        />
                      </Link>
                    </footer>
                  </div>
                </div>
                {/* end My Financials */}

                {/* My Associates */}
                <div className="column is-6-tablet is-3-fullhd">
                  <div className="card">
                    <div className="card-image has-background-info">
                      <div
                        className="has-text-centered"
                        style={{ padding: "60px" }}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faHardHat}
                          style={{ color: "white", fontSize: "6rem" }}
                        />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-content">
                          <p className="title is-4">
                            {/*<FontAwesomeIcon className="fas" icon={faHardHat} />&nbsp;*/}
                            My Associates
                          </p>
                        </div>
                      </div>

                      <div className="content">
                        View all my past and present associates.
                        <br />
                      </div>
                    </div>
                    <footer className="card-footer">
                      <Link
                        to={`/c/associates`}
                        className="card-footer-item button is-primary is-large"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="fas"
                          icon={faArrowCircleRight}
                        />
                      </Link>
                    </footer>
                  </div>
                </div>
                {/* end My Associates */}

                {/* Help */}
                <div className="column is-6-tablet is-3-fullhd">
                  <div className="card">
                    <div className="card-image has-background-info">
                      <div
                        className="has-text-centered"
                        style={{ padding: "30px" }}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faQuestionCircle}
                          style={{ color: "white", fontSize: "9rem" }}
                        />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-content">
                          <p className="title is-4">
                            {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                            Help
                          </p>
                        </div>
                      </div>

                      <div className="content">
                        Do you have a question? Click here for us to help.
                        <br />
                      </div>
                    </div>
                    <footer className="card-footer">
                      <Link
                        to={`/c/help`}
                        className="card-footer-item button is-primary is-large"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="fas"
                          icon={faArrowCircleRight}
                        />
                      </Link>
                    </footer>
                  </div>
                </div>
                {/* end Help */}
              </div>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default CustomerDashboard;
