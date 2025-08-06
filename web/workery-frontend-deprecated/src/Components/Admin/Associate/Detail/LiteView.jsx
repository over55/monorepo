import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
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
  faHome,
  faEnvelope,
  faTags,
  faGraduationCap,
  faRankingStar,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getAssociateDetailAPI } from "../../../../API/Associate";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../Reusable/EveryPage/SkillSetsTextFormatter";
import ScoreRatingFormatter from "../../../Reusable/EveryPage/ScoreRatingFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { COMMERCIAL_ASSOCIATE_TYPE_OF_ID } from "../../../../Constants/App";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  ASSOCIATE_IS_JOB_SEEKER_YES
} from "../../../../Constants/App";

function AdminAssociateDetailLite() {
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
      getAssociateDetailAPI(aid, onSuccess, onError, onDone, onUnauthorized);
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
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Summary
                  </p>
                </div>
                <div className="column has-text-right">
                  <Link
                    to={`/admin/associate/${aid}/edit`}
                    className="button is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={associate.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
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

                {associate && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li className="is-active">
                          <Link>
                            <strong>Summary</strong>
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
                        <li>
                          <Link to={`/admin/associate/${associate.id}/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="columns">
                      <div className="column is-3 is-hidden-touch">
                        <figure className="image is-256x256">
                          {associate.avatarObjectUrl !== undefined &&
                          associate.avatarObjectUrl !== null &&
                          associate.avatarObjectUrl !== "" ? (
                            <img
                              src={associate.avatarObjectUrl}
                              alt="Profile Picture"
                              style={{ borderRadius: "25px" }}
                            />
                          ) : (
                            <img
                              src="/img/placeholder.png"
                              alt="No Profile Picture"
                              style={{ borderRadius: "25px" }}
                            />
                          )}
                        </figure>
                      </div>
                      <div className="column is-9 is-12-touch">
                        <div className="card">
                          <div className="card-content">
                            <div className="media">
                              <div className="media-left is-hidden-desktop">
                                <figure className="image is-48x48">
                                  {associate.avatarObjectUrl !== undefined &&
                                  associate.avatarObjectUrl !== null &&
                                  associate.avatarObjectUrl !== "" ? (
                                    <img
                                      src={associate.avatarObjectUrl}
                                      alt="Profile Picture"
                                      style={{ borderRadius: "10px" }}
                                    />
                                  ) : (
                                    <img
                                      src="/img/placeholder.png"
                                      alt="No Profile Picture"
                                      style={{ borderRadius: "10px" }}
                                    />
                                  )}
                                </figure>
                              </div>
                              <div className="media-content">
                                {associate.type === 3 && (
                                  <p className="title is-2 is-size-3-mobile">
                                    <FontAwesomeIcon
                                      className="mdi"
                                      icon={faBuilding}
                                    />
                                    &nbsp;{associate.organizationName}
                                  </p>
                                )}
                                <p className="title is-3 is-size-4-mobile">
                                  {associate.type === 2 && (
                                    <>
                                      <FontAwesomeIcon
                                        className="mdi"
                                        icon={faHome}
                                      />
                                      &nbsp;
                                    </>
                                  )}
                                  {associate.name}
                                </p>
                                <p className="subtitle is-5 is-size-6-mobile">
                                  <URLTextFormatter
                                    urlKey={associate.fullAddressWithPostalCode}
                                    urlValue={associate.fullAddressUrl}
                                    type={`external`}
                                  />
                                </p>
                              </div>
                            </div>

                            <div className="content pb-4">
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faEnvelope}
                                />
                                &nbsp;
                                {associate.email ? (
                                  <EmailTextFormatter value={associate.email} />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faSquarePhone}
                                />
                                &nbsp;
                                {associate.phone ? (
                                  <PhoneTextFormatter value={associate.phone} />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faTags}
                                />
                                &nbsp;<b>Tag(s):</b>&nbsp;
                                {associate.tags && associate.tags.length > 0 ? (
                                  <TagsTextFormatter tags={associate.tags} />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faGraduationCap}
                                />
                                &nbsp;<b>Skill(s):</b>&nbsp;
                                {associate.skillSets &&
                                associate.skillSets.length > 0 ? (
                                  <SkillSetsTextFormatter
                                    skillSets={associate.skillSets}
                                  />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faRankingStar}
                                />
                                &nbsp;<b>Ratings:</b>&nbsp;
                                {associate.skillSets &&
                                associate.skillSets.length > 0 ? (
                                  <ScoreRatingFormatter
                                    value={associate.score}
                                  />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              <p>
                                <FontAwesomeIcon
                                  className="fas"
                                  icon={faNoteSticky}
                                />
                                &nbsp;<b>Notes:</b>&nbsp;
                                <ul>
                                  {associate.commercialInsuranceExpiryDate && (
                                    <li>
                                      Commercial Insurance Expiry:{" "}
                                      <DateTextFormatter
                                        value={
                                          associate.commercialInsuranceExpiryDate
                                        }
                                      />
                                    </li>
                                  )}
                                  {associate.wsibInsuranceDate && (
                                    <li>
                                      WSIB Expiry:{" "}
                                      <DateTextFormatter
                                        value={associate.wsibInsuranceDate}
                                      />
                                    </li>
                                  )}
                                  {associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                                    <li>Job seeker - looking for employment</li>
                                  )}
                                </ul>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/admin/associate/${aid}/edit`}
                          className="button is-warning is-fullwidth-mobile"
                          disabled={associate.status === 2}
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

export default AdminAssociateDetailLite;
