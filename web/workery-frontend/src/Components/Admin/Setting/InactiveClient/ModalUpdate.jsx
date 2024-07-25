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
import { getClientDetailAPI, putClientUpdateAPI } from "../../../../API/Client";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormSelectField from "../../../Reusable/FormSelectField";
import {
  INACTIVE_CLIENT_DEACTIVATION_REASON_OPTIONS_WITH_EMPTY_OPTION,
  CLIENT_STATUS_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";

function InactiveClientUpdateModal({
  currentUser,
  showUpdateModalForInactiveClientID,
  setShowUpdateModalForInactiveClientID,
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
  const [deactivationReason, setDeactivationReason] = useState(0);
  const [deactivationReasonOther, setDeactivationReasonOther] = useState("");
  const [status, setStatus] = useState(0);

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setDatum(null);
    setShowUpdateModalForInactiveClientID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForInactiveClientID("");
    // onReloadList(); // Cause the page to get latest list.
    putClientUpdateAPI(
      {
        id: showUpdateModalForInactiveClientID,
        deactivation_reason: deactivationReason,
        deactivation_reason_other: deactivationReasonOther,
        status: status,
      },
      onInactiveClientUpdateSuccess,
      onInactiveClientUpdateError,
      onInactiveClientUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onInactiveClientDetailSuccess(response) {
    console.log("onInactiveClientDetailSuccess: Starting...");
    setDatum(response);
    setDeactivationReason(response.deactivationReason);
    setDeactivationReasonOther(response.deactivationReasonOther);
    setStatus(response.status);
  }

  function onInactiveClientDetailError(apiErr) {
    console.log("onInactiveClientDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onInactiveClientDetailDone() {
    console.log("onInactiveClientDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onInactiveClientUpdateSuccess(response) {
    console.log("onInactiveClientUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Client updated");
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

    console.log("onInactiveClientUpdateSuccess: Done");
  }

  function onInactiveClientUpdateError(apiErr) {
    console.log("onInactiveClientUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onInactiveClientUpdateDone() {
    console.log("onInactiveClientUpdateDone: Starting...");
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
        showUpdateModalForInactiveClientID !== undefined &&
        showUpdateModalForInactiveClientID !== null &&
        showUpdateModalForInactiveClientID !== ""
      ) {
        setFetching(true);
        getClientDetailAPI(
          showUpdateModalForInactiveClientID,
          onInactiveClientDetailSuccess,
          onInactiveClientDetailError,
          onInactiveClientDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForInactiveClientID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div
      class={`modal ${showUpdateModalForInactiveClientID ? "is-active" : ""}`}
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
                  <FormSelectField
                    label="Status"
                    name="status"
                    placeholder="Pick"
                    selectedValue={status}
                    errorText={errors && errors.status}
                    helpText="Changing to Active returns the client back into the system"
                    onChange={(e) => setStatus(parseInt(e.target.value))}
                    options={CLIENT_STATUS_OPTIONS_WITH_EMPTY_OPTIONS}
                  />
                  {status === 2 && (
                    <>
                      <FormSelectField
                        label="Deactivation Reason"
                        name="deactivationReason"
                        placeholder="Pick"
                        selectedValue={deactivationReason}
                        errorText={errors && errors.deactivationReason}
                        helpText=""
                        onChange={(e) =>
                          setDeactivationReason(parseInt(e.target.value))
                        }
                        options={
                          INACTIVE_CLIENT_DEACTIVATION_REASON_OPTIONS_WITH_EMPTY_OPTION
                        }
                      />
                      {deactivationReason === 1 && (
                        <FormTextareaField
                          label="Deactivation Reason (Other)"
                          name="deactivationReasonOther"
                          placeholder="Text input"
                          value={deactivationReasonOther}
                          errorText={errors && errors.deactivationReasonOther}
                          helpText=""
                          onChange={(e) =>
                            setDeactivationReasonOther(e.target.value)
                          }
                          isRequired={true}
                          maxWidth="100%"
                          helpText={"Max 638 characters"}
                          rows={4}
                        />
                      )}
                    </>
                  )}
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

export default InactiveClientUpdateModal;
