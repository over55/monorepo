// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/ChangePassword/Page.jsx
// UIX Upgraded - Uses ChangePasswordPage whole page component
// @uix-page: ChangePasswordPage

import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ChangePasswordPage, Badge } from "../../../../../../components/UIX";
import { ASSOCIATE_STATUS_ACTIVE, ASSOCIATE_STATUS_ARCHIVED } from "../../../../../../constants/Associate";
import axios from "axios";

function AdminAssociateDetailMoreChangePasswordPage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();

  // Build breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
      { label: "Detail", to: `/admin/associate/${aid}`, icon: ClipboardDocumentListIcon },
      { label: "More", to: `/admin/associate/${aid}/more`, icon: Cog6ToothIcon },
      { label: "Change Password", icon: KeyIcon, isActive: true },
    ],
    [aid],
  );

  // Check if authenticated
  const isAuthenticated = useCallback(() => {
    return authManager.isAuthenticated();
  }, [authManager]);

  // Handle unauthorized
  const onUnauthorized = useCallback(() => {
    window.location.href = "/login?unauthorized=true";
  }, []);

  // Fetch associate details
  const onFetchEntity = useCallback(
    async (entityId, onUnauthorizedCb, forceRefresh) => {
      try {
        const data = await associateManager.getAssociateDetail(entityId, onUnauthorizedCb);
        return data;
      } catch (error) {
        console.error("Failed to fetch associate:", error);
        throw error;
      }
    },
    [associateManager],
  );

  // Handle password change
  const onChangePassword = useCallback(
    async (passwordData, onUnauthorizedCb) => {
      // Get access token
      let accessToken =
        localStorage.getItem("WORKERY_ACCESS_TOKEN") ||
        localStorage.getItem("WORKERY_TENANT_ACCESS_TOKEN") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      if (!accessToken) {
        const tokenKey = Object.keys(localStorage).find(
          (key) =>
            key.toLowerCase().includes("token") &&
            !key.toLowerCase().includes("refresh") &&
            !key.toLowerCase().includes("timestamp"),
        );
        if (tokenKey) {
          accessToken = localStorage.getItem(tokenKey);
        }
      }

      if (!accessToken) {
        throw new Error("No access token found. Please login again.");
      }

      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000"
          : window.location.origin;

      const endpoint = "/api/v1/associates/operations/change-password";
      const fullUrl = `${apiBaseUrl}${endpoint}`;

      const requestData = {
        associate_id: aid,
        password: passwordData.password,
        password_repeated: passwordData.password_repeated,
      };

      try {
        await axios.post(fullUrl, requestData, {
          headers: {
            Authorization: `JWT ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      } catch (error) {
        console.error("Password change failed:", error);

        let errorMessage = "An unknown error occurred";

        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "API endpoint not found. Please contact support.";
          } else if (error.response.status === 401) {
            errorMessage = "Unauthorized. Please login again.";
            setTimeout(() => onUnauthorizedCb(), 2000);
          } else if (error.response.status === 403) {
            errorMessage = "You don't have permission to change this password.";
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }
    },
    [aid],
  );

  // Get entity name for display
  const getEntityName = useCallback((associate) => {
    return `${associate.firstName} ${associate.lastName}`;
  }, []);

  // Get badges for display
  const getBadges = useCallback((associate) => {
    return (
      <>
        {associate.status === ASSOCIATE_STATUS_ACTIVE && (
          <Badge variant="success" size="sm">Active</Badge>
        )}
        {associate.status === ASSOCIATE_STATUS_ARCHIVED && (
          <Badge variant="warning" size="sm">Archived</Badge>
        )}
      </>
    );
  }, []);

  return (
    <ChangePasswordPage
      entityId={aid}
      onFetchEntity={onFetchEntity}
      onChangePassword={onChangePassword}
      onUnauthorized={onUnauthorized}
      isAuthenticated={isAuthenticated}
      breadcrumbItems={breadcrumbItems}
      backUrl={`/admin/associate/${aid}/more`}
      successRedirectUrl={`/admin/associate/${aid}/more`}
      pageTitle="Change Associate Password"
      getEntityName={getEntityName}
      getBadges={getBadges}
      minPasswordLength={8}
    />
  );
}

export default AdminAssociateDetailMoreChangePasswordPage;
