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
import { getNorthAmericaIndustryClassificationSystemDetailAPI } from "../../../../API/NAICS";
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

  function onNAICSDetailSuccess(response) {
    console.log("onNAICSDetailSuccess: Starting...");
    setDatum(response);
  }

  function onNAICSDetailError(apiErr) {
    console.log("onNAICSDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onNAICSDetailDone() {
    console.log("onNAICSDetailDone: Starting...");
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
        getNorthAmericaIndustryClassificationSystemDetailAPI(
          showDetailModalForID,
          onNAICSDetailSuccess,
          onNAICSDetailError,
          onNAICSDetailDone,
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
              &nbsp;North American Industry Classification System Detail
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
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Industry
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
                            Title:
                          </th>
                          <td>{datum.industryTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.industryDescription}</td>
                        </tr>

                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            (Canadian) Industry
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
                          <td>{datum.canadianIndustryCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Title:
                          </th>
                          <td>{datum.canadianIndustryTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.canadianIndustryDescription}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Elements
                          </th>
                          <th className="has-text-white">

                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <RenderElementTable datum={datum} />
                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Sector
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
                          <td>{datum.sectorCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Title:
                          </th>
                          <td>{datum.sectorTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.sectorDescription}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Subsector
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
                          <td>{datum.subsectorCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Title:
                          </th>
                          <td>{datum.subsectorTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.subsectorDescription}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white">
                            Industry Group
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
                          <td>{datum.industryGroupCode}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Title:
                          </th>
                          <td>{datum.industryGroupTitle}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.industryGroupDescription}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* ---------------------------------------------------- */}
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
