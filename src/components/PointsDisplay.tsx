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
  const { data, isLoading } = db.useQuery(
    accountAddress ? getUserQuery(accountAddress) : null
  );

  useEffect(() => {
    // When data loads, update the points display
    if (data && data.userProfiles && data.userProfiles.length > 0) {
      setPoints(data.userProfiles[0].totalPoints || 0);
      setLoading(false);
    } else if (!isLoading) {
      // If data is loaded but no user exists
      setPoints(0);
      setLoading(false);
    }
  }, [data, isLoading]);

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
