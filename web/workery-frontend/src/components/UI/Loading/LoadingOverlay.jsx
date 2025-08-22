// File: src/components/UI/Loading/LoadingOverlay.jsx

import React from "react";
import Spinner from "./Spinner";

/**
 * LoadingOverlay Component
 * Full-screen loading overlay
 *
 * @param {boolean} isLoading - Whether to show the overlay
 * @param {string} message - Loading message
 */
function LoadingOverlay({ isLoading, message = "Loading..." }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
