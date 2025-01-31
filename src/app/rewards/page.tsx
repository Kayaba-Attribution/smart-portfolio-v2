"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RewardsPage() {
  return (
    <div className="container p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Referral system coming soon
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staking Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Staking interface coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 