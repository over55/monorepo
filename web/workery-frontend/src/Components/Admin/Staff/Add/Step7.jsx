import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faUserFriends,
  faBalanceScale,
  faGraduationCap,
  faQuestionCircle,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faUserTie,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import deepClone from "../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../Helpers/datetimeUtility";
import { postStaffCreateAPI } from "../../../../API/Staff";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../Reusable/DataDisplayRowText";
import DataDisplayRowCheckbox from "../../../Reusable/DataDisplayRowCheckbox";
import DataDisplayRowRadio from "../../../Reusable/DataDisplayRowRadio";
import DataDisplayRowSelect from "../../../Reusable/DataDisplayRowSelect";
import DataDisplayRowTagIDs from "../../../Reusable/DataDisplayRowTagIDs";
import DataDisplayRowHowHearAboutUsItem from "../../../Reusable/DataDisplayRowHowHear";
import DataDisplayRowSkillSetIDs from "../../../Reusable/DataDisplayRowSkillSetIDs";
import DataDisplayRowInsuranceRequirementIDs from "../../../Reusable/DataDisplayRowInsuranceRequirementIDs";
import DataDisplayRowVehicleTypeIDs from "../../../Reusable/DataDisplayRowVehicleTypeIDs";
import DataDisplayRowServiceFeeID from "../../../Reusable/DataDisplayRowServiceFeeID";
import DataDisplayRowMultiSelect from "../../../Reusable/DataDisplayRowMultiSelect";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import { STAFF_TYPE_MANAGEMENT } from "../../../../Constants/App";
import {
  addStaffState,
  ADD_STAFF_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_TYPE_OF_FILTER_OPTIONS,
  STAFF_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../Constants/FieldOptions";

function AdminStaffAddStep7() {
  ////
  //// Global state.
  ////

  const [addStaff, setAddStaff] = useRecoilState(addStaffState);
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

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    const payload = deepClone(addStaff); // Make a copy of the read-only data.

    // Apply the following fixes to our payload.

    // Fix 2: birthDate
    if (!isISODate(addStaff.birthDate) && addStaff.birthDate != "") {
      const birthDateObject = new Date(addStaff.birthDate);
      const birthDateISOString = birthDateObject.toISOString();
      payload.birthDate = birthDateISOString;
    }

    // Fix 5: joinDate
    if (!isISODate(addStaff.joinDate) && addStaff.joinDate != "") {
      const joinDateObject = new Date(addStaff.joinDate);
      const joinDateISOString = joinDateObject.toISOString();
      payload.joinDate = joinDateISOString;
    }

    console.log("onSubmitClick: payload:", addStaff);

    setFetching(false);
    setErrors({});
    postStaffCreateAPI(payload, onSuccess, onError, onDone);
  };

  ////
  //// API.
  ////

  function onSuccess(response) {
    // For debugging purposes only.
    console.log("onSuccess: Starting...");
    console.log(response);

    if (response === undefined || response === null || response === "") {
      console.log("onSuccess: exiting early");
      return;
    }

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Staff created");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onSuccess: Delayed for 2 seconds.");
      console.log(
        "onSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Clear all data that staff inputed in this wizard.
    setAddStaff(ADD_STAFF_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/staff/" + response.id);
  }

  function onError(apiErr) {
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    setFetching(false);
  }

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

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
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
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

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Staff
          </h4>
          <hr />

          {/* Progress Wizard */}
          <nav className="box has-background-success-light">
            <p className="subtitle is-5">Step 7 of 7</p>
            <progress class="progress is-success" value="100" max="100">
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
              &nbsp;Are you ready to submit?
            </p>

            <p className="has-text-grey pb-4">
              Please carefully review the following staff details and if you are
              ready click the <b>Submit</b> to complete.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {addStaff !== undefined &&
                  addStaff !== null &&
                  addStaff !== "" && (
                    <div className="container">
                      <p className="title is-4 mt-2">
                        <FontAwesomeIcon className="fas" icon={faIdCard} />
                        &nbsp;Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-3">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowSelect
                        label="Type"
                        selectedValue={addStaff.type}
                        options={STAFF_TYPE_OF_FILTER_OPTIONS}
                      />
                      {addStaff.type === STAFF_TYPE_MANAGEMENT && (
                        <>{/* Do nothing. */}</>
                      )}

                      <DataDisplayRowText
                        label="First Name"
                        value={addStaff.firstName}
                      />

                      <DataDisplayRowText
                        label="Last Name"
                        value={addStaff.lastName}
                      />

                      <DataDisplayRowText
                        label="Email"
                        value={addStaff.email}
                        type="email"
                      />

                      <DataDisplayRowCheckbox
                        label="I agree to receive electronic email"
                        checked={addStaff.isOkToEmail}
                      />

                      <DataDisplayRowText
                        label="Phone"
                        value={addStaff.phone}
                        type="phone"
                      />

                      <DataDisplayRowSelect
                        label="Phone Type"
                        selectedValue={addStaff.phoneType}
                        options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                      />

                      <DataDisplayRowCheckbox
                        label="I agree to receive texts to my phone"
                        checked={addStaff.isOkToText}
                      />

                      <DataDisplayRowText
                        label="Other Phone (Optional)"
                        value={addStaff.otherPhone}
                        type="phone"
                      />

                      {addStaff.otherPhoneType !== 0 && (
                        <DataDisplayRowSelect
                          label="Other Phone Type (Optional)"
                          selectedValue={addStaff.otherPhoneType}
                          options={
                            STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                          }
                        />
                      )}

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faAddressBook} />
                        &nbsp;Address&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-4">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowCheckbox
                        label="Has shipping address different then billing address"
                        checked={addStaff.hasShippingAddress}
                      />

                      <div className="columns">
                        <div className="column">
                          {addStaff.hasShippingAddress ? (
                            <p className="subtitle is-6">Billing Address</p>
                          ) : (
                            <></>
                          )}

                          <DataDisplayRowText
                            label="Country"
                            value={addStaff.country}
                          />

                          <DataDisplayRowText
                            label="Province/Territory"
                            value={addStaff.region}
                          />

                          <DataDisplayRowText
                            label="City"
                            value={addStaff.city}
                          />

                          <DataDisplayRowText
                            label="Address Line 1"
                            value={addStaff.addressLine1}
                          />

                          <DataDisplayRowText
                            label="Address Line 2 (Optional)"
                            value={addStaff.addressLine2}
                          />

                          <DataDisplayRowText
                            label="Postal Code)"
                            value={addStaff.postalCode}
                          />
                        </div>
                        {addStaff.hasShippingAddress && (
                          <div className="column">
                            <p className="subtitle is-6">Shipping Address</p>

                            <DataDisplayRowText
                              label="Name"
                              value={addStaff.shippingName}
                            />

                            <DataDisplayRowText
                              label="Phone"
                              value={addStaff.shippingPhone}
                              type="phone"
                            />

                            <DataDisplayRowText
                              label="Country"
                              value={addStaff.shippingCountry}
                            />

                            <DataDisplayRowText
                              label="Province/Territory"
                              value={addStaff.shippingRegion}
                            />

                            <DataDisplayRowText
                              label="City"
                              value={addStaff.shippingCity}
                            />

                            <DataDisplayRowText
                              label="Address Line 1"
                              value={addStaff.shippingAddressLine1}
                            />

                            <DataDisplayRowText
                              label="Address Line 2 (Optional)"
                              value={addStaff.shippingAddressLine2}
                            />

                            <DataDisplayRowText
                              label="Postal Code"
                              value={addStaff.shippingPostalCode}
                            />
                          </div>
                        )}
                      </div>

                      <p className="title is-4">
                        <FontAwesomeIcon
                          className="fas"
                          icon={faBalanceScale}
                        />
                        &nbsp;Insurance, financial,
                        etc&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowText
                        label="Limitation or special consideration"
                        value={addStaff.limitSpecial}
                      />

                      <DataDisplayRowText
                        label="Police Check Expiry (Optional)"
                        value={addStaff.policeCheck}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Drivers License Class (Optional)"
                        value={addStaff.driversLicenseClass}
                      />

                      <DataDisplayRowVehicleTypeIDs
                        label="Vehicle Types (Optional)"
                        vehicleTypes={addStaff.vehicleTypes}
                      />

                      <DataDisplayRowRadio
                        label="Preferred Language"
                        value={addStaff.preferredLanguage}
                        opt1Value="English"
                        opt1Label="English"
                        opt2Value="French"
                        opt2Label="French"
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faUserFriends} />
                        &nbsp;Emergency
                        Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowText
                        label="Contact Name"
                        value={addStaff.emergencyContactName}
                      />

                      <DataDisplayRowText
                        label="Contact Relationship"
                        value={addStaff.emergencyContactRelationship}
                      />

                      <DataDisplayRowText
                        label="Contact Telephone"
                        value={addStaff.emergencyContactTelephone}
                        type="phone"
                      />

                      <DataDisplayRowText
                        label="Contact Alternative Telephone (Optional)"
                        value={addStaff.ContactAlternativeTelephone}
                        type="phone"
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faServer} />
                        &nbsp;System&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowText
                        label="Description"
                        value={addStaff.description}
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faChartPie} />
                        &nbsp;Metrics&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/staff/add/step-6">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowMultiSelect
                        label="Do you identify as belonging to any of the following groups?"
                        selectedValues={addStaff.identifyAs}
                        options={IDENTIFY_AS_OPTIONS}
                      />
                      <DataDisplayRowTagIDs tags={addStaff.tags} />

                      <DataDisplayRowHowHearAboutUsItem
                        howDidYouHearAboutUsID={addStaff.howDidYouHearAboutUsID}
                      />

                      {addStaff.howDidYouHearAboutUsOther !== undefined &&
                        addStaff.howDidYouHearAboutUsOther !== null &&
                        addStaff.howDidYouHearAboutUsOther !== null && (
                          <DataDisplayRowText
                            label="How did you hear about us? (Other)"
                            value={addStaff.howDidYouHearAboutUsOther}
                          />
                        )}

                      <DataDisplayRowSelect
                        label="Gender"
                        selectedValue={addStaff.gender}
                        options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                      />
                      {addStaff.gender === 1 && (
                        <DataDisplayRowText
                          label="Gender (Other)"
                          value={addStaff.genderOther}
                        />
                      )}
                      <DataDisplayRowText
                        label="Birth Date (Optional)"
                        value={addStaff.birthDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Join Date (Optional)"
                        value={addStaff.joinDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Additional Comment"
                        value={addStaff.additionalComment}
                      />

                      <div className="columns pt-5">
                        <div className="column is-half">
                          <Link
                            className="button is-medium is-fullwidth-mobile"
                            to="/admin/staff/add/step-6"
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowLeft}
                            />
                            &nbsp;Back
                          </Link>
                        </div>
                        <div className="column is-half has-text-right">
                          <button
                            className="button is-medium is-success is-fullwidth-mobile"
                            onClick={onSubmitClick}
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faCheckCircle}
                            />
                            &nbsp;Submit
                          </button>
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

export default AdminStaffAddStep7;
