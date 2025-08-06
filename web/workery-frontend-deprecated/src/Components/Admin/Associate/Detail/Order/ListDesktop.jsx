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

import FormErrorBox from "../../../../Reusable/FormErrorBox";
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../../Constants/FieldOptions";
import AssociateOrderStatusFormatter from "../../../../Reusable/SpecificPage/Associate/OrderStatusFormatter";
import AssociateTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Associate/TypeOfIconFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";

function AdminAssociateOrderListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectAssociateForDeletion,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Job #</th>
              <th>Customer</th>
              <th>
                Assigned&nbsp;
                <FontAwesomeIcon className="fas" icon={faCaretDown} />
              </th>
              <th>Start</th>
              <th>Completion</th>
              <th>Status</th>
              {/*<th>Invoice (PDF)</th>*/}
              <th>Financial</th>
              <th></th>
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
                      <AssociateTypeOfIconFormatter typeOf={datum.type} />
                    </td>
                    <td data-label="Job #">{datum.wjid}</td>
                    <td data-label="Customer">
                      <Link
                        to={`/admin/client/${datum.customerId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {datum.customerName}&nbsp;
                        <FontAwesomeIcon
                          className="mdi"
                          icon={faExternalLinkAlt}
                        />
                      </Link>
                    </td>
                    <td data-label="Assigned">
                      <DateTextFormatter value={datum.assignmentDate} />
                    </td>
                    <td data-label="Start">
                      <DateTextFormatter value={datum.startDate} />
                    </td>
                    <td data-label="Completion">
                      <DateTextFormatter value={datum.completionDate} />
                    </td>
                    <td data-label="Status">
                      <AssociateOrderStatusFormatter value={datum.status} />
                    </td>
                    {/*
                    <td data-label="Invoice (PDF)">
                      <Link
                        to={`/admin/associate/${datum.associateId}`}
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
                      <Link
                        to={`/admin/financial/${datum.wjid}`}
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
                    {/*
                    <td data-label="Organization">{datum.organizationName}</td>

                    <td data-label="Joined">{DateTime.fromISO(datum.joinDate).toLocaleString(DateTime.DATE_MED)}</td>
                    */}
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/order/${datum.wjid}`}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faChevronRight}
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

export default AdminAssociateOrderListDesktop;
