"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { CreatePortfolio } from "./components/CreatePortfolio";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, PieChart } from "lucide-react";

export default function TradePage() {
  const [mode, setMode] = useState<"portfolio" | "swap">("portfolio");

  return (
    <PageWrapper>
      {/* Navigation */}
      <div className="w-full border-b">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex w-full">
            <Button
              variant="ghost"
              className={`flex-1 flex items-center justify-center gap-2 py-6 rounded-none relative ${
                mode === "portfolio" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setMode("portfolio")}
            >
              <PieChart className="h-5 w-5" />
              Create Portfolio
              {mode === "portfolio" && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 flex items-center justify-center gap-2 py-6 rounded-none relative ${
                mode === "swap" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setMode("swap")}
            >
              <ArrowLeftRight className="h-5 w-5" />
              Swap Tokens
              {mode === "swap" && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto p-6">
        {mode === "portfolio" ? (
          <CreatePortfolio />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Swap interface coming soon
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
