import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
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
import { PAGE_SIZE_OPTIONS } from "../../../../../Constants/FieldOptions";
import AssociateOrderStatusFormatter from "../../../../Reusable/SpecificPage/Associate/OrderStatusFormatter";
import AssociateTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Associate/TypeOfIconFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";

/*
Display for both tablet and mobile.
*/
function AdminAssociateOrderListMobile(props) {
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
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5">
              <hr />
              <strong>Type:</strong>&nbsp;
              <AssociateTypeOfIconFormatter typeOf={datum.type} />
              <br />
              <br />
              <strong>Job #:</strong>&nbsp;{datum.wjid}
              <br />
              <br />
              <strong>Customer:</strong>&nbsp;
              <Link
                to={`/admin/client/${datum.customerId}`}
                target="_blank"
                rel="noreferrer"
              >
                {datum.customerName}&nbsp;
                <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
              </Link>
              <br />
              <br />
              <strong>Assigned:</strong>&nbsp;
              <DateTextFormatter value={datum.assignmentDate} />
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
              <strong>Status:</strong>&nbsp;
              <AssociateOrderStatusFormatter value={datum.status} />
              <br />
              <br />
              <strong>Invoice (PDF):</strong>&nbsp;
              <Link
                to={`/admin/associate/${datum.associateId}`}
                target="_blank"
                rel="noreferrer"
              >
                View&nbsp;
                <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
              </Link>
              <br />
              <br />
              <strong>Financial:</strong>&nbsp;
              <Link
                to={`/admin/associate/${datum.associateId}`}
                target="_blank"
                rel="noreferrer"
              >
                View&nbsp;
                <FontAwesomeIcon className="mdi" icon={faExternalLinkAlt} />
              </Link>
              <br />
              <br />
              <Link
                to={`/admin/associate/${datum.id}`}
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

export default AdminAssociateOrderListMobile;
