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
import { postHowHearAboutUsItemCreateAPI } from "../../../../API/HowHearAboutUsItem";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";

function HowHearAboutUsItemCreateModal({
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
    setShowCreateModal(false);
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setFetching(true);
    setErrors({});
    postHowHearAboutUsItemCreateAPI(
      {
        sort_number: sortNumber,
        text: text,
        is_for_associate: isForAssociate,
        is_for_customer: isForCustomer,
        is_for_staff: isForStaff,
      },
      onHowHearAboutUsItemCreateSuccess,
      onHowHearAboutUsItemCreateError,
      onHowHearAboutUsItemCreateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Create --- //

  function onHowHearAboutUsItemCreateSuccess(response) {
    console.log("onHowHearAboutUsItemCreateSuccess: Starting...");
    onCreated();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("HowHearAboutUsItem created");
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

  function onHowHearAboutUsItemCreateError(apiErr) {
    console.log("onHowHearAboutUsItemCreateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onHowHearAboutUsItemCreateDone() {
    console.log("onHowHearAboutUsItemCreateDone: Starting...");
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
            &nbsp;New HowHearAboutUsItem
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
                value={isForAssociate}
                opt1Value={true}
                opt1Label="Yes"
                opt2Value={false}
                opt2Label="No"
                errorText={errors && errors.isForAssociate}
                helpText=""
                onChange={(e) => {
                  setIsForAssociate(!isForAssociate);
                }}
              />
              <FormCheckboxField
                label="Is for Customer"
                name="isForCustomer"
                value={isForCustomer}
                opt1Value={true}
                opt1Label="Yes"
                opt2Value={false}
                opt2Label="No"
                errorText={errors && errors.isForCustomer}
                helpText=""
                onChange={(e) => {
                  setIsForCustomer(!isForCustomer);
                }}
              />
              <FormCheckboxField
                label="Is for Staff"
                name="isForStaff"
                value={isForStaff}
                opt1Value={true}
                opt1Label="Yes"
                opt2Value={false}
                opt2Label="No"
                errorText={errors && errors.isForStaff}
                helpText=""
                onChange={(e) => {
                  setIsForStaff(!isForStaff);
                }}
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

export default HowHearAboutUsItemCreateModal;
