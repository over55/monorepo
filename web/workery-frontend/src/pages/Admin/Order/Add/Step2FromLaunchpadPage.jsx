// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step2FromLaunchpadPage.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";

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

  // Show loading state while initializing
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isInitialized
            ? "Redirecting to order creation..."
            : "Initializing order creation..."}
        </p>
      </div>
    </div>
  );
}

export default AdminOrderAddStep2FromLaunchpadPage;
