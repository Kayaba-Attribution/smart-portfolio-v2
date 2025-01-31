"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ActivityPage() {
  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Activity feed coming soon
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
} 