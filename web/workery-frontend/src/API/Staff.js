import getCustomAxios from "../Helpers/customAxios";
import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { DateTime } from "luxon";

import {
  WORKERY_STAFF_LIST_API_ENDPOINT,
  WORKERY_STAFF_DETAIL_API_ENDPOINT,
  WORKERY_STAFF_ARCHIVE_OPERATION_API_ENDPOINT,
  WORKERY_STAFF_CREATE_COMMENT_OPERATION_API_ENDPOINT,
  WORKERY_STAFF_UPGRADE_OPERATION_API_ENDPOINT,
  WORKERY_STAFF_DOWNGRADE_OPERATION_API_ENDPOINT,
  WORKERY_STAFF_AVATAR_OPERATION_API_ENDPOINT,
  WORKERY_STAFF_SELECT_OPTIONS_API_ENDPOINT,
  WORKERY_STAFF_CHANGE_PASSWORD_OPERATION_API_URL,
  WORKERY_STAFF_CHANGE_2FA_OPERATION_API_URL,
} from "../Constants/API";

export function getStaffListAPI(
  filtersMap = new Map(),
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // The following code will generate the query parameters for the url based on the map.
  let aURL = WORKERY_STAFF_LIST_API_ENDPOINT;
  filtersMap.forEach((value, key) => {
    let decamelizedkey = decamelize(key);
    if (aURL.indexOf("?") > -1) {
      aURL += "&" + decamelizedkey + "=" + encodeURIComponent(value);;
    } else {
      aURL += "?" + decamelizedkey + "=" + encodeURIComponent(value);
    }
  });

  axios
    .get(aURL)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Bugfixes.
      // console.log("getStaffListAPI | pre-fix | results:", data);
      if (
        data.results !== undefined &&
        data.results !== null &&
        data.results.length > 0
      ) {
        data.results.forEach((item, index) => {
          item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
            DateTime.DATETIME_MED,
          );
          // console.log(item, index);
        });
      }
      // console.log("getStaffListAPI | post-fix | results:", data);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postStaffCreateAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  // BUGFIX
  decamelizedData.how_did_you_hear_about_us_id = data.howDidYouHearAboutUsID;
  delete decamelizedData.how_did_you_hear_about_us_i_d;

  // Run the API POST call.
  axios
    .post(WORKERY_STAFF_LIST_API_ENDPOINT, decamelizedData)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function getStaffDetailAPI(
  organizationID,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .get(WORKERY_STAFF_DETAIL_API_ENDPOINT.replace("{id}", organizationID))
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      let data = camelizeKeys(responseData);

      // BUGFIX
      data.howDidYouHearAboutUsID = data.howDidYouHearAboutUsId;

      // For debugging purposeso pnly.
      console.log(data);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function putStaffUpdateAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  // BUGFIX
  decamelizedData.how_did_you_hear_about_us_id = data.howDidYouHearAboutUsID;
  delete decamelizedData.how_did_you_hear_about_us_i_d;
  decamelizedData.id = data.id;
  delete decamelizedData.i_d;

  axios
    .put(
      WORKERY_STAFF_DETAIL_API_ENDPOINT.replace("{id}", decamelizedData.id),
      decamelizedData,
    )
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function deleteStaffAPI(
  id,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .delete(WORKERY_STAFF_DETAIL_API_ENDPOINT.replace("{id}", id))
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postArchiveStaffAPI(
  id,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  const data = {
    staff_id: id,
  };
  axios
    .post(WORKERY_STAFF_ARCHIVE_OPERATION_API_ENDPOINT, data)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postStaffCreateCommentOperationAPI(
  staffID,
  content,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  const data = {
    staff_id: staffID,
    content: content,
  };
  axios
    .post(WORKERY_STAFF_CREATE_COMMENT_OPERATION_API_ENDPOINT, data)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postUpgradeStaffAPI(
  decamelizedData,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .post(WORKERY_STAFF_UPGRADE_OPERATION_API_ENDPOINT, decamelizedData)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postDowngradeStaffAPI(
  id,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  const data = {
    staff_id: id,
  };
  axios
    .post(WORKERY_STAFF_DOWNGRADE_OPERATION_API_ENDPOINT, data)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postAvatarStaffAPI(
  formdata,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  axios
    .post(WORKERY_STAFF_AVATAR_OPERATION_API_ENDPOINT, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    })
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function getStaffSelectOptionListAPI(
  filtersMap = new Map(),
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // The following code will generate the query parameters for the url based on the map.
  let aURL = WORKERY_STAFF_SELECT_OPTIONS_API_ENDPOINT;
  filtersMap.forEach((value, key) => {
    let decamelizedkey = decamelize(key);
    if (aURL.indexOf("?") > -1) {
      aURL += "&" + decamelizedkey + "=" + encodeURIComponent(value);;
    } else {
      aURL += "?" + decamelizedkey + "=" + encodeURIComponent(value);
    }
  });

  axios
    .get(aURL)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Bugfixes.
      console.log("getStaffSelectOptionListAPI | pre-fix | results:", data);
      if (
        data.results !== undefined &&
        data.results !== null &&
        data.results.length > 0
      ) {
        data.results.forEach((item, index) => {
          item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
            DateTime.DATETIME_MED,
          );
          console.log(item, index);
        });
      }
      console.log("getStaffSelectOptionListAPI | post-fix | results:", data);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postStaffChangePasswordAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .post(WORKERY_STAFF_CHANGE_PASSWORD_OPERATION_API_URL, data)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postStaffChangeTwoFactorAuthenticationAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .post(WORKERY_STAFF_CHANGE_2FA_OPERATION_API_URL, data)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}
