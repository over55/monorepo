// File Path: monorepo/web/workery-frontend/src/services/API/AttachmentAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * AttachmentAPI handles all attachment-related API calls
 */
export class AttachmentAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AttachmentAPI initialized with:", {
        baseURL: this.baseURL,
        attachmentsEndpoint: this.endpoints.ATTACHMENTS,
        attachmentDetailEndpoint: this.endpoints.ATTACHMENT_DETAIL,
        attachmentUploadEndpoint: this.endpoints.ATTACHMENT_UPLOAD,
        attachmentDownloadEndpoint: this.endpoints.ATTACHMENT_DOWNLOAD,
        attachmentThumbnailEndpoint: this.endpoints.ATTACHMENT_THUMBNAIL,
      });
    }
  }

  /**
   * Gets list of attachments with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, entityType, entityId, fileType }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Attachments list with pagination data
   */
  async getAttachments(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("page_size", params.limit);

      // Add search params
      if (params.search) queryParams.append("search", params.search);

      // Add sorting params
      if (params.sortBy && params.sortOrder) {
        queryParams.append("sort_by", `${params.sortBy},${params.sortOrder}`);
      }

      // Add entity filters
      if (params.entityType)
        queryParams.append("entity_type", params.entityType);
      if (params.entityId) queryParams.append("entity_id", params.entityId);

      // Add file type filter
      if (params.fileType) queryParams.append("file_type", params.fileType);

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "search",
            "sortBy",
            "sortOrder",
            "entityType",
            "entityId",
            "fileType",
          ].includes(key)
        ) {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            queryParams.append(key, params[key]);
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.ATTACHMENTS}?${queryString}`
        : this.endpoints.ATTACHMENTS;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process date formatting for results
      if (
        data.results &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        data.results.forEach((item) => {
          if (item.createdAt) {
            item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
          if (item.updatedAt) {
            item.updatedAt = DateTime.fromISO(item.updatedAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Uploads a new attachment
   * @param {File} file - File object to upload
   * @param {Object} metadata - Additional metadata { entityType, entityId, title, description }
   * @param {Function} onProgressCallback - Called with upload progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created attachment data
   */
  async uploadAttachment(
    file,
    metadata = {},
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate file
      if (!file || !(file instanceof File)) {
        throw { file: "Valid file is required for upload" };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Add metadata
      if (metadata.entityType)
        formData.append("entity_type", metadata.entityType);
      if (metadata.entityId) formData.append("entity_id", metadata.entityId);
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.description)
        formData.append("description", metadata.description);

      // Configure upload with progress tracking
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgressCallback && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgressCallback(progress);
          }
        },
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ATTACHMENT_UPLOAD,
        formData,
        config,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Attachment details
   */
  async getAttachmentDetail(attachmentId, onUnauthorizedCallback = null) {
    try {
      // Validate attachment ID
      if (
        !attachmentId ||
        (typeof attachmentId !== "string" && typeof attachmentId !== "number")
      ) {
        throw {
          attachmentId: "Valid attachment ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ATTACHMENT_DETAIL.replace(
        "{id}",
        attachmentId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Format dates
      if (data.createdAt) {
        data.createdAt = DateTime.fromISO(data.createdAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }
      if (data.updatedAt) {
        data.updatedAt = DateTime.fromISO(data.updatedAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("AttachmentAPI: Retrieved attachment detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific attachment's metadata
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Object} attachmentData - Attachment metadata to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated attachment data
   */
  async updateAttachment(
    attachmentId,
    attachmentData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate attachment ID
      if (
        !attachmentId ||
        (typeof attachmentId !== "string" && typeof attachmentId !== "number")
      ) {
        throw {
          attachmentId: "Valid attachment ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(attachmentData);

      // Handle the special case for ID field (from old code pattern)
      if (decamelizedData.i_d) {
        decamelizedData.id = decamelizedData.i_d;
        delete decamelizedData.i_d;
      }

      // Ensure ID is included in the data
      decamelizedData.id = attachmentId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ATTACHMENT_DETAIL.replace(
        "{id}",
        attachmentId,
      );

      // Make the API call
      const response = await authenticatedAxios.put(url, decamelizedData);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Deletes a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteAttachment(attachmentId, onUnauthorizedCallback = null) {
    try {
      // Validate attachment ID
      if (
        !attachmentId ||
        (typeof attachmentId !== "string" && typeof attachmentId !== "number")
      ) {
        throw {
          attachmentId: "Valid attachment ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ATTACHMENT_DETAIL.replace(
        "{id}",
        attachmentId,
      );

      // Make the API call
      const response = await authenticatedAxios.delete(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Downloads a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment to download
   * @param {Function} onProgressCallback - Called with download progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Blob>} - File blob data
   */
  async downloadAttachment(
    attachmentId,
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate attachment ID
      if (
        !attachmentId ||
        (typeof attachmentId !== "string" && typeof attachmentId !== "number")
      ) {
        throw {
          attachmentId: "Valid attachment ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ATTACHMENT_DOWNLOAD.replace(
        "{id}",
        attachmentId,
      );

      // Configure download with progress tracking
      const config = {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (onProgressCallback && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgressCallback(progress);
          }
        },
      };

      // Make the API call
      const response = await authenticatedAxios.get(url, config);

      return response.data; // Return the blob directly
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets a thumbnail for a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Object} params - Thumbnail parameters { width, height, quality }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Blob>} - Thumbnail blob data
   */
  async getAttachmentThumbnail(
    attachmentId,
    params = {},
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate attachment ID
      if (
        !attachmentId ||
        (typeof attachmentId !== "string" && typeof attachmentId !== "number")
      ) {
        throw {
          attachmentId: "Valid attachment ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters for thumbnail options
      const queryParams = new URLSearchParams();
      if (params.width) queryParams.append("width", params.width);
      if (params.height) queryParams.append("height", params.height);
      if (params.quality) queryParams.append("quality", params.quality);

      // Replace {id} placeholder in endpoint
      let url = this.endpoints.ATTACHMENT_THUMBNAIL.replace(
        "{id}",
        attachmentId,
      );

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Configure request for image data
      const config = {
        responseType: "blob",
      };

      // Make the API call
      const response = await authenticatedAxios.get(url, config);

      return response.data; // Return the blob directly
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Uploads multiple attachments
   * @param {File[]} files - Array of file objects to upload
   * @param {Object} metadata - Shared metadata for all files
   * @param {Function} onProgressCallback - Called with overall progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object[]>} - Array of created attachment data
   */
  async uploadMultipleAttachments(
    files,
    metadata = {},
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate files
      if (!Array.isArray(files) || files.length === 0) {
        throw { files: "Valid array of files is required for upload" };
      }

      const uploadPromises = files.map((file, index) => {
        return this.uploadAttachment(
          file,
          metadata,
          (progress) => {
            // Calculate overall progress
            if (onProgressCallback) {
              const overallProgress = Math.round(
                (index * 100 + progress) / files.length,
              );
              onProgressCallback(overallProgress);
            }
          },
          onUnauthorizedCallback,
        );
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets attachment statistics
   * @param {Object} params - Query parameters { entityType, entityId, startDate, endDate }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Attachment statistics
   */
  async getAttachmentStats(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.entityType)
        queryParams.append("entity_type", params.entityType);
      if (params.entityId) queryParams.append("entity_id", params.entityId);
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.ATTACHMENTS}/stats?${queryString}`
        : `${this.endpoints.ATTACHMENTS}/stats`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Formats error responses consistently
   * @private
   * @param {Error} error - Original error from axios or interceptor
   * @returns {Object} - Formatted error object
   */
  _formatError(error) {
    let errorData = null;

    // Handle different error structures
    if (error.response?.data) {
      errorData = error.response.data;
    } else if (error.response) {
      errorData = error.response;
    } else if (typeof error === "object" && error !== null) {
      // Already processed by our interceptor
      errorData = error;
    } else {
      errorData = { message: error.message || "Unknown error occurred" };
    }

    // Convert error to camelCase
    const formattedErrors = camelizeKeys(errorData);
    return formattedErrors;
  }
}
