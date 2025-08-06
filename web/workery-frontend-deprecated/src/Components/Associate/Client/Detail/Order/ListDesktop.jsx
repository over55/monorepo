import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faExternalLinkAlt,
  faBuilding,
  faHome,
  faQuestion,
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
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../../Constants/FieldOptions";
import CustomerTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Customer/TypeOfIconFormatter";
import CustomerOrderStatusFormatter from "../../../../Reusable/SpecificPage/Customer/OrderStatusFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";

function AssociateClientOrderListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectClientForDeletion,
    sortByValue,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth is-size-6-widescreen table">
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Job #</th>
              <th>Associate</th>
              <th>
                Assigned&nbsp;
                <FontAwesomeIcon className="fas" icon={faCaretDown} />
              </th>
              <th>Start</th>
              <th>Completion</th>
              <th>Status</th>
              {/*<th>Invoice (PDF)</th>*/}
              <th>Financial</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (datum, i) {
                return (
                  <tr>
                    <td></td>
                    <td data-label="Type">
                      <CustomerTypeOfIconFormatter typeOf={datum.type} />
                    </td>
                    <td data-label="Job #">
                    <Link
                      to={`/a/order/${datum.wjid}`}
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
                    </td>
                    <td data-label="Associate">
                      {datum.associateId !== undefined &&
                      datum.associateId !== null &&
                      datum.associateId !== "" &&
                      datum.associateId !== "000000000000000000000000" ? (
                        <Link
                          to={`/a/associate/${datum.associateId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {datum.associateName}&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faExternalLinkAlt}
                          />
                        </Link>
                      ) : (
                        <>-</>
                      )}
                    </td>
                    <td data-label="Assigned">
                      {datum.associateId !== undefined &&
                      datum.associateId !== null &&
                      datum.associateId !== "" &&
                      datum.associateId !== "000000000000000000000000" ? (
                        <DateTextFormatter value={datum.assignmentDate} />
                      ) : (
                        <>-</>
                      )}
                    </td>
                    <td data-label="Start">
                      <DateTextFormatter value={datum.startDate} />
                    </td>
                    <td data-label="Completion">
                      <DateTextFormatter value={datum.completionDate} />
                    </td>
                    <td data-label="Status">
                      <CustomerOrderStatusFormatter value={datum.status} />
                    </td>
                    {/*
                    <td data-label="Invoice (PDF)">
                      <Link
                        to={`/a/financial/${datum.wjid}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="mdi"
                          icon={faExternalLinkAlt}
                        />
                      </Link>
                    </td>
                    */}
                    <td data-label="Financial">
                      <div className="buttons">
                      <Link
                        to={`/a/financial/${datum.wjid}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View&nbsp;
                        <FontAwesomeIcon
                          className="mdi"
                          icon={faExternalLinkAlt}
                        />
                      </Link>
                    </div>
                    </td>
                    {/*
                    <td data-label="Organization">{datum.organizationName}</td>

                    <td data-label="Joined">{DateTime.fromISO(datum.joinDate).toLocaleString(DateTime.DATE_MED)}</td>
                    */}
                    <td className="is-actions-cell">
                      <div className="buttons">
                        <Link
                          to={`/a/order/${datum.wjid}`}
                          className="is-small"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faExternalLinkAlt}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="columns">
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
      </div>
    </div>
  );
}

export default AssociateClientOrderListDesktop;
