import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRecoilState } from "recoil";
import {
  faEnvelope,
  faCogs,
  faMessage,
  faChevronRight,
  faPlus,
  faPencil,
  faTimes,
  faBullhorn,
  faArrowUpRightFromSquare,
  faNewspaper,
  faWrench,
  faHardHat,
  faUserCircle,
  faTasks,
  faGauge,
  faArrowRight,
  faUsers,
  faBarcode,
  faSquarePhone,
  faMapPin,
  faLink,
  faGraduationCap,
  faTags,
  faBalanceScale,
  faCreditCard,
  faFaceFrown,
  faCar,
  faTty,
  faArrowCircleRight,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";

import {
  getTenantDetailAPI,
} from "../../../API/Tenant";
import { currentUserState } from "../../../AppState";
import TaxSettingModal from "./ModalTaxSetting";

function AdminSettingLaunchpad() {
  const [showTaxSettingModal, setShowTaxSettingModal] = useState(false);
  const [currentUser] = useRecoilState(currentUserState);


  // Modal state.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [tenant, setTenant] = useState(null);

  ////
  //// API.
  ////


  // --- Detail --- //

  function onTenantDetailSuccess(response) {
    console.log("onTenantDetailSuccess: Starting...");
    console.log("onTenantDetailSuccess: tenant:", response);
    setTenant(response);
  }

  function onTenantDetailError(apiErr) {
    console.log("onTenantDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTenantDetailDone() {
    console.log("onTenantDetailDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
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
      getTenantDetailAPI(
        currentUser.tenantId,
        onTenantDetailSuccess,
        onTenantDetailError,
        onTenantDetailDone,
        onUnauthorized,
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// RENDER COMPONENT
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
              <li className="">
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCogs} />
                  &nbsp;Settings
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <div className="columns">
            <div className="column">
              <h1 className="title is-2">
                <FontAwesomeIcon className="fas" icon={faCogs} />
                &nbsp;Settings
              </h1>
              <hr />
            </div>
          </div>

          {/* Page */}
          <div className="container">
            <div className="columns is-multiline">
              {/* Office News */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faNewspaper}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Office News
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify office news items.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/bulletins`}
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

              {/* Skill sets */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faGraduationCap}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Skill sets
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify the skill sets.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/skill-sets`}
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

              {/* Tags */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faTags}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Tags
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Add a Residential Associate.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/tags`}
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

              {/* Associate News */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faBullhorn}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate News
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify associate news items.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/associate-away-logs`}
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

              {/* Insurance Requirements */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faBalanceScale}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Insurance Requirements
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify insurance settings.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/insurance-requirements`}
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

              {/* Service Fees */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
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
                          Service Fees
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify service fee settings.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/service-fees`}
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

              {/* Deactivated Clients */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faFaceFrown}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Deactivated Clients
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify inactive customers.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/inactive-clients`}
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

              {/* Vehicle Types */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faCar}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Vehicle Type
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      Modify vehicle types for associate.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/vehicle-types`}
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

              {/* How did you hear? */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faTty}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          How did you hear?
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List how users discovered us and referral sources.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/settings/how-hear-about-us-items`}
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

              {/* Tax Settings */}
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faUniversity}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Tax Settings
                        </p>
                      </div>
                    </div>
                    <div className="content">
                      Change how tax gets applied system wide.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      onClick={(e) => {
                        setShowTaxSettingModal(true);
                      }}
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
            </div>
          </div>
        </section>
      </div>

      {/* MODALS */}
      {tenant && <TaxSettingModal
        currentUser={currentUser}
        tenant={tenant}
        showModal={showTaxSettingModal}
        setShowModal={setShowTaxSettingModal}
        onSuccess={(e) => {
          console.log("Refreshing b/c of update");
        }}
      />}
    </>
  );
}

export default AdminSettingLaunchpad;
