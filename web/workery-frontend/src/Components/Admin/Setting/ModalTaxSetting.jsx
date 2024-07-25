import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCircleInfo,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import { topAlertMessageState, topAlertStatusState } from "../../../AppState";
import {
  postTenantUpdateTaxRateOperationAPI,
} from "../../../API/Tenant";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormInputField from "../../Reusable/FormInputField";
import FormTextareaField from "../../Reusable/FormTextareaField";

function TaxSettingModal({ currentUser, tenant, showModal, setShowModal, onSuccess }) {
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

  // Modal state.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Form state.
  const [taxRate, setTaxRate] = useState(tenant.taxRate);

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setShowModal(false);
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setFetching(true);
    setErrors({});
    postTenantUpdateTaxRateOperationAPI(
      currentUser.tenantId,
      parseFloat(taxRate),
      onOperationSuccess,
      onOperationError,
      onOperationDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Operation --- //

  const onOperationSuccess = (response) => {
    onSuccess();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Tax rate updated");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onSuccess: Delayed for 4 seconds.");
      console.log(
        "onSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 4000);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  };

  function onOperationError(apiErr) {
    console.log("onOperationError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOperationDone() {
    console.log("onOperationDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

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
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div class={`modal ${showModal ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faUniversity} />
            &nbsp;Tax Settings
          </p>
          <button
            class="delete"
            aria-label="close"
            onClick={onCloseModal}
          ></button>
        </header>
        <section class="modal-card-body">
          {isFetching ? (
            <div class="column has-text-centered is-1">
              <div class="loader-wrapper is-centered">
                <br />
                <div
                  class="loader is-loading"
                  style={{ height: "80px", width: "80px" }}
                ></div>
              </div>
              <br />
              <div className="">Fetching...</div>
              <br />
            </div>
          ) : (
            <div class="content">
              <FormErrorBox errors={errors} />
              <FormInputField
                label="Tax Rate"
                name="number"
                placeholder="Input tax rate"
                type="number"
                value={taxRate}
                errorText={errors && errors.taxRate}
                helpText="Tax rate applied to every order if the user has a tax account"
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                isRequired={true}
                maxWidth="100%"
              />
            </div>
          )}
        </section>
        {isFetching ? (
          <></>
        ) : (
          <footer class="modal-card-foot">
            <button class="button" onClick={onCloseModal}>
              <FontAwesomeIcon className="mdi" icon={faClose} />
              &nbsp;Cancel
            </button>
            <button class="button is-success" onClick={onSaveClick}>
              <FontAwesomeIcon className="mdi" icon={faCheck} />
              &nbsp;Save
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default TaxSettingModal;
