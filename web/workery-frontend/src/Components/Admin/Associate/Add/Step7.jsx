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
  faHardHat,
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
import { postAssociateCreateAPI } from "../../../../API/Associate";
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
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  ASSOCIATE_PHONE_TYPE_WORK,
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_IS_JOB_SEEKER_NO,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER,
} from "../../../../Constants/App";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
  ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS,
  ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";

function AdminAssociateAddStep7() {
  ////
  //// Global state.
  ////

  const [addAssociate, setAddAssociate] = useRecoilState(addAssociateState);
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

    const payload = deepClone(addAssociate); // Make a copy of the read-only data.

    // Apply the following fixes to our payload.

    // Fix 1: autoInsuranceExpiryDate
    if (
      !isISODate(addAssociate.autoInsuranceExpiryDate) &&
      addAssociate.autoInsuranceExpiryDate != ""
    ) {
      const autoInsuranceExpiryDateObject = new Date(
        addAssociate.autoInsuranceExpiryDate,
      );
      const autoInsuranceExpiryDateISOString =
        autoInsuranceExpiryDateObject.toISOString();
      payload.autoInsuranceExpiryDate = autoInsuranceExpiryDateISOString;
    }

    // Fix 2: birthDate
    if (!isISODate(addAssociate.birthDate) && addAssociate.birthDate != "") {
      const birthDateObject = new Date(addAssociate.birthDate);
      const birthDateISOString = birthDateObject.toISOString();
      payload.birthDate = birthDateISOString;
    }

    // Fix 3 commercialInsuranceExpiryDate
    if (
      !isISODate(addAssociate.commercialInsuranceExpiryDate) &&
      addAssociate.commercialInsuranceExpiryDate != ""
    ) {
      const commercialInsuranceExpiryDateObject = new Date(
        addAssociate.commercialInsuranceExpiryDate,
      );
      const commercialInsuranceExpiryDateISOString =
        commercialInsuranceExpiryDateObject.toISOString();
      payload.commercialInsuranceExpiryDate =
        commercialInsuranceExpiryDateISOString;
    }

    // Fix 4: duesDate
    if (!isISODate(addAssociate.duesDate) && addAssociate.duesDate != "") {
      const duesDateObject = new Date(addAssociate.duesDate);
      const duesDateISOString = duesDateObject.toISOString();
      payload.duesDate = duesDateISOString;
    }

    // Fix 5: joinDate
    if (!isISODate(addAssociate.joinDate) && addAssociate.joinDate != "") {
      const joinDateObject = new Date(addAssociate.joinDate);
      const joinDateISOString = joinDateObject.toISOString();
      payload.joinDate = joinDateISOString;
    }

    // Fix 6: hourlySalaryDesired
    payload.hourlySalaryDesired = parseInt(payload.hourlySalaryDesired);

    // Fix 7:  dateOfEntryIntoCountry
    if (
      !isISODate(addAssociate.dateOfEntryIntoCountry) &&
      addAssociate.dateOfEntryIntoCountry != ""
    ) {
      const dateOfEntryIntoCountryObject = new Date(
        addAssociate.dateOfEntryIntoCountry,
      );
      const dateOfEntryIntoCountryISOString =
        dateOfEntryIntoCountryObject.toISOString();
      payload.dateOfEntryIntoCountry = dateOfEntryIntoCountryISOString;
    }

    // Fix 8: statusInCountry
    payload.statusInCountry = parseInt(payload.statusInCountry);

    // Fix 9: maritalStatus
    payload.maritalStatus = parseInt(payload.maritalStatus);

    // Fix 10: accomplishedEducation
    payload.accomplishedEducation = parseInt(payload.accomplishedEducation);

    console.log("onSubmitClick: payload:", addAssociate);

    setFetching(false);
    setErrors({});
    postAssociateCreateAPI(payload, onSuccess, onError, onDone);
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
    setTopAlertMessage("Associate created");
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
    setAddAssociate(ADD_ASSOCIATE_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/associate/" + response.id);
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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Associates
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associates
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Associate
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
              Please carefully review the following associate details and if you
              are ready click the <b>Submit</b> to complete.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {addAssociate !== undefined &&
                  addAssociate !== null &&
                  addAssociate !== "" && (
                    <div className="container">
                      <p className="title is-4 mt-2">
                        <FontAwesomeIcon className="fas" icon={faIdCard} />
                        &nbsp;Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-3">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowSelect
                        label="Type"
                        selectedValue={addAssociate.type}
                        options={ASSOCIATE_TYPE_OF_FILTER_OPTIONS}
                      />
                      {addAssociate.type ===
                        COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                        <>
                          <DataDisplayRowText
                            label="Organization Name"
                            value={addAssociate.organizationName}
                          />
                          <DataDisplayRowSelect
                            label="Organization Type"
                            selectedValue={addAssociate.organizationType}
                            options={ASSOCIATE_ORGANIZATION_TYPE_OPTIONS}
                          />
                        </>
                      )}

                      <DataDisplayRowText
                        label="First Name"
                        value={addAssociate.firstName}
                      />

                      <DataDisplayRowText
                        label="Last Name"
                        value={addAssociate.lastName}
                      />

                      <DataDisplayRowText
                        label="Email"
                        value={addAssociate.email}
                        type="email"
                      />

                      <DataDisplayRowCheckbox
                        label="I agree to receive electronic email"
                        checked={addAssociate.isOkToEmail}
                      />

                      <DataDisplayRowText
                        label="Phone"
                        value={addAssociate.phone}
                        type="phone"
                      />

                      <DataDisplayRowSelect
                        label="Phone Type"
                        selectedValue={addAssociate.phoneType}
                        options={
                          ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                        }
                      />

                      {addAssociate.phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
                        <DataDisplayRowText
                          label="Phone Extension"
                          value={addAssociate.phoneExtension}
                        />
                      )}

                      <DataDisplayRowCheckbox
                        label="I agree to receive texts to my phone"
                        checked={addAssociate.isOkToText}
                      />

                      <DataDisplayRowText
                        label="Other Phone (Optional)"
                        value={addAssociate.otherPhone}
                        type="phone"
                      />

                      {addAssociate.otherPhoneType !== 0 && (
                        <DataDisplayRowSelect
                          label="Other Phone Type (Optional)"
                          selectedValue={addAssociate.otherPhoneType}
                          options={
                            ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                          }
                        />
                      )}

                      {addAssociate.otherPhoneType ===
                        ASSOCIATE_PHONE_TYPE_WORK && (
                        <DataDisplayRowText
                          label="Other Phone Extension (Optional)"
                          value={addAssociate.otherPhoneExtension}
                        />
                      )}

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faAddressBook} />
                        &nbsp;Address&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-4">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowCheckbox
                        label="Has shipping address different then billing address"
                        checked={addAssociate.hasShippingAddress}
                      />

                      <div className="columns">
                        <div className="column">
                          {addAssociate.hasShippingAddress ? (
                            <p className="subtitle is-6">Billing Address</p>
                          ) : (
                            <></>
                          )}

                          <DataDisplayRowText
                            label="Country"
                            value={addAssociate.country}
                          />

                          <DataDisplayRowText
                            label="Province/Territory"
                            value={addAssociate.region}
                          />

                          <DataDisplayRowText
                            label="City"
                            value={addAssociate.city}
                          />

                          <DataDisplayRowText
                            label="Address Line 1"
                            value={addAssociate.addressLine1}
                          />

                          <DataDisplayRowText
                            label="Address Line 2 (Optional)"
                            value={addAssociate.addressLine2}
                          />

                          <DataDisplayRowText
                            label="Postal Code)"
                            value={addAssociate.postalCode}
                          />
                        </div>
                        {addAssociate.hasShippingAddress && (
                          <div className="column">
                            <p className="subtitle is-6">Shipping Address</p>

                            <DataDisplayRowText
                              label="Name"
                              value={addAssociate.shippingName}
                            />

                            <DataDisplayRowText
                              label="Phone"
                              value={addAssociate.shippingPhone}
                              type="phone"
                            />

                            <DataDisplayRowText
                              label="Country"
                              value={addAssociate.shippingCountry}
                            />

                            <DataDisplayRowText
                              label="Province/Territory"
                              value={addAssociate.shippingRegion}
                            />

                            <DataDisplayRowText
                              label="City"
                              value={addAssociate.shippingCity}
                            />

                            <DataDisplayRowText
                              label="Address Line 1"
                              value={addAssociate.shippingAddressLine1}
                            />

                            <DataDisplayRowText
                              label="Address Line 2 (Optional)"
                              value={addAssociate.shippingAddressLine2}
                            />

                            <DataDisplayRowText
                              label="Postal Code"
                              value={addAssociate.shippingPostalCode}
                            />
                          </div>
                        )}
                      </div>

                      <p className="title is-4">
                        <FontAwesomeIcon
                          className="fas"
                          icon={faGraduationCap}
                        />
                        &nbsp;Skill Sets&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowSkillSetIDs
                        skillSets={addAssociate.skillSets}
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon
                          className="fas"
                          icon={faBalanceScale}
                        />
                        &nbsp;Insurance, financial,
                        etc&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowInsuranceRequirementIDs
                        insuranceRequirements={
                          addAssociate.insuranceRequirements
                        }
                      />

                      <DataDisplayRowText
                        label="Hourly Rate"
                        value={addAssociate.hourlySalaryDesired}
                        type="currency"
                      />

                      <DataDisplayRowText
                        label="Limitation or special consideration"
                        value={addAssociate.limitSpecial}
                      />

                      <DataDisplayRowText
                        label="Member Dues"
                        value={addAssociate.duesDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Commercial Insurance Expiry Date"
                        value={addAssociate.commercialInsuranceExpiryDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Auto Insurance Expiry Date"
                        value={addAssociate.autoInsuranceExpiryDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="WSIB # "
                        value={addAssociate.wsibNumber}
                      />

                      <DataDisplayRowText
                        label="WSIB Insurance Date"
                        value={addAssociate.wsibInsuranceDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Police Check Expiry"
                        value={addAssociate.policeCheck}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="HST #"
                        value={addAssociate.taxId}
                      />

                      <DataDisplayRowText
                        label="Drivers License Class"
                        value={addAssociate.driversLicenseClass}
                      />

                      <DataDisplayRowVehicleTypeIDs
                        label="Vehicle Types"
                        vehicleTypes={addAssociate.vehicleTypes}
                      />

                      <DataDisplayRowServiceFeeID
                        serviceFeeID={addAssociate.serviceFeeId}
                      />

                      <DataDisplayRowRadio
                        label="Preferred Language"
                        value={addAssociate.preferredLanguage}
                        opt1Value="English"
                        opt1Label="English"
                        opt2Value="French"
                        opt2Label="French"
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faUserFriends} />
                        &nbsp;Emergency
                        Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowText
                        label="Contact Name"
                        value={addAssociate.emergencyContactName}
                      />

                      <DataDisplayRowText
                        label="Contact Relationship"
                        value={addAssociate.emergencyContactRelationship}
                      />

                      <DataDisplayRowText
                        label="Contact Telephone"
                        value={addAssociate.emergencyContactTelephone}
                        type="phone"
                      />

                      <DataDisplayRowText
                        label="Contact Alternative Telephone (Optional)"
                        value={addAssociate.ContactAlternativeTelephone}
                        type="phone"
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faServer} />
                        &nbsp;System&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowText
                        label="Description"
                        value={addAssociate.description}
                      />

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faChartPie} />
                        &nbsp;Metrics&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/associates/add/step-6">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowMultiSelect
                        label="Do you identify as belonging to any of the following groups?"
                        selectedValues={addAssociate.identifyAs}
                        options={IDENTIFY_AS_OPTIONS}
                      />
                      <DataDisplayRowTagIDs tags={addAssociate.tags} />

                      <DataDisplayRowHowHearAboutUsItem
                        howDidYouHearAboutUsID={
                          addAssociate.howDidYouHearAboutUsID
                        }
                      />

                      {addAssociate.howDidYouHearAboutUsOther !== undefined &&
                        addAssociate.howDidYouHearAboutUsOther !== null &&
                        addAssociate.howDidYouHearAboutUsOther !== null && (
                          <DataDisplayRowText
                            label="How did you hear about us? (Other)"
                            value={addAssociate.howDidYouHearAboutUsOther}
                          />
                        )}

                      <DataDisplayRowSelect
                        label="Gender"
                        selectedValue={addAssociate.gender}
                        options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                      />
                      {addAssociate.gender === 1 && (
                        <DataDisplayRowText
                          label="Gender (Other)"
                          value={addAssociate.genderOther}
                        />
                      )}
                      <DataDisplayRowText
                        label="Birth Date (Optional)"
                        value={addAssociate.birthDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Join Date (Optional)"
                        value={addAssociate.joinDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Additional Comment"
                        value={addAssociate.additionalComment}
                      />

                      <DataDisplayRowRadio
                        label="Is Job Seeker?"
                        value={addAssociate.isJobSeeker}
                        opt1Value={ASSOCIATE_IS_JOB_SEEKER_YES}
                        opt1Label="Yes"
                        opt2Value={ASSOCIATE_IS_JOB_SEEKER_NO}
                        opt2Label="No"
                      />

                      {addAssociate.isJobSeeker ===
                        ASSOCIATE_IS_JOB_SEEKER_YES && (
                        <>
                          <DataDisplayRowSelect
                            label="Status in Country"
                            selectedValue={addAssociate.statusInCountry}
                            options={ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS}
                          />

                          {addAssociate.statusInCountry ===
                            ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                            <>
                              <DataDisplayRowText
                                label="Status in Country (Other)"
                                value={addAssociate.statusInCountryOther}
                              />
                            </>
                          )}
                          {(addAssociate.statusInCountry ===
                            ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                            addAssociate.statusInCountry ===
                              ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
                            addAssociate.statusInCountry ===
                              ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS) && (
                            <>
                              <DataDisplayRowText
                                label="Country of Origin"
                                value={addAssociate.countryOfOrigin}
                              />
                              <DataDisplayRowText
                                label="Date of Entry into Country"
                                value={addAssociate.dateOfEntryIntoCountry}
                                type="date"
                              />
                            </>
                          )}

                          <DataDisplayRowSelect
                            label="Marital Status"
                            selectedValue={addAssociate.maritalStatus}
                            options={
                              ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS
                            }
                          />

                          {addAssociate.maritalStatus ===
                            ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                            <>
                              <DataDisplayRowText
                                label="Marital Status (Other)"
                                value={addAssociate.maritalStatusOther}
                              />
                            </>
                          )}

                          <DataDisplayRowSelect
                            label="Accomplished level of Education"
                            selectedValue={addAssociate.accomplishedEducation}
                            options={
                              ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS
                            }
                          />

                          {addAssociate.accomplishedEducation ===
                            ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                            <>
                              <DataDisplayRowText
                                label="Accomplished level of Education (Other)"
                                value={addAssociate.accomplishedEducationOther}
                              />
                            </>
                          )}
                        </>
                      )}

                      <div className="columns pt-5">
                        <div className="column is-half">
                          <Link
                            className="button is-medium is-fullwidth-mobile"
                            to="/admin/associates/add/step-6"
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

export default AdminAssociateAddStep7;
