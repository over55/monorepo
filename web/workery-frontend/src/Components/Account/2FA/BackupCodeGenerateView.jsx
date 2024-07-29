import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faBuilding,
  faEnvelope,
  faSquarePhone,
  faTable,
  faHome,
  faLock,
  faTimesCircle,
  faArrowRight,
  faImage,
  faEllipsis,
  faRepeat,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faKey,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAccountDetailAPI } from "../../../API/Account";
import { postDisableOTP } from "../../../API/Gateway";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../Reusable/EveryPage/CheckboxTextFormatter";
import SelectTextFormatter from "../../Reusable/EveryPage/SelectTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormTextareaField from "../../Reusable/FormTextareaField";
import FormRadioField from "../../Reusable/FormRadioField";
import FormMultiSelectField from "../../Reusable/FormMultiSelectField";
import FormSelectField from "../../Reusable/FormSelectField";
import FormCheckboxField from "../../Reusable/FormCheckboxField";
import FormCountryField from "../../Reusable/FormCountryField";
import FormRegionField from "../../Reusable/FormRegionField";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import FormInputField from "../../Reusable/FormInputField";
import FormTextYesNoRow from "../../Reusable/FormRowTextYesNo";
import DataDisplayRowImage from "../../Reusable/DataDisplayRowImage";
import TagsTextFormatter from "../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../Constants/App";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";
import {
  USER_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  USER_TYPE_OF_FILTER_OPTIONS,
  USER_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../Constants/FieldOptions";

function AccountTwoFactorAuthenticationBackupCodeGenerate() {
  ////
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const backupCode = searchParams.get("v");

  ////
  //// Global state.
  ////

  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  // Page related states.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  ////
  //// API.
  ////

  // --- Account Detail --- //

  const onAccountDetailSuccess = (response) => {
    console.log("onAccountDetailSuccess: Starting...");
    setCurrentUser(response);
  };

  const onAccountDetailError = (apiErr) => {
    console.log("onAccountDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  };

  const onAccountDetailDone = () => {
    console.log("onAccountDetailDone: Starting...");
    setFetching(false);
  };

  // --- 2FA Disable --- //

  ////
  //// BREADCRUMB
  ////

  const generateBreadcrumbItemLink = (currentUser) => {
    let dashboardLink;
    switch (currentUser.role) {
      case EXECUTIVE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case MANAGEMENT_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case FRONTLINE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case CUSTOMER_ROLE_ID:
        dashboardLink = "/c/dashboard";
        break;
      case ASSOCIATE_ROLE_ID:
        dashboardLink = "/a/dashboard";
        break;
      case ASSOCIATE_JOB_SEEKER_ROLE_ID:
        dashboardLink = "/js/dashboard";
        break;
      default:
        dashboardLink = "/501"; // Default or error handling
        break;
    }
    return dashboardLink;
  };

  const breadcrumbItems = {
    items: [
      {
        text: "Dashboard",
        link: generateBreadcrumbItemLink(currentUser),
        isActive: false,
        icon: faGauge,
      },
      { text: "Account", link: "/account", icon: faUserCircle, isActive: true },
    ],
    mobileBackLinkItems: {
      link: generateBreadcrumbItemLink(currentUser),
      text: "Back to Dashboard",
      icon: faArrowLeft,
    },
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
      setFetching(true);
      setErrors({});
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

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  // showDisableOTPWarning, setShowDisableOTPWarning

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
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li>
                <Link to={"/account/2fa"} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Profile (2FA)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faKey} />
                  &nbsp;Backup Code
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
                <Link to={`/account/2fa`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail (2FA)
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Profile
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {currentUser && (
              <>
                <div className="columns">
                  <div className="column">
                    <p className="title is-4">
                      <FontAwesomeIcon className="fas" icon={faKey} />
                      &nbsp;2FA Backup Code
                    </p>
                  </div>
                  <div className="column has-text-right">
                    {/* Add buttons */}
                  </div>
                </div>

                {/* Notification */}
                <article class="message is-primary">
                  <div class="message-body">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    &nbsp;Successfull 2FA Verification
                  </div>
                </article>

                {/* Content */}
                <div className="content">
                  <FormErrorBox errors={errors} />
                  <p class="has-text-grey">
                    You have successfully verified your 2FA code and now are
                    granted backup code which you can use in case you lose your
                    phone or experience data loss.
                  </p>
                  <p class="has-text-grey">
                    Do not share this code with anyone and store it in a safe
                    location, as it provides full access to your account.
                  </p>
                  <FormInputField
                    label="2FA Backup Code"
                    name="backupCode"
                    placeholder="See your authenticator app"
                    value={backupCode}
                    errorText={errors && errors.backupCode}
                    onChange={null}
                    isRequired={true}
                  />
                </div>
              </>
            )}
            <nav class="level">
              <div class="level-left">
                <div class="level-item">{/* Add button here */}</div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <Link
                    type="button"
                    class="button is-primary is-fullwidth-mobile"
                    to={`/account/2fa`}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    &nbsp;I confirm go back to Detail (2FA)
                  </Link>
                </div>
              </div>
            </nav>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AccountTwoFactorAuthenticationBackupCodeGenerate;
