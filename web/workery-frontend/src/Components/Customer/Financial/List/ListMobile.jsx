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
import { PAGE_SIZE_OPTIONS } from "../../../../Constants/FieldOptions";

/*
Display for both tablet and mobile.
*/
function CustomerFinancialListMobile(props) {
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
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5" key={`${datum.wjid}-mobile`}>
              <hr />
              <OrderTypeOfIconFormatter type={datum.type} />
              &nbsp;
              <strong>Job #:</strong>&nbsp;{datum.wjid}
              <br />
              <br />
              <strong>Client:</strong>&nbsp;
              <URLTextFormatter
                urlKey={datum.customerName}
                urlValue={`/c/client/${datum.customerId}`}
                type={`external`}
              />
              <br />
              <br />
              <strong>Customer:</strong>&nbsp;
              <URLTextFormatter
                urlKey={datum.customerName}
                urlValue={`/c/customer/${datum.customerId}`}
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
              <OrderStatusFormatter value={datum.status} />
              <br />
              <br />
              <Link
                to={`/c/financial/${datum.wjid}`}
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

export default CustomerFinancialListMobile;
