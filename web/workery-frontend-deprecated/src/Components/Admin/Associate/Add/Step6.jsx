import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormMultiSelectFieldForTags from "../../../Reusable/FormMultiSelectFieldForTags";
import FormSelectFieldForHowHearAboutUsItem from "../../../Reusable/FormSelectFieldForHowHear";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormCountryField from "../../../Reusable/FormCountryField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../AppState";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
  ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER,
} from "../../../../Constants/App";
// import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";

function AdminAssociateAddStep6() {
  ////
  //// Global state.
  ////

  const [addAssociate, setAddAssociate] = useRecoilState(addAssociateState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [tags, setTags] = useState(addAssociate.tags);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    addAssociate.howDidYouHearAboutUsID,
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(addAssociate.isHowDidYouHearAboutUsOther);
  const [howDidYouHearAboutUsOther, setHowHearAboutUsItemOther] = useState(
    addAssociate.howDidYouHearAboutUsOther,
  );
  const [birthDate, setBirthDate] = useState(addAssociate.birthDate);
  const [joinDate, setJoinDate] = useState(addAssociate.joinDate);
  const [gender, setGender] = useState(addAssociate.gender);
  const [genderOther, setGenderOther] = useState(addAssociate.genderOther);
  const [additionalComment, setAdditionalComment] = useState(
    addAssociate.additionalComment,
  );
  const [identifyAs, setIdentifyAs] = useState(addAssociate.identifyAs);
  const [isJobSeeker, setIsJobSeeker] = useState(addAssociate.isJobSeeker);
  const [statusInCountry, setStatusInCountry] = useState(
    addAssociate.statusInCountry,
  );
  const [statusInCountryOther, setStatusInCountryOther] = useState(
    addAssociate.statusInCountryOther,
  );
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    addAssociate.countryOfOrigin,
  );
  const [dateOfEntryIntoCountry, setDateOfEntryIntoCountry] = useState(
    addAssociate.dateOfEntryIntoCountry,
  );
  const [maritalStatus, setMaritalStatus] = useState(
    addAssociate.maritalStatus,
  );
  const [maritalStatusOther, setMaritalStatusOther] = useState(
    addAssociate.maritalStatusOther,
  );
  const [accomplishedEducation, setAccomplishedEducation] = useState(
    addAssociate.accomplishedEducation,
  );
  const [accomplishedEducationOther, setAccomplishedEducationOther] = useState(
    addAssociate.accomplishedEducationOther,
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    addAssociate.preferredLanguage,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (howDidYouHearAboutUsID === "") {
      newErrors["howDidYouHearAboutUsID"] = "missing value";
      hasErrors = true;
    } else {
      if (
        isHowDidYouHearAboutUsOther === true &&
        howDidYouHearAboutUsOther === ""
      ) {
        newErrors["howDidYouHearAboutUsOther"] = "missing value";
        hasErrors = true;
      }
    }
    if (gender === undefined || gender === null || gender === 0) {
      newErrors["gender"] = "missing value";
      hasErrors = true;
    }
    if (gender === 1) {
      if (
        genderOther === undefined ||
        genderOther === null ||
        genderOther === ""
      ) {
        newErrors["genderOther"] = "missing value";
        hasErrors = true;
      }
    }
    if (
      birthDate === undefined ||
      birthDate === null ||
      birthDate === "0001-01-01T00:00:00Z"
    ) {
      newErrors["birthDate"] = "missing value";
      hasErrors = true;
    }
    if (
      isJobSeeker === undefined ||
      isJobSeeker === null ||
      isJobSeeker === ""
    ) {
      newErrors["isJobSeeker"] = "missing value";
      hasErrors = true;
    } else {
      if (isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES) {
        if (
          statusInCountry === undefined ||
          statusInCountry === null ||
          statusInCountry === ""
        ) {
          newErrors["statusInCountry"] = "missing value";
          hasErrors = true;
        } else if (
          statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER &&
          (statusInCountryOther === undefined ||
            statusInCountryOther === null ||
            statusInCountryOther === "")
        ) {
          newErrors["statusInCountryOther"] = "missing value";
          hasErrors = true;
        }
        if (
          statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
          statusInCountry ===
            ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
          statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS
        ) {
          if (
            countryOfOrigin === undefined ||
            countryOfOrigin === null ||
            countryOfOrigin === ""
          ) {
            newErrors["countryOfOrigin"] = "missing value";
            hasErrors = true;
          }
          if (
            dateOfEntryIntoCountry === undefined ||
            dateOfEntryIntoCountry === null ||
            dateOfEntryIntoCountry === "0001-01-01T00:00:00Z"
          ) {
            newErrors["dateOfEntryIntoCountry"] = "missing value";
            hasErrors = true;
          }
        }

        if (
          maritalStatus === undefined ||
          maritalStatus === null ||
          maritalStatus === ""
        ) {
          newErrors["maritalStatus"] = "missing value";
          hasErrors = true;
        } else if (
          maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER &&
          (maritalStatusOther === undefined ||
            maritalStatusOther === null ||
            maritalStatusOther === "")
        ) {
          newErrors["maritalStatusOther"] = "missing value";
          hasErrors = true;
        }

        if (
          accomplishedEducation === undefined ||
          accomplishedEducation === null ||
          accomplishedEducation === ""
        ) {
          newErrors["accomplishedEducation"] = "missing value";
          hasErrors = true;
        } else if (
          accomplishedEducation === ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER &&
          (accomplishedEducationOther === undefined ||
            accomplishedEducationOther === null ||
            accomplishedEducationOther === "")
        ) {
          newErrors["accomplishedEducationOther"] = "missing value";
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      console.log("onSubmitClick: Ending with error.");
      return;
    }

    // Save to persistent storage.
    let modifiedAddAssociate = { ...addAssociate };
    modifiedAddAssociate.tags = tags;
    modifiedAddAssociate.howDidYouHearAboutUsID = howDidYouHearAboutUsID;
    modifiedAddAssociate.howDidYouHearAboutUsOther = howDidYouHearAboutUsOther;
    modifiedAddAssociate.gender = gender;
    modifiedAddAssociate.genderOther = genderOther;
    modifiedAddAssociate.birthDate = birthDate;
    modifiedAddAssociate.joinDate = joinDate;
    modifiedAddAssociate.additionalComment = additionalComment;
    modifiedAddAssociate.identifyAs = identifyAs;
    modifiedAddAssociate.isJobSeeker = isJobSeeker;
    modifiedAddAssociate.statusInCountry = statusInCountry;
    modifiedAddAssociate.statusInCountryOther = statusInCountryOther;
    modifiedAddAssociate.countryOfOrigin = countryOfOrigin;
    modifiedAddAssociate.dateOfEntryIntoCountry = dateOfEntryIntoCountry;
    modifiedAddAssociate.maritalStatus = maritalStatus;
    modifiedAddAssociate.maritalStatusOther = maritalStatusOther;
    modifiedAddAssociate.accomplishedEducation = accomplishedEducation;
    modifiedAddAssociate.accomplishedEducationOther =
      accomplishedEducationOther;
    modifiedAddAssociate.preferredLanguage = preferredLanguage;
    setAddAssociate(modifiedAddAssociate);

    console.log("onSubmitClick: Ending with success.");

    // Redirect to the next page.
    setForceURL("/admin/associates/add/step-7");
  };

  ////
  //// API.
  ////

  // Do nothing.

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
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 6 of 7</p>
            <progress class="progress is-success" value="86" max="100">
              86%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faBriefcase} />
              &nbsp;Job Seeker
            </p>

            <FormRadioField
              label="Is this Associate also a Job Seeker?"
              name="isJobSeeker"
              value={isJobSeeker}
              errorText={errors && errors.isJobSeeker}
              opt1Value={1}
              opt1Label="Yes"
              opt2Value={2}
              opt2Label="No"
              onChange={(e) => setIsJobSeeker(parseInt(e.target.value))}
            />

            {isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
              <>
                <FormSelectField
                  label="Status in Country"
                  name="statusInCountry"
                  placeholder="statusInCountry"
                  selectedValue={statusInCountry}
                  errorText={errors && errors.statusInCountry}
                  helpText=""
                  onChange={(e) => setStatusInCountry(parseInt(e.target.value))}
                  options={
                    ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS
                  }
                />
                {statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                  <FormInputField
                    label="Status in Country (Other)"
                    name="statusInCountryOther"
                    type="text"
                    placeholder="Text input"
                    value={statusInCountryOther}
                    errorText={errors && errors.statusInCountryOther}
                    helpText=""
                    onChange={(e) => setStatusInCountryOther(e.target.value)}
                    isRequired={false}
                    maxWidth="380px"
                  />
                )}
                {(statusInCountry ===
                  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                  statusInCountry ===
                    ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
                  statusInCountry ===
                    ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS) && (
                  <>
                    <FormCountryField
                      priorityOptions={[]}
                      label="Country of Origin"
                      name="countryOfOrigin"
                      placeholder="Text input"
                      selectedCountry={countryOfOrigin}
                      errorText={errors && errors.countryOfOrigin}
                      helpText=""
                      onChange={(value) => setCountryOfOrigin(value)}
                      isRequired={true}
                      maxWidth="160px"
                    />
                    <FormAlternateDateField
                      label="Date of Entry into Country"
                      name="dateOfEntryIntoCountry"
                      placeholder="Text input"
                      value={dateOfEntryIntoCountry}
                      helpText=""
                      onChange={(date) => setDateOfEntryIntoCountry(date)}
                      errorText={errors && errors.dateOfEntryIntoCountry}
                      isRequired={true}
                      maxWidth="180px"
                    />
                  </>
                )}
                <FormSelectField
                  label="Marital Status"
                  name="maritalStatus"
                  placeholder="maritalStatus"
                  selectedValue={maritalStatus}
                  errorText={errors && errors.maritalStatus}
                  helpText=""
                  onChange={(e) => setMaritalStatus(parseInt(e.target.value))}
                  options={ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS}
                />
                {maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                  <FormInputField
                    label="Marital Status (Other)"
                    name="maritalStatusOther"
                    type="text"
                    placeholder="Text input"
                    value={maritalStatusOther}
                    errorText={errors && errors.maritalStatusOther}
                    helpText=""
                    onChange={(e) => setMaritalStatusOther(e.target.value)}
                    isRequired={false}
                    maxWidth="380px"
                  />
                )}

                <FormSelectField
                  label="Accomplished level of Education"
                  name="accomplishedEducation"
                  placeholder="accomplishedEducation"
                  selectedValue={accomplishedEducation}
                  errorText={errors && errors.accomplishedEducation}
                  helpText=""
                  onChange={(e) =>
                    setAccomplishedEducation(parseInt(e.target.value))
                  }
                  options={
                    ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS
                  }
                />
                {accomplishedEducation ===
                  ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER && (
                  <FormInputField
                    label="Marital Status (Other)"
                    name="accomplishedEducationOther"
                    type="text"
                    placeholder="Text input"
                    value={accomplishedEducationOther}
                    errorText={errors && errors.accomplishedEducationOther}
                    helpText=""
                    onChange={(e) =>
                      setAccomplishedEducationOther(e.target.value)
                    }
                    isRequired={false}
                    maxWidth="380px"
                  />
                )}
              </>
            )}

            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faChartPie} />
              &nbsp;Metrics
            </p>

            <p className="has-text-grey pb-4">
              Please fill out all the required fields before submitting this
              form.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <FormMultiSelectFieldForTags
                    label="Tags (Optional)"
                    name="tags"
                    placeholder="Pick tags"
                    tags={tags}
                    setTags={setTags}
                    errorText={errors && errors.tags}
                    helpText="Pick the tags you would like to associate with this associate."
                    isRequired={true}
                    maxWidth="320px"
                  />

                  <FormMultiSelectField
                    label="Do you identify as belonging to any of the following groups? (Optional)"
                    name="identifyAs"
                    placeholder="Text input"
                    options={IDENTIFY_AS_OPTIONS}
                    selectedValues={identifyAs}
                    onChange={(e) => {
                      let values = [];
                      for (let option of e) {
                        values.push(option.value);
                      }
                      setIdentifyAs(values);
                    }}
                    errorText={errors && errors.identifyAs}
                    helpText=""
                    isRequired={true}
                    maxWidth="320px"
                  />

                  <FormSelectFieldForHowHearAboutUsItem
                    howDidYouHearAboutUsID={howDidYouHearAboutUsID}
                    setHowDidYouHearAboutUsID={setHowDidYouHearAboutUsID}
                    isHowDidYouHearAboutUsOther={isHowDidYouHearAboutUsOther}
                    setIsHowDidYouHearAboutUsOther={
                      setIsHowDidYouHearAboutUsOther
                    }
                    errorText={errors && errors.howDidYouHearAboutUsID}
                    helpText=""
                    isRequired={true}
                    maxWidth="520px"
                  />
                  {isHowDidYouHearAboutUsOther === true && (
                    <>
                      <FormInputField
                        label="How did you hear about us? (Other)"
                        name="howDidYouHearAboutUsOther"
                        placeholder="Text input"
                        value={howDidYouHearAboutUsOther}
                        errorText={errors && errors.howDidYouHearAboutUsOther}
                        helpText=""
                        onChange={(e) =>
                          setHowHearAboutUsItemOther(e.target.value)
                        }
                        isRequired={true}
                        maxWidth="100%"
                      />
                    </>
                  )}

                  <FormSelectField
                    label="Gender"
                    name="gender"
                    placeholder="Pick"
                    selectedValue={gender}
                    errorText={errors && errors.gender}
                    helpText=""
                    onChange={(e) => setGender(parseInt(e.target.value))}
                    options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                  />

                  {gender === 1 && (
                    <FormInputField
                      label="Gender (Other)"
                      name="genderOther"
                      placeholder="Text input"
                      value={genderOther}
                      errorText={errors && errors.genderOther}
                      helpText=""
                      onChange={(e) => setGenderOther(e.target.value)}
                      isRequired={true}
                      maxWidth="380px"
                    />
                  )}

                  <FormAlternateDateField
                    label="Birth Date"
                    name="birthDate"
                    placeholder="Text input"
                    value={birthDate}
                    helpText=""
                    onChange={(date) => setBirthDate(date)}
                    errorText={errors && errors.birthDate}
                    isRequired={true}
                    maxWidth="180px"
                    maxDate={new Date()}
                  />

                  {/*
                    <FormAlternateDateField
                        label="Join Date"
                        name="joinDate"
                        placeholder="Text input"
                        value={joinDate}
                        helpText="This indicates when the user joined the workery"
                        onChange={(date)=>setJoinDate(date)}
                        errorText={errors && errors.joinDate}
                        isRequired={true}
                        maxWidth="180px"
                    />
                  */}

                  <FormTextareaField
                    label="Additional Comment (Optional)"
                    name="additionalComment"
                    placeholder="Text input"
                    value={additionalComment}
                    errorText={errors && errors.additionalComment}
                    helpText=""
                    onChange={(e) => setAdditionalComment(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 638 characters"}
                    rows={4}
                  />

                  <FormRadioField
                    label="Preferred Language"
                    name="preferredLanguage"
                    value={preferredLanguage}
                    errorText={errors && errors.preferredLanguage}
                    opt1Value="English"
                    opt1Label="English"
                    opt2Value="French"
                    opt2Label="French"
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/associates/add/step-5"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        Next&nbsp;
                        <FontAwesomeIcon className="fas" icon={faArrowRight} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminAssociateAddStep6;
