import getCustomAxios from "../Helpers/customAxios";
import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";
import {
  WORKERY_LOGIN_API_ENDPOINT,
  WORKERY_VERSION_ENDPOINT,
  WORKERY_LOGOUT_API_ENDPOINT,
  WORKERY_FORGOT_PASSWORD_API_ENDPOINT,
  WORKERY_PASSWORD_RESET_API_ENDPOINT,
  WORKERY_EXECUTIVE_VISITS_TENANT_API_ENDPOINT,
  WORKERY_DASHBOARD_API_ENDPOINT,
  WORKERY_2FA_GENERATE_OTP_API_ENDPOINT,
  WORKERY_2FA_GENERATE_OTP_AND_QR_CODE_API_ENDPOINT,
  WORKERY_2FA_VERIFY_OTP_API_ENDPOINT,
  WORKERY_2FA_VALIDATE_OTP_API_ENDPOINT,
  WORKERY_2FA_DISABLED_OTP_API_ENDPOINT,
  WORKERY_2FA_RECOVERY_OTP_API_ENDPOINT,
} from "../Constants/API";
import { getAPIBaseURL } from "../Helpers/urlUtility";
import {
  setAccessTokenInLocalStorage,
  setRefreshTokenInLocalStorage,
} from "../Helpers/jwtUtility";

export function postLoginAPI(
  data,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const customAxios = axios.create({
    baseURL: getAPIBaseURL(),
    headers: {
      "Content-Type": "application/json;",
      Accept: "application/json",
    },
  });

  // To Snake-case for API from camel-case in React.
  let decamelizedData = decamelizeKeys(data);

  customAxios
    .post(WORKERY_LOGIN_API_ENDPOINT, decamelizedData)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      let profile = camelizeKeys(responseData);

      // SAVE OUR CREDENTIALS IN PERSISTENT STORAGE. THIS IS AN IMPORTANT
      // STEP BECAUSE OUR TOKEN UTILITY HELPER NEEDS THIS.
      setAccessTokenInLocalStorage(profile.accessToken);
      setRefreshTokenInLocalStorage(profile.refreshToken);

      // Return the callback data.
      onSuccessCallback(profile);
    })
    .catch((exception) => {
      let responseData = null;
      if (exception.response !== undefined && exception.response !== null) {
        if (
          exception.response.data !== undefined &&
          exception.response.data !== null
        ) {
          responseData = exception.response.data;
        } else {
          responseData = exception.response;
        }
      } else {
        responseData = exception;
      }
      let errors = camelizeKeys(responseData);

      // Check for incorrect password and enter our own custom error.
      let errorsStr = JSON.stringify(errors);
      if (errorsStr.includes("Incorrect email or password")) {
        // NOTE: This is the exact error from backend on incorrect email/pass.
        errors = {
          auth: "Incorrect email or password",
        };
      }

      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function getVersionAPI(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const customAxios = axios.create({
    baseURL: getAPIBaseURL(),
    headers: {
      "Content-Type": "application/json;",
      Accept: "application/json",
    },
  });

  customAxios
    .get(WORKERY_VERSION_ENDPOINT)
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

export function postLogoutAPI(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const customAxios = axios.create({
    baseURL: getAPIBaseURL(),
    headers: {
      "Content-Type": "application/json;",
      Accept: "application/json",
    },
  });

  let data = {};
  customAxios
    .post(WORKERY_LOGOUT_API_ENDPOINT, data)
    .then((successResponse) => {
      onSuccessCallback(null);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postForgotPasswordAPI(
  email,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const customAxios = axios.create({
    baseURL: getAPIBaseURL(),
    headers: {
      "Content-Type": "application/json;",
      Accept: "application/json",
    },
  });

  customAxios
    .post(WORKERY_FORGOT_PASSWORD_API_ENDPOINT, { email: email })
    .then((successResponse) => {
      console.log("postForgotPasswordAPI: Success");
      onSuccessCallback(); // Return the callback data.
    })
    .catch((exception) => {
      let responseData = null;
      if (exception.response !== undefined && exception.response !== null) {
        if (
          exception.response.data !== undefined &&
          exception.response.data !== null
        ) {
          responseData = exception.response.data;
        } else {
          responseData = exception.response;
        }
      } else {
        responseData = exception;
      }
      let errors = camelizeKeys(responseData);

      // Check for incorrect password and enter our own custom error.
      let errorsStr = JSON.stringify(errors);
      if (errorsStr.includes("Incorrect email or password")) {
        // NOTE: This is the exact error from backend on incorrect email/pass.
        errors = {
          auth: "Incorrect email or password",
        };
      }

      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postPasswordResetAPI(
  verificationCode,
  password,
  passwordRepeat,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const customAxios = axios.create({
    baseURL: getAPIBaseURL(),
    headers: {
      "Content-Type": "application/json;",
      Accept: "application/json",
    },
  });

  customAxios
    .post(WORKERY_PASSWORD_RESET_API_ENDPOINT, {
      verification_code: verificationCode,
      password: password,
      password_repeated: passwordRepeat,
    })
    .then((successResponse) => {
      console.log("postForgotPasswordAPI: Success");
      onSuccessCallback(); // Return the callback data.
    })
    .catch((exception) => {
      let responseData = null;
      if (exception.response !== undefined && exception.response !== null) {
        if (
          exception.response.data !== undefined &&
          exception.response.data !== null
        ) {
          responseData = exception.response.data;
        } else {
          responseData = exception.response;
        }
      } else {
        responseData = exception;
      }
      let errors = camelizeKeys(responseData);

      // Check for incorrect password and enter our own custom error.
      let errorsStr = JSON.stringify(errors);
      if (errorsStr.includes("Incorrect email or password")) {
        // NOTE: This is the exact error from backend on incorrect email/pass.
        errors = {
          auth: "Incorrect email or password",
        };
      }

      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postExecutiveVisitsTenant(
  tenantID,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
) {
  const axios = getCustomAxios();

  const data = {
    tenant_id: tenantID,
  };
  axios
    .post(WORKERY_EXECUTIVE_VISITS_TENANT_API_ENDPOINT, data)
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

export function getDashboardAPI(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const customAxios = getCustomAxios(onUnauthorizedCallback);

  customAxios
    .get(WORKERY_DASHBOARD_API_ENDPOINT)
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

export function postGenerateOTP(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  let aURL = WORKERY_2FA_GENERATE_OTP_API_ENDPOINT;

  axios
    .post(aURL)
    .then((successResponse) => {
      const responseData = successResponse.data;

      // Snake-case from API to camel-case for React.
      const data = {
        base32: responseData.base32,
        optAuthURL: responseData.otpauth_url,
      };

      // console.log("getTagListAPI | post-fix | results:", data);

      // Return the callback data.
      onSuccessCallback(data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postGenerateOTPAndQRCodeImage(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  let aURL = WORKERY_2FA_GENERATE_OTP_AND_QR_CODE_API_ENDPOINT;

  axios
    .post(aURL, { responseType: "blob" })
    .then((successResponse) => {
      const binaryData = successResponse.data;

      // Create a Blob from the binary data
      const blob = new Blob([binaryData], { type: "image/png" });

      // Create a Blob URL from the Blob object
      const blobUrl = URL.createObjectURL(blob);

      console.log("blobUrl", blobUrl);

      // Call the success callback with the Blob URL
      onSuccessCallback(blobUrl);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postVertifyOTP(
  payload,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  let aURL = WORKERY_2FA_VERIFY_OTP_API_ENDPOINT;
  axios
    .post(aURL, payload)
    .then((successResponse) => {
      // Return the callback data.
      onSuccessCallback(successResponse.data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postValidateOTP(
  payload,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  let aURL = WORKERY_2FA_VALIDATE_OTP_API_ENDPOINT;
  axios
    .post(aURL, payload)
    .then((successResponse) => {
      // Return the callback data.
      onSuccessCallback(successResponse.data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postDisableOTP(
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);

  let aURL = WORKERY_2FA_DISABLED_OTP_API_ENDPOINT;

  axios
    .post(aURL)
    .then((successResponse) => {
      onSuccessCallback(successResponse.data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}

export function postRecoveryOTP(
  payload,
  onSuccessCallback,
  onErrorCallback,
  onDoneCallback,
  onUnauthorizedCallback,
) {
  const axios = getCustomAxios(onUnauthorizedCallback);
  let aURL = WORKERY_2FA_RECOVERY_OTP_API_ENDPOINT;
  axios
    .post(aURL, payload)
    .then((successResponse) => {
      // Return the callback data.
      onSuccessCallback(successResponse.data);
    })
    .catch((exception) => {
      let errors = camelizeKeys(exception);
      onErrorCallback(errors);
    })
    .then(onDoneCallback);
}
