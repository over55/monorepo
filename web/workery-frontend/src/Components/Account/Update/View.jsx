import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faGraduationCap,
  faCogs,
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
  faBalanceScale,
  faUserFriends,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import deepClone from "../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../Helpers/datetimeUtility";
import { putAccountUpdateAPI, getAccountDetailAPI } from "../../../API/Account";
import AlertBanner from "../../Reusable/EveryPage/AlertBanner";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormRadioField from "../../Reusable/FormRadioField";
import FormInputField from "../../Reusable/FormInputField";
import FormTextareaField from "../../Reusable/FormTextareaField";
import FormSelectField from "../../Reusable/FormSelectField";
import FormCheckboxField from "../../Reusable/FormCheckboxField";
import FormCountryField from "../../Reusable/FormCountryField";
import FormRegionField from "../../Reusable/FormRegionField";
import FormMultiSelectField from "../../Reusable/FormMultiSelectField";
import FormMultiSelectFieldForSkillSets from "../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForInsuranceRequirement from "../../Reusable/FormMultiSelectFieldForInsuranceRequirement";
import FormMultiSelectFieldForVehicleType from "../../Reusable/FormMultiSelectFieldForVehicleType";
import FormMultiSelectFieldForTags from "../../Reusable/FormMultiSelectFieldForTags";
import FormSelectFieldForServiceFee from "../../Reusable/FormSelectFieldForServiceFee";
import FormSelectFieldForHowHearAboutUsItem from "../../Reusable/FormSelectFieldForHowHear";
import FormAlternateDateField from "../../Reusable/FormAlternateDateField";
import FormPhoneField from "../../Reusable/FormPhoneField";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
} from "../../../Constants/App";
import {
  addStaffState,
  ADD_ASSOCIATE_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../Constants/FieldOptions";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";
import AccountExecutiveStaffUpdate from "./ExecutiveStaffView";
import AccountManagementOrFrontlineStaffUpdate from "./ManagementOrFrontlineStaffView";

function AccountUpdate() {
  ////
  //// Global state.
  ////

  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  ////
  //// API.
  ////

  // --- Details --- //

  function onAccountDetailSuccess(response) {
    console.log("onAccountDetailSuccess: Starting...");
    setCurrentUser(response);
  }

  function onAccountDetailError(apiErr) {
    console.log("onAccountDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAccountDetailDone() {
    console.log("onAccountDetailDone: Starting...");
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
      getAccountDetailAPI(
        onAccountDetailSuccess,
        onAccountDetailError,
        onAccountDetailDone,
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// Component rendering.
  ////

  if (currentUser) {
    switch (currentUser.role) {
      case EXECUTIVE_ROLE_ID:
        return (
          <AccountExecutiveStaffUpdate
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        );
        break;
      case MANAGEMENT_ROLE_ID:
        return (
          <AccountManagementOrFrontlineStaffUpdate
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        );
        break;
      case FRONTLINE_ROLE_ID:
        return (
          <AccountManagementOrFrontlineStaffUpdate
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        );
        break;

      default:
        return (
          <>
            <p>Unsupported role</p>
          </>
        );
    }
  }

  return <>Loading...</>;
}

export default AccountUpdate;
