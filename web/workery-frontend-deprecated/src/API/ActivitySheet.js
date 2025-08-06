import getCustomAxios from "../Helpers/customAxios";
import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { DateTime } from "luxon";

import {
  WORKERY_ACTIVITY_SHEETS_API_ENDPOINT,
  WORKERY_ACTIVITY_SHEET_API_ENDPOINT,
} from "../Constants/API";

export function getActivitySheetListAPI(
  filtersMap = new Map(),
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // The following code will generate the query parameters for the url based on the map.
  let aURL = WORKERY_ACTIVITY_SHEETS_API_ENDPOINT;
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
      // console.log("getActivitySheetListAPI | pre-fix | results:", data);
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
      // console.log("getActivitySheetListAPI | post-fix | results:", data);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

// export function getActivitySheetSelectOptionListAPI(filtersMap=new Map(), onSuccessCallback, onErrorCallback, onDoneCallback, onUnauthorizedCallback) {
//     const axios = getCustomAxios(onUnauthorizedCallback);
//
//     // The following code will generate the query parameters for the url based on the map.
//     let aURL = WORKERY_ACTIVITY_SHEETS_SELECT_OPTIONS_API_ENDPOINT;
//     filtersMap.forEach(
//         (value, key) => {
//             let decamelizedkey = decamelize(key)
//             if (aURL.indexOf('?') > -1) {
//                 aURL += "&"+decamelizedkey+"="+value;
//             } else {
//                 aURL += "?"+decamelizedkey+"="+value;
//             }
//         }
//     )
//
//     axios.get(aURL).then((successResponse) => {
//         const responseData = successResponse.data;
//
//         // Snake-case from API to camel-case for React.
//         const data = camelizeKeys(responseData);
//
//         // Bugfixes.
//         console.log("getActivitySheetSelectOptionListAPI | pre-fix | results:", data);
//         if (data.results !== undefined && data.results !== null && data.results.length > 0) {
//             data.results.forEach(
//                 (item, index) => {
//                     item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(DateTime.DATETIME_MED);
//                     console.log(item, index);
//                 }
//             )
//         }
//         console.log("getActivitySheetSelectOptionListAPI | post-fix | results:", data);
//
//         // Return the callback data.
//         onSuccessCallback(data);
//     }).catch( (exception) => {
//         let errors = camelizeKeys(exception);
//         onErrorCallback(errors);
//     }).then(onDoneCallback);
// }
//
export function postActivitySheetCreateAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  axios
    .post(WORKERY_ACTIVITY_SHEETS_API_ENDPOINT, decamelizedData)
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

export function getActivitySheetDetailAPI(
  organizationID,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .get(WORKERY_ACTIVITY_SHEET_API_ENDPOINT.replace("{id}", organizationID))
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

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

export function putActivitySheetUpdateAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  // Minor fix.
  decamelizedData.id = decamelizedData.i_d;
  delete decamelizedData.i_d;

  axios
    .put(
      WORKERY_ACTIVITY_SHEET_API_ENDPOINT.replace("{id}", decamelizedData.id),
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

export function deleteActivitySheetAPI(
  id,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  axios
    .delete(WORKERY_ACTIVITY_SHEET_API_ENDPOINT.replace("{id}", id))
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

// export function postActivitySheetCreateCommentOperationAPI(organizationID, content, onSuccessCallback, onErrorCallback, onDoneCallback, onUnauthorizedCallback) {
//     const axios = getCustomAxios(onUnauthorizedCallback);
//     const data = {
//         organization_id: organizationID,
//         content: content,
//     };
//     axios.post(WORKERY_ACTIVITY_SHEET_CREATE_COMMENT_OPERATION_API_ENDPOINT, data).then((successResponse) => {
//         const responseData = successResponse.data;
//
//         // Snake-case from API to camel-case for React.
//         const data = camelizeKeys(responseData);
//
//         // Return the callback data.
//         onSuccessCallback(data);
//     }).catch( (exception) => {
//         let errors = camelizeKeys(exception);
//         onErrorCallback(errors);
//     }).then(onDoneCallback);
// }
