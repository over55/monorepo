// File Path: web/workery-frontend/src/services/API/AttachmentAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";
import { ATTACHMENT_TYPE_NAMES } from "../../constants/Attachment";

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
        attachmentDownloadEndpoint: this.endpoints.ATTACHMENT_DOWNLOAD,
        attachmentThumbnailEndpoint: this.endpoints.ATTACHMENT_THUMBNAIL,
      });
    }
  }

  /**
   * Gets list of attachments with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, ownershipType, ownershipId, fileType }
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
      if (params.cursor) queryParams.append("cursor", params.cursor);

      // Add search params
      if (params.search) queryParams.append("search", params.search);

      // Add sorting params
      if (params.sortBy && params.sortOrder) {
        queryParams.append("sort_by", `${params.sortBy},${params.sortOrder}`);
      }

      // Handle ownership filtering - Backend expects ownership_id and ownership_role
      if (params.ownershipId) {
        queryParams.append("ownership_id", params.ownershipId);
      }

      if (params.ownershipRole) {
        queryParams.append("ownership_role", params.ownershipRole);
      }

      // Legacy support: Map entityType/entityId to ownership fields
      if (!params.ownershipId && params.entityId) {
        queryParams.append("ownership_id", params.entityId);
      }

      if (!params.ownershipRole && params.entityType) {
        const ownershipRole = ATTACHMENT_TYPE_NAMES[params.entityType];
        if (ownershipRole) {
          queryParams.append("ownership_role", ownershipRole);
        }
      }

      // Add file type filter
      if (params.fileType) queryParams.append("file_type", params.fileType);

      // Handle order_wjid with underscore for backend
      if (params.orderWjid) {
        queryParams.append("ownership_wjid", params.orderWjid);
      }

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "cursor",
            "search",
            "sortBy",
            "sortOrder",
            "ownershipType",
            "ownershipId",
            "ownershipRole",
            "entityType",
            "entityId",
            "fileType",
            "orderWjid",
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

      console.log("AttachmentAPI: Fetching attachments with URL:", url);

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
   * @param {Object} metadata - Additional metadata { ownershipType, ownershipId, title, description }
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

      // Add metadata with correct field names for backend
      if (metadata.title) {
        formData.append("title", metadata.title);
      }
      if (metadata.description) {
        formData.append("description", metadata.description);
      }

      // Handle ownership fields
      if (metadata.ownershipType) {
        // Convert string type to numeric if needed
        const ownershipType =
          ATTACHMENT_TYPE_NAMES[metadata.ownershipType] ||
          metadata.ownershipType;
        formData.append("ownership_type", ownershipType.toString());
      }

      if (metadata.ownershipId) {
        formData.append("ownership_id", metadata.ownershipId);
      }

      if (metadata.ownershipWjid) {
        formData.append("ownership_wjid", metadata.ownershipWjid);
      }

      // Legacy support: Map entityType/entityId to ownership fields
      if (!metadata.ownershipType && metadata.entityType) {
        const ownershipType =
          ATTACHMENT_TYPE_NAMES[metadata.entityType] || metadata.entityType;
        formData.append("ownership_type", ownershipType.toString());
      }
      if (!metadata.ownershipId && metadata.entityId) {
        formData.append("ownership_id", metadata.entityId);
      }

      // Debug log the form data
      if (process.env.NODE_ENV === "development") {
        console.log("AttachmentAPI: Uploading with FormData:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
      }

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

      // Make the API call to the correct endpoint
      const response = await authenticatedAxios.post(
        this.endpoints.ATTACHMENTS,
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
   * @param {Object} attachmentData - Attachment metadata to update (may include file)
   * @param {Function} onProgressCallback - Called with upload progress if file is included
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated attachment data
   */
  async updateAttachment(
    attachmentId,
    attachmentData,
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

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add title if provided
      if (attachmentData.title !== undefined) {
        formData.append("title", attachmentData.title);
      }

      // Add description if provided
      if (attachmentData.description !== undefined) {
        formData.append("description", attachmentData.description);
      }

      // Add file if provided (for file replacement)
      if (attachmentData.file && attachmentData.file instanceof File) {
        formData.append("file", attachmentData.file);
      }

      // Debug log the form data
      if (process.env.NODE_ENV === "development") {
        console.log("AttachmentAPI: Updating attachment with FormData:");
        for (let [key, value] of formData.entries()) {
          console.log(
            `  ${key}:`,
            value instanceof File ? `File: ${value.name}` : value,
          );
        }
      }

      // Configure request with progress tracking if file is included
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // Add progress tracking if file is being uploaded
      if (attachmentData.file && onProgressCallback) {
        config.onUploadProgress = (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgressCallback(progress);
          }
        };
      }

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ATTACHMENT_DETAIL.replace(
        "{id}",
        attachmentId,
      );

      // Make the API call using PUT with multipart/form-data
      const response = await authenticatedAxios.put(url, formData, config);

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
   * @param {Object} params - Query parameters { ownershipType, ownershipId, startDate, endDate }
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

      if (params.ownershipType)
        queryParams.append("ownership_type", params.ownershipType);
      if (params.ownershipId)
        queryParams.append("ownership_id", params.ownershipId);
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
