import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

import FormErrorBox from "../../../Reusable/FormErrorBox";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../Constants/FieldOptions";

function AdminSettingNAICSSearchResultDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectOrderForDeletion,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th></th>
              <th>Job #</th>
              <th>Client</th>
              <th>Associate</th>
              <th>Assigned Date</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Financials</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (datum, i) {
                return (
                  <tr
                    className="is-size-7-tablet"
                    key={`${datum.wjid}-desktop`}
                  >
                    <td>
                      <OrderTypeOfIconFormatter type={datum.type} />
                    </td>
                    <td data-label="Job #">{datum.wjid}</td>
                    <td data-label="Client">
                      <URLTextFormatter
                        urlKey={datum.customerName}
                        urlValue={`/admin/client/${datum.customerId}`}
                        type={`external`}
                      />
                    </td>
                    <td data-label="Associate">
                      <URLTextFormatter
                        urlKey={datum.associateName}
                        urlValue={`/admin/associate/${datum.associateId}`}
                        type={`external`}
                      />
                    </td>
                    <td data-label="Assigned Date">
                      <DateTextFormatter value={datum.assignmentDate} />
                    </td>
                    <td data-label="Start Date">
                      <DateTextFormatter value={datum.startDate} />
                    </td>
                    <td data-label="Status">
                      <OrderStatusFormatter value={datum.status} />
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <URLTextFormatter
                          urlKey={`View Financials`}
                          urlValue={`/admin/financial/${datum.wjid}`}
                          type={`external`}
                        />
                      </div>
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/order/${datum.wjid}`}
                          className="is-small"
                        >
                          View Detail&nbsp;
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
              <>
                <button className="button is-info" onClick={onPreviousClicked}>
                  Previous
                </button>
                &nbsp;
              </>
            )}
            {listData.hasNextPage && (
              <>
                <button className="button is-info" onClick={onNextClicked}>
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

export default AdminSettingNAICSSearchResultDesktop;
