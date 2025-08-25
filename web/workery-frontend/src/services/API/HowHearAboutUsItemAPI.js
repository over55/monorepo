// File Path: web/workery-frontend/src/services/API/HowHearAboutUsItemAPI.js

import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { camelizeKeys, decamelizeKeys } from "humps";

/**
 * API service for How Hear About Us Item operations
 */
export class HowHearAboutUsItemAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;
  }

  /**
   * Create authenticated axios instance
   */
  _createAxiosInstance(onUnauthorized = null) {
    return createAuthenticatedAxios(
      this.baseURL,
      this.tokenStorage,
      onUnauthorized,
    );
  }

  /**
   * Build URL with parameters
   */
  _buildURL(endpoint, params = {}) {
    let url = endpoint;
    Object.keys(params).forEach((key) => {
      url = url.replace(`{${key}}`, params[key]);
    });
    return url;
  }

  /**
   * Get list of How Hear About Us Items with filtering and pagination
   */
  async getList(queryParams = {}, onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    // Map frontend params to backend expected params
    const backendParams = {
      cursor: queryParams.cursor || "",
      page_size: queryParams.pageSize || queryParams.page_size || 25,
      sort_field:
        queryParams.sortField || queryParams.sort_field || "sort_number",
      sort_order: queryParams.sortOrder || queryParams.sort_order || 1,
    };

    // Add search if present
    if (queryParams.search || queryParams.searchText) {
      backendParams.search_text = queryParams.search || queryParams.searchText;
    }

    // Add status filter if present
    if (queryParams.status !== undefined && queryParams.status !== "") {
      backendParams.status = parseInt(queryParams.status, 10);
    }

    console.log("API: Sending params to backend:", backendParams);

    const response = await axios.get("/how-hear-about-us-items", {
      params: backendParams,
    });

    // Convert response to camelCase
    const camelizedData = camelizeKeys(response.data);

    console.log("API: Received response:", {
      resultsCount: camelizedData.results?.length,
      hasNextPage: camelizedData.hasNextPage,
      nextCursor: camelizedData.nextCursor,
    });

    return camelizedData;
  }

  /**
   * Get How Hear About Us Item by ID
   */
  async getDetail(id, onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    const response = await axios.get(`/how-hear-about-us-item/${id}`);

    return camelizeKeys(response.data);
  }

  /**
   * Create new How Hear About Us Item
   */
  async create(data, onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    // Convert data to snake_case for API
    const snakeCaseData = decamelizeKeys(data);

    const response = await axios.post(
      "/how-hear-about-us-items",
      snakeCaseData,
    );

    return camelizeKeys(response.data);
  }

  /**
   * Update How Hear About Us Item
   */
  async update(id, data, onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    // Convert data to snake_case for API
    const snakeCaseData = decamelizeKeys(data);

    const response = await axios.put(
      `/how-hear-about-us-item/${id}`,
      snakeCaseData,
    );

    return camelizeKeys(response.data);
  }

  /**
   * Delete How Hear About Us Item
   */
  async delete(id, onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    const response = await axios.delete(`/how-hear-about-us-item/${id}`);

    return camelizeKeys(response.data);
  }

  /**
   * Get select options for dropdowns
   */
  async getSelectOptions(onUnauthorized = null) {
    const axios = this._createAxiosInstance(onUnauthorized);

    const response = await axios.get("/how-hear-about-us-items/select-options");

    return camelizeKeys(response.data);
  }
}
