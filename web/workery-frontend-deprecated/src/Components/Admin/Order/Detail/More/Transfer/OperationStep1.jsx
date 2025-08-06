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
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../../Reusable/FormCheckboxField";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import {
  transferOrderOperationState,
  TRANSFER_ORDER_OPERATION_STATE_DEFAULT,
} from "../../../../../../AppState";

function AdminOrderMoreTransferOperationStep1() {
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
  const [actualSearchText, setActualSearchText] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);

  ////
  //// Event handling.
  ////

  const onSearchClick = (e) => {
    console.log("onSearchClick: Beginning...");
    if (
      customerFirstName === "" &&
      customerLastName === "" &&
      customerEmail === "" &&
      customerPhone === "" &&
      actualSearchText === ""
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

    // Reset the previous results.
    let newTransferOp = { ...TRANSFER_ORDER_OPERATION_STATE_DEFAULT };
    newTransferOp.clientIsAdvancedFiltering = isAdvancedFiltering;
    newTransferOp.clientSearch = actualSearchText;
    newTransferOp.clientEmail = customerEmail;
    newTransferOp.clientPhone = customerPhone;
    newTransferOp.clientFirstName = customerFirstName;
    newTransferOp.clientLastName = customerLastName;
    setTransferOrderOperation(newTransferOp);

    // Redirect the user to the next page.
    setForceURL(
      "/admin/order/" +
        oid +
        "/more/transfer/step-2?fn=" +
        customerFirstName +
        "&ln=" +
        customerLastName +
        "&e=" +
        customerEmail +
        "&p=" +
        customerPhone +
        "&q=" +
        actualSearchText,
    );
  };

  const onSkipClick = (e) => {
    console.log("onSkipClick: Beginning...");

    // Reset the previous results.
    let newTransferOp = { ...TRANSFER_ORDER_OPERATION_STATE_DEFAULT };
    setTransferOrderOperation(newTransferOp);

    // Redirect the user to the next page.
    setForceURL("/admin/order/" + oid + "/more/transfer/step-3");
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
            <p className="subtitle is-5">Step 1 of 5</p>
            <progress class="progress is-success" value="20" max="100">
              20%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <div className="columns is-12">
              <div className="column is-half">
                <p className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search for client:
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
                          <FontAwesomeIcon
                            className="fas"
                            icon={faUserCircle}
                          />
                          &nbsp;<u>Customer</u>
                        </p>
                        <FormInputField
                          label="First Name"
                          name="customerFirstName"
                          placeholder="Text input"
                          value={customerFirstName}
                          errorText={errors && errors.customerFirstName}
                          helpText=""
                          onChange={(e) => setCustomerFirstName(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Last Name"
                          name="customerLastName"
                          placeholder="Text input"
                          value={customerLastName}
                          errorText={errors && errors.customerLastName}
                          helpText=""
                          onChange={(e) => setCustomerLastName(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Email"
                          name="customerEmail"
                          type="email"
                          placeholder="Text input"
                          value={customerEmail}
                          errorText={errors && errors.customerEmail}
                          helpText=""
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Phone"
                          name="customerPhone"
                          placeholder="Text input"
                          value={customerPhone}
                          errorText={errors && errors.customerPhone}
                          helpText=""
                          onChange={(e) => setCustomerPhone(e.target.value)}
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
                        to={`/admin/order/${oid}/more`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to More
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <Link
                        className="button is-medium is-warning is-fullwidth-mobile"
                        onClick={onSkipClick}
                      >
                        Skip&nbsp;
                        <FontAwesomeIcon className="fas" icon={faForward} />
                      </Link>
                      &nbsp;
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSearchClick}
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

export default AdminOrderMoreTransferOperationStep1;
