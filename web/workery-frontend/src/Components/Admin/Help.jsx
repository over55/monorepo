import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faQuestionCircle,
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
} from "@fortawesome/free-solid-svg-icons";

import URLTextFormatter from "../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../Reusable/EveryPage/PhoneTextFormatter";

function Help() {
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
                  <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                  &nbsp;Help
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <div className="columns">
            <div className="column">
              <h1 className="title is-2">
                <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
                &nbsp;Help
              </h1>
              <hr />
            </div>
          </div>

          {/* Page */}
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-half-tablet">
                <div className="card">
                  <div className="card-image">
                    {/*
									<figure className="image is-4by3">
										<img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image" />
									</figure>
									*/}
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        {/*
											<figure className="image is-48x48">
												<img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image" />
											</figure>
											*/}
                      </div>
                      <div className="media-content has-text-centered">
                        <span className="has-text-centered">
                          <FontAwesomeIcon
                            className="fas"
                            icon={faEnvelope}
                            style={{ width: "100px", height: "100px" }}
                          />
                        </span>
                        <p className="title is-2">Contact</p>
                        <p className="subtitle is-7">
                          If you have any questions? Don't hestitate and reach
                          out to us!
                        </p>
                      </div>
                    </div>

                    <div className="content has-text-centered is-size-5">
                      <hr />
                      <FontAwesomeIcon className="fas" icon={faEnvelope} />
                      &nbsp;
                      <EmailTextFormatter value={`support@workery.ca`} />
                      <hr />
                      <FontAwesomeIcon className="fas" icon={faSquarePhone} />
                      &nbsp;
                      <PhoneTextFormatter value={`+1(519)438-1111`} />
                      <hr />
                      <FontAwesomeIcon className="fas" icon={faMapPin} />
                      &nbsp;
                      <URLTextFormatter
                        urlKey={`London, ON Canada`}
                        urlValue={`https://www.google.com/maps/place/Over+55+Skills+at+Work/@42.982378,-81.2639086,17z/data=!3m2!4b1!5s0x882ef1f1bda3c3d5:0xb6c19797240aed91!4m6!3m5!1s0x882ef1f195805b65:0xc74817a331752923!8m2!3d42.982378!4d-81.261339!16s%2Fg%2F1thq1brc?entry=ttu`}
                        type={`external`}
                      />
                      <hr />
                      <FontAwesomeIcon className="fas" icon={faLink} />
                      &nbsp;
                      <URLTextFormatter
                        urlKey={<>Official Website</>}
                        urlValue={`https://skillsatwork.ca`}
                        type={`external`}
                      />
                      <hr />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Help;
