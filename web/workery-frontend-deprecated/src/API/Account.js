import getCustomAxios from "../Helpers/customAxios";
import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import {
  WORKERY_ACCOUNT_API_ENDPOINT,
  WORKERY_ACCOUNT_CHANGE_PASSWORD_API_ENDPOINT,
  WORKERY_ACCOUNT_AVATAR_OPERATION_API_ENDPOINT,
} from "../Constants/API";

export function getAccountDetailAPI(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const axios = getCustomAxios();
  axios
    .get(WORKERY_ACCOUNT_API_ENDPOINT)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = camelizeKeys(responseData);

      // Minor fix.
      data.organizationID = data.organizationId;

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function putAccountUpdateAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const axios = getCustomAxios();

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  // Minor fix.
  decamelizedData.address_line_1 = decamelizedData.address_line1;
  decamelizedData.address_line_2 = decamelizedData.address_line2;

  axios
    .put(WORKERY_ACCOUNT_API_ENDPOINT, decamelizedData)
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

export function putAccountChangePasswordAPI(
  decamelizedData,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const axios = getCustomAxios();

  axios
    .put(WORKERY_ACCOUNT_CHANGE_PASSWORD_API_ENDPOINT, decamelizedData)
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

export function postAccountAvatarAPI(
  formdata,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  axios
    .post(WORKERY_ACCOUNT_AVATAR_OPERATION_API_ENDPOINT, formdata, {
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
