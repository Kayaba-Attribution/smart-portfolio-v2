"use client";

import { useAccount } from "@/contexts/AccountContext";
import { db, getUserQuery } from "@/lib/db";
import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function PointsDisplay() {
  const { accountAddress } = useAccount();
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Only run the query if we have an account address
  const { data, isLoading, error } = db.useQuery(
    accountAddress ? getUserQuery(accountAddress) : null
  );

  useEffect(() => {
    console.log("PointsDisplay data:", {
      data,
      isLoading,
      error,
      accountAddress,
    });

    // When data loads, update the points display
    if (data && data.userProfiles && data.userProfiles.length > 0) {
      console.log(
        "Found user profile with points:",
        data.userProfiles[0].totalPoints
      );
      setPoints(data.userProfiles[0].totalPoints || 0);
      setLoading(false);
    } else if (!isLoading && accountAddress) {
      // If data is loaded, we have an address, but no user profile found
      console.log("No user profile found for address:", accountAddress);
      setPoints(0);
      setLoading(false);
    } else if (!accountAddress) {
      // No account address available
      console.log("No account address available");
      setPoints(0);
      setLoading(false);
    }
  }, [data, isLoading, error, accountAddress]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading points:", error);
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-red-500">Error loading points</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Award className="h-4 w-4 mr-1" />
          Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{points || 0}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Earned through actions & referrals
        </p>
      </CardContent>
    </Card>
  );
}
