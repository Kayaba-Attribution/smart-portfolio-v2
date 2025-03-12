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
import { ExternalLink, Award, Trophy, Medal, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Define user profile for leaderboard
interface LeaderboardUser {
  id: string;
  username: string;
  walletAddress: string;
  totalPoints: number;
}

// Raw user profile from database
interface RawUserProfile {
  id: string;
  username?: string;
  walletAddress?: string;
  totalPoints?: number;
}

export default function RewardsPage() {
  const { accountAddress } = useAccount();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

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

  // Query for leaderboard data - all users
  const { data: leaderboardData, isLoading: isLeaderboardLoading } =
    db.useQuery({
      userProfiles: {}, // Empty object fetches all user profiles
    });

  // Process leaderboard data
  useEffect(() => {
    console.log("Leaderboard data:", leaderboardData);
    console.log("Leaderboard loading:", isLeaderboardLoading);

    if (!isLeaderboardLoading && leaderboardData?.userProfiles) {
      try {
        // Create a copy to sort (since we can't rely on the query sorting)
        const sortedUsers = [...leaderboardData.userProfiles]
          // Only show users with points
          .filter(
            (user: RawUserProfile) => user.totalPoints && user.totalPoints > 0
          )
          // Sort by points (descending)
          .sort(
            (a: RawUserProfile, b: RawUserProfile) =>
              (b.totalPoints || 0) - (a.totalPoints || 0)
          )
          // Limit to top 10
          .slice(0, 10);

        console.log("Processed leaderboard users:", sortedUsers.length);

        // Map to our display format
        const users = sortedUsers.map((user: RawUserProfile) => ({
          id: user.id,
          username: user.username || `user_${user.walletAddress?.slice(0, 6)}`,
          walletAddress: user.walletAddress || "",
          totalPoints: user.totalPoints || 0,
        }));

        setLeaderboard(users);
      } catch (error) {
        console.error("Error processing leaderboard data:", error);
        // Even on error, set an empty leaderboard to show the empty state
        setLeaderboard([]);
      } finally {
        // Always set loading to false to avoid infinite loading state
        setLeaderboardLoading(false);
      }
    }
  }, [leaderboardData, isLeaderboardLoading]);

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

  // Helper to shorten wallet address
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper to get rank icon/badge
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Trophy className="h-5 w-5 text-yellow-500" aria-label="1st Place" />
        );
      case 1:
        return (
          <Medal className="h-5 w-5 text-gray-400" aria-label="2nd Place" />
        );
      case 2:
        return (
          <Medal className="h-5 w-5 text-amber-700" aria-label="3rd Place" />
        );
      default:
        return (
          <span className="text-muted-foreground font-mono w-5 text-center">
            {index + 1}
          </span>
        );
    }
  };

  // Check if current user is on leaderboard
  const isCurrentUserOnLeaderboard = leaderboard.some(
    (user) => user.walletAddress === accountAddress
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Points Overview Card */}
        <PointsDisplay />

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Points Leaderboard
            </CardTitle>
            <CardDescription>
              Top users ranked by total points earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found yet. Be the first to earn points!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className={
                          user.walletAddress === accountAddress
                            ? "bg-muted/50"
                            : undefined
                        }
                      >
                        <TableCell className="text-center">
                          {getRankIcon(index)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {shortenAddress(user.walletAddress)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {user.totalPoints.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!isCurrentUserOnLeaderboard && accountAddress && (
                  <div className="text-sm text-muted-foreground text-center mt-4">
                    Keep earning points to climb onto the leaderboard!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Coming Soon: Referrals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Share2 className="mr-2 h-4 w-4" />
              Coming Soon: Referral Program
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  Referral Bonus
                </div>
                <div className="text-xl font-bold text-primary">+500</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  Friend Bonus
                </div>
                <div className="text-xl font-bold text-primary">+250</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  Max Referrals
                </div>
                <div className="text-xl font-bold text-primary">10</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Email verification required to participate in the referral
                  program
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled
                className="flex-shrink-0 h-7 text-xs px-2"
              >
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
