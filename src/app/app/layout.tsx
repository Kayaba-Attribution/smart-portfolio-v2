"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DebugInfo } from "@/components/DebugInfo";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { PushNotificationService } from "@/components/PushNotificationService";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Add data attribute to html element for app routes
  useEffect(() => {
    document.documentElement.setAttribute("data-app-route", "true");

    return () => {
      document.documentElement.removeAttribute("data-app-route");
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
      }}
    >
      <Header />
      <main className="h-[100dvh] pt-16 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </main>
      <BottomNav />
      {/* <DebugInfo /> */}

      {/* Background services - no UI */}
      <PushNotificationService />
    </div>
  );
}
