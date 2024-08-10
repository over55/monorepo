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
import { getNationalOccupationalClassificationDetailAPI } from "../../../../API/NOC";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";


function RenderElementTable(props) {
    try {
        const { datum } = props;
        const { elements } = datum;

        const data = {
            "elements": elements
        };

        // Grouping the elements by type
        const groupedData = data.elements.reduce((acc, element) => {
            // If the type is not yet a key in the accumulator object, initialize it with an empty array
            if (!acc[element.type]) {
                acc[element.type] = [];
            }

            // Push the description into the appropriate array based on the type
            acc[element.type].push(element.description.trim());

            return acc;
        }, {});

        return (
          <>
            {/* Iterate through each type in the dictionary */}
            {Object.entries(groupedData).map(([type, descriptions]) => (
                <tr key={type}>
                    <th className="has-background-light" style={{ width: "30%" }}>{type}</th>
                    <td>
                        {/* Iterate through each description for the current type */}
                        {descriptions.map((description, index) => (
                            <li key={index}>{description}</li>
                        ))}
                    </td>
                </tr>
            ))}
          </>
      );
    } catch (e) {
        return null;
    }
}

function NationalOccupationalClassificationDetailModal({
  currentUser,
  showDetailModalForID,
  setShowDetailModalForID,
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
    setShowDetailModalForID("");
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onNOCDetailSuccess(response) {
    console.log("onNOCDetailSuccess: Starting...");
    setDatum(response);
  }

  function onNOCDetailError(apiErr) {
    console.log("onNOCDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onNOCDetailDone() {
    console.log("onNOCDetailDone: Starting...");
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
        showDetailModalForID !== undefined &&
        showDetailModalForID !== null &&
        showDetailModalForID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getNationalOccupationalClassificationDetailAPI(
          showDetailModalForID,
          onNOCDetailSuccess,
          onNOCDetailError,
          onNOCDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div
        class={`modal ${showDetailModalForID ? "is-active" : ""}`}
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
              &nbsp;National Occupational Classification Detail
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
                          <th className="has-text-white">
                            Information
                          </th>
                          <th className="has-text-white">

                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Code:
                          </th>
                          <td>{datum.code}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Unit Group Title:
                          </th>
                          <td>{datum.unitGroupTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.unitGroupDescription}</td>
                        </tr>

                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Elements
                          </th>
                          <th className="has-text-white">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <RenderElementTable datum={datum} />
                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            More Information
                          </th>
                          <th className="has-text-white">

                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ------------------------------------------ */}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Broad Category Code:
                          </th>
                          <td>{datum.broadCategoryCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Broad Category Title:
                          </th>
                          <td>{datum.broadCategoryTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Broad Category Description:
                          </th>
                          <td>{datum.broadCategoryDescription}</td>
                        </tr>
                        {/* ------------------------------------------ */}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Major Group Code:
                          </th>
                          <td>{datum.majorGroupCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Major Group Title:
                          </th>
                          <td>{datum.majorGroupTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Major Group Description:
                          </th>
                          <td>{datum.majorGroupDescription}</td>
                        </tr>
                        {/* ------------------------------------------ */}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Sub-Minor Group Code:
                          </th>
                          <td>{datum.subMinorGroupCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Sub-Minor Group Title:
                          </th>
                          <td>{datum.subMinorGroupTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Sub-Minor Group Description:
                          </th>
                          <td>{datum.subMinorGroupDescription}</td>
                        </tr>

                        {/* ------------------------------------------ */}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Minor Group Code:
                          </th>
                          <td>{datum.minorGroupCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Minor Group Title:
                          </th>
                          <td>{datum.minorGroupTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Minor Group Description:
                          </th>
                          <td>{datum.minorGroupDescription}</td>
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
            </footer>
          )}
        </div>
      </div>
    </>
  );
}

export default NationalOccupationalClassificationDetailModal;
