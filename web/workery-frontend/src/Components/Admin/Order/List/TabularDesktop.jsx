import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCaretUp,
  faCaretDown,
  faChevronRight,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../Constants/FieldOptions";

function AdminOrderListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    sortByValue,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth is-size-7-desktop is-size-5-widescreen table">
          <thead>
            <tr>
              <th></th>
              <th>Job</th>
              <th>
                Client
                {sortByValue === "customer_lexical_name,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "customer_lexical_name,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th>
                Associate
                {sortByValue === "associate_lexical_name,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "associate_lexical_name,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th>
                Assigned
                {sortByValue === "assignment_date,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "assignment_date,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th>
                Created
                {sortByValue === "created_at,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "created_at,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th>Status</th>
              <th className="has-text-right">
                <FontAwesomeIcon className="mdi" icon={faCreditCard} />
                &nbsp;
              </th>
              <th className="has-text-right">
                <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (datum, i) {
                return (
                  <tr
                    className="is-size-7-tablet is-size-6-widescreen"
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
                    <td data-label="Assigned">
                      <DateTextFormatter value={datum.assignmentDate} />
                    </td>
                    <td data-label="Created">
                      <DateTextFormatter value={datum.createdAt} />
                    </td>
                    <td data-label="Status">
                      <OrderStatusFormatter value={datum.status} />
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <URLTextFormatter
                          urlKey={<>View</>}
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

        <p className="has-text-right is-size-5 pb-6">
          Total Results: {listData.count}
        </p>

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

export default AdminOrderListDesktop;
