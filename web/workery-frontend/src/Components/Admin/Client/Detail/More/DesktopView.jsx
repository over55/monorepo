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

const AdminClientDetailMoreDesktop = ({ cid, client, currentUser }) => {
  return (
    <>
      <section className="hero is-hidden-mobile">
        <div className="hero-body has-text-centered">
          <div className="container">
            <div className="columns is-vcentered is-multiline">
              {/*
                <div className="column">
                    <BubbleLink
                        title={`Photo`}
                        subtitle={`Upload a photo of the client`}
                        faIcon={faImage}
                        url={`/admin/client/${cid}/avatar`}
                        bgColour={`has-background-danger-dark`}
                    />
                </div>
                */}

              {/* ---------------------------------------------------------------------- */}

              {client.status === 2 ? (
                <div className="column">
                  <BubbleLink
                    title={`Unarchive`}
                    subtitle={`Make client visible in list and search results`}
                    faIcon={faBoxOpen}
                    url={`/admin/client/${cid}/unarchive`}
                    bgColour={`has-background-success-dark`}
                  />
                </div>
              ) : (
                <div className="column">
                  <BubbleLink
                    title={`Archive`}
                    subtitle={`Make client hidden from list and search results`}
                    faIcon={faArchive}
                    url={`/admin/client/${cid}/archive`}
                    bgColour={`has-background-success-dark`}
                  />
                </div>
              )}

              {/* ---------------------------------------------------------------------- */}

              {client.status === 1 && (
                <>
                  {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                    <div className="column">
                      <BubbleLink
                        title={`Downgrade`}
                        subtitle={`Change client to become residential client`}
                        faIcon={faHomeUser}
                        url={`/admin/client/${cid}/downgrade`}
                        bgColour={`has-background-info-dark`}
                      />
                    </div>
                  ) : (
                    <div className="column">
                      <BubbleLink
                        title={`Upgrade`}
                        subtitle={`Change client to become business client`}
                        faIcon={faBuildingUser}
                        url={`/admin/client/${cid}/upgrade`}
                        bgColour={`has-background-info-dark`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ---------------------------------------------------------------------- */}

              {(currentUser.role === EXECUTIVE_ROLE_ID ||
                currentUser.role === MANAGEMENT_ROLE_ID) && (
                <>
                  {client.status === 1 && (
                    <div className="column">
                      <BubbleLink
                        title={`Delete`}
                        subtitle={`Permanently delete this client and all associated data`}
                        faIcon={faTrashCan}
                        url={`/admin/client/${cid}/permadelete`}
                        bgColour={`has-background-danger`}
                      />
                    </div>
                  )}
                  {client.status === 1 && (
                    <>
                      <div className="column">
                        <BubbleLink
                          title={`Password`}
                          subtitle={`Change or reset the user\'s password`}
                          faIcon={faKey}
                          url={`/admin/client/${cid}/change-password`}
                          bgColour={`has-background-danger-dark`}
                        />
                      </div>
                      <div className="column">
                        <BubbleLink
                          title={`2FA`}
                          subtitle={`Enable or disable two-factor authentication`}
                          faIcon={faMobile}
                          url={`/admin/client/${cid}/change-2fa`}
                          bgColour={`has-background-dark`}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ---------------------------------------------------------------------- */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminClientDetailMoreDesktop;
