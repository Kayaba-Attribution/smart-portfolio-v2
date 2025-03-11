"use client";

import { useEffect, useState } from "react";
import { ensureActionsExist } from "@/lib/pointsActions";

/**
 * Component that initializes the points system
 * Mount this once in your app
 */
export function PointsInitializer() {
  // Track initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Skip if already initialized in this session
    if (isInitialized) return;

    // Set a flag in sessionStorage to prevent multiple initializations
    const hasInitialized = sessionStorage.getItem("points_system_initialized");
    if (hasInitialized === "true") {
      setIsInitialized(true);
      return;
    }

    // Initialize points system
    const initializePoints = async () => {
      try {
        await ensureActionsExist();
        console.log("Points system initialized successfully");
        sessionStorage.setItem("points_system_initialized", "true");
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing points system:", error);
        // Try again on next app load
        sessionStorage.removeItem("points_system_initialized");
      }
    };

    initializePoints();
  }, [isInitialized]);

  // This component doesn't render anything
  return null;
}
