"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RewardsPage() {
  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Rewards system coming soon
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
} 