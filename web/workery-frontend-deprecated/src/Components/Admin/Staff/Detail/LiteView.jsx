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
  faUserTie,
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

import { getStaffDetailAPI } from "../../../../API/Staff";
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
  addStaffState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../Constants/FieldOptions";

function AdminStaffDetailLite() {
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
  const [staff, setStaff] = useState({});

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setStaff(response);
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
      getStaffDetailAPI(aid, onSuccess, onError, onDone, onUnauthorized);
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
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserTie} />
                  &nbsp;Staff
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
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Staff
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {staff && staff.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {staff && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Summary
                  </p>
                </div>
                <div className="column has-text-right">
                  <Link
                    to={`/admin/staff/${aid}/edit`}
                    className="button is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={staff.status === 2}
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

                {staff && (
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
                          <Link to={`/admin/staff/${staff.id}/detail`}>
                            Detail
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/staff/${staff.id}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/staff/${staff.id}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/admin/staff/${staff.id}/more`}>
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
                          {staff.avatarObjectUrl !== undefined &&
                          staff.avatarObjectUrl !== null &&
                          staff.avatarObjectUrl !== "" ? (
                            <img
                              src={staff.avatarObjectUrl}
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
                                  {staff.avatarObjectUrl !== undefined &&
                                  staff.avatarObjectUrl !== null &&
                                  staff.avatarObjectUrl !== "" ? (
                                    <img
                                      src={staff.avatarObjectUrl}
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
                                {staff.type === 3 && (
                                  <p className="title is-2 is-size-3-mobile">
                                    <FontAwesomeIcon
                                      className="mdi"
                                      icon={faBuilding}
                                    />
                                    &nbsp;{staff.organizationName}
                                  </p>
                                )}
                                <p className="title is-3 is-size-4-mobile">
                                  {staff.type === 2 && (
                                    <>
                                      <FontAwesomeIcon
                                        className="mdi"
                                        icon={faHome}
                                      />
                                      &nbsp;
                                    </>
                                  )}
                                  {staff.name}
                                </p>
                                <p className="subtitle is-5 is-size-6-mobile">
                                  <URLTextFormatter
                                    urlKey={staff.fullAddressWithPostalCode}
                                    urlValue={staff.fullAddressUrl}
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
                                {staff.email ? (
                                  <EmailTextFormatter value={staff.email} />
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
                                {staff.phone ? (
                                  <PhoneTextFormatter value={staff.phone} />
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
                                {staff.tags && staff.tags.length > 0 ? (
                                  <TagsTextFormatter tags={staff.tags} />
                                ) : (
                                  <>-</>
                                )}
                              </p>
                              {/*
                                                        <p>
                                                            <FontAwesomeIcon className="fas" icon={faGraduationCap} />&nbsp;<b>Skill(s):</b>&nbsp;
                                                            {staff.skillSets && staff.skillSets.length > 0
                                                                ?
                                                                <SkillSetsTextFormatter skillSets={staff.skillSets} />
                                                                :
                                                                <>-</>
                                                            }
                                                        </p>
                                                        <p>
                                                            <FontAwesomeIcon className="fas" icon={faRankingStar} />&nbsp;<b>Ratings:</b>&nbsp;
                                                            {staff.skillSets && staff.skillSets.length > 0
                                                                ?
                                                                <ScoreRatingFormatter value={staff.score} />
                                                                :
                                                                <>-</>
                                                            }
                                                        </p>
                                                        <p>
                                                            <FontAwesomeIcon className="fas" icon={faNoteSticky} />&nbsp;<b>Notes:</b>&nbsp;
                                                            <ul>
                                                                {staff.commercialInsuranceExpiryDate && <li>Commercial Insurance Expiry: <DateTextFormatter value={staff.commercialInsuranceExpiryDate} /></li>}
                                                                {staff.wsibInsuranceDate && <li>WSIB Expiry: <DateTextFormatter value={staff.wsibInsuranceDate} /></li>}
                                                                <li>Last service fee paid on MMMM DD, YYYY in work order #XXXXX (TODO).</li>
                                                            </ul>
                                                        </p>
                                                        */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/staff`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Staff
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/admin/staff/${aid}/edit`}
                          className="button is-warning is-fullwidth-mobile"
                          disabled={staff.status === 2}
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

export default AdminStaffDetailLite;
