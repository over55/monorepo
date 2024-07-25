import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faAddressCard,
  faUserAltSlash,
  faHandHoldingUsd,
  faBan,
  faClock,
  faShieldAlt,
  faBirthdayCake,
  faHandHolding,
  faBuilding,
  faToolbox,
  faRandom,
  faHandshake,
  faCalendarTimes,
  faGlobe,
  faMailBulk,
  faSearchDollar,
  faEnvelope,
  faChartBar,
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
  faLock,
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
} from "@fortawesome/free-solid-svg-icons";

import URLTextFormatter from "../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";

function AdminReportLaunchpad() {
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
                  <FontAwesomeIcon className="fas" icon={faChartBar} />
                  &nbsp;Reports
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <div className="columns">
            <div className="column">
              <h1 className="title is-2">
                <FontAwesomeIcon className="fas" icon={faChartBar} />
                &nbsp;Reports
              </h1>
              <hr />
            </div>
          </div>

          {/* Page */}
          <div className="container">
            <div className="columns is-multiline is-mobile">
              {/* Due Service Fees */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faCashRegister}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Due Service Fees
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List due service fees for associates.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/1`}
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

              {/* Associate Jobs */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faAddressCard}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Jobs
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List jobs by Associate.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/2`}
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

              {/* Service Fees by Skills */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faHandHoldingUsd}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Service Fees by Types
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List revenue by service fee types.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/3`}
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

              {/* Cancelled Jobs */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faBan}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Cancelled Jobs
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List all cancelled jobs.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/4`}
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

              {/* Associate Insurance */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faClock}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Insurance
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List insurance due dates.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/5`}
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

              {/* Associate Police Check */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faShieldAlt}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Police Check
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List police check due dates.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/6`}
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

              {/* Associate Birthdays */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faBirthdayCake}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Birthdays
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List associates by birthdate.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/7`}
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

              {/* Associate Skill Set */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faHandHolding}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Skill Set
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List associate skill sets.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/8`}
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

              {/* Client Addresses */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faUserCircle}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Client Addresses
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List client addresses.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/9`}
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

              {/* Jobs */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
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
                          Residential Jobs
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List all residential jobs.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/10`}
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

              {/* Commercial Jobs */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faBuilding}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Commercial Jobs
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List only commercial jobs.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/11`}
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

              {/* Skill Sets */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faToolbox}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Skill Sets
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List of all skill sets.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/12`}
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

              {/* Leads by Skill */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faRandom}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Leads by Skill
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List of jobs by skill set.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/13`}
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

              {/* Associate Expiry Dates */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faCalendarTimes}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Associate Expiry Dates
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List upcoming expiry dates.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/15`}
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

              {/* How Users Find Us (long) */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faGlobe}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          How Users Find Us (long)
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List how users discovered us.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/16`}
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

              {/* How Users Find Us (short) */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faGlobe}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          How Users Find Us (short)
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
                      to={`/admin/report/17`}
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

              {/* Job Tags by Assignment Dates */}
              <div className="column is-6-tablet is-3-fullhd">
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
                          Job Tags by Assignment Dates
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List jobs by tags using assignment dates as a filter.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/19`}
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

              {/* Job Tags by Completion Dates */}
              <div className="column is-6-tablet is-3-fullhd">
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
                          Job Tags by Completion Dates
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List jobs by tags using complation dates as a filter.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/22`}
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

              {/* Payments */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faSearchDollar}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Payments
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List all payments and related information.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/20`}
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

              {/* Marketing Emails */}
              <div className="column is-6-tablet is-3-fullhd">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <FontAwesomeIcon
                        className="fas"
                        icon={faMailBulk}
                        style={{ color: "white", fontSize: "9rem" }}
                      />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">
                          {/*<FontAwesomeIcon className="fas" icon={faSquarePhone} />&nbsp;*/}
                          Marketing Emails
                        </p>
                      </div>
                    </div>

                    <div className="content">
                      List all emails of consenting user's email addresses.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/admin/report/21`}
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
    </>
  );
}

export default AdminReportLaunchpad;
