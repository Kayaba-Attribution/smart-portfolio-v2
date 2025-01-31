import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

export function TokenBalanceDisplay() {
  const { balances, tokens, isLoading } = useTokenBalances();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(tokens).map(([symbol, token]) => (
            <div
              key={symbol}
              className="flex items-center p-4 space-x-3 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="relative w-8 h-8">
                {token.icon ? (
                  <Image
                    src={token.icon}
                    alt={token.name}
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {symbol[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{symbol}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {parseFloat(balances[symbol] || "0").toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 