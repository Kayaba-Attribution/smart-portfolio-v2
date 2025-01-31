import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Asset</th>
                <th scope="col" className="px-4 py-3 text-right">Balance</th>
                <th scope="col" className="px-4 py-3 text-right">Value</th>
                <th scope="col" className="px-4 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20">
              {Object.entries(tokens).map(([symbol, token]) => {
                const balance = balances[symbol] || "0";
                const dummyPrice = symbol === 'USDC' ? 1 : symbol === 'WBTC' ? 40000 : 2000;
                const value = parseFloat(balance) * dummyPrice;
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

                return (
                  <tr key={symbol} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
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
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20 ml-auto" />
                      ) : (
                        <span>{parseFloat(balance).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLoading ? (
                        <Skeleton className="h-4 w-24 ml-auto" />
                      ) : (
                        <span>
                          ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLoading ? (
                        <Skeleton className="h-4 w-12 ml-auto" />
                      ) : (
                        <span>{percentage.toFixed(1)}%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 