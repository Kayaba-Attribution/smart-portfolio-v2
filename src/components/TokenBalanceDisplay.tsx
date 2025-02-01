"use client";

import { useState } from "react";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export function TokenBalanceDisplay() {
  const { tokens, getSortedTokenBalances } = useTokenBalances();
  const [showAll, setShowAll] = useState(false);

  const sortedBalances = getSortedTokenBalances();
  const displayBalances = showAll ? sortedBalances : sortedBalances.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBalances.map(({ symbol, balance, value }) => (
            <div
              key={symbol}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  {tokens[symbol].icon ? (
                    <Image
                      src={tokens[symbol].icon}
                      alt={symbol}
                      fill
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {symbol[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{tokens[symbol].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {parseFloat(balance).toFixed(4)} {symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}

          {sortedBalances.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  See All ({sortedBalances.length - 5} more){" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 