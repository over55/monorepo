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
  getSkillSetDetailAPI,
  putSkillSetUpdateAPI,
} from "../../../../API/SkillSet";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";

function SkillSetUpdateModal({
  currentUser,
  showUpdateModalForSkillSetID,
  setShowUpdateModalForSkillSetID,
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
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(0);

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setDatum(null);
    setShowUpdateModalForSkillSetID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForSkillSetID("");
    // onReloadList(); // Cause the page to get latest list.
    putSkillSetUpdateAPI(
      {
        id: showUpdateModalForSkillSetID,
        category: category,
        sub_category: subCategory,
        description: description,
        status: status,
      },
      onSkillSetUpdateSuccess,
      onSkillSetUpdateError,
      onSkillSetUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onSkillSetDetailSuccess(response) {
    console.log("onSkillSetDetailSuccess: Starting...");
    setDatum(response);
    setCategory(response.category);
    setSubCategory(response.subCategory);
    setDescription(response.description);
    setStatus(response.status);
  }

  function onSkillSetDetailError(apiErr) {
    console.log("onSkillSetDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onSkillSetDetailDone() {
    console.log("onSkillSetDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onSkillSetUpdateSuccess(response) {
    console.log("onSkillSetUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Skill Set updated");
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

    console.log("onSkillSetUpdateSuccess: Done");
  }

  function onSkillSetUpdateError(apiErr) {
    console.log("onSkillSetUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onSkillSetUpdateDone() {
    console.log("onSkillSetUpdateDone: Starting...");
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
        showUpdateModalForSkillSetID !== undefined &&
        showUpdateModalForSkillSetID !== null &&
        showUpdateModalForSkillSetID !== ""
      ) {
        setFetching(true);
        getSkillSetDetailAPI(
          showUpdateModalForSkillSetID,
          onSkillSetDetailSuccess,
          onSkillSetDetailError,
          onSkillSetDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForSkillSetID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div class={`modal ${showUpdateModalForSkillSetID ? "is-active" : ""}`}>
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
              <FormErrorBox errors={errors} />
              {datum !== undefined && datum !== null && datum !== "" && (
                <>
                  <FormInputField
                    label="Category"
                    name="category"
                    placeholder="Text input"
                    value={category}
                    errorText={errors && errors.category}
                    helpText=""
                    onChange={(e) => setCategory(e.target.value)}
                    isRequired={true}
                    maxWidth="100%"
                  />

                  <FormInputField
                    label="Sub-Category"
                    name="subCategory"
                    placeholder="Text input"
                    value={subCategory}
                    errorText={errors && errors.subCategory}
                    helpText=""
                    onChange={(e) => setSubCategory(e.target.value)}
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

                  <FormRadioField
                    label="Status"
                    value={status}
                    opt1Value={1}
                    opt1Label="Active"
                    opt2Value={2}
                    opt2Label="Archived"
                    errorText={errors.status}
                    wasValidated={false}
                    helpText="Selecting `archived` will prevent this skill set from appearing in dropdown options found throughout the system."
                    onChange={(e) => setStatus(parseInt(e.target.value))}
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

export default SkillSetUpdateModal;
