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
import TaskItemStatusFormatter from "../../../Reusable/SpecificPage/TaskItem/StatusFormatter";
import TaskItemTypeOfIconFormatter from "../../../Reusable/SpecificPage/TaskItem/TypeOfIconFormatter";
import { PAGE_SIZE_OPTIONS } from "../../../../Constants/FieldOptions";
import TaskItemUpdateURLPathFormatter from "../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";

/*
Display for both tablet and mobile.
*/
function AdminTaskItemListMobile(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectTaskItemForDeletion,
  } = props;
  return (
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5" key={`${datum.wjid}-mobile`}>
              <hr />
              {/*
              <TaskItemTypeOfIconFormatter type={datum.type} />
              &nbsp;*/}
              <strong>Job #:</strong>&nbsp;{datum.orderWjid}
              <br />
              <br />
              <strong>Client:</strong>&nbsp;
              <URLTextFormatter
                urlKey={datum.customerName}
                urlValue={`/admin/client/${datum.customerId}`}
                type={`external`}
              />
              <br />
              <br />
              <strong>Associate:</strong>&nbsp;
              <URLTextFormatter
                urlKey={datum.associateName}
                urlValue={`/admin/associate/${datum.associateId}`}
                type={`external`}
              />
              <br />
              <br />
              <strong>Assigned Date:</strong>&nbsp;
              <DateTextFormatter value={datum.assignmentDate} />
              <br />
              <br />
              <strong>Start Date:</strong>&nbsp;
              <DateTextFormatter value={datum.startDate} />
              <br />
              <br />
              <strong>Status:</strong>&nbsp;
              <TaskItemStatusFormatter value={datum.status} />
              <br />
              <br />
              <Link
                to={`/admin/financial/${datum.wjid}`}
                className="button is-primary is-fullwidth-mobile"
                type="button"
              >
                View Financials&nbsp;
                <FontAwesomeIcon className="mdi" icon={faChevronRight} />
              </Link>
              <br />
              <br />
              <Link
                to={TaskItemUpdateURLPathFormatter(datum.id, datum.type)}
                className="button is-primary is-fullwidth-mobile"
                type="button"
              >
                {datum.isClosed ? (
                  <>
                    View&nbsp;
                    <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                  </>
                ) : (
                  <>
                    View & Update&nbsp;
                    <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                  </>
                )}
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
            <>
              <button
                className="button is-info is-fullwidth-mobile"
                onClick={onPreviousClicked}
              >
                Previous
              </button>
              &nbsp;
            </>
          )}
          {listData.hasNextPage && (
            <>
              <button
                className="button is-info is-fullwidth-mobile"
                onClick={onNextClicked}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <p className="has-text-right is-size-5 pb-6">
            Total Results: {listData.count}
          </p>
        </div>
      </div>
    </>
  );
}

export default AdminTaskItemListMobile;
