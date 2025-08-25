// File Path: web/workery-frontend/src/services/Manager/HowHearAboutUsItemManager.js

/**
 * Manager service for How Hear About Us Item operations
 * Combines API and Storage functionality with business logic
 * Supports cursor-based pagination
 */
export class HowHearAboutUsItemManager {
  constructor(api, storage) {
    this.api = api;
    this.storage = storage;
  }

  /**
   * Get list of How Hear About Us Items with caching and cursor-based pagination
   */
  async getList(params = {}, onUnauthorized = null, forceRefresh = false) {
    try {
      // Normalize parameters for cursor-based pagination
      const normalizedParams = {
        cursor: params.cursor || "",
        pageSize: params.pageSize || 25,
        sortField: params.sortField || "sort_number",
        sortOrder: params.sortOrder || 1,
        status: params.status,
        search: params.search || params.searchText || "",
      };

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = this.storage.getList(normalizedParams);
        if (cachedData) {
          console.log(
            "Manager: Returning cached data for cursor:",
            normalizedParams.cursor,
          );
          return cachedData;
        }
      }

      console.log("Manager: Fetching from API with params:", normalizedParams);

      // Fetch from API
      const data = await this.api.getList(normalizedParams, onUnauthorized);

      // Cache the result
      this.storage.setList(normalizedParams, data);

      console.log("Manager: Data fetched and cached:", {
        resultsCount: data.results?.length,
        hasNextPage: data.hasNextPage,
        nextCursor: data.nextCursor,
      });

      return data;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.getList error:", error);
      throw error;
    }
  }

  /**
   * Get How Hear About Us Item detail with caching
   */
  async getDetail(id, onUnauthorized = null, forceRefresh = false) {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = this.storage.getDetail(id);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch from API
      const data = await this.api.getDetail(id, onUnauthorized);

      // Cache the result
      this.storage.setDetail(id, data);

      return data;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.getDetail error:", error);
      throw error;
    }
  }

  /**
   * Create new How Hear About Us Item
   */
  async create(data, onUnauthorized = null) {
    try {
      // Validate required fields
      this._validateItemData(data);

      // Create via API
      const result = await this.api.create(data, onUnauthorized);

      // Update cache
      this.storage.addItem(result);

      return result;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.create error:", error);
      throw error;
    }
  }

  /**
   * Update How Hear About Us Item
   */
  async update(id, data, onUnauthorized = null) {
    try {
      // Validate required fields
      this._validateItemData(data);

      // Update via API
      const result = await this.api.update(id, data, onUnauthorized);

      // Update cache
      this.storage.updateItem(id, result);

      return result;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.update error:", error);
      throw error;
    }
  }

  /**
   * Delete How Hear About Us Item
   */
  async delete(id, onUnauthorized = null) {
    try {
      // Delete via API
      const result = await this.api.delete(id, onUnauthorized);

      // Remove from cache
      this.storage.removeItem(id);

      return result;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.delete error:", error);
      throw error;
    }
  }

  /**
   * Get select options for dropdowns with caching
   */
  async getSelectOptions(onUnauthorized = null, forceRefresh = false) {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = this.storage.getSelectOptions();
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch from API
      const data = await this.api.getSelectOptions(onUnauthorized);

      // Cache the result
      this.storage.setSelectOptions(data);

      return data;
    } catch (error) {
      console.error("HowHearAboutUsItemManager.getSelectOptions error:", error);
      throw error;
    }
  }

  /**
   * Search How Hear About Us Items with cursor-based pagination
   */
  async search(searchQuery, additionalParams = {}, onUnauthorized = null) {
    try {
      const params = {
        search: searchQuery,
        cursor: additionalParams.cursor || "",
        pageSize: additionalParams.pageSize || 25,
        sortField: additionalParams.sortField || "sort_number",
        sortOrder: additionalParams.sortOrder || 1,
        ...additionalParams,
      };

      return await this.getList(params, onUnauthorized, true); // Force refresh for search
    } catch (error) {
      console.error("HowHearAboutUsItemManager.search error:", error);
      throw error;
    }
  }

  /**
   * Get filtered items by role with cursor-based pagination
   */
  async getByRole(role, params = {}, onUnauthorized = null) {
    try {
      const roleParams = {
        ...params,
        [`isFor${role}`]: true,
      };

      return await this.getList(roleParams, onUnauthorized);
    } catch (error) {
      console.error("HowHearAboutUsItemManager.getByRole error:", error);
      throw error;
    }
  }

  /**
   * Navigate to next page using cursor
   */
  async getNextPage(currentCursor, params = {}, onUnauthorized = null) {
    try {
      const nextParams = {
        ...params,
        cursor: currentCursor,
      };

      return await this.getList(nextParams, onUnauthorized, false);
    } catch (error) {
      console.error("HowHearAboutUsItemManager.getNextPage error:", error);
      throw error;
    }
  }

  /**
   * Store cursor history for navigation
   */
  storeCursorHistory(key, cursors) {
    this.storage.setCursorHistory(key, cursors);
  }

  /**
   * Get cursor history for navigation
   */
  getCursorHistory(key) {
    return this.storage.getCursorHistory(key) || [];
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.storage.invalidateAll();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.storage.getCacheStats();
  }

  /**
   * Validate item data before create/update
   * @private
   */
  _validateItemData(data) {
    const errors = {};

    // Required fields validation
    if (!data.text || data.text.trim() === "") {
      errors.text = "Text is required";
    }

    if (typeof data.sortNumber !== "number" || data.sortNumber < 0) {
      errors.sortNumber = "Sort number must be a positive number";
    }

    // Role validation - at least one role must be selected
    if (!data.isForAssociate && !data.isForCustomer && !data.isForStaff) {
      errors.roles = "At least one role must be selected";
    }

    // Text length validation
    if (data.text && data.text.length > 255) {
      errors.text = "Text must be less than 255 characters";
    }

    if (Object.keys(errors).length > 0) {
      const error = new Error("Validation failed");
      error.validationErrors = errors;
      throw error;
    }
  }

  /**
   * Utility method to prepare data for forms
   */
  prepareFormData(item = null) {
    return {
      sortNumber: item?.sortNumber || 0,
      text: item?.text || "",
      isForAssociate: item?.isForAssociate || false,
      isForCustomer: item?.isForCustomer || false,
      isForStaff: item?.isForStaff || false,
    };
  }

  /**
   * Get default sort options with proper backend format
   */
  getDefaultSortOptions() {
    return [
      { value: "sort_number,1", label: "Sort Number (Low to High)" },
      { value: "sort_number,-1", label: "Sort Number (High to Low)" },
      { value: "text,1", label: "Text (A to Z)" },
      { value: "text,-1", label: "Text (Z to A)" },
      { value: "created_at,1", label: "Created Date (Oldest First)" },
      { value: "created_at,-1", label: "Created Date (Newest First)" },
    ];
  }

  /**
   * Get status filter options
   */
  getStatusFilterOptions() {
    return [
      { value: "", label: "All Statuses" },
      { value: "1", label: "Active" },
      { value: "2", label: "Archived" },
    ];
  }

  /**
   * Get role filter options
   */
  getRoleFilterOptions() {
    return [
      { value: "", label: "All Roles" },
      { value: "associate", label: "Associate" },
      { value: "customer", label: "Customer" },
      { value: "staff", label: "Staff" },
    ];
  }
}
