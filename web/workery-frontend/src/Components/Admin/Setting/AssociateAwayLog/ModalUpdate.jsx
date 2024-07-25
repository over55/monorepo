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
  getAssociateAwayLogDetailAPI,
  putAssociateAwayLogUpdateAPI,
} from "../../../../API/AssociateAwayLog";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormSelectFieldForAssociate from "../../../Reusable/FormSelectFieldForAssociate";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import { ASSOCIATE_AWAY_LOG_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../Constants/FieldOptions";

function AssociateAwayLogUpdateModal({
  currentUser,
  showUpdateModalForAssociateAwayLogID,
  setShowUpdateModalForAssociateAwayLogID,
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
    setErrors({});
    setDatum(null);
    setShowUpdateModalForAssociateAwayLogID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForAssociateAwayLogID("");
    // onReloadList(); // Cause the page to get latest list.
    putAssociateAwayLogUpdateAPI(
      {
        id: showUpdateModalForAssociateAwayLogID,
        associate_id: associateID,
        reason: reason,
        reason_other: reasonOther,
        until_further_notice: untilFurtherNotice,
        until_date: untilDate,
        start_date: startDate,
      },
      onAssociateAwayLogUpdateSuccess,
      onAssociateAwayLogUpdateError,
      onAssociateAwayLogUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onAssociateAwayLogDetailSuccess(response) {
    console.log("onAssociateAwayLogDetailSuccess: Starting...");
    setDatum(response);
    setAssociateID(response.associateId);
    setReason(response.reason);
    setReasonOther(response.reasonOther);
    setUntilFurtherNotice(response.untilFurtherNotice);
    setUntilDate(response.untilDate);
    setStartDate(response.startDate);
  }

  function onAssociateAwayLogDetailError(apiErr) {
    console.log("onAssociateAwayLogDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateAwayLogDetailDone() {
    console.log("onAssociateAwayLogDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onAssociateAwayLogUpdateSuccess(response) {
    console.log("onAssociateAwayLogUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("AssociateAwayLog updated");
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

    console.log("onAssociateAwayLogUpdateSuccess: Done");
  }

  function onAssociateAwayLogUpdateError(apiErr) {
    console.log("onAssociateAwayLogUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateAwayLogUpdateDone() {
    console.log("onAssociateAwayLogUpdateDone: Starting...");
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
        showUpdateModalForAssociateAwayLogID !== undefined &&
        showUpdateModalForAssociateAwayLogID !== null &&
        showUpdateModalForAssociateAwayLogID !== ""
      ) {
        setFetching(true);
        getAssociateAwayLogDetailAPI(
          showUpdateModalForAssociateAwayLogID,
          onAssociateAwayLogDetailSuccess,
          onAssociateAwayLogDetailError,
          onAssociateAwayLogDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForAssociateAwayLogID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div
      class={`modal ${showUpdateModalForAssociateAwayLogID ? "is-active" : ""}`}
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
                    options={
                      ASSOCIATE_AWAY_LOG_REASON_OPTIONS_WITH_EMPTY_OPTIONS
                    }
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

export default AssociateAwayLogUpdateModal;
