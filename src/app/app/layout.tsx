"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DebugInfo } from "@/components/DebugInfo";
import { AnimatePresence } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
      <DebugInfo />
    </div>
  );
}
