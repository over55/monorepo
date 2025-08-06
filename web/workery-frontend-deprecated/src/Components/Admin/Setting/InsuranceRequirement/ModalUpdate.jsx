import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  getInsuranceRequirementDetailAPI,
  putInsuranceRequirementUpdateAPI,
} from "../../../../API/InsuranceRequirement";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";

function InsuranceRequirementUpdateModal({
  currentUser,
  showUpdateModalForInsuranceRequirementID,
  setShowUpdateModalForInsuranceRequirementID,
  onUpdated,
}) {
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
  const [datum, setDatum] = useState({});

  // Form state.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setDatum(null);
    setName("");
    setDescription("");
    setShowUpdateModalForInsuranceRequirementID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForInsuranceRequirementID("");
    // onReloadList(); // Cause the page to get latest list.
    putInsuranceRequirementUpdateAPI(
      {
        id: showUpdateModalForInsuranceRequirementID,
        name: name,
        description: description,
      },
      onInsuranceRequirementUpdateSuccess,
      onInsuranceRequirementUpdateError,
      onInsuranceRequirementUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onInsuranceRequirementDetailSuccess(response) {
    console.log("onInsuranceRequirementDetailSuccess: Starting...");
    setDatum(response);
    setName(response.name);
    setDescription(response.description);
  }

  function onInsuranceRequirementDetailError(apiErr) {
    console.log("onInsuranceRequirementDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onInsuranceRequirementDetailDone() {
    console.log("onInsuranceRequirementDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onInsuranceRequirementUpdateSuccess(response) {
    console.log("onInsuranceRequirementUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Insurance requirement updated");
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

    console.log("onInsuranceRequirementUpdateSuccess: Done");
  }

  function onInsuranceRequirementUpdateError(apiErr) {
    console.log("onInsuranceRequirementUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onInsuranceRequirementUpdateDone() {
    console.log("onInsuranceRequirementUpdateDone: Starting...");
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

      // Do not fetch API if we do not have anything selected.
      if (
        showUpdateModalForInsuranceRequirementID !== undefined &&
        showUpdateModalForInsuranceRequirementID !== null &&
        showUpdateModalForInsuranceRequirementID !== ""
      ) {
        setFetching(true);
        getInsuranceRequirementDetailAPI(
          showUpdateModalForInsuranceRequirementID,
          onInsuranceRequirementDetailSuccess,
          onInsuranceRequirementDetailError,
          onInsuranceRequirementDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForInsuranceRequirementID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div
      class={`modal ${showUpdateModalForInsuranceRequirementID ? "is-active" : ""}`}
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faPencil} />
            &nbsp;Edit
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
              {datum !== undefined && datum !== null && datum !== "" && (
                <>
                  <FormErrorBox errors={errors} />
                  <FormInputField
                    label="Name"
                    name="name"
                    placeholder="Name input"
                    value={name}
                    errorText={errors && errors.name}
                    helpText=""
                    onChange={(e) => setName(e.target.value)}
                    isRequired={true}
                    maxWidth="100%"
                  />
                  <FormTextareaField
                    label="Description"
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
                </>
              )}
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
              &nbsp;Confirm and Save
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default InsuranceRequirementUpdateModal;
