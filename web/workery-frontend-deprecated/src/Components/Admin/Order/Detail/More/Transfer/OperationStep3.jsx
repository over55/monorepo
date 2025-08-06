import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faForward,
  faFilterCircleXmark,
  faEllipsis,
  faCircleInfo,
  faExchangeAlt,
  faHardHat,
  faUserCircle,
  faFilter,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faWrench,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import {
  getOrderDetailAPI,
  postOrderCreateAPI,
} from "../../../../../../API/Order";
import { transferOrderOperationState } from "../../../../../../AppState";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../../Reusable/FormCheckboxField";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";

function AdminOrderMoreTransferOperationStep3() {
  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();

  ////
  //// Global state.
  ////

  const [transferOrderOperation, setTransferOrderOperation] = useRecoilState(
    transferOrderOperationState,
  );

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [actualSearchText, setActualSearchText] = useState(
    transferOrderOperation.associateSearch,
  );
  const [associateEmail, setAssociateEmail] = useState(
    transferOrderOperation.associateEmail,
  );
  const [associatePhone, setAssociatePhone] = useState(
    transferOrderOperation.associatePhone,
  );
  const [associateFirstName, setAssociateFirstName] = useState(
    transferOrderOperation.associateFirstName,
  );
  const [associateLastName, setAssociateLastName] = useState(
    transferOrderOperation.associateLastName,
  );
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(
    transferOrderOperation.associateIsAdvancedFiltering,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    if (
      actualSearchText === "" &&
      associateFirstName === "" &&
      associateLastName === "" &&
      associateEmail === "" &&
      associatePhone === ""
    ) {
      setErrors({
        message: "please enter a value",
      });
      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();
      return;
    }

    let newTransferOp = { ...transferOrderOperation };
    newTransferOp.associateIsAdvancedFiltering = isAdvancedFiltering;
    newTransferOp.associateEmail = associateEmail;
    newTransferOp.associatePhone = associatePhone;
    newTransferOp.associateFirstName = associateFirstName;
    newTransferOp.associateLastName = associateLastName;
    newTransferOp.associateSearch = actualSearchText;
    setTransferOrderOperation(newTransferOp);

    setForceURL(
      "/admin/order/" +
        oid +
        "/more/transfer/step-4?q=" +
        actualSearchText +
        "&fn=" +
        associateFirstName +
        "&ln=" +
        associateLastName +
        "&e=" +
        associateEmail +
        "&p=" +
        associatePhone,
    );
  };

  ////
  //// API.
  ////

  // Nothing.

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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}&nbsp;(More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faExchangeAlt} />
                  &nbsp;Transfer
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
                <Link to={`/admin/order/${oid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Order&nbsp;#{oid}&nbsp;(More)
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Order
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 3 of 5</p>
            <progress class="progress is-success" value="60" max="100">
              60%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <div className="columns is-12">
              <div className="column is-half">
                <p className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search for associate:
                </p>
              </div>
              <div className="column is-half has-text-right">
                <Link
                  className={`is-fullwidth-mobile ${isAdvancedFiltering ? `is-link` : `is-link is-light`}`}
                  onClick={(e) => {
                    setIsAdvancedFiltering(!isAdvancedFiltering);
                  }}
                >
                  {isAdvancedFiltering ? (
                    <>
                      <FontAwesomeIcon
                        className="fas"
                        icon={faFilterCircleXmark}
                      />
                      &nbsp;Clear Advanced Filters
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon className="fas" icon={faFilter} />
                      &nbsp;Advanced Filters
                    </>
                  )}
                </Link>
                &nbsp;
              </div>
            </div>

            <p className="has-text-grey pb-4">
              Please enter one or more of the following fields to begin
              searching.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <FormInputField
                    label={<u>Search Keywords</u>}
                    name="actualSearchText"
                    placeholder="Search..."
                    value={actualSearchText}
                    errorText={errors && errors.actualSearchText}
                    helpText=""
                    onChange={(e) => setActualSearchText(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  {isAdvancedFiltering && (
                    <>
                      <p className="title is-4 has-text-left pb-3">- OR -</p>
                      <div className="has-background-light container p-4">
                        <p className="title is-4">
                          <FontAwesomeIcon className="fas" icon={faFilter} />
                          &nbsp;Advanced Search
                        </p>
                        <p className="title is-5">
                          <FontAwesomeIcon className="fas" icon={faHardHat} />
                          &nbsp;<u>Associate</u>
                        </p>
                        <FormInputField
                          label="First Name"
                          name="associateFirstName"
                          placeholder="Text input"
                          value={associateFirstName}
                          errorText={errors && errors.associateFirstName}
                          helpText=""
                          onChange={(e) =>
                            setAssociateFirstName(e.target.value)
                          }
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Last Name"
                          name="associateLastName"
                          placeholder="Text input"
                          value={associateLastName}
                          errorText={errors && errors.associateLastName}
                          helpText=""
                          onChange={(e) => setAssociateLastName(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Email"
                          name="associateEmail"
                          type="email"
                          placeholder="Text input"
                          value={associateEmail}
                          errorText={errors && errors.associateEmail}
                          helpText=""
                          onChange={(e) => setAssociateEmail(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Phone"
                          name="associatePhone"
                          placeholder="Text input"
                          value={associatePhone}
                          errorText={errors && errors.associatePhone}
                          helpText=""
                          onChange={(e) => setAssociatePhone(e.target.value)}
                          isRequired={true}
                          maxWidth="150px"
                        />
                      </div>
                    </>
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to={`/admin/order/${oid}/more/transfer/step-2`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Step 2
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <Link
                        className="button is-medium is-warning is-fullwidth-mobile"
                        to={`/admin/order/${oid}/more/transfer/step-5`}
                      >
                        Skip&nbsp;
                        <FontAwesomeIcon className="fas" icon={faForward} />
                      </Link>
                      &nbsp;
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        <FontAwesomeIcon className="fas" icon={faSearch} />
                        &nbsp;Search
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

export default AdminOrderMoreTransferOperationStep3;
