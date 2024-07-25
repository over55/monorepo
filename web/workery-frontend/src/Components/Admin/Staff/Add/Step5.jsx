import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faKey,
  faUserFriends,
  faBalanceScale,
  faGraduationCap,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faUserTie,
  faBuilding,
  faClose,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForInsuranceRequirement from "../../../Reusable/FormMultiSelectFieldForInsuranceRequirement";
import FormMultiSelectFieldForVehicleType from "../../../Reusable/FormMultiSelectFieldForVehicleType";
import FormSelectFieldForServiceFee from "../../../Reusable/FormSelectFieldForServiceFee";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormPhoneField from "../../../Reusable/FormPhoneField";
import FormRadioField from "../../../Reusable/FormRadioField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import { addStaffState, ADD_STAFF_STATE_DEFAULT } from "../../../../AppState";

function AdminStaffAddStep5() {
  ////
  //// Global state.
  ////

  const [addStaff, setAddStaff] = useRecoilState(addStaffState);
  const [country] = useState(addStaff.country);

  ////
  //// Component states.
  ////

  // Page related.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Form data related.
  const [limitSpecial, setLimitSpecial] = useState(addStaff.limitSpecial);
  const [policeCheck, setPoliceCheck] = useState(addStaff.policeCheck);
  const [driversLicenseClass, setDriversLicenseClass] = useState(
    addStaff.driversLicenseClass,
  );
  const [vehicleTypes, setVehicleTypes] = useState(addStaff.vehicleTypes);
  const [emergencyContactName, setEmergencyContactName] = useState(
    addStaff.emergencyContactName,
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState(addStaff.emergencyContactRelationship);
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState(
    addStaff.emergencyContactTelephone,
  );
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState(addStaff.emergencyContactAlternativeTelephone);
  const [description, setDescription] = useState(addStaff.description);
  const [preferredLanguage, setPreferredLanguage] = useState(
    addStaff.preferredLanguage,
  );
  const [password, setPassword] = useState(addStaff.password);
  const [passwordRepeated, setPasswordRepeated] = useState(
    addStaff.passwordRepeated,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;
    if (
      emergencyContactName === undefined ||
      emergencyContactName === null ||
      emergencyContactName === ""
    ) {
      newErrors["emergencyContactName"] = "missing value";
      hasErrors = true;
    }
    if (
      emergencyContactRelationship === undefined ||
      emergencyContactRelationship === null ||
      emergencyContactRelationship === ""
    ) {
      newErrors["emergencyContactRelationship"] = "missing value";
      hasErrors = true;
    }
    if (
      emergencyContactTelephone === undefined ||
      emergencyContactTelephone === null ||
      emergencyContactTelephone === ""
    ) {
      newErrors["emergencyContactTelephone"] = "missing value";
      hasErrors = true;
    }
    if (
      preferredLanguage === undefined ||
      preferredLanguage === null ||
      preferredLanguage === ""
    ) {
      newErrors["preferredLanguage"] = "missing value";
      hasErrors = true;
    }
    if (password !== passwordRepeated) {
      newErrors["password"] = "does not match";
      newErrors["passwordRepeated"] = "does not match";
      hasErrors = true;
    }

    if (hasErrors) {
      // Set the staff based error validation.
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
    let modifiedAddStaff = { ...addStaff };
    modifiedAddStaff.limitSpecial = limitSpecial;
    modifiedAddStaff.policeCheck = policeCheck;
    modifiedAddStaff.driversLicenseClass = driversLicenseClass;
    modifiedAddStaff.vehicleTypes = vehicleTypes;
    modifiedAddStaff.emergencyContactName = emergencyContactName;
    modifiedAddStaff.emergencyContactRelationship =
      emergencyContactRelationship;
    modifiedAddStaff.emergencyContactTelephone = emergencyContactTelephone;
    modifiedAddStaff.emergencyContactAlternativeTelephone =
      emergencyContactAlternativeTelephone;
    modifiedAddStaff.description = description;
    modifiedAddStaff.preferredLanguage = preferredLanguage;
    modifiedAddStaff.password = password;
    modifiedAddStaff.passwordRepeated = passwordRepeated;
    setAddStaff(modifiedAddStaff);

    console.log("onSubmitClick: Ending with success.");

    // Redirect to the next page.
    setForceURL("/admin/staff/add/step-6");
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
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 5 of 7</p>
            <progress class="progress is-success" value="71" max="100">
              71%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faUserTie} />
              &nbsp;Account
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
                  <p className="title is-6 mt-2">
                    <FontAwesomeIcon className="fas" icon={faBalanceScale} />
                    &nbsp;Insurance, financial, etc
                  </p>

                  <FormTextareaField
                    label="Limitation or special consideration (optional)"
                    name="limitSpecial"
                    placeholder="Text input"
                    value={limitSpecial}
                    errorText={errors && errors.limitSpecial}
                    helpText=""
                    onChange={(e) => setLimitSpecial(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 638 characters"}
                    rows={4}
                  />

                  <FormAlternateDateField
                    label="Police Check Expiry (optional)"
                    name="policeCheck"
                    placeholder="Text input"
                    value={policeCheck}
                    errorText={errors && errors.policeCheck}
                    helpText=""
                    onChange={(date) => setPoliceCheck(date)}
                    isRequired={false}
                    maxWidth="187px"
                  />

                  <FormInputField
                    label="Drivers License Class (optional)"
                    name="driversLicenseClass"
                    type="text"
                    placeholder="Text input"
                    value={driversLicenseClass}
                    errorText={errors && errors.driversLicenseClass}
                    helpText=""
                    onChange={(e) => setDriversLicenseClass(e.target.value)}
                    isRequired={false}
                    maxWidth="380px"
                  />

                  <FormMultiSelectFieldForVehicleType
                    label="Vehicle Types (optional)"
                    name="vehicleTypes"
                    placeholder="Pick vehicle types"
                    vehicleTypes={vehicleTypes}
                    setVehicleTypes={setVehicleTypes}
                    errorText={errors && errors.vehicleTypes}
                    helpText="Pick the vehicle types you would like to staff with this cliient."
                    isRequired={true}
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

                  <p className="title is-6 mt-2">
                    <FontAwesomeIcon className="fas" icon={faUserFriends} />
                    &nbsp;Emergency Contact
                  </p>

                  <FormInputField
                    label="Contact Name"
                    name="emergencyContactName"
                    type="text"
                    placeholder="Text input"
                    value={emergencyContactName}
                    errorText={errors && errors.emergencyContactName}
                    helpText=""
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    isRequired={false}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Contact Relationship"
                    name="emergencyContactRelationship"
                    type="text"
                    placeholder="Text input"
                    value={emergencyContactRelationship}
                    errorText={errors && errors.emergencyContactRelationship}
                    helpText=""
                    onChange={(e) =>
                      setEmergencyContactRelationship(e.target.value)
                    }
                    isRequired={false}
                    maxWidth="380px"
                  />

                  <FormPhoneField
                    label="Contact Telephone"
                    name="emergencyContactTelephone"
                    selectedCountry={country}
                    selectePhoneNumber={emergencyContactTelephone}
                    errorText={errors && errors.emergencyContactTelephone}
                    helpText=""
                    onChange={(ph) => setEmergencyContactTelephone(ph)}
                    isRequired={false}
                    maxWidth="190px"
                  />

                  <FormPhoneField
                    label="Contact Alternative Telephone (Optional)"
                    name="emergencyContactAlternativeTelephone"
                    type="text"
                    placeholder="Text input"
                    selectedCountry={country}
                    selectePhoneNumber={emergencyContactAlternativeTelephone}
                    errorText={
                      errors && errors.emergencyContactAlternativeTelephone
                    }
                    helpText=""
                    onChange={(ph) =>
                      setEmergencyContactAlternativeTelephone(ph)
                    }
                    isRequired={false}
                    maxWidth="190px"
                  />

                  <p className="title is-6 mt-2">
                    <FontAwesomeIcon className="fas" icon={faKey} />
                    &nbsp;Login Credentials
                  </p>

                  <FormInputField
                    label="Password (Optional)"
                    name="password"
                    placeholder="Password input"
                    value={password}
                    errorText={errors && errors.password}
                    helpText=""
                    onChange={(e) => setPassword(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                    type="password"
                  />

                  <FormInputField
                    label="Password Repeated (Optional)"
                    name="passwordRepeated"
                    placeholder="Password input again"
                    value={passwordRepeated}
                    errorText={errors && errors.passwordRepeated}
                    helpText=""
                    onChange={(e) => setPasswordRepeated(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                    type="password"
                  />

                  <p className="title is-6 mt-2">
                    <FontAwesomeIcon className="fas" icon={faServer} />
                    &nbsp;System
                  </p>

                  <FormTextareaField
                    label="Description (optional)"
                    name="description"
                    placeholder="Text input"
                    value={description}
                    errorText={errors && errors.description}
                    helpText=""
                    onChange={(e) => setDescription(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 638 characters"}
                    rows={4}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/staff/add/step-4"
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

export default AdminStaffAddStep5;
