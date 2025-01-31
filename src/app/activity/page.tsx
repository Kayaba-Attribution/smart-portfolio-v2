"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ActivityPage() {
  return (
    <div className="container p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Transaction history coming soon
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            AI insights coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 