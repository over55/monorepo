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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { postAssociateAwayLogCreateAPI } from "../../../../API/AssociateAwayLog";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormSelectFieldForAssociate from "../../../Reusable/FormSelectFieldForAssociate";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import { ASSOCIATE_AWAY_LOG_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../Constants/FieldOptions";

function AssociateAwayLogCreateModal({
  currentUser,
  showCreateModal,
  setShowCreateModal,
  onCreated,
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
  const [associateID, setAssociateID] = useState("");
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [untilFurtherNotice, setUntilFurtherNotice] = useState(0);
  const [untilDate, setUntilDate] = useState("");
  const [startDate, setStartDate] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setAssociateID("");
    setErrors({});
    setReason(0);
    setReasonOther("");
    setUntilFurtherNotice(0);
    setUntilDate("");
    setStartDate("");
    setErrors({});
    setShowCreateModal(false);
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setFetching(true);
    setErrors({});
    postAssociateAwayLogCreateAPI(
      {
        associate_id: associateID,
        reason: reason,
        reason_other: reasonOther,
        until_further_notice: untilFurtherNotice,
        until_date: untilDate,
        start_date: startDate,
      },
      onAssociateAwayLogCreateSuccess,
      onAssociateAwayLogCreateError,
      onAssociateAwayLogCreateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Create --- //

  function onAssociateAwayLogCreateSuccess(response) {
    console.log("onAssociateAwayLogCreateSuccess: Starting...");
    onCreated();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Associate news created");
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

  function onAssociateAwayLogCreateError(apiErr) {
    console.log("onAssociateAwayLogCreateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateAwayLogCreateDone() {
    console.log("onAssociateAwayLogCreateDone: Starting...");
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
    <div class={`modal ${showCreateModal ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faPlus} />
            &nbsp;New Associate News
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
              <FormSelectFieldForAssociate
                associateID={associateID}
                setAssociateID={setAssociateID}
                errorText={errors && errors.associateId}
                helpText="Please select the associate for our news."
                maxWidth="350px"
              />
              <FormSelectField
                label="Reason"
                name="reason"
                placeholder="Pick"
                selectedValue={reason}
                errorText={errors && errors.reason}
                helpText=""
                onChange={(e) => setReason(parseInt(e.target.value))}
                options={ASSOCIATE_AWAY_LOG_REASON_OPTIONS_WITH_EMPTY_OPTIONS}
              />

              {reason === 1 && (
                <FormInputField
                  label="Reason (Other)"
                  name="reasonOther"
                  placeholder="Text input"
                  value={reasonOther}
                  errorText={errors && errors.reasonOther}
                  helpText=""
                  onChange={(e) => setReasonOther(e.target.value)}
                  isRequired={true}
                  maxWidth="100%"
                />
              )}

              <FormRadioField
                label="Until Further Notice?"
                name="untilFurtherNotice"
                value={untilFurtherNotice}
                errorText={errors && errors.untilFurtherNotice}
                opt1Value={1}
                opt1Label="Yes"
                opt2Value={2}
                opt2Label="No"
                onChange={(e) =>
                  setUntilFurtherNotice(parseInt(e.target.value))
                }
              />
              {untilFurtherNotice === 2 && (
                <FormAlternateDateField
                  label="Until Date"
                  name="untilDate"
                  placeholder="Text input"
                  value={untilDate}
                  helpText=""
                  onChange={(date) => setUntilDate(date)}
                  errorText={errors && errors.untilDate}
                  isRequired={true}
                  maxWidth="180px"
                  minDate={new Date()}
                />
              )}
              <FormAlternateDateField
                label="Start Date"
                name="startDate"
                placeholder="Text input"
                value={startDate}
                helpText=""
                onChange={(date) => setStartDate(date)}
                errorText={errors && errors.startDate}
                isRequired={true}
                maxWidth="180px"
                minDate={new Date()}
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
              &nbsp;Submit
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default AssociateAwayLogCreateModal;
