import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

import {
  currentUserState,
  taskItemActiveCountState,
} from "../../../../AppState";
import { getTaskItemCountAPI } from "../../../../API/TaskItem";

/**
 * Component will run in the background refreshing of task item count if the
 * authenticated user is a staff.
 */
const AdminTaskItemCountBackgroundRefresher = () => {
  ////
  //// Global state.
  ////

  // const [topAlertMessage, setTopAlertMessage] = useRecoilState(topAlertMessageState);
  // const [topAlertStatus, setTopAlertStatus] = useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [taskItemActiveCount, setTaskItemActiveCount] = useRecoilState(
    taskItemActiveCountState,
  );

  ////
  //// API.
  ////

  function onSuccess(response) {
    if (response !== undefined && response !== null && response !== "") {
      if (
        response.count !== undefined &&
        response.count !== null &&
        response.count !== ""
      ) {
        setTaskItemActiveCount(response.count);
      }
    }
  }

  function onError(apiErr) {
    console.log("onError: for previous value:", taskItemActiveCount);
    console.log("onError: with error response:", apiErr);
  }

  function onDone() {
    // Do nothing.
  }

  const onUnauthorized = () => {
    // Do nothing.
  };

  ////
  //// Event handling.
  ////

  const fetchData = async () => {
    let params = new Map();
    getTaskItemCountAPI(params, onSuccess, onError, onDone, onUnauthorized);
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (
        currentUser !== undefined &&
        currentUser !== null &&
        currentUser !== ""
      ) {
        // Fetch data on component load.
        fetchData();

        // Call fetchData every 30 seconds (adjust the interval as needed)
        const intervalId = setInterval(fetchData, 1 * 30 * 1000);

        // Cleanup
        return () => {
          clearInterval(intervalId);
          mounted = false;
        };
      }
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  ////
  //// Component rendering.
  ////

  return <div>{/* Do nothing... */}</div>;
};

export default AdminTaskItemCountBackgroundRefresher;
