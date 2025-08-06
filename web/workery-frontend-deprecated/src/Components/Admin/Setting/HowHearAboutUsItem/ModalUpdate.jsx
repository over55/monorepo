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
  getHowHearAboutUsItemDetailAPI,
  putHowHearAboutUsItemUpdateAPI,
} from "../../../../API/HowHearAboutUsItem";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";

function HowHearAboutUsItemUpdateModal({
  currentUser,
  showUpdateModalForHowHearAboutUsItemID,
  setShowUpdateModalForHowHearAboutUsItemID,
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
  const [sortNumber, setSortNumber] = useState(0);
  const [text, setText] = useState("");
  const [isForAssociate, setIsForAssociate] = useState(false);
  const [isForCustomer, setIsForCustomer] = useState(false);
  const [isForStaff, setIsForStaff] = useState(false);

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setDatum(null);
    setShowUpdateModalForHowHearAboutUsItemID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForHowHearAboutUsItemID("");
    // onReloadList(); // Cause the page to get latest list.
    putHowHearAboutUsItemUpdateAPI(
      {
        id: showUpdateModalForHowHearAboutUsItemID,
        sort_number: sortNumber,
        text: text,
        is_for_associate: isForAssociate,
        is_for_customer: isForCustomer,
        is_for_staff: isForStaff,
      },
      onHowHearAboutUsItemUpdateSuccess,
      onHowHearAboutUsItemUpdateError,
      onHowHearAboutUsItemUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onHowHearAboutUsItemDetailSuccess(response) {
    console.log("onHowHearAboutUsItemDetailSuccess: Starting...");
    console.log("onHowHearAboutUsItemDetailSuccess: response:", response);
    setDatum(response);
    setSortNumber(response.sortNumber);
    setText(response.text);
    setIsForAssociate(response.isForAssociate);
    setIsForCustomer(response.isForCustomer);
    setIsForStaff(response.isForStaff);
  }

  function onHowHearAboutUsItemDetailError(apiErr) {
    console.log("onHowHearAboutUsItemDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onHowHearAboutUsItemDetailDone() {
    console.log("onHowHearAboutUsItemDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onHowHearAboutUsItemUpdateSuccess(response) {
    console.log("onHowHearAboutUsItemUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("HowHearAboutUsItem updated");
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

    console.log("onHowHearAboutUsItemUpdateSuccess: Done");
  }

  function onHowHearAboutUsItemUpdateError(apiErr) {
    console.log("onHowHearAboutUsItemUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onHowHearAboutUsItemUpdateDone() {
    console.log("onHowHearAboutUsItemUpdateDone: Starting...");
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
        showUpdateModalForHowHearAboutUsItemID !== undefined &&
        showUpdateModalForHowHearAboutUsItemID !== null &&
        showUpdateModalForHowHearAboutUsItemID !== ""
      ) {
        setFetching(true);
        getHowHearAboutUsItemDetailAPI(
          showUpdateModalForHowHearAboutUsItemID,
          onHowHearAboutUsItemDetailSuccess,
          onHowHearAboutUsItemDetailError,
          onHowHearAboutUsItemDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForHowHearAboutUsItemID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div
      class={`modal ${showUpdateModalForHowHearAboutUsItemID ? "is-active" : ""}`}
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
                    label="Sort #"
                    name="sortNumber"
                    placeholder="# input"
                    value={sortNumber}
                    type="number"
                    errorText={errors && errors.sortNumber}
                    helpText=""
                    onChange={(e) => setSortNumber(parseInt(e.target.value))}
                    isRequired={true}
                    maxWidth="100%"
                  />
                  <FormInputField
                    label="Text"
                    name="text"
                    placeholder="Text input"
                    value={text}
                    errorText={errors && errors.text}
                    helpText=""
                    onChange={(e) => setText(e.target.value)}
                    isRequired={true}
                    maxWidth="100%"
                  />
                  <FormCheckboxField
                    label="Is for Associate"
                    name="isForAssociate"
                    checked={isForAssociate}
                    errorText={errors && errors.isForAssociate}
                    helpText=""
                    onChange={(e) => {
                      setIsForAssociate(!isForAssociate);
                    }}
                  />
                  <FormCheckboxField
                    label="Is for Customer"
                    name="isForCustomer"
                    checked={isForCustomer}
                    errorText={errors && errors.isForCustomer}
                    helpText=""
                    onChange={(e) => {
                      setIsForCustomer(!isForCustomer);
                    }}
                  />
                  <FormCheckboxField
                    label="Is for Staff"
                    name="isForStaff"
                    checked={isForStaff}
                    errorText={errors && errors.isForStaff}
                    helpText=""
                    onChange={(e) => {
                      setIsForStaff(!isForStaff);
                    }}
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

export default HowHearAboutUsItemUpdateModal;
