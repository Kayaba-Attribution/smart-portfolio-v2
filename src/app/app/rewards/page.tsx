"use client";

import { PageWrapper } from "@/components/PageWrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import PointsDisplay from "@/components/PointsDisplay";
import { useAccount } from "@/contexts/AccountContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Award } from "lucide-react";

// Define TypeScript interface for transaction data
interface PointTransaction {
  id: string;
  actionName: string;
  actionDescription: string;
  points: number;
  timestamp: number;
  txHash?: string;
  chainId?: number;
}

// Define the type for raw transaction data from the database
interface RawTransaction {
  id: string;
  points: number;
  timestamp: number;
  txHash?: string;
  chainId?: number;
  action?: {
    name?: string;
    description?: string;
  };
}

export default function RewardsPage() {
  const { accountAddress } = useAccount();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  // Query for the user's points transactions
  const { data: transactionsData, isLoading } = db.useQuery(
    accountAddress
      ? {
          // Get user profile
          userProfiles: {
            $: { where: { walletAddress: accountAddress } },
            // Get all transactions for this user
            pointsTransactions: {
              action: {}, // Include the linked action
            },
          },
        }
      : null
  );

  useEffect(() => {
    if (!isLoading && transactionsData) {
      // Extract transactions from the nested data structure
      const userProfile = transactionsData?.userProfiles?.[0];

      if (userProfile?.pointsTransactions) {
        // Format transactions for display
        const formattedTransactions = userProfile.pointsTransactions.map(
          (tx: RawTransaction) => ({
            id: tx.id,
            actionName: tx.action?.name || "Unknown Action",
            actionDescription: tx.action?.description || "Unknown",
            points: tx.points,
            timestamp: tx.timestamp,
            txHash: tx.txHash,
            chainId: tx.chainId,
          })
        );

        // Sort by timestamp, newest first
        formattedTransactions.sort(
          (a: PointTransaction, b: PointTransaction) =>
            b.timestamp - a.timestamp
        );

        setTransactions(formattedTransactions);
      }

      setLoading(false);
    }
  }, [transactionsData, isLoading]);

  // Function to format transaction time
  const formatTime = (timestamp: number) => {
    try {
      // Simple time formatting without date-fns dependency
      const date = new Date(timestamp);
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        "day"
      );
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Points Overview Card */}
        <PointsDisplay />

        {/* Transactions History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Points History
            </CardTitle>
            <CardDescription>
              Track your points earned from various actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                Loading your points history...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No points transactions found. Complete actions to earn points!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium">{tx.actionName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-sm text-muted-foreground">
                              {tx.actionDescription}
                            </div>
                            {tx.txHash && (
                              <a
                                href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                              >
                                <span className="mr-1">tx</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className="text-green-600 dark:text-green-400">
                            +{tx.points}
                          </span>
                        </TableCell>
                        <TableCell>{formatTime(tx.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
