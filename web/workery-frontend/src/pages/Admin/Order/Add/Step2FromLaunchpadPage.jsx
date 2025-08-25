// File Path: monorepo/web/workery-frontend/src/pages/Admin/Order/Add/Step2FromLaunchpadPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate } from "react-router";
import { useRecoilState } from "recoil";

import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../AppState";
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
