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
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <ArrowLeftRight className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              You discovered a new feature!
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Coming soon: swap any live assets in your wallet with our powerful
              DEX aggregator
            </p>

            <div className="border border-dashed border-primary/50 rounded-lg bg-muted/30 p-8 w-full max-w-lg">
              <div className="text-center text-muted-foreground">
                Swap interface under development
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
