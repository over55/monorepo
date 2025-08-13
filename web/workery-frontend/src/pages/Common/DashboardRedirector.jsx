// File Path: web/workery-frontend/src/pages/Common/DashboardRedirector.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";

/**
 * DashboardRedirector Component
 *
 * This component handles redirecting users to their appropriate dashboard
 * based on their role when they navigate to the generic /dashboard path.
 */
function DashboardRedirector() {
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "DashboardRedirector: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      try {
        // Get user profile to determine role
        const currentUser = await accountManager.getAccountDetail();

        if (currentUser) {
          // Get dashboard path based on role
          const getDashboardPath = () => {
            const userRole = currentUser.role || currentUser.roleId;

            if (
              [
                EXECUTIVE_ROLE_ID,
                MANAGEMENT_ROLE_ID,
                FRONTLINE_ROLE_ID,
              ].includes(userRole)
            ) {
              return "/admin/dashboard";
            } else if (userRole === CUSTOMER_ROLE_ID) {
              return "/c/dashboard";
            } else if (userRole === ASSOCIATE_ROLE_ID) {
              return "/a/dashboard";
            } else if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
              return "/js/dashboard";
            }
            return "/admin/dashboard";
          };

          const redirectPath = getDashboardPath();
          console.log(
            `DashboardRedirector: Redirecting to ${redirectPath} for role ${currentUser.role || currentUser.roleId}`,
          );
          navigate(redirectPath);
        } else {
          console.error("DashboardRedirector: No user profile found");
          navigate("/login");
        }
      } catch (error) {
        console.error("DashboardRedirector: Error getting profile", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    redirectToDashboard();
  }, [authManager, accountManager, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h3>Redirecting to your dashboard...</h3>
        <p>Please wait...</p>
      </div>
    </div>
  );
}

export default DashboardRedirector;
