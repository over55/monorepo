import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faTimesCircle,
  faBuilding,
  faHome,
  faChevronRight,
  faArrowLeft,
  faWrench,
  faTachometer,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faGauge,
  faArrowRight,
  faTable,
  faArrowUpRightFromSquare,
  faRefresh,
  faFilter,
  faSearch,
  faClose,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { DateTime } from "luxon";

import { getClientListAPI } from "../../../../API/Client";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../AppState";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import FormInputFieldWithButton from "../../../Reusable/FormInputFieldWithButton";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormDateField from "../../../Reusable/FormDateField";
import {
  USER_ROLES,
  PAGE_SIZE_OPTIONS,
  USER_STATUS_LIST_OPTIONS,
  USER_ROLE_LIST_OPTIONS,
  CLIENT_SORT_OPTIONS,
  CLIENT_STATUS_FILTER_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../Constants/App";
import { addOrderState, ADD_ORDER_STATE_DEFAULT } from "../../../../AppState";

function AdminOrderAddStep2Launchpad() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const id = searchParams.get("id");
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [addOrder, setAddOrder] = useRecoilState(addOrderState);

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");

  ////
  //// API.
  ////

  ////
  //// Event handling.
  ////

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      let newOrder = { ...ADD_ORDER_STATE_DEFAULT };
      newOrder.customerID = id;
      newOrder.customerFirstName = firstName;
      newOrder.customerLastName = lastName;
      setAddOrder(newOrder);
      console.log("selected client:", id, firstName, lastName);
      console.log("new addOrder:", newOrder);
      setForceURL("/admin/orders/add/step-2");
    }

    return () => {
      mounted = false;
    };
  }, [id, firstName, lastName]);

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return <>Loading...</>;
}

export default AdminOrderAddStep2Launchpad;
