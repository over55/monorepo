import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faMobile,
  faKey,
  faBuildingUser,
  faImage,
  faPaperclip,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faEllipsis,
  faArchive,
  faBoxOpen,
  faTrashCan,
  faHomeUser,
  faBan
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getClientDetailAPI } from "../../../../../API/Client";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../../Reusable/DataDisplayRowText";
import DataDisplayRowSelect from "../../../../Reusable/DataDisplayRowSelect";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import BubbleLink from "../../../../Reusable/EveryPage/BubbleLink";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
  currentUserState,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../Constants/FieldOptions";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../Constants/App";

const AdminClientDetailMoreMobile = ({ cid, client, currentUser }) => {
  return (
    <>
      <div
        className="has-background-white-ter is-hidden-tablet mb-6 p-5"
        style={{ borderRadius: "15px" }}
      >
        <table className="is-fullwidth has-background-white-ter table">
          <thead>
            <tr>
              <th colSpan="2">Menu</th>
            </tr>
          </thead>
          <tbody>
            {/* ---------------------------------------------------------------------- */}

            {client.status === 2 ? (
              <tr>
                <td>
                  <FontAwesomeIcon className="fas" icon={faBoxOpen} />
                  &nbsp;Unarchive
                </td>
                <td>
                  <div className="buttons is-right">
                    <Link
                      to={`/admin/client/${cid}/unarchive`}
                      className="is-small"
                    >
                      View&nbsp;
                      <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td>
                  <FontAwesomeIcon className="fas" icon={faArchive} />
                  &nbsp;Archive
                </td>
                <td>
                  <div className="buttons is-right">
                    <Link
                      to={`/admin/client/${cid}/archive`}
                      className="is-small"
                    >
                      View&nbsp;
                      <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                    </Link>
                  </div>
                </td>
              </tr>
            )}

            {/* ---------------------------------------------------------------------- */}

            {client.status === 1 && (
              <>
                {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                  <>
                    <tr>
                      <td>
                        <FontAwesomeIcon className="fas" icon={faHomeUser} />
                        &nbsp;Downgrade
                      </td>
                      <td>
                        <div className="buttons is-right">
                          <Link
                            to={`/admin/client/${cid}/downgrade`}
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
                  </>
                ) : (
                  <>
                    <tr>
                      <td>
                        <FontAwesomeIcon
                          className="fas"
                          icon={faBuildingUser}
                        />
                        &nbsp;Upgrade
                      </td>
                      <td>
                        <div className="buttons is-right">
                          <Link
                            to={`/admin/client/${cid}/upgrade`}
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
                  </>
                )}

                {/* ---------------------------------------------------------------------- */}

                {(currentUser.role === EXECUTIVE_ROLE_ID ||
                  currentUser.role === MANAGEMENT_ROLE_ID) && (
                  <>
                    <tr>
                      <td>
                        <FontAwesomeIcon className="fas" icon={faTrashCan} />
                        &nbsp;Delete
                      </td>
                      <td>
                        <div className="buttons is-right">
                          <Link
                            to={`/admin/client/${cid}/permadelete`}
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
                    <tr>
                      <td>
                        <FontAwesomeIcon className="fas" icon={faKey} />
                        &nbsp;Password
                      </td>
                      <td>
                        <div className="buttons is-right">
                          <Link
                            to={`/admin/client/${cid}/change-password`}
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
                    <tr>
                      <td>
                        <FontAwesomeIcon className="fas" icon={faMobile} />
                        &nbsp;2FA
                      </td>
                      <td>
                        <div className="buttons is-right">
                          <Link
                            to={`/admin/client/${cid}/change-2fa`}
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
                  </>
                )}

                {/* ---------------------------------------------------------------------- */}

                {client.status === 2 ? (
                  <tr>
                    <td>
                      <FontAwesomeIcon className="fas" icon={faBan} />
                      &nbsp;Unban
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/client/${cid}/unban`}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>
                      <FontAwesomeIcon className="fas" icon={faArchive} />
                      &nbsp;Ban
                    </td>
                    <td>
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/client/${cid}/ban`}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ---------------------------------------------------------------------- */}

              </>
            )}
          </tbody>
        </table>
      </div>
      {/* END Page Menu Options (Mobile Only) */}
    </>
  );
};

export default AdminClientDetailMoreMobile;
