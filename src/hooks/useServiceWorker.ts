"use client";

import { useEffect } from "react";

export const useServiceWorker = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
      } catch (error) {
        console.error("SW registration failed", error);
      }
    };

    register();
  }, []);
};
