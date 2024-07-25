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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getStaffDetailAPI } from "../../../../API/Staff";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import SelectTextFormatter from "../../../Reusable/EveryPage/SelectTextFormatter";
import CheckboxTextFormatter from "../../../Reusable/EveryPage/CheckboxTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import RadioTextFormatter from "../../../Reusable/EveryPage/RadioTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import SkillSetsTextFormatter from "../../../Reusable/EveryPage/SkillSetsTextFormatter";
import InsuranceRequirementsTextFormatter from "../../../Reusable/EveryPage/InsuranceRequirementsTextFormatter";
import DriversLicenseClassesTextFormatter from "../../../Reusable/EveryPage/DriversLicenseClassesTextFormatter";
import VehicleTypesTextFormatter from "../../../Reusable/EveryPage/VehicleTypesTextFormatter";
import MultiSelectTextFormatter from "../../../Reusable/EveryPage/MultiSelectTextFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { COMMERCIAL_ASSOCIATE_TYPE_OF_ID } from "../../../../Constants/App";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
  STAFF_TYPE_OF_MAP
} from "../../../../Constants/FieldOptions";

function AdminStaffDetailFull() {
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
  const [tabIndex, setTabIndex] = useState(1);

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

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getStaffDetailAPI(aid, onSuccess, onError, onDone);
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
                    &nbsp;Detail
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
                        <li>
                          <Link to={`/admin/staff/${staff.id}`}>Summary</Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>Detail</strong>
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

                    {/*
                        ##########################
                        Peronsal Information Table
                        ##########################
                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Personal Information
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Type:
                          </th>
                          <td>
                            {STAFF_TYPE_OF_MAP[staff.type]}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            First Name:
                          </th>
                          <td>{staff.firstName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Last Name:
                          </th>
                          <td>{staff.lastName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Date of Birth:
                          </th>
                          <td>
                            {staff.birthDate ? (
                              <DateTextFormatter value={staff.birthDate} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Gender:
                          </th>
                          <td>
                            {staff.gender ? (
                              <>
                                <SelectTextFormatter
                                  selectedValue={staff.gender}
                                  options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                                />
                                {staff.gender === 1 && (
                                  <>&nbsp;-&nbsp;{staff.genderOther}</>
                                )}
                              </>
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>
                            {staff.description ? staff.description : <>-</>}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Tags:
                          </th>
                          <td>
                            {staff.tags && staff.tags.length > 0 ? (
                              <TagsTextFormatter tags={staff.tags} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Skill Sets:
                          </th>
                          <td>
                            {staff.skillSets && staff.skillSets.length > 0 ? (
                              <SkillSetsTextFormatter
                                skillSets={staff.skillSets}
                              />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                        ##########################
                        Company Information Table
                        ##########################
                    */}
                    {staff.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                      <table className="is-fullwidth table">
                        <thead>
                          <tr className="has-background-black">
                            <th className="has-text-white" colSpan="2">
                              Company Information
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Company Name:
                            </th>
                            <td>{staff.organizationName}</td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Company Type:
                            </th>
                            <td>
                              <SelectTextFormatter
                                selectedValue={staff.organizationType}
                                options={ASSOCIATE_ORGANIZATION_TYPE_OPTIONS}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {/*
                        ###################
                        Contact Point Table
                        ###################
                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Contact Point
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Email:
                          </th>
                          <td>
                            {staff.email ? (
                              <EmailTextFormatter value={staff.email} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            I agree to receive electronic email:
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={staff.isOkToEmail}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Phone:
                          </th>
                          <td>
                            {staff.phone ? (
                              <PhoneTextFormatter value={staff.phone} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Phone Type:
                          </th>
                          <td>
                            <SelectTextFormatter
                              selectedValue={staff.phoneType}
                              options={
                                ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                              }
                            />
                          </td>
                        </tr>
                        {staff.otherPhone && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Other Phone (Optional):
                              </th>
                              <td>
                                {staff.otherPhone ? (
                                  <PhoneTextFormatter
                                    value={staff.otherPhone}
                                  />
                                ) : (
                                  <>-</>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Other Phone Type (Optional):
                              </th>
                              <td>
                                <SelectTextFormatter
                                  selectedValue={staff.otherPhoneType}
                                  options={
                                    ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                                  }
                                />
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            I agree to receive texts to my phone:
                          </th>
                          <td>
                            <CheckboxTextFormatter checked={staff.isOkToText} />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                        ##########################
                        Address Table
                        ##########################
                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Address
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Location:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={staff.fullAddressWithPostalCode}
                              urlValue={staff.fullAddressUrl}
                              type={`external`}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                        ##########################
                        ACCOUNT
                        ##########################
                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Account
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Is active:
                          </th>
                          <td>
                            {staff.status === 1 ? (
                              <span>Active</span>
                            ) : (
                              <span>Archive</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Preferred Language:
                          </th>
                          <td>
                            {staff.gender ? (
                              <RadioTextFormatter
                                value={staff.preferredLanguage}
                                opt1Value="English"
                                opt1Label="English"
                                opt2Value="French"
                                opt2Label="French"
                              />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                        ##########################
                                        Emergency Contact Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Emergency Contact
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Name:
                          </th>
                          <td>{staff.emergencyContactName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Relationship:
                          </th>
                          <td>{staff.emergencyContactRelationship}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Telephone:
                          </th>
                          <td>
                            {staff.emergencyContactTelephone ? (
                              <PhoneTextFormatter
                                value={staff.emergencyContactTelephone}
                              />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Alternate Telephone:
                          </th>
                          <td>
                            {staff.emergencyContactAlternativeTelephone ? (
                              <PhoneTextFormatter
                                value={
                                  staff.emergencyContactAlternativeTelephone
                                }
                              />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                        ##########################
                                        Internal Metrics Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Internal Metrics
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            How did they discover us?:
                          </th>
                          <td>
                            {staff.isHowDidYouHearAboutUsOther
                              ? staff.howDidYouHearAboutUsOther
                              : staff.howDidYouHearAboutUsText}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Join date:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={staff.joinDate} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Do you identify as belonging to any of the following
                            groups?
                          </th>
                          <td>
                            <MultiSelectTextFormatter
                              selectedValues={staff.identifyAs}
                              options={IDENTIFY_AS_OPTIONS}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*

                                        <DataDisplayRowHowHearAboutUsItem
                                            howDidYouHearAboutUsID={staff.howDidYouHearAboutUsID}
                                        />

                                        {staff.howDidYouHearAboutUsOther !== undefined && staff.howDidYouHearAboutUsOther !== null && staff.howDidYouHearAboutUsOther !== null &&
                                            <DataDisplayRowText
                                                label="How did you hear about us? (Other)"
                                                value={staff.howDidYouHearAboutUsOther}
                                            />
                                        }
                                    */}

                    {/*
                                        ##########################
                                        System Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            System
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              ID:
                            </th>
                            <td>
                              {staff.publicId}
                            </td>
                          </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={staff.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created by:
                          </th>
                          <td>{staff.createdByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created from:
                          </th>
                          <td>{staff.createdFromIpAddress}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={staff.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified by:
                          </th>
                          <td>{staff.modifiedByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified from:
                          </th>
                          <td>{staff.modifiedFromIpAddress}</td>
                        </tr>
                      </tbody>
                    </table>
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

export default AdminStaffDetailFull;
