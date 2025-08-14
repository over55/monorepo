// File Path: monorepo/web/workery-frontend/src/services/Manager/AttachmentManager.js

/**
 * AttachmentManager handles all attachment-related business logic
 * Combines AttachmentAPI with AttachmentStorage for complete attachment management
 */
export class AttachmentManager {
  constructor(attachmentAPI, attachmentStorage) {
    this.attachmentAPI = attachmentAPI;
    this.attachmentStorage = attachmentStorage;

    // Default file validation settings
    this.defaultMaxFileSize = 50 * 1024 * 1024; // 50MB
    this.defaultAllowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];
  }

  /**
   * Gets list of attachments with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, entityType, entityId, fileType }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Attachments list with pagination data
   */
  async getAttachments(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAttachments =
          this.attachmentStorage.getAttachmentsFromCache();
        if (cachedAttachments) {
          return cachedAttachments;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.attachmentStorage.isAttachmentsCacheLoading()) {
        console.log(
          "AttachmentManager: Attachments request already in progress",
        );
        return this._waitForCurrentAttachmentsRequest();
      }

      this.attachmentStorage.setAttachmentsCacheLoading(true);

      console.log("AttachmentManager: Fetching fresh attachments data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateAttachmentsParams(params);

        // Fetch fresh data from API
        const attachmentsData = await this.attachmentAPI.getAttachments(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.attachmentStorage.saveAttachmentsToCache(attachmentsData);

        console.log(
          "AttachmentManager: Attachments data fetched successfully:",
          {
            count: attachmentsData.results ? attachmentsData.results.length : 0,
            totalCount: attachmentsData.count,
          },
        );

        return attachmentsData;
      } finally {
        this.attachmentStorage.setAttachmentsCacheLoading(false);
      }
    } catch (error) {
      this.attachmentStorage.setAttachmentsCacheLoading(false);
      console.error("AttachmentManager: Failed to get attachments", error);
      throw error;
    }
  }

  /**
   * Uploads a new attachment with validation and progress tracking
   * @param {File} file - File object to upload
   * @param {Object} metadata - Additional metadata { entityType, entityId, title, description }
   * @param {Function} onProgressCallback - Called with upload progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
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
      const fileValidationErrors = this._validateFile(file);
      if (Object.keys(fileValidationErrors).length > 0) {
        throw fileValidationErrors;
      }

      // Validate metadata
      const metadataValidationErrors = this._validateUploadMetadata(metadata);
      if (Object.keys(metadataValidationErrors).length > 0) {
        throw metadataValidationErrors;
      }

      console.log("AttachmentManager: Uploading attachment", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        metadata,
      });

      // Call API to upload attachment
      const uploadedAttachmentData = await this.attachmentAPI.uploadAttachment(
        file,
        metadata,
        onProgressCallback,
        onUnauthorizedCallback,
      );

      // Clear attachments cache since new data has been added
      this.attachmentStorage.clearAttachmentsCache();
      this.attachmentStorage.clearStatsCache();

      console.log("AttachmentManager: Attachment uploaded successfully:", {
        id: uploadedAttachmentData.id,
        fileName: uploadedAttachmentData.fileName,
        fileSize: uploadedAttachmentData.fileSize,
      });

      return uploadedAttachmentData;
    } catch (error) {
      console.error("AttachmentManager: Failed to upload attachment", error);
      throw error;
    }
  }

  /**
   * Uploads multiple attachments with validation and progress tracking
   * @param {File[]} files - Array of file objects to upload
   * @param {Object} metadata - Shared metadata for all files
   * @param {Function} onProgressCallback - Called with overall progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object[]>} - Array of created attachment data
   */
  async uploadMultipleAttachments(
    files,
    metadata = {},
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate files array
      if (!Array.isArray(files) || files.length === 0) {
        throw { files: "Valid array of files is required" };
      }

      // Validate each file
      const allValidationErrors = {};
      files.forEach((file, index) => {
        const fileErrors = this._validateFile(file);
        if (Object.keys(fileErrors).length > 0) {
          allValidationErrors[`file_${index}`] = fileErrors;
        }
      });

      if (Object.keys(allValidationErrors).length > 0) {
        throw allValidationErrors;
      }

      // Validate metadata
      const metadataValidationErrors = this._validateUploadMetadata(metadata);
      if (Object.keys(metadataValidationErrors).length > 0) {
        throw metadataValidationErrors;
      }

      console.log("AttachmentManager: Uploading multiple attachments", {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        metadata,
      });

      // Call API to upload multiple attachments
      const uploadedAttachmentsData =
        await this.attachmentAPI.uploadMultipleAttachments(
          files,
          metadata,
          onProgressCallback,
          onUnauthorizedCallback,
        );

      // Clear attachments cache since new data has been added
      this.attachmentStorage.clearAttachmentsCache();
      this.attachmentStorage.clearStatsCache();

      console.log(
        "AttachmentManager: Multiple attachments uploaded successfully:",
        {
          count: uploadedAttachmentsData.length,
        },
      );

      return uploadedAttachmentsData;
    } catch (error) {
      console.error(
        "AttachmentManager: Failed to upload multiple attachments",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Attachment details
   */
  async getAttachmentDetail(attachmentId, onUnauthorizedCallback = null) {
    try {
      // Validate attachment ID
      const validationError = this._validateAttachmentId(attachmentId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `AttachmentManager: Fetching attachment detail for ID ${attachmentId}`,
      );

      // Call API to get attachment details
      const attachmentData = await this.attachmentAPI.getAttachmentDetail(
        attachmentId,
        onUnauthorizedCallback,
      );

      console.log(
        "AttachmentManager: Attachment detail fetched successfully:",
        {
          id: attachmentData.id,
          fileName: attachmentData.fileName,
          fileSize: attachmentData.fileSize,
        },
      );

      return attachmentData;
    } catch (error) {
      console.error(
        "AttachmentManager: Failed to get attachment detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific attachment's metadata
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Object} attachmentData - Attachment metadata to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated attachment data
   */
  async updateAttachment(
    attachmentId,
    attachmentData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate attachment ID
      const attachmentIdError = this._validateAttachmentId(attachmentId);
      if (attachmentIdError) {
        throw attachmentIdError;
      }

      // Validate attachment data
      const validationErrors = this._validateAttachmentMetadata(attachmentData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`AttachmentManager: Updating attachment ID ${attachmentId}`);

      // Call API to update attachment
      const updatedAttachmentData = await this.attachmentAPI.updateAttachment(
        attachmentId,
        attachmentData,
        onUnauthorizedCallback,
      );

      // Clear attachments cache since data has been updated
      this.attachmentStorage.clearAttachmentsCache();

      console.log("AttachmentManager: Attachment updated successfully");

      return updatedAttachmentData;
    } catch (error) {
      console.error("AttachmentManager: Failed to update attachment", error);
      throw error;
    }
  }

  /**
   * Deletes a specific attachment
   * @param {string|number} attachmentId - The ID of the attachment to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteAttachment(attachmentId, onUnauthorizedCallback = null) {
    try {
      // Validate attachment ID
      const validationError = this._validateAttachmentId(attachmentId);
      if (validationError) {
        throw validationError;
      }

      console.log(`AttachmentManager: Deleting attachment ID ${attachmentId}`);

      // Call API to delete attachment
      const deleteResponse = await this.attachmentAPI.deleteAttachment(
        attachmentId,
        onUnauthorizedCallback,
      );

      // Clear caches since data has been updated
      this.attachmentStorage.clearAttachmentsCache();
      this.attachmentStorage.clearStatsCache();

      console.log("AttachmentManager: Attachment deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("AttachmentManager: Failed to delete attachment", error);
      throw error;
    }
  }

  /**
   * Downloads a specific attachment with progress tracking
   * @param {string|number} attachmentId - The ID of the attachment to download
   * @param {Function} onProgressCallback - Called with download progress (0-100)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Blob>} - File blob data
   */
  async downloadAttachment(
    attachmentId,
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate attachment ID
      const validationError = this._validateAttachmentId(attachmentId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `AttachmentManager: Downloading attachment ID ${attachmentId}`,
      );

      // Call API to download attachment
      const fileBlob = await this.attachmentAPI.downloadAttachment(
        attachmentId,
        onProgressCallback,
        onUnauthorizedCallback,
      );

      console.log("AttachmentManager: Attachment downloaded successfully");

      return fileBlob;
    } catch (error) {
      console.error("AttachmentManager: Failed to download attachment", error);
      throw error;
    }
  }

  /**
   * Gets a thumbnail for a specific attachment with caching
   * @param {string|number} attachmentId - The ID of the attachment
   * @param {Object} params - Thumbnail parameters { width, height, quality }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<string>} - Thumbnail URL (blob URL)
   */
  async getAttachmentThumbnail(
    attachmentId,
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Validate attachment ID
      const validationError = this._validateAttachmentId(attachmentId);
      if (validationError) {
        throw validationError;
      }

      // Check cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedThumbnail =
          this.attachmentStorage.getThumbnailFromCache(attachmentId);
        if (cachedThumbnail) {
          return cachedThumbnail;
        }
      }

      console.log(
        `AttachmentManager: Fetching thumbnail for attachment ID ${attachmentId}`,
        params,
      );

      // Call API to get thumbnail
      const thumbnailBlob = await this.attachmentAPI.getAttachmentThumbnail(
        attachmentId,
        params,
        onUnauthorizedCallback,
      );

      // Create blob URL for the thumbnail
      const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

      // Cache the thumbnail URL
      this.attachmentStorage.saveThumbnailToCache(attachmentId, thumbnailUrl);

      console.log("AttachmentManager: Thumbnail fetched successfully");

      return thumbnailUrl;
    } catch (error) {
      console.error("AttachmentManager: Failed to get thumbnail", error);
      throw error;
    }
  }

  /**
   * Gets attachment statistics with caching
   * @param {Object} params - Query parameters { entityType, entityId, startDate, endDate }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Attachment statistics
   */
  async getAttachmentStats(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedStats = this.attachmentStorage.getStatsFromCache();
        if (cachedStats) {
          return cachedStats;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.attachmentStorage.isStatsCacheLoading()) {
        console.log("AttachmentManager: Stats request already in progress");
        return this._waitForCurrentStatsRequest();
      }

      this.attachmentStorage.setStatsCacheLoading(true);

      console.log("AttachmentManager: Fetching fresh stats data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateStatsParams(params);

        // Fetch fresh data from API
        const statsData = await this.attachmentAPI.getAttachmentStats(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.attachmentStorage.saveStatsToCache(statsData);

        console.log("AttachmentManager: Stats data fetched successfully");

        return statsData;
      } finally {
        this.attachmentStorage.setStatsCacheLoading(false);
      }
    } catch (error) {
      this.attachmentStorage.setStatsCacheLoading(false);
      console.error("AttachmentManager: Failed to get stats", error);
      throw error;
    }
  }

  /**
   * Triggers a file download in the browser
   * @param {Blob} fileBlob - The file blob to download
   * @param {string} fileName - The name for the downloaded file
   */
  triggerFileDownload(fileBlob, fileName) {
    try {
      // Create a URL for the blob
      const url = URL.createObjectURL(fileBlob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      URL.revokeObjectURL(url);

      console.log(`AttachmentManager: File download triggered for ${fileName}`);
    } catch (error) {
      console.error(
        "AttachmentManager: Failed to trigger file download",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets attachment preferences
   * @returns {Object|null} - Attachment preferences or null
   */
  getAttachmentPreferences() {
    return this.attachmentStorage.getAttachmentPreferences();
  }

  /**
   * Saves attachment preferences
   * @param {Object} preferences - Preferences object
   */
  saveAttachmentPreferences(preferences) {
    this.attachmentStorage.saveAttachmentPreferences(preferences);
  }

  /**
   * Clears the attachments cache
   */
  clearAttachmentsCache() {
    this.attachmentStorage.clearAttachmentsCache();
  }

  /**
   * Clears the stats cache
   */
  clearStatsCache() {
    this.attachmentStorage.clearStatsCache();
  }

  /**
   * Clears the thumbnails cache
   */
  clearThumbnailsCache() {
    this.attachmentStorage.clearThumbnailsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.attachmentStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getAttachmentsCacheInfo() {
    return this.attachmentStorage.getAttachmentsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setAttachmentsCacheDuration(durationMs) {
    this.attachmentStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets stats cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setStatsCacheDuration(durationMs) {
    this.attachmentStorage.setStatsCacheDuration(durationMs);
  }

  /**
   * Sets thumbnails cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setThumbnailsCacheDuration(durationMs) {
    this.attachmentStorage.setThumbnailsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getAttachmentsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAttachments(params, onUnauthorizedCallback, forceRefresh)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  uploadAttachmentWithCallbacks(
    file,
    metadata = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    this.uploadAttachment(
      file,
      metadata,
      onProgressCallback,
      onUnauthorizedCallback,
    )
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  getAttachmentDetailWithCallbacks(
    attachmentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getAttachmentDetail(attachmentId, onUnauthorizedCallback)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  updateAttachmentWithCallbacks(
    attachmentId,
    attachmentData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateAttachment(attachmentId, attachmentData, onUnauthorizedCallback)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  deleteAttachmentWithCallbacks(
    attachmentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteAttachment(attachmentId, onUnauthorizedCallback)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  downloadAttachmentWithCallbacks(
    attachmentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onProgressCallback = null,
    onUnauthorizedCallback = null,
  ) {
    this.downloadAttachment(
      attachmentId,
      onProgressCallback,
      onUnauthorizedCallback,
    )
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  getAttachmentStatsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAttachmentStats(params, onUnauthorizedCallback, forceRefresh)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Private validation methods
   */

  _validateAttachmentId(attachmentId) {
    if (
      !attachmentId ||
      (typeof attachmentId !== "string" && typeof attachmentId !== "number")
    ) {
      return { attachmentId: "Valid attachment ID is required" };
    }
    return null;
  }

  _validateFile(file) {
    const errors = {};

    if (!file || !(file instanceof File)) {
      errors.file = "Valid file is required";
      return errors;
    }

    // Check file size
    const preferences = this.getAttachmentPreferences();
    const maxFileSize = preferences?.maxFileSize || this.defaultMaxFileSize;

    if (file.size > maxFileSize) {
      errors.fileSize = `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file type
    const allowedTypes =
      preferences?.allowedFileTypes || this.defaultAllowedTypes;

    if (!allowedTypes.includes(file.type)) {
      errors.fileType = "File type not allowed";
    }

    return errors;
  }

  _validateUploadMetadata(metadata) {
    const errors = {};

    if (metadata.title && metadata.title.length > 255) {
      errors.title = "Title must be less than 255 characters";
    }

    if (metadata.description && metadata.description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }

    if (metadata.entityType && typeof metadata.entityType !== "string") {
      errors.entityType = "Entity type must be a string";
    }

    if (
      metadata.entityId &&
      typeof metadata.entityId !== "string" &&
      typeof metadata.entityId !== "number"
    ) {
      errors.entityId = "Entity ID must be a string or number";
    }

    // ADD THIS: Validate order_wjid
    if (
      metadata.orderWjid &&
      typeof metadata.orderWjid !== "string" &&
      typeof metadata.orderWjid !== "number"
    ) {
      errors.orderWjid = "Order WJID must be a string or number";
    }

    return errors;
  }

  _validateAttachmentMetadata(attachmentData) {
    const errors = {};

    if (!attachmentData || typeof attachmentData !== "object") {
      errors.general = "Attachment data is required";
      return errors;
    }

    // Validate title (optional)
    if (attachmentData.title && attachmentData.title.length > 255) {
      errors.title = "Title must be less than 255 characters";
    }

    // Validate description (optional)
    if (
      attachmentData.description &&
      attachmentData.description.length > 1000
    ) {
      errors.description = "Description must be less than 1000 characters";
    }

    return errors;
  }

  _validateAttachmentsParams(params) {
    const validatedParams = {};

    // Validate pagination
    if (params.page && typeof params.page === "number" && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (
      params.limit &&
      typeof params.limit === "number" &&
      params.limit > 0 &&
      params.limit <= 1000
    ) {
      validatedParams.limit = params.limit;
    }

    // Validate search
    if (
      params.search &&
      typeof params.search === "string" &&
      params.search.trim()
    ) {
      validatedParams.search = params.search.trim();
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = [
        "file_name",
        "file_size",
        "file_type",
        "created_at",
        "updated_at",
        "title",
      ];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "DESC"; // Default to newest first
        }
      }
    }

    // Validate entity filters
    if (params.entityType && typeof params.entityType === "string") {
      validatedParams.entityType = params.entityType;
    }

    if (
      params.entityId &&
      (typeof params.entityId === "string" ||
        typeof params.entityId === "number")
    ) {
      validatedParams.entityId = params.entityId;
    }

    // ADD THIS: Validate order_wjid parameter
    if (
      params.orderWjid &&
      (typeof params.orderWjid === "string" ||
        typeof params.orderWjid === "number")
    ) {
      validatedParams.orderWjid = params.orderWjid;
    }

    // Validate file type filter
    if (params.fileType && typeof params.fileType === "string") {
      validatedParams.fileType = params.fileType;
    }

    return validatedParams;
  }

  _validateStatsParams(params) {
    const validatedParams = {};

    // Validate entity filters
    if (params.entityType && typeof params.entityType === "string") {
      validatedParams.entityType = params.entityType;
    }

    if (
      params.entityId &&
      (typeof params.entityId === "string" ||
        typeof params.entityId === "number")
    ) {
      validatedParams.entityId = params.entityId;
    }

    // Validate date filters
    if (params.startDate && typeof params.startDate === "string") {
      validatedParams.startDate = params.startDate;
    }

    if (params.endDate && typeof params.endDate === "string") {
      validatedParams.endDate = params.endDate;
    }

    return validatedParams;
  }

  /**
   * Waits for current attachments request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentAttachmentsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.attachmentStorage.isAttachmentsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.attachmentStorage.getAttachmentsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Attachments request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Attachments request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current stats request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentStatsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.attachmentStorage.isStatsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.attachmentStorage.getStatsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Stats request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Stats request timeout"));
      }, 30000);
    });
  }
}
