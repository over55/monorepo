// File Path: web/workery-frontend/src/hooks/useInactivityTimeout.js

import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";

/**
 * Custom hook to detect user inactivity and perform auto-logout
 * @param {number} timeout - Inactivity timeout in milliseconds (default: 15 minutes)
 * @param {boolean} enabled - Whether the inactivity timeout is enabled (default: true)
 */
export function useInactivityTimeout(timeout = 15 * 60 * 1000, enabled = true) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const isEnabledRef = useRef(enabled);

  // Update enabled ref when prop changes
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    // Only reset timer if enabled
    if (!isEnabledRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log("User inactivity timeout reached - redirecting to logout");
      navigate("/logout");
    }, timeout);
  }, [navigate, timeout]);

  // Setup event listeners for user activity
  useEffect(() => {
    // Don't setup listeners if not enabled
    if (!enabled) {
      return;
    }

    // List of events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initialize the timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, resetTimer]);

  // Return cleanup function that can be called manually if needed
  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
}
