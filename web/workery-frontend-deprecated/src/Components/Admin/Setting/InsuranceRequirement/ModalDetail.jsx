import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faTime,
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
import { getInsuranceRequirementDetailAPI } from "../../../../API/InsuranceRequirement";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import InsuranceRequirementUpdateModal from "./ModalUpdate";
import InsuranceRequirementDeleteModal from "./ModalDelete";

function InsuranceRequirementDetailModal({
  currentUser,
  showDetailModalForInsuranceRequirementID,
  setShowDetailModalInsuranceRequirementID,
  showUpdateModalForInsuranceRequirementID,
  setShowUpdateModalForInsuranceRequirementID,
  showDeleteModalForInsuranceRequirementID,
  setShowDeleteModalForInsuranceRequirementID,
  onUpdated,
  onDeleted,
}) {
  ////
  //// Global state.
  ////

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [datum, setDatum] = useState({});

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    // setWasCanceledSuccessfully(false);
    setDatum(null);
    setShowDetailModalInsuranceRequirementID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    console.log(
      "onEditClick: showDetailModalForInsuranceRequirementID:",
      showDetailModalForInsuranceRequirementID,
    );
    console.log(
      "onEditClick: showUpdateModalForInsuranceRequirementID:",
      showUpdateModalForInsuranceRequirementID,
    );
    setShowUpdateModalForInsuranceRequirementID(
      showDetailModalForInsuranceRequirementID,
    );
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForInsuranceRequirementID(
      showDetailModalForInsuranceRequirementID,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onInsuranceRequirementDetailSuccess(response) {
    console.log("onInsuranceRequirementDetailSuccess: Starting...");
    setDatum(response);
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
        showDetailModalForInsuranceRequirementID !== undefined &&
        showDetailModalForInsuranceRequirementID !== null &&
        showDetailModalForInsuranceRequirementID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getInsuranceRequirementDetailAPI(
          showDetailModalForInsuranceRequirementID,
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
  }, [showDetailModalForInsuranceRequirementID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div
        class={`modal ${showDetailModalForInsuranceRequirementID ? "is-active" : ""}`}
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
              &nbsp;Detail
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
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Insurance Requirement
                          </th>
                          <th className="has-text-white" colSpan="2">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Name:
                          </th>
                          <td>{datum.name}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.description}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            System
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created At:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={datum.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created By:
                          </th>
                          <td>{datum.createdByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created From:
                          </th>
                          <td>{datum.createdFromIpAddress}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified At:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={datum.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified By:
                          </th>
                          <td>{datum.modifiedByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified From:
                          </th>
                          <td>{datum.modifiedFromIpAddress}</td>
                        </tr>
                      </tbody>
                    </table>
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
                &nbsp;Close
              </button>
              <button class="button is-warning" onClick={onEditClick}>
                <FontAwesomeIcon className="mdi" icon={faPencil} />
                &nbsp;Edit
              </button>
              <button class="button is-danger" onClick={onDeleteClick}>
                <FontAwesomeIcon className="mdi" icon={faTrash} />
                &nbsp;Delete
              </button>
            </footer>
          )}
        </div>
      </div>

      {showUpdateModalForInsuranceRequirementID !== undefined &&
        showUpdateModalForInsuranceRequirementID !== null &&
        showUpdateModalForInsuranceRequirementID !== "" && (
          <>
            <InsuranceRequirementUpdateModal
              currentUser={currentUser}
              showUpdateModalForInsuranceRequirementID={
                showUpdateModalForInsuranceRequirementID
              }
              setShowUpdateModalForInsuranceRequirementID={
                setShowUpdateModalForInsuranceRequirementID
              }
              onUpdated={(e) => {
                console.log(
                  "InsuranceRequirementDetailModal | Refreshing detail",
                );
                setFetching(true);
                setErrors({});
                getInsuranceRequirementDetailAPI(
                  showDetailModalForInsuranceRequirementID,
                  onInsuranceRequirementDetailSuccess,
                  onInsuranceRequirementDetailError,
                  onInsuranceRequirementDetailDone,
                  onUnauthorized,
                );

                // Run this inside the parent to refresh the list.
                onUpdated();

                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
            />
          </>
        )}

      <InsuranceRequirementDeleteModal
        currentUser={currentUser}
        showDetailModalForInsuranceRequirementID={
          showDetailModalForInsuranceRequirementID
        }
        setShowDetailModalInsuranceRequirementID={
          setShowDetailModalInsuranceRequirementID
        }
        showDeleteModalForInsuranceRequirementID={
          showDeleteModalForInsuranceRequirementID
        }
        setShowDeleteModalForInsuranceRequirementID={
          setShowDeleteModalForInsuranceRequirementID
        }
        onDeleted={onDeleted}
      />
    </>
  );
}

export default InsuranceRequirementDetailModal;
