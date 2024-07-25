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
  faPencil
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { putOrderIncidentUpdateAPI } from "../../../../API/OrderIncident";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormSelectField from "../../../Reusable/FormSelectField";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../Constants/FieldOptions";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormRadioField from "../../../Reusable/FormRadioField";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../Constants/App";

function OrderIncidentUpdateModal({
  currentUser,
  orderIncidentID,
  orderIncident,
  showModal,
  setShowModal,
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

  // Form state.
  const [startDate, setStartDate] = useState(orderIncident.startDate);
  const [initiator, setInitiator] = useState(orderIncident.initiator);
  const [title, setTitle] = useState(orderIncident.title);
  const [description, setDescription] = useState(orderIncident.description);
  const [closingReason, setClosingReason] = useState(orderIncident.closingReason);
  const [closingReasonOther, setReasonOther] = useState(orderIncident.closingReasonOther);

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
    const payload = {
        id: orderIncidentID,
        initiator: initiator,
        start_date: startDate,
        title: title,
        description: description,
        closing_reason: closingReason,
        closing_reason_other: closingReasonOther,

    };
    putOrderIncidentUpdateAPI(
        payload,
        onCreateSuccess,
        onCreateError,
        onCreateDone,
        onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Create --- //

  function onCreateSuccess(response) {
    console.log("onCreateSuccess: Starting...");
    onUpdated();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Incident updated");
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
  }

  function onCreateError(apiErr) {
    console.log("onCreateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onCreateDone() {
    console.log("onCreateDone: Starting...");
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
            <FontAwesomeIcon className="mdi" icon={faPencil} />
            &nbsp;Edit Incident
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
              <FormAlternateDateField
                label="Start Date"
                name="startDate"
                placeholder="Text input"
                value={startDate}
                errorText={errors && errors.startDate}
                helpText="Please enter the date this incident began."
                onChange={(date) => setStartDate(date)}
                isRequired={false}
                maxWidth="187px"
              />

              <FormRadioField
                label="Who initiated this incident?"
                value={initiator}
                opt1Value={ORDER_INCIDENT_INIATOR_CLIENT}
                opt1Label="Client"
                opt2Value={ORDER_INCIDENT_INIATOR_ASSOCIATE}
                opt2Label="Associate"
                opt3Value={ORDER_INCIDENT_INIATOR_STAFF}
                opt3Label="Staff"
                errorText={errors.initiator}
                wasValidated={false}
                helpText=""
                onChange={(e) => setInitiator(parseInt(e.target.value))}
              />

              <FormInputField
                label="Title"
                name="title"
                placeholder="Text input"
                value={title}
                errorText={errors && errors.title}
                helpText=""
                onChange={(e) => setTitle(e.target.value)}
                isRequired={true}
                maxWidth="380px"
              />

              <FormTextareaField
                label="Description"
                name="description"
                placeholder="Describe here"
                value={description}
                errorText={errors && errors.description}
                helpText="Describe the Incident"
                onChange={(e) => setDescription(e.target.value)}
                isRequired={true}
                maxWidth="280px"
                rows={5}
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

export default OrderIncidentUpdateModal;
