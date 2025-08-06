import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faHardHat,
  faUserCircle,
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
import { PAGE_SIZE_OPTIONS } from "../../../../Constants/FieldOptions";

/*
Display for both tablet and mobile.
*/
function AdminCommentListMobile(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectCommentForDeletion,
  } = props;
  return (
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5">
              <hr />
              <strong>Content:</strong>&nbsp;{datum.content}
              <br />
              <br />
              <strong>Belongs to:</strong>&nbsp;
              {datum.belongsTo == 1 && (
                <>
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Customer
                </>
              )}
              {datum.belongsTo == 2 && (
                <>
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associate
                </>
              )}
              {datum.belongsTo == 3 && (
                <>
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Order
                </>
              )}
              <br />
              <br />
              <strong>Created At:</strong>&nbsp;{datum.createdAt}
              <br />
              <br />
              {datum.belongsTo == 1 && (
                <>
                {datum.customerId == "000000000000000000000000" ? <>
                     {/* Nothing. */}
                 </> : <>
                     <Link
                       to={`/admin/client/${datum.customerId}/comments`}
                       className="button is-primary is-fullwidth-mobile"
                     >
                       View&nbsp;
                       <FontAwesomeIcon
                         className="mdi"
                         icon={faChevronRight}
                       />
                     </Link>
                 </>}
                </>
              )}
              {datum.belongsTo == 2 && (
                <>
                {datum.associateId == "000000000000000000000000" ? <>
                     {/* Nothing. */}
                 </> : <>
                     <Link
                       to={`/admin/associate/${datum.associateId}/comments`}
                       className="button is-primary is-fullwidth-mobile"
                     >
                       View&nbsp;
                       <FontAwesomeIcon
                         className="mdi"
                         icon={faChevronRight}
                       />
                     </Link>
                 </>}
                </>
              )}
              {datum.belongsTo == 3 && (
                <Link
                  to={`/admin/comment/${datum.orderWjid}/comments`}
                  className="button is-primary is-fullwidth-mobile"
                  type="button"
                >
                  View&nbsp;
                  <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                </Link>
              )}
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
    </>
  );
}

export default AdminCommentListMobile;
