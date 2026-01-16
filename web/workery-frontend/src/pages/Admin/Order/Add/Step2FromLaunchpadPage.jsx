// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step2FromLaunchpadPage.jsx
// UIX Upgraded - Transitional loading page for order creation from launchpad
// @uix-page: OrderInitializationPage

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

function AdminOrderAddStep2FromLaunchpadPage() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  // URL Parameters
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");

  // Component states
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeLaunchpad = async () => {
      if (!mounted) return;

      // Check authentication first
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Validate that we have the required parameters
      if (!customerId) {
        console.error("Step2FromLaunchpadPage: Missing customer ID parameter");
        // Redirect to step 1 if no customer ID provided
        navigate("/admin/orders/add/step-1-search");
        return;
      }

      console.log("Step2FromLaunchpadPage: Initializing order creation", {
        customerId,
        firstName,
        lastName,
      });

      // Clear any existing order creation state to start fresh
      orderCreationStorage.clearOrderCreation();

      // Initialize the order creation state with the customer information
      const initialOrderState = {
        customerId: customerId,
        customerFirstName: firstName || "",
        customerLastName: lastName || "",
        startDate: null,
        isOngoing: null,
        isHomeSupportService: null,
        description: "",
        skillSets: [],
        additionalComment: "",
        tags: [],
      };

      // Save the initial state
      orderCreationStorage.saveOrderCreation(initialOrderState);

      console.log(
        "Step2FromLaunchpadPage: Order state initialized, redirecting to step 2",
      );

      // Mark as initialized
      setIsInitialized(true);

      // Navigate to step 2
      navigate("/admin/orders/add/step-2");
    };

    initializeLaunchpad();

    return () => {
      mounted = false;
    };
  }, [
    customerId,
    firstName,
    lastName,
    authManager,
    navigate,
    orderCreationStorage,
  ]);

  // Show enhanced loading state while initializing
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="relative">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-blue-600 animate-pulse mb-4" />
          </div>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-700 font-medium text-lg">
          {isInitialized
            ? "Redirecting to order creation..."
            : "Initializing order creation..."}
        </p>
        <p className="mt-2 text-gray-500 text-sm">
          Setting up order for {firstName} {lastName}
        </p>
        <div className="mt-6 flex justify-center space-x-1">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderAddStep2FromLaunchpadPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderAddStep2FromLaunchpadPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep2FromLaunchpadPageWithProvider;
