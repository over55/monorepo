import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faQuestion,
  faHome,
  faBuilding,
  faChevronRight,
  faCalendarMinus,
  faCalendarPlus,
  faDumbbell,
  faCalendar,
  faGauge,
  faSearch,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faArrowRight,
  faTable,
  faArrowUpRightFromSquare,
  faFilter,
  faRefresh,
  faCalendarCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { DateTime } from "luxon";

import FormErrorBox from "../../../../Reusable/FormErrorBox";
import { PAGE_SIZE_OPTIONS } from "../../../../../Constants/FieldOptions";
import CustomerTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Customer/TypeOfIconFormatter";
import CustomerOrderStatusFormatter from "../../../../Reusable/SpecificPage/Customer/OrderStatusFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";

/*
Display for both tablet and mobile.
*/
function AssociateAssociateOrderListMobile(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectAssociateForDeletion,
  } = props;
  // console.log("listData:", listData);
  return (
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          console.log("datum:", datum);
          return (
            <div className="mb-5">
              <hr />
              <strong>Type:</strong>&nbsp;
              <CustomerTypeOfIconFormatter typeOf={datum.type} />
              <br />
              <br />
              <strong>Job #:</strong>&nbsp;
              <Link
                to={`/c/order/${datum.wjid}`}
                className="is-small"
                target="_blank"
                rel="noreferrer"
              >
                {datum.wjid}&nbsp;
                <FontAwesomeIcon
                  className="mdi"
                  icon={faExternalLinkAlt}
                />
              </Link>
              <br />
              <br />
              <strong>Associate:</strong>&nbsp;
              {datum.associateId !== undefined &&
              datum.associateId !== null &&
              datum.associateId !== "" &&
              datum.associateId !== "000000000000000000000000" ? (
                <Link
                  to={`/c/associate/${datum.associateId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {datum.associateName}&nbsp;
                  <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
                </Link>
              ) : (
                <>-</>
              )}
              <br />
              <br />
              <strong>Assigned:</strong>&nbsp;
              {datum.associateId !== undefined &&
              datum.associateId !== null &&
              datum.associateId !== "" &&
              datum.associateId !== "000000000000000000000000" ? (
                <DateTextFormatter value={datum.assignmentDate} />
              ) : (
                <>-</>
              )}
              <br />
              <br />
              <strong>Start:</strong>&nbsp;
              <DateTextFormatter value={datum.startDate} />
              <br />
              <br />
              <strong>Completion:</strong>&nbsp;
              <DateTextFormatter value={datum.completionDate} />
              <br />
              <br />
              <strong>Status:</strong>&nbsp;{datum.lastName}
              <CustomerOrderStatusFormatter value={datum.status} />
              <br />
              <br />
              {/*
              <strong>Invoice (PDF):</strong>&nbsp;
              <Link
                to={`/c/financial/${datum.wjid}`}
                target="_blank"
                rel="noreferrer"
              >
                View&nbsp;
                <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
              </Link>
              */}
              <br />
              <br />
              <strong>Financial:</strong>&nbsp;
              <Link
                to={`/c/financial/${datum.wjid}`}
                target="_blank"
                rel="noreferrer"
              >
                View&nbsp;
                <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
              </Link>
              <br />
              <br />
              <Link
                to={`/c/order/${datum.wjid}`}
                className="button is-primary is-fullwidth-mobile"
                type="button"
              >
                View&nbsp;
                <FontAwesomeIcon className="mdi" icon={faChevronRight} />
              </Link>
            </div>
          );
        })}

      <div className="columns pt-4">
        <div className="column is-half">
          <span className="select">
            <select
              className={`input has-text-grey-light`}
              name="pageSize"
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map(function (option, i) {
                return (
                  <option
                    selected={pageSize === option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                );
              })}
            </select>
          </span>
        </div>
        <div className="column is-half has-text-right">
          {previousCursors.length > 0 && (
            <button className="button" onClick={onPreviousClicked}>
              Previous
            </button>
          )}
          {listData.hasNextPage && (
            <>
              <button className="button" onClick={onNextClicked}>
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AssociateAssociateOrderListMobile;
