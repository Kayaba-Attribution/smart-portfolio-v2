import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

export function TokenBalanceDisplay() {
  const { balances, tokens, isLoading } = useTokenBalances();

  // Calculate total portfolio value
  const totalValue = Object.entries(balances).reduce((acc, [symbol, balance]) => {
    const dummyPrice = symbol === 'USDC' ? 1 : symbol === 'WBTC' ? 40000 : 2000;
    return acc + (parseFloat(balance) * dummyPrice);
  }, 0);

  return (
    <div className="space-y-3">
      {Object.entries(tokens).map(([symbol, token]) => {
        const balance = balances[symbol] || "0";
        const dummyPrice = symbol === 'USDC' ? 1 : symbol === 'WBTC' ? 40000 : 2000;
        const value = parseFloat(balance) * dummyPrice;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <Card key={symbol} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    {token.icon ? (
                      <Image
                        src={token.icon}
                        alt={token.name}
                        fill
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {symbol[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{symbol}</span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </>
                  ) : (
                    <>
                      <span className="font-medium">
                        ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{parseFloat(balance).toFixed(4)}</span>
                        <span>·</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 